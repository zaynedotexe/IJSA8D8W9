import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        void: "#000000",
        coal: "#0a0a0a",
        charcoal: "#111111",
        smoke: "#1a1a1a",
        ash: "#2a2a2a",
        line: "#262626",
        fog: "#a3a3a3",
        mist: "#737373",
        bone: "#ffffff"
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "Helvetica", "Arial", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"]
      }
    }
  },
  plugins: []
};

export default config;
