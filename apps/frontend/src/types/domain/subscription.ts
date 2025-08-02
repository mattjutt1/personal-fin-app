// Subscription domain types for the personal finance app
// Integrates with Convex Auth and Stripe for complete subscription management

export type SubscriptionStatus = 
  | "free" 
  | "premium" 
  | "premium_annual" 
  | "trialing" 
  | "canceled" 
  | "past_due";

export type SubscriptionEventType = 
  | "trial_started"
  | "trial_ended"
  | "subscription_created"
  | "subscription_updated"
  | "subscription_canceled"
  | "payment_succeeded"
  | "payment_failed";

export interface UserSubscription {
  userId: string;
  email: string;
  name: string;
  subscriptionStatus: SubscriptionStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionEndDate?: number; // Unix timestamp
  trialEndDate?: number; // Unix timestamp
  
  // Feature access flags
  hasAccessToBankIntegration: boolean;
  hasAccessToUnlimitedFamilies: boolean;
  hasAccessToPredictiveAlerts: boolean;
  hasAccessToAdvancedAnalytics: boolean;
  hasUsedTrial: boolean;
  
  // Timestamps
  createdAt: number;
  updatedAt: number;
}

export interface SubscriptionFeatures {
  bankIntegration: boolean;
  unlimitedFamilies: boolean;
  predictiveAlerts: boolean;
  advancedAnalytics: boolean;
  prioritySupport: boolean;
  exportData: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: "month" | "year";
  features: SubscriptionFeatures;
  stripePriceId: string;
  isPopular?: boolean;
}

export interface SubscriptionEvent {
  userId: string;
  eventType: SubscriptionEventType;
  subscriptionTier?: string;
  amount?: number;
  currency?: string;
  metadata?: {
    stripeEventId?: string;
    reason?: string;
    previousTier?: string;
  };
  createdAt: number;
}

export interface FamilySubscriptionLimits {
  maxFamilies: number;
  hasUnlimitedFamilies: boolean;
  canCreateMoreFamilies: boolean;
  currentFamilyCount?: number;
}

// Helper types for API responses
export interface SubscriptionStatusResponse {
  isAuthenticated: boolean;
  userId?: string;
  email?: string;
  name?: string;
  subscriptionStatus: SubscriptionStatus;
  isPremium: boolean;
  isTrialing: boolean;
  trialEndsAt?: Date;
  subscriptionEndDate?: Date;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  features: SubscriptionFeatures;
}

export interface FeatureAccessResponse {
  hasAccess: boolean;
  subscriptionStatus: SubscriptionStatus;
  reason: string;
}

// Subscription upgrade/downgrade request types
export interface SubscriptionUpdateRequest {
  userId: string;
  planId: string;
  stripePriceId: string;
}

export interface TrialStartRequest {
  userId: string;
  trialDays: number;
}

// Predefined subscription plans
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    description: "Perfect for getting started with basic budgeting",
    price: 0,
    currency: "USD",
    interval: "month",
    stripePriceId: "",
    features: {
      bankIntegration: false,
      unlimitedFamilies: false,
      predictiveAlerts: false,
      advancedAnalytics: false,
      prioritySupport: false,
      exportData: false,
    },
  },
  {
    id: "premium_monthly",
    name: "Premium",
    description: "Everything you need for comprehensive family budget management",
    price: 9.99,
    currency: "USD",
    interval: "month",
    stripePriceId: "price_premium_monthly", // Replace with actual Stripe price ID
    isPopular: true,
    features: {
      bankIntegration: true,
      unlimitedFamilies: true,
      predictiveAlerts: true,
      advancedAnalytics: true,
      prioritySupport: true,
      exportData: true,
    },
  },
  {
    id: "premium_annual",
    name: "Premium Annual",
    description: "Save 20% with annual billing - best value!",
    price: 95.88, // 9.99 * 12 * 0.8 (20% discount)
    currency: "USD",
    interval: "year",
    stripePriceId: "price_premium_annual", // Replace with actual Stripe price ID
    features: {
      bankIntegration: true,
      unlimitedFamilies: true,
      predictiveAlerts: true,
      advancedAnalytics: true,
      prioritySupport: true,
      exportData: true,
    },
  },
];

// Helper functions
export function isPremiumSubscription(status: SubscriptionStatus): boolean {
  return ["premium", "premium_annual", "trialing"].includes(status);
}

export function isActiveSubscription(status: SubscriptionStatus): boolean {
  return !["canceled", "past_due"].includes(status);
}

export function getSubscriptionPlan(planId: string): SubscriptionPlan | null {
  return SUBSCRIPTION_PLANS.find(plan => plan.id === planId) || null;
}

export function calculateDaysRemaining(endDate: number): number {
  const now = Date.now();
  const msRemaining = endDate - now;
  return Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));
}

export function formatSubscriptionPrice(plan: SubscriptionPlan): string {
  if (plan.price === 0) return "Free";
  
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: plan.currency,
  }).format(plan.price);
  
  return `${formatted}/${plan.interval === "year" ? "year" : "month"}`;
}