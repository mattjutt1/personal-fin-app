// Legacy Family Authentication Functions
// These functions work alongside the new Convex Auth system (auth.config.ts)
// Provides family-specific authentication flows and invitation management
// 
// NOTE: Core authentication is now handled by auth.config.ts and auth-integration.ts
// This file maintains family invitation and management functionality

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// User profile management with family context
export const createUserProfile = mutation({
  args: {
    userId: v.string(), // From auth provider
    email: v.string(),
    name: v.string(),
    profilePicture: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    try {
      // Check if user profile already exists
      const existingMember = await ctx.db
        .query("familyMembers")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .first();

      if (existingMember) {
        // Update existing profile
        await ctx.db.patch(existingMember._id, {
          name: args.name,
          email: args.email,
          lastActiveAt: now,
        });
        
        return { success: true, isNewUser: false, memberId: existingMember._id };
      }

      // For new users, they need to be invited to a family
      // Return user info for family invitation flow
      return { 
        success: true, 
        isNewUser: true, 
        needsFamilyInvitation: true,
        userInfo: {
          userId: args.userId,
          email: args.email,
          name: args.name,
        }
      };
    } catch (error) {
      await ctx.db.insert("errorLogs", {
        userId: args.userId,
        operation: "createUserProfile",
        errorType: "AuthError",
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

// Get user's family context and permissions
export const getUserFamilyContext = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // Get all family memberships for user
    const memberships = await ctx.db
      .query("familyMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    if (memberships.length === 0) {
      return {
        hasFamilies: false,
        needsInvitation: true,
        families: [],
      };
    }

    // Get family details for each membership
    const familyDetails = await Promise.all(
      memberships.map(async (membership) => {
        const family = await ctx.db.get(membership.familyId);
        if (!family || !family.isActive) return null;

        // Get other family members count
        const otherMembers = await ctx.db
          .query("familyMembers")
          .withIndex("by_family_active", (q) => 
            q.eq("familyId", membership.familyId).eq("isActive", true)
          )
          .filter((q) => q.neq(q.field("userId"), args.userId))
          .collect();

        return {
          familyId: family._id,
          familyName: family.name,
          userRole: membership.role,
          joinedAt: membership.joinedAt,
          memberCount: otherMembers.length + 1,
          permissions: {
            canManageBudget: membership.role === "manager",
            canAddTransactions: true,
            canViewReports: true,
            canInviteMembers: membership.role === "manager",
            canManageMembers: membership.role === "manager",
          },
        };
      })
    );

    const validFamilies = familyDetails.filter(Boolean);

    return {
      hasFamilies: validFamilies.length > 0,
      needsInvitation: validFamilies.length === 0,
      families: validFamilies,
      primaryFamily: validFamilies[0], // Use first family as primary
    };
  },
});

// Create family invitation link/code
export const createFamilyInvitation = mutation({
  args: {
    familyId: v.id("families"),
    invitedBy: v.string(),
    inviteeEmail: v.string(),
    role: v.union(v.literal("manager"), v.literal("member")),
    expiresInHours: v.optional(v.number()), // Default 72 hours
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    try {
      // Verify inviter is family manager
      const inviter = await ctx.db
        .query("familyMembers")
        .withIndex("by_user_family", (q) => 
          q.eq("userId", args.invitedBy).eq("familyId", args.familyId)
        )
        .first();

      if (!inviter || !inviter.isActive || inviter.role !== "manager") {
        throw new ConvexError("Only family managers can invite new members");
      }

      // Check if user is already a member
      const existingMember = await ctx.db
        .query("familyMembers")
        .withIndex("by_family", (q) => q.eq("familyId", args.familyId))
        .filter((q) => q.eq(q.field("email"), args.inviteeEmail))
        .first();

      if (existingMember && existingMember.isActive) {
        throw new ConvexError("User is already a member of this family");
      }

      // Generate invitation code (in production, use proper random generation)
      const invitationCode = `fam_${args.familyId}_${Date.now().toString(36)}`;
      const expirationTime = now + ((args.expiresInHours || 72) * 60 * 60 * 1000);

      // For MVP, store invitation in family activity
      // In production, create dedicated invitations table
      await ctx.db.insert("familyActivity", {
        familyId: args.familyId,
        userId: args.invitedBy,
        userName: inviter.name,
        action: "member_joined", // Reusing existing action type
        description: `Invitation sent to ${args.inviteeEmail} by ${inviter.name}`,
        metadata: {
          invitationCode,
          inviteeEmail: args.inviteeEmail,
          role: args.role,
          expiresAt: expirationTime,
          status: "pending",
        },
        createdAt: now,
        notificationSent: false,
      });

      return {
        success: true,
        invitationCode,
        expiresAt: expirationTime,
        inviteLink: `${process.env.APP_URL || "http://localhost:3000"}/invite/${invitationCode}`,
      };
    } catch (error) {
      await ctx.db.insert("errorLogs", {
        familyId: args.familyId,
        userId: args.invitedBy,
        operation: "createFamilyInvitation",
        errorType: "InvitationError",
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

// Accept family invitation
export const acceptFamilyInvitation = mutation({
  args: {
    invitationCode: v.string(),
    userId: v.string(),
    userName: v.string(),
    userEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    try {
      // Find invitation in family activity
      const invitation = await ctx.db
        .query("familyActivity")
        .filter((q) => q.eq(q.field("action"), "member_joined"))
        .filter((q) => q.neq(q.field("metadata"), undefined))
        .collect()
        .then(activities => 
          activities.find(a => 
            a.metadata?.invitationCode === args.invitationCode &&
            a.metadata?.status === "pending"
          )
        );

      if (!invitation) {
        throw new ConvexError("Invalid or expired invitation code");
      }

      // Check expiration
      if (invitation.metadata?.expiresAt && now > invitation.metadata.expiresAt) {
        throw new ConvexError("Invitation has expired");
      }

      // Verify email matches
      if (invitation.metadata?.inviteeEmail !== args.userEmail) {
        throw new ConvexError("Invitation is for a different email address");
      }

      // Check if user is already a member
      const existingMember = await ctx.db
        .query("familyMembers")
        .withIndex("by_user_family", (q) => 
          q.eq("userId", args.userId).eq("familyId", invitation.familyId)
        )
        .first();

      if (existingMember && existingMember.isActive) {
        throw new ConvexError("You are already a member of this family");
      }

      // Add user to family
      const memberRole = invitation.metadata?.role === "manager" ? "manager" : "member";
      const memberId = await ctx.db.insert("familyMembers", {
        familyId: invitation.familyId,
        userId: args.userId,
        name: args.userName,
        email: args.userEmail,
        role: memberRole,
        joinedAt: now,
        lastActiveAt: now,
        isActive: true,
        notificationsEnabled: true,
      });

      // Mark invitation as accepted by updating activity
      await ctx.db.patch(invitation._id, {
        description: `${args.userName} accepted invitation and joined the family`,
        metadata: {
          ...invitation.metadata,
          status: "accepted",
          acceptedAt: now,
          acceptedBy: args.userId,
        },
      });

      // Log successful join activity
      await ctx.db.insert("familyActivity", {
        familyId: invitation.familyId,
        userId: args.userId,
        userName: args.userName,
        action: "member_joined",
        description: `${args.userName} joined the family`,
        createdAt: now,
        notificationSent: false,
      });

      return { success: true, memberId, familyId: invitation.familyId };
    } catch (error) {
      await ctx.db.insert("errorLogs", {
        userId: args.userId,
        operation: "acceptFamilyInvitation",
        errorType: "InvitationAcceptanceError",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        context: {
          invitationCode: args.invitationCode,
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

// Validate invitation code (for UI feedback)
export const validateInvitationCode = query({
  args: { invitationCode: v.string() },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Find invitation
    const invitation = await ctx.db
      .query("familyActivity")
      .filter((q) => q.eq(q.field("action"), "member_joined"))
      .filter((q) => q.neq(q.field("metadata"), undefined))
      .collect()
      .then(activities => 
        activities.find(a => 
          a.metadata?.invitationCode === args.invitationCode
        )
      );

    if (!invitation) {
      return {
        isValid: false,
        error: "Invalid invitation code",
      };
    }

    if (invitation.metadata?.status !== "pending") {
      return {
        isValid: false,
        error: "Invitation has already been used",
      };
    }

    if (invitation.metadata?.expiresAt && now > invitation.metadata.expiresAt) {
      return {
        isValid: false,
        error: "Invitation has expired",
      };
    }

    // Get family details
    const family = await ctx.db.get(invitation.familyId);
    if (!family || !family.isActive) {
      return {
        isValid: false,
        error: "Family is no longer active",
      };
    }

    return {
      isValid: true,
      familyName: family.name,
      invitedBy: invitation.userName,
      role: invitation.metadata?.role || "member",
      expiresAt: invitation.metadata?.expiresAt,
    };
  },
});

// Switch user's active family context
export const switchActiveFamily = mutation({
  args: {
    userId: v.string(),
    familyId: v.id("families"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    try {
      // Verify user is member of this family
      const membership = await ctx.db
        .query("familyMembers")
        .withIndex("by_user_family", (q) => 
          q.eq("userId", args.userId).eq("familyId", args.familyId)
        )
        .first();

      if (!membership || !membership.isActive) {
        throw new ConvexError("User is not a member of this family");
      }

      // Update last active timestamp
      await ctx.db.patch(membership._id, {
        lastActiveAt: now,
      });

      // Return family context
      const family = await ctx.db.get(args.familyId);
      if (!family || !family.isActive) {
        throw new ConvexError("Family is not active");
      }

      return {
        success: true,
        familyContext: {
          familyId: family._id,
          familyName: family.name,
          userRole: membership.role,
          permissions: {
            canManageBudget: membership.role === "manager",
            canAddTransactions: true,
            canViewReports: true,
            canInviteMembers: membership.role === "manager",
            canManageMembers: membership.role === "manager",
          },
        },
      };
    } catch (error) {
      await ctx.db.insert("errorLogs", {
        familyId: args.familyId,
        userId: args.userId,
        operation: "switchActiveFamily",
        errorType: "FamilySwitchError",
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

// Get user permissions for specific family operations
export const getUserPermissions = query({
  args: {
    userId: v.string(),
    familyId: v.id("families"),
  },
  handler: async (ctx, args) => {
    const membership = await ctx.db
      .query("familyMembers")
      .withIndex("by_user_family", (q) => 
        q.eq("userId", args.userId).eq("familyId", args.familyId)
      )
      .first();

    if (!membership || !membership.isActive) {
      return {
        isMember: false,
        permissions: {
          canManageBudget: false,
          canAddTransactions: false,
          canViewReports: false,
          canInviteMembers: false,
          canManageMembers: false,
          canDeleteTransactions: false,
          canViewActivity: false,
        },
      };
    }

    const isManager = membership.role === "manager";

    return {
      isMember: true,
      role: membership.role,
      permissions: {
        canManageBudget: isManager,
        canAddTransactions: true,
        canViewReports: true,
        canInviteMembers: isManager,
        canManageMembers: isManager,
        canDeleteTransactions: true, // Can delete own transactions, managers can delete any
        canViewActivity: true,
        canAccessSettings: isManager,
        canExportData: isManager,
      },
    };
  },
});

// Leave family (self-removal)
export const leaveFamily = mutation({
  args: {
    familyId: v.id("families"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    try {
      const membership = await ctx.db
        .query("familyMembers")
        .withIndex("by_user_family", (q) => 
          q.eq("userId", args.userId).eq("familyId", args.familyId)
        )
        .first();

      if (!membership || !membership.isActive) {
        throw new ConvexError("User is not a member of this family");
      }

      // Check if user is the last manager
      if (membership.role === "manager") {
        const otherManagers = await ctx.db
          .query("familyMembers")
          .withIndex("by_role", (q) => 
            q.eq("familyId", args.familyId).eq("role", "manager")
          )
          .filter((q) => q.neq(q.field("userId"), args.userId))
          .filter((q) => q.eq(q.field("isActive"), true))
          .collect();

        if (otherManagers.length === 0) {
          throw new ConvexError("Cannot leave family as the last manager. Promote another member to manager or delete the family.");
        }
      }

      // Deactivate membership
      await ctx.db.patch(membership._id, {
        isActive: false,
        lastActiveAt: now,
      });

      // Log activity
      await ctx.db.insert("familyActivity", {
        familyId: args.familyId,
        userId: args.userId,
        userName: membership.name,
        action: "member_left",
        description: `${membership.name} left the family`,
        createdAt: now,
        notificationSent: false,
      });

      return { success: true };
    } catch (error) {
      await ctx.db.insert("errorLogs", {
        familyId: args.familyId,
        userId: args.userId,
        operation: "leaveFamily",
        errorType: "FamilyLeaveError",
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