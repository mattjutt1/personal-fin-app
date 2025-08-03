// Reliability Engineering - Error handling, retry logic, and system health
// Backend reliability patterns for <500ms sync with graceful degradation

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import type { Id } from "./_generated/dataModel";

// Health check endpoint for monitoring
export const getSystemHealth = query({
  args: { 
    familyId: v.optional(v.id("families")),
    includeMetrics: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const oneMinuteAgo = now - (60 * 1000);
    const fiveMinutesAgo = now - (5 * 60 * 1000);
    const oneHourAgo = now - (60 * 60 * 1000);

    let healthStatus = "healthy";
    const metrics: any = {
      timestamp: now,
      uptime: true,
    };

    if (args.includeMetrics) {
      // System-wide error rate
      const recentErrors = await ctx.db
        .query("errorLogs")
        .filter((q) => q.gte(q.field("createdAt"), fiveMinutesAgo))
        .filter((q) => q.eq(q.field("resolved"), false))
        .collect();

      metrics.errorRate = recentErrors.length;
      metrics.errorRate5min = recentErrors.length;

      // Family-specific health if requested
      if (args.familyId) {
        const familyId = args.familyId; // Extract to ensure TypeScript knows it's not undefined
        const familyErrors = recentErrors.filter(e => e.familyId === familyId);
        const familySyncConflicts = await ctx.db
          .query("syncState")
          .withIndex("by_conflicts", (q) => 
            q.eq("familyId", familyId as Id<"families">).eq("hasConflict", true)
          )
          .collect();

        metrics.familyErrorRate = familyErrors.length;
        metrics.syncConflicts = familySyncConflicts.length;

        // Check recent family activity for performance
        const recentActivity = await ctx.db
          .query("familyActivity")
          .withIndex("by_family_time", (q) => q.eq("familyId", familyId))
          .filter((q) => q.gte(q.field("createdAt"), oneMinuteAgo))
          .collect();

        metrics.activityRate1min = recentActivity.length;
      }

      // Database performance indicators
      const totalFamilies = await ctx.db.query("families").collect();
      const activeFamilies = totalFamilies.filter(f => f.isActive);
      
      metrics.totalFamilies = totalFamilies.length;
      metrics.activeFamilies = activeFamilies.length;

      // Set health status based on metrics
      if (metrics.errorRate > 10) healthStatus = "critical";
      else if (metrics.errorRate > 5 || metrics.syncConflicts > 0) healthStatus = "degraded";
    }

    return {
      status: healthStatus,
      timestamp: now,
      version: "1.0.0",
      metrics: args.includeMetrics ? metrics : undefined,
    };
  },
});

// Retry failed operations with exponential backoff
export const retryFailedOperation = mutation({
  args: {
    errorLogId: v.id("errorLogs"),
    maxRetries: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const maxRetries = args.maxRetries || 3;

    try {
      const errorLog = await ctx.db.get(args.errorLogId);
      if (!errorLog) {
        throw new ConvexError("Error log not found");
      }

      if (errorLog.resolved) {
        return { success: true, message: "Error already resolved" };
      }

      const retryAttempt = (errorLog.context.retryAttempt || 0) + 1;
      
      if (retryAttempt > maxRetries) {
        throw new ConvexError(`Max retries (${maxRetries}) exceeded`);
      }

      // Calculate exponential backoff delay
      const backoffDelay = Math.min(1000 * Math.pow(2, retryAttempt - 1), 30000); // Max 30s
      const timeSinceLastAttempt = now - errorLog.createdAt;

      if (timeSinceLastAttempt < backoffDelay) {
        throw new ConvexError(`Retry too soon. Wait ${Math.ceil((backoffDelay - timeSinceLastAttempt) / 1000)}s`);
      }

      // Update retry attempt counter
      await ctx.db.patch(args.errorLogId, {
        context: {
          ...errorLog.context,
          retryAttempt,
        },
      });

      // Attempt operation retry based on operation type
      let retryResult;
      switch (errorLog.operation) {
        case "createTransaction":
          // For transaction creation failures, we'd need the original parameters
          // This is a simplified example - in production, store retry context
          retryResult = { success: false, message: "Manual retry required for transaction creation" };
          break;
          
        case "updateFamilyBudget":
          // Budget updates can often be safely retried
          retryResult = { success: false, message: "Manual retry required for budget update" };
          break;
          
        default:
          retryResult = { success: false, message: `No retry handler for operation: ${errorLog.operation}` };
      }

      if (retryResult.success) {
        // Mark error as resolved
        await ctx.db.patch(args.errorLogId, {
          resolved: true,
          resolvedAt: now,
        });

        return { success: true, message: "Operation retried successfully", retryAttempt };
      } else {
        return { success: false, message: retryResult.message, retryAttempt };
      }
    } catch (error) {
      // Log retry failure
      await ctx.db.insert("errorLogs", {
        operation: "retryFailedOperation",
        errorType: "RetryError",
        errorMessage: error instanceof Error ? error.message : "Unknown retry error",
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

// Get system performance metrics
export const getPerformanceMetrics = query({
  args: {
    timeframe: v.optional(v.union(v.literal("1h"), v.literal("1d"), v.literal("7d"))),
    familyId: v.optional(v.id("families")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    let sinceTimestamp: number;

    switch (args.timeframe || "1h") {
      case "1h":
        sinceTimestamp = now - (60 * 60 * 1000);
        break;
      case "1d":
        sinceTimestamp = now - (24 * 60 * 60 * 1000);
        break;
      case "7d":
        sinceTimestamp = now - (7 * 24 * 60 * 60 * 1000);
        break;
    }

    // Query performance data
    let errorQuery = ctx.db
      .query("errorLogs")
      .filter((q) => q.gte(q.field("createdAt"), sinceTimestamp));

    let activityQuery;

    if (args.familyId) {
      const familyId = args.familyId; // Extract to ensure TypeScript knows it's not undefined
      errorQuery = errorQuery.filter((q) => q.eq(q.field("familyId"), familyId));
      activityQuery = ctx.db
        .query("familyActivity")
        .withIndex("by_family_time", (q) => q.eq("familyId", familyId))
        .filter((q) => q.gte(q.field("createdAt"), sinceTimestamp));
    } else {
      activityQuery = ctx.db
        .query("familyActivity")
        .filter((q) => q.gte(q.field("createdAt"), sinceTimestamp));
    }

    const [errors, activities] = await Promise.all([
      errorQuery.collect(),
      activityQuery.collect(),
    ]);

    // Calculate metrics
    const totalErrors = errors.length;
    const resolvedErrors = errors.filter(e => e.resolved).length;
    const unresolvedErrors = totalErrors - resolvedErrors;
    const errorRate = totalErrors / ((now - sinceTimestamp) / (60 * 1000)); // errors per minute

    // Group errors by type
    const errorsByType = errors.reduce((acc, error) => {
      acc[error.errorType] = (acc[error.errorType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group errors by operation
    const errorsByOperation = errors.reduce((acc, error) => {
      acc[error.operation] = (acc[error.operation] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Activity metrics
    const activityByType = activities.reduce((acc, activity) => {
      acc[activity.action] = (acc[activity.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const transactionActivities = activities.filter(a => 
      a.action.includes("transaction")
    ).length;

    return {
      timeframe: args.timeframe || "1h",
      period: {
        start: sinceTimestamp,
        end: now,
        durationMs: now - sinceTimestamp,
      },
      
      // Error metrics
      errors: {
        total: totalErrors,
        resolved: resolvedErrors,
        unresolved: unresolvedErrors,
        errorRate: Math.round(errorRate * 100) / 100,
        resolutionRate: totalErrors > 0 ? (resolvedErrors / totalErrors) * 100 : 100,
        byType: errorsByType,
        byOperation: errorsByOperation,
      },

      // Activity metrics  
      activities: {
        total: activities.length,
        transactionRate: transactionActivities / ((now - sinceTimestamp) / (60 * 1000)),
        byType: activityByType,
      },

      // Performance indicators
      performance: {
        healthScore: Math.max(0, 100 - (unresolvedErrors * 10) - (errorRate * 5)),
        isHealthy: unresolvedErrors === 0 && errorRate < 1,
        needsAttention: unresolvedErrors > 5 || errorRate > 2,
      },
    };
  },
});

// Circuit breaker pattern for external service calls
export const checkCircuitBreakerStatus = query({
  args: {
    service: v.string(), // e.g., "push_notifications", "email_service"
    familyId: v.optional(v.id("families")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const fiveMinutesAgo = now - (5 * 60 * 1000);

    // Check recent errors for this service
    const recentErrors = await ctx.db
      .query("errorLogs")
      .filter((q) => q.gte(q.field("createdAt"), fiveMinutesAgo))
      .filter((q) => q.eq(q.field("operation"), args.service))
      .collect();

    const errorCount = recentErrors.length;
    const errorThreshold = 5; // Open circuit after 5 errors in 5 minutes

    let status: "closed" | "open" | "half-open";
    let nextAttemptAt: number | null = null;

    if (errorCount >= errorThreshold) {
      status = "open";
      // Half-open after 30 seconds
      const lastError = Math.max(...recentErrors.map(e => e.createdAt));
      nextAttemptAt = lastError + (30 * 1000);
      
      if (now >= nextAttemptAt) {
        status = "half-open";
      }
    } else {
      status = "closed";
    }

    return {
      service: args.service,
      status,
      errorCount,
      errorThreshold,
      nextAttemptAt,
      canAttempt: status === "closed" || (status === "half-open" && now >= (nextAttemptAt || 0)),
      lastErrors: recentErrors.slice(0, 3).map(e => ({
        timestamp: e.createdAt,
        message: e.errorMessage,
      })),
    };
  },
});

// Graceful degradation status
export const getDegradationStatus = query({
  args: { familyId: v.id("families") },
  handler: async (ctx, args) => {
    const now = Date.now();
    const oneMinuteAgo = now - (60 * 1000);

    // Check various system components
    const [
      recentErrors,
      syncConflicts,
      invalidBudgets,
    ] = await Promise.all([
      ctx.db
        .query("errorLogs")
        .withIndex("by_family_time", (q) => q.eq("familyId", args.familyId))
        .filter((q) => q.gte(q.field("createdAt"), oneMinuteAgo))
        .filter((q) => q.eq(q.field("resolved"), false))
        .collect(),
      
      ctx.db
        .query("syncState")
        .withIndex("by_conflicts", (q) => 
          q.eq("familyId", args.familyId).eq("hasConflict", true)
        )
        .collect(),
      
      ctx.db
        .query("dailyBudgets")
        .withIndex("by_validity", (q) => 
          q.eq("familyId", args.familyId).eq("isValid", false)
        )
        .collect(),
    ]);

    // Determine degradation level
    let degradationLevel: "none" | "partial" | "significant";
    const features = {
      realTimeSync: true,
      budgetCalculations: true,
      notifications: true,
      dataConsistency: true,
    };

    if (recentErrors.length > 5) {
      degradationLevel = "significant";
      features.realTimeSync = false;
      features.notifications = false;
    } else if (recentErrors.length > 2 || syncConflicts.length > 0) {
      degradationLevel = "partial";
      features.realTimeSync = false;
    } else {
      degradationLevel = "none";
    }

    // Budget calculation degradation
    if (invalidBudgets.length > 5) {
      features.budgetCalculations = false;
    }

    // Data consistency issues
    if (syncConflicts.length > 0) {
      features.dataConsistency = false;
    }

    return {
      degradationLevel,
      features,
      issues: {
        recentErrors: recentErrors.length,
        syncConflicts: syncConflicts.length,
        invalidBudgets: invalidBudgets.length,
      },
      recommendations: {
        ...recentErrors.length > 0 && { 
          userMessage: "Some features may be temporarily slower. Data is safe and will sync when restored." 
        },
        ...syncConflicts.length > 0 && { 
          adminAction: "Resolve sync conflicts to restore real-time updates." 
        },
        ...invalidBudgets.length > 5 && { 
          adminAction: "Recalculate daily budgets to restore budget accuracy." 
        },
      },
    };
  },
});

// Resolve error manually (admin function)
export const resolveError = mutation({
  args: {
    errorLogId: v.id("errorLogs"),
    userId: v.string(),
    resolution: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    try {
      const errorLog = await ctx.db.get(args.errorLogId);
      if (!errorLog) {
        throw new ConvexError("Error log not found");
      }

      // For now, allow any user to resolve errors
      // In production, add proper admin role checking
      
      await ctx.db.patch(args.errorLogId, {
        resolved: true,
        resolvedAt: now,
        context: {
          ...errorLog.context,
          resolvedBy: args.userId,
          resolution: args.resolution,
        },
      });

      // Log resolution activity if it's a family-related error
      if (errorLog.familyId) {
        await ctx.db.insert("familyActivity", {
          familyId: errorLog.familyId,
          userId: args.userId,
          userName: "Admin",
          action: "budget_updated", // Using existing action type
          description: `Error resolved: ${errorLog.operation} - ${args.resolution}`,
          createdAt: now,
          notificationSent: false,
        });
      }

      return { success: true };
    } catch (error) {
      await ctx.db.insert("errorLogs", {
        userId: args.userId,
        operation: "resolveError",
        errorType: "ErrorResolutionError",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        context: {
          originalErrorId: args.errorLogId,
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

// System maintenance endpoint
export const performMaintenance = mutation({
  args: {
    userId: v.string(),
    actions: v.array(v.union(
      v.literal("cleanup_old_errors"),
      v.literal("resolve_sync_conflicts"),
      v.literal("recalculate_budgets"),
      v.literal("cleanup_old_activity")
    )),
    familyId: v.optional(v.id("families")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const results: Record<string, any> = {};

    try {
      // For now, allow any user to run maintenance
      // In production, add proper admin role checking

      for (const action of args.actions) {
        switch (action) {
          case "cleanup_old_errors":
            const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
            const oldErrors = await ctx.db
              .query("errorLogs")
              .filter((q) => q.lt(q.field("createdAt"), thirtyDaysAgo))
              .filter((q) => q.eq(q.field("resolved"), true))
              .collect();

            await Promise.all(oldErrors.map(error => ctx.db.delete(error._id)));
            results.cleanup_old_errors = { cleaned: oldErrors.length };
            break;

          case "resolve_sync_conflicts":
            let conflictQuery;

            if (args.familyId) {
              const familyId = args.familyId; // Extract to ensure TypeScript knows it's not undefined
              conflictQuery = ctx.db
                .query("syncState")
                .withIndex("by_conflicts", (q) => 
                  q.eq("familyId", familyId).eq("hasConflict", true)
                );
            } else {
              conflictQuery = ctx.db
                .query("syncState")
                .filter((q) => q.eq(q.field("hasConflict"), true));
            }

            const conflicts = await conflictQuery.collect();
            await Promise.all(
              conflicts.map(conflict => 
                ctx.db.patch(conflict._id, { hasConflict: false, conflictCount: 0 })
              )
            );
            results.resolve_sync_conflicts = { resolved: conflicts.length };
            break;

          case "recalculate_budgets":
            let budgetQuery;

            if (args.familyId) {
              const familyId = args.familyId; // Extract to ensure TypeScript knows it's not undefined
              budgetQuery = ctx.db
                .query("dailyBudgets")
                .withIndex("by_validity", (q) => 
                  q.eq("familyId", familyId).eq("isValid", false)
                );
            } else {
              budgetQuery = ctx.db
                .query("dailyBudgets")
                .filter((q) => q.eq(q.field("isValid"), false));
            }

            const invalidBudgets = await budgetQuery.collect();
            await Promise.all(
              invalidBudgets.map(budget => ctx.db.delete(budget._id))
            );
            results.recalculate_budgets = { invalidated: invalidBudgets.length };
            break;

          case "cleanup_old_activity":
            const sixtyDaysAgo = now - (60 * 24 * 60 * 60 * 1000);
            let activityQuery;

            if (args.familyId) {
              const familyId = args.familyId; // Extract to ensure TypeScript knows it's not undefined
              activityQuery = ctx.db
                .query("familyActivity")
                .withIndex("by_family_time", (q) => q.eq("familyId", familyId))
                .filter((q) => q.lt(q.field("createdAt"), sixtyDaysAgo));
            } else {
              activityQuery = ctx.db
                .query("familyActivity")
                .filter((q) => q.lt(q.field("createdAt"), sixtyDaysAgo));
            }

            const oldActivity = await activityQuery.collect();
            await Promise.all(oldActivity.map(activity => ctx.db.delete(activity._id)));
            results.cleanup_old_activity = { cleaned: oldActivity.length };
            break;
        }
      }

      return { success: true, results };
    } catch (error) {
      await ctx.db.insert("errorLogs", {
        userId: args.userId,
        operation: "performMaintenance",
        errorType: "MaintenanceError",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        context: {
          actions: args.actions,
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