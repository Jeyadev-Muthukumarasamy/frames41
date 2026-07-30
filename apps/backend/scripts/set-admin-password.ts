import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

async function main() {
  const email = process.argv[2]
  const password = process.argv[3]
  if (!email || !password) {
    console.error('Usage: set-admin-password.ts <email> <password>')
    process.exit(2)
  }

  const { hash } = await import('argon2')
  const prisma = new PrismaClient()
  try {
    const passwordHash = await hash(password, { type: 2 })
    const user = await prisma.user.update({
      where: { email },
      data: { passwordHash, isVerified: true },
    })
    console.log(`Updated password for ${user.email}`)
  } catch (err) {
    console.error('Error:', err instanceof Error ? err.message : err)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
