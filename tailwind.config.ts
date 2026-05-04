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
        ink: "#2a2520",
        paper: "#f4ede0",
        "paper-2": "#ebe3d2",
        rule: "#8a7a60",
        "rule-light": "#d8cdb8",
        mute: "#5a5147",
        accent: "#c2410c",
        clay: "#8b5a3c",
      },
      fontFamily: {
        serif: ['"Source Serif 4"', "Georgia", "serif"],
        sans: ['"Inter Tight"', "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.025em",
        caps: "0.12em",
        "caps-wide": "0.15em",
      },
      borderWidth: {
        hair: "0.5px",
        rule: "1.5px",
      },
    },
  },
  plugins: [],
  corePlugins: {
    borderRadius: false,
    boxShadow: false,
  },
};

export default config;
