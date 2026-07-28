interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  order_id: string
  name?: string
  description?: string
  prefill?: { name?: string; email?: string; contact?: string }
  theme?: { color?: string }
  modal?: { ondismiss?: () => void }
  handler?: (response: {
    razorpay_payment_id: string
    razorpay_order_id: string
    razorpay_signature: string
  }) => void
}

declare interface Window {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Razorpay: new (options: RazorpayOptions) => { open(): void; close(): void }
}
