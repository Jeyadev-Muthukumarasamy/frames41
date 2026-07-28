import {
  PrismaClient,
  UserRole,
  BannerType,
} from '@prisma/client'

const prisma = new PrismaClient()

async function main(): Promise<void> {
  console.log('🌱 Seeding database...')

  // ─── Admin User ──────────────────────────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@frames41.com'
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'Admin@1234'

  const { hash } = await import('argon2')
  const adminPasswordHash = await hash(adminPassword, {
    type: 2,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  })

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      isVerified: true,
      name: 'Frames41 Admin',
    },
    create: {
      email: adminEmail,
      passwordHash: adminPasswordHash,
      name: 'Frames41 Admin',
      role: UserRole.ADMIN,
      isVerified: true,
    },
  })
  console.log('✅ Admin user:', admin.email)

  // ─── Categories ───────────────────────────────────────────────────────────────
  const cats = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'photo-frames' },
      update: {},
      create: {
        slug: 'photo-frames',
        name: 'Photo Frames',
        description: 'Handcrafted wooden and acrylic photo frames for every memory',
        sortOrder: 1,
        image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&q=80',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'collage-frames' },
      update: {},
      create: {
        slug: 'collage-frames',
        name: 'Collage Frames',
        description: 'Multi-photo frames to tell your story',
        sortOrder: 2,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'custom-name-frames' },
      update: {},
      create: {
        slug: 'custom-name-frames',
        name: 'Custom Name Frames',
        description: 'Personalised frames with names, dates and messages',
        sortOrder: 3,
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'led-frames' },
      update: {},
      create: {
        slug: 'led-frames',
        name: 'LED Frames',
        description: 'Illuminated frames that glow in the dark',
        sortOrder: 4,
        image: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?w=800&q=80',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'wall-art' },
      update: {},
      create: {
        slug: 'wall-art',
        name: 'Wall Art',
        description: 'Canvas prints and posters to transform your walls',
        sortOrder: 5,
        image: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800&q=80',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'digital-prints' },
      update: {},
      create: {
        slug: 'digital-prints',
        name: 'Digital Prints',
        description: 'High-resolution art prints on premium paper',
        sortOrder: 6,
        image: 'https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=800&q=80',
      },
    }),
  ])

  const [photoFrames, collageFrames, customNameFrames, ledFrames, wallArt, digitalPrints] = cats
  console.log('✅ Categories:', cats.length)

  // ─── Products ─────────────────────────────────────────────────────────────────
  const products = [
    // Photo Frames
    {
      slug: 'classic-oak-frame-4x6',
      name: 'Classic Oak Frame 4×6',
      description: 'A timeless solid oak photo frame with a natural finish. Fits standard 4×6 inch prints. Each frame is hand-sanded and finished with food-safe oil for durability. Includes an easel back for desktop display and wall-mount hardware.',
      shortDescription: 'Timeless solid oak frame with natural finish',
      basePrice: 699,
      discountedPrice: 549,
      sku: 'PF-OAK-4X6-001',
      stock: 85,
      isBestSeller: true,
      isFeatured: true,
      categoryId: photoFrames.id,
      specifications: { material: 'Solid Oak', size: '4×6 inch', finish: 'Natural Oil', mounting: 'Easel + Wall Mount' },
      images: [
        { url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&q=80', alt: 'Classic Oak Frame front', isPrimary: true, sortOrder: 0 },
        { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80', alt: 'Classic Oak Frame side', sortOrder: 1 },
      ],
    },
    {
      slug: 'walnut-frame-5x7',
      name: 'Walnut Frame 5×7',
      description: 'Rich dark walnut frame with a sleek profile. Hand-crafted from sustainably sourced walnut wood with a smooth wax finish. Fits 5×7 inch photos. The deep grain of walnut adds warmth and elegance to any room.',
      shortDescription: 'Rich dark walnut with sleek profile',
      basePrice: 899,
      discountedPrice: 749,
      sku: 'PF-WAL-5X7-001',
      stock: 60,
      isBestSeller: true,
      isFeatured: false,
      categoryId: photoFrames.id,
      specifications: { material: 'Solid Walnut', size: '5×7 inch', finish: 'Wax Polish', mounting: 'Easel + Wall Mount' },
      images: [
        { url: 'https://images.unsplash.com/photo-1581591524425-c7e0978865fc?w=800&q=80', alt: 'Walnut Frame front', isPrimary: true, sortOrder: 0 },
      ],
    },
    {
      slug: 'minimalist-white-frame-8x10',
      name: 'Minimalist White Frame 8×10',
      description: 'Clean, modern white frame crafted from premium MDF with a lacquered finish. Perfect for displaying 8×10 photographs, artwork, or prints. The wide mat border creates a gallery-style presentation.',
      shortDescription: 'Clean modern white with gallery mat',
      basePrice: 1199,
      discountedPrice: null,
      sku: 'PF-WHT-8X10-001',
      stock: 40,
      isBestSeller: false,
      isFeatured: true,
      categoryId: photoFrames.id,
      specifications: { material: 'Premium MDF', size: '8×10 inch', finish: 'Lacquer White', mounting: 'Wall Mount' },
      images: [
        { url: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800&q=80', alt: 'White Frame front', isPrimary: true, sortOrder: 0 },
      ],
    },
    // Collage Frames
    {
      slug: 'trio-collage-frame-4x6',
      name: 'Trio Collage Frame 3×(4×6)',
      description: 'Display three of your favourite memories side by side. Crafted from solid pine with a natural stain, this horizontal triptych frame holds three 4×6 inch photos. Includes glass front for protection and wall-mount hardware.',
      shortDescription: 'Three 4×6 photos in one elegant frame',
      basePrice: 1499,
      discountedPrice: 1199,
      sku: 'CF-TRIO-4X6-001',
      stock: 35,
      isBestSeller: true,
      isFeatured: true,
      categoryId: collageFrames.id,
      specifications: { material: 'Pine Wood', holds: '3 photos', photoSize: '4×6 inch each', orientation: 'Horizontal' },
      images: [
        { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', alt: 'Trio collage frame', isPrimary: true, sortOrder: 0 },
      ],
    },
    {
      slug: 'family-grid-collage-9-photos',
      name: 'Family Grid Collage — 9 Photos',
      description: 'A bold 3×3 grid of your most precious moments. Each slot holds a 4×4 inch print. Made from black-stained mango wood with gold divider hardware. Ships flat-packed and assembles in minutes.',
      shortDescription: '9-photo grid in black mango wood',
      basePrice: 2499,
      discountedPrice: 1999,
      sku: 'CF-GRID-9P-001',
      stock: 25,
      isBestSeller: false,
      isFeatured: true,
      categoryId: collageFrames.id,
      specifications: { material: 'Mango Wood', holds: '9 photos', photoSize: '4×4 inch each', orientation: 'Square Grid' },
      images: [
        { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', alt: 'Family grid collage', isPrimary: true, sortOrder: 0 },
      ],
    },
    // Custom Name Frames
    {
      slug: 'custom-name-frame-couple',
      name: 'Couple Name Frame',
      description: 'A beautifully crafted wooden frame personalised with two names and your special date. Laser-engraved directly onto the frame. Available in 5×7 or 8×10 sizes. Perfect for anniversaries, weddings, and Valentine\'s Day gifts.',
      shortDescription: 'Laser-engraved names + date on wood',
      basePrice: 999,
      discountedPrice: 799,
      sku: 'CNF-COUPLE-001',
      stock: 100,
      isBestSeller: true,
      isFeatured: true,
      categoryId: customNameFrames.id,
      fontOptions: { fonts: ['Classic Serif', 'Modern Script', 'Block Caps', 'Cursive'], maxChars: 20 },
      specifications: { material: 'Sheesham Wood', engraving: 'Laser', customisation: 'Names + Date', sizes: '5×7 / 8×10' },
      images: [
        { url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&q=80', alt: 'Couple name frame', isPrimary: true, sortOrder: 0 },
        { url: 'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=800&q=80', alt: 'Couple name frame detail', sortOrder: 1 },
      ],
    },
    {
      slug: 'baby-name-frame-birth-details',
      name: 'Baby Name Frame with Birth Details',
      description: 'Celebrate a new arrival with this personalised baby frame. Enter baby\'s name, date of birth, weight, and length. Laser-cut letters form the name in the centre with stats below. Available in pink or blue.',
      shortDescription: 'Personalised newborn frame with birth stats',
      basePrice: 1299,
      discountedPrice: 999,
      sku: 'CNF-BABY-001',
      stock: 75,
      isBestSeller: true,
      isFeatured: false,
      categoryId: customNameFrames.id,
      fontOptions: { fonts: ['Rounded', 'Classic', 'Playful'], maxChars: 15 },
      specifications: { material: 'Birchwood', engraving: 'Laser-cut + Print', customisation: 'Name, DOB, Weight, Length', colours: 'Pink / Blue / Natural' },
      images: [
        { url: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&q=80', alt: 'Baby name frame', isPrimary: true, sortOrder: 0 },
      ],
    },
    // LED Frames
    {
      slug: 'led-glow-frame-5x7',
      name: 'LED Glow Frame 5×7',
      description: 'A modern illuminated frame that creates a warm halo around your photo. USB-powered with a touch-sensitive on/off switch. The acrylic front scatters light evenly for a soft, cinematic glow. Three brightness settings.',
      shortDescription: 'USB-powered glow frame with touch control',
      basePrice: 1799,
      discountedPrice: 1499,
      sku: 'LED-GLOW-5X7-001',
      stock: 50,
      isBestSeller: false,
      isFeatured: true,
      categoryId: ledFrames.id,
      specifications: { material: 'Acrylic + Walnut Base', size: '5×7 inch', power: 'USB-C 5V', brightness: '3 settings', touchControl: 'Yes' },
      images: [
        { url: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?w=800&q=80', alt: 'LED glow frame', isPrimary: true, sortOrder: 0 },
      ],
    },
    // Wall Art
    {
      slug: 'canvas-print-24x36',
      name: 'Premium Canvas Print 24×36',
      description: 'Museum-quality giclée print on 400-gsm artist canvas. Upload your photo and we\'ll print it on a gallery-wrapped canvas with 1.5-inch stretcher bars. Arrives ready to hang with mounting hardware included.',
      shortDescription: 'Gallery-wrapped giclée canvas, ready to hang',
      basePrice: 2999,
      discountedPrice: 2499,
      sku: 'WA-CANVAS-24X36-001',
      stock: 200,
      isBestSeller: true,
      isFeatured: true,
      categoryId: wallArt.id,
      specifications: { material: '400 GSM Artist Canvas', size: '24×36 inch', print: 'Giclée', frame: '1.5-inch Gallery Wrap', hanging: 'Included' },
      images: [
        { url: 'https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=800&q=80', alt: 'Canvas print', isPrimary: true, sortOrder: 0 },
      ],
    },
    {
      slug: 'metal-print-12x16',
      name: 'Aluminium Metal Print 12×16',
      description: 'Vivid photo printed directly onto brushed aluminium. The metallic sheen adds depth to colours and makes highlights pop. Lightweight, waterproof, and scratch-resistant. Comes with a standoff mount for a floating-on-wall effect.',
      shortDescription: 'Vibrant photo on brushed aluminium with float mount',
      basePrice: 1999,
      discountedPrice: null,
      sku: 'WA-METAL-12X16-001',
      stock: 30,
      isBestSeller: false,
      isFeatured: false,
      categoryId: wallArt.id,
      specifications: { material: 'Brushed Aluminium', size: '12×16 inch', print: 'Direct Dye-Sub', mount: 'Float Standoff', waterproof: 'Yes' },
      images: [
        { url: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800&q=80', alt: 'Metal print', isPrimary: true, sortOrder: 0 },
      ],
    },
    // Digital Prints (under ₹999)
    {
      slug: 'art-print-a4-minimal',
      name: 'Minimal Art Print A4',
      description: 'Downloadable or printed minimal wall art on 250-gsm silk paper. Choose from 12 curated designs. Ships in a protective tube. Frame not included.',
      shortDescription: 'Curated minimal poster on premium silk paper',
      basePrice: 499,
      discountedPrice: 399,
      sku: 'DP-A4-MIN-001',
      stock: 500,
      isBestSeller: false,
      isFeatured: false,
      categoryId: digitalPrints.id,
      specifications: { material: '250 GSM Silk Paper', size: 'A4 (8.27×11.69 inch)', print: 'Offset Litho', packaging: 'Protective Tube' },
      images: [
        { url: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80', alt: 'Minimal art print A4', isPrimary: true, sortOrder: 0 },
      ],
    },
    {
      slug: 'botanical-print-set-3',
      name: 'Botanical Print Set of 3',
      description: 'A curated set of three botanical illustrations on fine art paper. Each print is A5 size, unframed, and ships in a rigid mailer to prevent damage. Mix and match in a gallery wall.',
      shortDescription: 'Set of 3 botanical illustrations on fine art paper',
      basePrice: 799,
      discountedPrice: 649,
      sku: 'DP-BOT-3SET-001',
      stock: 300,
      isBestSeller: false,
      isFeatured: false,
      categoryId: digitalPrints.id,
      specifications: { material: '300 GSM Fine Art Paper', size: 'A5 (5.83×8.27 inch)', prints: '3 per set', packaging: 'Rigid Mailer' },
      images: [
        { url: 'https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?w=800&q=80', alt: 'Botanical print set', isPrimary: true, sortOrder: 0 },
      ],
    },
  ]

  let createdProducts = 0
  for (const p of products) {
    const { images, ...productData } = p
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        ...productData,
        basePrice: productData.basePrice,
        discountedPrice: productData.discountedPrice ?? undefined,
        images: {
          create: images.map((img) => ({
            url: img.url,
            alt: img.alt,
            isPrimary: img.isPrimary ?? false,
            sortOrder: img.sortOrder,
          })),
        },
      },
    })
    createdProducts++
  }
  console.log(`✅ Products: ${createdProducts}`)

  // ─── Product Variants (for custom name frame) ────────────────────────────────
  const coupleFrame = await prisma.product.findUnique({ where: { slug: 'custom-name-frame-couple' } })
  if (coupleFrame) {
    for (const [name, sku, priceModifier] of [
      ['5×7 inch', 'CNF-COUPLE-5X7', 0],
      ['8×10 inch', 'CNF-COUPLE-8X10', 300],
    ] as const) {
      await prisma.productVariant.upsert({
        where: { sku },
        update: {},
        create: { productId: coupleFrame.id, name, sku, priceModifier, stock: 50 },
      })
    }
  }

  // ─── Price Tiers (bulk discount for canvas prints) ───────────────────────────
  const canvasProduct = await prisma.product.findUnique({ where: { slug: 'canvas-print-24x36' } })
  if (canvasProduct) {
    for (const [minQty, pricePerUnit] of [[2, 2299], [5, 1999]] as const) {
      await prisma.productPriceTier.upsert({
        where: { productId_minQty: { productId: canvasProduct.id, minQty } },
        update: {},
        create: { productId: canvasProduct.id, minQty, pricePerUnit },
      })
    }
  }
  console.log('✅ Variants & price tiers')

  // ─── Banners ──────────────────────────────────────────────────────────────────
  const banners = [
    {
      image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=1600&q=80',
      mobileImage: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&q=80',
      title: 'Memories Worth Framing',
      subtitle: 'Handcrafted wooden frames for every story',
      link: '/shop',
      type: BannerType.HEADER_SLIDER,
      sortOrder: 1,
    },
    {
      image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=1600&q=80',
      mobileImage: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&q=80',
      title: 'Custom Name Frames',
      subtitle: 'Personalised with love — from ₹799',
      link: '/shop?categoryId=custom-name-frames',
      type: BannerType.HEADER_SLIDER,
      sortOrder: 2,
    },
    {
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80',
      mobileImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
      title: 'Collage Frames — New Arrivals',
      subtitle: 'Tell your story across multiple prints',
      link: '/shop?categoryId=collage-frames',
      type: BannerType.HEADER_SLIDER,
      sortOrder: 3,
    },
    {
      image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1200&q=80',
      title: 'Free shipping on orders above ₹999',
      subtitle: 'Discover our latest personalised collections',
      link: '/shop',
      type: BannerType.TOP_STRIP,
      sortOrder: 1,
    },
    {
      image: 'https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?w=1200&q=80',
      title: 'Frames Under ₹999',
      subtitle: 'Quality frames that won\'t break the bank',
      link: '/shop?maxPrice=999',
      type: BannerType.UNDER_999,
      sortOrder: 1,
    },
    {
      image: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?w=1200&q=80',
      title: 'LED Frames — Light Up Your Memories',
      subtitle: 'USB-powered glow frames from ₹1499',
      link: '/shop?categoryId=led-frames',
      type: BannerType.PROMOTIONAL,
      sortOrder: 1,
    },
  ]

  for (const banner of banners) {
    const existing = await prisma.banner.findFirst({ where: { title: banner.title, type: banner.type } })
    if (!existing) {
      await prisma.banner.create({ data: banner })
    }
  }
  console.log(`✅ Banners: ${banners.length}`)

  // ─── Shipping Rates ───────────────────────────────────────────────────────────
  const states = [
    'Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Telangana',
    'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'West Bengal', 'Kerala',
    'Madhya Pradesh', 'Andhra Pradesh', 'Haryana', 'Punjab', 'Odisha',
    'Assam', 'Jharkhand', 'Uttarakhand', 'Himachal Pradesh', 'Goa',
    'Bihar', 'Chhattisgarh', 'Jammu and Kashmir', 'Manipur', 'Meghalaya',
    'Nagaland', 'Tripura', 'Arunachal Pradesh', 'Mizoram', 'Sikkim',
    'Chandigarh', 'Puducherry', 'Ladakh',
  ]

  for (const state of states) {
    const freeExists = await prisma.shippingRate.findFirst({
      where: { state, minOrderValue: 999, productCategoryId: null },
    })
    if (!freeExists) {
      await prisma.shippingRate.create({ data: { state, minOrderValue: 999, shippingCharge: 0 } })
    }
    const paidExists = await prisma.shippingRate.findFirst({
      where: { state, minOrderValue: 0, productCategoryId: null },
    })
    if (!paidExists) {
      await prisma.shippingRate.create({ data: { state, minOrderValue: 0, shippingCharge: 79 } })
    }
  }
  console.log(`✅ Shipping rates: ${states.length * 2}`)

  // ─── Pincode Serviceability ───────────────────────────────────────────────────
  const pincodes = [
    // Delhi NCR
    { pincode: '110001', estimatedDays: 2, courierPartner: 'Delhivery' },
    { pincode: '110002', estimatedDays: 2, courierPartner: 'Delhivery' },
    { pincode: '110010', estimatedDays: 2, courierPartner: 'Delhivery' },
    { pincode: '110020', estimatedDays: 2, courierPartner: 'Delhivery' },
    { pincode: '122001', estimatedDays: 2, courierPartner: 'Delhivery' }, // Gurgaon
    { pincode: '201301', estimatedDays: 2, courierPartner: 'Delhivery' }, // Noida
    // Mumbai
    { pincode: '400001', estimatedDays: 3, courierPartner: 'BlueDart' },
    { pincode: '400010', estimatedDays: 3, courierPartner: 'BlueDart' },
    { pincode: '400050', estimatedDays: 3, courierPartner: 'BlueDart' },
    { pincode: '400076', estimatedDays: 3, courierPartner: 'BlueDart' },
    // Bangalore
    { pincode: '560001', estimatedDays: 3, courierPartner: 'Delhivery' },
    { pincode: '560010', estimatedDays: 3, courierPartner: 'Delhivery' },
    { pincode: '560030', estimatedDays: 3, courierPartner: 'Delhivery' },
    { pincode: '560040', estimatedDays: 3, courierPartner: 'Delhivery' },
    // Chennai
    { pincode: '600001', estimatedDays: 3, courierPartner: 'Delhivery' },
    { pincode: '600010', estimatedDays: 3, courierPartner: 'Delhivery' },
    { pincode: '600020', estimatedDays: 3, courierPartner: 'Delhivery' },
    // Hyderabad
    { pincode: '500001', estimatedDays: 3, courierPartner: 'Delhivery' },
    { pincode: '500010', estimatedDays: 3, courierPartner: 'Delhivery' },
    { pincode: '500032', estimatedDays: 3, courierPartner: 'Delhivery' },
    // Pune
    { pincode: '411001', estimatedDays: 3, courierPartner: 'BlueDart' },
    { pincode: '411020', estimatedDays: 3, courierPartner: 'BlueDart' },
    // Kolkata
    { pincode: '700001', estimatedDays: 4, courierPartner: 'Delhivery' },
    { pincode: '700010', estimatedDays: 4, courierPartner: 'Delhivery' },
    // Ahmedabad
    { pincode: '380001', estimatedDays: 3, courierPartner: 'Delhivery' },
    { pincode: '380010', estimatedDays: 3, courierPartner: 'Delhivery' },
    // Jaipur
    { pincode: '302001', estimatedDays: 4, courierPartner: 'Delhivery' },
    // Lucknow
    { pincode: '226001', estimatedDays: 4, courierPartner: 'Delhivery' },
    // Chandigarh
    { pincode: '160001', estimatedDays: 3, courierPartner: 'Delhivery' },
    // Kochi
    { pincode: '682001', estimatedDays: 4, courierPartner: 'BlueDart' },
  ]

  for (const p of pincodes) {
    await prisma.pincodeServiceability.upsert({
      where: { pincode: p.pincode },
      update: {},
      create: { ...p, isServiceable: true },
    })
  }
  console.log(`✅ Pincode serviceability: ${pincodes.length}`)

  // ─── FAQs ─────────────────────────────────────────────────────────────────────
  const faqs = [
    // Orders
    { category: 'orders', question: 'How do I track my order?', answer: 'Once your order ships, you\'ll receive an SMS and email with your AWB tracking number. You can also track it in real-time on the Orders page in your account.', sortOrder: 1 },
    { category: 'orders', question: 'Can I cancel or modify my order?', answer: 'Orders can be cancelled within 2 hours of placement as long as they haven\'t entered processing. To cancel, go to My Orders → Select Order → Cancel Order. Modifications are not currently supported; please cancel and re-order.', sortOrder: 2 },
    { category: 'orders', question: 'How do I return or exchange a product?', answer: 'We accept returns within 7 days of delivery for non-personalised items in original condition. Custom / personalised products are non-returnable unless damaged. Raise a return request via My Orders and we\'ll arrange a free pickup.', sortOrder: 3 },
    { category: 'orders', question: 'What is your refund policy?', answer: 'Refunds for eligible items are processed within 5-7 business days to the original payment method. For cash-on-delivery orders, refunds are issued as Frames41 store credit.', sortOrder: 4 },
    // Shipping
    { category: 'shipping', question: 'How long does delivery take?', answer: 'Standard delivery takes 5-7 business days. Express delivery (2-3 days) is available for select pincodes. Personalised and custom items may take 1-2 additional days for production.', sortOrder: 1 },
    { category: 'shipping', question: 'Is shipping free?', answer: 'Yes! We offer free standard shipping on all orders above ₹999. Orders below ₹999 are charged a flat ₹79 shipping fee.', sortOrder: 2 },
    { category: 'shipping', question: 'Do you deliver to my pincode?', answer: 'We deliver to 20,000+ pincodes across India. Enter your pincode on the product page to check serviceability and estimated delivery date.', sortOrder: 3 },
    { category: 'shipping', question: 'Can I change my delivery address after placing an order?', answer: 'Address changes are possible within 1 hour of placing the order. Contact our support team via WhatsApp or email with your order number and new address.', sortOrder: 4 },
    // Customization
    { category: 'customization', question: 'How do I add customisation to a frame?', answer: 'On the product page, select your options (font, size, colour) and enter your personalisation details in the provided fields before adding to cart. Preview is shown in real-time.', sortOrder: 1 },
    { category: 'customization', question: 'What file format should I upload for photos?', answer: 'We accept JPEG, PNG, and TIFF files. For best print quality, upload images with a resolution of at least 300 DPI or a minimum of 2MP. We\'ll notify you if the image quality may affect the print.', sortOrder: 2 },
    { category: 'customization', question: 'Can I see a proof before printing?', answer: 'For orders above ₹1999, we send a digital proof via WhatsApp within 24 hours of order confirmation. You can approve or request changes before we proceed to print.', sortOrder: 3 },
    { category: 'customization', question: 'What fonts are available for name frames?', answer: 'We currently offer 8 font styles: Classic Serif, Modern Script, Block Caps, Cursive, Minimalist Sans, Bold Italic, Handwritten, and Formal. Samples are shown on each product page.', sortOrder: 4 },
    // Sustainability
    { category: 'sustainability', question: 'What materials do you use?', answer: 'We use sustainably sourced solid wood (oak, walnut, mango, sheesham) certified by the Forest Stewardship Council (FSC). Our MDF products are formaldehyde-free and our packaging is 100% recycled cardboard.', sortOrder: 1 },
    { category: 'sustainability', question: 'Are your inks eco-friendly?', answer: 'Yes. All prints use water-based, VOC-free pigment inks that are non-toxic and skin-safe. Our printing partners are ISO 14001 certified for environmental management.', sortOrder: 2 },
    { category: 'sustainability', question: 'Do you have a recycling programme?', answer: 'We\'re launching our Frame-Back programme in 2025: send us your old Frames41 frames and we\'ll refurbish or recycle them responsibly, giving you ₹100 store credit per frame returned.', sortOrder: 3 },
  ]

  for (const faq of faqs) {
    const existing = await prisma.fAQ.findFirst({ where: { question: faq.question } })
    if (!existing) {
      await prisma.fAQ.create({ data: { ...faq, isActive: true } })
    }
  }
  console.log(`✅ FAQs: ${faqs.length}`)

  // ─── Blog Posts ───────────────────────────────────────────────────────────────
  const posts = [
    {
      slug: 'how-to-choose-the-right-frame',
      title: 'How to Choose the Right Frame for Your Photo',
      content: `Choosing the right frame can transform a good photo into a stunning piece of wall art. Here's what to consider.

**Material Matters**
Solid wood frames — oak, walnut, sheesham — add warmth and texture to any room. They work especially well with warm-toned photos and rustic interiors. MDF frames with a lacquer finish are more versatile and suit modern, minimalist spaces.

**Match the Frame to the Room**
Dark walnut frames pair beautifully with leather furniture and warm lighting. White or light wood frames open up a space and suit Scandinavian or coastal interiors. Black frames are timeless and work in almost any setting.

**Consider the Mat**
A mat (the white or cream border inside the frame) creates visual breathing room around the photo. A 2-inch mat is standard; wider mats give a gallery feel. Skip the mat for modern, full-bleed prints.

**Size Proportions**
The frame should be proportional to the photo and the wall. A 4×6 photo in an 8×10 frame with a wide mat looks intentional and elegant. A frame too large for a small print looks lost.

**Colour Harmony**
Pick up a dominant colour from the photo for the frame colour. A coastal photo with blues and whites works brilliantly in a white oak frame. A warm autumn portrait pops in a deep walnut.`,
      excerpt: 'A frame can make or break a photograph. Here\'s how to choose one that elevates your memories.',
      coverImage: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=1200&q=80',
      author: 'Frames41 Studio',
      publishedAt: new Date('2025-03-15'),
      isPublished: true,
      metaTitle: 'How to Choose the Right Photo Frame — Frames41',
      metaDescription: 'A practical guide to choosing wooden and acrylic photo frames that match your photos and interior.',
    },
    {
      slug: 'gallery-wall-guide',
      title: 'The Complete Guide to Creating a Gallery Wall',
      content: `A gallery wall is one of the most impactful ways to personalise a space. Here\'s a step-by-step guide.

**Plan Before You Hang**
Lay out all your frames on the floor first. Experiment with spacing (we recommend 2-3 inches between frames) and composition before making any holes in the wall.

**Choose a Visual Anchor**
Pick one large or statement piece as the anchor — usually placed at eye level in the centre. Build outward from there, balancing dark and light frames.

**Mix Frame Sizes and Styles**
Variety is the spice of gallery walls. Mix portrait and landscape orientations, large prints with small ones. Use a unifying element — like all black frames or all wooden frames — to keep it cohesive.

**Use Templates**
Trace each frame on paper, cut it out, and tape the paper templates to the wall before hanging. This lets you fine-tune the arrangement without putting holes in the wall.

**Mind the Proportions**
A gallery wall should take up 60-75% of a wall's width. Too small and it looks lost; too large and it overwhelms. Above a sofa, stay within the sofa's width.`,
      excerpt: 'Transform a blank wall into a curated gallery with this step-by-step guide.',
      coverImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
      author: 'Frames41 Studio',
      publishedAt: new Date('2025-04-02'),
      isPublished: true,
      metaTitle: 'Gallery Wall Guide — How to Create a Perfect Gallery Wall',
      metaDescription: 'Step-by-step guide to planning and creating a gallery wall with photo frames.',
    },
    {
      slug: 'personalised-gifts-2025',
      title: '10 Personalised Gift Ideas for Every Occasion in 2025',
      content: `Personalised gifts are meaningful because they show thought and effort. Here are 10 ideas using custom frames.

1. **Couple Name Frame** — Perfect for anniversaries, Valentine\'s Day, or wedding gifts.
2. **Baby Name Frame** — Celebrate a new arrival with birth details laser-engraved on birchwood.
3. **Travel Photo Collage** — A triptych of your best travel shots for a wanderlust friend.
4. **Family Grid Frame** — Nine family photos in one grid frame for parents or grandparents.
5. **LED Glow Frame** — A modern, illuminated display for that tech-savvy friend.
6. **Canvas Print** — Their favourite photo blown up to gallery size.
7. **Graduation Frame** — Engraved with graduation year and name.
8. **Pet Portrait Frame** — Because pets deserve wall space too.
9. **Recipe Frame** — Preserve grandma\'s handwritten recipe as wall art.
10. **Friendship Collage** — Your best group photos in a collage for a friend moving away.`,
      excerpt: 'From anniversaries to baby showers, here are 10 personalised frame gift ideas that will be remembered.',
      coverImage: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=1200&q=80',
      author: 'Frames41 Studio',
      publishedAt: new Date('2025-05-01'),
      isPublished: true,
      metaTitle: '10 Personalised Gift Ideas — Custom Frames41',
      metaDescription: 'Unique personalised gift ideas using custom photo frames for every occasion.',
    },
  ]

  for (const post of posts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: post,
    })
  }
  console.log(`✅ Blog posts: ${posts.length}`)

  console.log('\n🎉 Seeding complete!')
  console.log(`
Summary:
  • 1 Admin user
  • ${cats.length} Categories
  • ${createdProducts} Products (with images, variants, price tiers)
  • ${banners.length} Banners
  • ${states.length * 2} Shipping rates (all Indian states)
  • ${pincodes.length} Pincode serviceability records
  • ${faqs.length} FAQs
  • ${posts.length} Blog posts
  `)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
