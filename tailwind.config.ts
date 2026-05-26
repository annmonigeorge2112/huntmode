import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "brand-primary": "#0f172a",
        "brand-accent": "#3b82f6",
        "brand-success": "#10b981",
        "brand-warning": "#f59e0b",
        "brand-danger": "#ef4444",
      },
    },
  },
  plugins: [],
};

export default config;
