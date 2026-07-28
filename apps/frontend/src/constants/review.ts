import type { ReviewItem, ReviewFormProduct } from '../types/review'

export const MAX_REVIEW_LENGTH = 500
export const MIN_REVIEW_LENGTH = 10
export const MAX_RATING = 5

export const REVIEW_ITEMS: ReadonlyArray<ReviewItem> = [
  {
    id: 'rev_001',
    productName: 'FLOE CERAMIC VASE',
    productImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAJlZ2jaCIBdHH3s3GYmcwRFJlciWDd_A6lehuqSFObixfKq9zW8THTyp5lOv35qPdg76jk-U0aFc3jukEosPcraKrHdMPpC52LkCa0XY7P4Sdmav3NjiOiysBocZE9TJcdKiXXJ99rwB6-qP9hIm6gq7i3qoEkl6NKe8F63JXbLu4Ac_uo5_J-cBugfwRnj68H-SlcLYTQrqv1AJLGRptKPKelRignCj35U2j6S-ggtakiueTmx5grFk805OlfGm7FTYIWmMfGHoA',
    productImageAlt: 'Handcrafted ceramic vase with matte finish on oak table',
    rating: 5,
    reviewText:
      'The texture is even more beautiful in person. It feels solid and the minimalist design fits perfectly in my studio space. Truly a piece of art.',
    displayDate: 'Oct 12, 2023',
    isoDate: '2023-10-12',
    status: 'approved',
  },
  {
    id: 'rev_002',
    productName: 'RAW LINEN PILLOW',
    productImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuADlGiTA0aW4IvKiISWWqPjWCXtKkO0VElxfnKnSoYWBf_CxKhhd0sfteKdH3yX3YIgo-29Z520NRTgPNoszCFBKx5auGXD2i_n8aifldM_KtvO2X4wX3t1X8el8I03BklexP80IaWQ2IZQcFxDGWuV8oUAGHrinyBXsvLKX67JhRWLXDKSYL8InjzJdKW10hYWhDLUBdXBk0c71XHG_AG5g5rNM8lXn7GzMQskxj_e7hpTYBFVcVn4ch-oIXgvQ74_LO3rLryQjfI',
    productImageAlt: 'Natural linen cushion with raw edges on designer lounge chair',
    rating: 4,
    reviewText:
      'Love the material, though the color was slightly darker than it appeared online. Still, the quality of the stitching is exceptional.',
    displayDate: 'Sep 04, 2023',
    isoDate: '2023-09-04',
    status: 'approved',
  },
  {
    id: 'rev_003',
    productName: 'OAK MONOLITH STOOL',
    productImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDPtI6e0SRJ1sxNfWqXCKd7nAYtPFjW1FiRbZxG9gcdDcJZOVBfuAivG6f9PQ2kcVdbvOVqAnzwHo8emyWKsOdI5PIaYlmj07-o7kB-pHp8e7IguXin2glxuFu9XNMdGMckZC_dIREyQEEXJNzUWDPo-0vhzNCgdj2_3ooGPKQ3WT846iEKLMDWQlKBqmthmR2RPKhG-gCtnCod99duXJz96U8DgVPc4JwFldUKr9yLne-EKC77YUZePX9p1mt53-eVx7ibtoS3Juk',
    productImageAlt: 'Minimalist solid oak three-legged stool against charcoal backdrop',
    rating: 5,
    reviewText: 'A stunning silhouette. Fast shipping and the packaging was sustainable.',
    displayDate: 'Just now',
    status: 'pending',
  },
]

export const REVIEW_FORM_PRODUCTS: ReadonlyArray<ReviewFormProduct> = [
  { id: 'prod_throw', name: 'Midnight Indigo Throw' },
  { id: 'prod_burner', name: 'Brass Scent Burner' },
  { id: 'prod_rug', name: 'Hand-loomed Rug (Small)' },
]
