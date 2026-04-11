import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        garden: {
          green: { dark: "#1B4332", DEFAULT: "#2D6A4F", light: "#52B788", pale: "#D8F3DC" },
          earth: { dark: "#6B4226", DEFAULT: "#A0785A", light: "#D4A373", pale: "#FEFAE0" },
          sky: { DEFAULT: "#219EBC", light: "#8ECAE6", pale: "#E0F4FF" },
          sun: { DEFAULT: "#FFB703", light: "#FDD85D" },
          bloom: { DEFAULT: "#E07A5F", light: "#F2B5A3" },
          cream: "#FEFDF8",
        },
      },
      fontFamily: {
        heading: ["Georgia", "serif"],
        body: ["system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
