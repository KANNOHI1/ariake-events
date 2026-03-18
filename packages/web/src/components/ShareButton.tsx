'use client'

import { useState } from 'react'

interface Props {
  title: string
  text: string
  url: string
}

export default function ShareButton({ title, text, url }: Props) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text, url })
        return
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }
    // Fallback: copy to clipboard
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleShare}
      className="mt-2 text-xs text-slate-500 hover:text-slate-700 cursor-pointer flex items-center gap-1"
      aria-label="シェア"
    >
      {copied ? (
        <span className="text-primary-500">コピーしました ✓</span>
      ) : (
        <span>シェア</span>
      )}
    </button>
  )
}
