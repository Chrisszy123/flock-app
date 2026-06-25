/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep church-inspired colors with a modern twist
        primary: {
          50: '#fdf4f3',
          100: '#fce8e6',
          200: '#f9d5d1',
          300: '#f4b5ae',
          400: '#ec8a7f',
          500: '#e05d4e',
          600: '#cc4234',
          700: '#ab3428',
          800: '#8d2e25',
          900: '#752c25',
          950: '#40130f',
        },
        secondary: {
          50: '#f5f7fa',
          100: '#ebeef3',
          200: '#d2dbe5',
          300: '#aabbcf',
          400: '#7c96b4',
          500: '#5b799b',
          600: '#476181',
          700: '#3a4f69',
          800: '#334358',
          900: '#2e3a4b',
          950: '#1e2631',
        },
        accent: {
          50: '#fefbec',
          100: '#faf3c9',
          200: '#f5e68f',
          300: '#f0d454',
          400: '#ebc225',
          500: '#dba817',
          600: '#bd8211',
          700: '#9c5f11',
          800: '#814b15',
          900: '#6d3e17',
          950: '#3f1f09',
        },
        dark: {
          50: '#f6f6f7',
          100: '#e3e3e5',
          200: '#c6c6cb',
          300: '#a2a2a9',
          400: '#7d7d87',
          500: '#62626c',
          600: '#4e4e56',
          700: '#404047',
          800: '#36363b',
          900: '#1a1a1d',
          950: '#0d0d0e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'elevated': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
