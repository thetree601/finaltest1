"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CancelPaymentRequest {
  transactionKey: string;
}

interface CancelPaymentResponse {
  success: boolean;
  error?: string;
}

async function cancelPayment(request: CancelPaymentRequest): Promise<CancelPaymentResponse> {
  const response = await fetch("/api/payments/cancel", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      transactionKey: request.transactionKey,
    }),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || "구독 취소에 실패했습니다.");
  }

  return result;
}

export function usePaymentCancel() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: cancelPayment,
    onSuccess: async () => {
      // payment-status 쿼리를 invalidate하고 즉시 refetch하여 최신 상태 반영
      await queryClient.invalidateQueries({ queryKey: ["payment-status"] });
      // 쿼리 캐시를 완전히 제거하고 다시 조회
      queryClient.removeQueries({ queryKey: ["payment-status"] });
      // refetch를 강제로 실행하여 최신 상태 가져오기
      await queryClient.refetchQueries({ queryKey: ["payment-status"] });
      alert("구독이 취소되었습니다.");
      // 상태가 업데이트된 후 페이지 이동
      router.push("/secrets");
    },
    onError: (error: Error) => {
      alert(error.message || "구독 취소 중 오류가 발생했습니다.");
    },
  });

  return {
    cancel: (transactionKey: string) => {
      mutation.mutate({ transactionKey });
    },
    isProcessing: mutation.isPending,
  };
}

