import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      container: {
        center: true,
        padding: {
          DEFAULT: "1rem",
          sm: "2rem",
          md: "3rem",
          lg: "4rem",
        },
      },
      colors: {
        primary: "#0ea5e9",
        "primary-dark": "#0369a1",
        "primary-light": "#7dd3fc",
        dark: "#222831",
        light: "#F5F5F5",
      },
      height: {
        100: "30rem",
      },
      keyframes: {
        rotate: {
          "100%": { transform: "rotate(360deg)" },
        },
        dash: {
          "0%": {
            strokeDasharray: "1, 150",
            strokeDashoffset: "0",
          },
          "50%": {
            strokeDasharray: "90, 150",
            strokeDashoffset: "-35",
          },
          "100%": {
            strokeDasharray: "90, 150",
            strokeDashoffset: "-124",
          },
        },
      },
      animation: {
        rotate: "rotate 2s linear infinite",
        dash: "dash 1.5s ease-in-out infinite",
      },
    },
  },
  darkMode: "class",
  variants: {
    extend: {},
  },
  plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms")],
};
export default config;
