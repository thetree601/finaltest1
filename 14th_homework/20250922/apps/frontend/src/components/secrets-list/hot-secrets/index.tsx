"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Secret } from "../types";
import styles from "./styles.module.css";

interface HotSecretsProps {
  secrets: Secret[];
}

export default function HotSecrets({ secrets }: HotSecretsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % secrets.length);
    }, 5000); // 5초마다 자동 슬라이드

    return () => clearInterval(interval);
  }, [secrets.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const formatPrice = (price: number) => {
    return `₩${price.toLocaleString()}`;
  };

  return (
    <section className={styles.hotSecretsSection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>🔒 지금 가장 HOT한 비밀</h2>
        <p className={styles.sectionSubtitle}>TOP3 구매 전환율이 높은 비밀들</p>
      </div>

      <div className={styles.carouselContainer}>
        <div 
          className={styles.carousel}
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {secrets.map((secret) => (
            <Link key={secret.id} href={`/secrets/${secret.id}`} className={styles.secretCard}>
              <div className={styles.imageWrapper}>
                <Image
                  src={secret.img}
                  alt={secret.title}
                  fill
                  className={styles.image}
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className={styles.overlay}>
                  <div className={styles.content}>
                    <h3 className={styles.title}>{secret.title}</h3>
                    <p className={styles.desc}>{secret.desc}</p>
                    <div className={styles.price}>{formatPrice(secret.price)}</div>
                    <div className={styles.hoverText}>🔍 더 알아보기</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className={styles.indicators}>
          {secrets.map((_, index) => (
            <button
              key={index}
              className={`${styles.indicator} ${index === currentIndex ? styles.active : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

