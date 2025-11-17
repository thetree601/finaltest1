import React from "react";
import Navigation from "./navigation/index";
import Banner from "./banner/index";
import styles from "./styles.module.css";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className={styles.layout}>
      <Navigation />
      <Banner />
      <main className={styles.main}>
        {children}
      </main>
      {/* 풋터는 필요시 추가 */}
    </div>
  );
}
