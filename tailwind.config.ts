import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0a0d12",
          elevated: "#11151c",
          panel: "#161b24",
          hover: "#1d2330",
        },
        border: {
          DEFAULT: "#252c3a",
          subtle: "#1d2330",
        },
        fg: {
          DEFAULT: "#e6edf3",
          muted: "#8b95a7",
          subtle: "#5b6577",
        },
        accent: {
          DEFAULT: "#f5a623",
          hover: "#ffb947",
        },
        pos: "#22c55e",
        neg: "#ef4444",
        warn: "#f59e0b",
        info: "#3b82f6",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Inter", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
    },
  },
  plugins: [],
};

export default config;
