"use client";

import React from "react";
import { motion } from "framer-motion";
import styles from "./styles.module.css";

async function cancelSubscription() {
  try {
    const key =
      typeof window !== "undefined" ? localStorage.getItem("lastTransactionKey") : null;
    if (!key) {
      alert("최근 결제 내역을 찾을 수 없습니다. 결제 후 다시 시도해주세요.");
      return;
    }
    const res = await fetch("/api/payments/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transactionKey: key }),
    });
    const result = await res.json();
    if (!res.ok || !result?.success) {
      alert(result?.error || "구독 취소에 실패했습니다.");
      return;
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("isSubscribed", "false");
      localStorage.removeItem("lastTransactionKey");
      window.dispatchEvent(new StorageEvent("storage", { key: "isSubscribed", newValue: "false" }));
    }
    alert("구독이 취소되었습니다.");
  } catch (e) {
    console.error(e);
    alert("구독 취소 처리 중 오류가 발생했습니다.");
  }
}

type ReflectionItem = {
  id: string;
  question: string;
  meta: string;
};

const DUMMY_VALUES = ["진정성", "성장", "자유"];
const DUMMY_REFLECTIONS: ReflectionItem[] = [
  {
    id: "r1",
    question: "가장 나다웠던 순간은 언제인가요?",
    meta: "핵심가치: 자율, 창의성",
  },
  {
    id: "r2",
    question: "최근에 에너지를 가장 많이 쏟은 일은 무엇이었나요?",
    meta: "핵심가치: 배움, 집중",
  },
];

const DUMMY_QUOTE = {
  text: "바람은 방향을 바꾸지만, 나침반은 언제나 북쪽을 가리킨다.",
  author: "LifeCompass",
};

const DUMMY_TIMELINE = [
  { id: "t1", title: "가치 재정의", note: "‘성장’을 ‘완벽’보다 우선으로.", date: "오늘" },
  { id: "t2", title: "관계 성찰", note: "거리 두기가 나를 더 선명하게.", date: "어제" },
  { id: "t3", title: "경계 세우기", note: "나는 ‘아니오’라고 말할 자유가 있다.", date: "3일 전" },
];

const DUMMY_PROGRESS = 62; // 통찰 여정 진행도(%)

function CompassIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="#d4af37" strokeOpacity="0.8" strokeWidth="1.2" />
      <circle cx="12" cy="12" r="1.2" fill="#d4af37" />
      <path d="M9.5 14.5L14.6 9.4L12.9 12.9L9.5 14.5Z" fill="#f3e9d1" fillOpacity="0.9" />
      <path d="M14.5 9.5L9.4 14.6L12.9 13L14.5 9.5Z" fill="#b08b2e" fillOpacity="0.9" />
    </svg>
  );
}

export default function MyPage() {
  return (
    <div className={styles.root}>
      <div className={styles.container}>
        {/* Grid */}
        <div className={styles.grid}>
          {/* Header card inline with grid */}
          <motion.section
            className={`${styles.card} ${styles.appear}`}
            style={{ gridColumn: "span 12" }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <div className={styles.headerRow}>
              <div className={styles.greeting}>
                <motion.h1
                  className={styles.title}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                >
                  안녕하세요, 유진님 🌿
                </motion.h1>
                <motion.p
                  className={styles.subtitle}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: "easeOut", delay: 0.04 }}
                >
                  당신은 혼자 있는 시간 속에서 가장 명확해집니다.
                </motion.p>
              </div>
              <motion.div
                className={styles.compassWrap}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
              >
                <motion.div
                  style={{ width: 34, height: 34 }}
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 28, ease: "linear" }}
                >
                  <CompassIcon />
                </motion.div>
              </motion.div>
            </div>
          </motion.section>
          {/* Today Quote */}
          <motion.section
            className={`${styles.card} ${styles.appear}`}
            style={{ gridColumn: "span 12" }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>오늘의 문장</h3>
            </div>
            <blockquote className={styles.quote}>
              “{DUMMY_QUOTE.text}”
              <span className={styles.quoteAuthor}>— {DUMMY_QUOTE.author}</span>
            </blockquote>
          </motion.section>

          {/* My Compass Overview */}
          <motion.section
            className={`${styles.card} ${styles.appear}`}
            style={{ gridColumn: "span 6" }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>나의 나침반 요약</h3>
            </div>
            <div className={styles.chipRow}>
              {DUMMY_VALUES.map((value) => (
                <span key={value} className={styles.chip}>
                  {value}
                </span>
              ))}
            </div>
          </motion.section>

          {/* Recent Reflection */}
          <motion.section
            className={`${styles.card} ${styles.appear}`}
            style={{ gridColumn: "span 6" }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
          >
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>최근 성찰</h3>
            </div>
            <div className={styles.list}>
              {DUMMY_REFLECTIONS.map((item) => (
                <div key={item.id} className={styles.listItem}>
                  <div className={styles.question}>{item.question}</div>
                  <div className={styles.meta}>{item.meta}</div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Journey Progress */}
          <motion.section
            className={`${styles.card} ${styles.appear}`}
            style={{ gridColumn: "span 6" }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.08 }}
          >
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>통찰 여정</h3>
              <div className={styles.progressLabel}>{DUMMY_PROGRESS}%</div>
            </div>
            <div className={styles.progressTrack}>
              <div className={styles.progressBar} style={{ width: `${DUMMY_PROGRESS}%` }} />
            </div>
            <div className={styles.progressNote}>꾸준함이 방향을 만든다는 믿음을 잊지 마세요.</div>
          </motion.section>

          {/* Reflection Timeline */}
          <motion.section
            className={`${styles.card} ${styles.appear}`}
            style={{ gridColumn: "span 6" }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.08 }}
          >
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>성찰 타임라인</h3>
            </div>
            <ul className={styles.timeline}>
              {DUMMY_TIMELINE.map((t) => (
                <li key={t.id} className={styles.timelineItem}>
                  <div className={styles.timelineDot} />
                  <div className={styles.timelineBody}>
                    <div className={styles.timelineTitle}>{t.title}</div>
                    <div className={styles.timelineNote}>{t.note}</div>
                  </div>
                  <div className={styles.timelineDate}>{t.date}</div>
                </li>
              ))}
            </ul>
          </motion.section>

          {/* Next Step */}
          <motion.section
            className={`${styles.card} ${styles.appear}`}
            style={{ gridColumn: "span 12" }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          >
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>다음 질문</h3>
            </div>
            <div className={styles.nextBox}>
              <div className={styles.nextText}>요즘 당신에게 성공은 어떤 의미인가요?</div>
              <button type="button" className={styles.nextCta}>생각해보기</button>
            </div>
          </motion.section>

          {/* Quick Actions */}
          <motion.section
            className={`${styles.card} ${styles.appear}`}
            style={{ gridColumn: "span 12" }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.12 }}
          >
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>빠른 실행</h3>
            </div>
            <div className={styles.quickRow}>
              <button className={styles.quickBtn} type="button">새 성찰 시작</button>
              <button className={styles.quickBtn} type="button">가치 재정비</button>
              <button className={styles.quickBtn} type="button">아카이브 보기</button>
              <button className={`${styles.quickBtn} ${styles.cancelBtn}`} type="button" onClick={cancelSubscription} data-testid="cancel-subscription-btn">구독 취소</button>
            </div>
          </motion.section>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className={styles.nav} aria-label="LifeCompass navigation">
        <ul className={styles.navList}>
          <li className={`${styles.navItem} ${styles.navItemActive}`}>나의 나침반</li>
          <li className={styles.navItem}>나의 이야기</li>
          <li className={styles.navItem}>통찰</li>
          <li className={styles.navItem}>설정</li>
        </ul>
      </nav>
    </div>
  );
}


