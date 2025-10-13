/**
 * Color Tokens
 * 다크모드를 포함한 모든 색상을 토큰화하여 관리
 * 
 * @description
 * - 모든 색상은 const assertion으로 타입 안정성 보장
 * - CSS 변수와 1:1 매핑되어 Tailwind에서도 사용 가능
 * - 다크모드는 lightMode/darkMode 객체로 분리 관리
 * 
 * @example
 * // TypeScript에서 사용
 * import { colors, blue } from '@/commons/constants/color';
 * const primaryColor = blue['60']; // #3A5CF3
 * 
 * // CSS/Tailwind에서 사용
 * <div className="bg-blue-60 text-gray-white" />
 * <div style={{ backgroundColor: 'var(--blue-60)' }} />
 */

// Blue 색상 팔레트
export const blue = {
  '05': '#F0F7FF',
  '10': '#DBEEFF',
  '20': '#BDDBFF',
  '30': '#93BEFF',
  '40': '#6DA5FA', // System color
  '50': '#497CFF',
  '60': '#3A5CF3', // System color
  '70': '#274AE1',
  '80': '#1530A6',
  '90': '#0B2184',
} as const;

// Gray 색상 팔레트
export const gray = {
  white: '#FFFFFF',
  '05': '#F2F2F2',
  '10': '#E4E4E4',
  '20': '#D4D3D3',
  '30': '#C7C7C7',
  '40': '#ABABAB',
  '50': '#919191',
  '60': '#777777',
  '70': '#5F5F5F',
  '80': '#333333',
  '90': '#1C1C1C',
  black: '#000000',
} as const;

// Red 색상 팔레트
export const red = {
  '05': '#FDD7DC',
  '10': '#F797A4',
  '20': '#F4677A',
  '30': '#F03851', // Error color
  '40': '#E4112E',
  '50': '#B40E24',
  '60': '#850A1B',
} as const;

// Green 색상 팔레트
export const green = {
  '05': '#D3F3E0',
  '10': '#92E6B9',
  '20': '#15D66F',
  '30': '#12B75F', // Success color
  '40': '#109C51',
  '50': '#0E723C',
  '60': '#084424',
} as const;

// Yellow 색상 팔레트
export const yellow = {
  '05': '#FFE499',
  '10': '#FFD666',
  '20': '#FFC933',
  '30': '#FFB300',
  '40': '#EBA500',
  '50': '#D69600',
  '60': '#B27D00',
} as const;

// Cool Gray 색상 팔레트
export const coolGray = {
  '01': '#F8F8FA',
  '05': '#F6F6F9',
  '10': '#EDEEF2',
  '20': '#DDDFE5',
  '30': '#D2D4DD',
  '40': '#C7C9D5',
  '50': '#BBBECD',
  '60': '#B0B3C4',
} as const;

// Gradient 색상
export const gradient = {
  primary: 'linear-gradient(135deg, #6DA5FA 0%, #92EAF5 100%)',
  skeleton: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 48.5%, rgba(255,255,255,0) 100%)',
} as const;

// 다크모드 색상 (라이트모드와 다르게 적용될 색상들)
export const darkMode = {
  // 다크모드에서는 일반적으로 색상이 반전되거나 조정됨
  background: {
    primary: gray.black,
    secondary: gray['90'],
    tertiary: gray['80'],
  },
  text: {
    primary: gray.white,
    secondary: gray['10'],
    tertiary: gray['30'],
  },
  border: {
    primary: gray['70'],
    secondary: gray['60'],
  },
} as const;

// 라이트모드 색상
export const lightMode = {
  background: {
    primary: gray.white,
    secondary: gray['05'],
    tertiary: gray['10'],
  },
  text: {
    primary: gray.black,
    secondary: gray['70'],
    tertiary: gray['50'],
  },
  border: {
    primary: gray['20'],
    secondary: gray['10'],
  },
} as const;

// 시맨틱 색상 (의미에 따른 색상)
export const semantic = {
  primary: {
    light: blue['40'],
    main: blue['50'],
    dark: blue['60'],
  },
  secondary: {
    light: coolGray['20'],
    main: coolGray['30'],
    dark: coolGray['40'],
  },
  success: {
    light: green['20'],
    main: green['30'],
    dark: green['40'],
  },
  error: {
    light: red['20'],
    main: red['30'],
    dark: red['40'],
  },
  warning: {
    light: yellow['20'],
    main: yellow['30'],
    dark: yellow['40'],
  },
} as const;

// 전체 색상 객체
export const colors = {
  blue,
  gray,
  red,
  green,
  yellow,
  coolGray,
  gradient,
  semantic,
  lightMode,
  darkMode,
} as const;

// 타입 정의
export type ColorPalette = typeof colors;
export type BlueColor = keyof typeof blue;
export type GrayColor = keyof typeof gray;
export type RedColor = keyof typeof red;
export type GreenColor = keyof typeof green;
export type YellowColor = keyof typeof yellow;
export type CoolGrayColor = keyof typeof coolGray;
export type SemanticColor = keyof typeof semantic;

// 색상 값 타입
export type ColorValue = string;

// 색상 팔레트 타입
export type ColorPaletteType = {
  [K in string]: ColorValue | { [K2 in string]: ColorValue };
};

// 시맨틱 색상 레벨 타입
export type SemanticLevel = 'light' | 'main' | 'dark';

// 테마 타입
export type Theme = 'light' | 'dark';

/**
 * 색상 접근 헬퍼 함수
 */

/**
 * 시맨틱 색상을 가져오는 헬퍼 함수
 * @param color - 색상 종류 (primary, secondary, success, error, warning)
 * @param level - 색상 레벨 (light, main, dark)
 * @returns 색상 값
 * 
 * @example
 * getSemanticColor('primary', 'main') // '#497CFF'
 * getSemanticColor('error', 'light') // '#F4677A'
 */
export const getSemanticColor = (
  color: SemanticColor,
  level: SemanticLevel = 'main'
): ColorValue => {
  return semantic[color][level];
};

/**
 * 테마별 배경색상을 가져오는 헬퍼 함수
 * @param theme - 테마 (light, dark)
 * @param level - 색상 레벨 (primary, secondary, tertiary)
 * @returns 색상 값
 * 
 * @example
 * getThemeBackgroundColor('dark', 'primary') // '#000000'
 * getThemeBackgroundColor('light', 'secondary') // '#F2F2F2'
 */
export const getThemeBackgroundColor = (
  theme: Theme,
  level: keyof typeof lightMode.background = 'primary'
): ColorValue => {
  const themeColors = theme === 'light' ? lightMode : darkMode;
  return themeColors.background[level];
};

/**
 * 테마별 텍스트색상을 가져오는 헬퍼 함수
 * @param theme - 테마 (light, dark)
 * @param level - 색상 레벨 (primary, secondary, tertiary)
 * @returns 색상 값
 * 
 * @example
 * getThemeTextColor('dark', 'primary') // '#FFFFFF'
 * getThemeTextColor('light', 'secondary') // '#5F5F5F'
 */
export const getThemeTextColor = (
  theme: Theme,
  level: keyof typeof lightMode.text = 'primary'
): ColorValue => {
  const themeColors = theme === 'light' ? lightMode : darkMode;
  return themeColors.text[level];
};

/**
 * 테마별 보더색상을 가져오는 헬퍼 함수
 * @param theme - 테마 (light, dark)
 * @param level - 색상 레벨 (primary, secondary)
 * @returns 색상 값
 * 
 * @example
 * getThemeBorderColor('dark', 'primary') // '#5F5F5F'
 * getThemeBorderColor('light', 'secondary') // '#E4E4E4'
 */
export const getThemeBorderColor = (
  theme: Theme,
  level: keyof typeof lightMode.border = 'primary'
): ColorValue => {
  const themeColors = theme === 'light' ? lightMode : darkMode;
  return themeColors.border[level];
};

/**
 * Blue 색상을 가져오는 헬퍼 함수
 * @param shade - 색상 농도 (05-90)
 * @returns 색상 값
 * 
 * @example
 * getBlueColor('60') // '#3A5CF3'
 */
export const getBlueColor = (shade: BlueColor): ColorValue => blue[shade];

/**
 * Gray 색상을 가져오는 헬퍼 함수
 * @param shade - 색상 농도 (white, 05-90, black)
 * @returns 색상 값
 * 
 * @example
 * getGrayColor('60') // '#777777'
 * getGrayColor('white') // '#FFFFFF'
 */
export const getGrayColor = (shade: GrayColor): ColorValue => gray[shade];

/**
 * Red 색상을 가져오는 헬퍼 함수
 * @param shade - 색상 농도 (05-60)
 * @returns 색상 값
 * 
 * @example
 * getRedColor('30') // '#F03851'
 */
export const getRedColor = (shade: RedColor): ColorValue => red[shade];

/**
 * Green 색상을 가져오는 헬퍼 함수
 * @param shade - 색상 농도 (05-60)
 * @returns 색상 값
 * 
 * @example
 * getGreenColor('30') // '#12B75F'
 */
export const getGreenColor = (shade: GreenColor): ColorValue => green[shade];

/**
 * Yellow 색상을 가져오는 헬퍼 함수
 * @param shade - 색상 농도 (05-60)
 * @returns 색상 값
 * 
 * @example
 * getYellowColor('30') // '#FFB300'
 */
export const getYellowColor = (shade: YellowColor): ColorValue => yellow[shade];

/**
 * Cool Gray 색상을 가져오는 헬퍼 함수
 * @param shade - 색상 농도 (01, 05-60)
 * @returns 색상 값
 * 
 * @example
 * getCoolGrayColor('30') // '#D2D4DD'
 */
export const getCoolGrayColor = (shade: CoolGrayColor): ColorValue => coolGray[shade];

// 기본 export
export default colors;