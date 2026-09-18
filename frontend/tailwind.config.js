/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Lime Frost / Forest Light Theme Tokens
        frost: {
          bg: "#F7FAF7",          // Fresh crisp off-white canvas
          surface: "#FFFFFF",     // Crisp white surface
          card: "#FFFFFF",        // Pure white card
          cardHover: "#F4FDF4",   // Card hover state
          border: "rgba(132, 204, 22, 0.25)", // Frosted lime border
          borderHover: "rgba(132, 204, 22, 0.5)",
          lime: "#84CC16",        // Core vibrant lime
          limeLight: "#A3E635",   // Electric lime
          limeGlow: "#BEF264",    // Bright lime
          limeDark: "#4D7C0F",    // Deep forest lime
          limeMuted: "rgba(132, 204, 22, 0.12)",
          textPrimary: "#0F1711", // Deep obsidian dark text
          textSecondary: "#475569", // Muted slate text
          textMuted: "#64748B",   // Subdued slate gray
        },
        lime: {
          50: '#f7fee7',
          100: '#ecfccb',
          200: '#d9f99d',
          300: '#bef264',
          400: '#a3e635',
          500: '#84cc16',
          600: '#65a30d',
          700: '#4d7c0f',
          800: '#3f6212',
          900: '#365314',
          950: '#1a2e05',
        }
      },
      boxShadow: {
        'lime-glow': '0 0 25px -3px rgba(132, 204, 22, 0.25)',
        'lime-sm': '0 2px 10px rgba(132, 204, 22, 0.15)',
        'frost-card': '0 4px 20px -2px rgba(15, 23, 17, 0.06)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      }
    },
  },
  plugins: [],
}

