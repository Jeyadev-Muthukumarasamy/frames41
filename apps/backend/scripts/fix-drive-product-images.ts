import 'dotenv/config'
import { readFile } from 'node:fs/promises'
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
  const drivePath = path.join(process.cwd(), '../frontend/src/data/drive-products.json')
  const raw = await readFile(drivePath, 'utf8')
  const driveProducts: DriveProduct[] = JSON.parse(raw)

  for (const item of driveProducts) {
    const categoryName = item.category?.trim() || 'uncategorized'
    const productSlug = slugify(`${categoryName} ${item.name}`)

    const product = await prisma.product.findUnique({ where: { slug: productSlug }, include: { images: true } })
    if (!product) continue

    if (!product.images || product.images.length === 0) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: item.imageUrl,
          alt: item.name,
          sortOrder: 0,
          isPrimary: true,
        },
      })
      console.log(`Added image for ${product.slug}`)
    }

    // Apply sensible defaults for customization on keychain categories
    const isKeychain = /keychain/i.test(categoryName)
    if (isKeychain && !product.customizationConfig) {
      const defaultConfig = {
        numberOfImages: { enabled: true, count: 1 },
        numberOfNames: { enabled: true, count: 1 },
      }
      await prisma.product.update({ where: { id: product.id }, data: { customizationConfig: defaultConfig } })
      console.log(`Set customizationConfig for ${product.slug}`)
    }
  }

  console.log('✅ Backfill complete')
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
