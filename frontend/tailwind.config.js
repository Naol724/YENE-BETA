/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0066CC",
        secondary: "#FF5A5F",
        success: "#28A745",
        warning: "#FFC107",
        error: "#DC3545",
        background: "#FFFFFF",
        surface: "#F8F9FA",
        textPrimary: "#1A1A1A",
        textSecondary: "#6C757D",
        border: "#E9ECEF",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
