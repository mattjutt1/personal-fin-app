# Personal Finance App Documentation

Welcome to the Simple Daily Family Budget project documentation. This independent SaaS application provides production-ready personal finance management with AI-powered insights and subscription monetization.

## Project Overview

**Project Name**: Simple Daily Family Budget  
**Type**: Production-Ready Personal Finance SaaS  
**Status**: MVP Complete + Authentication Functional + TypeScript Errors Requiring Resolution  
**Business Model**: Freemium with premium subscriptions ($4.99/month, $49.99/year)  
**Tech Stack**: Next.js 15 + Convex Auth + Stripe + Tailwind CSS  

## Quick Navigation

- **[Main README](../README.md)** - Project overview and getting started
- **[Frontend README](../apps/frontend/README.md)** - Frontend-specific setup and development
- **[Project Memory](../CLAUDE.md)** - Comprehensive project context and current status
- **[Project Rules](../PROJECT_RULES.md)** - Development principles and constraints

## Current Status (August 2, 2025)

### ✅ Completed Features
- **Authentication System**: Convex Auth with Password, GitHub, Google providers
- **Subscription System**: Stripe integration with freemium model and 14-day trials
- **Core UI**: Login, signup, dashboard, pricing pages with mobile-first design
- **PaywallGate System**: Premium feature protection with graceful degradation
- **Real-time Sync**: Family budget sharing with sub-500ms updates

### ⚠️ Current Issues
- **TypeScript Compilation**: 60+ errors in Convex functions preventing production build
- **ESLint Violations**: 30+ code quality issues requiring resolution
- **Build Configuration**: Currently bypassing quality checks to enable development

### 🎯 Next Priorities
1. **Resolve TypeScript Errors**: Fix Convex function compilation issues
2. **Address ESLint Violations**: Improve code quality and maintainability  
3. **Enable Build Validation**: Remove bypass flags for production readiness
4. **Complete Auth Integration**: Restore full Convex Auth functionality

## Architecture Summary

### Technology Choices
- **Frontend**: Next.js 15 with App Router and TypeScript
- **Backend**: Convex (Backend-as-a-Service) with real-time subscriptions
- **Authentication**: Convex Auth with multi-provider support
- **Payments**: Stripe with subscription management and webhooks
- **Styling**: Tailwind CSS with mobile-first responsive design
- **Deployment**: Vercel (frontend) + Convex (backend)

### Project Structure
```
personal-fin-app/
├── apps/frontend/          # Next.js application
│   ├── src/               # Source code
│   ├── convex/           # Backend functions and schema
│   └── public/           # Static assets
├── apps/backend/         # Future AI processing (Python)
├── docs/                 # Project documentation
├── CLAUDE.md            # Comprehensive project memory
├── PROJECT_RULES.md     # Development principles
└── README.md           # Main project overview
```

### Hybrid Consolidated-Slice Architecture
The project uses a hybrid approach combining:
- **Consolidated Components**: Cross-cutting UI, types, API clients for easy navigation
- **Vertical Slices**: Domain-specific business logic preserved in feature slices
- **Benefits**: Predictable file locations with maintained domain boundaries

## Development Guidelines

### Anti-Over-Engineering Principles
1. **Start Simple**: Build minimum viable features first
2. **YAGNI**: Don't build until actually needed
3. **Evidence-Based**: Add complexity only with proof of necessity
4. **Ship Fast**: MVP over perfect solution

### Security Requirements (Non-Negotiable)
- Environment variables for all secrets (never commit credentials)
- HTTPS-only communications in production
- Input validation and sanitization for all user data
- Audit logging for financial operations
- Rate limiting on API endpoints

### Quality Standards
- TypeScript strict mode enabled
- ESLint configured with Next.js rules
- Pre-commit hooks for code quality (when implemented)
- Mobile-first responsive design
- WCAG 2.1 AA accessibility compliance

## Documentation Structure

### Core Documentation
- **[CLAUDE.md](../CLAUDE.md)** - Complete project memory and context
- **[PROJECT_RULES.md](../PROJECT_RULES.md)** - Development principles and constraints
- **[README.md](../README.md)** - Project overview and quick start

### Technical Documentation
- **[Frontend README](../apps/frontend/README.md)** - Frontend setup and development
- **Environment Configuration** - See .env.local.example for required variables
- **API Documentation** - Stripe integration and authentication endpoints

### Future Documentation (Planned)
- STRIPE_SETUP_GUIDE.md - Complete Stripe configuration
- DEPLOYMENT_GUIDE.md - Production deployment instructions
- TESTING_GUIDE.md - Comprehensive testing procedures
- AI_INTEGRATION.md - Future AI features implementation

## Getting Started

1. **Clone and Setup**:
   ```bash
   cd /home/matt/Atlas-Financial/personal-fin-app/apps/frontend
   npm install
   cp .env.local.example .env.local
   ```

2. **Configure Environment**:
   - Add Convex URL: `NEXT_PUBLIC_CONVEX_URL`
   - Add Stripe keys for testing (optional)

3. **Start Development**:
   ```bash
   npm run dev
   # Visit http://localhost:3000
   ```

4. **Test Authentication**:
   - Visit `/auth/signin` for login
   - Visit `/auth/signup` for registration
   - Use URL parameters: `?user=premium` for testing premium features

## Support and Resources

- **Convex Dashboard**: https://dashboard.convex.dev/t/matt/project/frugal-crab-771
- **Stripe Dashboard**: Configure for payment processing
- **Technical Issues**: See CLAUDE.md troubleshooting section
- **Architecture Questions**: Reference PROJECT_RULES.md for principles

---
*This documentation is maintained as part of the comprehensive project memory system. Last updated: August 2, 2025*
