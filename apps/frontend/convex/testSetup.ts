import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Create a test user with premium subscription for testing
export const createTestUser = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    // Check if test user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "test@example.com"))
      .first();
    
    if (existingUser) {
      // Update existing user to premium
      await ctx.db.patch(existingUser._id, {
        subscriptionStatus: "premium",
        hasAccessToBankIntegration: true,
        hasAccessToUnlimitedFamilies: true,
        hasAccessToPredictiveAlerts: true,
        hasAccessToAdvancedAnalytics: true,
        stripeCustomerId: "cus_test_123",
        stripeSubscriptionId: "sub_test_123",
        updatedAt: now,
      });
      
      return { 
        message: "Test user updated to premium", 
        userId: existingUser._id,
        email: existingUser.email 
      };
    }
    
    // Create new test user with premium access
    const userId = await ctx.db.insert("users", {
      email: "test@example.com",
      name: "Test User",
      subscriptionStatus: "premium",
      stripeCustomerId: "cus_test_123",
      stripeSubscriptionId: "sub_test_123",
      subscriptionEndDate: now + 30 * 24 * 60 * 60 * 1000, // 30 days from now
      hasAccessToBankIntegration: true,
      hasAccessToUnlimitedFamilies: true,
      hasAccessToPredictiveAlerts: true,
      hasAccessToAdvancedAnalytics: true,
      hasUsedTrial: false,
      createdAt: now,
      updatedAt: now,
    });
    
    return { 
      message: "Test user created with premium access", 
      userId,
      email: "test@example.com",
      password: "Use this email with any password to sign in"
    };
  },
});

// Create a test user with free tier for testing
export const createFreeTestUser = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    // Check if test user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "free@example.com"))
      .first();
    
    if (existingUser) {
      // Update existing user to free
      await ctx.db.patch(existingUser._id, {
        subscriptionStatus: "free",
        hasAccessToBankIntegration: false,
        hasAccessToUnlimitedFamilies: false,
        hasAccessToPredictiveAlerts: false,
        hasAccessToAdvancedAnalytics: false,
        stripeCustomerId: undefined,
        stripeSubscriptionId: undefined,
        updatedAt: now,
      });
      
      return { 
        message: "Test user updated to free tier", 
        userId: existingUser._id,
        email: existingUser.email 
      };
    }
    
    // Create new test user with free access
    const userId = await ctx.db.insert("users", {
      email: "free@example.com",
      name: "Free Test User",
      subscriptionStatus: "free",
      hasAccessToBankIntegration: false,
      hasAccessToUnlimitedFamilies: false,
      hasAccessToPredictiveAlerts: false,
      hasAccessToAdvancedAnalytics: false,
      hasUsedTrial: false,
      createdAt: now,
      updatedAt: now,
    });
    
    return { 
      message: "Test user created with free tier", 
      userId,
      email: "free@example.com",
      password: "Use this email with any password to sign in"
    };
  },
});

// Create a test user with trial subscription
export const createTrialTestUser = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const trialEndDate = now + 14 * 24 * 60 * 60 * 1000; // 14 days from now
    
    // Check if test user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "trial@example.com"))
      .first();
    
    if (existingUser) {
      // Update existing user to trial
      await ctx.db.patch(existingUser._id, {
        subscriptionStatus: "trialing",
        hasAccessToBankIntegration: true,
        hasAccessToUnlimitedFamilies: true,
        hasAccessToPredictiveAlerts: true,
        hasAccessToAdvancedAnalytics: true,
        stripeCustomerId: "cus_trial_123",
        stripeSubscriptionId: "sub_trial_123",
        trialEndDate,
        updatedAt: now,
      });
      
      return { 
        message: "Test user updated to trial", 
        userId: existingUser._id,
        email: existingUser.email,
        trialEndsIn: "14 days"
      };
    }
    
    // Create new test user with trial access
    const userId = await ctx.db.insert("users", {
      email: "trial@example.com",
      name: "Trial Test User",
      subscriptionStatus: "trialing",
      stripeCustomerId: "cus_trial_123",
      stripeSubscriptionId: "sub_trial_123",
      trialEndDate,
      hasAccessToBankIntegration: true,
      hasAccessToUnlimitedFamilies: true,
      hasAccessToPredictiveAlerts: true,
      hasAccessToAdvancedAnalytics: true,
      hasUsedTrial: true,
      createdAt: now,
      updatedAt: now,
    });
    
    return { 
      message: "Test user created with 14-day trial", 
      userId,
      email: "trial@example.com",
      password: "Use this email with any password to sign in",
      trialEndsIn: "14 days"
    };
  },
});