import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff4ee',
          100: '#ffe0cc',
          400: '#f57c3a',
          500: '#ec5b13',
          700: '#c94d0e',
        },
      },
      fontFamily: {
        sans: [
          'var(--font-public-sans)',
          'var(--font-noto-sans-jp)',
          'Hiragino Sans',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}

export default config
