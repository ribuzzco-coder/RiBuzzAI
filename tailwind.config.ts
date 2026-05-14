import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ribuzz: {
          primary: "#F5F7FA",
          accent: "#E625FF",
          cyan: "#0FEFFD",
          violet: "#5B16E6",
          pink: "#E7B0EE",
          surface: "#0B0B10",
          surface2: "#12131A",
          card: "#181A24",
          card2: "#1D2130",
          muted: "#C7CBD6",
          soft: "#98A0B3"
        },
        score: {
          critico: "#DC2626",     // rojo
          debil: "#F97316",       // naranja
          funcional: "#FACC15",   // amarillo
          fuerte: "#84CC16",      // verde claro
          escalable: "#16A34A"    // verde
        }
      },
      fontFamily: {
        sans: ["var(--font-saira)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-space-grotesk)", "var(--font-saira)", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
