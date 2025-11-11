import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-client";

interface CancelRequestBody {
	transactionKey?: string;
}

interface PortonePaymentResponse {
	paymentId: string;
	amount?: {
		total: number;
	};
}

export async function POST(request: NextRequest) {
	try {
		const body: CancelRequestBody = await request.json().catch(() => ({}));

		if (!body?.transactionKey) {
			return NextResponse.json(
				{ success: false, error: "transactionKey가 필요합니다." },
				{ status: 400 }
			);
		}

		const portoneApiSecret = process.env.PORTONE_API_SECRET;
		if (!portoneApiSecret) {
			return NextResponse.json(
				{ success: false, error: "Portone API Secret이 설정되지 않았습니다." },
				{ status: 500 }
			);
		}

		// 1. Supabase에서 기존 결제 레코드 조회 (취소되지 않은 최신 레코드)
		// transactionKey는 Supabase의 transaction_key와 동일 (포트원의 paymentId)
		// created_at 기준으로 최신 레코드를 가져오되, status가 "Cancel"이 아닌 것만 조회
		const { data: prevPayments, error: prevSelectError } = await supabase
			.from("payment")
			.select("*")
			.eq("transaction_key", body.transactionKey)
			.neq("status", "Cancel")
			.order("created_at", { ascending: false })
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
				{ success: false, error: "취소할 활성 구독 정보를 찾을 수 없습니다. 이미 취소되었거나 존재하지 않는 구독입니다." },
				{ status: 404 }
			);
		}

		// 이미 취소된 구독인지 확인 (status가 "Paid"가 아니거나 기간이 만료된 경우)
		const now = new Date();
		const startAt = new Date(prev.start_at);
		const endGraceAt = new Date(prev.end_grace_at);
		const isActive = prev.status === "Paid" && 
			startAt.getTime() <= now.getTime() && 
			now.getTime() <= endGraceAt.getTime();

		if (!isActive) {
			return NextResponse.json(
				{ success: false, error: "이미 취소되었거나 만료된 구독입니다." },
				{ status: 400 }
			);
		}

		// 3. 이미 취소 레코드가 있는지 확인 (중복 방지)
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

		// 이미 취소 레코드가 있으면 중복 취소 방지
		if (hasCancelRecord) {
			return NextResponse.json(
				{ success: true, message: "이미 취소된 구독입니다." },
				{ status: 200 }
			);
		}

		// 4. 포트원에 취소 요청 (transactionKey는 포트원의 paymentId)
		const cancelResponse = await fetch(
			`https://api.portone.io/payments/${encodeURIComponent(body.transactionKey)}/cancel`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `PortOne ${portoneApiSecret}`,
				},
				body: JSON.stringify({
					reason: "구독 취소",
				}),
			}
		);

		const cancelResponseData = await cancelResponse.json().catch(() => ({} as any));
		const isAlreadyCancelled = !cancelResponse.ok && 
			(cancelResponseData?.message?.toLowerCase().includes("already") || 
			 cancelResponseData?.message?.toLowerCase().includes("cancelled"));

		// 5. 취소 레코드 삽입 전에 다시 한 번 확인 (race condition 방지)
		const { data: doubleCheckCancel, error: doubleCheckError } = await supabase
			.from("payment")
			.select("id")
			.eq("transaction_key", prev.transaction_key)
			.eq("status", "Cancel")
			.limit(1);

		if (doubleCheckError) {
			console.error("Supabase 중복 확인 오류:", doubleCheckError);
		}

		const hasCancelRecordNow = doubleCheckCancel && doubleCheckCancel.length > 0;

		// 중복 방지: 취소 레코드가 없을 때만 삽입
		if (!hasCancelRecordNow) {
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
					return NextResponse.json(
						{ success: true, message: "이미 취소된 구독입니다." },
						{ status: 200 }
					);
				}
				console.error("Supabase insert(취소) 오류:", cancelInsertError);
				return NextResponse.json(
					{ success: false, error: "취소 내역 저장에 실패했습니다." },
					{ status: 500 }
				);
			}
		} else {
			// 다른 요청에서 이미 취소 레코드를 생성한 경우
			console.log("다른 요청에서 이미 취소 레코드를 생성했습니다.");
		}

		// 이미 취소된 경우 성공으로 처리 (Supabase는 업데이트됨)
		if (isAlreadyCancelled) {
			return NextResponse.json({ success: true, message: "이미 취소된 결제입니다. 상태를 업데이트했습니다." });
		}

		// 취소 실패한 경우 (이미 취소된 경우 제외)
		if (!cancelResponse.ok) {
			return NextResponse.json(
				{ success: false, error: cancelResponseData?.message || "결제 취소에 실패했습니다." },
				{ status: cancelResponse.status }
			);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("결제 취소 API 오류:", error);
		return NextResponse.json(
			{ success: false, error: "서버 오류가 발생했습니다." },
			{ status: 500 }
		);
	}
}


