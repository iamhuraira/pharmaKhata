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
        // Pharma Khata Landing Page Color Scheme
        primary: "#00d37f", // Vibrant green for primary actions
        primaryDark: "#00b86a", // Darker green for hover states
        primaryDarker: "#009d5a", // Even darker for active states
        secondary: "#81C784", // Light green for secondary elements
        primaryLighter: '#e8f8f0', // Very light green for backgrounds
        success: "#00d37f", // Same as primary for consistency
        warning: "#fbb324", // Keep existing warning color
        schedule: "#28A745", // Keep existing schedule color
        dark: "#1a1a1a", // Deep almost black for headlines
        light: "#6b7280", // Softer gray for body text
        subtle: "#9ca3af", // Light gray for subtle text
        subtleBg: "#f8fafc", // Very light off-white/gray background
        lightBg: "#fafcfe", // Pure light background
        danger: "#F32013", // Keep existing danger color
        primaryLight: "#e8f8f0", // Light primary background
        "background-gradient":
          "linear-gradient(0deg, rgba(0, 211, 127, 0.08) 0%, rgba(0, 211, 127, 0.08) 100%), #FAFCFE",
        card: {
          DEFAULT: "#ffffff", // Pure white for cards
          foreground: "#1a1a1a", // Dark text on white
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
          DEFAULT: "#00d37f", // Use primary green for accent
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "#dc3545",
          foreground: "#ffffff",
        },
        border: "#e5e7eb", // Very light gray for borders
        input: "#ffffff",
        ring: "#00d37f", // Primary green for focus rings
        chart: {
          "1": "#00d37f", // Primary green
          "2": "#28a745", // Success green
          "3": "#ffc107", // Warning yellow
          "4": "#17a2b8", // Info blue
          "5": "#6f42c1", // Purple
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
