"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client";
// @ts-ignore - 포트원 SDK 타입 정의 문제로 임시 처리
import * as PortOne from "@portone/browser-sdk/v2";
import { v4 } from "uuid";
import { authManager } from "@/lib/auth";
import { FETCH_USER_LOGGED_IN } from "@/commons/layout/navigation/queries";

export function usePaymentSubscription() {
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  // 토큰을 먼저 초기화하여 첫 렌더에서도 로그인 여부를 정확히 판별
  authManager.initializeToken();
  const isLoggedInNow = authManager.isLoggedIn();

  // 로그인한 사용자 정보 조회
  const { data, refetch } = useQuery(FETCH_USER_LOGGED_IN, {
    skip: !isLoggedInNow,
    errorPolicy: "ignore",
  });

  let user = data?.fetchUserLoggedIn;

  const subscribe = async (orderName: string, amount: number) => {
    // 로그인 상태 재확인
    const isLoggedIn = authManager.isLoggedIn();

    if (!isLoggedIn) {
      alert("로그인이 필요합니다. 먼저 로그인해주세요.");
      return;
    }

    // 사용자 정보가 아직 로드되지 않은 경우 재조회
    if (!user?._id) {
      try {
        const refreshed = await refetch();
        user = refreshed.data?.fetchUserLoggedIn;
      } catch {
        // noop
      }
      if (!user?._id) {
        alert("사용자 정보를 불러올 수 없습니다. 다시 시도해주세요.");
        return;
      }
    }

    setIsProcessing(true);

    try {
      // 환경 변수 확인
      const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;
      const channelKey = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY;

      if (!storeId || !channelKey) {
        alert("포트원 설정이 완료되지 않았습니다. 관리자에게 문의하세요.");
        setIsProcessing(false);
        return;
      }

      // customerId를 ASCII 문자만 포함하도록 변환 (토스페이먼츠 요구사항)
      // UUID에서 하이픈 제거하거나, 안전한 형식으로 변환
      const safeCustomerId = user._id
        .replace(/[^a-zA-Z0-9_-]/g, '') // ASCII 문자만 허용
        .substring(0, 50); // 길이 제한 (필요시 조정)

      if (!safeCustomerId) {
        alert("고객 ID 형식이 올바르지 않습니다.");
        setIsProcessing(false);
        return;
      }

      // 1-1) 포트원 빌링키 발급 화면 노출
      const issueId = `issue-${v4()}`;
      
      const billingKeyResponse = await PortOne.requestIssueBillingKey({
        storeId: storeId,
        channelKey: channelKey,
        billingKeyMethod: "CARD", // 토스페이먼츠는 카드 결제 지원
        issueId: issueId,
        issueName: orderName,
        customer: {
          customerId: safeCustomerId, // 변환된 customerId 사용
        },
        redirectUrl: typeof window !== "undefined" ? window.location.href : undefined,
      });

      // 빌링키 발급 실패 처리
      if (!billingKeyResponse || billingKeyResponse.code !== undefined) {
        alert(billingKeyResponse?.message || "빌링키 발급에 실패했습니다.");
        setIsProcessing(false);
        return;
      }

      // 빌링키 발급 성공
      if (!billingKeyResponse.billingKey) {
        alert("빌링키를 받아오지 못했습니다.");
        setIsProcessing(false);
        return;
      }

      // 1-2) 빌링키 발급 완료 후 결제 API 요청
      const paymentResponse = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          billingKey: billingKeyResponse.billingKey,
          orderName: orderName,
          amount: amount,
          customer: {
            id: user._id,
          },
        }),
      });

      const paymentResult = await paymentResponse.json();

      if (!paymentResponse.ok || !paymentResult.success) {
        alert(paymentResult.error || "결제에 실패했습니다.");
        setIsProcessing(false);
        return;
      }

      // 1-3) 구독결제 성공 이후 로직
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem("isSubscribed", "true");
          // 취소를 위해 서버에서 전달한 transactionKey(txId 또는 paymentId fallback)를 저장
          if (paymentResult?.transactionKey) {
            localStorage.setItem("lastTransactionKey", String(paymentResult.transactionKey));
          } else if (paymentResult?.txId) {
            localStorage.setItem("lastTransactionKey", String(paymentResult.txId));
          } else if (paymentResult?.paymentId) {
            localStorage.setItem("lastTransactionKey", String(paymentResult.paymentId));
          }
          window.dispatchEvent(new StorageEvent("storage", { key: "isSubscribed", newValue: "true" }));
        }
      } catch {
        // localStorage 접근 실패는 무시
      }
      alert("구독에 성공하였습니다.");
      router.push("/secrets");
    } catch (error) {
      console.error("구독 결제 오류:", error);
      alert("구독 결제 중 오류가 발생했습니다.");
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    subscribe,
  };
}
