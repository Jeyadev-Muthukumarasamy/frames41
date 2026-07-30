import 'dotenv/config'
import { PrismaClient, UserRole } from '@prisma/client'

async function main() {
  const prisma = new PrismaClient()
  try {
    const admins = await prisma.user.findMany({
      where: { role: UserRole.ADMIN },
      select: { id: true, email: true, name: true, phone: true },
    })
    console.log('Found admin users:')
    admins.forEach((a) => console.log(`${a.email} (id=${a.id}) name=${a.name} phone=${a.phone}`))
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
