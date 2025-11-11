import { NextRequest, NextResponse } from "next/server";
import { v4 } from "uuid";
import { supabase } from "@/lib/supabase-client";
import https from "https";

interface SubscriptionRequest {
  payment_id: string;
  status: "Paid" | "Cancelled";
}

interface PortonePaymentResponse {
  paymentId: string;
  billingKey?: string;
  orderName?: string;
  amount?: {
    total: number;
  };
  customer?: {
    id: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: SubscriptionRequest = await request.json();

    // 요청 데이터 검증
    if (!body.payment_id || !body.status) {
      return NextResponse.json(
        { success: false, error: "필수 필드가 누락되었습니다." },
        { status: 400 }
      );
    }

    // Portone API Secret 확인
    const portoneApiSecret = process.env.PORTONE_API_SECRET;
    if (!portoneApiSecret) {
      return NextResponse.json(
        { success: false, error: "Portone API Secret이 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    // 공통: Portone 결제 정보 조회 (Paid, Cancelled 모두 사용)
    const paymentResponse = await fetch(
      `https://api.portone.io/payments/${encodeURIComponent(body.payment_id)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `PortOne ${portoneApiSecret}`,
        },
      }
    );

    if (!paymentResponse.ok) {
      const errorData = await paymentResponse.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          error: errorData.message || "결제 정보 조회에 실패했습니다.",
        },
        { status: paymentResponse.status }
      );
    }

    const paymentData: PortonePaymentResponse = await paymentResponse.json();

    // Cancelled 시나리오 처리
    if (body.status === "Cancelled") {
      // 3-1-2) supabase에서 기존 결제 레코드 조회
      const { data: prevPayments, error: prevSelectError } = await supabase
        .from("payment")
        .select("*")
        .eq("transaction_key", paymentData.paymentId)
        .order("start_at", { ascending: false })
        .limit(1);

      if (prevSelectError) {
        console.error("Supabase select 오류:", prevSelectError);
        return NextResponse.json(
          { success: false, error: "기존 결제 정보 조회에 실패했습니다." },
          { status: 500 }
        );
      }

      const prev = Array.isArray(prevPayments) && prevPayments.length > 0 ? prevPayments[0] : null;
      if (!prev) {
        return NextResponse.json(
          { success: false, error: "취소할 기존 결제 정보를 찾을 수 없습니다." },
          { status: 404 }
        );
      }

      // 3-1-2-1) 이미 취소 레코드가 있는지 확인 (중복 방지)
      const { data: existingCancel, error: checkCancelError } = await supabase
        .from("payment")
        .select("id")
        .eq("transaction_key", prev.transaction_key)
        .eq("status", "Cancel")
        .limit(1);

      if (checkCancelError) {
        console.error("Supabase 취소 레코드 확인 오류:", checkCancelError);
      }

      const hasCancelRecord = existingCancel && existingCancel.length > 0;

      // 3-1-3) 취소 레코드 삽입 (amount 음수, status: 'Cancel')
      // 중복 방지: 취소 레코드가 없을 때만 삽입
      if (!hasCancelRecord) {
        const { error: cancelInsertError } = await supabase.from("payment").insert({
          transaction_key: prev.transaction_key,
          amount: -Math.abs(prev.amount ?? 0),
          status: "Cancel",
          start_at: prev.start_at,
          end_at: prev.end_at,
          end_grace_at: prev.end_grace_at,
          next_schedule_at: prev.next_schedule_at,
          next_schedule_id: prev.next_schedule_id,
        });

        if (cancelInsertError) {
          // 중복 키 오류인 경우 이미 취소된 것으로 처리
          if (cancelInsertError.code === "23505" || cancelInsertError.message?.includes("duplicate")) {
            console.log("취소 레코드가 이미 존재합니다.");
            // 성공으로 처리하고 계속 진행
          } else {
            console.error("Supabase insert(취소) 오류:", cancelInsertError);
            return NextResponse.json(
              { success: false, error: "취소 내역 저장에 실패했습니다." },
              { status: 500 }
            );
          }
        }
      } else {
        console.log("이미 취소 레코드가 존재합니다.");
      }

      // 3-2-1) 예약된 결제정보 조회 (GET with body가 필요하여 https.request 사용)
      const fromDate = new Date(prev.next_schedule_at);
      fromDate.setDate(fromDate.getDate() - 1);
      const untilDate = new Date(prev.next_schedule_at);
      untilDate.setDate(untilDate.getDate() + 1);

      // Helper: GET with body using https.request
      const httpsGetWithBody = <T,>(url: string, bodyObj: unknown, headers: Record<string, string>): Promise<T> => {
        return new Promise((resolve, reject) => {
          const urlObj = new URL(url);
          const requestBody = JSON.stringify(bodyObj ?? {});
          const requestOptions: https.RequestOptions = {
            method: "GET",
            hostname: urlObj.hostname,
            path: urlObj.pathname + urlObj.search,
            protocol: urlObj.protocol,
            port: urlObj.port || (urlObj.protocol === "https:" ? 443 : 80),
            headers: {
              "Content-Type": "application/json",
              "Content-Length": Buffer.byteLength(requestBody).toString(),
              ...headers,
            },
          };

          const req = https.request(requestOptions, (res) => {
            let data = "";
            res.on("data", (chunk) => {
              data += chunk;
            });
            res.on("end", () => {
              try {
                const parsed = data ? JSON.parse(data) : {};
                if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                  resolve(parsed as T);
                } else {
                  reject(
                    new Error(
                      (parsed && parsed.message) || `HTTP ${res.statusCode} 오류`
                    )
                  );
                }
              } catch (e) {
                reject(e);
              }
            });
          });

          req.on("error", (err) => reject(err));
          req.write(requestBody);
          req.end();
        });
      };

      interface PaymentSchedulesQuery {
        filter: {
          billingKey: string;
          from: string;
          until: string;
        };
      }

      interface PaymentScheduleItem {
        id: string; // schedule 객체 id
        paymentId?: string;
      }
      interface PaymentSchedulesResponse {
        items?: PaymentScheduleItem[];
      }

      const schedulesRequestBody: PaymentSchedulesQuery = {
        filter: {
          billingKey: paymentData.billingKey ?? "",
          from: fromDate.toISOString(),
          until: untilDate.toISOString(),
        },
      };

      let schedules: PaymentSchedulesResponse;
      try {
        schedules = await httpsGetWithBody<PaymentSchedulesResponse>(
          "https://api.portone.io/payment-schedules",
          schedulesRequestBody,
          {
            Authorization: `PortOne ${portoneApiSecret}`,
          }
        );
      } catch (e: any) {
        console.error("예약 결제정보 조회 오류:", e);
        return NextResponse.json(
          { success: false, error: e?.message || "예약 결제정보 조회 실패" },
          { status: 500 }
        );
      }

      // 3-2-2) items 순회하여 schedule id 추출 (조건: items.paymentId === 조회결과.next_schedule_id)
      const targetScheduleIds =
        schedules.items
          ?.filter((item) => item.paymentId === prev.next_schedule_id)
          .map((item) => item.id) ?? [];

      if (!targetScheduleIds.length) {
        // 예약이 없으면 취소할 것이 없음
        return NextResponse.json({ success: true });
      }

      // 3-2-3) 포트원에 다음달 구독예약 취소 (DELETE with body)
      const deleteResponse = await fetch("https://api.portone.io/payment-schedules", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `PortOne ${portoneApiSecret}`,
        },
        body: JSON.stringify({
          scheduleIds: targetScheduleIds,
        }),
      });

      if (!deleteResponse.ok) {
        const deleteError = await deleteResponse.json().catch(() => ({}));
        return NextResponse.json(
          {
            success: false,
            error: deleteError.message || "구독 예약 취소에 실패했습니다.",
          },
          { status: deleteResponse.status }
        );
      }

      return NextResponse.json({ success: true });
    }

    // 이하 Paid 시나리오 처리
    // 2-1) paymentId의 결제정보를 조회
    // 결제 정보 검증
    if (
      !paymentData.billingKey ||
      !paymentData.orderName ||
      !paymentData.amount?.total ||
      !paymentData.customer?.id
    ) {
      return NextResponse.json(
        { success: false, error: "결제 정보가 불완전합니다." },
        { status: 400 }
      );
    }

    // 현재 시각
    const now = new Date();
    const nowISO = now.toISOString();

    // end_at: 현재시각 + 30일
    const endAt = new Date(now);
    endAt.setDate(endAt.getDate() + 30);
    const endAtISO = endAt.toISOString();

    // end_grace_at: 현재시각 + 31일
    const endGraceAt = new Date(now);
    endGraceAt.setDate(endGraceAt.getDate() + 31);
    const endGraceAtISO = endGraceAt.toISOString();

    // next_schedule_at: end_at + 1일 오전 10시~11시 사이 임의 시각
    const nextScheduleBase = new Date(endAt);
    nextScheduleBase.setDate(nextScheduleBase.getDate() + 1);
    nextScheduleBase.setHours(10, 0, 0, 0); // 오전 10시
    // 10시~11시 사이 임의 시각 (0~60분 랜덤)
    const randomMinutes = Math.floor(Math.random() * 60);
    nextScheduleBase.setMinutes(randomMinutes);
    const nextScheduleAtISO = nextScheduleBase.toISOString();

    // next_schedule_id: UUID 생성 (동기화되는 값)
    const nextScheduleId = v4();

    // 2-1) supabase의 payment 테이블에 등록
    const { error: insertError } = await supabase.from("payment").insert({
      transaction_key: paymentData.paymentId,
      amount: paymentData.amount.total,
      status: "Paid",
      start_at: nowISO,
      end_at: endAtISO,
      end_grace_at: endGraceAtISO,
      next_schedule_at: nextScheduleAtISO,
      next_schedule_id: nextScheduleId,
    });

    if (insertError) {
      console.error("Supabase insert 오류:", insertError);
      return NextResponse.json(
        { success: false, error: "결제 정보 저장에 실패했습니다." },
        { status: 500 }
      );
    }

    // 3-1) 포트원에 다음달 구독결제 예약
    const scheduleResponse = await fetch(
      `https://api.portone.io/payments/${encodeURIComponent(nextScheduleId)}/schedule`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `PortOne ${portoneApiSecret}`,
        },
        body: JSON.stringify({
          payment: {
            billingKey: paymentData.billingKey,
            orderName: paymentData.orderName,
            customer: {
              id: paymentData.customer.id,
            },
            amount: {
              total: paymentData.amount.total,
            },
            currency: "KRW",
          },
          timeToPay: nextScheduleAtISO,
        }),
      }
    );

    if (!scheduleResponse.ok) {
      const errorData = await scheduleResponse.json().catch(() => ({}));
      console.error("구독 예약 오류:", errorData);
      // 구독 예약 실패해도 결제는 완료되었으므로 성공으로 처리
      // 또는 실패로 처리할 수도 있음 (요구사항에 명시되지 않음)
      return NextResponse.json(
        {
          success: false,
          error: errorData.message || "구독 예약에 실패했습니다.",
        },
        { status: scheduleResponse.status }
      );
    }

    // 성공 응답 반환
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("구독 결제 API 오류:", error);
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

