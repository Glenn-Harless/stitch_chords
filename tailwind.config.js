/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "signal": {
          "cyan": "#00d4ff",
          "dark": "#081020",
          "card": "#121b2e",
          "light": "#ffffff",
        },
        // Aliases for easier use
        "primary": "#00d4ff",
        "background-dark": "#081020",
        "card-dark": "#121b2e",
      },
      fontFamily: {
        "display": ["Space Grotesk", "monospace"]
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem"
      },
    },
  },
  plugins: [],
}
