import type { OrderDetails, OrderStep, RecommendedProduct } from '../types/order'

export const ORDER_DETAILS: OrderDetails = {
  orderNumber: '#VK-882910',
  estimatedDelivery: 'Oct 24 – Oct 28',
  shippingMethod: 'Bespoke Courier Delivery',
  subtotalInr: 280,
  shippingCostInr: 'complimentary',
  totalInr: 280,
  items: [
    {
      id: 'terracotta-vessel',
      name: 'The Terracotta Vessel',
      description: 'Hand-thrown ceramic, Matte finish',
      priceInr: 280,
      quantity: 1,
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDbG7c2cLADv640PfaoJXOgoRt17ThaURnfXqJCPp5NG6lVVCC0o8nSi84IXdUpScjauHdy6CQKvzs9DOdvoe_IPbkQ7awvU9oNEuvLfyhbRMR_4tb0dduYr5y8xD43IJGZIPRvXeoYKOmbfFQLa9o0IQRgufLCtePOZyfczTze4MlR3naalY6O1mnE2ckhDj6Th0013x0BKyJfntBq0h38aFmZ6EW-zgFA4x5zr_zscHZ3DLT06KhgnRCW5FCoMjuDaBZvyf2HDdo',
      imageAlt:
        'Close up of a hand-woven terracotta textile with intricate geometric patterns, soft natural lighting highlighting rich organic textures.',
    },
  ],
} as const

export const ORDER_STEPS: ReadonlyArray<OrderStep> = [
  {
    id: 'confirmed',
    label: 'Order Confirmed',
    description:
      'We have received your order and payment. A confirmation has been sent to your email.',
    status: 'complete',
  },
  {
    id: 'workshop',
    label: 'Artisan Workshop',
    description:
      'Your order has been sent to our local studio. Each piece is inspected and packaged with care.',
    status: 'active',
  },
  {
    id: 'shipping',
    label: 'Shipping & Logistics',
    description:
      "Once shipped, you'll receive a tracking link to follow your order to your doorstep.",
    status: 'pending',
  },
]

export const RECOMMENDED_PRODUCTS: ReadonlyArray<RecommendedProduct> = [
  {
    id: 'woven-suede-tray',
    slug: 'woven-suede-tray',
    name: 'Woven Suede Tray',
    subtitle: 'Hand-braided leather',
    priceInr: 145,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAl6JQXv84hKIQQ6XDc4GZqLtvKxpf3BWcHnzB1f9AAVzvQiAZoSErq9KfnAT1p2N1AM8dcGQ1pzj6SA4PV2wGp5fFgfMeJAGgHiAEccR28lmSM5KqD131chu20u1F8wTsXGvLddrGd8hOOBbrJnMVYibMcZPJt6DCFaSQbHSrrPExEwYye4mGkcUKXDST2PyNnJeihZ479WwhwPqEFMtxNc5HkuSayy9ZUjktJR8Bon5K4qUqtvMAS3rdFLQZvopUHH11B_jV7y_4',
    imageAlt: 'A minimalist ivory sculpture with fluid organic curves on a raw stone plinth.',
  },
  {
    id: 'orbital-brass-lamp',
    slug: 'orbital-brass-lamp',
    name: 'Orbital Brass Lamp',
    subtitle: 'Limited Edition',
    priceInr: 420,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAmrUoxzcJakPVOzun6IZwjjGNOczcN7av3lH00XPeO1n__mL4nPdwLNLeyBOVSWICAxhdJaYW-Bw1jcdvqadZv8UyBbYWCPRB21G_mOjyuk2-QaS51sF_cHtI-DqxOcNWdplQq9alZach4_YqGnKdRBTppS8qzOzx6jDCdNxPMd_lEI8AGIH7s1RqkAn4cPAdjslo-XKk8yRErjofqoi6X_HRRvDEc2C4AB4bCKNWctsuJbh50IwOqx4SdqJ3O0CnITqZcNQxZR7U',
    imageAlt: 'Modern sculptural lighting fixture of brushed brass and frosted glass.',
  },
  {
    id: 'nocturne-sketch-04',
    slug: 'nocturne-sketch-04',
    name: 'Nocturne Sketch 04',
    subtitle: 'Original Artwork',
    priceInr: 890,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBWfl0sZTYiPXhysQ61W0bi3i50UBFkHPfec3BUsl0FXEJzjXf9-TIgBuROBw4lCwx4hJTK8pAMc4lXEwDurs68-SjQcFbKh8qw26HhS-GzS4LDF568gTdfrmF1-FT1EzdPx3oRyRQPH6-RhKoqK7CVSyWQYCkLzXUQ4Asu71j9NiKUiwW9iotBrgBPDxgs7jt-wngtcYJvjGW_bxd_XReB-OOM64P-IrCAyyk6RgSStawmjmAK-e-fSHA-aWnzxPm8bl1NEknHbFI',
    imageAlt:
      'Abstract charcoal art piece on heavy textured paper in a dark oak minimalist frame.',
  },
]

export const SUPPORT_EMAIL = 'support@frames41.com' as const
