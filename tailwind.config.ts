import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  "#86C232",
          100: "#61892F",
          200: "#6B6E70",
          300: "#222629",
          400: "#999999",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
