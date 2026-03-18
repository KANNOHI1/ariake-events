import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://kannohi1.github.io'),
  title: '有明イベント情報',
  description: '有明エリア5施設のイベント情報をまとめてチェック。コンサート・展示会・スポーツ観戦の混雑予報。',
  icons: {
    icon: [
      { url: '/ariake-events/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/ariake-events/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/ariake-events/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/ariake-events/favicon.ico', type: 'image/x-icon' },
    ],
    apple: [{ url: '/ariake-events/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    title: '有明イベント情報',
    description: '有明エリア5施設のイベント情報をまとめてチェック。',
    images: [{ url: '/ariake-events/ogp.png', width: 1200, height: 630, alt: '有明イベント情報' }],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '有明イベント情報',
    description: '有明エリア5施設のイベント情報をまとめてチェック。',
    images: ['/ariake-events/twitter-image.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
