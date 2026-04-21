/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'serif'],
      },
      colors: {
        ink: {
          50: '#f7f7f8',
          100: '#eeeef1',
          200: '#d9d9e0',
          300: '#b8b8c3',
          400: '#8e8e9e',
          500: '#6b6b7b',
          600: '#4f4f5d',
          700: '#393944',
          800: '#252530',
          900: '#14141c',
          950: '#0a0a12',
        },
        accent: {
          DEFAULT: '#6366f1',
          hover: '#5558e3',
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
      },
      keyframes: {
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
