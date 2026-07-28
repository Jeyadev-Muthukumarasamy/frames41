import type { OrderTrackingData } from '../types/ordertracking'

export const ORDER_TRACKING_DATA: OrderTrackingData = {
  orderNumber: '#VK-82910',
  awbNumber: 'VAK8273645591IN',
  steps: [
    {
      id: 'pending',
      label: 'PENDING',
      icon: 'pending_actions',
      status: 'complete',
      timestamp: 'Oct 12, 09:14 AM',
    },
    {
      id: 'paid',
      label: 'PAID',
      icon: 'payments',
      status: 'complete',
      timestamp: 'Oct 12, 10:30 AM',
    },
    {
      id: 'processing',
      label: 'PROCESSING',
      icon: 'autorenew',
      status: 'complete',
      timestamp: 'Oct 13, 02:45 PM',
    },
    {
      id: 'shipped',
      label: 'SHIPPED',
      icon: 'local_shipping',
      status: 'active',
      timestamp: 'In Transit',
    },
    {
      id: 'delivered',
      label: 'DELIVERED',
      icon: 'inventory_2',
      status: 'upcoming',
      timestamp: 'Estimated Oct 18',
    },
  ],
  items: [
    {
      id: 'terracotta-earth-vessel',
      name: 'Terracotta Earth Vessel',
      subtitle: 'Limited Edition • Artisan Collection',
      size: 'Large',
      quantity: 1,
      priceInr: 420,
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDOKCOJ3_LkZE19TwTtUvvKHtMD-7hKPXfFSJw7zOa7wDkhQsBqrCuu29QuucJRea9zdDZMIeBn2VrU8ubAKP8sEFZ1l4plbqZBQVyfs-A9e6eea1i_ElppaIk9slvNh3sM1c1PIcfYNSpfbYv1jWYbLSibcWoq48OirA46WuPhevjot2iy8zt4MkL81mK_4A62iFi1CUXxvYlzS0KV-s_hHIXToC-WWRnZvmzWZ14Z83lwSLRPB46AEx7yEGn60in0i3ZoRn7lChA',
      imageAlt: 'Hand-woven artisan clay vase with earthy textures on a minimalist white stone surface',
    },
    {
      id: 'indigo-linen-textile',
      name: 'Indigo Linen Textile',
      subtitle: 'Organic Dye • Hand-stitched',
      size: '45x45 cm',
      quantity: 2,
      priceInr: 180,
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuA-DFGFl1L-OQAknMyMaVi4qh1eZwfupE_TShcRtO2cgtHb34I-QX-8oDvv4spEeiNA-CXKEa_BgLOfAlkZVC5sYpjjj0MpE3OFUhS0AuKzPSE0Clq65tJepEp-FMhSeSoJa7JIfVPC6Lcig3m7UwrPOJ2LteACKQBP5saCdr9xvqhk4kV87aFH1sk6jnXhwq5cgD6fQien4a02LeaM8au3qEV5LNMk7R0QNG-OJgKl8Wn4RuQ-W8R7EXUV1Rz9xU-qoTNMD93TIRA',
      imageAlt: 'Premium hand-dyed organic linen cushion cover with deep indigo and off-white patterns',
    },
  ],
  shipmentEvents: [
    {
      id: 'transit-hub',
      title: 'In Transit to Hub',
      location: 'Mumbai Distribution Center, MH',
      timestamp: 'Today, 09:20 AM',
      isLatest: true,
    },
    {
      id: 'departed-origin',
      title: 'Departed from Origin',
      location: 'Artisan Workshop, Jaipur',
      timestamp: 'Yesterday, 11:45 PM',
      isLatest: false,
    },
  ],
  delivery: {
    address: {
      recipientName: 'Julianne Moore',
      streetLine1: '742 Evergreen Terrace',
      streetLine2: 'Bandra West, Mumbai 400050',
      stateAndCountry: 'Maharashtra, India',
    },
    contact: {
      email: 'julianne.m@example.com',
      phone: '+91 98765 43210',
    },
    estimatedDelivery: 'OCTOBER 18, 2024',
  },
  totals: {
    subtotalInr: 600,
    shippingInr: 25,
    taxInr: 50.4,
    totalInr: 675.4,
  },
} as const
