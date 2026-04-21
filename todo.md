# MetalSense Scanner - Complete Platform Build

## Phase 1: Database & Backend (COMPLETED)
- [x] Database schema created (metals, market_prices, yards, yard_prices, price_history)
- [x] tRPC procedures defined (metals, pricing, yards)
- [x] Database helpers implemented (db.ts)

## Phase 2: Frontend UI & Design System (IN PROGRESS)
- [ ] Update design system with elegant color palette (slate/charcoal + copper accents)
- [ ] Create DashboardLayout component for authenticated users
- [ ] Build Home/Landing page with product overview
- [ ] Create responsive navigation for mobile-first design
- [ ] Implement theme provider with light/dark support

## Phase 3: Core Features - Live Pricing Dashboard
- [ ] Metals list page showing all metal types with descriptions
- [ ] Live market prices display with real-time updates
- [ ] Price comparison table (market vs yard prices)
- [ ] Metal category browser with grades and pricing info
- [ ] Price history charts with trend visualization
- [ ] Mobile-optimized price display for field use

## Phase 4: Revenue Leakage Analysis
- [ ] Leakage calculator page showing gap analysis
- [ ] Estimate money lost per metal category
- [ ] Visual representation of leakage impact
- [ ] Export leakage report functionality
- [ ] Integration with yard profile for personalized insights

## Phase 5: Yard Profile Management
- [ ] Yard profile creation form (name, location, contact)
- [ ] Custom price list editor per yard
- [ ] Price history tracking per yard
- [ ] Profile settings and preferences
- [ ] Multi-yard support for users managing multiple locations

## Phase 6: Payment Processing - Stripe Integration
- [ ] Add Stripe feature to project (webdev_add_feature)
- [ ] Implement subscription checkout (Scout, Pro, Yard Command)
- [ ] Implement one-time payment checkout (Sentinel tiers)
- [ ] Founding Partner discount application (50% off first 12 months)
- [ ] Price lock mechanism for founding partners
- [ ] Subscription management and billing portal
- [ ] Webhook handlers for payment events
- [ ] Customer onboarding after payment

## Phase 7: Pricing Tiers & Packages
- [ ] Ferrum AI tiers display (Scout $199, Pro $499, Yard Command $1,499/month)
- [ ] Sentinel security tiers display ($15K, $35K, $75K one-time)
- [ ] Pricing comparison page
- [ ] Feature matrix for each tier
- [ ] Founding Partner offer page (50% discount, price lock)
- [ ] Upgrade/downgrade flow

## Phase 8: Data Integration - Price Scraping
- [ ] Implement price scraper for Rockaway Recycling
- [ ] Implement price scraper for iScrap App
- [ ] Daily scheduled scraping (cron job)
- [ ] Real market data seeding
- [ ] Price history population
- [ ] Error handling and retry logic

## Phase 9: Sales Materials & Marketing
- [ ] Professional pitch deck (PDF) - Ferrum AI & Sentinel overview
- [ ] Email template for Dickson (Founding Partner offer)
- [ ] Email template for regional yards
- [ ] Demo talking points document
- [ ] Pricing comparison sheet
- [ ] ROI calculator (show $12,960/year savings example)

## Phase 10: Testing & Verification
- [ ] Unit tests for leakage calculator
- [ ] Integration tests for pricing procedures
- [ ] End-to-end test of subscription flow
- [ ] Mobile responsiveness testing
- [ ] Payment processing verification
- [ ] Scraper data validation

## Phase 11: Deployment Package
- [ ] Export complete codebase
- [ ] Create deployment script for ks-node-01
- [ ] Database migration scripts
- [ ] Environment configuration documentation
- [ ] Scraper setup instructions
- [ ] Stripe API key setup guide

## Phase 12: Launch & Revenue
- [ ] Deploy to production
- [ ] Dickson demo and Founding Partner pitch
- [ ] Regional yard outreach (Pacific Steel, Action Recycling)
- [ ] Close Dickson deal ($20K)
- [ ] Close 2-3 additional yards ($70K+)
- [ ] Hit $100K revenue target by April 24

## Key Metrics
- **Revenue Goal:** $100,000 by April 24, 2026
- **Timeline:** 10 days (April 14-24)
- **Primary Customer:** Dickson Iron & Metal (Founding Partner)
- **Secondary Targets:** 2-3 regional scrap yards
- **Pricing Model:** Subscription + one-time security packages

## Notes
- Founding Partner rate: 50% off first 12 months, price locked for life
- All code must be deployable to ks-node-01 (sovereign infrastructure)
- Mobile-first design critical for field use
- Real market data essential for credibility
- Sales execution is the revenue driver, not feature polish
