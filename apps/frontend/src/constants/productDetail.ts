import type { ProductData } from '../types/productDetail'

export const PRODUCT_DATA: ProductData = {
  id: 'sculpted-walnut-vessel',
  categorySlug: 'photo-frames',
  name: 'Sculpted Walnut Vessel',
  priceInr: 184,
  inStock: true,
  description:
    'Hand-turned from a single block of sustainably harvested American Walnut, this vessel celebrates the raw beauty of natural timber. Each piece undergoes a meticulous 12-stage sanding process.',
  images: [
    {
      id: 'img_main',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBA-HKuadZrh-pb0CFFY5fNVPhOJhWB0a18WlpQukOfVl8qe3EOqjv42tbZWRej9sSI3jeqSdH43-AyVlDflCRnALBNk0BBtvMI4bgqvnuR8f_VC5ZZQG2JdwYpy6KJzlx-gEmy5F2-a7goJMnPu_Dda2eOR61iARmksERzuOWUNwDG29Xc9gTq3NSYHGzixZw71rRb52a3dZy68y71HtxAWCyL7qzW3Qownu0RjxmDMeOmOR-FxtgghcMy6MJQFO6yJ52e9ORRyH8',
      alt: 'Macro close-up of a premium handcrafted wooden bowl with intricate grain patterns',
    },
    {
      id: 'img_thumb_1',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC87LCn-PYXnQCJvMfYpRSAmw86XOrWvJHgD-wBaQBfnWsJjwuIqTmaiCQjkXLjijIpe0ln-OAjwtqSWXaKkrBnBw6ks9Uc1W88EuyEXqxALVha7nmWBjrQJQCXXu4GoGLYYSxLdSOBafanPETt2phi4SbbjRDg1O2A2Aj7caddpJJxTw7dQ6wYhoOXMDd1Bwp1gycpLJKGTDo0HNrKYg_SeIgl0Y8A_TQbNrpXiwVDtDlpGIJ534ry2JIYwQ7bpH5Q0jcaTjMGGoc',
      alt: 'Side profile of the sculpted walnut vessel',
    },
    {
      id: 'img_thumb_2',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB3gM7PyNLM_Z-XU4YXWc5jIoP5b0So2aG_QwGhn5uUi9mJGdmHui-JdLSvFWB0FDKfFAGSiey3jVth_PsbO6UtCMnjbCEayesP6QDlend6_DJnVlmCeyovKwlPdXUFWOw7y46Itv7S9xLmawv_LmoCwFTw9bvyySEP-yB6pDP_CSu66wwqiOIlXxzmUThG9lZwXxVgx-Uemdk-u-G0L_c8HFqRtuv4yCJ_5mxbJc0wyko9l99ZeWAv-qoTpLzXFM_RS8n4YFkcfLM',
      alt: 'Top-down view of the sculpted walnut vessel interior',
    },
    {
      id: 'img_thumb_3',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCEYGAbYjbdFYtSRG5r3R8ybb2AWMJ166tfygb3KabMSWbZYkf7X2F9klkz_okaIol83RQCC2ERDqh_0jXW4YkA3t4OGIKjxvBOwMV_-V0UrEFCrc-enCb3IGr3Ai7qUpJBnu0hpmfnA9pxq3e0tRS1MUSN6j2qlv5Xa61RgniOXCz--5NVYIZpEHAB-bwOVtwzFte2q8Pu1H83SHvBBewuwu3jCoJNTen5sGnQRB9fbjayNvnOEjDQpxeGbBhu_RP1cA3eHKctL0',
      alt: 'Detail of natural wood grain texture on the vessel surface',
    },
    {
      id: 'img_video',
      url: '',
      alt: 'Crafting process video',
      isVideo: true,
    },
  ],
  features: [
    {
      id: 'feature_finish',
      text: 'Finished with organic beeswax and linseed oil',
    },
    {
      id: 'feature_grain',
      text: 'Unique grain pattern on every single piece',
    },
    {
      id: 'feature_dimensions',
      text: 'Dimensions: 12" Diameter × 5" Height',
    },
  ],
  reviews: {
    average: 4.9,
    count: 128,
    breakdown: [
      { stars: 5, percentage: 92 },
      { stars: 4, percentage: 6 },
      { stars: 3, percentage: 2 },
      { stars: 2, percentage: 0 },
      { stars: 1, percentage: 0 },
    ],
  },
  tabs: [
    {
      id: 'description',
      label: 'Description',
      content:
        "Designed for the conscious creator, our Sculpted Walnut Vessel is more than just home decor; it's a testament to the soul of artisanal woodcraft. We source our timber from reclaimed sources, ensuring that each vessel tells a story of rebirth and artistic intention.\n\nThe tactile minimalism style ensures that while the form is striking, it never overwhelms your living space. Instead, it serves as a quiet anchor, bringing a touch of the forest indoors through its organic warmth and grounding presence.",
    },
    {
      id: 'specifications',
      label: 'Specifications',
      content: 'Material: Sustainably harvested American Walnut\nDimensions: 12" Diameter × 5" Height\nFinish: Organic beeswax and linseed oil\nWeight: Approx. 1.8 kg',
    },
    {
      id: 'care',
      label: 'Care Guide',
      content: 'Wipe with a soft, dry cloth. Avoid prolonged exposure to direct sunlight or moisture. Re-apply beeswax polish every 6–12 months to preserve the natural finish.',
    },
  ],
  relatedProducts: [
    {
      id: 'related_oak_organizer',
      slug: 'oak-organizer-set',
      name: 'Oak Organizer Set',
      priceInr: 75,
      badge: 'New',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCtjI9LmMW9mPkJDWOHVFp_OSJGm8b3QrFOd3Ii5osyaubh3NpV0cDUbzFqkBPs797KXXLAuxdB0lMt4s1T1mlUQBTmbnJ1FlPyIiNlhnvhcTpyMD-V5Kei4nLMbwTHEfEUH_l7501Nz0vVLEH9Snbs-I6pZhi0wPtAPGkFhbCTS4F2CSvUJ2ekcTIBWxT_E7CY5uUTM7PFG75kfDmO5MLTfqiftvXBTT5u4i3D-5KPql7X36D-tbhQNG3HsAuNEMMQmOM7DR5Svh8',
      imageAlt: 'Minimalist oak desk organizer set with natural wood grain',
    },
    {
      id: 'related_geometric_kit',
      slug: 'diy-geometric-kit',
      name: 'DIY Geometric Kit',
      priceInr: 42,
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCugOaHYD1tTY9Op9nNQUepiI562dYZDsRDClsrrbQnt08wvM4_Oeaw3-N8nmdohCZdm9FZgYO4yZ-1AtlnTvpXG-Ku8Z5MHuz9nBwcP5l-Qra3LCW8XUdtb0CP_ZntkZYrN5m5OYFCd3TAbpt7MJvBr0NU4AxzbAQjird7-wlt7GkAc4gByNzirIRZaOUzel1V21tNCaT2v4LyFH9Q_4j4XahLgOGMV4Lgk17oF1w6S-hMTgFqu8lh6M2gRj7vFJ4khhV8CVdj_eg',
      imageAlt: 'DIY geometric wood cutting kit with MDF shapes',
    },
    {
      id: 'related_ebony_clock',
      slug: 'ebony-wall-clock',
      name: 'Ebony Wall Clock',
      priceInr: 120,
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDvLMLoJ6X7ldRcbmnWUjm_hN4Jdqqg8odOosV9as_LkaVqRBPHFJ9tirxsxbOw_xcBYLTIsCm4tJjb8TOhDV3YuCuqN3kQYq9ELB8MSHqdDbMpQ52Ntx13eWAmdpcpNbnnsPXdIz-tPM7n6AZbg2MWdaBy5QHIhf4WphncY84Vqt7-vlRYozae7b7rchxlo7kWDuK37zlG1gv7zvzVGk-SrID6_z0hMj0sqegSpvFMQTSx90DJClSwTjaoMMo5rwg8o8kw_zFZ22g',
      imageAlt: 'Minimalist ebony wall clock with slim hands',
    },
    {
      id: 'related_culinary_set',
      slug: 'culinary-wood-set',
      name: 'Culinary Wood Set',
      priceInr: 88,
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBY-R3miS32g6Hmnb2wIeKRnbALB0pws4f3zsMUhAhnrNPpQu69RVqe-LOo90Tf6FqHLccpWkxxj5ZCvf4QJTsjEUm2D9l7M1IqagklYaZ_s3dW4lsjxZCUJGb0vfdeAw0K18rrWzpGtS5KgUQvYeqf4FLTK5qERSINHZjyqUIbLSdRWrlZe4iqawWbSvWVIXokhpJt4D-7eHBMjGCpdailkg5IMQJtFH_ZfadpMEAK3SP_mIporLYko76S7WMPsLy-kXMXkE4_0c4',
      imageAlt: 'Handcrafted culinary wood set with cutting board and utensils',
    },
  ],
  shippingNote: 'Free Shipping Worldwide',
  shippingDuration: '3–5 Business Days',
  customizationConfig: {
    numberOfImages: { enabled: false, count: 1 },
    numberOfNames: { enabled: false, count: 1 },
    date: { enabled: false },
    songName: { enabled: false },
    qrCodeImages: { enabled: false, count: 1 },
    contactShop: { enabled: false, value: '' },
    startingFrom: { enabled: false },
  },
}
