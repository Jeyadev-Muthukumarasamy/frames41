import type { PaymentMethod, PaymentOrderSummary, TrustBadge } from '../types/payment'

export const ACTIVE_FORM_ID = 'active-payment-form'

export const PAYMENT_METHODS: ReadonlyArray<PaymentMethod> = [
  {
    id: 'razorpay',
    label: 'Razorpay Secure Checkout',
    description: 'UPI, cards, netbanking and wallets',
    icon: 'verified_user',
  },
  {
    id: 'upi',
    label: 'UPI / QR',
    description: 'Google Pay, PhonePe, Paytm & more',
    icon: 'account_balance_wallet',
  },
  {
    id: 'card',
    label: 'Cards',
    description: 'Visa, Mastercard, RuPay, Amex',
    icon: 'credit_card',
  },
  {
    id: 'netbanking',
    label: 'Netbanking',
    description: 'All major Indian banks',
    icon: 'account_balance',
  },
  {
    id: 'wallet',
    label: 'Wallets',
    description: 'Mobikwik, Freecharge & more',
    icon: 'wallet',
  },
  {
    id: 'cod',
    label: 'Cash on Delivery',
    description: 'Pay in cash when your order arrives',
    icon: 'payments',
  },
] as const

export const ORDER_SUMMARY: PaymentOrderSummary = {
  product: {
    collection: 'Frames41 Collection',
    name: 'Hand-Carved Teak Occasional Chair',
    qty: 1,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC3Gda7wmMvGB5XZb9EzcLC_sZ73hBwLkcPWMAkFpix9sjoWB4BXtPaAEgOncelJ4GMwE9r0OujnPzrk71ui7BxAtpw-NZuWNHhgwXV95RQ6f-jS2ASoSoQccAp_cSMBTmde-yxzmaq-v9b2vptNSVT_gHjqNSeo7ez6WNADFfuFnJ7F3TQD6hPH9uxZiF2SCGKEnWYVxWKp2o-QWV3HJ-wAfXtSNwU5RAwsDsEF2zoADkI8I4y8gJ300M0qfYdP3xqbOxJ-q-aJug',
    imageAlt: 'Hand-Carved Teak Occasional Chair — Frames41 Collection',
  },
  lineItems: [
    { label: 'Subtotal', value: '₹42,500' },
    { label: 'Shipping', value: 'Free', isFree: true },
    { label: 'Estimated Taxes', value: '₹7,650' },
  ],
  totalLabel: 'Total',
  totalValue: '₹50,150',
}

export const TRUST_BADGES: ReadonlyArray<TrustBadge> = [
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlfkwI0-FiYw6RrkEFyksnnfFCFPBvIdVSUjUqFzjDa--j7cfrVhglQQ23opFFENuGYf_qdhryUGc3olsEnY7fkfqupEFbedRuvm6gIPYa6HLKf4dqkAMI44xKE6Rd0X58KtxS_7dWx125-fwQ-J7fZUPs-a5HOH87rfTOGfjLFo8v5w8_goly-yr97kG9RHEDEK1A7cjHw99bBKsOpvaUwXldf4a4rlnh1OW_nIKAQm0yrq8tUzaSq7JEL0hSYm4U8I0tiyiEyRs',
    alt: 'PayPal',
    className: 'h-4',
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC6Y_uBm27xKRmoIr-bbAQODqO-mO3Z6YH8XLPHDvhuowXiiA9_G8fjnm2N0F9SzmKiU0-fllQDYd29rtawPXaeY_RP_qC79qeLPx-8KXRM_v3r3FId8kwS7feYI7hjbqr_6hk6n-V_Tc93L4Lw0ehSYl1mr6W3UpxfJYGTqIah7gW64ZsqWXLqLElYYZkqROLT9vqzCBS3oo8R33xyxqGvEqkBX19W9_4WsH-SI7n19JZPwRIzitEc0eeZsq8KNZi-sm8ZSupfaJQ',
    alt: 'Visa',
    className: 'h-3',
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJ6dsXlCFfMF2LNp_8Pgctb3w71ZVpIxotrTuOeiA0xcX4qn1oDv42O7ArETfy79E4fFLQn0Pa-K0z-PTCJYptisE9xvYI0DYJsvYj-pOzUXYFQkkxycSTYx5DzL06tCqsuts5othoAlT_fbU0dY-twk3qlAbqmxYPz25ZWuvECk1PHU0Z3WBc9iUdXyochlKiSPS0sdugT0scyOGWX64yMPdk-OM1GFu-zY2tOrleU42k0bgRhcssAc8MYHHHujr_yCfZ-CEArkI',
    alt: 'Mastercard',
    className: 'h-6',
  },
] as const
