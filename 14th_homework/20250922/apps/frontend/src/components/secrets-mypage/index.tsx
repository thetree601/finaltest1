"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MySecrets from "./my-secrets";
import SubscriptionStatus from "./subscription-status";
import PointHistory from "./point-history";
import styles from "./styles.module.css";

export default function SecretsMyPage() {
  const pathname = usePathname();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.navigation}>
          <Link 
            href="/secrets" 
            className={`${styles.navLink} ${pathname === "/secrets" ? styles.active : ""}`}
          >
            비밀 게시판
          </Link>
          <Link 
            href="/secrets/mypage" 
            className={`${styles.navLink} ${pathname === "/secrets/mypage" ? styles.active : ""}`}
          >
            마이 페이지
          </Link>
        </div>
        <h1 className={styles.mainTitle}>마이 페이지</h1>
        <p className={styles.mainSubtitle}>
          나의 비밀 거래 내역과 포인트 사용내역을 확인하세요.
        </p>
      </div>

      <MySecrets />
      <SubscriptionStatus isSubscribed />
      <PointHistory />
    </div>
  );
}

