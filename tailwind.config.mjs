/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"] },
      colors: {
        ink: "#101828",
        muted: "#667085",
        brand: { 50: "#eff6ff", 100: "#dbeafe", 500: "#3478f6", 600: "#2563eb", 700: "#1d4ed8" }
      },
      boxShadow: {
        soft: "0 8px 30px rgba(16,24,40,.06)",
        lift: "0 18px 50px rgba(16,24,40,.10)"
      }
    }
  },
  plugins: []
};