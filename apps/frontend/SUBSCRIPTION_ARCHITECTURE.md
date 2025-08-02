# Subscription System Architecture
## Simple Implementation with Stripe + Convex

**Goal**: Implement the simplest possible subscription system that works reliably and can scale.

## 🏗️ Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Next.js App   │────▶│  Stripe Checkout │────▶│  Stripe Portal  │
│  (Frontend)     │     │  (Hosted Page)   │     │  (Manage Sub)   │
└────────┬────────┘     └──────────────────┘     └─────────────────┘
         │                        │
         │                        │ Webhook
         ▼                        ▼
┌─────────────────┐     ┌──────────────────┐
│   Convex DB     │◀────│  Convex Actions  │
│  (User State)   │     │  (Webhook Handler)│
└─────────────────┘     └──────────────────┘
```

## 📦 Required Dependencies

```json
{
  "dependencies": {
    "@stripe/stripe-js": "^2.2.0",
    "stripe": "^14.10.0"
  }
}
```

## 🗄️ Database Schema

### Convex Schema (`convex/schema.ts`)

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    // Subscription fields
    subscriptionStatus: v.union(
      v.literal("free"),
      v.literal("premium"), 
      v.literal("premium_annual"),
      v.literal("canceled"),
      v.literal("past_due")
    ),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    subscriptionEndDate: v.optional(v.number()), // Unix timestamp
    // Feature access
    hasAccessToBankIntegration: v.boolean(),
    hasAccessToUnlimitedFamilies: v.boolean(),
    hasAccessToPredictiveAlerts: v.boolean(),
    hasAccessToAdvancedAnalytics: v.boolean(),
    // Tracking
    trialEndDate: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_email", ["email"])
    .index("by_stripe_customer", ["stripeCustomerId"]),
});
```

## 🔐 Environment Variables

```bash
# .env.local
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_APP_URL=https://yourapp.vercel.app

# Stripe Price IDs (from Stripe Dashboard)
STRIPE_PRICE_MONTHLY=price_xxx
STRIPE_PRICE_ANNUAL=price_yyy
```

## 💳 Stripe Integration

### 1. Initialize Stripe (`lib/stripe.ts`)

```typescript
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Price IDs from Stripe Dashboard
export const PRICES = {
  monthly: process.env.STRIPE_PRICE_MONTHLY!,
  annual: process.env.STRIPE_PRICE_ANNUAL!,
};
```

### 2. Create Checkout Session (`app/api/create-checkout/route.ts`)

```typescript
import { stripe, PRICES } from '@/lib/stripe';
import { auth } from '@/lib/auth'; // Your auth solution

export async function POST(req: Request) {
  try {
    const { priceId } = await req.json();
    const user = await auth();
    
    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Create or retrieve Stripe customer
    let customerId = user.stripeCustomerId;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
        },
      });
      customerId = customer.id;
      
      // Save customer ID to database
      await updateUser(user.id, { stripeCustomerId: customerId });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/welcome-premium?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          userId: user.id,
        },
      },
    });

    return Response.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
```

### 3. Webhook Handler (`app/api/stripe-webhook/route.ts`)

```typescript
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return new Response('Webhook Error', { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      await handleCheckoutComplete(session);
      break;
      
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      const subscription = event.data.object;
      await handleSubscriptionChange(subscription);
      break;
      
    case 'invoice.payment_failed':
      const invoice = event.data.object;
      await handlePaymentFailed(invoice);
      break;
  }

  return new Response(null, { status: 200 });
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;
  
  // Update user subscription status
  await updateUserByStripeCustomerId(customerId, {
    subscriptionStatus: 'premium',
    stripeSubscriptionId: subscriptionId,
    hasAccessToBankIntegration: true,
    hasAccessToUnlimitedFamilies: true,
    hasAccessToPredictiveAlerts: true,
    hasAccessToAdvancedAnalytics: true,
  });
}
```

## 🎨 Frontend Components

### 1. Upgrade Button (`components/UpgradeButton.tsx`)

```typescript
"use client";

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export function UpgradeButton({ priceId, text }: { priceId: string; text: string }) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    
    try {
      // Create checkout session
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });
      
      const { sessionId } = await response.json();
      
      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      await stripe!.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? 'Loading...' : text}
    </button>
  );
}
```

### 2. Paywall Component (`components/PaywallGate.tsx`)

```typescript
"use client";

import { useUser } from '@/hooks/useUser';
import { UpgradePrompt } from './UpgradePrompt';

interface PaywallGateProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PaywallGate({ feature, children, fallback }: PaywallGateProps) {
  const user = useUser();
  
  // Check if user has access to this feature
  const hasAccess = user?.subscriptionStatus !== 'free';
  
  if (hasAccess) {
    return <>{children}</>;
  }
  
  // Show upgrade prompt or fallback
  return fallback || <UpgradePrompt feature={feature} />;
}
```

### 3. Pricing Page (`app/pricing/page.tsx`)

```typescript
import { UpgradeButton } from '@/components/UpgradeButton';

export default function PricingPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Choose Your Plan</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Free Tier */}
        <div className="border rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-2">Free</h2>
          <p className="text-gray-600 mb-4">Perfect for getting started</p>
          <div className="text-3xl font-bold mb-6">$0/month</div>
          
          <ul className="space-y-2 mb-6">
            <li>✓ 1 Family Budget</li>
            <li>✓ Manual Transaction Entry</li>
            <li>✓ Basic Reports</li>
            <li>✓ 30-Day History</li>
          </ul>
          
          <button className="w-full border border-gray-300 py-2 rounded" disabled>
            Current Plan
          </button>
        </div>
        
        {/* Premium Tier */}
        <div className="border-2 border-blue-600 rounded-lg p-6 relative">
          <div className="absolute -top-3 left-4 bg-blue-600 text-white px-2 py-1 text-sm rounded">
            MOST POPULAR
          </div>
          
          <h2 className="text-2xl font-bold mb-2">Premium</h2>
          <p className="text-gray-600 mb-4">Everything you need to succeed</p>
          <div className="text-3xl font-bold mb-6">$4.99/month</div>
          
          <ul className="space-y-2 mb-6">
            <li>✓ Everything in Free</li>
            <li>✓ Bank Account Sync</li>
            <li>✓ Predictive Alerts</li>
            <li>✓ Advanced Analytics</li>
            <li>✓ Unlimited History</li>
            <li>✓ Priority Support</li>
          </ul>
          
          <UpgradeButton 
            priceId={process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY!}
            text="Start 14-Day Free Trial"
          />
        </div>
      </div>
    </div>
  );
}
```

## 🚦 Feature Gating

### 1. Feature Access Hook (`hooks/useFeatureAccess.ts`)

```typescript
import { useUser } from './useUser';

export function useFeatureAccess() {
  const user = useUser();
  
  return {
    canUseBankIntegration: user?.hasAccessToBankIntegration || false,
    canUseUnlimitedFamilies: user?.hasAccessToUnlimitedFamilies || false,
    canUsePredictiveAlerts: user?.hasAccessToPredictiveAlerts || false,
    canUseAdvancedAnalytics: user?.hasAccessToAdvancedAnalytics || false,
    isPremium: user?.subscriptionStatus === 'premium' || 
               user?.subscriptionStatus === 'premium_annual',
  };
}
```

### 2. Usage in Components

```typescript
function BankIntegrationSection() {
  const { canUseBankIntegration } = useFeatureAccess();
  
  if (!canUseBankIntegration) {
    return <UpgradePrompt feature="Bank Integration" />;
  }
  
  return <BankConnectionWizard />;
}
```

## 🔄 Customer Portal

```typescript
// Redirect to Stripe Customer Portal
async function handleManageSubscription() {
  const response = await fetch('/api/create-portal-session', {
    method: 'POST',
  });
  
  const { url } = await response.json();
  window.location.href = url;
}
```

## 📊 Analytics & Tracking

Track key subscription events:

```typescript
// Track upgrade events
analytics.track('Subscription Started', {
  plan: 'premium',
  price: 4.99,
  billing_period: 'monthly',
});

// Track feature usage
analytics.track('Premium Feature Used', {
  feature: 'bank_integration',
  user_tier: 'premium',
});
```

## 🚀 Launch Checklist

1. **Stripe Setup**
   - [ ] Create Stripe account
   - [ ] Add products and prices
   - [ ] Configure webhook endpoint
   - [ ] Test with Stripe CLI

2. **Database Setup**
   - [ ] Update Convex schema
   - [ ] Create subscription functions
   - [ ] Test user upgrades

3. **Frontend Implementation**
   - [ ] Create pricing page
   - [ ] Add upgrade buttons
   - [ ] Implement paywalls
   - [ ] Test checkout flow

4. **Testing**
   - [ ] Test free → premium upgrade
   - [ ] Test subscription cancellation
   - [ ] Test failed payments
   - [ ] Test feature access

5. **Launch**
   - [ ] Enable production mode
   - [ ] Monitor first transactions
   - [ ] Track conversion rates

---

**Next Step**: Start implementing the Stripe integration and create the first paywall component.