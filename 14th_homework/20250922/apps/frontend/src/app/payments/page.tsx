"use client";

import React from "react";
import { usePaymentSubscription } from "./hooks/index.payment.hook";

export default function PaymentsPage() {
  const { isProcessing, subscribe } = usePaymentSubscription();

  const handleSubscribe = async () => {
    await subscribe("구독 결제", 10000);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "20px" }}>구독 결제</h1>
      <p style={{ marginBottom: "20px" }}>
        구독하기 버튼을 클릭하여 빌링키를 발급받고 구독을 시작하세요.
      </p>
      <button
        onClick={handleSubscribe}
        disabled={isProcessing}
        style={{
          padding: "12px 24px",
          fontSize: "16px",
          backgroundColor: isProcessing ? "#ccc" : "#0070f3",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: isProcessing ? "not-allowed" : "pointer",
        }}
      >
        {isProcessing ? "처리 중..." : "구독하기"}
      </button>
    </div>
  );
}


