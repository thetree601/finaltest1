import React from 'react';
import styles from './styles.module.css';

export type PaginationVariant = 'primary' | 'secondary' | 'tertiary';
export type PaginationSize = 'small' | 'medium' | 'large';
export type PaginationTheme = 'light' | 'dark';

export interface PaginationProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** 현재 페이지 (1-indexed) */
  currentPage: number;
  /** 전체 페이지 수 */
  totalPages: number;
  /** 페이지 변경 핸들러 */
  onChange: (page: number) => void;
  /** 스타일 변형 */
  variant?: PaginationVariant;
  /** 크기 */
  size?: PaginationSize;
  /** 테마 */
  theme?: PaginationTheme;
  /** 좌우 화살표 표시 여부 */
  showArrows?: boolean;
  /** 처음/끝으로 이동 버튼 표시 여부 */
  showEdgeButtons?: boolean;
  /** 표시할 최대 페이지 버튼 개수 (중앙 가변, 5 이상 권장) */
  maxVisible?: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function getPages(current: number, total: number, maxVisible: number): (number | 'ellipsis')[] {
  const visible = Math.max(3, maxVisible);
  if (total <= visible) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const half = Math.floor((visible - 2) / 2);
  const start = clamp(current - half, 2, Math.max(2, total - (visible - 2)));
  const end = Math.min(total - 1, start + (visible - 3));

  const pages: (number | 'ellipsis')[] = [1];
  if (start > 2) pages.push('ellipsis');
  for (let p = start; p <= end; p += 1) pages.push(p);
  if (end < total - 1) pages.push('ellipsis');
  pages.push(total);
  return pages;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onChange,
  variant = 'primary',
  size = 'medium',
  theme = 'light',
  showArrows = true,
  showEdgeButtons = false,
  maxVisible = 7,
  className = '',
  ...props
}) => {
  const clampedCurrent = clamp(currentPage, 1, Math.max(1, totalPages));
  const isFirst = clampedCurrent === 1;
  const isLast = clampedCurrent === totalPages;

  const containerClass = [
    styles.pagination,
    styles[variant],
    styles[size],
    styles[theme],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleChange = (page: number) => {
    const next = clamp(page, 1, totalPages);
    if (next !== clampedCurrent) onChange(next);
  };

  const pages = getPages(clampedCurrent, Math.max(1, totalPages), maxVisible);

  return (
    <div className={containerClass} role="navigation" aria-label="Pagination" {...props}>
      {showEdgeButtons && (
        <button
          type="button"
          className={[styles.item, styles.control, isFirst && styles.disabled].filter(Boolean).join(' ')}
          onClick={() => handleChange(1)}
          disabled={isFirst}
          aria-label="First page"
        >
          <img className={styles.icon} src="/icons/leftdisabled_outline_light_m.svg" alt="first" aria-hidden="true" />
        </button>
      )}

      {showArrows && (
        <button
          type="button"
          className={[styles.item, styles.control, isFirst && styles.disabled].filter(Boolean).join(' ')}
          onClick={() => handleChange(clampedCurrent - 1)}
          disabled={isFirst}
          aria-label="Previous page"
        >
          <img className={styles.icon} src="/icons/leftenable_outline_light_m.svg" alt="prev" aria-hidden="true" />
        </button>
      )}

      {pages.map((p, idx) => {
        if (p === 'ellipsis') {
          return (
            <span key={`e-${idx}`} className={[styles.item, styles.ellipsis].join(' ')} aria-hidden>
              …
            </span>
          );
        }
        const active = p === clampedCurrent;
        return (
          <button
            key={p}
            type="button"
            className={[styles.item, styles.page, active && styles.active].filter(Boolean).join(' ')}
            aria-current={active ? 'page' : undefined}
            onClick={() => handleChange(p)}
          >
            {p}
          </button>
        );
      })}

      {showArrows && (
        <button
          type="button"
          className={[styles.item, styles.control, isLast && styles.disabled].filter(Boolean).join(' ')}
          onClick={() => handleChange(clampedCurrent + 1)}
          disabled={isLast}
          aria-label="Next page"
        >
          <img className={styles.icon} src="/icons/rightenable_outline_light_m.svg" alt="next" aria-hidden="true" />
        </button>
      )}

      {showEdgeButtons && (
        <button
          type="button"
          className={[styles.item, styles.control, isLast && styles.disabled].filter(Boolean).join(' ')}
          onClick={() => handleChange(totalPages)}
          disabled={isLast}
          aria-label="Last page"
        >
          <img className={styles.icon} src="/icons/rightdisabled_outline_light_m.svg" alt="last" aria-hidden="true" />
        </button>
      )}
    </div>
  );
};

export default Pagination;


