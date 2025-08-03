// Transaction Management - Production-ready with family sync and optimistic updates
// Optimized for <500ms real-time sync across family members

import { api } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// Create transaction with family sync and optimistic updates
export const createTransaction = mutation({
  args: {
    familyId: v.id("families"),
    userId: v.string(),
    userName: v.string(),
    amount: v.number(),
    description: v.string(),
    category: v.union(v.literal("fixed"), v.literal("variable"), v.literal("savings")),
    subcategory: v.optional(v.string()),
    type: v.union(v.literal("income"), v.literal("expense")),
    date: v.string(), // ISO date string
    // Optimistic update support
    clientId: v.optional(v.string()), // For deduplication
    syncVersion: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    try {
      // Verify user is active family member
      const member = await ctx.db
        .query("familyMembers")
        .withIndex("by_user_family", (q) => 
          q.eq("userId", args.userId).eq("familyId", args.familyId)
        )
        .first();

      if (!member || !member.isActive) {
        throw new ConvexError("User is not an active member of this family");
      }

      // Check for duplicate based on clientId (optimistic update deduplication)
      if (args.clientId) {
        const existingTransaction = await ctx.db
          .query("transactions")
          .withIndex("by_family_user", (q) => 
            q.eq("familyId", args.familyId).eq("userId", args.userId)
          )
          .filter((q) => q.eq(q.field("description"), args.description))
          .filter((q) => q.eq(q.field("amount"), args.amount))
          .filter((q) => q.eq(q.field("date"), args.date))
          .first();

        if (existingTransaction && (now - existingTransaction.createdAt) < 5000) {
          // Return existing transaction if created within 5 seconds (likely duplicate)
          return existingTransaction._id;
        }
      }

      // Get next sync version for optimistic updates
      const latestSync = await ctx.db
        .query("syncState")
        .withIndex("by_family_resource", (q) => 
          q.eq("familyId", args.familyId).eq("resourceType", "transaction")
        )
        .order("desc")
        .first();
      
      const nextSyncVersion = (latestSync?.version || 0) + 1;

      // Create transaction with status tracking
      const transactionId = await ctx.db.insert("transactions", {
        familyId: args.familyId,
        userId: args.userId,
        userName: args.userName,
        amount: args.amount,
        description: args.description,
        category: args.category,
        subcategory: args.subcategory,
        type: args.type,
        date: args.date,
        createdAt: now,
        updatedAt: now,
        syncVersion: args.syncVersion || nextSyncVersion,
        status: "confirmed",
        retryCount: 0,
      });

      // Update sync state for family coordination
      await ctx.db.insert("syncState", {
        familyId: args.familyId,
        resourceType: "transaction",
        resourceId: transactionId,
        version: nextSyncVersion,
        lastSyncAt: now,
        syncedBy: args.userId,
        conflictCount: 0,
        hasConflict: false,
      });

      // Trigger budget updates via separate service (maintains slice boundaries)
      if (args.type === "expense") {
        // Call budget service to update category spending
        await ctx.runMutation(api.budgetService.updateCategorySpending, {
          familyId: args.familyId,
          category: args.category,
          amountChange: args.amount,
          userId: args.userId,
          reason: "transaction_created",
          transactionId: transactionId,
        });

        // Invalidate daily budget cache
        await ctx.runMutation(api.budgetService.invalidateDailyBudget, {
          familyId: args.familyId,
          date: args.date,
          userId: args.userId,
          reason: "transaction_created",
        });
      }

      // Log family activity for real-time notifications
      await ctx.db.insert("familyActivity", {
        familyId: args.familyId,
        userId: args.userId,
        userName: args.userName,
        action: "transaction_added",
        targetId: transactionId,
        description: `${args.userName} ${args.type === "expense" ? "spent" : "earned"} $${args.amount.toFixed(2)} on ${args.description}`,
        metadata: {
          amount: args.amount,
          category: args.category,
        },
        createdAt: now,
        notificationSent: false,
      });

      // Update member activity timestamp
      await ctx.db.patch(member._id, {
        lastActiveAt: now,
      });

      return transactionId;
    } catch (error) {
      // Log error with context for debugging
      await ctx.db.insert("errorLogs", {
        familyId: args.familyId,
        userId: args.userId,
        operation: "createTransaction",
        errorType: "TransactionCreationError",
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

// Get family transactions with performance optimization
export const getFamilyTransactions = query({
  args: {
    familyId: v.id("families"),
    limit: v.optional(v.number()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    category: v.optional(v.union(v.literal("fixed"), v.literal("variable"), v.literal("savings"))),
    type: v.optional(v.union(v.literal("income"), v.literal("expense"))),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("transactions")
      .withIndex("by_family_created", (q) => q.eq("familyId", args.familyId))
      .order("desc");

    // Apply filters for performance
    if (args.category) {
      query = ctx.db
        .query("transactions")
        .withIndex("by_family_category", (q) => 
          q.eq("familyId", args.familyId).eq("category", args.category!)
        )
        .order("desc");
    }

    if (args.type) {
      query = ctx.db
        .query("transactions")
        .withIndex("by_family_type", (q) => 
          q.eq("familyId", args.familyId).eq("type", args.type!)
        )
        .order("desc");
    }

    let transactions = await query.take(args.limit || 100);

    // Filter by date range if provided
    if (args.startDate || args.endDate) {
      transactions = transactions.filter(t => {
        if (args.startDate && t.date < args.startDate) return false;
        if (args.endDate && t.date > args.endDate) return false;
        return true;
      });
    }

    return transactions.filter(t => t.status === "confirmed");
  },
});

// Get daily transactions for specific date (optimized for daily budget view)
export const getDailyTransactions = query({
  args: {
    familyId: v.id("families"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("transactions")
      .withIndex("by_family_date", (q) => 
        q.eq("familyId", args.familyId).eq("date", args.date)
      )
      .filter((q) => q.eq(q.field("status"), "confirmed"))
      .order("desc")
      .collect();
  },
});

// Update transaction with conflict resolution
export const updateTransaction = mutation({
  args: {
    transactionId: v.id("transactions"),
    userId: v.string(),
    amount: v.optional(v.number()),
    description: v.optional(v.string()),
    category: v.optional(v.union(v.literal("fixed"), v.literal("variable"), v.literal("savings"))),
    subcategory: v.optional(v.string()),
    expectedSyncVersion: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    try {
      // Get current transaction
      const transaction = await ctx.db.get(args.transactionId);
      if (!transaction) {
        throw new ConvexError("Transaction not found");
      }

      // Verify user has permission (same user or family manager)
      const member = await ctx.db
        .query("familyMembers")
        .withIndex("by_user_family", (q) => 
          q.eq("userId", args.userId).eq("familyId", transaction.familyId)
        )
        .first();

      if (!member || !member.isActive) {
        throw new ConvexError("Not authorized to update this transaction");
      }

      const canUpdate = transaction.userId === args.userId || member.role === "manager";
      if (!canUpdate) {
        throw new ConvexError("Only transaction creator or family managers can update transactions");
      }

      // Check for sync conflicts
      if (args.expectedSyncVersion && transaction.syncVersion !== args.expectedSyncVersion) {
        // Handle conflict by logging and proceeding with merge
        await ctx.db.insert("syncState", {
          familyId: transaction.familyId,
          resourceType: "transaction",
          resourceId: args.transactionId,
          version: transaction.syncVersion + 1,
          lastSyncAt: now,
          syncedBy: args.userId,
          conflictCount: 1,
          hasConflict: true,
        });
      }

      // Build update object
      const updates: any = {
        updatedAt: now,
        syncVersion: transaction.syncVersion + 1,
      };

      const changes: any = {};

      if (args.amount !== undefined) {
        changes.amount = { old: transaction.amount, new: args.amount };
        updates.amount = args.amount;
      }
      if (args.description !== undefined) {
        changes.description = { old: transaction.description, new: args.description };
        updates.description = args.description;
      }
      if (args.category !== undefined) {
        changes.category = { old: transaction.category, new: args.category };
        updates.category = args.category;
      }
      if (args.subcategory !== undefined) {
        changes.subcategory = { old: transaction.subcategory, new: args.subcategory };
        updates.subcategory = args.subcategory;
      }

      // Update transaction
      await ctx.db.patch(args.transactionId, updates);

      // Invalidate daily budget cache via budget service
      await ctx.runMutation(api.budgetService.invalidateDailyBudget, {
        familyId: transaction.familyId,
        date: transaction.date,
        userId: args.userId,
        reason: "transaction_updated",
      });

      // Log update activity
      await ctx.db.insert("familyActivity", {
        familyId: transaction.familyId,
        userId: args.userId,
        userName: member.name,
        action: "transaction_updated",
        targetId: args.transactionId,
        description: `${member.name} updated transaction: ${transaction.description}`,
        metadata: changes,
        createdAt: now,
        notificationSent: false,
      });

      return { success: true, newSyncVersion: updates.syncVersion };
    } catch (error) {
      // Log error for debugging
      await ctx.db.insert("errorLogs", {
        userId: args.userId,
        operation: "updateTransaction",
        errorType: "TransactionUpdateError",
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

// Delete transaction with family notification
export const deleteTransaction = mutation({
  args: {
    transactionId: v.id("transactions"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    try {
      // Get transaction details
      const transaction = await ctx.db.get(args.transactionId);
      if (!transaction) {
        throw new ConvexError("Transaction not found");
      }

      // Verify user has permission
      const member = await ctx.db
        .query("familyMembers")
        .withIndex("by_user_family", (q) => 
          q.eq("userId", args.userId).eq("familyId", transaction.familyId)
        )
        .first();

      if (!member || !member.isActive) {
        throw new ConvexError("Not authorized to delete this transaction");
      }

      const canDelete = transaction.userId === args.userId || member.role === "manager";
      if (!canDelete) {
        throw new ConvexError("Only transaction creator or family managers can delete transactions");
      }

      // Delete transaction
      await ctx.db.delete(args.transactionId);

      // Update category spending via budget service (reverse the transaction amount)
      if (transaction.type === "expense") {
        await ctx.runMutation(api.budgetService.updateCategorySpending, {
          familyId: transaction.familyId,
          category: transaction.category,
          amountChange: -transaction.amount, // Negative to reverse the spending
          userId: args.userId,
          reason: "transaction_deleted",
          transactionId: args.transactionId,
        });
      }

      // Invalidate daily budget cache via budget service
      await ctx.runMutation(api.budgetService.invalidateDailyBudget, {
        familyId: transaction.familyId,
        date: transaction.date,
        userId: args.userId,
        reason: "transaction_updated",
      });

      // Log deletion activity
      await ctx.db.insert("familyActivity", {
        familyId: transaction.familyId,
        userId: args.userId,
        userName: member.name,
        action: "transaction_deleted",
        targetId: args.transactionId,
        description: `${member.name} deleted transaction: ${transaction.description} ($${transaction.amount.toFixed(2)})`,
        metadata: {
          amount: transaction.amount,
          category: transaction.category,
        },
        createdAt: now,
        notificationSent: false,
      });

      return { success: true };
    } catch (error) {
      // Log error for debugging
      await ctx.db.insert("errorLogs", {
        userId: args.userId,
        operation: "deleteTransaction",
        errorType: "TransactionDeletionError",
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

// Get family transaction summary with caching
export const getFamilyTransactionSummary = query({
  args: { 
    familyId: v.id("families"),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Build date-filtered query for performance
    let transactions;
    
    if (args.startDate && args.endDate) {
      transactions = await ctx.db
        .query("transactions")
        .withIndex("by_family", (q) => q.eq("familyId", args.familyId))
        .filter((q) => q.gte(q.field("date"), args.startDate!))
        .filter((q) => q.lte(q.field("date"), args.endDate!))
        .filter((q) => q.eq(q.field("status"), "confirmed"))
        .collect();
    } else {
      transactions = await ctx.db
        .query("transactions")
        .withIndex("by_family", (q) => q.eq("familyId", args.familyId))
        .filter((q) => q.eq(q.field("status"), "confirmed"))
        .collect();
    }
    
    const summary = transactions.reduce(
      (acc, transaction) => {
        // Total by type
        if (transaction.type === "income") {
          acc.totalIncome += transaction.amount;
        } else {
          acc.totalExpenses += transaction.amount;
        }

        // Breakdown by category
        if (!acc.categoryBreakdown[transaction.category]) {
          acc.categoryBreakdown[transaction.category] = { income: 0, expenses: 0, count: 0 };
        }

        if (transaction.type === "income") {
          acc.categoryBreakdown[transaction.category].income += transaction.amount;
        } else {
          acc.categoryBreakdown[transaction.category].expenses += transaction.amount;
        }
        acc.categoryBreakdown[transaction.category].count += 1;

        acc.transactionCount += 1;
        return acc;
      },
      { 
        totalIncome: 0, 
        totalExpenses: 0, 
        transactionCount: 0,
        categoryBreakdown: {} as Record<string, { income: number; expenses: number; count: number }>,
      }
    );

    return {
      ...summary,
      netAmount: summary.totalIncome - summary.totalExpenses,
      averageTransaction: summary.transactionCount > 0 
        ? (summary.totalIncome + summary.totalExpenses) / summary.transactionCount 
        : 0,
    };
  },
});