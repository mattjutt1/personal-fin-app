// Family Activity Feed - Real-time notifications and family sync
// Optimized for <500ms real-time updates across family members

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// Get real-time family activity feed
export const getFamilyActivity = query({
  args: {
    familyId: v.id("families"),
    limit: v.optional(v.number()),
    since: v.optional(v.number()), // timestamp for incremental updates
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("familyActivity")
      .withIndex("by_family_time", (q) => q.eq("familyId", args.familyId))
      .order("desc");

    // For incremental updates (real-time sync optimization)
    if (args.since) {
      const activities = await query
        .filter((q) => q.gt(q.field("createdAt"), args.since))
        .take(args.limit || 50);
      
      return {
        activities,
        isIncremental: true,
        lastSync: Date.now(),
      };
    }

    // Full feed load
    const activities = await query.take(args.limit || 100);
    
    return {
      activities,
      isIncremental: false,
      lastSync: Date.now(),
    };
  },
});

// Get unread notifications for user
export const getUnreadNotifications = query({
  args: {
    familyId: v.id("families"),
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get user's last seen activity timestamp
    const member = await ctx.db
      .query("familyMembers")
      .withIndex("by_user_family", (q) => 
        q.eq("userId", args.userId).eq("familyId", args.familyId)
      )
      .first();

    if (!member || !member.isActive) {
      return [];
    }

    // Get activities since user was last active (excluding their own actions)
    const activities = await ctx.db
      .query("familyActivity")
      .withIndex("by_family_time", (q) => q.eq("familyId", args.familyId))
      .filter((q) => q.gt(q.field("createdAt"), member.lastActiveAt))
      .filter((q) => q.neq(q.field("userId"), args.userId)) // Exclude user's own actions
      .order("desc")
      .take(args.limit || 20);

    return activities.filter(activity => 
      activity.action === "transaction_added" || 
      activity.action === "transaction_updated" ||
      activity.action === "transaction_deleted" ||
      activity.action === "budget_updated"
    );
  },
});

// Mark notifications as read by updating user's last active timestamp
export const markNotificationsRead = mutation({
  args: {
    familyId: v.id("families"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db
      .query("familyMembers")
      .withIndex("by_user_family", (q) => 
        q.eq("userId", args.userId).eq("familyId", args.familyId)
      )
      .first();

    if (member && member.isActive) {
      await ctx.db.patch(member._id, {
        lastActiveAt: Date.now(),
      });
    }

    return { success: true };
  },
});

// Get family activity summary for dashboard
export const getFamilyActivitySummary = query({
  args: {
    familyId: v.id("families"),
    timeframe: v.optional(v.union(v.literal("today"), v.literal("week"), v.literal("month"))),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    let sinceTimestamp: number;

    // Calculate time range
    switch (args.timeframe || "today") {
      case "today":
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        sinceTimestamp = today.getTime();
        break;
      case "week":
        sinceTimestamp = now - (7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        sinceTimestamp = now - (30 * 24 * 60 * 60 * 1000);
        break;
      default:
        sinceTimestamp = now - (24 * 60 * 60 * 1000);
    }

    // Get activities in timeframe
    const activities = await ctx.db
      .query("familyActivity")
      .withIndex("by_family_time", (q) => q.eq("familyId", args.familyId))
      .filter((q) => q.gte(q.field("createdAt"), sinceTimestamp))
      .collect();

    // Aggregate activity statistics
    const summary = activities.reduce(
      (acc, activity) => {
        acc.totalActivities += 1;

        // Count by action type
        if (!acc.actionCounts[activity.action]) {
          acc.actionCounts[activity.action] = 0;
        }
        acc.actionCounts[activity.action] += 1;

        // Count by user
        if (!acc.userActivities[activity.userId]) {
          acc.userActivities[activity.userId] = {
            userName: activity.userName,
            count: 0,
            lastActivity: activity.createdAt,
          };
        }
        acc.userActivities[activity.userId].count += 1;
        
        if (activity.createdAt > acc.userActivities[activity.userId].lastActivity) {
          acc.userActivities[activity.userId].lastActivity = activity.createdAt;
        }

        // Track spending activities
        if (activity.action === "transaction_added" && activity.metadata?.amount) {
          acc.totalSpentActivities += activity.metadata.amount;
          acc.spendingTransactions += 1;
        }

        return acc;
      },
      {
        totalActivities: 0,
        actionCounts: {} as Record<string, number>,
        userActivities: {} as Record<string, { userName: string; count: number; lastActivity: number }>,
        totalSpentActivities: 0,
        spendingTransactions: 0,
      }
    );

    // Get most recent activities for quick preview
    const recentActivities = activities
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5);

    return {
      ...summary,
      timeframe: args.timeframe || "today",
      sinceTimestamp,
      recentActivities,
      averageSpendingPerTransaction: 
        summary.spendingTransactions > 0 
          ? summary.totalSpentActivities / summary.spendingTransactions 
          : 0,
    };
  },
});

// Get active family members with presence information
export const getActiveFamilyMembers = query({
  args: { familyId: v.id("families") },
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query("familyMembers")
      .withIndex("by_family_active", (q) => 
        q.eq("familyId", args.familyId).eq("isActive", true)
      )
      .collect();

    const now = Date.now();
    const fiveMinutesAgo = now - (5 * 60 * 1000);
    const oneHourAgo = now - (60 * 60 * 1000);

    return members.map(member => ({
      ...member,
      // Presence calculation
      isOnline: member.lastActiveAt > fiveMinutesAgo,
      isRecentlyActive: member.lastActiveAt > oneHourAgo,
      lastActiveMinutesAgo: Math.floor((now - member.lastActiveAt) / (60 * 1000)),
    }));
  },
});

// Send push notification (webhook for external service integration)
export const triggerPushNotification = mutation({
  args: {
    familyId: v.id("families"),
    excludeUserId: v.optional(v.string()), // Don't notify the action performer
    title: v.string(),
    body: v.string(),
    data: v.optional(v.object({
      type: v.string(),
      targetId: v.optional(v.string()),
      amount: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    try {
      // Get family members who should receive notifications
      const members = await ctx.db
        .query("familyMembers")
        .withIndex("by_family_active", (q) => 
          q.eq("familyId", args.familyId).eq("isActive", true)
        )
        .filter((q) => q.eq(q.field("notificationsEnabled"), true))
        .collect();

      // Filter out the action performer if specified
      const notificationTargets = members.filter(member => 
        member.userId !== args.excludeUserId
      );

      if (notificationTargets.length === 0) {
        return { success: true, notificationsSent: 0 };
      }

      // For MVP, we'll log the notification intent
      // In production, this would integrate with push notification service
      await ctx.db.insert("familyActivity", {
        familyId: args.familyId,
        userId: "system",
        userName: "System",
        action: "transaction_added", // Using existing action type
        description: `Push notification: ${args.title} - ${args.body}`,
        metadata: {
          notificationTargets: notificationTargets.length,
          ...args.data,
        },
        createdAt: now,
        notificationSent: true,
      });

      // TODO: Integrate with actual push notification service
      // Examples: Firebase Cloud Messaging, Apple Push Notifications, etc.
      
      return { 
        success: true, 
        notificationsSent: notificationTargets.length,
        targets: notificationTargets.map(m => ({ userId: m.userId, name: m.name })),
      };
    } catch (error) {
      await ctx.db.insert("errorLogs", {
        familyId: args.familyId,
        operation: "triggerPushNotification",
        errorType: "NotificationError",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
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

// Get family sync status for debugging
export const getFamilySyncStatus = query({
  args: { familyId: v.id("families") },
  handler: async (ctx, args) => {
    // Get recent sync states
    const syncStates = await ctx.db
      .query("syncState")
      .withIndex("by_family_version", (q) => q.eq("familyId", args.familyId))
      .order("desc")
      .take(20);

    // Get any sync conflicts
    const conflicts = await ctx.db
      .query("syncState")
      .withIndex("by_conflicts", (q) => 
        q.eq("familyId", args.familyId).eq("hasConflict", true)
      )
      .collect();

    // Get recent errors
    const recentErrors = await ctx.db
      .query("errorLogs")
      .withIndex("by_family_time", (q) => q.eq("familyId", args.familyId))
      .filter((q) => q.eq(q.field("resolved"), false))
      .order("desc")
      .take(10);

    const now = Date.now();
    
    return {
      syncStates,
      conflicts: conflicts.length,
      unresolvedErrors: recentErrors.length,
      recentErrors: recentErrors.map(error => ({
        operation: error.operation,
        errorType: error.errorType,
        timestamp: error.createdAt,
        minutesAgo: Math.floor((now - error.createdAt) / (60 * 1000)),
      })),
      lastSyncAt: syncStates[0]?.lastSyncAt || 0,
      healthStatus: conflicts.length === 0 && recentErrors.length === 0 ? "healthy" : "degraded",
    };
  },
});

// Clean up old activity records (maintenance)
export const cleanupOldActivity = mutation({
  args: {
    familyId: v.id("families"),
    userId: v.string(),
    daysToKeep: v.optional(v.number()), // Default 30 days
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    try {
      // Verify user is family manager
      const member = await ctx.db
        .query("familyMembers")
        .withIndex("by_user_family", (q) => 
          q.eq("userId", args.userId).eq("familyId", args.familyId)
        )
        .first();

      if (!member || !member.isActive || member.role !== "manager") {
        throw new ConvexError("Only family managers can cleanup activity logs");
      }

      const daysToKeep = args.daysToKeep || 30;
      const cutoffTimestamp = now - (daysToKeep * 24 * 60 * 60 * 1000);

      // Get old activity records
      const oldActivities = await ctx.db
        .query("familyActivity")
        .withIndex("by_family_time", (q) => q.eq("familyId", args.familyId))
        .filter((q) => q.lt(q.field("createdAt"), cutoffTimestamp))
        .collect();

      // Delete old records
      await Promise.all(
        oldActivities.map(activity => ctx.db.delete(activity._id))
      );

      // Log cleanup activity
      await ctx.db.insert("familyActivity", {
        familyId: args.familyId,
        userId: args.userId,
        userName: member.name,
        action: "budget_updated", // Using existing action type
        description: `${member.name} cleaned up ${oldActivities.length} old activity records`,
        createdAt: now,
        notificationSent: false,
      });

      return { success: true, cleanedRecords: oldActivities.length };
    } catch (error) {
      await ctx.db.insert("errorLogs", {
        familyId: args.familyId,
        userId: args.userId,
        operation: "cleanupOldActivity",
        errorType: "CleanupError",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
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