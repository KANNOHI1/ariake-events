import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff0f3',
          100: '#ffd6de',
          400: '#ff6b83',
          500: '#ff385c',
          700: '#e00b41',
        },
        'near-black': '#222222',
      },
      fontFamily: {
        sans: [
          'Nunito',
          '"Noto Sans JP"',
          'Hiragino Sans',
          'sans-serif',
        ],
      },
      borderRadius: {
        '2xl': '20px',
      },
      boxShadow: {
        'airbnb-card':
          'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px',
        'airbnb-card-hover':
          'rgba(0,0,0,0.04) 0px 0px 0px 1px, rgba(0,0,0,0.08) 0px 4px 12px, rgba(0,0,0,0.14) 0px 8px 20px',
        'airbnb-popover': 'rgba(0,0,0,0.08) 0px 4px 12px',
      },
    },
  },
  plugins: [],
}

export default config
