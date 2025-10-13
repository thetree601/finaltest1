import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import styles from './styles.module.css';

export type SelectboxOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

export interface SelectboxProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** 변형 스타일 */
  variant?: 'primary' | 'secondary' | 'tertiary';
  /** 크기 */
  size?: 'small' | 'medium' | 'large';
  /** 테마 */
  theme?: 'light' | 'dark';
  /** 옵션 목록 */
  options: SelectboxOption[];
  /** 선택된 값 */
  value?: string;
  /** 기본 선택값 (비제어) */
  defaultValue?: string;
  /** 비활성화 */
  disabled?: boolean;
  /** placeholder */
  placeholder?: string;
  /** 값 변경 이벤트 */
  onChange?: (value: string) => void;
}

/**
 * Selectbox 컴포넌트
 * - variant/size/theme 시스템을 지원
 * - 키보드 접근성 및 ARIA 속성 지원
 */
export const Selectbox: React.FC<SelectboxProps> = ({
  variant = 'primary',
  size = 'medium',
  theme = 'light',
  options,
  value,
  defaultValue,
  disabled = false,
  placeholder = '선택하세요',
  onChange,
  className = '',
  ...props
}) => {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string | undefined>(defaultValue);
  const selectedValue = isControlled ? value : internalValue;
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  const selectedOption = useMemo(() => {
    return options.find(opt => opt.value === selectedValue);
  }, [options, selectedValue]);

  const setValue = useCallback((next: string) => {
    if (!isControlled) setInternalValue(next);
    if (onChange) onChange(next);
  }, [isControlled, onChange]);

  const openList = useCallback(() => {
    if (disabled) return;
    setOpen(true);
  }, [disabled]);

  const closeList = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
  }, []);

  const toggleList = useCallback(() => {
    if (open) closeList(); else openList();
  }, [open, closeList, openList]);

  // 외부 클릭 닫기
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (buttonRef.current && buttonRef.current.contains(target)) return;
      if (listRef.current && listRef.current.contains(target)) return;
      closeList();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, closeList]);

  // 키보드 내비게이션
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLButtonElement | HTMLUListElement>) => {
    if (disabled) return;
    const enabledOptions = options.filter(o => !o.disabled);
    const currentIndex = enabledOptions.findIndex(o => o.value === selectedValue);
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!open) {
          openList();
          setActiveIndex(Math.max(0, currentIndex));
        } else {
          setActiveIndex(prev => {
            const next = prev < 0 ? 0 : Math.min(prev + 1, enabledOptions.length - 1);
            return next;
          });
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (open) {
          setActiveIndex(prev => {
            const next = prev < 0 ? enabledOptions.length - 1 : Math.max(prev - 1, 0);
            return next;
          });
        }
        break;
      case 'Enter':
      case ' ': // Space
        if (!open) {
          e.preventDefault();
          openList();
        } else if (activeIndex >= 0) {
          e.preventDefault();
          const next = enabledOptions[activeIndex];
          if (next) {
            setValue(next.value);
            closeList();
            buttonRef.current?.focus();
          }
        }
        break;
      case 'Escape':
        if (open) {
          e.preventDefault();
          closeList();
          buttonRef.current?.focus();
        }
        break;
      case 'Tab':
        closeList();
        break;
      default:
        break;
    }
  }, [disabled, options, selectedValue, open, openList, closeList, activeIndex, setValue]);

  const handleOptionClick = useCallback((index: number, option: SelectboxOption) => {
    if (option.disabled) return;
    setValue(option.value);
    closeList();
    buttonRef.current?.focus();
  }, [setValue, closeList]);

  const rootClasses = [
    styles.selectbox,
    styles[variant],
    styles[size],
    styles[theme],
    disabled && styles.disabled,
    className,
  ].filter(Boolean).join(' ');

  const buttonClasses = [
    styles.trigger,
    open && styles.open,
  ].filter(Boolean).join(' ');

  const listboxId = useMemo(() => `listbox-${Math.random().toString(36).slice(2, 9)}`, []);

  return (
    <div className={rootClasses} {...props}>
      <button
        ref={buttonRef}
        type="button"
        className={buttonClasses}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        disabled={disabled}
        onClick={toggleList}
        onKeyDown={handleKeyDown}
      >
        <span className={styles.label}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className={styles.icon} aria-hidden>
          {/* Using optimized next/image */}
          <Image src="/icons/arrow_drop_down.svg" alt="" width={20} height={20} />
        </span>
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          tabIndex={-1}
          className={styles.menu}
          onKeyDown={handleKeyDown}
        >
          {options.map((option, idx) => {
            const isSelected = selectedValue === option.value;
            const isActive = idx === activeIndex;
            const optionClasses = [
              styles.option,
              isSelected && styles.selected,
              isActive && styles.active,
              option.disabled && styles.optionDisabled,
            ].filter(Boolean).join(' ');
            return (
              <li
                key={option.value}
                role="option"
                aria-selected={isSelected}
                aria-disabled={option.disabled}
                className={optionClasses}
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleOptionClick(idx, option)}
              >
                <span className={styles.optionLabel}>{option.label}</span>
                {isSelected && (
                  <span className={styles.checkIcon} aria-hidden>
                    <Image src="/icons/check_outline_light_xs.svg" alt="" width={16} height={16} />
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Selectbox;


