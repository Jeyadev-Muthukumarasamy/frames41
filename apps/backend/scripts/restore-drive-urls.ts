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
    .replace(/['\"“”‘’]/g, '')
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
  const items: DriveProduct[] = JSON.parse(raw)

  for (const item of items) {
    const categoryName = item.category?.trim() || 'uncategorized'
    const productSlug = slugify(`${categoryName} ${item.name}`)

    const product = await prisma.product.findUnique({ where: { slug: productSlug }, include: { images: true } })
    if (!product) continue

    const url = item.imageUrl
    if (product.images && product.images.length > 0) {
      const primary = product.images.find((i) => i.isPrimary) || product.images[0]
      await prisma.productImage.update({ where: { id: primary.id }, data: { url, alt: item.name } })
      console.log(`Updated image URL for ${productSlug}`)
    } else {
      await prisma.productImage.create({ data: { productId: product.id, url, alt: item.name, isPrimary: true } })
      console.log(`Created image for ${productSlug}`)
    }

    // Ensure name customization is enabled
    if (/keychain/i.test(categoryName)) {
      const cfg = product.customizationConfig || {}
      if (!cfg.numberOfNames || !cfg.numberOfNames.enabled) {
        const newCfg = { ...cfg, numberOfNames: { enabled: true, count: 1 } }
        await prisma.product.update({ where: { id: product.id }, data: { customizationConfig: newCfg } })
        console.log(`Enabled name customization for ${productSlug}`)
      }
    }
  }

  console.log('✅ Restored Drive URLs and ensured name customization')
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
