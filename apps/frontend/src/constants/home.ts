import type {
  Category,
  FooterColumn,
  NavLink,
  Product,
  SocialLink,
} from "../types/home";

export const NAV_LINKS: ReadonlyArray<NavLink> = [
  { label: "Shop", href: "/shop" },
  { label: "Our Story", href: "/about" },
];

export const HERO = {
  badge: "EST. 2024 • NEW ARRIVALS",
  headline: "Handcrafted Soul\nfor Modern Spaces.",
  subheadline:
    "Discover our collection of artisanal wooden frames and DIY kits, carved with precision and finished with love.",
  primaryCta: "Explore Collection",
  secondaryCta: "Watch the Craft",
  imageUrl:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBCpv_68_IazJtPyLngOChDt9RdimwGCNb2pO4GzM7FjMDidTzP3To2z_hk1ntU2ATxkKkprC0H-1nN9XJEx7eFah5YSGnJxU_XoffThKD3qFTPOICrsh4VTB7jlMrRSWgcNsHppadNIbo7oTwVnlRFm1Zxy1jxT0eIumwAyI5nnA3cPpQvBMftmdj2uq3bNeDCrOPufe_1WIIF-1QSg9Udd-ZBTv6rqnOMq8tWsZx8vYmm3uzkqmeSWvpxRLaZKQukJe0UHKitXWI",
  imageAlt: "Artisan woodworker crafting at a workbench",
  link: "#collections",
} as const;

export const CATEGORIES: ReadonlyArray<Category> = [
  {
    id: "signature-frames",
    title: "Signature Frames",
    description: "Timeless vessels for your most precious memories.",
    cta: "Shop Frames",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCb3YFsxB8iLqLsZ2QEFSmYZNds1vroMjEB8yrRPJ7CC8z7nH3G9oWHuqqoetCFcJaLlN9rYi1C4aFfr8PsQNepsMaOB5xscyYb0Y-7X-2PXS5Qr-1JFeLsrqCs3ZYj7x32C-4yQ7ivTAnoqFDvbfIFmkPC4JH4qxwi9cT4WrBR6Vajq6hVEHv6GbAY_WCU7FyN-R38qQkrc_nqsI1ee-BYbNIHtrYZ9_ulfqRu9NfK5PhVHN5pJxH32ZC_Jky7UyPlrAzT1LNtFUw",
    imageAlt: "Collection of handcrafted wooden signature frames",
    span: "wide",
  },
  {
    id: "diy-kits",
    title: "DIY Kits",
    cta: "Create Now",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCKfypEjXR8s3Qbg0ajcT_-dj6tK6Mv3QXtJjvq_0AOhmm8qoGiDtkx0oe7iMFbGRthZ59To1sRqGKK3QMy_zd-HdH0SfHsG6Qemzsx1OS4slQSyNwCOoz-n7fLwmyxP9X_vBd-hP2swdiKQjOH_r_5i9mOdHedPCDafO2e-e3NUd50ZQhGmT2y_K1ZlOsIl1aGzrYq7Yg2mIDjdgYRtDfnTtk8f-c9YcATk5YAaXYesl7-C3RbzGgE5nVfSJL3B1YyiSJonpvMZKg",
    imageAlt: "DIY craft kit with materials and tools laid out",
    span: "narrow",
  },
  {
    id: "art-pieces",
    title: "Art Pieces",
    cta: "View Collection",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCNnYLDWpnDrqsYfjNjn_ox0r138yqLCwns9D3xugf-dYwn3SOXU1vOb5Q-YTCJsUdH-NFvU1_eKEFETn2bLpU_mvPUnahNYqBKXMcwdVwGMpEkDZnGA-nPadfEQ-Nr3cF1DetmPw74olpj0ieqM82DA9NnjJpFGkAgAHg3kejZs_L70F5TEP_F31k",
    imageAlt: "Handcrafted wooden wall sculptures and art pieces",
    span: "narrow",
  },
];

export const BUDGET_PRODUCTS: ReadonlyArray<Product> = [
  {
    id: "minimalist-a5-frame",
    slug: "minimalist-a5-frame",
    name: "Minimalist A5 Frame",
    priceInr: 499,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDyEs4JwPW4Y0kL3-xraT1X3-rQyjzSHGHrYZVbYK66jcX--a8EIrO-kjgjtyXeCOVh-On7hFjwo8zmcBT6el1s5wVabDxridAhyJmW02Yv4F9s4YhVYMAM-Q-mW8ZqfGkmtIppXae8V_p5uQmQPSMuHO8VmBzj_ryoLQY_nsgk5WtPQFQIHZyEMWlBKBpxE6y5haxpzDfAnO-CB9OXNRiJ6KqV63Mt0o-irJsUG7Mmq6nesqQA6GQCF9KJvOUQINo7O7fglCEqWtw",
    imageAlt: "Minimalist A5 wooden photo frame on a desk",
    badge: "New",
  },
  {
    id: "mandala-coaster-set",
    slug: "mandala-coaster-set",
    name: "Mandala Coaster Set",
    priceInr: 799,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCKK8ANnLPKkkYIQN2d-VmVf-PXupACGtPWTRQ31RitP47X4SUHNxTn_sfQESUda4HjrmMe7vQoGiDtkx0oe7iMFbGRthZ59To1sRqGKK3QMy_zd-HdH0SfHsG6Qemzsx1OS4slQSyNwCOoz-n7fLwmyxP9X_vBd-hP2swdiKQjOH_r_5i9mOdHedPCDafO2e-e3NUd50ZQhGmT2y_K1ZlOsIl1aGzrYq7Yg2mIDjdgYRtDfnTtk8f-c9YcATk5YAaXYesl7-C3RbzGgE5nVfSJL3B1YyiSJonpvMZKg",
    imageAlt: "Set of mandala-patterned wooden coasters",
    badge: "Popular",
  },
  {
    id: "owl-desk-totem",
    slug: "owl-desk-totem",
    name: "Owl Desk Totem",
    priceInr: 850,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDYMmKhpOEPNKYtwtr2ADgw8HgfIn-AnqxGbhAp95Nwvv5Yj54lKlN53U9TOkivSbo179KE95Ao3hhLSa9BPfSwj7J0REw-kPdAXSF70tb69yJ1QCjFQDLzkWHZ-qrdVlaHcS3hun_fhnVvvnVWh8ocR2U2ogc3PamdVvIfJOH6K5KsTi7kwnGd1fvJwEDHa02QTFPKNTQvdQhb0bcvOwaa0AjS9K7GKZzONDple_hluVcf6SIfqA_1z6oeqJHuipDH-jsTkr4dt4Q",
    imageAlt: "Carved wooden owl figurine for a desk",
  },
  {
    id: "bud-vase-teak",
    slug: "bud-vase-teak",
    name: "Bud Vase – Teak",
    priceInr: 949,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCe_vY1AjeCXWw37C9VueZAoFmiASksc69gYlhTHh2xXWHKmLtv479FekDvoyhpgcCY2DnDgLxIaotLwM0WAhqKdOq0qHNZRDyV9UP3H_9dVrpIYKBBxBk-AJ6iTVoJNDXlZ_honLZDXg92SVVuMn3aZveBoPEtB8nDYuCJauAHpKFqiwAyOxyFXFUGv3otw4m5_S8JLVFg4QcCbzZTXvoEe6pGBmKJuCdBYf1IkgfOj_HvUKWieycwzCto6qjnZmPiNZW71u_G8",
    imageAlt: "Slender teak wood bud vase",
  },
];

export const BESTSELLERS: ReadonlyArray<Product> = [
  {
    id: "world-map-triptych",
    slug: "world-map-triptych",
    name: "World Map Triptych",
    priceInr: 12000,
    description: "Premium Walnut & Oak Finish. Hand-carved with precision.",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAuFpGlZ3TT9D9x-i7sYqu_6Y7po7-C12PFcnaARkmkrKe0lp17ZUhPrm0yd6xXqxnxOpAX9bCQU3UMumb5YHrbZ_wfXFXGxOIUFZUiSu3LFJfqEiqsKhUHiPTp3akw_EiQQh4OXTG4ZuKN6xg971ngMv8xscKY39bulSNOdpOUwb_KxgJA15LXFwJfLo42UdLj-_MuRYBVmhpHnZwwV_IjGfd6_mZ6FNNrzFaqixA20fsOgZDa-WAzywrYrmQ7I_1o_g9lhlZ2h1Q",
    imageAlt: "Three-panel world map wall art in walnut and oak finish",
  },
  {
    id: "chronos-wall-clock",
    slug: "chronos-wall-clock",
    name: "Chronos Wall Clock",
    priceInr: 4200,
    description: "Solid mahogany frame with silent quartz mechanism.",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAfimecysUS40CICSFkOJmDKgXtXLjh3MgK6vwK58Hd7s3H4d02kWylKyvN7oPEeNjlMcN6B8HHvTSQL3tZ53TYmKm8VWCY7C0dpxqBpsMHV5tXMNP2ROyu7zTuxmx4J2mGz_ytckKeAlMdtC7VcwYGKoHZr3GDzljQSxUZM9o0Q-08PUMObVwf1JO0BraTRAg9_pys7BrWx9AWfSmPB1DKEs3ahK82g50daJoqi-C0VoHsFaz4LB3dRSE6DH2ULbBZKwIutb64Zfw",
    imageAlt: "Mahogany wall clock with silent quartz mechanism",
  },
  {
    id: "honeycomb-planters",
    slug: "honeycomb-planters",
    name: "Honeycomb Planters",
    priceInr: 2800,
    description: "Modular hexagonal units to bring nature into your workspace.",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCJsl33T0BNb-8EN42ZX9l8vlCNRg4hiRwCqPj3O2SQFRQkliXxFZS2IVa1BgTPAh_gzzVwbhVv41qORBOZPpWYUykNVKrCzuOAKaO80GbTP1EhGp9bi8_ImIKagD_WQ-3uok6X4dkV8aZdadO-DExf6rf-kMnR8cI9_-GEObMrfs8iEtkjvqJQrdPh8b5Xuq4K-rkZ3zr7jvh_EnfTHzjxdw6GkWz57PvqtYHedrx-9ZNPlxz4_57WtGpTS0F--U4owpUUZ0jXdDI",
    imageAlt: "Modular hexagonal wooden planters on a shelf",
  },
];

export const FOOTER_COLUMNS: ReadonlyArray<FooterColumn> = [
  {
    heading: "Shop",
    links: [
      { label: "All Products", href: "/shop" },
      { label: "Bestsellers", href: "/shop/bestsellers" },
      { label: "Gift Cards", href: "/gift-cards" },
      { label: "Bulk Orders", href: "/contact/bulk" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Shipping Info", href: "/shipping" },
      { label: "Contact Us", href: "/contact" },
      { label: "FAQs", href: "/faq" },
      { label: "Returns", href: "/returns" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
    ],
  },
];

export const SOCIAL_LINKS: ReadonlyArray<SocialLink> = [
  {
    icon: "instagram",
    href: "https://www.instagram.com/frames41_by_jk_fotoz/",
    label: "Instagram",
  },
  {
    icon: "mail",
    href: "mailto:hello@frames41.com",
    label: "Email",
  },
  {
    icon: "whatsapp",
    href: "https://wa.me/919489736237",
    label: "WhatsApp",
  },
];
