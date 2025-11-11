"use client";

import React from "react";
import { usePaymentSubscription } from "@/app/payments/hooks/index.payment.hook";
import { usePaymentStatus } from "@/app/mypage/hooks/index.payment.status.hook";
import { usePaymentCancel } from "@/app/mypage/hooks/index.payment.cancel.hook";
import { useModal } from "@/commons/providers/modal/modal.provider";
import styles from "./styles.module.css";

export default function SubscriptionStatus() {
  const { isProcessing, subscribe } = usePaymentSubscription();
  const { statusMessage, canCancel, canSubscribe, transactionKeyForCancel, isLoading: isStatusLoading } = usePaymentStatus();
  const { cancel, isProcessing: isCancelProcessing } = usePaymentCancel();
  const { openModal, closeModal } = useModal();

  const handleSubscribe = async () => {
    try {
      await subscribe("구독 결제", 10000);
    } catch (error) {
      console.error("구독하기 처리 중 오류:", error);
    }
  };

  const handleCancelSubscription = () => {
    if (!transactionKeyForCancel) {
      alert("취소할 구독 정보를 찾을 수 없습니다.");
      return;
    }
    cancel(transactionKeyForCancel);
  };

  const openCancelConfirm = () => {
    if (!transactionKeyForCancel) {
      alert("취소할 구독 정보를 찾을 수 없습니다.");
      return;
    }

    try {
      openModal(
        <div role="dialog" aria-modal="true" style={{ background: "#1b1b1b", border: "1px solid rgba(199,167,74,0.2)", borderRadius: 12, padding: 16, color: "#eee", minWidth: 280 }}>
          <h4 style={{ margin: 0, marginBottom: 8, fontSize: 16 }}>구독을 취소하시겠습니까?</h4>
          <p style={{ margin: 0, marginBottom: 12, fontSize: 13, color: "#aaa" }}>확인을 누르면 즉시 결제가 취소됩니다.</p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button type="button" onClick={closeModal} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(199,167,74,0.25)", background: "transparent", color: "#ddd", cursor: "pointer" }}>닫기</button>
            <button
              type="button"
              onClick={() => {
                handleCancelSubscription();
                closeModal();
              }}
              disabled={isCancelProcessing}
              style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(199,167,74,0.4)", background: "rgba(199,167,74,0.15)", color: "#c7a74a", cursor: "pointer", fontWeight: 700 }}
            >
              확인
            </button>
          </div>
        </div>
      );
    } catch {
      const ok = typeof window !== "undefined" ? window.confirm("구독을 취소하시겠습니까?") : false;
      if (ok) {
        handleCancelSubscription();
      }
    }
  };

  return (
    <section className={styles.subscriptionSection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>구독 상태</h2>
        <p className={styles.sectionSubtitle}>현재 구독 상태를 확인하세요</p>
      </div>

      <div className={styles.subscriptionContainer}>
        <div className={styles.statusCard}>
          <div className={styles.statusContent}>
            <div className={styles.statusLeft}>
              <h3 className={styles.statusTitle}>구독 상태</h3>
              <p className={styles.statusDescription}>
                {statusMessage === "구독중"
                  ? "프리미엄 구독 서비스를 이용 중입니다"
                  : "무료 플랜을 이용 중입니다"}
              </p>
            </div>
            <div className={styles.statusRight}>
              <span
                className={`${styles.statusBadge} ${
                  statusMessage === "구독중" ? styles.subscribed : styles.free
                }`}
              >
                {statusMessage}
              </span>
            </div>
          </div>
          {statusMessage === "구독중" && canCancel ? (
            <div className={styles.buttonContainer}>
              <button 
                className={styles.cancelButton} 
                type="button" 
                onClick={openCancelConfirm}
                disabled={isCancelProcessing || isStatusLoading}
              >
                {isCancelProcessing ? "처리 중..." : "구독 취소"}
              </button>
            </div>
          ) : canSubscribe ? (
            <div className={styles.buttonContainer}>
              <button
                className={styles.subscribeButton}
                onClick={handleSubscribe}
                disabled={isProcessing || isStatusLoading}
                type="button"
              >
                {isProcessing ? "처리 중..." : "구독하기"}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
