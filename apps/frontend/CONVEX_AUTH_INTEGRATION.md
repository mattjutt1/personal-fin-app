# Convex Auth Integration - Production Ready

This document outlines the complete Convex Auth integration for the Simple Daily Family Budget app, providing production-ready authentication with subscription system integration.

## 🏗️ Architecture Overview

The integration consists of several key components:

- **Convex Auth Configuration** (`convex/auth.config.ts`) - Core auth setup with providers and callbacks
- **Auth Integration Layer** (`convex/auth-integration.ts`) - Connects auth with subscription/family systems  
- **HTTP Router** (`convex/http.ts`) - Handles auth routes and webhooks
- **Frontend Integration** (`src/hooks/useSubscription.ts`) - React hooks for auth state
- **Security & Monitoring** - Comprehensive audit trails and error handling

## 🔧 Configuration Files

### 1. Core Auth Configuration (`convex/auth.config.ts`)

Features:
- **Multiple Providers**: Password, GitHub, Google OAuth
- **Production Callbacks**: Secure user creation/updates with audit trails
- **Subscription Integration**: Automatic subscription setup for new users
- **Security Controls**: Redirect validation, error handling, compliance logging

### 2. Auth Integration Functions (`convex/auth-integration.ts`)

Key Functions:
- `getUserSubscriptionStatus` - Complete subscription status with features
- `updateUserSubscriptionStatus` - Stripe webhook integration
- `getUserFamilyContextWithSubscription` - Family access with subscription limits
- `createFamilyWithSubscriptionLimits` - Enforce subscription-based family limits
- `checkFeatureAccess` - Granular feature access control
- `logSecurityEvent` - Security monitoring and compliance

### 3. HTTP Router (`convex/http.ts`)

Routes:
- `/api/auth/*` - OAuth sign-in/callback routes (handled by Convex Auth)
- `/health` - System health check
- `/stripe/webhook-backup` - Backup webhook endpoint for monitoring

## 🔐 Authentication Providers

### Password Authentication
```typescript
// Email/password with optional verification
Password({
  profile(params) {
    return {
      email: params.email as string,
      name: params.name as string,
    };
  },
})
```

### OAuth Providers
```typescript
// GitHub OAuth
GitHub({
  profile(profile) {
    return {
      email: profile.email!,
      name: profile.name || profile.login,
    };
  },
}),

// Google OAuth
Google({
  profile(profile) {
    return {
      email: profile.email!,
      name: profile.name!,
    };
  },
})
```

## 💳 Subscription Integration

### Feature Access Control
The system provides granular feature control based on subscription status:

```typescript
interface SubscriptionFeatures {
  bankIntegration: boolean;
  unlimitedFamilies: boolean;
  predictiveAlerts: boolean;
  advancedAnalytics: boolean;
  prioritySupport: boolean;
  exportData: boolean;
}
```

### Family Limits Enforcement
- **Free Tier**: 1 family maximum
- **Premium Tier**: Unlimited families
- Automatic validation during family creation

### Stripe Webhook Integration
Real-time subscription updates via secure webhook handling:

```typescript
// Called by Stripe webhooks to update user subscription
updateUserSubscriptionStatus({
  email: "user@example.com",
  subscriptionStatus: "premium",
  stripeCustomerId: "cus_...",
  stripeSubscriptionId: "sub_...",
})
```

## 🔒 Security Features

### 1. Audit Trail System
All auth actions are logged for compliance:
- User creation/updates
- Authentication events  
- Subscription changes
- Family operations
- Security events

### 2. Error Handling & Monitoring
Comprehensive error logging with:
- Operation context
- Error classification
- Retry tracking
- Resolution status

### 3. Redirect Security
URL validation prevents open redirect attacks:
- Allowed domain whitelist
- Relative path support
- Production domain configuration

### 4. Session Security
- Cryptographic session tokens
- Device fingerprinting
- Suspicious activity detection
- Multi-factor authentication support

## 🚀 Environment Configuration

### Required Environment Variables

```bash
# Core Convex Auth
CONVEX_SITE_URL=http://localhost:3000
SITE_URL=http://localhost:3000

# OAuth Providers (optional)
AUTH_GITHUB_ID=your-github-client-id
AUTH_GITHUB_SECRET=your-github-client-secret
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret

# Stripe Integration
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email Provider (optional)
AUTH_RESEND_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

### Production Configuration
1. Set production URLs for CONVEX_SITE_URL and SITE_URL
2. Update OAuth redirect URIs in provider dashboards
3. Configure production Stripe keys and webhooks
4. Set up email provider for production sending
5. Enable proper logging and monitoring

## 🎯 Frontend Integration

### React Hook Usage
```typescript
import { useSubscription } from '@/hooks/useSubscription';

function MyComponent() {
  const subscription = useSubscription();
  
  if (!subscription.isAuthenticated) {
    return <SignInPrompt />;
  }
  
  if (!subscription.features.bankIntegration) {
    return <PaywallGate feature="Bank Integration" />;
  }
  
  return <BankSyncComponent />;
}
```

### PaywallGate Component
Automatic feature gating with auth-aware fallbacks:
- Authentication prompts for unauthenticated users
- Upgrade prompts for feature-restricted users
- Seamless premium feature access

## 📊 Database Schema Integration

### Users Table Enhancement
The auth system integrates with the existing users table:
- Email-based user identification
- Subscription status tracking
- Feature access flags
- Stripe customer/subscription IDs
- Trial management

### Security Tables
Comprehensive security monitoring:
- `auditTrail` - Compliance and security logging
- `securityEvents` - Threat monitoring
- `errorLogs` - System reliability tracking
- `subscriptionEvents` - Billing analytics

## 🔄 Migration Guide

### From Custom Auth to Convex Auth

1. **Update Environment Variables**
   - Add required Convex Auth variables
   - Configure OAuth providers
   - Set up email provider

2. **Deploy New Configuration**
   ```bash
   # Deploy Convex functions
   npm run convex:deploy
   
   # Update environment variables
   npx convex env set CONVEX_SITE_URL https://your-domain.com
   npx convex env set AUTH_GITHUB_ID your-github-id
   npx convex env set AUTH_GITHUB_SECRET your-github-secret
   ```

3. **Update Frontend Components**
   - Replace custom auth hooks with `useSubscription`
   - Update sign-in/sign-up flows
   - Test PaywallGate integration

4. **Test Integration**
   - Verify OAuth providers work
   - Test subscription feature access
   - Validate family creation limits
   - Check Stripe webhook integration

## 🧪 Testing

### Local Development
```bash
# Start Convex development server
npm run convex:dev

# Start Next.js development server  
npm run dev

# Test authentication flow
# 1. Visit http://localhost:3000
# 2. Try sign-up with email/password
# 3. Test OAuth providers
# 4. Verify subscription features
```

### Production Testing
1. Deploy to staging environment
2. Test OAuth redirects with production URLs
3. Verify Stripe webhook delivery
4. Test subscription upgrade/downgrade flows
5. Validate security logging and monitoring

## 🚨 Troubleshooting

### Common Issues

**OAuth Redirect Errors**
- Check CONVEX_SITE_URL matches your domain
- Verify OAuth app callback URLs
- Ensure production/development URL consistency

**Subscription Not Updating**
- Verify Stripe webhook endpoint configuration  
- Check webhook secret in environment variables
- Monitor error logs for webhook processing issues

**Feature Access Problems**
- Confirm user subscription status in database
- Check feature flag computation in auth callbacks
- Verify PaywallGate component integration

### Monitoring & Debugging
- Check `errorLogs` table for system issues
- Monitor `securityEvents` for auth problems  
- Review `auditTrail` for compliance tracking
- Use health check endpoint for system status

## 📈 Performance Considerations

### Optimization Features
- **Query Indexing**: Optimized database indexes for auth queries
- **Caching**: Session and subscription data caching
- **Batch Operations**: Efficient multi-record updates
- **Error Recovery**: Automatic retry mechanisms

### Scalability
- Horizontal scaling through Convex infrastructure
- Efficient subscription status queries
- Optimized family membership lookups
- Production-ready error handling

## 🔐 Security Best Practices

### Implementation
✅ **Secure Redirects**: Whitelist-based redirect validation  
✅ **Audit Logging**: Comprehensive compliance trails  
✅ **Error Handling**: No sensitive data in error messages  
✅ **Session Security**: Cryptographic tokens and validation  
✅ **Feature Gating**: Subscription-based access control  

### Monitoring  
✅ **Security Events**: Automated threat detection  
✅ **Failed Logins**: Suspicious activity monitoring  
✅ **Data Access**: Audit trail for all operations  
✅ **Compliance**: GDPR/SOC2 ready logging  

## 📞 Support & Maintenance

### Regular Tasks
- Monitor error logs for system issues
- Review security events for threats
- Update OAuth provider configurations
- Maintain Stripe webhook endpoints
- Backup audit trail data for compliance

### Scaling Considerations
- Monitor database performance
- Review subscription limits for growth
- Update family limits for enterprise users
- Optimize query performance as data grows

---

**🚀 Production Ready**: This integration provides enterprise-grade authentication with comprehensive security, monitoring, and subscription management suitable for production deployment.