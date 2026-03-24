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
        brand: {
          50: '#f0faf5',
          100: '#dcf4e8',
          200: '#bbe9d4',
          300: '#88d8b4',
          400: '#4dbf8c',
          500: '#2D9B6F',
          600: '#228055',
          700: '#1c6645',
          800: '#195239',
          900: '#154430',
        },
        green: {
          DEFAULT: '#2D9B6F',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
      },
    },
  },
  plugins: [],
}

export default config
