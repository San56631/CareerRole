import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#19171b",         // page background (was 'paper')
        surface: "#252628",    // card/section background (was 'white')
        gold: "#d29f22",       // primary accent (was 'amber')
        goldDeep: "#B8860B",   // darker gold for hover/text-on-gold
        goldText: "#412402",
        maroon: "#5d0018",     // rare accent — tags, hover, errors
        textPrimary: "#F2EFE9", // main text (was 'ink')
        textSecondary: "#A8A29B", // muted text (was 'slate')
        line: "#3A3730",       // borders on dark backgrounds (was 'line')
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        sans: ["'Inter'", "sans-serif"],
      },
      borderRadius: {
        card: "10px",
      },
    },
  },
  plugins: [],
};
export default config;