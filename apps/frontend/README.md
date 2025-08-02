# Simple Daily Family Budget - Frontend

A production-ready personal finance SaaS application built with Next.js 15, Convex Auth, and Stripe monetization. This frontend provides family budget tracking with real-time sync and premium subscription features.

## Project Overview

- **Tech Stack**: Next.js 15 + Convex Auth + Stripe + Tailwind CSS
- **Architecture**: Hybrid Consolidated-Slice with mobile-first design
- **Authentication**: Multi-provider (Password, GitHub, Google) via Convex Auth
- **Monetization**: Freemium model with $4.99/month and $49.99/year tiers
- **Real-time**: Sub-500ms family budget synchronization

## Quick Start

### 1. Environment Setup
```bash
# Copy environment template
cp .env.local.example .env.local

# Edit .env.local with required values:
# NEXT_PUBLIC_CONVEX_URL=https://frugal-crab-771.convex.cloud
# Add Stripe keys for payment testing (optional)
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### 4. Test Authentication
- **Sign Up**: Visit `/auth/signup` to create account
- **Sign In**: Visit `/auth/signin` to login
- **Premium Testing**: Add `?user=premium` to URL for premium features
- **Trial Testing**: Add `?user=trial` for trial mode

## Current Status (August 2, 2025)

✅ **Authentication System**: Functional with temporary fixes  
✅ **Core Features**: Family budget tracking with real-time sync  
✅ **Premium Features**: PaywallGate system with Stripe integration  
⚠️ **Build Issues**: TypeScript/ESLint errors require resolution  
🎯 **Next Priority**: Fix Convex function compilation errors

## Development Commands

### Core Development
```bash
npm run dev          # Start development server
npm run build        # Build for production (currently bypasses errors)
npm run start        # Start production server locally
npm run lint         # Run ESLint (30+ violations to fix)
npm run type-check   # TypeScript checking (60+ errors to fix)
```

### Convex Backend
```bash
npx convex dev       # Start Convex development mode
npx convex dashboard  # Open admin dashboard
npx convex codegen   # Generate TypeScript types
```

### Testing
```bash
# Manual Testing Routes
open http://localhost:3000/          # Homepage with budget display
open http://localhost:3000/pricing   # Subscription pricing page
open http://localhost:3000/auth/signin     # Authentication testing
open http://localhost:3000/auth/signup     # User registration

# Premium Feature Testing
open http://localhost:3000/?user=premium   # Mock premium status
open http://localhost:3000/?user=trial     # Mock trial status
open http://localhost:3000/?user=free      # Mock free status
```

## Architecture Overview

### Hybrid Consolidated-Slice Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (Stripe integration)
│   ├── auth/              # Authentication pages
│   ├── pricing/           # Subscription pricing
│   └── layout.tsx         # Root layout with providers
├── components/            # 🔄 CONSOLIDATED UI components
│   ├── business/          # Domain-specific components
│   │   ├── monetization/  # PaywallGate, subscription UI
│   │   ├── transaction/   # Transaction management
│   │   └── budget/        # Budget management
│   └── ui/               # Base UI components
├── types/                # 🔄 CONSOLIDATED type definitions
├── hooks/                # Custom React hooks
├── utils/                # 🔄 CONSOLIDATED utilities
└── slices/               # 🏗️ PRESERVED vertical slices
    ├── transaction-management/
    ├── budget-management/
    └── family-management/
```

### Key Features Implemented
- **Authentication**: Convex Auth with Password/GitHub/Google providers
- **Real-time Sync**: Family budget sharing via Convex subscriptions
- **Premium Gating**: PaywallGate component protecting premium features
- **Stripe Integration**: Subscription checkout and webhook processing
- **Mobile-First**: Responsive design with touch optimization

## Environment Variables

### Required (.env.local)
```bash
# Convex Backend (Required)
NEXT_PUBLIC_CONVEX_URL=https://frugal-crab-771.convex.cloud

# Convex Auth (Required for authentication)
CONVEX_SITE_URL=http://localhost:3000
SITE_URL=http://localhost:3000

# Stripe Integration (Optional for development)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_ANNUAL=price_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Troubleshooting

### Common Issues

**Authentication Not Working**:
- Verify Convex URL is correct
- Check that auth providers are configured in Convex dashboard
- Ensure CONVEX_SITE_URL and SITE_URL match your domain

**Build Errors**:
- Currently bypassed in next.config.ts for development
- 60+ TypeScript errors in Convex functions need resolution
- 30+ ESLint violations require fixing

**Stripe Integration Issues**:
- Check all Stripe environment variables are set
- Verify webhook endpoint is configured correctly
- Test with Stripe test cards: 4242 4242 4242 4242 (success)

### Debug Commands
```bash
# Check environment variables
printenv | grep CONVEX
printenv | grep STRIPE

# Clear caches
rm -rf .next node_modules package-lock.json
npm install

# Test API endpoints
curl -X POST localhost:3000/api/create-checkout \
  -H "Content-Type: application/json" \
  -d '{"priceId":"price_monthly_placeholder"}'
```

## Resources

### Project Documentation
- **[Main README](../../README.md)** - Project overview
- **[Project Memory](../../CLAUDE.md)** - Comprehensive context
- **[Project Rules](../../PROJECT_RULES.md)** - Development principles
- **[Docs README](../../docs/README.md)** - Documentation overview

### External Resources
- **[Convex Dashboard](https://dashboard.convex.dev/t/matt/project/frugal-crab-771)** - Backend management
- **[Next.js Documentation](https://nextjs.org/docs)** - Framework reference
- **[Convex Auth Docs](https://docs.convex.dev/auth)** - Authentication setup
- **[Stripe Documentation](https://stripe.com/docs)** - Payment integration

---
*This frontend is part of the Simple Daily Family Budget project. For complete project context, see [CLAUDE.md](../../CLAUDE.md).*