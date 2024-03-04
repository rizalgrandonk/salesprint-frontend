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
          DEFAULT: "0.75rem",
          lg: "1rem",
        },
      },
      colors: {
        primary: "#14b8a6",
        "primary-dark": "#0f766e",
        "primary-light": "#5eead4",
        dark: "#222831",
        light: "#F5F5F5",
      },
      fontSize: {
        xxs: ["10px", "12px"],
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
