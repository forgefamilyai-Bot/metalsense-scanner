# Ferrum AI & Sentinel - Deployment & Sales Guide

**Project**: MetalSense Scanner  
**Company**: Potent~Flow AI Tech  
**Contact**: Bill Koschney (Potent-Flow_AI_Tech@proton.me)  
**Logo**: >|<  
**Target**: Dickson Iron & Metal + Regional Scrap Yards  
**Revenue Goal**: $100,000 by April 24, 2026  

---

## 🚀 Quick Start

### Prerequisites
- Node.js 22.13.0+
- pnpm 10.4.1+
- MySQL/TiDB database
- Stripe account (test sandbox ready)

### Installation

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your database URL and Stripe keys

# 3. Run database migrations
pnpm db:push

# 4. Seed initial pricing data
python3 scripts/seed-prices.py

# 5. Start development server
pnpm dev

# 6. Build for production
pnpm build
pnpm start
```

---

## 📊 Platform Features

### For Scrap Yard Operators

**Live Pricing Dashboard**
- Real-time market prices for 8 metal types (copper, aluminum, steel, brass, stainless steel, lead, zinc, nickel)
- Updated daily from verified public sources
- Mobile-responsive design for field use

**Revenue Leakage Calculator**
- Compares yard's current buy prices vs. market rates
- Shows gap per metal type and total leakage
- Estimates monthly revenue loss (e.g., $12,960/month at 2000 lbs/month)
- Actionable recommendations to recover lost revenue

**Price Comparison Tool**
- Side-by-side comparison of yard prices vs. market
- Edit yard pricing directly in the interface
- Real-time gap analysis
- Status indicators (Below/Match/Above market)

**Yard Profile Management**
- Create and manage multiple yard locations
- Store custom pricing per yard
- Track pricing history over time

---

## 💰 Pricing Tiers

### Ferrum AI (Monthly Subscriptions)

| Tier | Price | Features |
|------|-------|----------|
| **Scout** | $199/month | Live market prices, 1 yard profile, basic leakage analysis, email support |
| **Pro** | $499/month | Everything in Scout + up to 5 yards, advanced analytics, priority support, price history |
| **Yard Command** | $1,499/month | Everything in Pro + unlimited yards, custom integrations, dedicated support, API access |

### Sentinel (One-Time Security Packages)

| Tier | Price | Features |
|------|-------|----------|
| **Scout** | $15,000 | Basic security implementation, 1 year support |
| **Guardian** | $35,000 | Advanced security, compliance features, 2 years support |
| **Sovereign** | $75,000 | Enterprise security, custom infrastructure, 3 years support |

### Founding Partner Discount (Dickson Iron & Metal)

- **50% off first 12 months** on chosen tier
- **Price lock for life** - rates never increase
- **Priority feature access** - new features first
- **Dedicated account manager**

---

## 🎯 Sales Strategy

### Target: Dickson Iron & Metal (Craig Dickson)

**Contact**: 907 N. Dyer Rd. Spokane, WA 99212 | (509) 535-6146

**Pitch Points**:
1. **Revenue Recovery**: Show the $12,960/year leakage problem they're likely experiencing
2. **Market Intelligence**: Real-time pricing keeps them competitive
3. **Founding Partner**: 50% discount + price lock = massive value
4. **Simplicity**: Mobile-first, easy to use on the yard floor

**Demo Script** (15 minutes):
1. Show live pricing dashboard (2 min)
2. Calculate their revenue leakage (3 min)
3. Show price comparison tool (3 min)
4. Explain Founding Partner offer (4 min)
5. Next steps (3 min)

### Regional Targets (Days 6-10)

Identify 2-3 additional yards in the Pacific Northwest:
- Pacific Steel Recycling
- Action Recycling
- Local independent yards

**Outreach Template**:
```
Subject: Real-Time Pricing Intelligence for [Yard Name]

Hi [Owner Name],

I'm reaching out because scrap yards in your region are leaving money on the table 
by not tracking live market prices.

Ferrum AI shows you:
- Current market rates for all metals (updated daily)
- Revenue leakage analysis (how much you're underpaying)
- Price comparison tools to stay competitive

We're offering Founding Partner pricing: 50% off subscriptions for the first 12 months.

Can I show you a 15-minute demo this week?

Best,
Bill Koschney
Potent~Flow AI Tech
```

---

## 🔐 Stripe Integration

### Test Mode
- **Publishable Key**: `pk_test_...` (auto-configured)
- **Secret Key**: `sk_test_...` (auto-configured)
- **Test Card**: `4242 4242 4242 4242` (any future expiry, any CVC)

### Webhook Setup
- Endpoint: `/api/stripe/webhook`
- Events: `payment_intent.succeeded`, `invoice.paid`, `customer.created`
- Signature verification: Enabled

### Checkout Flow
1. User selects plan and clicks "Subscribe"
2. Redirected to Stripe Checkout
3. Completes payment
4. Webhook confirms subscription
5. Dashboard shows active subscription status

---

## 📱 Mobile Optimization

The platform is optimized for field use:
- **Fast load times** (<2s on 4G)
- **Touch-friendly buttons** (min 44px)
- **Offline-capable** pricing cache
- **Responsive grid layouts** (1 col mobile, 3+ col desktop)
- **Dark theme** (reduces eye strain in bright sun)

---

## 📈 Daily Price Updates

### Scraper Configuration

The `scripts/seed-prices.py` script seeds initial data. For daily updates:

```bash
# Run daily via cron (add to crontab)
0 8 * * * cd /home/ubuntu/metalsense-scanner && python3 scripts/seed-prices.py
```

**Data Sources**:
- Rockaway Recycling (NYC benchmark)
- iScrap App (national average)
- ISRI (Institute of Scrap Recycling Industries)

---

## 🧪 Testing

### Run Unit Tests
```bash
pnpm test
```

### Manual Testing Checklist
- [ ] Create yard profile
- [ ] Update yard pricing
- [ ] View revenue leakage
- [ ] Check price comparison
- [ ] Test Stripe checkout (test card)
- [ ] Verify mobile responsiveness
- [ ] Test on iOS and Android

---

## 🚢 Deployment

### To Manus Platform
1. Create checkpoint: `webdev_save_checkpoint`
2. Click "Publish" button in Management UI
3. Platform auto-deploys to `metalsense-scanner.manus.space`

### To Your Own Server (`ks-node-01`)

```bash
# 1. Export code
zip -r metalsense-scanner.zip /home/ubuntu/metalsense-scanner

# 2. Transfer to your server
scp metalsense-scanner.zip user@ks-node-01:/opt/

# 3. Deploy
ssh user@ks-node-01
cd /opt
unzip metalsense-scanner.zip
cd metalsense-scanner
pnpm install
pnpm build
DATABASE_URL="..." STRIPE_SECRET_KEY="..." pnpm start
```

---

## 💡 Key Metrics to Track

| Metric | Target | Current |
|--------|--------|---------|
| Signups | 10+ | 0 |
| Trial Conversions | 50% | - |
| MRR (Monthly Recurring) | $5,000+ | $0 |
| Founding Partners | 3+ | 0 |
| Total Revenue | $100,000 | $0 |

---

## 📞 Support

**Technical Issues**:
- Check logs: `tail -f .manus-logs/devserver.log`
- Database connection: Verify `DATABASE_URL` env var
- Stripe errors: Check Stripe Dashboard → Developers → Webhooks

**Sales Support**:
- Email: Potent-Flow_AI_Tech@proton.me
- Phone: Available for demos and consultations

---

## 🎯 Next Steps (Days 1-10)

| Day | Action | Owner |
|-----|--------|-------|
| 1 | Deploy platform, seed data | Manus |
| 1 | Schedule demo with Dickson | Bill |
| 2 | Demo to Dickson Iron & Metal | Bill |
| 3 | Identify 2-3 regional targets | Bill |
| 4 | Outreach emails sent | Bill |
| 5 | Demo to regional yards | Bill |
| 6-10 | Close deals, process payments | Bill |
| 10 | Hit $100K revenue target | Bill |

---

**Let's build something great. >|<**
