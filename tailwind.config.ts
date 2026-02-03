import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        void: "#0a0e14",
        muted: "#8892a6",
        ethereal: "rgba(255, 255, 255, 0.1)",
        "ethereal-strong": "rgba(255, 255, 255, 0.15)",
        cyan: "#06b6d4",
        glass: "rgba(12, 14, 20, 0.6)",
      },
    },
  },
  plugins: [],
};

export default config;
