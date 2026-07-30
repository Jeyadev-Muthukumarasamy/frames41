import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main(): Promise<void> {
  const products = await prisma.product.findMany({
    include: { category: true },
  })

  console.log(`Found ${products.length} products to check for customizationConfig backfill...`)

  let updatedCount = 0

  for (const p of products) {
    const catStr = `${p.category?.slug ?? ''} ${p.category?.name ?? ''} ${p.slug} ${p.name}`.toLowerCase()

    const isSpotify = catStr.includes('spotify')
    const isPen = catStr.includes('pen')
    const isBoardOrNikkah = catStr.includes('thumb') || catStr.includes('board') || catStr.includes('nikkah')
    const isCustomProduct = catStr.includes('frame') || catStr.includes('lamp') || catStr.includes('led') ||
      catStr.includes('engrav') || catStr.includes('keychain') || catStr.includes('clock') ||
      catStr.includes('mug') || catStr.includes('magnet') || catStr.includes('calendar') || catStr.includes('cutout')

    const defaultNumImages = isSpotify || isCustomProduct || (!isPen && !isBoardOrNikkah)
    const defaultNumNames = isSpotify || isPen || isBoardOrNikkah || isCustomProduct
    const defaultNameCount = isBoardOrNikkah ? 2 : 1
    const defaultDate = isSpotify || isBoardOrNikkah || catStr.includes('calendar')

    const config = {
      numberOfImages: { enabled: defaultNumImages, count: 1 },
      numberOfNames: { enabled: defaultNumNames, count: defaultNameCount },
      date: { enabled: defaultDate },
      songName: { enabled: isSpotify },
    }

    if (!p.customizationConfig || Object.keys(p.customizationConfig as object).length === 0) {
      await prisma.product.update({
        where: { id: p.id },
        data: { customizationConfig: config },
      })
      updatedCount++
    }
  }

  console.log(`✅ Backfilled customizationConfig for ${updatedCount} products.`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
