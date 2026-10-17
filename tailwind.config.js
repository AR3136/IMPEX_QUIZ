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
          dark: '#0A1128',
          card: '#101F42',
          cardHover: '#162854',
          navy: '#001F54',
          accent: '#00E5FF',
          accentHover: '#00B4D8',
          amber: '#FF9100',
          amberHover: '#FF6D00',
          success: '#00E676',
          error: '#FF5252',
          border: 'rgba(0, 229, 255, 0.15)',
          muted: '#94A3B8',
          light: '#F8FAFC'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -4px rgba(0, 229, 255, 0.45)',
        'glow-amber': '0 0 25px -4px rgba(255, 145, 0, 0.45)',
        'card-dark': '0 10px 30px -5px rgba(0, 0, 0, 0.5), 0 0 1px 1px rgba(255, 255, 255, 0.05)'
      }
    },
  },
  plugins: [],
}
