import { useState } from 'react'
import Icon from '../ui/Icon'

interface OrderTrackingHeaderProps {
  orderNumber: string
  awbNumber: string
}

export default function OrderTrackingHeader({ orderNumber, awbNumber }: OrderTrackingHeaderProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(awbNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API unavailable — silent fail; user can copy manually
    }
  }

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
      <div>
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 mb-4 text-label-sm uppercase tracking-widest text-secondary">
          <span>Account</span>
          <Icon name="chevron_right" className="text-[14px]" />
          <span className="text-on-surface font-bold">Order {orderNumber}</span>
        </nav>
        <h1 className="font-headline-lg text-display-xl text-[#111110]">Track Your Order</h1>
      </div>

      <div className="flex flex-col items-start md:items-end">
        <p className="font-label-bold text-secondary mb-1">AWB TRACKING NUMBER</p>
        <div className="flex items-center gap-3">
          <span className="font-body-lg font-bold text-[#111110]">{awbNumber}</span>
          <button
            type="button"
            onClick={handleCopy}
            aria-label={copied ? 'Copied to clipboard' : 'Copy AWB tracking number'}
            className="material-symbols-outlined text-primary hover:opacity-70 transition-opacity"
          >
            {copied ? 'check' : 'content_copy'}
          </button>
        </div>
      </div>
    </div>
  )
}
