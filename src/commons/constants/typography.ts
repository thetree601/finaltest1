/**
 * Typography Tokens
 * 한국어/영문 분기 및 모바일/데스크톱 분기를 지원하는 타이포그래피 토큰
 */

// 기본 폰트 패밀리 (Figma 파운데이션 기준)
export const fontFamily = {
  korean: {
    primary: 'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif',
    secondary: 'Noto Sans KR, sans-serif',
    mono: 'JetBrains Mono, "Fira Code", "SF Mono", Monaco, Inconsolata, "Roboto Mono", "Source Code Pro", monospace',
  },
  english: {
    primary: 'Inter, -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", sans-serif',
    secondary: 'Roboto, sans-serif',
    mono: 'JetBrains Mono, "Fira Code", "SF Mono", Monaco, Inconsolata, "Roboto Mono", "Source Code Pro", monospace',
  },
} as const;

// 폰트 크기 (모바일/데스크톱 분기)
export const fontSize = {
  mobile: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '28px',
    '4xl': '32px',
    '5xl': '36px',
    '6xl': '40px',
  },
  desktop: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px',
    '4xl': '40px',
    '5xl': '48px',
    '6xl': '56px',
  },
} as const;

// 폰트 두께
export const fontWeight = {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
} as const;

// 줄 간격
export const lineHeight = {
  none: '1',
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',
} as const;

// 자간
export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const;

// 타이포그래피 스타일 (Figma 파운데이션 기준)
export const typography = {
  korean: {
    mobile: {
      // Web Headline 스타일 (Figma 기준)
      webHeadline01: {
        fontSize: '48px',
        fontWeight: fontWeight.semibold,
        lineHeight: '60px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.korean.primary,
      },
      webHeadline02: {
        fontSize: '36px',
        fontWeight: fontWeight.semibold,
        lineHeight: '48px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.korean.primary,
      },
      webHeadline03: {
        fontSize: '28px',
        fontWeight: fontWeight.semibold,
        lineHeight: '36px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.korean.primary,
      },
      // Headline 스타일 (Figma 기준)
      headline01: {
        fontSize: '24px',
        fontWeight: fontWeight.bold,
        lineHeight: '32px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.korean.primary,
      },
      headline02: {
        fontSize: '22px',
        fontWeight: fontWeight.extrabold,
        lineHeight: '30px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.korean.primary,
      },
      headline03: {
        fontSize: '20px',
        fontWeight: fontWeight.bold,
        lineHeight: '28px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.korean.primary,
      },
      // Title 스타일 (Figma 기준)
      title01: {
        fontSize: '18px',
        fontWeight: fontWeight.bold,
        lineHeight: '24px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.korean.primary,
      },
      title02: {
        fontSize: '16px',
        fontWeight: fontWeight.bold,
        lineHeight: '22px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.korean.primary,
      },
      title03: {
        fontSize: '14px',
        fontWeight: fontWeight.bold,
        lineHeight: '20px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.korean.primary,
      },
      subtitle01: {
        fontSize: '14px',
        fontWeight: fontWeight.semibold,
        lineHeight: '22px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.korean.primary,
      },
      subtitle02: {
        fontSize: '12px',
        fontWeight: fontWeight.semibold,
        lineHeight: '18px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.korean.primary,
      },
      // Body 스타일 (Figma 기준)
      body01: {
        fontSize: '16px',
        fontWeight: fontWeight.medium,
        lineHeight: '24px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.korean.primary,
      },
      body02: {
        fontSize: '14px',
        fontWeight: fontWeight.medium,
        lineHeight: '22px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.korean.primary,
      },
      body03: {
        fontSize: '12px',
        fontWeight: fontWeight.medium,
        lineHeight: '18px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.korean.primary,
      },
      // Body Regular 스타일 (Figma 기준)
      bodyRegular01: {
        fontSize: '16px',
        fontWeight: fontWeight.normal,
        lineHeight: '22px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.korean.primary,
      },
      bodyRegular02: {
        fontSize: '14px',
        fontWeight: fontWeight.normal,
        lineHeight: '20px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.korean.primary,
      },
      bodyRegular03: {
        fontSize: '12px',
        fontWeight: fontWeight.normal,
        lineHeight: '16px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.korean.primary,
      },
      // Caption 스타일 (Figma 기준)
      caption01: {
        fontSize: '12px',
        fontWeight: fontWeight.semibold,
        lineHeight: '14px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.korean.primary,
      },
      caption02: {
        fontSize: '10px',
        fontWeight: fontWeight.semibold,
        lineHeight: '12px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.korean.primary,
      },
      caption03: {
        fontSize: '8px',
        fontWeight: fontWeight.semibold,
        lineHeight: '10px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.korean.primary,
      },
      // Caption Medium 스타일 (Figma 기준)
      captionMedium: {
        fontSize: '10px',
        fontWeight: fontWeight.medium,
        lineHeight: '12px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.korean.primary,
      },
    },
    desktop: {
      // Web Headline 스타일 (Figma 기준 - Desktop은 Web과 동일)
      webHeadline01: {
        fontSize: '48px',
        fontWeight: fontWeight.semibold,
        lineHeight: '60px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.korean.primary,
      },
      webHeadline02: {
        fontSize: '36px',
        fontWeight: fontWeight.semibold,
        lineHeight: '48px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.korean.primary,
      },
      webHeadline03: {
        fontSize: '28px',
        fontWeight: fontWeight.semibold,
        lineHeight: '36px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.korean.primary,
      },
      // Headline 스타일 (Figma 기준)
      headline01: {
        fontSize: '24px',
        fontWeight: fontWeight.bold,
        lineHeight: '32px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.korean.primary,
      },
      headline02: {
        fontSize: '22px',
        fontWeight: fontWeight.extrabold,
        lineHeight: '30px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.korean.primary,
      },
      headline03: {
        fontSize: '20px',
        fontWeight: fontWeight.bold,
        lineHeight: '28px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.korean.primary,
      },
      // Title 스타일 (Figma 기준)
      title01: {
        fontSize: '18px',
        fontWeight: fontWeight.bold,
        lineHeight: '24px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.korean.primary,
      },
      title02: {
        fontSize: '16px',
        fontWeight: fontWeight.bold,
        lineHeight: '22px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.korean.primary,
      },
      title03: {
        fontSize: '14px',
        fontWeight: fontWeight.bold,
        lineHeight: '20px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.korean.primary,
      },
      subtitle01: {
        fontSize: '14px',
        fontWeight: fontWeight.semibold,
        lineHeight: '22px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.korean.primary,
      },
      subtitle02: {
        fontSize: '12px',
        fontWeight: fontWeight.semibold,
        lineHeight: '18px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.korean.primary,
      },
      // Body 스타일 (Figma 기준)
      body01: {
        fontSize: '16px',
        fontWeight: fontWeight.medium,
        lineHeight: '24px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.korean.primary,
      },
      body02: {
        fontSize: '14px',
        fontWeight: fontWeight.medium,
        lineHeight: '22px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.korean.primary,
      },
      body03: {
        fontSize: '12px',
        fontWeight: fontWeight.medium,
        lineHeight: '18px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.korean.primary,
      },
      // Body Regular 스타일 (Figma 기준)
      bodyRegular01: {
        fontSize: '16px',
        fontWeight: fontWeight.normal,
        lineHeight: '22px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.korean.primary,
      },
      bodyRegular02: {
        fontSize: '14px',
        fontWeight: fontWeight.normal,
        lineHeight: '20px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.korean.primary,
      },
      bodyRegular03: {
        fontSize: '12px',
        fontWeight: fontWeight.normal,
        lineHeight: '16px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.korean.primary,
      },
      // Caption 스타일 (Figma 기준)
      caption01: {
        fontSize: '12px',
        fontWeight: fontWeight.semibold,
        lineHeight: '14px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.korean.primary,
      },
      caption02: {
        fontSize: '10px',
        fontWeight: fontWeight.semibold,
        lineHeight: '12px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.korean.primary,
      },
      caption03: {
        fontSize: '8px',
        fontWeight: fontWeight.semibold,
        lineHeight: '10px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.korean.primary,
      },
      // Caption Medium 스타일 (Figma 기준)
      captionMedium: {
        fontSize: '10px',
        fontWeight: fontWeight.medium,
        lineHeight: '12px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.korean.primary,
      },
    },
  },
  english: {
    mobile: {
      // Web Headline 스타일 (영문용 - 한국어와 동일한 크기, SUIT Variable 폰트)
      webHeadline01: {
        fontSize: '48px',
        fontWeight: fontWeight.semibold,
        lineHeight: '60px',
        letterSpacing: letterSpacing.tighter,
        fontFamily: fontFamily.english.primary,
      },
      webHeadline02: {
        fontSize: '36px',
        fontWeight: fontWeight.semibold,
        lineHeight: '48px',
        letterSpacing: letterSpacing.tighter,
        fontFamily: fontFamily.english.primary,
      },
      webHeadline03: {
        fontSize: '28px',
        fontWeight: fontWeight.semibold,
        lineHeight: '36px',
        letterSpacing: letterSpacing.tight,
        fontFamily: fontFamily.english.primary,
      },
      // Headline 스타일 (영문용)
      headline01: {
        fontSize: '24px',
        fontWeight: fontWeight.bold,
        lineHeight: '32px',
        letterSpacing: letterSpacing.tight,
        fontFamily: fontFamily.english.primary,
      },
      headline02: {
        fontSize: '22px',
        fontWeight: fontWeight.extrabold,
        lineHeight: '30px',
        letterSpacing: letterSpacing.tight,
        fontFamily: fontFamily.english.primary,
      },
      headline03: {
        fontSize: '20px',
        fontWeight: fontWeight.bold,
        lineHeight: '28px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.english.primary,
      },
      // Title 스타일 (영문용)
      title01: {
        fontSize: '18px',
        fontWeight: fontWeight.bold,
        lineHeight: '24px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.english.primary,
      },
      title02: {
        fontSize: '16px',
        fontWeight: fontWeight.bold,
        lineHeight: '22px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.english.primary,
      },
      title03: {
        fontSize: '14px',
        fontWeight: fontWeight.bold,
        lineHeight: '20px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.english.primary,
      },
      subtitle01: {
        fontSize: '14px',
        fontWeight: fontWeight.semibold,
        lineHeight: '22px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.english.primary,
      },
      subtitle02: {
        fontSize: '12px',
        fontWeight: fontWeight.semibold,
        lineHeight: '18px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.english.primary,
      },
      // Body 스타일 (영문용 - 더 넓은 줄간격)
      body01: {
        fontSize: '16px',
        fontWeight: fontWeight.medium,
        lineHeight: '26px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.english.primary,
      },
      body02: {
        fontSize: '14px',
        fontWeight: fontWeight.medium,
        lineHeight: '24px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.english.primary,
      },
      body03: {
        fontSize: '12px',
        fontWeight: fontWeight.medium,
        lineHeight: '20px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.english.primary,
      },
      // Body Regular 스타일 (영문용)
      bodyRegular01: {
        fontSize: '16px',
        fontWeight: fontWeight.normal,
        lineHeight: '24px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.english.primary,
      },
      bodyRegular02: {
        fontSize: '14px',
        fontWeight: fontWeight.normal,
        lineHeight: '22px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.english.primary,
      },
      bodyRegular03: {
        fontSize: '12px',
        fontWeight: fontWeight.normal,
        lineHeight: '18px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.english.primary,
      },
      // Caption 스타일 (영문용)
      caption01: {
        fontSize: '12px',
        fontWeight: fontWeight.semibold,
        lineHeight: '16px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.english.primary,
      },
      caption02: {
        fontSize: '10px',
        fontWeight: fontWeight.semibold,
        lineHeight: '14px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.english.primary,
      },
      caption03: {
        fontSize: '8px',
        fontWeight: fontWeight.semibold,
        lineHeight: '12px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.english.primary,
      },
      // Caption Medium 스타일 (영문용)
      captionMedium: {
        fontSize: '10px',
        fontWeight: fontWeight.medium,
        lineHeight: '14px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.english.primary,
      },
    },
    desktop: {
      // Web Headline 스타일 (영문용 - Desktop은 Mobile과 동일)
      webHeadline01: {
        fontSize: '48px',
        fontWeight: fontWeight.semibold,
        lineHeight: '60px',
        letterSpacing: letterSpacing.tighter,
        fontFamily: fontFamily.english.primary,
      },
      webHeadline02: {
        fontSize: '36px',
        fontWeight: fontWeight.semibold,
        lineHeight: '48px',
        letterSpacing: letterSpacing.tighter,
        fontFamily: fontFamily.english.primary,
      },
      webHeadline03: {
        fontSize: '28px',
        fontWeight: fontWeight.semibold,
        lineHeight: '36px',
        letterSpacing: letterSpacing.tight,
        fontFamily: fontFamily.english.primary,
      },
      // Headline 스타일 (영문용)
      headline01: {
        fontSize: '24px',
        fontWeight: fontWeight.bold,
        lineHeight: '32px',
        letterSpacing: letterSpacing.tight,
        fontFamily: fontFamily.english.primary,
      },
      headline02: {
        fontSize: '22px',
        fontWeight: fontWeight.extrabold,
        lineHeight: '30px',
        letterSpacing: letterSpacing.tight,
        fontFamily: fontFamily.english.primary,
      },
      headline03: {
        fontSize: '20px',
        fontWeight: fontWeight.bold,
        lineHeight: '28px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.english.primary,
      },
      // Title 스타일 (영문용)
      title01: {
        fontSize: '18px',
        fontWeight: fontWeight.bold,
        lineHeight: '24px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.english.primary,
      },
      title02: {
        fontSize: '16px',
        fontWeight: fontWeight.bold,
        lineHeight: '22px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.english.primary,
      },
      title03: {
        fontSize: '14px',
        fontWeight: fontWeight.bold,
        lineHeight: '20px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.english.primary,
      },
      subtitle01: {
        fontSize: '14px',
        fontWeight: fontWeight.semibold,
        lineHeight: '22px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.english.primary,
      },
      subtitle02: {
        fontSize: '12px',
        fontWeight: fontWeight.semibold,
        lineHeight: '18px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.english.primary,
      },
      // Body 스타일 (영문용 - 더 넓은 줄간격)
      body01: {
        fontSize: '16px',
        fontWeight: fontWeight.medium,
        lineHeight: '26px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.english.primary,
      },
      body02: {
        fontSize: '14px',
        fontWeight: fontWeight.medium,
        lineHeight: '24px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.english.primary,
      },
      body03: {
        fontSize: '12px',
        fontWeight: fontWeight.medium,
        lineHeight: '20px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.english.primary,
      },
      // Body Regular 스타일 (영문용)
      bodyRegular01: {
        fontSize: '16px',
        fontWeight: fontWeight.normal,
        lineHeight: '24px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.english.primary,
      },
      bodyRegular02: {
        fontSize: '14px',
        fontWeight: fontWeight.normal,
        lineHeight: '22px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.english.primary,
      },
      bodyRegular03: {
        fontSize: '12px',
        fontWeight: fontWeight.normal,
        lineHeight: '18px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.english.primary,
      },
      // Caption 스타일 (영문용)
      caption01: {
        fontSize: '12px',
        fontWeight: fontWeight.semibold,
        lineHeight: '16px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.english.primary,
      },
      caption02: {
        fontSize: '10px',
        fontWeight: fontWeight.semibold,
        lineHeight: '14px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.english.primary,
      },
      caption03: {
        fontSize: '8px',
        fontWeight: fontWeight.semibold,
        lineHeight: '12px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.english.primary,
      },
      // Caption Medium 스타일 (영문용)
      captionMedium: {
        fontSize: '10px',
        fontWeight: fontWeight.medium,
        lineHeight: '14px',
        letterSpacing: letterSpacing.normal,
        fontFamily: fontFamily.english.primary,
      },
    },
  },
} as const;

// 전체 타이포그래피 객체
export const typographyTokens = {
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  typography,
} as const;

// 타입 정의
export type TypographyTokens = typeof typographyTokens;
export type FontFamily = typeof fontFamily;
export type FontSize = typeof fontSize;
export type FontWeight = typeof fontWeight;
export type LineHeight = typeof lineHeight;
export type LetterSpacing = typeof letterSpacing;
export type Typography = typeof typography;

// 언어별 타입
export type Language = 'korean' | 'english';
export type Device = 'mobile' | 'desktop';
export type TypographyStyle = 
  | 'webHeadline01' | 'webHeadline02' | 'webHeadline03'
  | 'headline01' | 'headline02' | 'headline03'
  | 'title01' | 'title02' | 'title03'
  | 'subtitle01' | 'subtitle02'
  | 'body01' | 'body02' | 'body03'
  | 'bodyRegular01' | 'bodyRegular02' | 'bodyRegular03'
  | 'caption01' | 'caption02' | 'caption03' | 'captionMedium';

// 타이포그래피 스타일 타입
export type TypographyStyleType = {
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing: string;
  fontFamily: string;
};

// 기본 export
export default typographyTokens;
