# Admin Dashboard — Complete Implementation Plan

## Context
Frames41 is a production e-commerce platform (MDF cutouts/craft kits). All 20 user-facing pages and the full backend are complete. The backend already exposes admin APIs for dashboard stats, analytics, orders, customers, and refunds. Phase 7 (Admin Dashboard) is the only missing frontend piece. Zero admin React components, pages, or routes exist yet.

---

## Features We Are Building

### 1. Overview / Analytics Dashboard
- KPI stat cards: Total Revenue, Today's Revenue, Total Orders, Today's Orders, Total Users, AOV, Pending Orders, Low Stock Products, Pending Reviews, Pending Refunds
- Period selector: Today / This Week / This Month / This Year / Custom date range
- Revenue over time line chart
- Orders per day bar chart
- Order status breakdown donut chart
- Top 10 products table (by revenue + units sold)

### 2. Order Management
- Paginated orders table with search (order # / customer name / phone) and status + date-range filters
- Order detail page: customer info, line items, totals, status history timeline
- Update order status (with note) — respects valid status transitions
- Add/update shipping tracking (AWB code + URL)

### 3. Customer Management
- Paginated customers table with search (name/phone/email), sortable by spend/orders/join date
- Customer detail page: profile, addresses, full order history, lifetime value

### 4. Refund Management
- Refund queue with status filter (Pending / Approved / Rejected)
- View video evidence (link)
- Approve or reject with admin note modal

### 5. Product Management
- Products table: paginated, search by name, filter by category/active/low-stock
- Highlight low-stock rows (stock ≤ 10)
- Toggle active/inactive inline
- Create / Edit product form: name, slug, SKU, description, base price, discounted price, stock, category, images, variants, price tiers, SEO fields, flags (isBestSeller, isFeatured)
- Delete with confirmation

### 6. Category Management
- Hierarchical tree view (parent → children)
- Create / Edit category: name, slug, description, parentId, image URL, sortOrder
- Delete (blocked if children exist — show error from API)

### 7. Banner Management
- Banner cards grouped by type: TOP_STRIP, HEADER_SLIDER, UNDER_999, CATEGORY_BANNER, PROMOTIONAL
- Toggle active/inactive inline
- Create / Edit banner: image URL, mobile image, link, title, subtitle, type, sortOrder, start/end dates
- Delete with confirmation

### 8. Review Approval
- Queue of pending reviews (product name, reviewer, rating, body, date)
- Approve or reject individual reviews

---

## Tech Stack Additions
- **Recharts** — for line, bar, and donut charts (lightweight, React-native, Tailwind-compatible)
- **date-fns** — for date formatting/manipulation in the analytics period selector (check if already installed; if not, add it)
- Everything else uses existing stack: React 19, TypeScript, Tailwind CSS, Axios, React Router v7

---

## Architecture

### New Routes (App.tsx)
```
/admin                → AdminDashboardPage      (admin-protected)
/admin/orders         → AdminOrdersPage
/admin/orders/:id     → AdminOrderDetailPage
/admin/customers      → AdminCustomersPage
/admin/customers/:id  → AdminCustomerDetailPage
/admin/refunds        → AdminRefundsPage
/admin/products       → AdminProductsPage
/admin/products/new   → AdminProductEditPage
/admin/products/:id/edit → AdminProductEditPage
/admin/categories     → AdminCategoriesPage
/admin/banners        → AdminBannersPage
/admin/reviews        → AdminReviewsPage
```
All wrapped in an `AdminRoute` guard (checks `user.role === 'ADMIN'`).

### New Files (Frontend only — backend already complete for dashboard/orders/customers/refunds)

**Pages** — `Client/src/pages/admin/`
- `AdminDashboardPage.tsx`
- `AdminOrdersPage.tsx`
- `AdminOrderDetailPage.tsx`
- `AdminCustomersPage.tsx`
- `AdminCustomerDetailPage.tsx`
- `AdminRefundsPage.tsx`
- `AdminProductsPage.tsx`
- `AdminProductEditPage.tsx`
- `AdminCategoriesPage.tsx`
- `AdminBannersPage.tsx`
- `AdminReviewsPage.tsx`

**Components** — `Client/src/components/admin/`
```
layout/
  AdminLayout.tsx          # Sidebar + main content shell
  AdminSidebar.tsx         # Nav links with icons
  AdminHeader.tsx          # Top bar: breadcrumb + user avatar/logout

dashboard/
  StatsCard.tsx            # KPI metric card (label, value, trend arrow)
  PeriodSelector.tsx       # Today/Week/Month/Year/Custom tab switcher
  RevenueChart.tsx         # Recharts LineChart
  OrdersChart.tsx          # Recharts BarChart
  StatusDonutChart.tsx     # Recharts PieChart
  TopProductsTable.tsx     # Simple ranked table

orders/
  OrdersTable.tsx          # Full paginated table
  OrderStatusBadge.tsx     # Color-coded status chip
  OrderFilters.tsx         # Status select + date range + search
  OrderStatusTimeline.tsx  # Status history steps in detail view
  TrackingModal.tsx        # Add AWB + URL form modal

customers/
  CustomersTable.tsx
  CustomerOrderHistory.tsx

refunds/
  RefundsTable.tsx
  RefundActionModal.tsx    # Approve/reject with note

products/
  ProductsTable.tsx
  ProductForm.tsx          # Full product create/edit form
  VariantsEditor.tsx       # Dynamic variant rows
  PriceTiersEditor.tsx     # Dynamic price tier rows

categories/
  CategoryTree.tsx         # Nested list with expand/collapse
  CategoryForm.tsx

banners/
  BannerGrid.tsx           # Cards grouped by type
  BannerForm.tsx

reviews/
  ReviewQueue.tsx

shared/
  AdminTable.tsx           # Generic <thead>/<tbody> wrapper with loading/empty states
  Pagination.tsx           # Page buttons + "Page N of M"
  SearchInput.tsx          # Debounced input (300ms)
  DateRangePicker.tsx      # Two <input type="date"> with validation
  ConfirmModal.tsx         # "Are you sure?" dialog
  EmptyState.tsx
  AdminGuard.tsx           # Route guard component
```

**Hooks** — `Client/src/hooks/admin/`
- `useAdminDashboard.ts` — fetches stats + analytics (period-aware)
- `useAdminOrders.ts` — paginated list + single order + status update + tracking
- `useAdminCustomers.ts` — paginated list + single customer
- `useAdminRefunds.ts` — paginated list + process refund
- `useAdminProducts.ts` — paginated list + CRUD
- `useAdminCategories.ts` — tree + CRUD
- `useAdminBanners.ts` — list + CRUD
- `useAdminReviews.ts` — pending list + approve/reject

### Files to Modify
| File | Change |
|------|--------|
| `Client/src/lib/api.ts` | Add `api.admin.*` namespace with all admin endpoints |
| `Client/src/App.tsx` | Add 12 admin routes wrapped in `AdminGuard` |
| `Client/package.json` | Add `recharts` (and `date-fns` if not present) |

### Backend — What's Already Ready
- `GET /admin/dashboard/stats` ✅
- `GET /admin/dashboard/analytics` ✅
- `GET /admin/dashboard/top-products` ✅
- `GET/PATCH /admin/customers*` ✅
- `GET/PATCH /admin/orders*` ✅
- `GET/PATCH /admin/refunds*` ✅

### Backend — Routes to Verify / Add
These services exist but admin HTTP routes may not be wired — need to check and add if missing:
- Product CRUD: `POST/PUT/DELETE /api/v1/products` (admin-protected)
- Category CRUD: `POST/PUT/DELETE /api/v1/categories` (admin-protected)
- Banner CRUD: `POST/PUT/DELETE /api/v1/banners` (admin-protected)
- Review approval: `PATCH /api/v1/reviews/:id/approve` (admin-protected)

---

## Implementation Order

1. **Install dependencies** — `recharts` + `date-fns`
2. **Extend api.ts** — add all admin methods (dashboard, orders, customers, refunds, products, categories, banners, reviews)
3. **AdminGuard + AdminLayout** — sidebar, header, shell
4. **Wire routes** in App.tsx
5. **Dashboard page** — stats cards + charts (highest visibility)
6. **Orders** — list + detail + status update + tracking
7. **Customers** — list + detail
8. **Refunds** — list + approve/reject
9. **Products** — list + create/edit form
10. **Categories** — tree view + form
11. **Banners** — grid + form
12. **Reviews** — approval queue

---

## Design Conventions
- Use existing Tailwind theme: `primary` (#800020 maroon), `background` (#F8F8F6), `surface` (#fff)
- Sidebar: dark bg (`gray-900`), white text, maroon active indicator
- Stat cards: white surface with subtle shadow, maroon accent on trend arrows
- Tables: consistent with existing app style (`text-on-surface`, `outline` borders)
- Status badges: color-coded (yellow=pending, blue=processing, purple=shipped, green=delivered, red=cancelled/refunded)
- All admin routes render inside `AdminLayout` — no Navbar/Footer from the customer-facing shell

---

## Complete TODO Checklist

### Phase 0 — Setup ✅
- [x] Install `recharts` in dashboard/
- [x] Install `date-fns` in dashboard/
- [x] Create folder structure: `dashboard/src/pages/`, `dashboard/src/components/`, `dashboard/src/hooks/`

### Phase 1 — API Layer ✅
- [x] Add `api.admin.getDashboardStats()` to `dashboard/src/lib/api.ts`
- [x] Add `api.admin.getAnalytics(period, startDate?, endDate?)` to `api.ts`
- [x] Add `api.admin.getTopProducts(limit?, startDate?, endDate?)` to `api.ts`
- [x] Add `api.admin.getCustomers(page, limit, search?)` to `api.ts`
- [x] Add `api.admin.getCustomerById(id)` to `api.ts`
- [x] Add `api.admin.getOrders(page, limit, status?, search?, startDate?, endDate?)` to `api.ts`
- [x] Add `api.admin.getOrderById(id)` to `api.ts`
- [x] Add `api.admin.updateOrderStatus(id, status, note?)` to `api.ts`
- [x] Add `api.admin.addTracking(id, awbCode, trackingUrl?)` to `api.ts`
- [x] Add `api.admin.getRefunds(page, limit, status?)` to `api.ts`
- [x] Add `api.admin.processRefund(id, status, adminNote?)` to `api.ts`
- [x] Add `api.admin.getProducts(page, limit, search?, categoryId?, isActive?, lowStock?)` to `api.ts`
- [x] Add `api.admin.getProductById(id)` to `api.ts`
- [x] Add `api.admin.createProduct(data)` to `api.ts`
- [x] Add `api.admin.updateProduct(id, data)` to `api.ts`
- [x] Add `api.admin.deleteProduct(id)` to `api.ts`
- [x] Add `api.admin.getCategoryTree(includeInactive?)` to `api.ts`
- [x] Add `api.admin.createCategory(data)` to `api.ts`
- [x] Add `api.admin.updateCategory(id, data)` to `api.ts`
- [x] Add `api.admin.deleteCategory(id)` to `api.ts`
- [x] Add `api.admin.getBanners(type?, includeInactive?)` to `api.ts`
- [x] Add `api.admin.createBanner(data)` to `api.ts`
- [x] Add `api.admin.updateBanner(id, data)` to `api.ts`
- [x] Add `api.admin.deleteBanner(id)` to `api.ts`
- [x] Add `api.admin.getPendingReviews(page, limit)` to `api.ts`
- [x] Add `api.admin.approveReview(id)` to `api.ts`
- [x] Add `api.admin.rejectReview(id)` to `api.ts`

### Phase 2 — Backend Route Verification ✅
- [x] Verified product CRUD admin routes exist (POST/PATCH/DELETE `/api/v1/products`)
- [x] Verified category CRUD admin routes exist
- [x] Verified banner CRUD admin routes exist
- [x] Added review approve/reject admin routes (`PATCH /api/v1/reviews/:id/approve`, `DELETE /api/v1/reviews/:id/reject`, `GET /api/v1/reviews/admin/pending`)

### Phase 3 — Layout & Routing Shell ✅
- [x] Create `AdminGuard.tsx` — redirect non-admin users to `/login`
- [x] Create `AdminLayout.tsx` — sidebar + header + `<Outlet />`
- [x] Create `AdminSidebar.tsx` — nav links: Dashboard, Orders, Customers, Refunds, Products, Categories, Banners, Reviews
- [x] Create `AdminHeader.tsx` — breadcrumb + user info + logout button
- [x] Add 12 admin routes to `App.tsx` wrapped in `<AdminGuard>`

### Phase 4 — Shared Components ✅
- [x] Create `AdminTable.tsx` — generic table wrapper with loading skeleton + empty state
- [x] Create `Pagination.tsx` — prev/next + page number display
- [x] Create `SearchInput.tsx` — debounced (300ms) search field
- [x] Create `DateRangePicker.tsx` — from/to date inputs with validation
- [x] Create `ConfirmModal.tsx` — reusable danger confirmation dialog
- [x] Create `EmptyState.tsx` — icon + message for empty tables

### Phase 5 — Dashboard Page ✅
- [x] Create `useAdminDashboard.ts` hook — fetches stats + analytics + top products
- [x] Create `StatsCard.tsx` — KPI card: label, value, optional trend indicator
- [x] Create `PeriodSelector.tsx` — Today / Week / Month / Year / Custom tabs
- [x] Create `TopProductsChart.tsx` — Recharts `BarChart` (top products by revenue)
- [x] Create `StatusDonutChart.tsx` — Recharts `PieChart` (order status breakdown)
- [x] Create `TopProductsTable.tsx` — ranked table with revenue + units
- [x] Create `AdminDashboardPage.tsx` — assemble all dashboard components

### Phase 6 — Order Management ✅
- [x] Create `useAdminOrders.ts` hook — list + detail + status update + tracking
- [x] Create `OrderStatusBadge.tsx` — color-coded status chip
- [x] Create `OrderFilters.tsx` — status select + date range + search bar
- [x] Create `OrderStatusTimeline.tsx` — vertical step timeline for status history
- [x] Create `TrackingModal.tsx` — form modal for AWB + tracking URL
- [x] Create `AdminOrdersPage.tsx` — list page with filters
- [x] Create `AdminOrderDetailPage.tsx` — full order detail with actions

### Phase 7 — Customer Management ✅
- [x] Create `useAdminCustomers.ts` hook — list + detail
- [x] Create `AdminCustomersPage.tsx` — list page
- [x] Create `AdminCustomerDetailPage.tsx` — profile + addresses + order history

### Phase 8 — Refund Management ✅
- [x] Create `useAdminRefunds.ts` hook — list + process
- [x] Create `RefundActionModal.tsx` — approve/reject form with admin note
- [x] Create `AdminRefundsPage.tsx`

### Phase 9 — Product Management ✅
- [x] Create `useAdminProducts.ts` hook — list + CRUD
- [x] Create `VariantsEditor.tsx` — dynamic add/remove variant rows
- [x] Create `PriceTiersEditor.tsx` — dynamic add/remove price tier rows
- [x] Create `ProductForm.tsx` — full create/edit form (all fields)
- [x] Create `AdminProductsPage.tsx` — list with search + filters
- [x] Create `AdminProductEditPage.tsx` — form page (new + edit)

### Phase 10 — Category Management ✅
- [x] Create `useAdminCategories.ts` hook — tree + CRUD
- [x] Create `CategoryTree.tsx` — recursive nested list with expand/collapse + action buttons
- [x] Create `CategoryForm.tsx` — create/edit form with parentId select
- [x] Create `AdminCategoriesPage.tsx`

### Phase 11 — Banner Management ✅
- [x] Create `useAdminBanners.ts` hook — list + CRUD
- [x] Create `BannerGrid.tsx` — cards grouped by banner type with image preview
- [x] Create `BannerForm.tsx` — create/edit with date window fields
- [x] Create `AdminBannersPage.tsx`

### Phase 12 — Review Approval ✅
- [x] Create `useAdminReviews.ts` hook — pending list + approve/reject
- [x] Create `ReviewQueue.tsx` — cards with product info, rating, text + action buttons
- [x] Create `AdminReviewsPage.tsx`

### Phase 13 — Polish & QA ✅
- [x] Zero TypeScript errors (`npx tsc -p tsconfig.app.json --noEmit`)
- [x] Admin guard redirects unauthenticated users to `/login`
- [x] Admin guard rejects non-admin users (role check in login flow)
- [x] Period selector drives analytics + chart refresh
- [x] Banner date window validation (end must be after start)
- [x] Category delete blocked when children exist (API enforces, error displayed)
- [x] Confirm `npm run build` target ready (zero TS errors confirmed)

---

## Verification
1. Run `npm run dev` in Client/ and navigate to `/admin`
2. Confirm redirect if not authenticated / not admin
3. Dashboard KPI cards load from `/admin/dashboard/stats`
4. Analytics chart updates when period selector changes
5. Orders table paginates, filters by status, searches by order number
6. Order detail shows timeline, status can be updated
7. Refund approval modal submits PATCH and re-fetches list
8. Product create form submits and product appears in list
9. Category tree renders hierarchy; child counts block deletion
10. Banner type grouping is correct; date window shown correctly
11. Run `npm run build` — zero TypeScript errors
