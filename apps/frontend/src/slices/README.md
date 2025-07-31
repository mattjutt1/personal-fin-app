# Vertical Slices Organization

This directory implements the **Atomic Vertical Slice Hybrid Architecture** pattern.

## Structure

Each slice represents a complete user feature that crosses all technical layers:

```
slices/
├── transaction-management/    # Complete vertical slice
│   ├── ui/                   # React components for transactions
│   ├── logic/                # Business rules and calculations
│   ├── data/                 # Convex queries/mutations
│   └── types/                # TypeScript type definitions
├── budget-tracking/          # Complete vertical slice  
│   ├── ui/                   # Budget UI components
│   ├── logic/                # Budget business logic
│   ├── data/                 # Budget Convex functions
│   └── types/                # Budget type definitions
└── goal-management/          # Complete vertical slice
    ├── ui/                   # Goal UI components
    ├── logic/                # Goal business logic  
    ├── data/                 # Goal Convex functions
    └── types/                # Goal type definitions
```

## Principles

### Atomic Components
- Each slice is **self-contained** and **independent**
- No shared business logic between slices
- Clear API boundaries for slice communication
- Each slice owns its data model

### Vertical Organization
- **By Feature**: Organized around user capabilities, not technical layers
- **Cross-Layer**: UI, logic, data all within the same slice
- **Team Ownership**: Single team can own entire slice
- **Complete Features**: Each slice delivers independent user value

### Hybrid Deployment
- **Phase 1**: All slices in single Next.js app (current)
- **Phase 2**: Modular deployment when >1000 users
- **Phase 3**: Selective microservices when >10K users
- **Hybrid**: Mix of deployment strategies per slice needs

## Implementation Guidelines

### Creating a New Slice
1. Create directory structure: `slices/feature-name/{ui,logic,data,types}`
2. Define types first in `types/index.ts`
3. Create Convex functions in `data/`
4. Implement business logic in `logic/`
5. Build UI components in `ui/`

### Slice Boundaries
- **Data Ownership**: Each slice owns its Convex schema
- **API Boundaries**: Well-defined interfaces between slices
- **Independence**: Slices can be developed and deployed separately
- **Communication**: Through APIs only, no direct code sharing

### Quality Gates
- [ ] Slice independence validation
- [ ] Clear API boundaries
- [ ] Complete feature implementation
- [ ] Performance within slice
- [ ] Testing isolation

## Current Implementation

- ✅ **transaction-management**: Core transaction CRUD operations
- ✅ **budget-tracking**: Budget creation and monitoring  
- ✅ **goal-management**: Financial goal setting and tracking

See `ATOMIC_VERTICAL_SLICE_HYBRID_GOVERNANCE.md` for complete architecture governance.