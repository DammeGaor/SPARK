import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["Playfair Display", ...fontFamily.serif],
        sans: ["DM Sans", ...fontFamily.sans],
        mono: ["JetBrains Mono", ...fontFamily.mono],
      },
      colors: {
        maroon: {
          50:  "#fdf2f4",
          100: "#fce7eb",
          200: "#f9b8c4",
          300: "#f4849a",
          400: "#ec4f6b",
          500: "#c0314a",
          600: "#8f1535",
          700: "#731029",
          800: "#560b1e",
          900: "#3a0713",
          950: "#1f0309",
        },
        upgreen: {
          50:  "#f0f7f0",
          100: "#d9eeda",
          200: "#afd8b1",
          300: "#7dbf80",
          400: "#4ea352",
          500: "#2e7d32",
          600: "#1b5e20",
          700: "#154a19",
          800: "#0f3612",
          900: "#09230b",
          950: "#041206",
        },
        parchment: {
          50:  "#fdfaf4",
          100: "#faf3e0",
          200: "#f5e6bc",
          300: "#edd594",
          400: "#e3c06a",
          500: "#d4a843",
        },
      },
      borderRadius: {
        lg: "0.625rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
      boxShadow: {
        card: "0 2px 8px 0 rgba(58, 7, 19, 0.08), 0 1px 2px 0 rgba(58, 7, 19, 0.04)",
        "card-hover": "0 8px 24px 0 rgba(58, 7, 19, 0.14), 0 2px 6px 0 rgba(58, 7, 19, 0.06)",
      },
      typography: {
        DEFAULT: {
          css: {
            fontFamily: "DM Sans, sans-serif",
            h1: { fontFamily: "Playfair Display, serif" },
            h2: { fontFamily: "Playfair Display, serif" },
            h3: { fontFamily: "Playfair Display, serif" },
          },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
  ],
};

export default config;
