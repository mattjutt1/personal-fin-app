// Family Management - Production-ready mutations with reliability patterns
// Optimized for <500ms family sync and concurrent family member operations

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// Create a new family with default budget setup
export const createFamily = mutation({
  args: {
    name: v.string(),
    monthlyIncome: v.number(),
    fixedExpenses: v.number(),
    savingsGoal: v.number(),
    budgetStartDate: v.string(),
    currency: v.optional(v.string()),
    timezone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    try {
      // Create family record
      const familyId = await ctx.db.insert("families", {
        name: args.name,
        createdAt: now,
        updatedAt: now,
        monthlyIncome: args.monthlyIncome,
        fixedExpenses: args.fixedExpenses,
        savingsGoal: args.savingsGoal,
        budgetStartDate: args.budgetStartDate,
        currency: args.currency || "USD",
        timezone: args.timezone || "UTC",
        isActive: true,
      });

      // Create default budget categories
      const defaultCategories = [
        { name: "Housing", type: "fixed" as const, budgetedAmount: 0 },
        { name: "Utilities", type: "fixed" as const, budgetedAmount: 0 },
        { name: "Insurance", type: "fixed" as const, budgetedAmount: 0 },
        { name: "Groceries", type: "variable" as const, budgetedAmount: 0 },
        { name: "Gas", type: "variable" as const, budgetedAmount: 0 },
        { name: "Family Fun", type: "variable" as const, budgetedAmount: 0 },
        { name: "Emergency Fund", type: "savings" as const, budgetedAmount: args.savingsGoal },
      ];

      // Insert default categories concurrently for performance
      await Promise.all(
        defaultCategories.map(category =>
          ctx.db.insert("budgetCategories", {
            familyId,
            name: category.name,
            type: category.type,
            budgetedAmount: category.budgetedAmount,
            currentSpent: 0,
            isDefault: true,
            createdAt: now,
            updatedAt: now,
            isActive: true,
          })
        )
      );

      // Log family creation activity
      await ctx.db.insert("familyActivity", {
        familyId,
        userId: "system",
        userName: "System",
        action: "budget_updated",
        description: `Family "${args.name}" created with budget setup`,
        createdAt: now,
        notificationSent: false,
      });

      return familyId;
    } catch (error) {
      // Log error for debugging
      await ctx.db.insert("errorLogs", {
        operation: "createFamily",
        errorType: "FamilyCreationError",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        context: {
          timestamp: now,
          retryAttempt: 0,
        },
        resolved: false,
        createdAt: now,
      });
      
      throw new ConvexError(`Failed to create family: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  },
});

// Add family member with role-based access
export const addFamilyMember = mutation({
  args: {
    familyId: v.id("families"),
    userId: v.string(),
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("manager"), v.literal("member")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    try {
      // Check if user is already a member
      const existingMember = await ctx.db
        .query("familyMembers")
        .withIndex("by_user_family", (q) => 
          q.eq("userId", args.userId).eq("familyId", args.familyId)
        )
        .first();

      if (existingMember) {
        if (existingMember.isActive) {
          throw new ConvexError("User is already a member of this family");
        }
        
        // Reactivate existing member
        await ctx.db.patch(existingMember._id, {
          isActive: true,
          role: args.role,
          lastActiveAt: now,
        });
        
        return existingMember._id;
      }

      // Add new family member
      const memberId = await ctx.db.insert("familyMembers", {
        familyId: args.familyId,
        userId: args.userId,
        name: args.name,
        email: args.email,
        role: args.role,
        joinedAt: now,
        lastActiveAt: now,
        isActive: true,
        notificationsEnabled: true,
      });

      // Log member addition activity
      await ctx.db.insert("familyActivity", {
        familyId: args.familyId,
        userId: args.userId,
        userName: args.name,
        action: "member_joined",
        description: `${args.name} joined the family as ${args.role}`,
        createdAt: now,
        notificationSent: false,
      });

      return memberId;
    } catch (error) {
      // Log error for debugging
      await ctx.db.insert("errorLogs", {
        familyId: args.familyId,
        userId: args.userId,
        operation: "addFamilyMember",
        errorType: "MemberAdditionError",
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

// Update family budget settings with concurrent access handling
export const updateFamilyBudget = mutation({
  args: {
    familyId: v.id("families"),
    userId: v.string(),
    monthlyIncome: v.optional(v.number()),
    fixedExpenses: v.optional(v.number()),
    savingsGoal: v.optional(v.number()),
    budgetStartDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    try {
      // Verify user is a family manager
      const member = await ctx.db
        .query("familyMembers")
        .withIndex("by_user_family", (q) => 
          q.eq("userId", args.userId).eq("familyId", args.familyId)
        )
        .first();

      if (!member || !member.isActive || member.role !== "manager") {
        throw new ConvexError("Only family managers can update budget settings");
      }

      // Get current family data for change tracking
      const family = await ctx.db.get(args.familyId);
      if (!family) {
        throw new ConvexError("Family not found");
      }

      // Build update object with only provided fields
      const updates: any = { updatedAt: now };
      const changes: any = {};

      if (args.monthlyIncome !== undefined) {
        updates.monthlyIncome = args.monthlyIncome;
        changes.monthlyIncome = { old: family.monthlyIncome, new: args.monthlyIncome };
      }
      if (args.fixedExpenses !== undefined) {
        updates.fixedExpenses = args.fixedExpenses;
        changes.fixedExpenses = { old: family.fixedExpenses, new: args.fixedExpenses };
      }
      if (args.savingsGoal !== undefined) {
        updates.savingsGoal = args.savingsGoal;
        changes.savingsGoal = { old: family.savingsGoal, new: args.savingsGoal };
      }
      if (args.budgetStartDate !== undefined) {
        updates.budgetStartDate = args.budgetStartDate;
        changes.budgetStartDate = { old: family.budgetStartDate, new: args.budgetStartDate };
      }

      // Update family record
      await ctx.db.patch(args.familyId, updates);

      // Invalidate daily budget cache when budget settings change
      const dailyBudgets = await ctx.db
        .query("dailyBudgets")
        .withIndex("by_family_calculated", (q) => q.eq("familyId", args.familyId))
        .collect();

      await Promise.all(
        dailyBudgets.map(budget =>
          ctx.db.patch(budget._id, { isValid: false })
        )
      );

      // Log budget update activity
      await ctx.db.insert("familyActivity", {
        familyId: args.familyId,
        userId: args.userId,
        userName: member.name,
        action: "budget_updated",
        description: `Budget settings updated`,
        metadata: changes,
        createdAt: now,
        notificationSent: false,
      });

      return { success: true, changes };
    } catch (error) {
      // Log error for debugging
      await ctx.db.insert("errorLogs", {
        familyId: args.familyId,
        userId: args.userId,
        operation: "updateFamilyBudget",
        errorType: "BudgetUpdateError",
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

// Get family details with member information
export const getFamilyDetails = query({
  args: { familyId: v.id("families") },
  handler: async (ctx, args) => {
    // Get family data
    const family = await ctx.db.get(args.familyId);
    if (!family || !family.isActive) {
      return null;
    }

    // Get active family members
    const members = await ctx.db
      .query("familyMembers")
      .withIndex("by_family_active", (q) => 
        q.eq("familyId", args.familyId).eq("isActive", true)
      )
      .collect();

    // Get budget categories
    const categories = await ctx.db
      .query("budgetCategories")
      .withIndex("by_family_active", (q) => 
        q.eq("familyId", args.familyId).eq("isActive", true)
      )
      .collect();

    return {
      ...family,
      members,
      categories,
      memberCount: members.length,
      managerCount: members.filter(m => m.role === "manager").length,
    };
  },
});

// Get user's families
export const getUserFamilies = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("familyMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Get family details concurrently for performance
    const families = await Promise.all(
      memberships.map(async (membership) => {
        const family = await ctx.db.get(membership.familyId);
        if (!family || !family.isActive) return null;
        
        return {
          ...family,
          userRole: membership.role,
          joinedAt: membership.joinedAt,
        };
      })
    );

    return families.filter(Boolean);
  },
});

// Remove family member with cleanup
export const removeFamilyMember = mutation({
  args: {
    familyId: v.id("families"),
    targetUserId: v.string(),
    removedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    try {
      // Verify the remover is a family manager
      const remover = await ctx.db
        .query("familyMembers")
        .withIndex("by_user_family", (q) => 
          q.eq("userId", args.removedBy).eq("familyId", args.familyId)
        )
        .first();

      if (!remover || !remover.isActive || remover.role !== "manager") {
        throw new ConvexError("Only family managers can remove members");
      }

      // Find target member
      const targetMember = await ctx.db
        .query("familyMembers")
        .withIndex("by_user_family", (q) => 
          q.eq("userId", args.targetUserId).eq("familyId", args.familyId)
        )
        .first();

      if (!targetMember || !targetMember.isActive) {
        throw new ConvexError("Member not found or already inactive");
      }

      // Deactivate member instead of deleting for audit trail
      await ctx.db.patch(targetMember._id, {
        isActive: false,
        lastActiveAt: now,
      });

      // Log member removal activity
      await ctx.db.insert("familyActivity", {
        familyId: args.familyId,
        userId: args.removedBy,
        userName: remover.name,
        action: "member_left",
        description: `${targetMember.name} was removed from the family`,
        createdAt: now,
        notificationSent: false,
      });

      return { success: true };
    } catch (error) {
      // Log error for debugging
      await ctx.db.insert("errorLogs", {
        familyId: args.familyId,
        userId: args.removedBy,
        operation: "removeFamilyMember",
        errorType: "MemberRemovalError",
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

// Update member last active timestamp for presence tracking
export const updateMemberActivity = mutation({
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