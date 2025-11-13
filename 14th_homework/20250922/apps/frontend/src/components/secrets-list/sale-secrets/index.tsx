"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Secret } from "../types";
import { usePaymentSubscription } from "@/app/payments/hooks/index.payment.hook";
import styles from "./styles.module.css";

interface SaleSecretsProps {
  secrets: Secret[];
}

export default function SaleSecrets({ secrets }: SaleSecretsProps) {
  const { isProcessing, subscribe } = usePaymentSubscription();

  const formatPrice = (price: number) => {
    return `₩${price.toLocaleString()}`;
  };

  const handleSubscribe = async () => {
    console.log("구독하기 버튼 클릭됨");
    try {
      await subscribe("구독 결제", 10000);
    } catch (error) {
      console.error("구독하기 처리 중 오류:", error);
    }
  };

  return (
    <section className={styles.saleSecretsSection}>
      <div className={styles.sectionHeader}>
        <button 
          className={styles.subscribeButton}
          onClick={handleSubscribe}
          disabled={isProcessing}
          type="button"
        >
          {isProcessing ? "처리 중..." : "구독하기"}
        </button>
        <div className={styles.headerContent}>
          <span className={styles.timerIcon}>⏰</span>
          <h2 className={styles.sectionTitle}>막판 할인 이벤트</h2>
        </div>
        <p className={styles.sectionSubtitle}>이 비밀은 곧 사라집니다.</p>
      </div>

      <div className={styles.secretsGrid}>
        {secrets.map((secret) => (
          <Link key={secret.id} href={`/secrets/${secret.id}`} className={styles.secretCard}>
            <div className={styles.imageWrapper}>
              <Image
                src={secret.img}
                alt={secret.title}
                fill
                className={styles.image}
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div className={styles.overlay}>
                <div className={styles.timeBadge}>
                  <span className={styles.timeIcon}>⏰</span>
                  <span className={styles.timeText}>{secret.saleEnds}</span>
                </div>
              </div>
            </div>
            <div className={styles.cardContent}>
              <h3 className={styles.title}>{secret.title}</h3>
              <p className={styles.desc}>{secret.desc}</p>
              <div className={styles.priceContainer}>
                <span className={styles.price}>{formatPrice(secret.price)}</span>
              </div>
              <div className={styles.hoverText}>🔍 비밀의 조각 보기</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

