# Frontend Design Prompt for Frames41 E-commerce Platform

## Project Overview

**Frames41** is a premium Indian e-commerce platform specializing in MDF cutouts, DIY craft kits, wooden home decor, and personalized gift items. The platform targets creative enthusiasts, DIY hobbyists, event planners, and gift buyers across India.

**Brand Essence:** Creative, artisanal, warm, trustworthy, contemporary Indian craft
**Target Audience:** Ages 22-45, creative individuals, home decorators, small business owners, gift givers
**Geographic Focus:** Pan-India with metro city concentration

---

## Design Philosophy


- Color palette selection (derive from MDF material aesthetics - warm woods, craft paper, artisan textures)
- Typography hierarchy
- Spacing and layout systems
- Micro-interactions and animations
- Iconography style
- Component design language

**Design must evoke:**
- Handcrafted authenticity
- Modern usability
- Trust for online transactions
- Inspiration for creative projects
- Warmth and approachability

---

## User Personas

### 1. Priya (The DIY Enthusiast)
- Age: 28, Bangalore
- Loves weekend craft projects
- Watches YouTube tutorials
- Price-conscious but values quality
- Shops on mobile primarily

### 2. Rahul (The Event Planner)
- Age: 35, Mumbai
- Buys in bulk for weddings/corporate events
- Needs customization options
- Desktop user for large orders
- Values quick checkout and GST invoices

### 3. Ananya (The Home Decorator)
- Age: 42, Delhi
- Looking for unique home accents
- Prefers COD initially, trusts after first order
- Interested in product reviews and real photos
- Uses both mobile and tablet

### 4. Vikram (The Small Business Owner)
- Age: 31, Jaipur
- Buys raw materials for his craft business
- Needs wholesale pricing
- Wants to track multiple orders
- Desktop-heavy user

---

## Feature Modules Requiring UI/UX

### PHASE 1: FOUNDATION
#### 1. Authentication System
**Screens Needed:**
- Phone number input with country code (India default)
- OTP verification with 6-digit inputs
- New user onboarding (name, email optional)
- Login success state
- Session expired / re-login flow

**Key Interactions:**
- Auto-focus OTP fields
- Resend OTP countdown timer
- Smooth transitions between states
- Biometric login prompt (if available)

#### 2. User Profile
**Screens Needed:**
- Profile overview (name, phone, email, DOB)
- Edit profile modal
- Manage addresses (add, edit, delete)
- Address form with pincode auto-fill
- Default address selection

### PHASE 2: CATALOG
#### 3. Homepage
**Sections Required:**
- Sticky announcement bar (top)
- Navigation with category mega-menu
- Hero carousel (3-4 slides with CTAs)
- "Shop by Category" grid (with MDF shape icons)
- Featured products carousel
- "Under ₹999" section
- Best sellers grid
- New arrivals horizontal scroll
- Instagram feed integration placeholder
- Newsletter signup
- Footer with payment icons

**Key Interactions:**
- Category hover reveals subcategories
- Product card hover shows secondary image
- Add to cart from product card
- Quick view modal
- Wishlist toggle animation

#### 4. Category Pages
**Screens Needed:**
- Category listing with filters sidebar
- Mobile: Bottom sheet filters
- Price range slider
- Font style filter (for customizable products)
- Shape filter (for MDF cutouts)
- Sort options (newest, price, popularity)
- Empty state design
- Loading skeletons

#### 5. Product Detail Page
**Sections Required:**
- Image gallery (zoom, thumbnails)
- Product info (name, price, SKU)
- Stock status indicator
- Variant selection (if applicable)
- Font customization selector
- Bulk pricing table
- "Add to Cart" CTA
- "Buy Now" CTA
- Wishlist button
- Share button (WhatsApp deep link)
- Product description tabs
- Specifications table
- Customer reviews section
- Related products carousel
- Recently viewed strip

**Key Interactions:**
- Image pinch-to-zoom
- Swipe gallery
- Font preview live update
- Sticky add-to-cart on scroll
- Size guide modal

#### 6. Search Experience
**Screens Needed:**
- Search bar with voice input
- Search suggestions dropdown
- Recent searches
- Trending searches
- Search results with filters
- No results state with suggestions

### PHASE 3: COMMERCE
#### 7. Cart & Pricing
**Screens Needed:**
- Cart page with item cards
- Quantity stepper controls
- Remove item with undo
- Apply coupon input
- Apply gift card input
- Referral code input
- Pincode checker for shipping
- Price breakdown (subtotal, discount, shipping, total)
- "Proceed to Checkout" CTA
- Empty cart illustration

**Key Interactions:**
- Real-time price updates
- Shipping calculator
- Tier pricing display
- Cart item swipe to delete (mobile)

#### 8. Checkout Flow
**Steps:**
1. Address selection/add
2. Delivery options display
3. Payment method selection
4. Order summary
5. Razorpay integration
6. Order confirmation

**Screens Needed:**
- Multi-step progress indicator
- Address selection cards
- Add new address form
- Delivery estimate display
- Payment methods (UPI, Cards, Netbanking, COD)
- Order summary sidebar (sticky)
- Success animation
- Order details page

### PHASE 4: POST-PURCHASE
#### 9. Order Management
**Screens Needed:**
- My orders list
- Order status timeline
- Track shipment (Shiprocket AWB)
- Download invoice
- Cancel order option
- Return/Refund request flow

#### 10. Reviews
**Screens Needed:**
- Write review form
- Star rating selection
- Image upload (max 3)
- Review guidelines modal
- My reviews list
- Review success state

### PHASE 5: ENGAGEMENT
#### 11. Wishlist
**Screens Needed:**
- Wishlist grid
- Move to cart
- Share wishlist
- Empty wishlist state

#### 12. Referral Program
**Screens Needed:**
- Referral code display
- Share options (WhatsApp, SMS, Copy)
- Referral stats dashboard
- Referral history
- How it works explainer

#### # Frontend Design Prompt for Frames41 E-commerce Platform

## Project Overview

**Frames41** is a premium Indian e-commerce platform specializing in MDF cutouts, DIY craft kits, wooden home decor, and personalized gift items. The platform targets creative enthusiasts, DIY hobbyists, event planners, and gift buyers across India.

**Brand Essence:** Creative, artisanal, warm, trustworthy, contemporary Indian craft
**Target Audience:** Ages 22-45, creative individuals, home decorators, small business owners, gift givers
**Geographic Focus:** Pan-India with metro city concentration

---

## Design Philosophy


- Color palette selection (derive from MDF material aesthetics - warm woods, craft paper, artisan textures)
- Typography hierarchy
- Spacing and layout systems
- Micro-interactions and animations
- Iconography style
- Component design language

**Design must evoke:**
- Handcrafted authenticity
- Modern usability
- Trust for online transactions
- Inspiration for creative projects
- Warmth and approachability

---

## User Personas

### 1. Priya (The DIY Enthusiast)
- Age: 28, Bangalore
- Loves weekend craft projects
- Watches YouTube tutorials
- Price-conscious but values quality
- Shops on mobile primarily

### 2. Rahul (The Event Planner)
- Age: 35, Mumbai
- Buys in bulk for weddings/corporate events
- Needs customization options
- Desktop user for large orders
- Values quick checkout and GST invoices

### 3. Ananya (The Home Decorator)
- Age: 42, Delhi
- Looking for unique home accents
- Prefers COD initially, trusts after first order
- Interested in product reviews and real photos
- Uses both mobile and tablet

### 4. Vikram (The Small Business Owner)
- Age: 31, Jaipur
- Buys raw materials for his craft business
- Needs wholesale pricing
- Wants to track multiple orders
- Desktop-heavy user

---

## Feature Modules Requiring UI/UX

### PHASE 1: FOUNDATION
#### 1. Authentication System
**Screens Needed:**
- Phone number input with country code (India default)
- OTP verification with 6-digit inputs
- New user onboarding (name, email optional)
- Login success state
- Session expired / re-login flow

**Key Interactions:**
- Auto-focus OTP fields
- Resend OTP countdown timer
- Smooth transitions between states
- Biometric login prompt (if available)

#### 2. User Profile
**Screens Needed:**
- Profile overview (name, phone, email, DOB)
- Edit profile modal
- Manage addresses (add, edit, delete)
- Address form with pincode auto-fill
- Default address selection

### PHASE 2: CATALOG
#### 3. Homepage
**Sections Required:**
- Sticky announcement bar (top)
- Navigation with category mega-menu
- Hero carousel (3-4 slides with CTAs)
- "Shop by Category" grid (with MDF shape icons)
- Featured products carousel
- "Under ₹999" section
- Best sellers grid
- New arrivals horizontal scroll
- Instagram feed integration placeholder
- Newsletter signup
- Footer with payment icons

**Key Interactions:**
- Category hover reveals subcategories
- Product card hover shows secondary image
- Add to cart from product card
- Quick view modal
- Wishlist toggle animation

#### 4. Category Pages
**Screens Needed:**
- Category listing with filters sidebar
- Mobile: Bottom sheet filters
- Price range slider
- Font style filter (for customizable products)
- Shape filter (for MDF cutouts)
- Sort options (newest, price, popularity)
- Empty state design
- Loading skeletons

#### 5. Product Detail Page
**Sections Required:**
- Image gallery (zoom, thumbnails)
- Product info (name, price, SKU)
- Stock status indicator
- Variant selection (if applicable)
- Font customization selector
- Bulk pricing table
- "Add to Cart" CTA
- "Buy Now" CTA
- Wishlist button
- Share button (WhatsApp deep link)
- Product description tabs
- Specifications table
- Customer reviews section
- Related products carousel
- Recently viewed strip

**Key Interactions:**
- Image pinch-to-zoom
- Swipe gallery
- Font preview live update
- Sticky add-to-cart on scroll
- Size guide modal

#### 6. Search Experience
**Screens Needed:**
- Search bar with voice input
- Search suggestions dropdown
- Recent searches
- Trending searches
- Search results with filters
- No results state with suggestions

### PHASE 3: COMMERCE
#### 7. Cart & Pricing
**Screens Needed:**
- Cart page with item cards
- Quantity stepper controls
- Remove item with undo
- Apply coupon input
- Apply gift card input
- Referral code input
- Pincode checker for shipping
- Price breakdown (subtotal, discount, shipping, total)
- "Proceed to Checkout" CTA
- Empty cart illustration

**Key Interactions:**
- Real-time price updates
- Shipping calculator
- Tier pricing display
- Cart item swipe to delete (mobile)

#### 8. Checkout Flow
**Steps:**
1. Address selection/add
2. Delivery options display
3. Payment method selection
4. Order summary
5. Razorpay integration
6. Order confirmation

**Screens Needed:**
- Multi-step progress indicator
- Address selection cards
- Add new address form
- Delivery estimate display
- Payment methods (UPI, Cards, Netbanking, COD)
- Order summary sidebar (sticky)
- Success animation
- Order details page

### PHASE 4: POST-PURCHASE
#### 9. Order Management
**Screens Needed:**
- My orders list
- Order status timeline
- Track shipment (Shiprocket AWB)
- Download invoice
- Cancel order option
- Return/Refund request flow

#### 10. Reviews
**Screens Needed:**
- Write review form
- Star rating selection
- Image upload (max 3)
- Review guidelines modal
- My reviews list
- Review success state

### PHASE 5: ENGAGEMENT
#### 11. Wishlist
**Screens Needed:**
- Wishlist grid
- Move to cart
- Share wishlist
- Empty wishlist state

#### 12. Referral Program
**Screens Needed:**
- Referral code display
- Share options (WhatsApp, SMS, Copy)
- Referral stats dashboard
- Referral history
- How it works explainer

#### 13. Gift Cards
**Screens Needed:**
- Gift card purchase form
- Balance checker
- Redeem gift card input
- My gift cards list
- Gift card design preview

#### 14. Abandoned Cart Recovery
**User Touchpoints:**
- WhatsApp reminder message UI (template)
- Email reminder design
- Push notification (if PWA)

### PHASE 6: CONTENT
#### 15. Blog
**Screens Needed:**
- Blog listing with categories
- Featured post hero
- Blog post detail
- Author bio
- Related posts
- Share buttons

#### 16. FAQ & Support
**Screens Needed:**
- FAQ accordion categories
- Search within FAQ
- Contact form
- Chat widget (WhatsApp Business)

#### 17. Newsletter
**Screens Needed:**
- Subscription form (footer + popup)
- Confirmation email template
- Unsubscribe page

---

## ADMIN DASHBOARD UI/UX

### Dashboard Overview
**Layout:** Sidebar navigation + main content area
**Design Style:** Clean, data-dense, professional

#### 1. Login Screen
- Admin login (email/password)
- 2FA option
- Password reset flow

#### 2. Dashboard Home
**Widgets Required:**
- Revenue summary (today, this week, this month)
- Order count with status breakdown
- Low stock alerts
- Pending reviews count
- Recent orders table
- Sales chart (7-day trend)
- Top products list

#### 3. Product Management
**Screens:**
- Product grid with filters
- Add/Edit product form
  - Basic info
  - Pricing (base, discounted, tiers)
  - Inventory tracking
  - Images (drag-drop upload)
  - Variants management
  - SEO fields
  - Specifications table
- Bulk actions toolbar
- Import/Export interface

#### 4. Order Management
**Screens:**
- Orders list with filters
- Order detail view
- Status update dropdown
- Print invoice/Packing slip
- Initiate refund
- Assign AWB number

#### 5. Category Management
**Screens:**
- Category tree view
- Add/Edit category
- Image upload
- Sort order drag-drop

#### 6. Customer Management
**Screens:**
- Customer list
- Customer detail (profile + order history)
- Search and filter

#### 7. Coupon Management
**Screens:**
- Coupon list
- Create coupon form
- Usage stats
- Enable/Disable toggle

#### 8. Review Moderation
**Screens:**
- Pending reviews queue
- Approve/Reject actions
- Review detail with images
- Bulk moderation

#### 9. Banner Management
**Screens:**
- Banner positions (top strip, slider, under 999)
- Add/Edit banner
- Scheduling (start/end dates)
- Preview mode

#### 10. Reports & Analytics
**Screens:**
- Sales report (date range picker)
- Product performance
- Customer analytics
- Export to CSV/PDF

#### 11. Refund Requests
**Screens:**
- Refund queue
- Approve/Reject with reason
- Video review player
- Refund status tracking

---

## Design System Requirements

### Layout Grid
- **Desktop:** 12-column grid, max-width 1440px
- **Tablet:** 8-column grid
- **Mobile:** 4-column grid
- **Gutter:** 24px (desktop), 16px (mobile)
- **Margin:** 48px (desktop), 16px (mobile)

### Responsive Breakpoints
- **Mobile:** 320px - 767px
- **Tablet:** 768px - 1023px
- **Desktop:** 1024px - 1439px
- **Large Desktop:** 1440px+

### Typography Scale
**You define the complete type scale including:**
- Font families (suggest: Inter or Plus Jakarta Sans for modern feel)
- Heading hierarchy (H1-H6)
- Body text sizes
- Caption, label, button text
- Line heights and letter spacing

### Spacing Scale
Use 8px base unit:
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px
- 3xl: 64px

### Components to Design
- Buttons (primary, secondary, ghost, icon)
- Input fields (text, number, email, phone)
- Dropdowns/Selects
- Checkboxes and Radio buttons
- Toggles/Switches
- Cards (product, category, info)
- Modals/Dialogs
- Toasts/Notifications
- Loading states and skeletons
- Empty states
- Accordions
- Tabs
- Pagination
- Badges/Tags
- Tooltips
- Progress indicators

### Animations & Micro-interactions
**Define:**
- Page transitions
- Button hover/focus states
- Card hover effects
- Loading animations
- Success/error state animations
- Scroll-triggered animations
- Cart add animation
- Wishlist heart animation

---

## Technical Constraints

### Frontend Stack
- React 18+ with TypeScript
- Next.js 14 (App Router)
- Tailwind CSS for styling
- Framer Motion for animations
- React Query for data fetching
- Zustand for state management

### Performance Requirements
- First Contentful Paint < 1.5s
- Time to Interactive < 3.5s
- Lighthouse Score > 90
- Image optimization (WebP format)
- Lazy loading for images

### Accessibility (WCAG 2.1 AA)
- Keyboard navigation support
- Screen reader compatibility
- Minimum 4.5:1 contrast ratio
- Focus indicators visible
- Alt text for all images
- ARIA labels where needed

### PWA Features (Optional Phase 2)
- Offline browsing capability
- Add to home screen
- Push notifications
- Background sync

---

## Deliverables Expected

### 1. Design System Document
- Color palette (primary, secondary, neutral, semantic)
- Typography scale and usage
- Spacing system
- Shadow and elevation system
- Border radius scale
- Icon set style guide
- Animation timing and easing

### 2. High-Fidelity Screens
**Priority 1 (MVP):**
- Homepage
- Category listing
- Product detail
- Cart
- Checkout flow
- Order confirmation
- User profile/orders

**Priority 2 (Post-launch):**
- Wishlist
- Blog
- FAQ
- Review flow

**Priority 3 (Admin):**
- Admin dashboard
- Product CRUD
- Order management
- Basic analytics

### 3. Prototype
- Clickable Figma prototype (if using Figma)
- Or detailed interaction specifications

### 4. Asset Package
- All icons in SVG
- Image placeholder specifications
- Component code snippets (Tailwind classes)

---

## Special Considerations for Indian Market

### Cultural Context
- Festival-themed banners capability (Diwali, Christmas, etc.)
- Indian wedding season promotions
- Regional language support placeholders
- Rupee symbol (₹) usage
- Indian phone number format
- Address format (pincode first for validation)

### Payment UX
- UPI prominence (Google Pay, PhonePe, Paytm)
- Cash on Delivery option visibility
- EMI options display
- Multiple payment failures handling

### Trust Signals
- Secure payment badges
- Customer service number visible
- Return policy highlights
- Authentic product guarantees
- Customer photos in reviews

---

## Success Metrics for Design

- **Conversion Rate:** Target 2-3%
- **Cart Abandonment:** Reduce to <60%
- **Average Order Value:** Increase 15%
- **Mobile Conversion:** >50% of total
- **Page Load Time:** <3 seconds on 4G
- **Customer Satisfaction:** >4.5/5

---

## INSPIRATION REFERENCES (DO NOT COPY)

**E-commerce:**
- Etsy (handcrafted feel)
- West Elm (home decor aesthetic)
- Chumbak (Indian contemporary)
- Jaypore (artisanal luxury)

**Dashboard:**
- Shopify Admin
- Stripe Dashboard
- Vercel Dashboard

**Design Systems:**
- Material Design 3
- Apple Human Interface
- Vercel Design System

---

## FINAL INSTRUCTION TO DESIGNER

**Create a cohesive, modern, warm design system that:**

1. **Feels handcrafted** but functions with tech precision
2. **Builds trust** for first-time online craft buyers
3. **Inspires creativity** through visual storytelling
4. **Simplifies complexity** of customization options
5. **Celebrates Indian craft** aesthetics without being cliché
6. **Performs flawlessly** on 4G and budget smartphones
7. **Scales beautifully** from mobile to desktop
8. **Converts browsers** into buyers through intuitive UX

**You have complete freedom on:**
- Colors (derive from natural materials: wood, paper, clay, fabric)
- Typography (readable, warm, contemporary)
- Layouts (clean, breathable, focused)
- Interactions (delightful but not distracting)

**Design for the joy of creating something beautiful.**

---

## Output Format

Please provide designs as:
1. Figma file link (preferred)
2. Or high-res PNGs with annotations
3. Component library in Storybook format (if possible)
4. Written design system documentation
5. Mobile-first responsive designs (show mobile, tablet, desktop)

---

**Start with Priority 1 screens and design system foundation.**

**Questions to ask client before starting:**
1. Do you have existing brand colors/logo to incorporate?
2. Any competitor sites you admire?
3. Preference: Dark mode support from day 1?
4. Any specific festivals/seasons launching near?

---

**END OF DESIGN BRIEF**

*This is a living document - iterate based on feedback.*
13. Gift Cards
**Screens Needed:**
- Gift card purchase form
- Balance checker
- Redeem gift card input
- My gift cards list
- Gift card design preview

#### 14. Abandoned Cart Recovery
**User Touchpoints:**
- WhatsApp reminder message UI (template)
- Email reminder design
- Push notification (if PWA)

### PHASE 6: CONTENT
#### 15. Blog
**Screens Needed:**
- Blog listing with categories
- Featured post hero
- Blog post detail
- Author bio
- Related posts
- Share buttons

#### 16. FAQ & Support
**Screens Needed:**
- FAQ accordion categories
- Search within FAQ
- Contact form
- Chat widget (WhatsApp Business)

#### 17. Newsletter
**Screens Needed:**
- Subscription form (footer + popup)
- Confirmation email template
- Unsubscribe page

---

## ADMIN DASHBOARD UI/UX

### Dashboard Overview
**Layout:** Sidebar navigation + main content area
**Design Style:** Clean, data-dense, professional

#### 1. Login Screen
- Admin login (email/password)
- 2FA option
- Password reset flow

#### 2. Dashboard Home
**Widgets Required:**
- Revenue summary (today, this week, this month)
- Order count with status breakdown
- Low stock alerts
- Pending reviews count
- Recent orders table
- Sales chart (7-day trend)
- Top products list

#### 3. Product Management
**Screens:**
- Product grid with filters
- Add/Edit product form
  - Basic info
  - Pricing (base, discounted, tiers)
  - Inventory tracking
  - Images (drag-drop upload)
  - Variants management
  - SEO fields
  - Specifications table
- Bulk actions toolbar
- Import/Export interface

#### 4. Order Management
**Screens:**
- Orders list with filters
- Order detail view
- Status update dropdown
- Print invoice/Packing slip
- Initiate refund
- Assign AWB number

#### 5. Category Management
**Screens:**
- Category tree view
- Add/Edit category
- Image upload
- Sort order drag-drop

#### 6. Customer Management
**Screens:**
- Customer list
- Customer detail (profile + order history)
- Search and filter

#### 7. Coupon Management
**Screens:**
- Coupon list
- Create coupon form
- Usage stats
- Enable/Disable toggle

#### 8. Review Moderation
**Screens:**
- Pending reviews queue
- Approve/Reject actions
- Review detail with images
- Bulk moderation

#### 9. Banner Management
**Screens:**
- Banner positions (top strip, slider, under 999)
- Add/Edit banner
- Scheduling (start/end dates)
- Preview mode

#### 10. Reports & Analytics
**Screens:**
- Sales report (date range picker)
- Product performance
- Customer analytics
- Export to CSV/PDF

#### 11. Refund Requests
**Screens:**
- Refund queue
- Approve/Reject with reason
- Video review player
- Refund status tracking

---

## Design System Requirements

### Layout Grid
- **Desktop:** 12-column grid, max-width 1440px
- **Tablet:** 8-column grid
- **Mobile:** 4-column grid
- **Gutter:** 24px (desktop), 16px (mobile)
- **Margin:** 48px (desktop), 16px (mobile)

### Responsive Breakpoints
- **Mobile:** 320px - 767px
- **Tablet:** 768px - 1023px
- **Desktop:** 1024px - 1439px
- **Large Desktop:** 1440px+

### Typography Scale
**You define the complete type scale including:**
- Font families (suggest: Inter or Plus Jakarta Sans for modern feel)
- Heading hierarchy (H1-H6)
- Body text sizes
- Caption, label, button text
- Line heights and letter spacing

### Spacing Scale
Use 8px base unit:
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px
- 3xl: 64px

### Components to Design
- Buttons (primary, secondary, ghost, icon)
- Input fields (text, number, email, phone)
- Dropdowns/Selects
- Checkboxes and Radio buttons
- Toggles/Switches
- Cards (product, category, info)
- Modals/Dialogs
- Toasts/Notifications
- Loading states and skeletons
- Empty states
- Accordions
- Tabs
- Pagination
- Badges/Tags
- Tooltips
- Progress indicators

### Animations & Micro-interactions
**Define:**
- Page transitions
- Button hover/focus states
- Card hover effects
- Loading animations
- Success/error state animations
- Scroll-triggered animations
- Cart add animation
- Wishlist heart animation

---

## Technical Constraints

### Frontend Stack
- React 18+ with TypeScript
- Next.js 14 (App Router)
- Tailwind CSS for styling
- Framer Motion for animations
- React Query for data fetching
- Zustand for state management

### Performance Requirements
- First Contentful Paint < 1.5s
- Time to Interactive < 3.5s
- Lighthouse Score > 90
- Image optimization (WebP format)
- Lazy loading for images

### Accessibility (WCAG 2.1 AA)
- Keyboard navigation support
- Screen reader compatibility
- Minimum 4.5:1 contrast ratio
- Focus indicators visible
- Alt text for all images
- ARIA labels where needed

### PWA Features (Optional Phase 2)
- Offline browsing capability
- Add to home screen
- Push notifications
- Background sync

---

## Deliverables Expected

### 1. Design System Document
- Color palette (primary, secondary, neutral, semantic)
- Typography scale and usage
- Spacing system
- Shadow and elevation system
- Border radius scale
- Icon set style guide
- Animation timing and easing

### 2. High-Fidelity Screens
**Priority 1 (MVP):**
- Homepage
- Category listing
- Product detail
- Cart
- Checkout flow
- Order confirmation
- User profile/orders

**Priority 2 (Post-launch):**
- Wishlist
- Blog
- FAQ
- Review flow

**Priority 3 (Admin):**
- Admin dashboard
- Product CRUD
- Order management
- Basic analytics

### 3. Prototype
- Clickable Figma prototype (if using Figma)
- Or detailed interaction specifications

### 4. Asset Package
- All icons in SVG
- Image placeholder specifications
- Component code snippets (Tailwind classes)

---

## Special Considerations for Indian Market

### Cultural Context
- Festival-themed banners capability (Diwali, Christmas, etc.)
- Indian wedding season promotions
- Regional language support placeholders
- Rupee symbol (₹) usage
- Indian phone number format
- Address format (pincode first for validation)

### Payment UX
- UPI prominence (Google Pay, PhonePe, Paytm)
- Cash on Delivery option visibility
- EMI options display
- Multiple payment failures handling

### Trust Signals
- Secure payment badges
- Customer service number visible
- Return policy highlights
- Authentic product guarantees
- Customer photos in reviews

---

## Success Metrics for Design

- **Conversion Rate:** Target 2-3%
- **Cart Abandonment:** Reduce to <60%
- **Average Order Value:** Increase 15%
- **Mobile Conversion:** >50% of total
- **Page Load Time:** <3 seconds on 4G
- **Customer Satisfaction:** >4.5/5

---

## INSPIRATION REFERENCES (DO NOT COPY)

**E-commerce:**
- Etsy (handcrafted feel)
- West Elm (home decor aesthetic)
- Chumbak (Indian contemporary)
- Jaypore (artisanal luxury)

**Dashboard:**
- Shopify Admin
- Stripe Dashboard
- Vercel Dashboard

**Design Systems:**
- Material Design 3
- Apple Human Interface
- Vercel Design System

---

## FINAL INSTRUCTION TO DESIGNER

**Create a cohesive, modern, warm design system that:**

1. **Feels handcrafted** but functions with tech precision
2. **Builds trust** for first-time online craft buyers
3. **Inspires creativity** through visual storytelling
4. **Simplifies complexity** of customization options
5. **Celebrates Indian craft** aesthetics without being cliché
6. **Performs flawlessly** on 4G and budget smartphones
7. **Scales beautifully** from mobile to desktop
8. **Converts browsers** into buyers through intuitive UX

**You have complete freedom on:**
- Colors (derive from natural materials: wood, paper, clay, fabric)
- Typography (readable, warm, contemporary)
- Layouts (clean, breathable, focused)
- Interactions (delightful but not distracting)

**Design for the joy of creating something beautiful.**

---

## Output Format

Please provide designs as:
1. Figma file link (preferred)
2. Or high-res PNGs with annotations
3. Component library in Storybook format (if possible)
4. Written design system documentation
5. Mobile-first responsive designs (show mobile, tablet, desktop)

---

**Start with Priority 1 screens and design system foundation.**

**Questions to ask client before starting:**
1. Do you have existing brand colors/logo to incorporate?
2. Any competitor sites you admire?
3. Preference: Dark mode support from day 1?
4. Any specific festivals/seasons launching near?

---

**END OF DESIGN BRIEF**

*This is a living document - iterate based on feedback.*
