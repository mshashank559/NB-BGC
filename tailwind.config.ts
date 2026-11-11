import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#080c14",
        obsidian: "#0B0F17",
        spatial: {
          glass: "rgba(18, 24, 38, 0.72)",
          card: "rgba(22, 30, 48, 0.60)",
          border: "rgba(255, 255, 255, 0.08)",
          hover: "rgba(255, 255, 255, 0.05)",
          active: "rgba(0, 242, 254, 0.15)",
        },
        neon: {
          cyan: "#00F2FE",
          sky: "#38BDF8",
          emerald: "#10B981",
          amber: "#F59E0B",
          rose: "#F43F5E",
          violet: "#8B5CF6",
        },
      },
      backdropBlur: {
        '2xl': "40px",
        '3xl': "60px",
      },
      boxShadow: {
        'spatial-glow': "0 0 35px -5px rgba(0, 242, 254, 0.25)",
        'spatial-card': "0 25px 50px -12px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.12)",
        'glass-inset': "inset 0 1px 1px rgba(255, 255, 255, 0.15)",
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
export default config;

