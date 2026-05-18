/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./data/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#171717",
        accent: "#FF7A29",
        "accent-bright": "#FFB570",
        "accent-glow": "#FFA84A",
        surface: "#1e1e1e",
        "surface-warm": "#1a1814",
        "text-primary": "#FFFFFF",
        "text-secondary": "#888888",
      },
      fontFamily: {
        display: ["Bonbon", "cursive"],
        body: ["DM Sans", "sans-serif"],
        retro: ["VT323", "monospace"],
      },
      transitionTimingFunction: {
        cinematic: "cubic-bezier(0.16, 1, 0.3, 1)",
        scroll: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      },
    },
  },
  plugins: [],
};
