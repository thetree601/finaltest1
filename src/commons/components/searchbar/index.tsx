import React from 'react';
import Image from 'next/image';
import styles from './styles.module.css';

export interface SearchBarProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'small' | 'medium' | 'large';
  theme?: 'light' | 'dark';
  value?: string;
  disabled?: boolean;
  error?: boolean;
}

/**
 * SearchBar 컴포넌트
 * - Figma 노드(3:1566) 구조: 좌측 24px 검색 아이콘 + 플레이스홀더 텍스트
 * - variant/size/theme 시스템 및 a11y 지원
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  variant = 'primary',
  size = 'medium',
  theme = 'light',
  value,
  placeholder = '검색어를 입력해 주세요.',
  disabled = false,
  error = false,
  className = '',
  onChange,
  ...props
}) => {
  const containerClasses = [
    styles.container,
    styles[size],
    styles[variant],
    styles[theme],
    error && styles.error,
    disabled && styles.disabled,
    className,
  ].filter(Boolean).join(' ');

  const inputClasses = [
    styles.input,
    theme === 'dark' ? styles.placeholderDark : styles.placeholderLight,
  ].filter(Boolean).join(' ');

  return (
    <div className={styles.wrapper}>
      <div className={containerClasses} role="search">
        <span className={styles.icon} aria-hidden="true">
          <Image src="/icons/search_outline_light_m.svg" alt="" width={24} height={24} />
        </span>
        <input
          className={inputClasses}
          type="search"
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          disabled={disabled}
          aria-invalid={error || undefined}
          {...props}
        />
      </div>
    </div>
  );
};

export default SearchBar;


