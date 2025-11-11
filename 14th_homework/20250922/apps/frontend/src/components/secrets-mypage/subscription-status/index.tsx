"use client";

import React, { useEffect, useState } from "react";
import { usePaymentSubscription } from "@/app/payments/hooks/index.payment.hook";
import styles from "./styles.module.css";

interface SubscriptionStatusProps {
  isSubscribed?: boolean;
}

export default function SubscriptionStatus({ isSubscribed = false }: SubscriptionStatusProps) {
  const { isProcessing, subscribe } = usePaymentSubscription();
  const [subscribed, setSubscribed] = useState<boolean>(isSubscribed);

  // 로컬 저장소 기반 임시 구독상태 동기화
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem("isSubscribed");
      if (saved === "true") setSubscribed(true);
    } catch {
      // ignore
    }
    const onStorage = (e: StorageEvent) => {
      if (e.key === "isSubscribed") {
        setSubscribed(e.newValue === "true");
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleSubscribe = async () => {
    try {
      await subscribe("구독 결제", 10000);
    } catch (error) {
      console.error("구독하기 처리 중 오류:", error);
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
                {subscribed
                  ? "프리미엄 구독 서비스를 이용 중입니다"
                  : "무료 플랜을 이용 중입니다"}
              </p>
            </div>
            <div className={styles.statusRight}>
              <span
                className={`${styles.statusBadge} ${
                  subscribed ? styles.subscribed : styles.free
                }`}
              >
                {subscribed ? "구독중" : "free"}
              </span>
            </div>
          </div>
          {subscribed ? (
            <div className={styles.buttonContainer}>
              <button className={styles.cancelButton} type="button">
                구독 취소
              </button>
            </div>
          ) : (
            <div className={styles.buttonContainer}>
              <button
                className={styles.subscribeButton}
                onClick={handleSubscribe}
                disabled={isProcessing}
                type="button"
              >
                {isProcessing ? "처리 중..." : "구독하기"}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

