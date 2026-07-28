/**
 * Demo seed — realistic orders, customers, reviews, and refunds for dashboard testing.
 * Run AFTER the main seed: npx tsx prisma/seed-demo.ts
 */
import { PrismaClient, OrderStatus, RefundStatus, UserRole } from '@prisma/client'

const prisma = new PrismaClient()

// ─── Helpers ────────────────────────────────────────────────────────────────

function daysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

let orderCounter = 0

async function initOrderCounter() {
  const last = await prisma.order.findFirst({ orderBy: { orderNumber: 'desc' } })
  if (last) {
    const n = parseInt(last.orderNumber.replace('F41-', ''), 10)
    orderCounter = isNaN(n) ? 2000 : n
  } else {
    orderCounter = 2000
  }
}

function nextOrderNumber(): string {
  return `F41-${String(++orderCounter).padStart(6, '0')}`
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Seeding demo data (orders, customers, reviews, refunds)...')
  await initOrderCounter()

  // ── Fetch products seeded by main seed ──────────────────────────────────────
  const products = await prisma.product.findMany({ take: 12 })
  if (products.length === 0) {
    throw new Error('No products found. Run the main seed first: npm run db:seed')
  }

  // ── Customers ───────────────────────────────────────────────────────────────
  const customerData = [
    { phone: '9810001001', name: 'Priya Sharma',    email: 'priya.sharma@gmail.com',    city: 'Delhi',     state: 'Delhi',       pincode: '110001', line1: '14 Sarojini Nagar, Block B' },
    { phone: '9820001002', name: 'Rahul Mehta',     email: 'rahul.mehta@gmail.com',     city: 'Mumbai',    state: 'Maharashtra', pincode: '400050', line1: '7 Bandra West, Turner Road' },
    { phone: '9830001003', name: 'Ananya Krishnan', email: 'ananya.k@gmail.com',        city: 'Bengaluru', state: 'Karnataka',   pincode: '560001', line1: '22 Indiranagar, 100 Feet Road' },
    { phone: '9840001004', name: 'Vikram Patel',    email: 'vikram.patel@gmail.com',    city: 'Ahmedabad', state: 'Gujarat',     pincode: '380001', line1: '5 CG Road, Navrangpura' },
    { phone: '9850001005', name: 'Sneha Iyer',      email: 'sneha.iyer@gmail.com',      city: 'Chennai',   state: 'Tamil Nadu',  pincode: '600001', line1: '33 Anna Salai, T Nagar' },
    { phone: '9860001006', name: 'Arjun Reddy',     email: 'arjun.reddy@gmail.com',     city: 'Hyderabad', state: 'Telangana',   pincode: '500001', line1: '10 Banjara Hills, Road No 3' },
    { phone: '9870001007', name: 'Kavya Nair',      email: 'kavya.nair@gmail.com',      city: 'Kochi',     state: 'Kerala',      pincode: '682001', line1: '18 Marine Drive, Ernakulam' },
    { phone: '9880001008', name: 'Rohan Gupta',     email: 'rohan.gupta@gmail.com',     city: 'Kolkata',   state: 'West Bengal', pincode: '700001', line1: '9 Park Street, Kolkata' },
    { phone: '9890001009', name: 'Pooja Verma',     email: 'pooja.verma@gmail.com',     city: 'Jaipur',    state: 'Rajasthan',   pincode: '302001', line1: '41 C Scheme, Ashok Marg' },
    { phone: '9900001010', name: 'Amit Singh',      email: 'amit.singh@gmail.com',      city: 'Lucknow',   state: 'Uttar Pradesh', pincode: '226001', line1: '3 Hazratganj, Mahatma Gandhi Marg' },
  ]

  const customers: { id: string; name: string; addressSnapshot: object }[] = []

  for (const cd of customerData) {
    const user = await prisma.user.upsert({
      where: { email: cd.email },
      update: {},
      create: {
        phone: cd.phone,
        name: cd.name,
        email: cd.email,
        passwordHash: 'demo-only-no-password',
        role: UserRole.USER,
        isVerified: true,
        createdAt: daysAgo(randomBetween(30, 120)),
      },
    })

    let addr = await prisma.address.findFirst({ where: { userId: user.id } })
    if (!addr) {
      addr = await prisma.address.create({
        data: {
          userId: user.id,
          line1: cd.line1,
          city: cd.city,
          state: cd.state,
          pincode: cd.pincode,
          isDefault: true,
        },
      })
    }

    customers.push({
      id: user.id,
      name: cd.name,
      addressSnapshot: {
        line1: addr.line1,
        line2: addr.line2 ?? null,
        city: addr.city,
        state: addr.state,
        pincode: addr.pincode,
      },
    })
  }

  console.log(`✅ Customers: ${customers.length}`)

  // ── Order factory ────────────────────────────────────────────────────────────

  type OrderSpec = {
    customerId: string
    addressSnapshot: object
    daysBack: number
    status: OrderStatus
    items: { productIdx: number; qty: number }[]
    hasRefund?: boolean
    refundStatus?: RefundStatus
  }

  async function createOrder(spec: OrderSpec) {
    const product1 = products[spec.items[0].productIdx % products.length]
    const qty1 = spec.items[0].qty
    const price1 = Number(product1.discountedPrice ?? product1.basePrice)
    const subtotal1 = price1 * qty1

    let subtotal = subtotal1
    const lineItems: { productId: string; productSnapshot: object; quantity: number; unitPrice: number; totalPrice: number }[] = [
      {
        productId: product1.id,
        productSnapshot: { name: product1.name, sku: product1.sku, imageUrl: null },
        quantity: qty1,
        unitPrice: price1,
        totalPrice: subtotal1,
      },
    ]

    if (spec.items[1]) {
      const p2 = products[spec.items[1].productIdx % products.length]
      const q2 = spec.items[1].qty
      const pr2 = Number(p2.discountedPrice ?? p2.basePrice)
      const tot2 = pr2 * q2
      subtotal += tot2
      lineItems.push({
        productId: p2.id,
        productSnapshot: { name: p2.name, sku: p2.sku, imageUrl: null },
        quantity: q2,
        unitPrice: pr2,
        totalPrice: tot2,
      })
    }

    const shipping = subtotal >= 999 ? 0 : 79
    const total = subtotal + shipping
    const placedAt = daysAgo(spec.daysBack)

    const statusHistory: { status: OrderStatus; note: string | null; createdAt: Date }[] = [
      { status: OrderStatus.PENDING, note: null, createdAt: placedAt },
    ]

    if ([OrderStatus.PAID, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.REFUNDED].includes(spec.status)) {
      statusHistory.push({ status: OrderStatus.PAID, note: 'Payment confirmed', createdAt: new Date(placedAt.getTime() + 5 * 60 * 1000) })
    }
    if ([OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.REFUNDED].includes(spec.status)) {
      statusHistory.push({ status: OrderStatus.PROCESSING, note: 'Order is being prepared', createdAt: new Date(placedAt.getTime() + 4 * 60 * 60 * 1000) })
    }
    if ([OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.REFUNDED].includes(spec.status)) {
      statusHistory.push({ status: OrderStatus.SHIPPED, note: 'Shipped via Delhivery', createdAt: new Date(placedAt.getTime() + 2 * 24 * 60 * 60 * 1000) })
    }
    if ([OrderStatus.DELIVERED, OrderStatus.REFUNDED].includes(spec.status)) {
      statusHistory.push({ status: OrderStatus.DELIVERED, note: 'Delivered successfully', createdAt: new Date(placedAt.getTime() + 5 * 24 * 60 * 60 * 1000) })
    }
    if (spec.status === OrderStatus.CANCELLED) {
      statusHistory.push({ status: OrderStatus.CANCELLED, note: 'Cancelled by customer', createdAt: new Date(placedAt.getTime() + 30 * 60 * 1000) })
    }
    if (spec.status === OrderStatus.REFUNDED) {
      statusHistory.push({ status: OrderStatus.REFUNDED, note: 'Refund approved', createdAt: new Date(placedAt.getTime() + 8 * 24 * 60 * 60 * 1000) })
    }

    const order = await prisma.order.create({
      data: {
        orderNumber: nextOrderNumber(),
        userId: spec.customerId,
        status: spec.status,
        subtotal,
        discount: 0,
        shippingCharge: shipping,
        total,
        addressSnapshot: spec.addressSnapshot,
        placedAt,
        paidAt: statusHistory.find(h => h.status === OrderStatus.PAID)?.createdAt,
        shippedAt: statusHistory.find(h => h.status === OrderStatus.SHIPPED)?.createdAt,
        deliveredAt: statusHistory.find(h => h.status === OrderStatus.DELIVERED)?.createdAt,
        awbCode: [OrderStatus.SHIPPED, OrderStatus.DELIVERED].includes(spec.status) ? `DEL${randomBetween(100000000, 999999999)}` : null,
        items: { create: lineItems },
        statusHistory: {
          create: statusHistory.map(h => ({
            status: h.status,
            note: h.note,
            createdAt: h.createdAt,
          })),
        },
      },
    })

    if (spec.hasRefund && spec.refundStatus) {
      await prisma.refundRequest.create({
        data: {
          orderId: order.id,
          userId: spec.customerId,
          reason: 'Product received was damaged. The frame corner was cracked on arrival.',
          videoUrl: 'https://drive.google.com/file/d/demo-evidence-video',
          status: spec.refundStatus,
          requestedAt: new Date(placedAt.getTime() + 7 * 24 * 60 * 60 * 1000),
          processedAt: spec.refundStatus !== RefundStatus.PENDING ? new Date(placedAt.getTime() + 9 * 24 * 60 * 60 * 1000) : null,
          adminNote: spec.refundStatus === RefundStatus.APPROVED ? 'Refund approved. Damage confirmed from video.' : spec.refundStatus === RefundStatus.REJECTED ? 'Evidence insufficient. Cannot process refund.' : null,
        },
      })
    }

    return order
  }

  // ── Orders — spread across last 30 days ─────────────────────────────────────
  // Format: { customerId, daysBack, status, items: [{productIdx, qty}], hasRefund? }

  const orderSpecs: OrderSpec[] = [
    // Delivered orders (drive revenue)
    { customerId: customers[0].id, addressSnapshot: customers[0].addressSnapshot, daysBack: 28, status: OrderStatus.DELIVERED, items: [{ productIdx: 0, qty: 1 }, { productIdx: 3, qty: 1 }] },
    { customerId: customers[1].id, addressSnapshot: customers[1].addressSnapshot, daysBack: 26, status: OrderStatus.DELIVERED, items: [{ productIdx: 5, qty: 2 }] },
    { customerId: customers[2].id, addressSnapshot: customers[2].addressSnapshot, daysBack: 24, status: OrderStatus.DELIVERED, items: [{ productIdx: 8, qty: 1 }] },
    { customerId: customers[3].id, addressSnapshot: customers[3].addressSnapshot, daysBack: 22, status: OrderStatus.DELIVERED, items: [{ productIdx: 1, qty: 1 }, { productIdx: 10, qty: 3 }] },
    { customerId: customers[4].id, addressSnapshot: customers[4].addressSnapshot, daysBack: 20, status: OrderStatus.DELIVERED, items: [{ productIdx: 4, qty: 1 }] },
    { customerId: customers[5].id, addressSnapshot: customers[5].addressSnapshot, daysBack: 18, status: OrderStatus.DELIVERED, items: [{ productIdx: 6, qty: 1 }, { productIdx: 11, qty: 2 }] },
    { customerId: customers[6].id, addressSnapshot: customers[6].addressSnapshot, daysBack: 16, status: OrderStatus.DELIVERED, items: [{ productIdx: 2, qty: 1 }] },
    { customerId: customers[7].id, addressSnapshot: customers[7].addressSnapshot, daysBack: 15, status: OrderStatus.DELIVERED, items: [{ productIdx: 7, qty: 1 }, { productIdx: 0, qty: 1 }] },
    { customerId: customers[8].id, addressSnapshot: customers[8].addressSnapshot, daysBack: 13, status: OrderStatus.DELIVERED, items: [{ productIdx: 5, qty: 1 }] },
    { customerId: customers[9].id, addressSnapshot: customers[9].addressSnapshot, daysBack: 11, status: OrderStatus.DELIVERED, items: [{ productIdx: 3, qty: 2 }] },
    { customerId: customers[0].id, addressSnapshot: customers[0].addressSnapshot, daysBack: 9,  status: OrderStatus.DELIVERED, items: [{ productIdx: 8, qty: 1 }, { productIdx: 1, qty: 1 }] },
    { customerId: customers[1].id, addressSnapshot: customers[1].addressSnapshot, daysBack: 7,  status: OrderStatus.DELIVERED, items: [{ productIdx: 9, qty: 1 }] },
    // Shipped orders
    { customerId: customers[2].id, addressSnapshot: customers[2].addressSnapshot, daysBack: 5,  status: OrderStatus.SHIPPED,   items: [{ productIdx: 5, qty: 1 }] },
    { customerId: customers[3].id, addressSnapshot: customers[3].addressSnapshot, daysBack: 4,  status: OrderStatus.SHIPPED,   items: [{ productIdx: 2, qty: 1 }, { productIdx: 10, qty: 1 }] },
    { customerId: customers[4].id, addressSnapshot: customers[4].addressSnapshot, daysBack: 3,  status: OrderStatus.SHIPPED,   items: [{ productIdx: 6, qty: 2 }] },
    // Processing orders
    { customerId: customers[5].id, addressSnapshot: customers[5].addressSnapshot, daysBack: 2,  status: OrderStatus.PROCESSING, items: [{ productIdx: 4, qty: 1 }] },
    { customerId: customers[6].id, addressSnapshot: customers[6].addressSnapshot, daysBack: 2,  status: OrderStatus.PROCESSING, items: [{ productIdx: 0, qty: 1 }, { productIdx: 11, qty: 2 }] },
    { customerId: customers[7].id, addressSnapshot: customers[7].addressSnapshot, daysBack: 1,  status: OrderStatus.PROCESSING, items: [{ productIdx: 7, qty: 1 }] },
    // Paid (awaiting processing)
    { customerId: customers[8].id, addressSnapshot: customers[8].addressSnapshot, daysBack: 1,  status: OrderStatus.PAID,       items: [{ productIdx: 3, qty: 1 }] },
    { customerId: customers[9].id, addressSnapshot: customers[9].addressSnapshot, daysBack: 0,  status: OrderStatus.PAID,       items: [{ productIdx: 5, qty: 3 }] },
    // Pending (placed today, not yet paid)
    { customerId: customers[0].id, addressSnapshot: customers[0].addressSnapshot, daysBack: 0,  status: OrderStatus.PENDING,    items: [{ productIdx: 1, qty: 1 }] },
    { customerId: customers[1].id, addressSnapshot: customers[1].addressSnapshot, daysBack: 0,  status: OrderStatus.PENDING,    items: [{ productIdx: 8, qty: 2 }] },
    // Cancelled
    { customerId: customers[2].id, addressSnapshot: customers[2].addressSnapshot, daysBack: 17, status: OrderStatus.CANCELLED,  items: [{ productIdx: 9, qty: 1 }] },
    { customerId: customers[3].id, addressSnapshot: customers[3].addressSnapshot, daysBack: 10, status: OrderStatus.CANCELLED,  items: [{ productIdx: 2, qty: 1 }] },
    // Refunded (with refund request records)
    { customerId: customers[4].id, addressSnapshot: customers[4].addressSnapshot, daysBack: 25, status: OrderStatus.REFUNDED,   items: [{ productIdx: 0, qty: 1 }], hasRefund: true, refundStatus: RefundStatus.APPROVED },
    { customerId: customers[5].id, addressSnapshot: customers[5].addressSnapshot, daysBack: 19, status: OrderStatus.DELIVERED,  items: [{ productIdx: 6, qty: 1 }], hasRefund: true, refundStatus: RefundStatus.PENDING },
    { customerId: customers[6].id, addressSnapshot: customers[6].addressSnapshot, daysBack: 14, status: OrderStatus.DELIVERED,  items: [{ productIdx: 3, qty: 1 }], hasRefund: true, refundStatus: RefundStatus.REJECTED },
  ]

  const existingOrderCount = await prisma.order.count()
  let orderCount = 0

  if (existingOrderCount > 0) {
    console.log(`ℹ️  ${existingOrderCount} orders already in DB — skipping order creation (run db:reset to start fresh)`)
  } else {
    for (const spec of orderSpecs) {
      await createOrder(spec)
      orderCount++
    }
  }

  console.log(`✅ Orders: ${orderCount}`)

  // ── Reviews ──────────────────────────────────────────────────────────────────
  const reviewData = [
    { productIdx: 0, customerId: customers[0].id, rating: 5, title: 'Absolutely stunning frame', body: 'The oak quality is outstanding. It arrived well-packaged and looks even better in person. The natural finish is exactly what I wanted for my living room gallery wall.', isApproved: true, daysBack: 20 },
    { productIdx: 0, customerId: customers[7].id, rating: 4, title: 'Great quality, minor delay', body: 'The frame itself is beautiful — solid wood, clean corners, perfect finish. Delivery took a day longer than expected but Frames41 kept me updated the whole time.', isApproved: true, daysBack: 12 },
    { productIdx: 1, customerId: customers[1].id, rating: 5, title: 'Rich walnut, love it', body: 'This is genuinely the nicest frame I\'ve ever owned. The walnut grain is gorgeous and the wax finish feels premium. My 5×7 wedding photo looks like a piece of art.', isApproved: true, daysBack: 22 },
    { productIdx: 3, customerId: customers[0].id, rating: 5, title: 'Perfect triptych for our anniversary', body: 'Got this for our 5th anniversary to display our wedding, honeymoon, and current photos side by side. The pine stain is warm and beautiful. Couldn\'t be happier.', isApproved: true, daysBack: 25 },
    { productIdx: 4, customerId: customers[3].id, rating: 4, title: '9-photo grid looks stunning', body: 'The grid arrived flat-packed and was easy to assemble. The black mango wood with gold dividers is a real conversation piece. One divider strip had a minor scratch but support resolved it quickly.', isApproved: false, daysBack: 18 },
    { productIdx: 5, customerId: customers[1].id, rating: 5, title: 'Couple frame exceeded expectations', body: 'Ordered as a surprise Valentine\'s Day gift. The laser engraving is razor-sharp and the wood quality is excellent. My partner cried when she opened it. 10/10 would order again.', isApproved: true, daysBack: 21 },
    { productIdx: 5, customerId: customers[8].id, rating: 3, title: 'Good product, slow delivery', body: 'The frame looks lovely and the engraving is precise. However delivery took 9 days on a 5-7 day promise. Would appreciate better communication on delays.', isApproved: false, daysBack: 9 },
    { productIdx: 6, customerId: customers[5].id, rating: 5, title: 'Baby frame is absolutely adorable', body: 'We ordered this for our newborn and it is the sweetest thing. The laser-cut name letters and the birth stats are perfectly centred. Birchwood is beautifully light. Sent one to grandparents too!', isApproved: true, daysBack: 14 },
    { productIdx: 8, customerId: customers[2].id, rating: 5, title: 'Museum quality canvas print', body: 'Uploaded a high-res shot from our Ladakh trip. The print is absolutely stunning — colours are vibrant and the canvas texture is premium. Arrived perfectly rolled in a tube. Highly recommend.', isApproved: true, daysBack: 22 },
    { productIdx: 8, customerId: customers[0].id, rating: 4, title: 'Great print, corner slightly bent', body: 'The canvas quality and colour accuracy are excellent. One corner of the stretcher bar had a slight warp but I contacted support and they sent a replacement bar the next day. Excellent customer service.', isApproved: false, daysBack: 7 },
    { productIdx: 10, customerId: customers[3].id, rating: 5, title: 'Perfect under-999 pick', body: 'Bought three A4 minimal prints for my home office. The 250gsm silk paper is surprisingly premium for the price. They look expensive framed — didn\'t tell my guests what they cost!', isApproved: true, daysBack: 18 },
    { productIdx: 11, customerId: customers[5].id, rating: 4, title: 'Beautiful botanical set', body: 'The three prints are cohesive and beautifully illustrated. The rigid mailer meant they arrived in perfect condition. Only wish there were more design options. Will be back for the next drop.', isApproved: false, daysBack: 11 },
  ]

  let reviewCount = 0
  for (const r of reviewData) {
    const product = products[r.productIdx % products.length]
    const existing = await prisma.review.findFirst({
      where: { productId: product.id, userId: r.customerId },
    })
    if (!existing) {
      await prisma.review.create({
        data: {
          productId: product.id,
          userId: r.customerId,
          rating: r.rating,
          title: r.title,
          body: r.body,
          isApproved: r.isApproved,
          isVerified: true,
          createdAt: daysAgo(r.daysBack),
        },
      })
      reviewCount++
    }
  }

  console.log(`✅ Reviews: ${reviewCount} (${reviewData.filter(r => !r.isApproved).length} pending approval)`)

  // ── Summary ───────────────────────────────────────────────────────────────────
  const stats = await prisma.$transaction([
    prisma.order.count(),
    prisma.order.count({ where: { status: OrderStatus.DELIVERED } }),
    prisma.order.count({ where: { status: OrderStatus.PENDING } }),
    prisma.refundRequest.count({ where: { status: RefundStatus.PENDING } }),
    prisma.review.count({ where: { isApproved: false } }),
  ])

  console.log('\n🎉 Demo seeding complete!')
  console.log(`
  • ${customers.length} customers
  • ${orderCount} orders total
    - ${stats[1]} delivered  |  ${stats[2]} pending  |  ${orderSpecs.filter(o => o.status === OrderStatus.SHIPPED).length} shipped
    - ${orderSpecs.filter(o => o.status === OrderStatus.PROCESSING).length} processing  |  ${orderSpecs.filter(o => o.status === OrderStatus.CANCELLED).length} cancelled
  • ${stats[3]} pending refund requests
  • ${reviewCount} reviews (${stats[4]} awaiting approval)
  `)
}

main()
  .catch((e) => {
    console.error('❌ Demo seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
