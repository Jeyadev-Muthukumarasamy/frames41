import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

async function main() {
  const prisma = new PrismaClient()
  try {
    const count = await prisma.product.count()
    console.log('product count', count)
    const sample = await prisma.product.findMany({ take: 20, select: { id: true, slug: true, name: true, createdAt: true } })
    console.log('products sample:', JSON.stringify(sample, null, 2))
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
