import type {
  BlogFooterLink,
  BlogNavItem,
  BlogPost,
  BlogShareLink,
  RelatedStory,
} from '../types/blog'

export const BLOG_NAV_ITEMS: ReadonlyArray<BlogNavItem> = [
  { label: 'Collections', href: '#' },
  { label: 'Artisans', href: '#' },
  { label: 'Bespoke', href: '#' },
  { label: 'Journal', href: '#', isActive: true },
] as const

export const BLOG_SHARE_LINKS: ReadonlyArray<BlogShareLink> = [
  { label: 'Twitter', href: '#', rel: 'noopener noreferrer' },
  { label: 'Instagram', href: '#', rel: 'noopener noreferrer' },
  { label: 'Pinterest', href: '#', rel: 'noopener noreferrer' },
] as const

export const BLOG_RELATED_STORIES: ReadonlyArray<RelatedStory> = [
  {
    id: 'jodhpur-dye',
    category: 'Artisans',
    title: 'The Master Dye of Jodhpur',
    href: '#',
    image: {
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2kuf5O_WRj5EN_Bck35mt-Of4iYCVt9meteqaqGY5ULcjfYzNMd38I7TyjM97v8ZudM8uoEagsuGcPc16qPjhojY_nlONXyNcpTzBR4ojMU74ynKtcx9PCfR4zNYnGqXgn0PDvJ_qQclV2avbYTvSQgD__x5j6lf4xrtOwmwB99m3QJR1HJaGy-e8N-VWp8xkGb-BRH1dWY26dZZ9X4Uqoza6Xrr1TS4aIO3HiJr0H9OwwpNTQGpE6KZdSpsl_INmvI41BL9SAlg',
      alt: 'Editorial fashion photograph of a model in a minimalist draped silk garment',
    },
  },
  {
    id: 'circular-design',
    category: 'Sustainable Luxury',
    title: 'Circular Design in Haute Couture',
    href: '#',
    image: {
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAoCKemDeXLspNXAaUYfrZ5oPT23D2F7ud0DGW9zyzEFuTpy7fm4XI1kHbls08ki2EThMVtOHiuewzc9nWcZeSO--Nb33NCdqt0iY6jhWta7koMZfMtgAxWgNGE_POiC-6dbzkmyxm2loNIqIQqtQNHsUaIrvVD2RwZ-G05g1Ri6qPwhCBvNEigMrwCujE3jVIGhJTJaoQTyXyv7vGWIdIQy8srRXkxKM_DRu44aGlJ2A1d-qb1sN-ueT0fG4euhjf-jlsCKHxOsTY',
      alt: 'Minimalist architectural shot of a modern design studio with soft diffused light',
    },
  },
  {
    id: 'bespoke-thread',
    category: 'Collections',
    title: 'Bespoke: The Personal Thread',
    href: '#',
    image: {
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvigrTmxfzM1VyAxhRZVZ_2701MclzU-8umnH5i8hatEgzxsQTx6mPOoR3Isut0qOjDWGBbHGlZyyBRKBPdKMGSPlVERFbhyBRIuw9mf8mIOg-2oLzjrHZ5R5KdO8D9r-ywM524a7Fk9tZokCI17kCwIhBloLl3acaqPGU_V_gZgg3gDVCQBg1zwpRkMGpryFDoSB261E9mxSn9mcwvyDheRqYxVr1axEqulnivYWMtwBcwJEK-31eQlVqKAY-6qhDoGlbuIGJmP0',
      alt: 'Still life arrangement of premium Frames 41 packaging with charcoal and orange accents',
    },
  },
] as const

export const BLOG_FOOTER_LINKS: ReadonlyArray<BlogFooterLink> = [
  { label: 'Sustainability', href: '#' },
  { label: 'Shipping & Returns', href: '#' },
  { label: 'Contact', href: '#' },
  { label: 'Privacy Policy', href: '#' },
] as const

export const BLOG_POST_DEFAULTS: BlogPost = {
  title: 'The Silent Language of Hand-Woven Silk',
  meta: {
    category: 'CRAFTSMANSHIP',
    author: { name: 'Ananya Sharma' },
    publishedAt: 'November 14, 2024',
    readTimeMinutes: 8,
  },
  featureImage: {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCk-XAbkJ7km5uFUeU-2-hCyknZ84CvsJAV0wZTFZG1UsjChX_dJ5tPfqSjfwefNI6iHAN3V2Vsl_Ynd_YIfey9uhYldbVkag_x8H66dAK0_Em-bxDafZvTMBVGxcbrzIRHyFFHT00IQDhfb7zFQ2itJJkVu4i5qlGJ0HCeTRp34PHOd2O-Mx9SiO3h18kBxAzP--f5wAHWq83dTyfa49T0DL9HqSvrsUZzjJRsKKZvC_c5ypcq6TUD2fjb0Ug57vWNXMBRARBRPmI',
    alt: 'Vibrant orange silk threads being meticulously woven on a traditional wooden loom',
  },
  sections: [
    {
      id: 'lead-quote',
      type: 'lead-quote',
      content:
        '"Luxury is not in the object itself, but in the story of the hands that shaped it. In the quiet corridors of Kanchipuram, the rhythm of the loom is the heartbeat of a culture."',
    },
    {
      id: 'intro',
      type: 'paragraph',
      content:
        'The art of silk weaving is a testament to the enduring power of tradition in an increasingly digital world. At Frames 41, we believe that every thread carries a legacy. The process begins long before the first loom is set; it starts with the selection of the finest mulberry silk and the precise preparation of gold-dipped silver zari.',
    },
    {
      id: 'geometry-heading',
      type: 'heading',
      content: 'The Geometry of Tradition',
    },
    {
      id: 'geometry-body',
      type: 'paragraph',
      content:
        "Every motif woven into a Frames 41 garment is a geometric poem. From the 'Kamalam' (lotus) representing purity to the 'Mayil' (peacock) symbolizing grace, these symbols are not mere decorations. They are ancestral markers that have survived centuries of change.",
    },
    {
      id: 'pull-quote',
      type: 'pull-block',
      content:
        '"A single masterpiece requires over 300 hours of manual labor, weaving the past into the present."',
      attribution: 'Ramesh Gupta, Master Artisan',
    },
    {
      id: 'evolution-body',
      type: 'paragraph',
      content:
        "The challenge of the modern era is to respect these techniques while evolving the aesthetic for a global audience. Our 'Frames 41 Signature' collection achieves this by simplifying traditional borders and focusing on monochromatic depth punctuated by our signature primary orange.",
    },
    {
      id: 'image-grid',
      type: 'image-grid',
      images: [
        {
          src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAzXBARHGmVeeqoT5wF_NDXsLQtRCCM-MfRb3L8-j0zpOKOV2kztP-J24eJ-ULwfvUdGqNQ2iU3gr8DSh_x-nAOrIZGn8iffyvhf-o-GFhD90hXzjNaxx-5JnvKVotwyNcaACfakSM8oPrjgnPgFfbArX-pp_mwvir-gS_t90OV5W3v8jsr5P1gdHEYlDapLCS6D2Oxb-uAW2pOkQIAaE2d1XZuVaa75FPTSwKHtU5OBpdh88Rjfoheji2DVfqUFCucNYwyllP3E-A',
          alt: 'Detailed macro shot of a hand-woven textile with charcoal grey and orange patterns',
        },
        {
          src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQI4sMxS3FjcJbAWyw2F9golj0Asrzts4afyekO14ZfgJjCnVCLj_5alQ7-Q8Ilujjvf0RuTDxcJr6cp1yoG93dPbD4JqbiRmslPkiaVWP9H7A7E92Smz-d9NSrjB2jiMlvprB2Y0AWKcAHTZwdtwQl0kBwlOaYiruRACNAdqIcMrJOnJUWX_t5WuvSFzpdY7W2Xk-o48_LGObkhuSWrQnbxk9XOXV_PU9MuixL2xzTYUi4Vml4j6ywV4sCaSgPZRxH6TTiJDjxXI',
          alt: 'Serene artisan workspace with natural wooden surfaces and soft morning light',
        },
      ],
    },
    {
      id: 'conclusion',
      type: 'paragraph',
      content:
        'In conclusion, the journey of a silk thread is more than a production cycle; it is a spiritual practice. As we look to the future, Frames 41 remains committed to preserving these silent languages, ensuring that the whisper of the loom continues to be heard in the modern world.',
    },
  ],
  tags: [
    { label: 'Silk' },
    { label: 'Heritage' },
    { label: 'Sustainability' },
  ],
}
