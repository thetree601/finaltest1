"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Secret } from "@/components/secrets-list/types";
import { mySoldSecrets, myBoughtSecrets } from "./mockData";
import styles from "./styles.module.css";

export default function MySecrets() {
  const [activeTab, setActiveTab] = useState<"sold" | "bought">("sold");

  const formatPrice = (price: number) => {
    return `₩${price.toLocaleString()}`;
  };

  const currentSecrets = activeTab === "sold" ? mySoldSecrets : myBoughtSecrets;

  return (
    <section className={styles.mySecretsSection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>나의 비밀</h2>
        <p className={styles.sectionSubtitle}>판매 및 구매한 비밀 상품 목록</p>
      </div>

      <div className={styles.tabContainer}>
        <button
          className={`${styles.tab} ${activeTab === "sold" ? styles.active : ""}`}
          onClick={() => setActiveTab("sold")}
        >
          판매 목록
        </button>
        <button
          className={`${styles.tab} ${activeTab === "bought" ? styles.active : ""}`}
          onClick={() => setActiveTab("bought")}
        >
          구매 목록
        </button>
      </div>

      <div className={styles.secretsGrid}>
        {currentSecrets.length > 0 ? (
          currentSecrets.map((secret) => (
            <div key={secret.id} className={styles.secretCard}>
              <div className={styles.imageWrapper}>
                <Image
                  src={secret.img}
                  alt={secret.title}
                  fill
                  unoptimized
                  className={styles.image}
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className={styles.overlay}>
                  <div className={styles.blurOverlay} />
                </div>
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.title}>{secret.title}</h3>
                <p className={styles.desc}>{secret.desc}</p>
                <div className={styles.priceContainer}>
                  <span className={styles.price}>{formatPrice(secret.price)}</span>
                </div>
                {activeTab === "sold" && (
                  <div className={styles.statusBadge}>판매 완료</div>
                )}
                {activeTab === "bought" && (
                  <div className={styles.statusBadge}>구매 완료</div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>
              {activeTab === "sold" ? "판매한 비밀이 없습니다." : "구매한 비밀이 없습니다."}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

