import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://ariake-events.pages.dev'),
  title: '有明イベント情報',
  description: '有明エリア5施設のイベント情報をまとめてチェック。コンサート・展示会・スポーツ観戦の混雑予報。',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.ico', type: 'image/x-icon' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    title: '有明イベント情報',
    description: '有明エリア5施設のイベント情報をまとめてチェック。',
    images: [{ url: '/ogp.png', width: 1200, height: 630, alt: '有明イベント情報' }],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '有明イベント情報',
    description: '有明エリア5施設のイベント情報をまとめてチェック。',
    images: ['/twitter-image.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=block"
          rel="stylesheet"
        />
      </head>
      <body className="bg-white font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
