import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding sample products...');

  // ─── Categories ─────────────────────────────────────────────────────────────
  const categories = await Promise.all([
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
        description: 'Decorative wall art pieces for every room',
        sortOrder: 5,
        image: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=800&q=80',
      },
    }),
  ]);

  const catMap = Object.fromEntries(categories.map((c) => [c.slug, c.id]));
  console.log('✅ Categories:', categories.map((c) => c.name).join(', '));

  // ─── Products ───────────────────────────────────────────────────────────────
  const productsData = [
    {
      slug: 'classic-wooden-photo-frame',
      name: 'Classic Wooden Photo Frame',
      description:
        'A timeless wooden photo frame crafted from premium MDF. Perfect for displaying your cherished memories. Features a smooth finish and sturdy back stand. Available in multiple sizes.',
      shortDescription: 'Timeless wooden frame for your memories',
      basePrice: 599.00,
      discountedPrice: 499.00,
      sku: 'FRM-WD-001',
      stock: 50,
      isBestSeller: true,
      isFeatured: true,
      categorySlug: 'photo-frames',
      weight: 0.5,
      dimensions: { width: 25, height: 30, depth: 2, unit: 'cm' },
      images: [
        { url: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=800&q=80', alt: 'Classic Wooden Photo Frame', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80', alt: 'Frame detail view' },
      ],
      variants: [
        { name: '4x6 inches', priceModifier: 0, stock: 20, sku: 'FRM-WD-001-4X6', attributes: { size: '4x6' } },
        { name: '5x7 inches', priceModifier: 100, stock: 15, sku: 'FRM-WD-001-5X7', attributes: { size: '5x7' } },
        { name: '8x10 inches', priceModifier: 250, stock: 15, sku: 'FRM-WD-001-8X10', attributes: { size: '8x10' } },
      ],
      priceTiers: [
        { minQty: 5, pricePerUnit: 449.00 },
        { minQty: 10, pricePerUnit: 399.00 },
      ],
    },
    {
      slug: 'acrylic-clear-frame',
      name: 'Acrylic Clear Frame',
      description:
        'Modern minimalist acrylic frame with crystal-clear finish. Floating design makes your photo appear suspended in air. Perfect for contemporary interiors.',
      shortDescription: 'Modern floating acrylic frame',
      basePrice: 899.00,
      sku: 'FRM-AC-002',
      stock: 30,
      isFeatured: true,
      categorySlug: 'photo-frames',
      weight: 0.3,
      dimensions: { width: 20, height: 25, depth: 1.5, unit: 'cm' },
      images: [
        { url: 'https://images.unsplash.com/photo-1533158388470-9a56699990c6?w=800&q=80', alt: 'Acrylic Clear Frame', isPrimary: true },
      ],
      variants: [
        { name: 'Standard', priceModifier: 0, stock: 30, sku: 'FRM-AC-002-STD', attributes: { size: 'Standard' } },
      ],
    },
    {
      slug: 'family-collage-frame-6-photos',
      name: 'Family Collage Frame - 6 Photos',
      description:
        'Beautiful collage frame that holds 6 photos in an elegant layout. Perfect for family portraits, wedding memories, or vacation snapshots. Includes mounting hardware.',
      shortDescription: 'Hold 6 memories in one beautiful frame',
      basePrice: 1299.00,
      discountedPrice: 1099.00,
      sku: 'CLG-006-001',
      stock: 25,
      isBestSeller: true,
      categorySlug: 'collage-frames',
      weight: 1.2,
      dimensions: { width: 50, height: 60, depth: 3, unit: 'cm' },
      images: [
        { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', alt: 'Family Collage Frame', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=800&q=80', alt: 'Collage layout detail' },
      ],
      variants: [
        { name: 'Black', priceModifier: 0, stock: 15, sku: 'CLG-006-001-BLK', attributes: { color: 'Black' } },
        { name: 'White', priceModifier: 0, stock: 10, sku: 'CLG-006-001-WHT', attributes: { color: 'White' } },
      ],
    },
    {
      slug: 'custom-name-led-frame',
      name: 'Custom Name LED Frame',
      description:
        'Personalised LED frame with your name illuminated in warm white light. Perfect for bedrooms, nurseries, or as a unique gift. Energy-efficient LED strip with USB power.',
      shortDescription: 'Your name in lights',
      basePrice: 1499.00,
      discountedPrice: 1299.00,
      sku: 'LED-NM-001',
      stock: 20,
      isFeatured: true,
      categorySlug: 'led-frames',
      weight: 0.8,
      dimensions: { width: 40, height: 30, depth: 5, unit: 'cm' },
      images: [
        { url: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?w=800&q=80', alt: 'Custom Name LED Frame', isPrimary: true },
      ],
      variants: [
        { name: 'Warm White', priceModifier: 0, stock: 12, sku: 'LED-NM-001-WW', attributes: { lightColor: 'Warm White' } },
        { name: 'RGB Multicolor', priceModifier: 300, stock: 8, sku: 'LED-NM-001-RGB', attributes: { lightColor: 'RGB' } },
      ],
    },
    {
      slug: 'geometric-wall-art-set',
      name: 'Geometric Wall Art Set',
      description:
        'Set of 3 geometric wall art pieces in modern minimalist style. Laser-cut MDF with precision detailing. Easy to mount and paintable to match your decor.',
      shortDescription: 'Modern geometric wall art set of 3',
      basePrice: 799.00,
      sku: 'ART-GEO-001',
      stock: 40,
      categorySlug: 'wall-art',
      weight: 0.6,
      dimensions: { width: 30, height: 30, depth: 0.5, unit: 'cm' },
      images: [
        { url: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=800&q=80', alt: 'Geometric Wall Art', isPrimary: true },
      ],
      variants: [
        { name: 'Set of 3', priceModifier: 0, stock: 40, sku: 'ART-GEO-001-3', attributes: { pieces: 3 } },
      ],
    },
    {
      slug: 'vintage-ornate-frame',
      name: 'Vintage Ornate Frame',
      description:
        'Intricately carved vintage-style frame with gold leaf detailing. Adds a touch of elegance to any photograph. Perfect for formal portraits and special occasions.',
      shortDescription: 'Elegant vintage frame with gold detailing',
      basePrice: 1599.00,
      discountedPrice: 1399.00,
      sku: 'FRM-VN-003',
      stock: 15,
      isFeatured: true,
      categorySlug: 'photo-frames',
      weight: 0.9,
      dimensions: { width: 28, height: 35, depth: 2.5, unit: 'cm' },
      images: [
        { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80', alt: 'Vintage Ornate Frame', isPrimary: true },
      ],
      variants: [
        { name: 'Gold', priceModifier: 0, stock: 10, sku: 'FRM-VN-003-GLD', attributes: { finish: 'Gold' } },
        { name: 'Silver', priceModifier: 0, stock: 5, sku: 'FRM-VN-003-SLV', attributes: { finish: 'Silver' } },
      ],
    },
  ];

  for (const pd of productsData) {
    const product = await prisma.product.upsert({
      where: { slug: pd.slug },
      update: {},
      create: {
        slug: pd.slug,
        name: pd.name,
        description: pd.description,
        shortDescription: pd.shortDescription,
        basePrice: pd.basePrice,
        discountedPrice: pd.discountedPrice,
        sku: pd.sku,
        stock: pd.stock,
        isBestSeller: pd.isBestSeller ?? false,
        isFeatured: pd.isFeatured ?? false,
        categoryId: catMap[pd.categorySlug],
        weight: pd.weight,
        dimensions: pd.dimensions,
        images: {
          create: pd.images,
        },
        variants: {
          create: pd.variants,
        },
        priceTiers: pd.priceTiers
          ? { create: pd.priceTiers }
          : undefined,
      },
    });
    console.log(`✅ Product: ${product.name}`);
  }

  // ─── Banners ────────────────────────────────────────────────────────────────
  const banners = await Promise.all([
    prisma.banner.upsert({
      where: { id: '00000000-0000-0000-0000-000000000001' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000001',
        image: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=1600&q=80',
        mobileImage: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=800&q=80',
        title: 'Frame Your Memories',
        subtitle: 'Handcrafted photo frames starting from ₹499',
        link: '/shop',
        sortOrder: 1,
        type: 'HEADER_SLIDER',
        isActive: true,
      },
    }),
    prisma.banner.upsert({
      where: { id: '00000000-0000-0000-0000-000000000002' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000002',
        image: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?w=1600&q=80',
        mobileImage: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?w=800&q=80',
        title: 'Light Up Your Space',
        subtitle: 'LED frames with custom names — perfect gifts',
        link: '/shop/led-frames',
        sortOrder: 2,
        type: 'HEADER_SLIDER',
        isActive: true,
      },
    }),
    prisma.banner.upsert({
      where: { id: '00000000-0000-0000-0000-000000000003' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000003',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80',
        mobileImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
        title: 'Collage Frames',
        subtitle: 'Display multiple memories in one beautiful frame',
        link: '/shop/collage-frames',
        sortOrder: 3,
        type: 'HEADER_SLIDER',
        isActive: true,
      },
    }),
  ]);

  console.log('✅ Banners:', banners.length);

  console.log('\n🎉 Sample data seeded successfully!');
  console.log('   Categories:', categories.length);
  console.log('   Products:', productsData.length);
  console.log('   Banners:', banners.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });