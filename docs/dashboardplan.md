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
