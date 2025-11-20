"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
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
  
  // GraphQL 데이터 상태
  const [hotSecrets, setHotSecrets] = useState<Secret[]>([]);
  const [saleSecrets, setSaleSecrets] = useState<Secret[]>([]);
  const [recommendedSecrets, setRecommendedSecrets] = useState<Secret[]>([]);
  const [loadingHot, setLoadingHot] = useState(true);
  const [loadingSale, setLoadingSale] = useState(true);
  const [loadingRecommended, setLoadingRecommended] = useState(true);

  useEffect(() => {
    authManager.initializeToken();
    setIsLoggedIn(authManager.isLoggedIn());
  }, []);

  // GraphQL에서 데이터 가져오기 - 각 섹션을 독립적으로 로딩하여 점진적 렌더링
  useEffect(() => {
    async function loadSecrets() {
      // Hot Secrets 먼저 로딩 (가장 중요한 섹션)
      try {
        const hot = await fetchHotSecrets();
        setHotSecrets(hot);
      } catch (error) {
        console.error('Failed to load hot secrets:', error);
      } finally {
        setLoadingHot(false);
      }

      // Sale Secrets와 Recommended Secrets는 병렬로 로딩
      Promise.all([
        fetchSaleSecrets().then(sale => {
          setSaleSecrets(sale);
          setLoadingSale(false);
        }).catch(error => {
          console.error('Failed to load sale secrets:', error);
          setLoadingSale(false);
        }),
        fetchRecommendedSecrets().then(recommended => {
          setRecommendedSecrets(recommended);
          setLoadingRecommended(false);
        }).catch(error => {
          console.error('Failed to load recommended secrets:', error);
          setLoadingRecommended(false);
        })
      ]);
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

  const handleLoginClick = useCallback(() => {
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
  }, [openModal, closeModal, refetch]);

  const handleLogoutClick = useCallback(() => {
    authManager.clearToken();
    setIsLoggedIn(false);
    window.location.reload();
  }, []);

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

      {loadingHot ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>로딩 중...</div>
      ) : (
        <HotSecrets secrets={hotSecrets} />
      )}
      
      {loadingSale ? (
        <div style={{ textAlign: 'center', padding: '1rem' }}>할인 상품 로딩 중...</div>
      ) : (
        <SaleSecrets secrets={saleSecrets} />
      )}
      
      {loadingRecommended ? (
        <div style={{ textAlign: 'center', padding: '1rem' }}>추천 상품 로딩 중...</div>
      ) : (
        <RecommendedSecrets secrets={recommendedSecrets} />
      )}
    </div>
  );
}

