# Security Policy

## OWASP Top 10 Compliance

This document outlines the security measures implemented in the Frames41 e-commerce platform to address the OWASP Top 10 risks.

---

## 1. Broken Access Control

**Implemented Controls:**
- ✅ JWT-based authentication with role-based access control (RBAC)
- ✅ Route-level middleware enforcing `authenticate` and `requireAdmin`
- ✅ Token rotation on refresh to prevent token replay attacks
- ✅ All mutating endpoints protected with idempotency keys
- ✅ CORS configured with strict allowlist

**Files:**
- `src/middleware/auth.middleware.ts`
- `src/middleware/rbac.middleware.ts`

---

## 2. Cryptographic Failures

**Implemented Controls:**
- ✅ JWT secrets minimum 32 characters
- ✅ Refresh tokens hashed with bcrypt before storage
- ✅ OTP codes hashed with argon2 before storage
- ✅ HTTPS-only cookies (`httpOnly`, `secure`, `sameSite=strict`)
- ✅ No sensitive data in URLs or logs
- ✅ Pino redacts passwords, tokens, secrets from logs

**Files:**
- `src/config/env.ts`
- `src/modules/auth/auth.service.ts`
- `src/infrastructure/logger/pino.logger.ts`

---

## 3. Injection

**Implemented Controls:**
- ✅ Prisma ORM used exclusively (parameterized queries)
- ✅ No `$queryRawUnsafe` usage
- ✅ Zod input validation on all routes (body, params, query)
- ✅ SQL injection prevention via Prisma query engine

**Files:**
- `src/middleware/validate.middleware.ts`
- All `*.repository.ts` files

---

## 4. Insecure Design

**Implemented Controls:**
- ✅ Idempotency keys on all mutating endpoints
- ✅ Database transactions for multi-step writes
- ✅ Stock reservation with `FOR UPDATE` locking
- ✅ Order status state machine validation
- ✅ Audit logging for all sensitive operations

**Files:**
- `src/middleware/idempotency.middleware.ts`
- `src/middleware/audit.middleware.ts`
- `src/modules/order/order.service.ts`

---

## 5. Security Misconfiguration

**Implemented Controls:**
- ✅ Environment validation at boot (Zod schema, fail-fast)
- ✅ Helmet.js with strict CSP headers
- ✅ HSTS enabled with max-age 31536000
- ✅ Error messages sanitized (no stack traces in production)
- ✅ Default secure headers on all responses

**Files:**
- `src/app.ts`
- `src/config/env.ts`
- `src/middleware/error.middleware.ts`

---

## 6. Vulnerable and Outdated Components

**Implemented Controls:**
- ✅ Dependencies managed with npm audit
- ✅ No known vulnerable packages in dependency tree
- ✅ Automated security updates via Renovate/Dependabot recommended

**Command:**
```bash
npm audit
```

---

## 7. Identification and Authentication Failures

**Implemented Controls:**
- ✅ Rate limiting on auth endpoints (5/15min per IP)
- ✅ OTP rate limiting (3/15min per IP, 5/day per phone)
- ✅ OTP expiry: 10 minutes
- ✅ Refresh token reuse detection (revoke family)
- ✅ Account lockout not needed (OTP-based)
- ✅ Session timeout: 15 minutes (access token)

**Files:**
- `src/middleware/rateLimit.middleware.ts`
- `src/modules/auth/auth.service.ts`

---

## 8. Software and Data Integrity Failures

**Implemented Controls:**
- ✅ Webhook HMAC verification with timing-safe comparison
- ✅ Idempotency keys prevent duplicate operations
- ✅ File uploads validated with magic bytes (not just MIME)
- ✅ Checksum validation for uploaded images

**Files:**
- `src/modules/webhook/*.webhook.ts`
- `src/middleware/idempotency.middleware.ts`

---

## 9. Security Logging and Monitoring Failures

**Implemented Controls:**
- ✅ Structured JSON logging with Pino
- ✅ Request ID tracking across all requests
- ✅ Audit log table for sensitive operations
- ✅ Error tracking with fingerprinting
- ✅ Failed login attempts logged
- ✅ Security events logged (rate limit exceeded, invalid tokens)

**Files:**
- `src/infrastructure/logger/pino.logger.ts`
- `src/middleware/audit.middleware.ts`
- `src/middleware/requestId.middleware.ts`

---

## 10. Server-Side Request Forgery (SSRF)

**Implemented Controls:**
- ✅ No user-supplied URLs fetched server-side
- ✅ All external API calls use hardcoded endpoints
- ✅ Image uploads validated before processing
- ✅ URL validation on redirects (if any)

---

## Additional Security Measures

### XSS Protection
- ✅ DOMPurify sanitization on user-generated content (reviews, blogs)
- ✅ Content Security Policy (CSP) headers via Helmet
- ✅ `X-Content-Type-Options: nosniff`

### File Upload Security
- ✅ Magic byte validation (not just MIME type)
- ✅ Size limits enforced (2MB per image, max 3 per review)
- ✅ Sharp image processing for resize/webp conversion
- ✅ Virus scanning via ClamAV (optional, not enabled by default)

### Rate Limiting
- Auth: 5 requests per 15 minutes
- Search: 30 requests per minute
- Order creation: 3 requests per minute
- General: 100 requests per 15 minutes

### Secrets Management
- ✅ All secrets in `.env` file
- ✅ `.env` in `.gitignore`
- ✅ Secrets validated at application startup
- ✅ No secrets logged (Pino redaction)

---

## Incident Response

If you discover a security vulnerability:

1. **Do NOT** open a public issue
2. Email security details to: [admin@frames41.com]
3. Allow 48 hours for initial response
4. We will coordinate disclosure timeline

---

## Security Checklist (Deployment)

- [ ] All environment variables set
- [ ] JWT secrets are 32+ random characters
- [ ] HTTPS enabled in production
- [ ] CORS origins restricted to known domains
- [ ] Rate limiting enabled
- [ ] Log rotation configured
- [ ] Error tracking active
- [ ] Database backups scheduled
- [ ] PM2 running with cluster mode
- [ ] Security headers verified via [securityheaders.com](https://securityheaders.com)

---

Last Updated: May 2026
