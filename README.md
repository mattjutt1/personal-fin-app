# Simple Daily Family Budget

A production-ready personal finance SaaS built with Next.js, Convex Auth, and Stripe monetization. Features real-time family budget tracking with authentication and premium subscription tiers.

## Quick Start

```bash
# Install dependencies
cd apps/frontend
npm install

# Setup environment
cp .env.local.example .env.local
# Add your Convex URL and auth provider credentials

# Start development
npm run dev

# Convex Dashboard
https://dashboard.convex.dev/t/matt/project/frugal-crab-771
```

## Project Structure

```
personal-fin-app/
├── CLAUDE.md                 # Project memory and context
├── PROJECT_RULES.md          # Anti-over-engineering rules
├── apps/                     # Applications
│   ├── frontend/            # Next.js app with Convex
│   ├── backend/             # Python backend (future AI)
│   └── rust-engine/         # Financial calculations
├── data/                    # Data management
│   ├── migrations/          # Database migrations
│   ├── samples/            # Sample data
│   └── schemas/            # Data schemas
├── docs/                   # Documentation
│   ├── governance/         # Project governance files
│   ├── research/           # Research and analysis
│   ├── guides/            # User guides
│   └── api/               # API documentation
├── packages/              # Shared packages
├── tools/                 # Development tools
│   ├── scripts/           # Build, data, maintenance scripts
│   ├── environments/      # Virtual environments
│   └── configs/          # Configuration files
```

## Philosophy

**Anti-Over-Engineering**: Start simple, stay simple. Build for today's needs, not imagined futures.

- ✅ Direct function calls over abstractions
- ✅ Hardcode first, configure later
- ✅ Copy-paste before extracting
- ✅ Monolith before microservices

## Tech Stack

- **Frontend**: Next.js 15 + React + Tailwind CSS + shadcn/ui
- **Backend**: Convex (BaaS) + Convex Auth + Python (AI processing)
- **Database**: Convex built-in + PostgreSQL (future)
- **Authentication**: Convex Auth with Password, GitHub, Google providers
- **Payments**: Stripe with subscription tiers (Starter, Pro, Family)
- **AI Models**: Kaggle-hosted FinMA-7B models (free inference)
- **Architecture**: Atomic Vertical Slice Hybrid

## Key Features (Planned)

### P0 - Core Features
- AI-powered transaction categorization (FinMA-7B-NLP)
- Simplified onboarding with progressive disclosure
- Family budgeting with multi-user support

### P1 - Enhanced Features  
- Proactive spending alerts with pattern analysis
- Positive psychology UI (encouragement vs guilt)
- Smart category management (AI consolidation)

### P2 - Advanced Features
- Bank sync reliability with multiple methods
- Advanced budgeting (rollover/envelope method)
- Smart pricing with behavioral analysis

## Development

### Start Development
```bash
cd apps/frontend
npm install

# Setup environment variables
cp .env.local.example .env.local
# Edit .env.local with your Convex URL and auth provider credentials

npm run dev
```

### Quality Checks
```bash
# Run linting
npm run lint

# Type checking  
npm run type-check

# Build check
npm run build
```

⚠️ **Known Issues**: Currently bypassing TypeScript/ESLint errors in build config. See CLAUDE.md for details.

### AI Model Integration
Using pre-trained models from Atlas Financial project:
- **Budget Specialist**: FinMA-7B-NLP (Kaggle)
- **Investment Specialist**: FinMA-7B-Full (Kaggle)  
- **Debt Specialist**: FinGPT v3.2 (Kaggle)
- **Coordinator**: Mistral-7B (fallback)

## Architecture

### Vertical Slice Organization
```
apps/frontend/src/slices/
├── transaction-management/   # Complete transaction feature
│   ├── ui/                  # React components
│   ├── logic/               # Business logic
│   ├── data/                # Data access
│   └── types/               # TypeScript types
├── budget-tracking/         # Complete budget feature
└── goal-management/         # Complete goals feature
```

### Atomic Components
Each slice is self-contained with:
- ✅ Clear boundaries and interfaces
- ✅ Independent deployment capability
- ✅ Own data, UI, and business logic
- ✅ Minimal external dependencies

## Current Status

✅ **Authentication System**: Complete Convex Auth implementation with multiple providers  
✅ **Subscription System**: Stripe integration with PaywallGate protection  
✅ **Core UI**: Login, signup, dashboard, pricing pages  
⚠️ **Build Issues**: TypeScript/ESLint errors currently bypassed  
🔄 **In Progress**: Documentation updates and code quality fixes  

## Documentation

- **[Project Memory](CLAUDE.md)** - Current context and recent changes
- **[Project Roadmap](docs/PROJECT_ROADMAP.md)** - Development timeline and milestones
- **[Product Requirements](docs/PRD.md)** - Feature specifications and requirements
- **[Architecture Governance](docs/governance/)** - Technical decision framework
- **[Pain Points Research](docs/research/pain-points/)** - User needs analysis
- **[Technical Research](docs/research/technical-research/)** - Architecture validation

## Memory & Context

This project uses Claude's memory system for consistent development:
- **CLAUDE.md** - Primary context and project state
- **PROJECT_RULES.md** - Development constraints and principles  
- **docs/governance/** - Decision-making framework

## Contributing

1. Read PROJECT_RULES.md for development philosophy
2. Follow vertical slice architecture patterns
3. Keep it simple - avoid premature optimization
4. Update CLAUDE.md with major decisions
5. Ensure environment setup with .env.local before development
6. Run quality checks before committing (lint, type-check, build)

---

*Built with simplicity, powered by AI, designed for real humans managing real money.*