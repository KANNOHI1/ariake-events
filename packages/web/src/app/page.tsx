import { Suspense } from 'react'
import HomeContent from './HomeContent'

export default function Home() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-slate-500">読み込み中...</div>}>
      <HomeContent />
    </Suspense>
  )
}
