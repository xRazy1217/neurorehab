import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7F77DD',
          light: '#EEEDFE',
          dark: '#534AB7',
        },
        green: { rehab: '#1D9E75' },
        red: { soft: '#D85A30' },
        bg: '#F5F5FA',
        surface: '#FFFFFF',
        text: {
          DEFAULT: '#1A1A2E',
          muted: '#6B7280',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
      },
      boxShadow: {
        card: '0 2px 12px rgba(0,0,0,0.06)',
      },
      keyframes: {
        fadeSlideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        progressFill: {
          '0%': { 'stroke-dashoffset': '339' },
        },
      },
      animation: {
        'fade-slide-up': 'fadeSlideUp 0.35s ease forwards',
        'progress-fill': 'progressFill 1s ease forwards',
      },
    },
  },
  plugins: [],
}

export default config
