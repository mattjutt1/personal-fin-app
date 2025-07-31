// Transaction Management Slice - Convex Data Layer
// Atomic Vertical Slice: Self-contained data operations for transactions

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new transaction
export const createTransaction = mutation({
  args: {
    amount: v.number(),
    description: v.string(),
    category: v.string(),
    date: v.string(),
    type: v.union(v.literal("income"), v.literal("expense")),
  },
  handler: async (ctx, args) => {
    const transactionId = await ctx.db.insert("transactions", {
      amount: args.amount,
      description: args.description,
      category: args.category,
      date: args.date,
      type: args.type,
    });
    return transactionId;
  },
});

// Get all transactions
export const getTransactions = query({
  handler: async (ctx) => {
    return await ctx.db.query("transactions").order("desc").collect();
  },
});

// Get transactions by type
export const getTransactionsByType = query({
  args: { type: v.union(v.literal("income"), v.literal("expense")) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("transactions")
      .filter(q => q.eq(q.field("type"), args.type))
      .order("desc")
      .collect();
  },
});

// Get transactions by category
export const getTransactionsByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("transactions")
      .filter(q => q.eq(q.field("category"), args.category))
      .order("desc")
      .collect();
  },
});

// Delete a transaction
export const deleteTransaction = mutation({
  args: { id: v.id("transactions") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Get transaction summary
export const getTransactionSummary = query({
  handler: async (ctx) => {
    const transactions = await ctx.db.query("transactions").collect();
    
    const summary = transactions.reduce(
      (acc, transaction) => {
        if (transaction.type === "income") {
          acc.totalIncome += transaction.amount;
        } else {
          acc.totalExpenses += transaction.amount;
        }
        acc.transactionCount += 1;
        return acc;
      },
      { totalIncome: 0, totalExpenses: 0, transactionCount: 0 }
    );

    return {
      ...summary,
      netAmount: summary.totalIncome - summary.totalExpenses,
    };
  },
});