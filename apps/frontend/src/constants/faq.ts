import type { FaqCategory, FaqItem, FaqSidebarConfig, FilterableCategoryId } from '../types/faq'

export const FAQ_CATEGORIES: ReadonlyArray<FaqCategory> = [
  { id: 'all', label: 'All Questions' },
  { id: 'orders', label: 'Orders' },
  { id: 'shipping', label: 'Shipping' },
  { id: 'customization', label: 'Customization' },
  { id: 'sustainability', label: 'Sustainability' },
] as const

export const FAQ_CATEGORY_ORDER: ReadonlyArray<FilterableCategoryId> = [
  'orders',
  'shipping',
  'customization',
  'sustainability',
] as const

export const FAQ_CATEGORY_HEADINGS: Readonly<Record<FilterableCategoryId, string>> = {
  orders: 'Orders & Payment',
  shipping: 'Shipping & Returns',
  customization: 'Customization',
  sustainability: 'Sustainability',
}

export const FAQ_ITEMS: ReadonlyArray<FaqItem> = [
  {
    id: 'orders-1',
    question: 'How do I track my recent order?',
    answer:
      `Once your order has been dispatched, you will receive a confirmation email containing a unique tracking number and a link to our logistics partner's portal. Please allow 24–48 hours for the tracking information to update.`,
    categoryId: 'orders',
  },
  {
    id: 'orders-2',
    question: 'What payment methods are accepted?',
    answer:
      'We accept all major credit cards (Visa, Mastercard, American Express), as well as digital wallets including Apple Pay and Google Pay. For bespoke orders exceeding $5,000, bank wire transfers are also available.',
    categoryId: 'orders',
  },
  {
    id: 'shipping-1',
    question: 'Do you ship internationally?',
    answer:
      'Yes, Frames 41 ships to over 50 countries worldwide. International shipping rates and delivery timelines vary by destination and will be calculated at checkout. Please note that customs duties may apply for certain regions.',
    categoryId: 'shipping',
  },
  {
    id: 'shipping-2',
    question: 'What is your return policy for handcrafted items?',
    answer:
      'We offer returns on standard collection items within 14 days of delivery, provided the item is in its original, unused condition. Please note that bespoke and custom-made items are final sale and cannot be returned.',
    categoryId: 'shipping',
  },
  {
    id: 'customization-1',
    question: 'How does the bespoke process work?',
    answer:
      'Our bespoke process begins with a personal consultation to understand your vision. Our artisans then create detailed sketches and material swatches for your approval. Once finalized, production typically takes 6–12 weeks depending on complexity.',
    categoryId: 'customization',
  },
] as const

export const FAQ_SIDEBAR_DEFAULTS: FaqSidebarConfig = {
  workshopImageUrl:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBT_RF6k89fHZ3uXq2BcYCW88BX6kb09If8pBJ9xTXX-H0nyzmwA22hVNw0pri4_OOwJA6j1N5L_ZNjejv-sM-qbnS7QMOjKoArtdHWJ4_nsmUH8bId4maK5GtLuoujvuNEo_Gy1yx6vRCmuFS-_AP7aE7pvKP8rfHSI-Tc8sx1cWmumtp427F9YhcrzwlVcZmOSG8Q6z5SlrHYx-3WkamisrtjcUq7UZq94g3qgjeQX7sFJAunZkMTqUP-HLuRzp4jHKdarQsyiSs',
  workshopImageAlt:
    'Minimalist artisan workshop with natural wood textures and soft morning light — Frames 41 craftsmanship.',
  conciergeHref: 'mailto:concierge@frames41.com',
}
