import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://kannohi1.github.io'),
  title: '有明イベント情報',
  description: '有明エリア5施設のイベント情報をまとめてチェック。コンサート・展示会・スポーツ観戦の混雑予報。',
  openGraph: {
    title: '有明イベント情報',
    description: '有明エリア5施設のイベント情報をまとめてチェック。',
    images: ['/ariake-events/ogp.png'],
    locale: 'ja_JP',
    type: 'website',
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
