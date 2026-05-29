import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#070A12",
        panel: "#101624",
        mist: "#B7C5D9",
        lime: "#B7F36B",
        coral: "#FF7A6E"
      },
      boxShadow: {
        glow: "0 20px 80px rgba(183, 243, 107, 0.14)",
        card: "0 24px 90px rgba(0, 0, 0, 0.35)"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
