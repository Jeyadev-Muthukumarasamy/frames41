import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

async function main() {
  const email = process.argv[2] || process.env.TARGET_ADMIN_EMAIL
  if (!email) {
    console.error('Usage: delete-admin.ts <email>')
    process.exit(2)
  }
  const prisma = new PrismaClient()
  try {
    const res = await prisma.user.deleteMany({ where: { email } })
    console.log(`Deleted ${res.count} user(s) with email=${email}`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
