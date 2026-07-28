import { useState, useCallback, useEffect, useRef } from 'react'
import Icon from '../ui/Icon'

interface ReferCodeBoxProps {
  code: string
}

export default function ReferCodeBox({ code }: ReferCodeBoxProps) {
  const [copied, setCopied] = useState(false)
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current)
    }
  }, [])

  const writeToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      resetTimerRef.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard API unavailable — silent fail
    }
  }, [])

  const handleCopy = useCallback(() => {
    void writeToClipboard(code)
  }, [code, writeToClipboard])

  const handleShare = useCallback(async () => {
    const shareData = {
      title: 'Join Frames 41',
      text: `Use my referral code ${code} to get exclusive artisanal credit on your first purchase.`,
    }
    if (typeof navigator.share === 'function' && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData)
      } catch {
        // share cancelled or failed
      }
    } else {
      void writeToClipboard(code)
    }
  }, [code, writeToClipboard])

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex-grow bg-surface-container-lowest border border-outline-variant px-6 py-4 flex items-center justify-between">
        <span className="font-label-bold text-lg tracking-widest uppercase text-on-background select-all">
          {code}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? 'Referral code copied to clipboard' : 'Copy referral code'}
          className="text-primary hover:opacity-70 transition-opacity ml-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary rounded-sm"
        >
          <Icon name={copied ? 'check' : 'content_copy'} />
        </button>
      </div>

      <button
        type="button"
        onClick={() => void handleShare()}
        aria-label="Share your referral code"
        className="bg-primary text-on-primary px-8 py-4 font-label-bold text-label-bold uppercase hover:opacity-90 transition-opacity flex items-center justify-center gap-2 whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Share Now
        <Icon name="share" className="text-[18px]" aria-hidden />
      </button>
    </div>
  )
}
