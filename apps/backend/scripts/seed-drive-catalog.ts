import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/['"“”‘’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function parseSortOrder(value: string): number {
  const match = value.trim().match(/^([0-9]+)[\s-]+/)
  if (match) {
    return Number(match[1])
  }
  return 999
}

interface DriveProduct {
  id: string
  name: string
  category: string
  page: string | null
  source: string
  imageUrl: string
  drivePath: string
}

async function main(): Promise<void> {
  const basePath = process.cwd()
  const possiblePaths = [
    path.join(basePath, '../frontend/src/data/drive-products.json'),
    path.join(basePath, '../frames41-frontend/src/data/drive-products.json'),
    path.join(basePath, '../Client/src/data/drive-products.json'),
  ]

  let driveProductsPath: string | undefined
  for (const candidate of possiblePaths) {
    try {
      await readFile(candidate, 'utf8')
      driveProductsPath = candidate
      break
    } catch {
      continue
    }
  }

  if (!driveProductsPath) {
    throw new Error(
      `Could not find drive products JSON in any known location: ${possiblePaths.join(', ')}`,
    )
  }

  const raw = await readFile(driveProductsPath, 'utf8')
  const driveProducts: DriveProduct[] = JSON.parse(raw)

  if (!Array.isArray(driveProducts) || driveProducts.length === 0) {
    throw new Error(`Drive product catalog is empty or invalid: ${driveProductsPath}`)
  }

  const categoryOrderMap = new Map<string, number>()
  const categoryImageMap = new Map<string, string>()
  const categoryNames: string[] = []

  for (const item of driveProducts) {
    const category = item.category?.trim() || 'uncategorized'
    if (!categoryOrderMap.has(category)) {
      categoryOrderMap.set(category, parseSortOrder(category))
      categoryNames.push(category)
    }
    if (!categoryImageMap.has(category) && item.imageUrl) {
      categoryImageMap.set(category, item.imageUrl)
    }
  }

  const categorySlugMap = new Map<string, string>()
  const categoryIds = new Map<string, string>()

  for (const categoryName of categoryNames) {
    const slug = slugify(categoryName)
    categorySlugMap.set(categoryName, slug)

    const category = await prisma.category.upsert({
      where: { slug },
      update: {
        name: categoryName,
        description: `Browse our ${categoryName} collection`,
        sortOrder: categoryOrderMap.get(categoryName) ?? 999,
        image: categoryImageMap.get(categoryName) ?? undefined,
        isActive: true,
      },
      create: {
        slug,
        name: categoryName,
        description: `Browse our ${categoryName} collection`,
        sortOrder: categoryOrderMap.get(categoryName) ?? 999,
        image: categoryImageMap.get(categoryName) ?? undefined,
        isActive: true,
      },
    })

    categoryIds.set(categoryName, category.id)
  }

  const productSlugs: string[] = []

  for (const item of driveProducts) {
    const categoryName = item.category?.trim() || 'uncategorized'
    const categoryId = categoryIds.get(categoryName)
    if (!categoryId) continue

    const productSlug = slugify(`${categoryName} ${item.name}`)
    productSlugs.push(productSlug)

    await prisma.product.upsert({
      where: { slug: productSlug },
      update: {
        name: item.name,
        description: `Handcrafted ${categoryName} product - ${item.name}. Discover our curated collection of ${categoryName}.`,
        shortDescription: `Custom ${categoryName} product`,
        basePrice: 399,
        discountedPrice: 349,
        stock: 100,
        isActive: true,
        isFeatured: false,
        isBestSeller: false,
        categoryId,
        metaTitle: item.name,
        metaDescription: `Order ${item.name} from our ${categoryName} collection`,
      },
      create: {
        slug: productSlug,
        name: item.name,
        description: `Handcrafted ${categoryName} product - ${item.name}. Discover our curated collection of ${categoryName}.`,
        shortDescription: `Custom ${categoryName} product`,
        basePrice: 399,
        discountedPrice: 349,
        sku: `DRIVE-${productSlug.toUpperCase()}`,
        stock: 100,
        isActive: true,
        isFeatured: false,
        isBestSeller: false,
        categoryId,
        metaTitle: item.name,
        metaDescription: `Order ${item.name} from our ${categoryName} collection`,
        images: {
          create: [
            {
              url: item.imageUrl,
              alt: item.name,
              isPrimary: true,
              sortOrder: 0,
            },
          ],
        },
      },
    })
  }

  await prisma.product.updateMany({
    where: { slug: { notIn: productSlugs } },
    data: { isActive: false },
  })

  await prisma.category.updateMany({
    where: { slug: { notIn: Array.from(categorySlugMap.values()) } },
    data: { isActive: false },
  })

  console.log(`✅ Seeded ${productSlugs.length} drive catalog products from ${driveProductsPath}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
