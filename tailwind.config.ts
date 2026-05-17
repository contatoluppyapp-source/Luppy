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
        brand: {
          DEFAULT: "#f931ad",
          dark: "#d61d8f",
          light: "#ffe5f3",
          deep: "#7a0f54",
          glow: "#ff5cc0",
        },
        ink: {
          DEFAULT: "#1A1A1A",
          400: "#8A8A8A",
          600: "#4A4A4A",
        },
        surface: "#FAFAFA",
        pastel: "#FFE0EE",
        pastelLight: "#FFEEF6",
        cream: "#FFE0EE",
        border: "#EEEEEE",
      },
      fontFamily: {
        sans: ["var(--font-montserrat)", "Montserrat", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      animation: {
        "pulse-slow": "pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "pulse-slower": "pulse 3.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 6s ease-in-out infinite",
        "subtle-pulse": "subtle-pulse 3s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "subtle-pulse": {
          "0%, 100%": { opacity: "0.85" },
          "50%": { opacity: "1" },
        },
      },
      boxShadow: {
        soft: "0 8px 28px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.03)",
        "soft-pink": "0 12px 36px rgba(249,49,173,0.18), 0 2px 8px rgba(249,49,173,0.08)",
        glow: "0 0 32px rgba(249,49,173,0.28)",
      },
    },
  },
  plugins: [],
};

export default config;
