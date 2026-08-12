import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Token names kept (pro*) so shared component classes don't break; values = OFFICIAL Umevio brand
      colors: {
        proTeal: "#D94F3D",       // rouge/coral (primary accent)
        proTealLight: "#E2654F",  // lighter rouge (hover)
        proTealPale: "#F6E7E2",   // warm pale rouge (card bg)
        proCream: "#FAF6F0",      // paper background
        proDark: "#141010",       // ink
        proDarkMid: "#2A1F12",    // warm surface
        proDarkLight: "#231610",
        proMuted: "#A89880",      // warm muted text
        proGold: "#E8A838",       // turmeric
        proCoral: "#5C7A5F",      // sage (repurposed secondary)
      },
      fontFamily: {
        outfit: ["var(--font-outfit)", "sans-serif"],
        dmserif: ["var(--font-dmserif)", "serif"],
      },
      maxWidth: {
        page: "480px",
      },
    },
  },
  plugins: [],
};

export default config;
