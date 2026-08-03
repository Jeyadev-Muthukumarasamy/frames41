import { config } from 'dotenv';
import { z } from 'zod';

config();

const emptyStringToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    schema.optional(),
  );

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default('5001'),
  API_VERSION: z.string().default('v1'),
  APP_NAME: z.string().default('Frames41 API'),
  APP_URL: z.string().url().default('https://frames41-production.up.railway.app'),

  // Security
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters').default('default-super-secret-access-key-for-development'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters').default('default-super-secret-refresh-key-for-development'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('30d'),
  BCRYPT_ROUNDS: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default('12'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default('100'),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000,http://localhost:5173,http://localhost:5174,https://frames41-production.up.railway.app'),

  // Logging
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  LOG_DIR: z.string().default('./logs'),
  LOG_RETENTION_DAYS: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default('14'),

  // Email (Resend) - used for transactional mail
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().email().default('noreply@frames41.com'),
  RESEND_FROM_NAME: z.string().default('Frames41'),
  EMAIL_VERIFICATION_EXPIRY_MINUTES: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default('10'),
  // Skip Resend entirely in dev (just log the verification code to the
  // server console). Useful when you haven't verified the sending domain
  // on Resend yet. Only honored when NODE_ENV=development.
  RESEND_DISABLE_IN_DEV: z
    .enum(['true', 'false'])
    .default('false')
    .transform((val) => val === 'true'),

  // Razorpay (Optional in development)
  RAZORPAY_KEY_ID: emptyStringToUndefined(z.string()),
  RAZORPAY_KEY_SECRET: emptyStringToUndefined(z.string()),
  RAZORPAY_WEBHOOK_SECRET: emptyStringToUndefined(z.string()),

  // Shiprocket (Optional for Phase 1)
  SHIPROCKET_EMAIL: emptyStringToUndefined(z.string().email()),
  SHIPROCKET_PASSWORD: emptyStringToUndefined(z.string()),

  // Twilio SMS OTP (Optional in development, required for live OTP SMS)
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_FROM_PHONE: z.string().optional(),

  // WhatsApp Business API (Optional for Phase 1)
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
  WHATSAPP_ACCESS_TOKEN: z.string().optional(),
  WHATSAPP_VERIFY_TOKEN: z.string().optional(),

  // SMTP (Optional for Phase 1)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default('587'),
  SMTP_USER: emptyStringToUndefined(z.string()),
  SMTP_PASS: emptyStringToUndefined(z.string()),
  SMTP_FROM: emptyStringToUndefined(z.string().email()),

  // Storage (Optional for Phase 1)
  STORAGE_ENDPOINT: z.string().optional(),
  STORAGE_BUCKET: z.string().optional(),
  STORAGE_ACCESS_KEY: z.string().optional(),
  STORAGE_SECRET_KEY: z.string().optional(),
  STORAGE_REGION: z.string().default('us-east-1'),
  STORAGE_FORCE_PATH_STYLE: z.enum(['true', 'false']).default('true'),

  // Cloudinary (Optional for Phase 1)
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // Admin (Optional for Phase 1)
  ADMIN_EMAIL: emptyStringToUndefined(z.string().email()),
  ADMIN_PASSWORD: emptyStringToUndefined(z.string()),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const errors = parsedEnv.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
  // eslint-disable-next-line no-console
  console.error('❌ Environment validation failed:');
  // eslint-disable-next-line no-console
  errors.forEach((err) => console.error(`   - ${err}`));
  process.exit(1);
}

export const env = parsedEnv.data;

export type Env = z.infer<typeof envSchema>;