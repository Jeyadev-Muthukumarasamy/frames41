import type { CartData } from '../types/shipping'

export const CART_DATA: CartData = {
  items: [
    {
      id: 'item_walnut_frame',
      name: 'Signature Walnut Frame',
      variant: 'Hand-sanded finish • 8" x 10"',
      priceInr: 85,
      quantity: 1,
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuD5hVs4duhvEC6GopzG-qKJJarZfQg_vDypNAArIsP0Tag7spl3Bv-UDMBgsRTD_sWy_b809SxjIG4iiSUx78KwIuRfOwmYbseGV19Ww5YAc2TW3uNWOCFIHjN7JBCoDhfnD-sODDcLVLx7gNn4HxtohWnz6MiqHdGRK8_hSBnvHFdfiiWFjVK33g78R6T9LyXQe4ETM652VIA7c_83WyUD3qcqfWtoT-BjS0PhFnR8uLHt9JtgDZ6Q7MS_7IXOoRT3jKiSxpLtgB0',
      imageAlt:
        'Meticulously handcrafted walnut wood picture frame featuring visible organic grain and smooth, sanded edges',
    },
    {
      id: 'item_coaster_kit',
      name: 'Geometric DIY Coaster Kit',
      variant: 'Set of 4 • Includes Saffron Stain',
      priceInr: 42,
      quantity: 2,
      inStock: true,
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDGsM0x4Rd_88y3KmQ0XQzNk_PPNy3S_1X9HS2YmRAUJuZxa8vyx-3eim14-JYHeIgwJNm2BGRFjFExXiS5EuGTN-v6Q-J4OuOab7F164xuvnrUyPu9DEMrRarY723kCUDs4cMnCaksdA_XoP1kDLofByuI3nsj8ttUhFbsz3VqSWXbi9XT_HU3S-UquCQaUTMzv_U4RfQTDqlwwgIYYRr4L_dItzzMqQ9Y2MSTx2FQBkgZjdKH3OjoVH9p1HHX7x0BAKiHfxsG9aQ',
      imageAlt:
        'Top-down view of a DIY woodcraft kit containing various MDF cutouts shaped like geometric patterns',
    },
  ],
  charges: {
    shippingInr: 12.5,
    taxInr: 8.45,
    discountInr: 10,
  },
}
