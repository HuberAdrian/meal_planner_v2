import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          100:  "#86C232",
          200: "#61892F",
          300: "#6B6E70",
          400: "#222629",
          500: "#999999",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
