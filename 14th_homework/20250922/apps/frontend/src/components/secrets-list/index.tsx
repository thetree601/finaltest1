"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@apollo/client";
import { useModal } from "@/commons/providers/modal/modal.provider";
import { authManager } from "@/lib/auth";
import { FETCH_USER_LOGGED_IN } from "@/commons/layout/navigation/queries";
import HotSecrets from "./hot-secrets";
import SaleSecrets from "./sale-secrets";
import RecommendedSecrets from "./recommended-secrets";
import { fetchHotSecrets, fetchSaleSecrets, fetchRecommendedSecrets } from "./queries";
import { Secret } from "./types";
import LoginModal from "./modals/LoginModal";
import styles from "./styles.module.css";

export default function SecretsListPage() {
  const pathname = usePathname();
  const { openModal, closeModal } = useModal();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const hasOpenedModalRef = useRef(false);
  
  // Supabase 데이터 상태
  const [hotSecrets, setHotSecrets] = useState<Secret[]>([]);
  const [saleSecrets, setSaleSecrets] = useState<Secret[]>([]);
  const [recommendedSecrets, setRecommendedSecrets] = useState<Secret[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authManager.initializeToken();
    setIsLoggedIn(authManager.isLoggedIn());
  }, []);

  // Supabase에서 데이터 가져오기
  useEffect(() => {
    async function loadSecrets() {
      try {
        setLoading(true);
        const [hot, sale, recommended] = await Promise.all([
          fetchHotSecrets(),
          fetchSaleSecrets(),
          fetchRecommendedSecrets(),
        ]);
        setHotSecrets(hot);
        setSaleSecrets(sale);
        setRecommendedSecrets(recommended);
      } catch (error) {
        console.error('Failed to load secrets:', error);
      } finally {
        setLoading(false);
      }
    }
    loadSecrets();
  }, []);

  const [shouldSkipQuery, setShouldSkipQuery] = useState(!authManager.isLoggedIn());

  const { data, error, refetch } = useQuery(FETCH_USER_LOGGED_IN, {
    skip: shouldSkipQuery,
    errorPolicy: 'ignore',
    onCompleted: () => {
      setIsLoggedIn(true);
      hasOpenedModalRef.current = false; // 로그인 성공 시 리셋
    },
    onError: (error) => {
      setIsLoggedIn(false);
      // 토큰 만료 에러인 경우 토큰 제거
      if (error.graphQLErrors?.some(
        (err) => err.extensions?.code === 'UNAUTHENTICATED' || err.message.includes('토큰 만료')
      )) {
        authManager.clearToken();
        setShouldSkipQuery(true);
      }
    }
  });

  // 토큰 상태 변경 감지
  useEffect(() => {
    const isLoggedIn = authManager.isLoggedIn();
    setShouldSkipQuery(!isLoggedIn);
  }, []);

  // 토큰 만료 에러가 발생하면 로그인 모달 자동 열기
  useEffect(() => {
    const hasAuthError = error?.graphQLErrors?.some(
      (err) => err.extensions?.code === 'UNAUTHENTICATED' || err.message.includes('토큰 만료')
    );

    if (hasAuthError && !isLoggedIn && !hasOpenedModalRef.current) {
      hasOpenedModalRef.current = true;
      openModal(
        <LoginModal
          onCancel={() => {
            closeModal();
            hasOpenedModalRef.current = false;
          }}
          onSuccess={async () => {
            // 로그인 성공 후 토큰이 저장되었으므로 쿼리 다시 실행
            setShouldSkipQuery(false);
            if (authManager.isLoggedIn()) {
              try {
                await refetch();
                setIsLoggedIn(true);
              } catch (err) {
                console.error('사용자 정보 조회 실패:', err);
              }
            }
            closeModal();
            hasOpenedModalRef.current = false;
          }}
        />
      );
    }
  }, [error, isLoggedIn, openModal, closeModal, refetch]);

  const handleLoginClick = () => {
    openModal(
      <LoginModal
        onCancel={closeModal}
        onSuccess={async () => {
          // 로그인 성공 후 토큰이 저장되었으므로 쿼리 다시 실행
          setShouldSkipQuery(false);
          if (authManager.isLoggedIn()) {
            try {
              await refetch();
              setIsLoggedIn(true);
            } catch (err) {
              console.error('사용자 정보 조회 실패:', err);
            }
          }
          closeModal();
        }}
      />
    );
  };

  const handleLogoutClick = () => {
    authManager.clearToken();
    setIsLoggedIn(false);
    window.location.reload();
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
      </div>
    );
  }

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
          {isLoggedIn ? (
            <button
              onClick={handleLogoutClick}
              className={styles.logoutButton}
            >
              로그아웃
            </button>
          ) : (
            <button
              onClick={handleLoginClick}
              className={styles.loginButton}
            >
              로그인
            </button>
          )}
        </div>
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

