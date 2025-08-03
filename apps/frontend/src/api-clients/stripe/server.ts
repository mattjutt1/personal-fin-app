import Stripe from 'stripe';

// Server-side Stripe instance (only initialize if secret key exists)
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-07-30.basil',
      typescript: true,
    })
  : null;

// Price IDs from Stripe Dashboard (to be configured)
export const PRICES = {
  monthly: process.env.STRIPE_PRICE_MONTHLY || 'price_monthly_placeholder',
  annual: process.env.STRIPE_PRICE_ANNUAL || 'price_annual_placeholder',
};

// Subscription tiers
export const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Free',
    price: 0,
    features: [
      '1 Family Budget',
      'Manual Transaction Entry',
      'Basic Reports',
      '30-Day History',
      'Real-time Family Sync',
    ],
  },
  premium: {
    name: 'Premium',
    price: 4.99,
    features: [
      'Everything in Free',
      'Bank Account Sync',
      'Unlimited Families',
      'Predictive Spending Alerts',
      'Advanced Analytics',
      'Bill Reminders',
      'Unlimited History',
      'Export & Reports',
      'Priority Support',
    ],
  },
  premium_annual: {
    name: 'Premium Annual',
    price: 49.99,
    monthlyEquivalent: 4.17,
    features: [
      'Everything in Premium',
      '2 months free',
      'Annual billing',
    ],
  },
} as const;

// Feature gates mapping
export const PREMIUM_FEATURES = {
  BANK_INTEGRATION: 'bank_integration',
  UNLIMITED_FAMILIES: 'unlimited_families',
  PREDICTIVE_ALERTS: 'predictive_alerts',
  ADVANCED_ANALYTICS: 'advanced_analytics',
  BILL_CALENDAR: 'bill_calendar',
  EXPORT_DATA: 'export_data',
  UNLIMITED_HISTORY: 'unlimited_history',
  SMART_GOALS: 'smart_goals',
} as const;

// Stripe configuration
export const STRIPE_CONFIG = {
  successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/welcome-premium?session_id={CHECKOUT_SESSION_ID}`,
  cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
  trialPeriodDays: 14,
  billingPortalUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/create-portal-session`,
};