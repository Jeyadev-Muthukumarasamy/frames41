import 'dotenv/config'
import { PrismaClient, UserRole } from '@prisma/client'

async function main() {
  const keepEmail = process.argv[2] || process.env.KEEP_ADMIN_EMAIL
  if (!keepEmail) {
    console.error('Usage: prune-admins.ts <keep-email>')
    process.exit(2)
  }

  const prisma = new PrismaClient()
  try {
    const before = await prisma.user.count({ where: { role: UserRole.ADMIN } })
    console.log(`Admin users before: ${before}`)

    const res = await prisma.user.deleteMany({ where: { role: UserRole.ADMIN, email: { not: keepEmail } } })
    console.log(`Deleted ${res.count} admin user(s) not matching ${keepEmail}`)

    const after = await prisma.user.findMany({ where: { role: UserRole.ADMIN }, select: { email: true } })
    console.log('Remaining admin accounts:')
    after.forEach((a) => console.log(a.email))
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
