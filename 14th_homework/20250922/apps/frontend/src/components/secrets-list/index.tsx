"use client";

import React from "react";
import HotSecrets from "./hot-secrets";
import SaleSecrets from "./sale-secrets";
import RecommendedSecrets from "./recommended-secrets";
import { hotSecrets, saleSecrets, recommendedSecrets } from "./mockData";
import styles from "./styles.module.css";

export default function SecretsListPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.mainTitle}>who&apos;s Secret</h1>
        <p className={styles.mainSubtitle}>
          누구나 알고 싶지만, 아무도 말하지 않는 이야기들.
        </p>
      </div>

      <HotSecrets secrets={hotSecrets} />
      <SaleSecrets secrets={saleSecrets} />
      <RecommendedSecrets secrets={recommendedSecrets} />
    </div>
  );
}

