import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    fontFamily: {
      'noto-urdu': ['Noto Naskh Arabic', 'sans-serif'],
    },
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        primary: "#4CAF50",
        primaryDark: "#449e48",
        primaryDarker: "#3d8c40",
        secondary: "#81C784",
        primaryLighter: '#DBEFDC',
        success: "#00d37f",
        warning: "#fbb324",
        schedule: "#28A745",
        dark: "#252525",
        light: "#606060",
        subtle: "#9e9e9e",
        subtleBg: "#ecf1f4",
        lightBg: "#fafcfe",
        danger: "#F32013",
        primaryLight: "#6E51D929",
        "background-gradient":
          "linear-gradient(0deg, rgba(110, 81, 217, 0.08) 0%, rgba(110, 81, 217, 0.08) 100%), #FAFCFE",
        card: {
          DEFAULT: "#ffffff",
          foreground: "#1a1a1a",
        },
        popover: {
          DEFAULT: "#f8f9fa",
          foreground: "#212529",
        },
        muted: {
          DEFAULT: "#e9ecef",
          foreground: "#6c757d",
        },
        accent: {
          DEFAULT: "#007bff",
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "#dc3545",
          foreground: "#ffffff",
        },
        border: "#dee2e6",
        input: "#ffffff",
        ring: "#80bdff",
        chart: {
          "1": "#007bff",
          "2": "#28a745",
          "3": "#ffc107",
          "4": "#17a2b8",
          "5": "#6f42c1",
        },
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        urdu: ['UrduFont', 'sans-serif'],
      },
      fontSize: {
        base: ["1rem", { lineHeight: "1.5rem" }], // Base font size of 1rem (16px)
      },
      boxShadow: {
        card: "0px 2px 8px 0px rgba(158, 158, 158, 0.24)", // Custom shadow
      },
      screens: {
        xs: "375px",
        sm: "576px",
        md: "768px",
        "x-md": "860px",
        lg: "992px",
        "x-lg": "1070px",
        "xx-lg": "1200px",
        "3x-lg": "1300px",
        "4x-lg": "1450px",
        "3xl": "1630px",
      },
    },
  },
  variants: {
    extend: {
      backgroundColor: ["hover", "active", "disabled"], // Extend state variants for background color
      cursor: ["disabled"], // Extend state variants for cursor
      borderWidth: ["focus"], // Extend border-width variant for focus state
      borderColor: ["focus"], // Extend border-color variant for focus state
      outline: ["focus"], // Extend outline variant for focus state
      placeholderColor: ["focus"],
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
