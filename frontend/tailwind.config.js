/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#149B9C",
        brandTeal: "#149B9C",
        brandTealDark: "#0F7C7D",
        brandNavy: "#1A2B48",
        secondary: "#FF5A5F",
        success: "#28A745",
        warning: "#FFC107",
        error: "#DC3545",
        background: "#FFFFFF",
        surface: "#F8F9FA",
        utilityBar: "#F1F3F5",
        textPrimary: "#1A2B48",
        textSecondary: "#757575",
        border: "#E9ECEF",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.45s ease-out forwards',
      },
    },
  },
  plugins: [],
}
