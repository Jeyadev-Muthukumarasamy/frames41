# Frames41: Full Integration Map

## Quick Answer: Do We Need Admin Dashboard First?

**NO.** All 18 user-facing pages have complete backend endpoints ready to use.

The admin dashboard backend exists (`/api/v1/admin/...`) but there are **zero admin frontend components**. Building it would mean creating ~20+ new components from scratch. This is a separate project after the user-facing integration is done.

You can manage products/categories/banners via Postman or an API tool until the admin frontend is built.

---

## Backend Endpoint Coverage by Frontend Component

### ✅ FULLY COVERED — Ready to integrate

| Frontend Component     | Backend Endpoint(s)                                                                                                | Notes                       |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------- |
| **Navbar**             | —                                                                                                                  | Cart count from cart API    |
| **AnnouncementBar**    | `GET /banners/by-type/TOP_STRIP`                                                                                   |                             |
| **HeroSection**        | `GET /banners/by-type/HEADER_SLIDER`                                                                               |                             |
| **CategoryGrid**       | `GET /categories/tree`                                                                                             |                             |
| **BudgetSection**      | `GET /products/under-price/999`                                                                                    |                             |
| **BestsellersSection** | `GET /products?sort=popular&limit=6`                                                                               |                             |
| **NewsletterStrip**    | `POST /newsletter/subscribe`                                                                                       | TODO comment in code        |
| **ProductListing**     | `GET /products?categoryId&minPrice&maxPrice&sort&cursor`                                                           | Cursor pagination           |
| **ProductDetail**      | `GET /products/by-slug/:slug`                                                                                      |                             |
| **ProductGallery**     | —                                                                                                                  | Data from product response  |
| **ProductInfo**        | —                                                                                                                  | Data from product response  |
| **ProductActions**     | `POST /cart/items`, `POST /wishlist/toggle`                                                                        | TODO in useProductDetail.ts |
| **ReviewSummary**      | `GET /reviews/product/:id/summary`                                                                                 |                             |
| **RelatedProducts**    | `GET /products?categoryId=...`                                                                                     | Same category products      |
| **Shipping (Cart)**    | `GET /cart`, `PATCH /cart/items/:id`, `DELETE /cart/items/:id`, `POST /cart/calculate`                             | TODO in code                |
| **Checkout**           | `GET /users/me/addresses`, `POST /orders`                                                                          |                             |
| **Payment**            | `POST /payments/create`, `POST /payments/verify`                                                                   | Razorpay; TODO in code      |
| **OrderConfirmPage**   | `GET /orders/:id`                                                                                                  |                             |
| **OrdersPage**         | `GET /orders`                                                                                                      | Cursor paginated            |
| **Ordertracking**      | `GET /orders/by-number/:orderNumber`                                                                               |                             |
| **Profile**            | `GET /users/me`, `PATCH /users/me`, `GET /users/me/addresses`, `POST/PATCH/DELETE /users/me/addresses/:id`         |                             |
| **Wishlist**           | `GET /wishlist`, `DELETE /wishlist/:productId`, `POST /cart/items`                                                 |                             |
| **Review**             | `GET /reviews/my-reviews`, `GET /reviews/can-review`, `POST /reviews`, `PATCH /reviews/:id`, `DELETE /reviews/:id` | TODO in code                |
| **Refer**              | `GET /referrals/my-code`, `GET /referrals/my-history`, `POST /referrals`                                           |                             |
| **Blog**               | `GET /blog/by-slug/:slug`                                                                                          |                             |
| **FAQ**                | `GET /faqs`, `GET /faqs/categories`                                                                                |                             |
| **Auth (LoginPage)**   | `POST /auth/otp/request`, `POST /auth/otp/verify`, `POST /auth/refresh`, `POST /auth/logout`                       | No login page yet           |

---

### ⚠️ BACKEND EXISTS, NO FRONTEND COMPONENT

| Backend Module        | Endpoints                                                                                           | Status                                      |
| --------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| **Admin Dashboard**   | `GET /admin/dashboard/stats`, `GET /admin/dashboard/analytics`, `GET /admin/dashboard/top-products` | No frontend — build later                   |
| **Admin: Products**   | `POST/PATCH/DELETE /products`                                                                       | No admin UI                                 |
| **Admin: Categories** | `POST/PATCH/DELETE /categories`                                                                     | No admin UI                                 |
| **Admin: Banners**    | `POST/PATCH/DELETE /banners`                                                                        | No admin UI                                 |
| **Admin: Orders**     | `GET /admin/orders`, `PATCH /admin/orders/:id/status`, `POST /admin/orders/:id/tracking`            | No admin UI                                 |
| **Admin: Customers**  | `GET /admin/customers`, `GET /admin/customers/:id`                                                  | No admin UI                                 |
| **Admin: Refunds**    | `GET /admin/refunds`, `PATCH /admin/refunds/:id`                                                    | No admin UI                                 |
| **Admin: Blog/FAQ**   | `POST/PATCH/DELETE /blog`, `POST/PATCH/DELETE /faqs`                                                | No admin UI                                 |
| **Gift Cards**        | `GET/POST /gift-cards/*`                                                                            | No frontend component                       |
| **Coupons**           | Used internally during cart calculate/order create                                                  | Exposed via promo code form in Shipping.tsx |
| **Abandoned Cart**    | `POST /abandoned-cart/view/:productId`, `POST /abandoned-cart/exit/:productId`                      | Backend tracking only, fire-and-forget      |
| **Shipping Rates**    | Applied server-side during cart calculate                                                           | No UI needed                                |

---

## What's Missing on the Frontend (Must Build)

### Must build to make user flow work:

1. **`pages/LoginPage.tsx`** — Phone OTP auth. Backend ready: `/auth/otp/request` + `/auth/otp/verify`
2. **`contexts/AuthContext.tsx`** — JWT token management, user state
3. **`contexts/CartContext.tsx`** — Cart item count for Navbar badge
4. **`lib/api.ts`** — Axios client with auth interceptor + token refresh
5. **`lib/token.ts`** — Token storage helpers
6. **React Router setup in `App.tsx`** — No routing exists at all right now
7. **`components/ui/ProtectedRoute.tsx`** — Gates authenticated pages
8. **15 page wrapper files** in `pages/` — Thin files that call hooks + pass data to components
9. **14 custom hooks** in `hooks/` — Replace constants with real API calls

### Nice to have later:

- Admin dashboard (20+ new components, separate project)
- Gift card purchase/management UI
- Product search page (`/search?q=`)

---

## Files With TODO Comments (Quickest Wins)

These are one-line fixes once the API client exists:

| File                                                 | Line   | Fix                                                |
| ---------------------------------------------------- | ------ | -------------------------------------------------- |
| `components/home/NewsletterStrip.tsx`                | ~22    | `await api.newsletter.subscribe(email)`            |
| `components/Review/Review.tsx`                       | ~19    | Replace mock delay with `api.reviews.create(data)` |
| `components/payment/Payment.tsx`                     | ~20    | Replace mock delay with Razorpay flow              |
| `components/ProductDetail/hooks/useProductDetail.ts` | ~28    | Call `CartContext.addItem(productId, qty)`         |
| `pages/HomePage.tsx`                                 | ~22-28 | `useNavigate('/search?q=...')`                     |

---

## Integration Build Order

```
Step 1 — Foundation
  ├── npm install axios react-router-dom      (Client/)
  ├── vite.config.ts → add proxy to :3000
  ├── lib/token.ts
  └── lib/api.ts  ← everything depends on this

Step 2 — Auth
  ├── contexts/AuthContext.tsx
  ├── contexts/CartContext.tsx
  ├── pages/LoginPage.tsx
  └── components/ui/ProtectedRoute.tsx

Step 3 — Routing
  └── App.tsx full rewrite (BrowserRouter + all routes)

Step 4 — User-facing pages (checkout funnel first)
  ├── HomePage → useHomePage hook
  ├── ProductListing → useProductListing hook
  ├── ProductDetail → useProductDetail hook
  ├── Cart (Shipping) → useCart hook
  ├── Checkout → useCheckout hook
  ├── Payment → usePayment hook + Razorpay
  ├── OrderConfirm → rewire existing page
  └── Orders, Tracking, Profile, Wishlist, Reviews, Refer, Blog, FAQ

Step 5 — Quick fixes
  └── Wire the 5 TODO comments listed above

Step 6 (later) — Admin Dashboard
  └── Build from scratch: ~20 new components
```

---

## Razorpay Integration Note

The backend `POST /payments/create` returns:

```json
{ "razorpayOrderId": "...", "amount": <number>, "currency": "INR", "keyId": "..." }
```

The frontend loads `checkout.js` at runtime (not npm), opens the Razorpay modal, then calls `POST /payments/verify` with the three signature fields. This is the standard Razorpay web integration flow.

⚠️ Check if `amount` is in **paise** (multiply display price × 100) or rupees — Razorpay expects paise.

---

## Backend Base URL & Auth

- All routes: `https://frames41-production.up.railway.app/api/v1/...`
- Auth header: `Authorization: Bearer <accessToken>`
- Token lifetime: access = 15 min, refresh = 30 days
- Standard response wrapper: `{ success, data, error, meta }`
- Rate limits: auth endpoints = 5 req/15 min per IP
