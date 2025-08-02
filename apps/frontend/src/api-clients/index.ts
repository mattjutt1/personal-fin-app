// API Clients - Consolidated access to all external services

// Stripe Payment Processing
export { getStripe } from './stripe/client';
export { stripe, PRICES, SUBSCRIPTION_TIERS, PREMIUM_FEATURES, STRIPE_CONFIG } from './stripe/server';

// Convex Database (exported from existing structure)
// Note: Convex clients are auto-generated and imported directly from @/convex/_generated/api

// Future API clients can be added here:
// export * from './external/plaid';
// export * from './external/bank-apis';