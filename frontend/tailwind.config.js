/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fintech: {
          bg: "#090D16",
          card: "#111827",
          cardHover: "#162032",
          border: "#1E293B",
          accent: "#2563EB",
          accentHover: "#1D4ED8",
          success: "#10B981",
          warning: "#F59E0B",
          danger: "#EF4444",
          textPrimary: "#F8FAFC",
          textSecondary: "#94A3B8",
          textMuted: "#64748B",
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
