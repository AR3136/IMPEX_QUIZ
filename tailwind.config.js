/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        imtex: {
          teal: '#142629',
          dark: '#142629',
          card: '#182F33',
          cardHover: '#1E3B40',
          cardDark: '#101F22',
          gold: '#E9C66F',
          goldHover: '#DFBA5F',
          goldLight: '#F5E4B3',
          accent: '#E9C66F',
          accentHover: '#DFBA5F',
          textWhite: '#F5F5F5',
          textMuted: '#D9E0E1',
          charcoal: '#202B2E',
          darkText: '#202B2E',
          white: '#FFFFFF',
          border: 'rgba(233, 198, 111, 0.3)',
          borderSolid: '#E9C66F',
          success: '#10B981',
          error: '#EF4444',
          warning: '#F59E0B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      boxShadow: {
        'glow-gold': '0 0 25px -4px rgba(233, 198, 111, 0.45)',
        'glow-gold-sm': '0 0 12px -2px rgba(233, 198, 111, 0.35)',
        'card-dark': '0 10px 30px -5px rgba(0, 0, 0, 0.5), 0 0 1px 1px rgba(233, 198, 111, 0.15)',
        'card-gold': '0 10px 30px -5px rgba(20, 38, 41, 0.6), 0 0 0 1px rgba(233, 198, 111, 0.3)'
      }
    },
  },
  plugins: [],
}
