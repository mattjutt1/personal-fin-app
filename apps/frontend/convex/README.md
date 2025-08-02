# Convex Backend Infrastructure

Production-ready backend for Simple Daily Family Budget with <500ms real-time sync.

## 🏗️ Architecture Overview

### Reliability-First Design
- **Uptime Target**: 99.9% (8.7h/year downtime max)
- **Response Time**: <200ms API calls, <500ms family sync
- **Error Rate**: <0.1% for critical operations
- **Recovery Time**: <5 minutes for critical services

### Core Components

#### Schema (`schema.ts`)
- **Families**: Budget configuration and settings
- **Family Members**: Role-based access (manager/member)
- **Transactions**: Optimized for real-time sync with version control
- **Budget Categories**: 3-category system (Fixed, Variable, Savings)
- **Daily Budgets**: Cached calculations for performance
- **Activity Feed**: Real-time family notifications
- **Sync State**: Optimistic updates and conflict resolution
- **Error Logs**: Comprehensive error tracking and recovery

#### Performance Optimizations
- **Compound Indexes**: `by_family_date_category`, `by_family_date_type`
- **Caching Layer**: Daily budget calculations cached for 5 minutes
- **Optimistic Updates**: Client-side prediction with server reconciliation
- **Batch Operations**: Parallel queries where no dependencies exist

## 📋 API Reference

### Family Management (`families.ts`)

```typescript
// Create family with default categories
createFamily({
  name: string,
  monthlyIncome: number,
  fixedExpenses: number,
  savingsGoal: number,
  budgetStartDate: string,
})

// Add family member with role
addFamilyMember({
  familyId: Id<"families">,
  userId: string,
  name: string,
  email: string,
  role: "manager" | "member",
})

// Get family details with members
getFamilyDetails({ familyId: Id<"families"> })
```

### Transaction Management (`transactions.ts`)

```typescript
// Create transaction with family sync
createTransaction({
  familyId: Id<"families">,
  userId: string,
  userName: string,
  amount: number,
  description: string,
  category: "fixed" | "variable" | "savings",
  type: "income" | "expense",
  date: string, // ISO date
  clientId?: string, // For deduplication
})

// Get family transactions with filters
getFamilyTransactions({
  familyId: Id<"families">,
  limit?: number,
  startDate?: string,
  endDate?: string,
  category?: "fixed" | "variable" | "savings",
  type?: "income" | "expense",
})

// Get daily transactions (optimized)
getDailyTransactions({
  familyId: Id<"families">,
  date: string,
})
```

### Daily Budget Calculations (`budgets.ts`)

```typescript
// Calculate daily budget with caching
calculateDailyBudget({
  familyId: Id<"families">,
  date: string,
})
// Returns: (Income - Fixed - Savings) ÷ Days remaining

// Get monthly overview
getMonthlyBudgetOverview({
  familyId: Id<"families">,
  year: number,
  month: number, // 0-based
})
```

### Real-time Activity (`activity.ts`)

```typescript
// Get family activity feed
getFamilyActivity({
  familyId: Id<"families">,
  limit?: number,
  since?: number, // For incremental updates
})

// Get unread notifications
getUnreadNotifications({
  familyId: Id<"families">,
  userId: string,
})

// Get active family members with presence
getActiveFamilyMembers({ familyId: Id<"families"> })
```

### Authentication (`auth.ts`)

```typescript
// Create user profile
createUserProfile({
  userId: string,
  email: string,
  name: string,
})

// Get user's family context
getUserFamilyContext({ userId: string })

// Create family invitation
createFamilyInvitation({
  familyId: Id<"families">,
  invitedBy: string,
  inviteeEmail: string,
  role: "manager" | "member",
})

// Accept invitation
acceptFamilyInvitation({
  invitationCode: string,
  userId: string,
  userName: string,
  userEmail: string,
})
```

### System Reliability (`reliability.ts`)

```typescript
// Health check
getSystemHealth({
  familyId?: Id<"families">,
  includeMetrics?: boolean,
})

// Performance metrics
getPerformanceMetrics({
  timeframe?: "1h" | "1d" | "7d",
  familyId?: Id<"families">,
})

// Circuit breaker status
checkCircuitBreakerStatus({
  service: string,
  familyId?: Id<"families">,
})

// System maintenance
performMaintenance({
  userId: string,
  actions: Array<"cleanup_old_errors" | "resolve_sync_conflicts" | "recalculate_budgets">,
  familyId?: Id<"families">,
})
```

## 🚀 Quick Start

### 1. Initialize Convex

```bash
cd apps/frontend
npx convex dev
```

### 2. Deploy Schema

The schema will be automatically deployed when you run `convex dev`.

### 3. Test Core Functions

```typescript
// In your Next.js app
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

function BudgetApp() {
  const createFamily = useMutation(api.families.createFamily);
  const dailyBudget = useQuery(api.budgets.calculateDailyBudget, {
    familyId: "your-family-id",
    date: new Date().toISOString().split("T")[0],
  });

  return (
    <div>
      <h1>Daily Budget: ${dailyBudget?.dailyBudgetAmount.toFixed(2)}</h1>
      <p>Remaining: ${dailyBudget?.remainingBudget.toFixed(2)}</p>
    </div>
  );
}
```

## 🔒 Security Features

### Role-Based Access Control
- **Family Managers**: Full budget management, member invitation
- **Family Members**: Transaction entry, activity viewing
- **Permission Checks**: Every mutation validates user permissions

### Data Protection
- **Input Validation**: All inputs validated with Convex validators
- **SQL Injection Protection**: Built-in with Convex queries
- **Rate Limiting**: Error tracking prevents abuse
- **Audit Trail**: All actions logged in family activity

### Privacy
- **Family Isolation**: All data scoped to family ID
- **User Context**: No cross-family data access
- **Secure Invitations**: Time-limited invitation codes

## 📊 Performance Monitoring

### Key Metrics
- **Response Time**: Track API call latency
- **Error Rate**: Monitor error logs table
- **Sync Conflicts**: Track optimistic update failures
- **Cache Hit Rate**: Daily budget cache effectiveness

### Health Endpoints
```typescript
// System health
const health = useQuery(api.reliability.getSystemHealth, {
  familyId: "your-family-id",
  includeMetrics: true,
});

// Performance metrics
const metrics = useQuery(api.reliability.getPerformanceMetrics, {
  timeframe: "1h",
  familyId: "your-family-id",
});
```

## 🛠️ Error Handling

### Automatic Recovery
- **Retry Logic**: Exponential backoff for failed operations
- **Circuit Breakers**: Prevent cascading failures
- **Graceful Degradation**: Maintain core functionality during issues

### Error Categories
- **TransactionCreationError**: Failed expense entry
- **FamilySyncError**: Real-time sync issues
- **BudgetCalculationError**: Daily budget computation failures
- **AuthorizationError**: Permission violations

### Manual Resolution
```typescript
// Resolve specific errors
const resolveError = useMutation(api.reliability.resolveError);
await resolveError({
  errorLogId: "error-id",
  userId: "admin-user-id",
  resolution: "Manual intervention completed",
});
```

## 🚨 Production Deployment

### Environment Setup
1. **Convex Project**: Create production Convex project
2. **Environment Variables**: Configure auth and external services
3. **Monitoring**: Set up alerts for error thresholds
4. **Backup Strategy**: Convex provides automatic backups

### Performance Optimization
- **Index Coverage**: All queries use optimized indexes
- **Query Batching**: Related queries executed in parallel
- **Cache Strategy**: 5-minute cache on daily budget calculations
- **Connection Pooling**: Convex handles connection management

### Scaling Considerations
- **Multi-Family Support**: Schema designed for thousands of families
- **Concurrent Users**: Optimistic updates handle family conflicts
- **Global Distribution**: Convex provides edge deployment
- **Cost Efficiency**: Pay-per-use pricing model

## 📈 Roadmap

### Phase 1 (Current)
- ✅ Core family budget management
- ✅ Real-time transaction sync
- ✅ Daily budget calculations
- ✅ Error handling and recovery

### Phase 2 (Next Sprint)
- 🔄 Push notifications integration
- 🔄 Offline support with sync
- 🔄 Advanced reporting features
- 🔄 Data export capabilities

### Phase 3 (Future)
- 📅 Bank connection integration
- 📅 AI-powered budget insights
- 📅 Multi-currency support
- 📅 Advanced analytics dashboard

## 🤝 Contributing

1. **Schema Changes**: Update `schema.ts` and test thoroughly
2. **New Features**: Add comprehensive error handling
3. **Performance**: Always include performance benchmarks
4. **Security**: Review all permission checks
5. **Documentation**: Update this README with new APIs

---

**Built with reliability-first principles for family financial collaboration** 🏠💰