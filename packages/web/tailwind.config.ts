import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f5ff',
          100: '#dde8ff',
          400: '#6492ff',
          500: '#2b70ef',
          700: '#1a40b5',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'Hiragino Sans',
          'Hiragino Kaku Gothic ProN',
          'Noto Sans JP',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}

export default config
