import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        panel: "#f7f8fa",
        line: "#e5e7eb"
      }
    }
  },
  plugins: []
};

export default config;

