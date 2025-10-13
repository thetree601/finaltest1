import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Background Colors
        background: "var(--background)",
        "background-secondary": "var(--background-secondary)",
        "background-tertiary": "var(--background-tertiary)",
        
        // Text Colors
        foreground: "var(--foreground)",
        "foreground-secondary": "var(--foreground-secondary)",
        "foreground-tertiary": "var(--foreground-tertiary)",
        
        // Border Colors
        border: "var(--border)",
        "border-secondary": "var(--border-secondary)",
        
        // Blue Colors
        blue: {
          "05": "var(--blue-05)",
          "10": "var(--blue-10)",
          "20": "var(--blue-20)",
          "30": "var(--blue-30)",
          "40": "var(--blue-40)",
          "50": "var(--blue-50)",
          "60": "var(--blue-60)",
          "70": "var(--blue-70)",
          "80": "var(--blue-80)",
          "90": "var(--blue-90)",
        },
        
        // Gray Colors
        gray: {
          white: "var(--gray-white)",
          "05": "var(--gray-05)",
          "10": "var(--gray-10)",
          "20": "var(--gray-20)",
          "30": "var(--gray-30)",
          "40": "var(--gray-40)",
          "50": "var(--gray-50)",
          "60": "var(--gray-60)",
          "70": "var(--gray-70)",
          "80": "var(--gray-80)",
          "90": "var(--gray-90)",
          black: "var(--gray-black)",
        },
        
        // Red Colors
        red: {
          "05": "var(--red-05)",
          "10": "var(--red-10)",
          "20": "var(--red-20)",
          "30": "var(--red-30)",
          "40": "var(--red-40)",
          "50": "var(--red-50)",
          "60": "var(--red-60)",
        },
        
        // Green Colors
        green: {
          "05": "var(--green-05)",
          "10": "var(--green-10)",
          "20": "var(--green-20)",
          "30": "var(--green-30)",
          "40": "var(--green-40)",
          "50": "var(--green-50)",
          "60": "var(--green-60)",
        },
        
        // Yellow Colors
        yellow: {
          "05": "var(--yellow-05)",
          "10": "var(--yellow-10)",
          "20": "var(--yellow-20)",
          "30": "var(--yellow-30)",
          "40": "var(--yellow-40)",
          "50": "var(--yellow-50)",
          "60": "var(--yellow-60)",
        },
        
        // Cool Gray Colors
        "cool-gray": {
          "01": "var(--cool-gray-01)",
          "05": "var(--cool-gray-05)",
          "10": "var(--cool-gray-10)",
          "20": "var(--cool-gray-20)",
          "30": "var(--cool-gray-30)",
          "40": "var(--cool-gray-40)",
          "50": "var(--cool-gray-50)",
          "60": "var(--cool-gray-60)",
        },
        
        // Semantic Colors
        primary: {
          light: "var(--primary-light)",
          main: "var(--primary-main)",
          dark: "var(--primary-dark)",
        },
        
        secondary: {
          light: "var(--secondary-light)",
          main: "var(--secondary-main)",
          dark: "var(--secondary-dark)",
        },
        
        success: {
          light: "var(--success-light)",
          main: "var(--success-main)",
          dark: "var(--success-dark)",
        },
        
        error: {
          light: "var(--error-light)",
          main: "var(--error-main)",
          dark: "var(--error-dark)",
        },
        
        warning: {
          light: "var(--warning-light)",
          main: "var(--warning-main)",
          dark: "var(--warning-dark)",
        },
      },
      backgroundImage: {
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-skeleton': 'var(--gradient-skeleton)',
      },
    },
  },
  plugins: [],
};
export default config;
