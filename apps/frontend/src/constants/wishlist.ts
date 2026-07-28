import type { WishlistBanner, WishlistItem } from '../types/wishlist'

export const WISHLIST_ITEMS: ReadonlyArray<WishlistItem> = [
  {
    id: 'artisan-rift',
    name: 'Artisan Rift',
    material: 'Handcrafted Acetate',
    priceInr: 340,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAa7HiO46-I-_d3Y4pDrlwYc600JVqPRCbhp-LbDOAsTnRsufA1sIVKnBHXCAmWQ5NKITDd_0G8pQrKMchJIthrVqpU7gQhdtF9zCglvjeVfxj-w4LqAP0Ib52oZavEg8jPNCS5IB4ngkDV_9Pa08JasIcagNjvMJdu7fN9OO48O-O5yl7a4UQg91ectm41iLRHScMPV7ehoZ2xdhoQB8W9Y47iyPAGKB8Fb4DrABCVhlAj_obN4sLm7V44JFQ4ac9Qxv1ZysTtfk8',
    imageAlt:
      'Artisan Rift – minimalist tortoiseshell acetate eyeglass frames on a smooth off-white gallery pedestal with soft cinematic lighting',
  },
  {
    id: 'veloce-slate',
    name: 'Veloce Slate',
    material: 'Titanium Series',
    priceInr: 410,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAOiOj7FbEwmqaVOp3HSmAnsYpjerrtgVfRmFrb4QM6UOSuBbHkxIMehFsT7pySBCaO9laKJh9H1vtfsz2Y2d7pqyLQoldrmFg0H0bfBHpTnNQ4g-fsmglmtZ5XE45IiixPSu018mFSWoGBC6ST8EqPu8drfe-lbd3UxVAb2bDa9M_9wrzzRk__eLFcelB0aStM4lBvHQ6xB0CMkKyMQM-9ROtVR00O9VRhBD1_4N83fYMSRKxq_1zmZN-gdwi4SDUBDx3Gncv98AU',
    imageAlt:
      'Veloce Slate – modern black matte titanium eyeglasses resting on textured linen in bright airy studio with natural afternoon light',
  },
  {
    id: 'lucent-geometric',
    name: 'Lucent Geometric',
    material: 'Crystal Collection',
    priceInr: 295,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCtISDPdsCADNIi1a2hcVHoGfgvpd5lA4CEbS7SmgM5DHPtqU5oO3W-OftScEYp1mkBH_J_bxPhRp_Bg2iuPZ6_XCSESVBT_rdOtM_kpOoEt73Dizq9YvkIGufWiyDxLS0us16OI2P9KsU9g48htH-Dbp0wEj0tSYi7GH7k0vARsO3UPtGnzO-ovg9XIZk9gajD_VXOAWt9tYygUYZ_eISHVbYdnhMBuTRnbAYIFv5vRnwfB3JRerYZALgH11gidlMETyHxWmxLrkg',
    imageAlt:
      'Lucent Geometric – clear crystal architectural glasses against stark white background with subtle editorial shadows',
  },
  {
    id: 'eclipse-forest',
    name: 'Eclipse Forest',
    material: 'Limited Edition',
    priceInr: 385,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBXZ3lzk6c4XzCFAadun2CJ4munc8OB6sghXx2dzlIUn-r6utUuE1yd8MDTRlzyci5Y64e6wx2bchNzw_jjtR_OuxGFnTm54pxIaRuPhC-MFbJAVD715jlHTeJbez0Yk2ZjOuoRGYUnKtSws0O0GuPI48XY7hR1xFx1G3620qqi4Eub31obPdj1XVgVB-YzJJkx6pKX_uTeQCwbM7lJC6dcxStarzGqx2QtdmTJqVHYs0',
    imageAlt:
      'Eclipse Forest – deep forest green matte eyewear frames on smooth charcoal stone slab with dramatic focused lighting',
  },
] as const

export const WISHLIST_BANNER: WishlistBanner = {
  imageUrl:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD-2B7EMp2UoNojEfd4FT82oHJznHATc3H-bLCGt5-A9rcb7ylAz6gX0MSKW3Abn7O3f5zORQISjyjFhDhcdiYzlv-RmNWmQWnwv16qfW5sgPWbMg6BgqteP5f9R6RtjYTQviEuIF9D05OB-oAmRuyfG8qnP7o1Fha_srQzzfSr4tFldjeC0lOME64PuX9mEOyVNsfmOM6-fj6ByrreZa4iQWWfup4CZNQYP26bapN-A_weBeymA3M_hEDsM3EhAA_HvFNnHyR4lU0',
  imageAlt:
    'Artisan workbench with precision tools and eyeglass blueprints, warm cinematic lighting with a bright orange glow',
  title: 'The Artisan Journal',
  body: 'Discover the meticulous process behind our latest Bespoke collection.',
  linkHref: '/journal',
  linkLabel: 'Read More',
} as const
