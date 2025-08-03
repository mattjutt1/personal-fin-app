// Production-ready Convex Auth Integration
// Connects Convex Auth with subscription and family systems
// Built for reliability, security, and scalability

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// === USER SUBSCRIPTION INTEGRATION ===

/**
 * Get user's complete subscription status
 * Integrates Convex Auth user with subscription system
 */
export const getUserSubscriptionStatus = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    // Get user record with subscription data
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      return {
        isAuthenticated: false,
        subscriptionStatus: "free" as const,
        features: {
          bankIntegration: false,
          unlimitedFamilies: false,
          predictiveAlerts: false,
          advancedAnalytics: false,
          prioritySupport: false,
          exportData: false,
        },
      };
    }

    // Calculate trial status
    const now = Date.now();
    const isTrialing = user.subscriptionStatus === "trialing" && 
      user.trialEndDate && user.trialEndDate > now;

    const isPremium = ["premium", "premium_annual", "trialing"].includes(user.subscriptionStatus);

    return {
      isAuthenticated: true,
      userId: user._id,
      email: user.email,
      name: user.name,
      subscriptionStatus: user.subscriptionStatus,
      isPremium,
      isTrialing,
      trialEndsAt: user.trialEndDate ? new Date(user.trialEndDate) : undefined,
      subscriptionEndDate: user.subscriptionEndDate ? new Date(user.subscriptionEndDate) : undefined,
      stripeCustomerId: user.stripeCustomerId,
      stripeSubscriptionId: user.stripeSubscriptionId,
      features: {
        bankIntegration: user.hasAccessToBankIntegration,
        unlimitedFamilies: user.hasAccessToUnlimitedFamilies,
        predictiveAlerts: user.hasAccessToPredictiveAlerts,
        advancedAnalytics: user.hasAccessToAdvancedAnalytics,
        prioritySupport: isPremium,
        exportData: isPremium,
      },
    };
  },
});

/**
 * Update user's subscription status from Stripe webhook
 * Called by Stripe webhook handlers for subscription changes
 */
export const updateUserSubscriptionStatus = mutation({
  args: {
    email: v.string(),
    subscriptionStatus: v.union(
      v.literal("free"),
      v.literal("premium"),
      v.literal("premium_annual"),
      v.literal("trialing"),
      v.literal("canceled"),
      v.literal("past_due")
    ),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    subscriptionEndDate: v.optional(v.number()),
    trialEndDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    try {
      // Find user by email
      const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.email))
        .first();

      if (!user) {
        throw new ConvexError(`User not found with email: ${args.email}`);
      }

      // Determine feature access based on subscription status
      const isPremium = ["premium", "premium_annual", "trialing"].includes(args.subscriptionStatus);

      // Update user subscription data
      await ctx.db.patch(user._id, {
        subscriptionStatus: args.subscriptionStatus,
        stripeCustomerId: args.stripeCustomerId,
        stripeSubscriptionId: args.stripeSubscriptionId,
        subscriptionEndDate: args.subscriptionEndDate,
        trialEndDate: args.trialEndDate,
        hasAccessToBankIntegration: isPremium,
        hasAccessToUnlimitedFamilies: isPremium,
        hasAccessToPredictiveAlerts: isPremium,
        hasAccessToAdvancedAnalytics: isPremium,
        updatedAt: now,
      });

      // Log subscription change event
      await ctx.db.insert("subscriptionEvents", {
        userId: user._id,
        eventType: args.subscriptionStatus === "premium" || args.subscriptionStatus === "premium_annual"
          ? "subscription_created"
          : args.subscriptionStatus === "canceled"
          ? "subscription_canceled"
          : "subscription_updated",
        subscriptionTier: args.subscriptionStatus,
        metadata: {
          previousTier: user.subscriptionStatus,
        },
        createdAt: now,
      });

      // Log audit trail for compliance
      await ctx.db.insert("auditTrail", {
        eventId: `subscription_${user._id}_${now}`,
        eventType: "SUBSCRIPTION_UPDATE",
        userId: user._id.toString(),
        resourceType: "user",
        resourceId: user._id.toString(),
        action: "UPDATE",
        previousValue: {
          subscriptionStatus: user.subscriptionStatus,
          stripeCustomerId: user.stripeCustomerId,
          stripeSubscriptionId: user.stripeSubscriptionId,
        },
        newValue: {
          subscriptionStatus: args.subscriptionStatus,
          stripeCustomerId: args.stripeCustomerId,
          stripeSubscriptionId: args.stripeSubscriptionId,
        },
        timestamp: now,
        complianceRelevant: true,
        retentionRequired: true,
      });

      return { success: true, userId: user._id };
    } catch (error) {
      // Log error for monitoring
      await ctx.db.insert("errorLogs", {
        operation: "updateUserSubscriptionStatus",
        errorType: "SubscriptionUpdateError",
        errorMessage: error instanceof Error ? error.message : "Unknown subscription update error",
        context: {
          timestamp: now,
          retryAttempt: 0,
        },
        resolved: false,
        createdAt: now,
      });

      throw error;
    }
  },
});

// === FAMILY SYSTEM INTEGRATION ===

/**
 * Get user's family context with subscription-aware permissions
 * Integrates family membership with subscription features
 */
export const getUserFamilyContextWithSubscription = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // Get user's subscription status
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("_id"), args.userId))
      .first();

    if (!user) {
      return {
        isAuthenticated: false,
        hasFamilies: false,
        needsInvitation: true,
        families: [],
        subscriptionLimits: {
          maxFamilies: 1,
          hasUnlimitedFamilies: false,
        },
      };
    }

    // Get all family memberships
    const memberships = await ctx.db
      .query("familyMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Determine family limits based on subscription
    const hasUnlimitedFamilies = user.hasAccessToUnlimitedFamilies;
    const maxFamilies = hasUnlimitedFamilies ? Infinity : 1;

    if (memberships.length === 0) {
      return {
        isAuthenticated: true,
        hasFamilies: false,
        needsInvitation: true,
        families: [],
        subscriptionLimits: {
          maxFamilies,
          hasUnlimitedFamilies,
          canCreateMoreFamilies: maxFamilies > 0,
        },
      };
    }

    // Get family details with subscription-aware features
    const familyDetails = await Promise.all(
      memberships.map(async (membership) => {
        const family = await ctx.db.get(membership.familyId);
        if (!family || !family.isActive) return null;

        // Get family member count
        const memberCount = await ctx.db
          .query("familyMembers")
          .withIndex("by_family_active", (q) => 
            q.eq("familyId", membership.familyId).eq("isActive", true)
          )
          .collect()
          .then(members => members.length);

        return {
          familyId: family._id,
          familyName: family.name,
          userRole: membership.role,
          joinedAt: membership.joinedAt,
          memberCount,
          permissions: {
            // Basic permissions
            canManageBudget: membership.role === "manager",
            canAddTransactions: true,
            canViewReports: true,
            canInviteMembers: membership.role === "manager",
            canManageMembers: membership.role === "manager",
            // Subscription-enhanced permissions
            canAccessBankSync: user.hasAccessToBankIntegration,
            canAccessPredictiveAlerts: user.hasAccessToPredictiveAlerts,
            canAccessAdvancedAnalytics: user.hasAccessToAdvancedAnalytics,
            canExportData: ["premium", "premium_annual", "trialing"].includes(user.subscriptionStatus),
          },
        };
      })
    );

    const validFamilies = familyDetails.filter(Boolean);

    return {
      isAuthenticated: true,
      hasFamilies: validFamilies.length > 0,
      needsInvitation: validFamilies.length === 0,
      families: validFamilies,
      primaryFamily: validFamilies[0],
      subscriptionLimits: {
        maxFamilies,
        hasUnlimitedFamilies,
        canCreateMoreFamilies: validFamilies.length < maxFamilies,
        currentFamilyCount: validFamilies.length,
      },
    };
  },
});

/**
 * Create or join family with subscription limits enforcement
 */
export const createFamilyWithSubscriptionLimits = mutation({
  args: {
    userId: v.string(),
    familyName: v.string(),
    monthlyIncome: v.number(),
    fixedExpenses: v.number(),
    savingsGoal: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    try {
      // Get user and check subscription limits
      const user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("_id"), args.userId))
        .first();

      if (!user) {
        throw new ConvexError("User not found");
      }

      // Check family creation limits
      const existingMemberships = await ctx.db
        .query("familyMembers")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();

      const maxFamilies = user.hasAccessToUnlimitedFamilies ? Infinity : 1;
      
      if (existingMemberships.length >= maxFamilies) {
        throw new ConvexError(
          user.hasAccessToUnlimitedFamilies 
            ? "Maximum family limit reached" 
            : "Free tier allows only 1 family. Upgrade to Premium for unlimited families."
        );
      }

      // Create family
      const familyId = await ctx.db.insert("families", {
        name: args.familyName,
        monthlyIncome: args.monthlyIncome,
        fixedExpenses: args.fixedExpenses,
        savingsGoal: args.savingsGoal,
        budgetStartDate: new Date().toISOString().split('T')[0],
        currency: "USD",
        timezone: "UTC",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });

      // Add user as family manager
      const memberId = await ctx.db.insert("familyMembers", {
        familyId,
        userId: args.userId,
        name: user.name,
        email: user.email,
        role: "manager",
        joinedAt: now,
        lastActiveAt: now,
        isActive: true,
        notificationsEnabled: true,
      });

      // Log family creation activity
      await ctx.db.insert("familyActivity", {
        familyId,
        userId: args.userId,
        userName: user.name,
        action: "member_joined",
        description: `${user.name} created the family "${args.familyName}"`,
        createdAt: now,
        notificationSent: false,
      });

      // Log audit trail
      await ctx.db.insert("auditTrail", {
        eventId: `family_created_${familyId}_${now}`,
        eventType: "FAMILY_CREATION",
        userId: args.userId,
        familyId,
        resourceType: "family",
        resourceId: familyId.toString(),
        action: "CREATE",
        timestamp: now,
        complianceRelevant: true,
        retentionRequired: true,
      });

      return {
        success: true,
        familyId,
        memberId,
      };
    } catch (error) {
      // Log error
      await ctx.db.insert("errorLogs", {
        userId: args.userId,
        operation: "createFamilyWithSubscriptionLimits",
        errorType: "FamilyCreationError",
        errorMessage: error instanceof Error ? error.message : "Unknown family creation error",
        context: {
          timestamp: now,
          retryAttempt: 0,
        },
        resolved: false,
        createdAt: now,
      });

      throw error;
    }
  },
});

// === SECURITY AND MONITORING ===

/**
 * Log security events for authentication actions
 */
export const logSecurityEvent = mutation({
  args: {
    eventType: v.string(),
    severity: v.union(v.literal("INFO"), v.literal("MEDIUM"), v.literal("HIGH"), v.literal("CRITICAL")),
    userId: v.optional(v.string()),
    operation: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    metadata: v.optional(v.object({
      userAgent: v.optional(v.string()),
      ipAddress: v.optional(v.string()),
      timestamp: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    await ctx.db.insert("securityEvents", {
      eventType: args.eventType,
      severity: args.severity,
      userId: args.userId,
      operation: args.operation,
      errorMessage: args.errorMessage,
      metadata: args.metadata || { timestamp: now },
      resolved: false,
      createdAt: now,
    });
  },
});

/**
 * Check if user has access to specific premium features
 */
export const checkFeatureAccess = query({
  args: {
    userId: v.string(),
    feature: v.union(
      v.literal("bankIntegration"),
      v.literal("unlimitedFamilies"),
      v.literal("predictiveAlerts"),
      v.literal("advancedAnalytics"),
      v.literal("prioritySupport"),
      v.literal("exportData")
    ),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("_id"), args.userId))
      .first();

    if (!user) {
      return { hasAccess: false, reason: "User not found" };
    }

    const featureMap = {
      bankIntegration: user.hasAccessToBankIntegration,
      unlimitedFamilies: user.hasAccessToUnlimitedFamilies,
      predictiveAlerts: user.hasAccessToPredictiveAlerts,
      advancedAnalytics: user.hasAccessToAdvancedAnalytics,
      prioritySupport: ["premium", "premium_annual", "trialing"].includes(user.subscriptionStatus),
      exportData: ["premium", "premium_annual", "trialing"].includes(user.subscriptionStatus),
    };

    const hasAccess = featureMap[args.feature];

    return {
      hasAccess,
      subscriptionStatus: user.subscriptionStatus,
      reason: hasAccess ? "Access granted" : `Feature requires premium subscription`,
    };
  },
});