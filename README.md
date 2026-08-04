# Frames41 Backend

A production-grade e-commerce backend for MDF cutouts, DIY craft kits, and personalized gifts. Built with TypeScript, Express.js, and PostgreSQL.

## 🚀 Tech Stack

- **Runtime:** Node.js 20 LTS
- **Language:** TypeScript 5.x (strict mode)
- **Framework:** Express.js 4.x
- **Database:** PostgreSQL 16 + Prisma 5.x ORM
- **Authentication:** JWT with refresh token rotation
- **Validation:** Zod
- **Testing:** Vitest + Supertest
- **Logging:** Pino (structured JSON)
- **Process Manager:** PM2

## ✨ Features

### Phase 1: Foundation

- ✅ Phone-based OTP authentication
- JWT access + refresh tokens with rotation
- Role-based access control (User/Admin)
- Address management
- Request validation & sanitization
- Rate limiting
- Audit logging
- Error tracking

### Phase 2: Catalog

- ✅ Category management with nested hierarchy
- Product catalog with variants & price tiers
- Image management
- Banner management (carousel)
- Cursor-based pagination
- Full-text search with pg_trgm

### Phase 3: Commerce

- ✅ Shopping cart with persistent storage
- Pricing engine with bulk discounts
- Coupon system (percentage, flat, first-order)
- Shipping calculator with pincode validation
- Cart customization support

### Phase 4: Checkout

- ✅ Order creation with stock reservation
- Razorpay payment integration
- Payment verification & webhooks
- Shiprocket shipping integration
- Order tracking
- Refund request flow

### Phase 5: Engagement

- ✅ Wishlist management
- Product reviews with verified badges
- Abandoned cart recovery with WhatsApp/SMS
- Referral system with commission tracking
- Digital gift cards

### Phase 6: Content

- ✅ Blog posts
- FAQ management
- Newsletter subscriptions

### Phase 7: Admin Dashboard

- ✅ Basic admin APIs
- Product/category CRUD
- Order management
- Review moderation
- Customer management

### Phase 8: DevOps

- ✅ Docker for local Postgres/MinIO only (production deploys via Nixpacks, no image build)
- PM2 cluster configuration
- Database migrations
- Health check endpoints
- Structured logging with rotation

## 📁 Project Structure

```
frames41-backend/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Database migrations
│   └── seed.ts               # Seed data
├── src/
│   ├── config/               # Environment & constants
│   ├── modules/              # Feature modules
│   │   ├── auth/
│   │   ├── user/
│   │   ├── product/
│   │   ├── category/
│   │   ├── cart/
│   │   ├── order/
│   │   ├── payment/
│   │   ├── review/
│   │   ├── wishlist/
│   │   ├── referral/
│   │   ├── giftcard/
│   │   ├── blog/
│   │   ├── faq/
│   │   ├── newsletter/
│   │   ├── admin/
│   │   └── webhook/
│   ├── middleware/           # Express middleware
│   ├── shared/              # Utilities & errors
│   ├── infrastructure/      # Database, cache, external APIs
│   └── app.ts               # Express app setup
├── tests/
│   ├── integration/         # Integration tests
│   └── setup.ts            # Test configuration
├── docker-compose.yml       # Local development stack
├── ecosystem.config.js      # PM2 configuration
└── package.json
```

## 🛠️ Setup

### Prerequisites

- Node.js 20+
- PostgreSQL 16
- npm or yarn

### 1. Clone & Install

```bash
git clone <repository-url>
cd frames41-backend
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/frames41?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_REFRESH_SECRET="your-refresh-secret-key-min-32-chars"

# Razorpay
RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="..."
RAZORPAY_WEBHOOK_SECRET="..."

# Shiprocket
SHIPROCKET_EMAIL="..."
SHIPROCKET_PASSWORD="..."

# Server
PORT=3000
NODE_ENV="development"
API_VERSION="v1"

# CORS
CORS_ORIGIN="https://frames41-production.up.railway.app,http://localhost:5173"
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed
```

### 4. Start Development Server

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start

# With PM2
npm run pm2:start
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

## 📡 API Endpoints

### Authentication

```
POST /api/v1/auth/otp/request      # Request OTP
POST /api/v1/auth/otp/verify       # Verify OTP & login
POST /api/v1/auth/refresh          # Refresh tokens
POST /api/v1/auth/logout           # Logout
```

### Products

```
GET    /api/v1/products            # List products
GET    /api/v1/products/:slug      # Product details
GET    /api/v1/products/search     # Search products
GET    /api/v1/categories          # Category tree
```

### Cart

```
GET    /api/v1/cart                # Get cart
POST   /api/v1/cart/items          # Add item
PATCH  /api/v1/cart/items/:id      # Update quantity
DELETE /api/v1/cart/items/:id      # Remove item
POST   /api/v1/cart/calculate      # Calculate totals
```

### Orders

```
POST   /api/v1/orders              # Create order
GET    /api/v1/orders              # My orders
GET    /api/v1/orders/:id          # Order details
```

### Wishlist

```
GET    /api/v1/wishlist            # Get wishlist
POST   /api/v1/wishlist            # Add to wishlist
DELETE /api/v1/wishlist/:productId # Remove from wishlist
```

### Reviews

```
GET    /api/v1/reviews/product/:productId
POST   /api/v1/reviews
PATCH  /api/v1/reviews/:id
```

### Referrals

```
GET    /api/v1/referrals/my-code
POST   /api/v1/referrals
GET    /api/v1/referrals/validate?code=
```

### Gift Cards

```
GET    /api/v1/gift-cards/check/:code
POST   /api/v1/gift-cards
POST   /api/v1/gift-cards/redeem
```

### Admin (Require admin role)

```
GET    /api/v1/admin/dashboard/stats
GET    /api/v1/admin/users
GET    /api/v1/admin/orders
PATCH  /api/v1/admin/orders/:id/status
```

## 🐳 Local Database (Docker)

Docker is only used for local Postgres/MinIO, not for building deploy images.

```bash
cd apps/backend

# Start local Postgres + MinIO
npm run docker:up

# View logs
npm run docker:logs

# Stop services
npm run docker:down
```

Services included:

- PostgreSQL 16
- MinIO (S3-compatible storage)

## 🚀 Deployment

### Railway (Recommended)

Each app (`apps/backend`, `apps/frontend`, `apps/admin`) deploys as its own Railway service, built via the `nixpacks.toml` in that app's folder — no Dockerfile/image build involved.

1. Connect GitHub repo to Railway, one service per app with its root directory set to `apps/backend`, `apps/frontend`, or `apps/admin`
2. Add PostgreSQL database (backend service)
3. Set environment variables per service
4. Deploy automatically on push

### Manual Server

```bash
# Build
npm run build

# Start with PM2
pm2 start ecosystem.config.js

# Monitor
pm2 monit
```

## 📊 Monitoring

- **Health Check:** `GET /health`
- **Logs:** Structured JSON logs in `logs/` directory
- **Error Tracking:** Built-in error aggregation

## 🔒 Security

- Helmet.js for security headers
- CORS configured
- Rate limiting per route
- SQL injection prevention (Prisma)
- XSS protection
- Input validation (Zod)
- HTTPS-only cookies
- Webhook signature verification

## 📝 License

Private - All rights reserved

## 👨‍💻 Development Team

Built with ❤️ for Frames41

---

**Support:** For issues or questions, create a GitHub issue or contact the development team.
