import 'dotenv/config'
import fs from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import fetch from 'node-fetch'
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

async function download(url: string, dest: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`)
  const buffer = await res.arrayBuffer()
  await writeFile(dest, Buffer.from(buffer))
}

async function main() {
  const drivePath = path.join(process.cwd(), '../frontend/src/data/drive-products.json')
  const raw = await fs.promises.readFile(drivePath, 'utf8')
  const driveProducts = JSON.parse(raw)

  const outDir = path.join(process.cwd(), 'public', 'uploads', 'drive')
  await mkdir(outDir, { recursive: true })

  for (const item of driveProducts) {
    const categoryName = item.category?.trim() || 'uncategorized'
    const productSlug = slugify(`${categoryName} ${item.name}`)

    // Determine extension from imageUrl
    const url = item.imageUrl
    const extMatch = url.match(/\.(png|jpe?g|webp)(?:\?|$)/i)
    const ext = extMatch ? extMatch[1] : 'png'
    const filename = `${productSlug}.${ext}`
    const dest = path.join(outDir, filename)

    try {
      await download(url, dest)
      console.log(`Downloaded ${filename}`)

      // Update or create productImage to point to local path
      const product = await prisma.product.findUnique({ where: { slug: productSlug }, include: { images: true } })
      if (!product) continue

      const publicUrl = `/uploads/drive/${filename}`

      if (product.images && product.images.length > 0) {
        // Update primary image
        const primary = product.images.find((i) => i.isPrimary) || product.images[0]
        await prisma.productImage.update({ where: { id: primary.id }, data: { url: publicUrl, alt: item.name } })
      } else {
        await prisma.productImage.create({ data: { productId: product.id, url: publicUrl, alt: item.name, isPrimary: true } })
      }
    } catch (err) {
      console.error('error for', item.name, err.message ?? err)
    }
  }

  console.log('✅ Download complete')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
