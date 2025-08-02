// Daily Budget Management - Production-ready with caching and performance optimization
// Core feature: (Income - Fixed - Savings) ÷ Days remaining calculation

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// Calculate daily budget with caching for <200ms performance
export const calculateDailyBudget = query({
  args: {
    familyId: v.id("families"),
    date: v.string(), // ISO date string
  },
  handler: async (ctx, args) => {
    // Check cache first for performance
    const cachedBudget = await ctx.db
      .query("dailyBudgets")
      .withIndex("by_family_date", (q) => 
        q.eq("familyId", args.familyId).eq("date", args.date)
      )
      .first();

    // Return cached result if valid and recent (< 5 minutes old)
    if (cachedBudget && cachedBudget.isValid && 
        (Date.now() - cachedBudget.calculatedAt) < 300000) {
      return {
        date: cachedBudget.date,
        dailyBudgetAmount: cachedBudget.dailyBudgetAmount,
        totalSpent: cachedBudget.totalSpent,
        remainingBudget: cachedBudget.remainingBudget,
        fixedSpent: cachedBudget.fixedSpent,
        variableSpent: cachedBudget.variableSpent,
        savingsContributed: cachedBudget.savingsContributed,
        isCached: true,
        calculatedAt: cachedBudget.calculatedAt,
      };
    }

    // Recalculate if cache is invalid or missing
    const family = await ctx.db.get(args.familyId);
    if (!family || !family.isActive) {
      throw new ConvexError("Family not found or inactive");
    }

    // Get current date for calculations
    const currentDate = new Date(args.date);
    const budgetStartDate = new Date(family.budgetStartDate);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const daysRemaining = Math.max(1, Math.ceil((endOfMonth.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    // Core daily budget calculation: (Income - Fixed - Savings) ÷ Days remaining
    const variableIncome = family.monthlyIncome - family.fixedExpenses - family.savingsGoal;
    const dailyBudgetAmount = Math.max(0, variableIncome / daysRemaining);

    // Get today's transactions for spending calculation
    const dailyTransactions = await ctx.db
      .query("transactions")
      .withIndex("by_family_date", (q) => 
        q.eq("familyId", args.familyId).eq("date", args.date)
      )
      .filter((q) => q.eq(q.field("status"), "confirmed"))
      .collect();

    // Calculate spending breakdown
    const spending = dailyTransactions.reduce(
      (acc, transaction) => {
        if (transaction.type === "expense") {
          acc.totalSpent += transaction.amount;
          
          switch (transaction.category) {
            case "fixed":
              acc.fixedSpent += transaction.amount;
              break;
            case "variable":
              acc.variableSpent += transaction.amount;
              break;
            case "savings":
              acc.savingsContributed += transaction.amount;
              break;
          }
        }
        return acc;
      },
      { totalSpent: 0, fixedSpent: 0, variableSpent: 0, savingsContributed: 0 }
    );

    const remainingBudget = dailyBudgetAmount - spending.variableSpent;

    const result = {
      date: args.date,
      dailyBudgetAmount,
      totalSpent: spending.totalSpent,
      remainingBudget,
      fixedSpent: spending.fixedSpent,
      variableSpent: spending.variableSpent,
      savingsContributed: spending.savingsContributed,
      // Additional context
      daysRemaining,
      monthlyIncome: family.monthlyIncome,
      fixedExpenses: family.fixedExpenses,
      savingsGoal: family.savingsGoal,
      variableIncome,
      isCached: false,
      calculatedAt: Date.now(),
    };

    // Update cache for next request
    if (cachedBudget) {
      await ctx.db.patch(cachedBudget._id, {
        dailyBudgetAmount,
        totalSpent: spending.totalSpent,
        remainingBudget,
        fixedSpent: spending.fixedSpent,
        variableSpent: spending.variableSpent,
        savingsContributed: spending.savingsContributed,
        calculatedAt: Date.now(),
        isValid: true,
      });
    } else {
      await ctx.db.insert("dailyBudgets", {
        familyId: args.familyId,
        date: args.date,
        dailyBudgetAmount,
        totalSpent: spending.totalSpent,
        remainingBudget,
        fixedSpent: spending.fixedSpent,
        variableSpent: spending.variableSpent,
        savingsContributed: spending.savingsContributed,
        calculatedAt: Date.now(),
        isValid: true,
      });
    }

    return result;
  },
});

// Get budget categories with spending tracking
export const getBudgetCategories = query({
  args: { familyId: v.id("families") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("budgetCategories")
      .withIndex("by_family_active", (q) => 
        q.eq("familyId", args.familyId).eq("isActive", true)
      )
      .collect();
  },
});

// Update budget category
export const updateBudgetCategory = mutation({
  args: {
    categoryId: v.id("budgetCategories"),
    userId: v.string(),
    budgetedAmount: v.optional(v.number()),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    try {
      const category = await ctx.db.get(args.categoryId);
      if (!category) {
        throw new ConvexError("Budget category not found");
      }

      // Verify user is family manager
      const member = await ctx.db
        .query("familyMembers")
        .withIndex("by_user_family", (q) => 
          q.eq("userId", args.userId).eq("familyId", category.familyId)
        )
        .first();

      if (!member || !member.isActive || member.role !== "manager") {
        throw new ConvexError("Only family managers can update budget categories");
      }

      // Build update object
      const updates: any = { updatedAt: now };
      if (args.budgetedAmount !== undefined) updates.budgetedAmount = args.budgetedAmount;
      if (args.name !== undefined) updates.name = args.name;
      if (args.color !== undefined) updates.color = args.color;
      if (args.icon !== undefined) updates.icon = args.icon;

      await ctx.db.patch(args.categoryId, updates);

      // Invalidate daily budget cache
      const dailyBudgets = await ctx.db
        .query("dailyBudgets")
        .withIndex("by_family_calculated", (q) => q.eq("familyId", category.familyId))
        .collect();

      await Promise.all(
        dailyBudgets.map(budget =>
          ctx.db.patch(budget._id, { isValid: false })
        )
      );

      // Log activity
      await ctx.db.insert("familyActivity", {
        familyId: category.familyId,
        userId: args.userId,
        userName: member.name,
        action: "budget_updated",
        description: `${member.name} updated budget category: ${category.name}`,
        createdAt: now,
        notificationSent: false,
      });

      return { success: true };
    } catch (error) {
      await ctx.db.insert("errorLogs", {
        userId: args.userId,
        operation: "updateBudgetCategory",
        errorType: "CategoryUpdateError",
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

// Add custom budget category
export const addBudgetCategory = mutation({
  args: {
    familyId: v.id("families"),
    userId: v.string(),
    name: v.string(),
    type: v.union(v.literal("fixed"), v.literal("variable"), v.literal("savings")),
    budgetedAmount: v.number(),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
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
        throw new ConvexError("Only family managers can add budget categories");
      }

      // Check for duplicate category name
      const existingCategory = await ctx.db
        .query("budgetCategories")
        .withIndex("by_family_active", (q) => 
          q.eq("familyId", args.familyId).eq("isActive", true)
        )
        .filter((q) => q.eq(q.field("name"), args.name))
        .first();

      if (existingCategory) {
        throw new ConvexError("A category with this name already exists");
      }

      const categoryId = await ctx.db.insert("budgetCategories", {
        familyId: args.familyId,
        name: args.name,
        type: args.type,
        budgetedAmount: args.budgetedAmount,
        currentSpent: 0,
        isDefault: false,
        color: args.color,
        icon: args.icon,
        createdAt: now,
        updatedAt: now,
        isActive: true,
      });

      // Log activity
      await ctx.db.insert("familyActivity", {
        familyId: args.familyId,
        userId: args.userId,
        userName: member.name,
        action: "budget_updated",
        description: `${member.name} added new budget category: ${args.name}`,
        createdAt: now,
        notificationSent: false,
      });

      return categoryId;
    } catch (error) {
      await ctx.db.insert("errorLogs", {
        familyId: args.familyId,
        userId: args.userId,
        operation: "addBudgetCategory",
        errorType: "CategoryCreationError",
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

// Get monthly budget overview
export const getMonthlyBudgetOverview = query({
  args: {
    familyId: v.id("families"),
    year: v.number(),
    month: v.number(), // 0-based (0 = January)
  },
  handler: async (ctx, args) => {
    const family = await ctx.db.get(args.familyId);
    if (!family || !family.isActive) {
      return null;
    }

    // Calculate date range for the month
    const startDate = new Date(args.year, args.month, 1).toISOString().split("T")[0];
    const endDate = new Date(args.year, args.month + 1, 0).toISOString().split("T")[0];

    // Get all transactions for the month
    const monthlyTransactions = await ctx.db
      .query("transactions")
      .withIndex("by_family", (q) => q.eq("familyId", args.familyId))
      .filter((q) => q.gte(q.field("date"), startDate))
      .filter((q) => q.lte(q.field("date"), endDate))
      .filter((q) => q.eq(q.field("status"), "confirmed"))
      .collect();

    // Calculate spending by category
    const categorySpending = monthlyTransactions.reduce(
      (acc, transaction) => {
        if (transaction.type === "expense") {
          if (!acc[transaction.category]) {
            acc[transaction.category] = 0;
          }
          acc[transaction.category] += transaction.amount;
        }
        return acc;
      },
      {} as Record<string, number>
    );

    // Get budget categories for comparison
    const categories = await ctx.db
      .query("budgetCategories")
      .withIndex("by_family_active", (q) => 
        q.eq("familyId", args.familyId).eq("isActive", true)
      )
      .collect();

    // Calculate days in month and days remaining
    const daysInMonth = new Date(args.year, args.month + 1, 0).getDate();
    const today = new Date();
    const currentDay = today.getFullYear() === args.year && today.getMonth() === args.month 
      ? today.getDate() 
      : (args.year === today.getFullYear() && args.month < today.getMonth()) ? daysInMonth : 1;
    
    const daysRemaining = Math.max(1, daysInMonth - currentDay + 1);

    // Core budget calculations
    const monthlyIncome = family.monthlyIncome;
    const fixedExpenses = family.fixedExpenses;
    const savingsGoal = family.savingsGoal;
    const variableIncome = monthlyIncome - fixedExpenses - savingsGoal;
    const dailyBudget = variableIncome / daysInMonth;

    const totalSpent = categorySpending.fixed || 0 + categorySpending.variable || 0 + categorySpending.savings || 0;
    const variableSpent = categorySpending.variable || 0;
    const projectedDailyRemaining = Math.max(0, (variableIncome - variableSpent) / daysRemaining);

    return {
      month: args.month,
      year: args.year,
      daysInMonth,
      daysRemaining,
      currentDay,

      // Budget structure
      monthlyIncome,
      fixedExpenses,
      savingsGoal,
      variableIncome,
      dailyBudget,

      // Actual spending
      totalSpent,
      fixedSpent: categorySpending.fixed || 0,
      variableSpent: categorySpending.variable || 0,
      savingsContributed: categorySpending.savings || 0,

      // Remaining calculations
      remainingVariable: variableIncome - variableSpent,
      projectedDailyRemaining,
      
      // Performance indicators
      onTrack: variableSpent <= (variableIncome * (currentDay / daysInMonth)),
      spendingRate: variableSpent / (currentDay || 1),
      
      // Category breakdown
      categories: categories.map(cat => ({
        ...cat,
        actualSpent: categorySpending[cat.type] || 0,
        percentOfBudget: cat.budgetedAmount > 0 
          ? ((categorySpending[cat.type] || 0) / cat.budgetedAmount) * 100 
          : 0,
      })),

      // Transaction counts
      transactionCount: monthlyTransactions.length,
      averageTransaction: monthlyTransactions.length > 0 
        ? totalSpent / monthlyTransactions.length 
        : 0,
    };
  },
});

// Force recalculate daily budgets (for admin/debug)
export const recalculateDailyBudgets = mutation({
  args: {
    familyId: v.id("families"),
    userId: v.string(),
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
        throw new ConvexError("Only family managers can recalculate budgets");
      }

      // Invalidate all daily budget caches for this family
      const dailyBudgets = await ctx.db
        .query("dailyBudgets")
        .withIndex("by_family_calculated", (q) => q.eq("familyId", args.familyId))
        .collect();

      await Promise.all(
        dailyBudgets.map(budget =>
          ctx.db.patch(budget._id, { isValid: false })
        )
      );

      // Log activity
      await ctx.db.insert("familyActivity", {
        familyId: args.familyId,
        userId: args.userId,
        userName: member.name,
        action: "budget_updated",
        description: `${member.name} forced budget recalculation`,
        createdAt: now,
        notificationSent: false,
      });

      return { success: true, invalidatedCaches: dailyBudgets.length };
    } catch (error) {
      await ctx.db.insert("errorLogs", {
        familyId: args.familyId,
        userId: args.userId,
        operation: "recalculateDailyBudgets",
        errorType: "BudgetRecalculationError",
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