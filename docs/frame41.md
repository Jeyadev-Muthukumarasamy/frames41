You are a Principal Backend Engineer with 15+ years at FAANG companies (Amazon, 
Meta, Google). Build a production-grade backend for "Frames41" — an e-commerce 
platform selling MDF cutouts, DIY kits, wooden crafts, and customized gifts.

═══════════════════════════════════════════════════════════════
SECTION 1: TECHNICAL CONSTRAINTS (NON-NEGOTIABLE)
═══════════════════════════════════════════════════════════════

STACK:
- Runtime: Node.js 20 LTS
- Language: TypeScript 5.x (strict mode, no `any`, no `@ts-ignore`)
- Framework: Express.js 4.x
- ORM: Prisma 5.x
- Database: PostgreSQL 16
- Validation: Zod
- Auth: JWT (access + refresh) with rotation
- Testing: Vitest + Supertest
- Logging: Pino (structured JSON)
- Process Manager: PM2 (cluster mode)

FORBIDDEN (cost constraints — max 100 active users):
❌ Redis / Upstash / any managed cache
❌ BullMQ / SQS / any managed queue
❌ Sentry / Datadog / any paid APM
❌ Cloudflare Workers / Lambda
❌ Any SaaS beyond Razorpay, Shiprocket, WhatsApp Business API, SMTP

ALLOWED FREE ALTERNATIVES (build these in-house):
✅ In-memory LRU cache (lru-cache package) for rate limiting & hot data
✅ node-cron + DB-backed job table for background jobs (idempotent workers)
✅ Pino + log rotation (pino-roll) → file-based structured logs
✅ pg_trgm for fuzzy search instead of Elasticsearch
✅ PostgreSQL LISTEN/NOTIFY for pub-sub if needed
✅ Self-hosted MinIO OR direct multipart to S3-compatible (Backblaze B2 free tier)

═══════════════════════════════════════════════════════════════
SECTION 2: FOLDER STRUCTURE (FEATURE-SLICED, DOMAIN-DRIVEN)
═══════════════════════════════════════════════════════════════

frames41-backend/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── src/
│   ├── config/                    # Env validation (Zod), constants
│   │   ├── env.ts                 # Fail-fast on missing env vars
│   │   └── constants.ts
│   ├── modules/                   # Feature modules (vertical slices)
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.repository.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.schema.ts     # Zod schemas
│   │   │   ├── auth.types.ts
│   │   │   └── auth.test.ts
│   │   ├── user/
│   │   ├── product/
│   │   ├── category/
│   │   ├── cart/
│   │   ├── coupon/
│   │   ├── order/
│   │   ├── payment/               # Razorpay
│   │   ├── shipping/              # Shiprocket + pincode-based rates
│   │   ├── review/
│   │   ├── wishlist/
│   │   ├── customization/         # WhatsApp gift customization flow
│   │   ├── banner/                # Homepage carousel
│   │   ├── coupon-card/           # Re-engagement coupons
│   │   ├── newsletter/
│   │   ├── referral/              # Influencer referral codes
│   │   ├── giftcard/
│   │   ├── blog/
│   │   ├── faq/
│   │   ├── refund/
│   │   ├── admin/                 # Admin dashboard endpoints
│   │   └── webhook/               # Razorpay, Shiprocket webhooks
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── rbac.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── rateLimit.middleware.ts
│   │   ├── validate.middleware.ts # Zod validator
│   │   ├── requestId.middleware.ts
│   │   ├── audit.middleware.ts
│   │   └── idempotency.middleware.ts
│   ├── shared/
│   │   ├── errors/                # AppError, NotFoundError, etc.
│   │   ├── utils/                 # crypto, dates, slugify
│   │   ├── types/
│   │   └── constants/
│   ├── infrastructure/
│   │   ├── database/
│   │   │   ├── prisma.client.ts   # Singleton with connection pooling
│   │   │   └── transaction.ts
│   │   ├── cache/
│   │   │   └── lru.cache.ts       # In-memory LRU
│   │   ├── queue/
│   │   │   ├── job.dispatcher.ts  # DB-backed queue
│   │   │   ├── job.worker.ts
│   │   │   └── jobs/
│   │   │       ├── send-email.job.ts
│   │   │       ├── send-whatsapp.job.ts
│   │   │       ├── shiprocket-sync.job.ts
│   │   │       └── coupon-trigger.job.ts
│   │   ├── storage/
│   │   │   └── s3.client.ts       # Backblaze B2 / MinIO
│   │   ├── external/
│   │   │   ├── razorpay.client.ts
│   │   │   ├── shiprocket.client.ts
│   │   │   ├── whatsapp.client.ts # WhatsApp Business Cloud API
│   │   │   └── smtp.client.ts
│   │   └── logger/
│   │       └── pino.logger.ts
│   ├── jobs/                      # Cron schedule definitions
│   │   └── scheduler.ts
│   ├── app.ts                     # Express app setup
│   ├── server.ts                  # HTTP listener + graceful shutdown
│   └── worker.ts                  # Separate process for jobs
├── tests/
│   ├── integration/
│   ├── e2e/
│   └── fixtures/
├── scripts/
│   ├── backup-db.sh
│   └── migrate-prod.sh
├── docker-compose.yml             # Postgres + MinIO local
├── Dockerfile
├── ecosystem.config.js            # PM2 cluster config
├── .env.example
├── .eslintrc.json                 # Strict, no warnings allowed
├── .prettierrc
├── tsconfig.json                  # strict: true, noUncheckedIndexedAccess
├── package.json
└── README.md

═══════════════════════════════════════════════════════════════
SECTION 3: DATABASE SCHEMA (PRISMA)
═══════════════════════════════════════════════════════════════

Design these models with proper relations, indexes, and constraints:

CORE:
- User (id, phone [unique], name, email?, dob?, role [USER|ADMIN], 
  createdAt, lastLoginAt, isVerified)
- OtpAttempt (phone, code [hashed], expiresAt, attempts, ipAddress)
- RefreshToken (userId, tokenHash, expiresAt, revokedAt, deviceInfo)
- Address (userId, line1, line2, city, state, pincode, isDefault)

CATALOG:
- Category (id, slug [unique], name, parentId?, mdfShape?, sortOrder, image)
- Product (id, slug [unique], name, description, basePrice, 
  discountedPrice?, sku [unique], stock, isActive, isBestSeller, 
  categoryId, fontOptions [Json], specifications [Json — table data],
  createdAt, updatedAt)
- ProductImage (productId, url, alt, sortOrder, isPrimary)
- ProductVariant (productId, name, priceModifier, stock, attributes [Json])
- ProductPriceTier (productId, minQty, pricePerUnit) — bulk discount

PRICING & SHIPPING:
- ShippingRate (state, minOrderValue, shippingCharge, productCategoryId?)
  → "Free shipping above ₹799, ₹79 below" + state-wise overrides
- PincodeServiceability (pincode, isServiceable, estimatedDays, courierPartner)

ENGAGEMENT:
- Coupon (code [unique], type [PERCENT|FLAT|FIRST_ORDER], value, 
  minOrderValue, maxDiscount, usageLimit, perUserLimit, validFrom, validTo,
  isActive)
- CouponRedemption (couponId, userId, orderId, redeemedAt)
- AbandonedCartTrigger (userId, productId, lastViewedAt, couponSent)
  → For "coupon when user leaves single product page without ordering"
- ReferralCode (code [unique], ownerUserId?, ownerName, discountPercent, 
  commissionPercent, isActive)
- GiftCard (code [unique], balance, purchasedBy, recipientPhone?, expiresAt)

CART & ORDER:
- Cart (userId [unique], updatedAt)
- CartItem (cartId, productId, quantity, customization [Json], 
  customImageUrl?, unitPrice, totalPrice)
- Order (id, orderNumber [unique, human-readable], userId, 
  status [PENDING|PAID|PROCESSING|SHIPPED|DELIVERED|CANCELLED|REFUNDED],
  subtotal, discount, shippingCharge, total, addressSnapshot [Json],
  couponId?, referralCodeId?, giftCardId?, paymentId?, 
  shiprocketOrderId?, awbCode?, trackingUrl?, placedAt, paidAt?, 
  shippedAt?, deliveredAt?)
- OrderItem (orderId, productId, productSnapshot [Json], quantity, 
  unitPrice, totalPrice, customization [Json])
- OrderStatusHistory (orderId, status, note, changedBy, changedAt)
- Payment (orderId, razorpayOrderId, razorpayPaymentId?, 
  razorpaySignature?, amount, status, method, capturedAt?)
- RefundRequest (orderId, userId, reason, videoUrl, status, 
  requestedAt, processedAt?, adminNote?)

CONTENT:
- Banner (image, link, sortOrder, isActive, type [TOP_STRIP|HEADER_SLIDER|UNDER_999])
- Review (productId, userId, orderId [for verified badge], rating, 
  title, body, images [Json], isVerified, isApproved, createdAt)
- Wishlist (userId, productId, addedAt) [composite unique]
- BlogPost (slug, title, content, coverImage, author, publishedAt)
- FAQ (question, answer, category, sortOrder)
- NewsletterSubscriber (email [unique], subscribedAt, isActive)

SYSTEM:
- Job (id, type, payload [Json], status [PENDING|RUNNING|COMPLETED|FAILED],
  attempts, maxAttempts, runAt, lockedAt?, lockedBy?, error?, createdAt)
- AuditLog (userId?, action, resource, resourceId, metadata [Json], 
  ipAddress, userAgent, createdAt)
- IdempotencyKey (key [unique], userId?, response [Json], expiresAt)
- WebhookEvent (provider, eventId [unique per provider], payload, 
  processedAt?, error?)

INDEXES (critical for performance):
- Product: (categoryId, isActive), (isBestSeller, isActive), 
  full-text on (name, description) using pg_trgm
- Order: (userId, status), (status, placedAt)
- AbandonedCartTrigger: (userId, lastViewedAt)
- Job: (status, runAt) for worker polling
- Review: (productId, isApproved)

═══════════════════════════════════════════════════════════════
SECTION 4: FEATURE-BY-FEATURE REQUIREMENTS
═══════════════════════════════════════════════════════════════

[A] AUTHENTICATION
- POST /auth/otp/request — phone-based, rate-limited (3/15min/IP, 5/day/phone)
- POST /auth/otp/verify — returns access (15min) + refresh (30d) tokens
- POST /auth/refresh — token rotation with reuse detection (revoke family)
- POST /auth/logout — revoke refresh token
- OTP: 6-digit, hashed with bcrypt before storage, 10-min expiry
- Use SMS provider (MSG91 / TextLocal — pay-per-SMS, very cheap in India)

[B] PRODUCT CATALOG
- GET /products — filters (category, price range, font option, sort: 
  newest/price-asc/price-desc/popularity), pagination (cursor-based)
- GET /products/:slug — full detail with variants, images, specs, reviews
- GET /products/search?q= — uses pg_trgm similarity, debounced server-side
- GET /products/under-price/:amount — for ₹99/249/499/999 sections
- GET /categories/tree — nested category tree with MDF shapes
- Hover-image: serve `images[1]` or `images[2]` URL in response

[C] CART (PRECISION ENGINE)
- POST /cart/items — add with customization payload
- PATCH /cart/items/:id — update qty, recalculate tier pricing
- Pricing engine logic:
  1. Apply ProductPriceTier based on qty
  2. Apply coupon (validate min order, per-user limit)
  3. Apply gift card balance
  4. Apply referral code discount
  5. Calculate shipping by pincode + state + total
  6. Return itemized breakdown
- POST /cart/calculate — preview totals without saving (idempotent)
- POST /cart/customize — uploads image, generates WhatsApp deep link 
  for customization confirmation

[D] COUPON SYSTEM (THE CLEVER BIT)
- Track abandoned single-product-page sessions:
  - Frontend pings POST /products/:id/viewed
  - Frontend pings POST /products/:id/exited (no order)
  - Worker job runs every 5 min: if user exited without ordering in 
    last hour and has no recent coupon, generate first-order coupon, 
    send via WhatsApp/SMS, mark trigger
- POST /coupons/validate — pre-checkout validation
- "Buy a coupon card" — user pays small amount, gets a coupon code 
  via Razorpay flow

[E] ORDER & PAYMENT (ATOMIC, IDEMPOTENT)
- POST /orders — creates Order in PENDING, reserves stock 
  (transaction with FOR UPDATE), creates Razorpay order, 
  returns razorpay_order_id
- Use Idempotency-Key header to prevent double orders
- POST /payments/verify — verifies HMAC signature (crypto.timingSafeEqual),
  marks order PAID, decrements stock, dispatches Shiprocket job, 
  sends confirmation
- POST /webhooks/razorpay — signature verification, idempotent 
  (check WebhookEvent.eventId)
- On payment failure: release stock reservation

[F] SHIPPING (SHIPROCKET)
- Auth token cached in LRU (24h TTL — Shiprocket tokens expire daily)
- POST /shipping/serviceability — check pincode against Shiprocket API, 
  cache result 7 days
- Background job creates Shiprocket order on payment success, 
  retries with exponential backoff (3 attempts: 30s, 5min, 30min)
- POST /webhooks/shiprocket — updates order status, AWB, tracking URL

[G] WHATSAPP INTEGRATION
- Use WhatsApp Business Cloud API (Meta) — free tier sufficient for 100 users
- Templates: order_confirmation, shipping_update, customization_request, 
  abandoned_cart_coupon, refund_status
- Share button: returns wa.me link with prefilled product URL + image
- "Couldn't find product" CTA: opens chat with support number

[H] CUSTOMIZATION FLOW
- User uploads image + custom text on product page
- Backend stores in S3-compatible storage (Backblaze B2)
- Generates WhatsApp template message with image preview to admin
- Admin approves/quotes via dashboard → user gets price update

[I] REFERRAL & GIFT CARDS
- Referral code applied at checkout → discount user, log commission
- Gift card: purchase flow creates record, code emailed/SMS'd
- Apply gift card at checkout: deduct from balance atomically

[J] REVIEWS
- Verified badge: only if userId has DELIVERED order containing productId
- Image uploads (max 3, 2MB each, sharp-resized to 1080px webp)
- Admin approval queue (isApproved: false by default if not verified)

[K] ADMIN DASHBOARD APIs
- Full CRUD on products, categories, banners, coupons, blogs, FAQs
- Order management with status transitions (state machine validation)
- Refund request review
- Analytics: GMV, AOV, top products, abandoned carts, conversion rate
- Customer list with order history
- Bulk operations with audit logging

═══════════════════════════════════════════════════════════════
SECTION 5: NON-FUNCTIONAL REQUIREMENTS (FAANG STANDARD)
═══════════════════════════════════════════════════════════════

SECURITY:
✓ Helmet with strict CSP
✓ CORS allowlist from env
✓ Rate limiting per route (LRU-backed): 
  - Auth: 5/15min, Search: 30/min, Order: 3/min
✓ Input validation on EVERY route via Zod (body, params, query)
✓ SQL injection: Prisma parameterized only — no $queryRawUnsafe
✓ XSS: sanitize HTML in reviews/blogs with DOMPurify (server-side)
✓ HTTPS-only cookies for refresh tokens (httpOnly, secure, sameSite=strict)
✓ Webhook HMAC verification with timing-safe comparison
✓ File uploads: magic-byte validation (not just MIME), size limits, 
  virus scan via ClamAV (optional, free)
✓ Secrets: never logged, .env validated at boot, fail fast if missing
✓ OWASP Top 10 audit checklist documented in /docs/SECURITY.md

OBSERVABILITY (FREE TIER):
✓ Structured Pino logs with requestId, userId, traceId
✓ Log levels: ERROR/WARN to stderr, INFO to stdout
✓ pino-roll for daily log rotation, 14-day retention
✓ /health endpoint (DB ping, disk space, memory)
✓ /metrics endpoint (Prometheus format) — scraped by self-hosted 
  Grafana if desired
✓ Request/response audit log to AuditLog table for sensitive ops
✓ Error tracking: build a minimal in-house error aggregator 
  (errors table with fingerprint hash, count, lastSeen)

PERFORMANCE:
✓ Connection pool: Prisma with pgBouncer-style limits (max=10 for 100 users)
✓ N+1 prevention: explicit `include`/`select`, dataloader pattern 
  where needed
✓ LRU cache for: product detail (5min), category tree (30min), 
  Shiprocket token (24h), shipping rates (1h)
✓ Pagination: cursor-based on indexed columns, never OFFSET
✓ Database: EXPLAIN ANALYZE every query touching >1k rows in 
  code review
✓ Compression: gzip via compression middleware
✓ Image: sharp for resize/webp on upload, never on read

RELIABILITY:
✓ Graceful shutdown: SIGTERM handler drains connections, finishes 
  in-flight jobs (30s grace period)
✓ Database transactions: Prisma $transaction for all multi-step writes
✓ Idempotency keys on all mutating endpoints (24h TTL in DB)
✓ Background jobs: at-least-once with idempotency check, exponential 
  backoff, dead-letter after maxAttempts
✓ Circuit breaker for external APIs (Razorpay, Shiprocket, WhatsApp) 
  using opossum library
✓ Retries: exponential with jitter, max 3 attempts, only on idempotent ops

CODE QUALITY:
✓ TypeScript strict + noUncheckedIndexedAccess + exactOptionalPropertyTypes
✓ ESLint: airbnb-typescript + import/order + no-floating-promises
✓ Prettier enforced via husky pre-commit
✓ Conventional Commits + commitlint
✓ 80%+ test coverage on services and controllers
✓ Integration tests with testcontainers (real Postgres in CI)
✓ Architecture: Controller → Service → Repository (no leakage)
✓ Domain errors via custom AppError hierarchy with proper HTTP mapping
✓ JSDoc on every public function in services/repositories

DEVOPS:
✓ Multi-stage Dockerfile (builder → production, distroless or alpine, 
  non-root user)
✓ docker-compose.yml for local dev (postgres, minio, app)
✓ PM2 cluster mode (CPU-1 workers + 1 dedicated worker process)
✓ DB migrations: prisma migrate deploy in release script
✓ Backups: pg_dump cron daily → encrypted upload to B2 (free 10GB)
✓ Zero-downtime deploy: PM2 reload + migration backward-compat rule

═══════════════════════════════════════════════════════════════
SECTION 6: DELIVERABLES
═══════════════════════════════════════════════════════════════

For each module, deliver:
1. Prisma model additions
2. Zod schemas (request/response)
3. Repository with typed Prisma queries
4. Service with business logic + transaction boundaries
5. Controller with thin HTTP layer
6. Routes with middleware composition
7. Integration tests (happy path + 3 edge cases minimum)
8. OpenAPI spec entry (auto-generated from Zod via zod-to-openapi)

Code style:
- Pure functions where possible
- Dependency injection via constructor (no globals except logger/prisma)
- No business logic in controllers or middleware
- No DB access outside repositories
- Errors as values (Result<T, E>) for expected failures, throw only for bugs

═══════════════════════════════════════════════════════════════
SECTION 7: BUILD ORDER (PHASED)
═══════════════════════════════════════════════════════════════

Phase 1 (Foundation): config, logger, prisma client, error handling, 
                      middleware, auth module, user module
Phase 2 (Catalog): category, product, search, banner
Phase 3 (Commerce): cart, pricing engine, coupon, shipping calculator
Phase 4 (Checkout): order, payment (Razorpay), Shiprocket integration
Phase 5 (Engagement): wishlist, review, abandoned cart triggers, 
                      referral, gift card
Phase 6 (Content): blog, FAQ, newsletter, refund flow
Phase 7 (Admin): dashboard endpoints, analytics
Phase 8 (Hardening): tests, docs, monitoring, deployment

═══════════════════════════════════════════════════════════════
DELIVER PHASE 1 FIRST. Show me the full code, file by file, with 
explanations of architectural decisions. Do not stub. Do not skip 
error handling. Every line must be production-quality.
═══════════════════════════════════════════════════════════════