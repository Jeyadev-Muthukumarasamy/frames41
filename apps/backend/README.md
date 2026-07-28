# Frames41 Backend

Production-grade e-commerce backend for Frames41 - MDF cutouts, DIY kits, wooden crafts, and customized gifts.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

3. **Start PostgreSQL with Docker:**
   ```bash
   npm run docker:up
   ```

4. **Run migrations:**
   ```bash
   npm run db:migrate
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript
- `npm run start` - Start production server
- `npm run test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

## Architecture

- **Feature-Sliced Architecture**: Each module contains controller, service, repository, routes, schemas, types, and tests
- **Repository Pattern**: Database access isolated in repositories
- **Dependency Injection**: Services receive dependencies via constructors
- **Error Handling**: Custom AppError hierarchy with proper HTTP mapping
- **Validation**: Zod schemas for all inputs
- **Security**: JWT auth with refresh token rotation, rate limiting, Helmet, CORS

## Phase 1 Status

✅ Environment configuration with Zod validation
✅ Error handling system
✅ Structured logging (Pino)
✅ Database infrastructure (Prisma)
✅ Core middleware (auth, rate limit, validation, error handling)
✅ Auth module (OTP, JWT with rotation)
✅ User module (profile, addresses)
✅ Express app with graceful shutdown
✅ Docker Compose setup
✅ Integration tests
✅ PM2 configuration

## License

UNLICENSED - Proprietary software
