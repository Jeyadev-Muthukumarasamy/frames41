import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const statements = [
  `DROP TABLE IF EXISTS otp_attempts`,

  `UPDATE users SET email = COALESCE(email, 'phone_' || phone || '@frames41.local') WHERE email IS NULL`,

  `ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)`,

  `ALTER TABLE users ALTER COLUMN email SET NOT NULL`,

  `ALTER TABLE users DROP CONSTRAINT IF EXISTS users_phone_key`,

  `ALTER TABLE users ALTER COLUMN phone DROP NOT NULL`,

  `CREATE INDEX IF NOT EXISTS idx_users_isverified ON users("isVerified")`,

  `CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) NOT NULL,
    code_hash       VARCHAR(255) NOT NULL,
    expires_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    attempts        INTEGER NOT NULL DEFAULT 1,
    verify_attempts INTEGER NOT NULL DEFAULT 0,
    ip_address      VARCHAR(45)  NOT NULL,
    consumed_at     TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE INDEX IF NOT EXISTS idx_evt_email_created ON email_verification_tokens(email, created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_evt_ip_created ON email_verification_tokens(ip_address, created_at)`,
];

const prisma = new PrismaClient();
for (const stmt of statements) {
  try {
    await prisma.$executeRawUnsafe(stmt);
    console.log('OK  ', stmt.replace(/\s+/g, ' ').slice(0, 90));
  } catch (err) {
    console.error('FAIL', err.message, '|', stmt.replace(/\s+/g, ' ').slice(0, 90));
  }
}
await prisma.$disconnect();