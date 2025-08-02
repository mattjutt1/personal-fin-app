import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get the current authenticated user
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    // Find user by auth user ID (stored in familyMembers.userId)
    const familyMember = await ctx.db
      .query("familyMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!familyMember) {
      return null;
    }

    // Get user by email from users table
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", familyMember.email))
      .first();

    return user;
  },
});

// Update user's Stripe customer ID
export const updateStripeCustomerId = mutation({
  args: {
    email: v.string(),
    stripeCustomerId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Find user by email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Update Stripe customer ID
    await ctx.db.patch(user._id, {
      stripeCustomerId: args.stripeCustomerId,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Update user's subscription status
export const updateSubscriptionStatus = mutation({
  args: {
    stripeCustomerId: v.string(),
    subscriptionStatus: v.union(
      v.literal("free"),
      v.literal("premium"),
      v.literal("premium_annual"),
      v.literal("trialing"),
      v.literal("canceled"),
      v.literal("past_due")
    ),
    stripeSubscriptionId: v.optional(v.string()),
    subscriptionEndDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Find user by Stripe customer ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_stripe_customer", (q) => q.eq("stripeCustomerId", args.stripeCustomerId))
      .first();

    if (!user) {
      throw new Error("User not found for Stripe customer");
    }

    // Calculate feature access based on subscription status
    const isPremium = ["premium", "premium_annual", "trialing"].includes(args.subscriptionStatus);

    // Update subscription status and features
    await ctx.db.patch(user._id, {
      subscriptionStatus: args.subscriptionStatus,
      stripeSubscriptionId: args.stripeSubscriptionId,
      subscriptionEndDate: args.subscriptionEndDate,
      hasAccessToBankIntegration: isPremium,
      hasAccessToUnlimitedFamilies: isPremium,
      hasAccessToPredictiveAlerts: isPremium,
      hasAccessToAdvancedAnalytics: isPremium,
      updatedAt: Date.now(),
    });

    // Log subscription event
    await ctx.db.insert("subscriptionEvents", {
      userId: user._id,
      eventType: "subscription_updated",
      subscriptionTier: args.subscriptionStatus,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

// Create or update user from auth
export const createOrUpdateUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        name: args.name,
        updatedAt: Date.now(),
      });
      return existingUser;
    }

    // Create new user
    const newUserId = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      subscriptionStatus: "free",
      hasAccessToBankIntegration: false,
      hasAccessToUnlimitedFamilies: false,
      hasAccessToPredictiveAlerts: false,
      hasAccessToAdvancedAnalytics: false,
      hasUsedTrial: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const newUser = await ctx.db.get(newUserId);
    return newUser;
  },
});