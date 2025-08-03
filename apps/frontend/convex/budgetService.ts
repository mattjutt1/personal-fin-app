// Budget Service - Handles budget operations via events (no direct transaction access)
// Implements proper atomic slice boundaries with event-driven architecture

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// Budget category spending update (triggered by transaction events)
export const updateCategorySpending = mutation({
  args: {
    familyId: v.id("families"),
    category: v.union(v.literal("fixed"), v.literal("variable"), v.literal("savings")),
    amountChange: v.number(),
    userId: v.string(),
    reason: v.string(), // "transaction_created", "transaction_updated", "transaction_deleted"
    transactionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    try {
      // Find active budget category
      const budgetCategory = await ctx.db
        .query("budgetCategories")
        .withIndex("by_family_active", (q) => 
          q.eq("familyId", args.familyId).eq("isActive", true)
        )
        .filter((q) => q.eq(q.field("type"), args.category))
        .first();

      if (!budgetCategory) {
        throw new ConvexError(`Budget category ${args.category} not found for family`);
      }

      // Calculate new spending amount (ensure non-negative)
      const newSpent = Math.max(0, budgetCategory.currentSpent + args.amountChange);

      // Update category spending
      await ctx.db.patch(budgetCategory._id, {
        currentSpent: newSpent,
        updatedAt: now,
      });

      // Log budget update activity
      await ctx.db.insert("familyActivity", {
        familyId: args.familyId,
        userId: args.userId,
        userName: "System", // Will be updated by calling service
        action: "budget_updated",
        targetId: budgetCategory._id,
        description: `Budget updated for ${args.category}: ${args.reason}`,
        metadata: {
          category: args.category,
          amountChange: args.amountChange,
          newSpent,
          reason: args.reason,
          transactionId: args.transactionId,
        },
        createdAt: now,
        notificationSent: false,
      });

      return {
        success: true,
        data: {
          categoryId: budgetCategory._id,
          category: args.category,
          oldSpent: budgetCategory.currentSpent,
          newSpent,
          budgetAmount: budgetCategory.budgetedAmount,
          remainingBudget: budgetCategory.budgetedAmount - newSpent,
        },
        timestamp: now,
      };
    } catch (error) {
      // Log error for debugging
      await ctx.db.insert("errorLogs", {
        familyId: args.familyId,
        userId: args.userId,
        operation: "updateCategorySpending",
        errorType: "BudgetUpdateError",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        context: {
          category: args.category,
          amountChange: args.amountChange,
          reason: args.reason,
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

// Invalidate daily budget cache (triggered by transaction events)
export const invalidateDailyBudget = mutation({
  args: {
    familyId: v.id("families"),
    date: v.string(),
    userId: v.string(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    try {
      // Find daily budget for the date
      const dailyBudget = await ctx.db
        .query("dailyBudgets")
        .withIndex("by_family_date", (q) => 
          q.eq("familyId", args.familyId).eq("date", args.date)
        )
        .first();

      if (dailyBudget) {
        // Mark as invalid for recalculation
        await ctx.db.patch(dailyBudget._id, { 
          isValid: false,
        });

        return {
          success: true,
          data: { dailyBudgetId: dailyBudget._id, invalidated: true },
          timestamp: now,
        };
      }

      return {
        success: true,
        data: { dailyBudgetId: null, invalidated: false },
        timestamp: now,
      };
    } catch (error) {
      // Log error for debugging
      await ctx.db.insert("errorLogs", {
        familyId: args.familyId,
        userId: args.userId,
        operation: "invalidateDailyBudget",
        errorType: "BudgetInvalidationError",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        context: {
          date: args.date,
          reason: args.reason,
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

// Get budget category (read-only operation)
export const getCategoryBudget = query({
  args: {
    familyId: v.id("families"),
    category: v.union(v.literal("fixed"), v.literal("variable"), v.literal("savings")),
  },
  handler: async (ctx, args) => {
    const budgetCategory = await ctx.db
      .query("budgetCategories")
      .withIndex("by_family_active", (q) => 
        q.eq("familyId", args.familyId).eq("isActive", true)
      )
      .filter((q) => q.eq(q.field("type"), args.category))
      .first();

    if (!budgetCategory) {
      return {
        success: true,
        data: null,
        timestamp: Date.now(),
      };
    }

    return {
      success: true,
      data: {
        _id: budgetCategory._id,
        familyId: budgetCategory.familyId,
        name: budgetCategory.name,
        type: budgetCategory.type,
        budgetAmount: budgetCategory.budgetedAmount,
        currentSpent: budgetCategory.currentSpent,
        remainingBudget: budgetCategory.budgetedAmount - budgetCategory.currentSpent,
        isActive: budgetCategory.isActive,
        createdAt: budgetCategory.createdAt,
        updatedAt: budgetCategory.updatedAt,
      },
      timestamp: Date.now(),
    };
  },
});

// Get all budget categories for family
export const getAllCategoryBudgets = query({
  args: {
    familyId: v.id("families"),
  },
  handler: async (ctx, args) => {
    const budgetCategories = await ctx.db
      .query("budgetCategories")
      .withIndex("by_family_active", (q) => 
        q.eq("familyId", args.familyId).eq("isActive", true)
      )
      .order("asc") // Sort by creation order
      .collect();

    const categoriesWithCalculations = budgetCategories.map(category => ({
      _id: category._id,
      familyId: category.familyId,
      name: category.name,
      type: category.type,
      budgetAmount: category.budgetedAmount,
      currentSpent: category.currentSpent,
      remainingBudget: category.budgetedAmount - category.currentSpent,
      spentPercentage: category.budgetedAmount > 0 
        ? (category.currentSpent / category.budgetedAmount) * 100 
        : 0,
      isOverBudget: category.currentSpent > category.budgetedAmount,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    }));

    return {
      success: true,
      data: categoriesWithCalculations,
      timestamp: Date.now(),
    };
  },
});

// Get daily budget with caching
export const getDailyBudget = query({
  args: {
    familyId: v.id("families"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    // Check for cached daily budget
    const cachedBudget = await ctx.db
      .query("dailyBudgets")
      .withIndex("by_family_date", (q) => 
        q.eq("familyId", args.familyId).eq("date", args.date)
      )
      .first();

    if (cachedBudget && cachedBudget.isValid) {
      // Return cached result
      return {
        success: true,
        data: {
          _id: cachedBudget._id,
          familyId: cachedBudget.familyId,
          date: cachedBudget.date,
          dailyBudgetAmount: cachedBudget.dailyBudgetAmount,
          totalSpent: cachedBudget.totalSpent,
          remainingBudget: cachedBudget.remainingBudget,
          spentPercentage: cachedBudget.dailyBudgetAmount > 0 
            ? (cachedBudget.totalSpent / cachedBudget.dailyBudgetAmount) * 100 
            : 0,
          isOverBudget: cachedBudget.totalSpent > cachedBudget.dailyBudgetAmount,
          isValid: cachedBudget.isValid,
          calculatedAt: cachedBudget.calculatedAt,
          cacheHit: true,
        },
        timestamp: Date.now(),
      };
    }

    // No valid cache found - return null to trigger calculation
    return {
      success: true,
      data: null,
      timestamp: Date.now(),
    };
  },
});

// Calculate and cache daily budget
export const calculateDailyBudget = mutation({
  args: {
    familyId: v.id("families"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    try {
      // Get all budget categories
      const budgetCategories = await ctx.db
        .query("budgetCategories")
        .withIndex("by_family_active", (q) => 
          q.eq("familyId", args.familyId).eq("isActive", true)
        )
        .collect();

      if (budgetCategories.length === 0) {
        throw new ConvexError("No budget categories found for family");
      }

      // Calculate total budget and spent amounts
      const totals = budgetCategories.reduce(
        (acc, category) => ({
          totalBudget: acc.totalBudget + category.budgetedAmount,
          totalSpent: acc.totalSpent + category.currentSpent,
        }),
        { totalBudget: 0, totalSpent: 0 }
      );

      // Calculate days remaining in month for daily budget
      const date = new Date(args.date);
      const year = date.getFullYear();
      const month = date.getMonth();
      const today = date.getDate();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const daysRemaining = Math.max(1, daysInMonth - today + 1);

      // Daily budget calculation: (Total Budget - Fixed - Savings) / Days Remaining
      const fixedCategory = budgetCategories.find(c => c.type === "fixed");
      const savingsCategory = budgetCategories.find(c => c.type === "savings");
      const variableCategory = budgetCategories.find(c => c.type === "variable");

      const fixedAmount = fixedCategory?.budgetedAmount || 0;
      const savingsAmount = savingsCategory?.budgetedAmount || 0;
      const variableAmount = variableCategory?.budgetedAmount || 0;

      // Available for daily spending = Variable budget - Variable spent
      const availableVariable = Math.max(0, variableAmount - (variableCategory?.currentSpent || 0));
      const dailyBudgetAmount = Math.max(0, availableVariable / daysRemaining);

      // Get today's spending
      const todayTransactions = await ctx.db
        .query("transactions")
        .withIndex("by_family_date", (q) => 
          q.eq("familyId", args.familyId).eq("date", args.date)
        )
        .filter((q) => q.eq(q.field("type"), "expense"))
        .filter((q) => q.eq(q.field("status"), "confirmed"))
        .collect();

      const todaySpent = todayTransactions.reduce((sum, t) => sum + t.amount, 0);
      const remainingBudget = dailyBudgetAmount - todaySpent;

      // Calculate category-specific spending
      const fixedSpent = todayTransactions
        .filter(t => t.category === "fixed")
        .reduce((sum, t) => sum + t.amount, 0);
      const variableSpent = todayTransactions
        .filter(t => t.category === "variable")
        .reduce((sum, t) => sum + t.amount, 0);
      const savingsContributed = todayTransactions
        .filter(t => t.category === "savings")
        .reduce((sum, t) => sum + t.amount, 0);

      const dailyBudgetData = {
        familyId: args.familyId,
        date: args.date,
        dailyBudgetAmount,
        totalSpent: todaySpent,
        remainingBudget,
        fixedSpent,
        variableSpent,
        savingsContributed,
        calculatedAt: now,
        isValid: true,
      };

      // Check if cached entry exists
      const existingBudget = await ctx.db
        .query("dailyBudgets")
        .withIndex("by_family_date", (q) => 
          q.eq("familyId", args.familyId).eq("date", args.date)
        )
        .first();

      let dailyBudgetId: string;

      if (existingBudget) {
        // Update existing cache
        await ctx.db.patch(existingBudget._id, {
          dailyBudgetAmount,
          totalSpent: todaySpent,
          remainingBudget,
          fixedSpent,
          variableSpent,
          savingsContributed,
          calculatedAt: now,
          isValid: true,
        });
        dailyBudgetId = existingBudget._id;
      } else {
        // Create new cache entry
        dailyBudgetId = await ctx.db.insert("dailyBudgets", dailyBudgetData);
      }

      return {
        success: true,
        data: {
          _id: dailyBudgetId,
          ...dailyBudgetData,
          spentPercentage: dailyBudgetAmount > 0 ? (todaySpent / dailyBudgetAmount) * 100 : 0,
          isOverBudget: todaySpent > dailyBudgetAmount,
          cacheHit: false,
          metadata: {
            daysRemaining,
            totalBudget: totals.totalBudget,
            fixedAmount,
            savingsAmount,
            variableAmount,
            availableVariable,
          },
        },
        timestamp: now,
      };
    } catch (error) {
      // Log error for debugging
      await ctx.db.insert("errorLogs", {
        familyId: args.familyId,
        operation: "calculateDailyBudget",
        errorType: "BudgetCalculationError",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        context: {
          date: args.date,
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