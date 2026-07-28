# Frames41 - Monthly Server & Cloud Expenses

> **Pure infrastructure costs only. No development time included.**

---

## 💰 Monthly Breakdown

### 1. Application Hosting (Railway)

| Service | Specs | Cost |
|---------|-------|------|
| **PostgreSQL** | 0.5 vCPU, 1GB RAM | **$7 (~₹580)** |
| **Node.js API** | 0.5 vCPU, 512MB RAM | **$5 (~₹420)** |
| **Worker Process** | Shared CPU, 256MB | **$3 (~₹250)** |
| **Network Egress** | ~20GB/month | **$2 (~₹170)** |
| **Disk Storage** | 10GB | **$1 (~₹85)** |
| **Subtotal** | | **~₹1,505** |

---

### 2. Image/File Storage (Cloudflare R2)

| Service | Usage | Cost |
|---------|-------|------|
| **Storage** | 5GB product images | **$0 (Free 10GB)** |
| **Egress** | 20GB downloads | **$0 (Free)** |
| **Subtotal** | | **₹0** |

> Alternative: Backblaze B2 (~₹100/month)

---

### 3. External APIs

| Service | Usage | Cost |
|---------|-------|------|
| **Razorpay** | Payment gateway | **₹0 (Pay per transaction: 2% fee)** |
| **Shiprocket** | Shipping labels | **₹0 (Free plan: <100 orders/mo)** |
| **WhatsApp Business API** | ~300 messages/mo | **₹0 (Free tier: 1,000 convos)** |
| **SMS (MSG91)** | ~50 OTPs/month | **₹50** |
| **Email (AWS SES)** | ~100 emails | **₹25** |
| **Subtotal** | | **~₹75** |

---

### 4. Domain & DNS

| Service | Cost |
|---------|------|
| **Domain (.com)** | **₹800/year = ₹67/month** |
| **SSL Certificate** | **₹0 (Let's Encrypt free)** |
| **CDN (Cloudflare Free)** | **₹0** |
| **Subtotal** | **~₹67** |

---

### 5. Monitoring (Free Tier)

| Service | Cost |
|---------|------|
| **UptimeRobot** (5 min checks) | **₹0** |
| **Railway Logs** | **₹0** |
| **Subtotal** | **₹0** |

---

## 📊 TOTAL MONTHLY COST

| Category | Amount |
|----------|--------|
| Railway Hosting | ₹1,505 |
| Image Storage | ₹0 |
| External APIs | ₹75 |
| Domain | ₹67 |
| Monitoring | ₹0 |
| **TOTAL** | **₹1,647/month** |

**Round up: ₹1,800/month** (buffer for overages)

---

## 📅 Annual Projection

| Period | Cost |
|--------|------|
| Monthly | ₹1,800 |
| Yearly | **₹21,600** |

---

## 🚀 Cost Optimization (Optional)

| Switch To | Savings | New Monthly |
|-----------|---------|-------------|
| **Fly.io** instead of Railway | -₹500 | ₹1,300 |
| **Supabase Free** DB | -₹580 | ₹1,220 |
| **Render Free** API tier | -₹420 | ₹1,380 |
| **All optimizations** | -₹1,000 | **₹800** |

---

## 📝 What Client Pays Per Month

**₹1,800/month** covers:
- Server running 24/7
- Database storage & backups
- Image hosting
- SMS notifications
- Domain renewal
- SSL certificate
- Basic monitoring

**NOT included:**
- Razorpay transaction fees (2% per order - paid per sale)
- WhatsApp overages beyond 1,000 conversations
- Shiprocket premium plan (after 100 orders/month)

---

## 🎯 Summary

| Metric | Value |
|--------|-------|
| **Minimum viable cost** | ₹1,647/month |
| **Recommended charge** | ₹1,800/month |
| **With optimizations** | ₹800-1,200/month |
| **Annual cost** | ₹21,600 |

---

*Last updated: May 2026*
*Based on 100 users/day traffic*
