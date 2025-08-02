import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Production-ready Convex schema for Simple Daily Family Budget
// Optimized for <500ms family sync and reliability-first patterns

export default defineSchema({
  // Family management table
  families: defineTable({
    name: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    // Family settings for budget configuration
    monthlyIncome: v.number(),
    fixedExpenses: v.number(),
    savingsGoal: v.number(),
    // Budget period configuration
    budgetStartDate: v.string(), // ISO date string
    // Family preferences
    currency: v.optional(v.string()), // Default USD
    timezone: v.optional(v.string()), // Default UTC
    // Family status for reliability
    isActive: v.boolean(),
  })
    .index("by_creation_time", ["createdAt"])
    .index("by_active_status", ["isActive"]),

  // Family members with role-based access
  familyMembers: defineTable({
    familyId: v.id("families"),
    userId: v.string(), // Auth user ID from Convex Auth
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("manager"), v.literal("member")),
    joinedAt: v.number(),
    lastActiveAt: v.number(),
    // Member status for reliability
    isActive: v.boolean(),
    // Notification preferences
    notificationsEnabled: v.boolean(),
  })
    .index("by_family", ["familyId"])
    .index("by_user", ["userId"])
    .index("by_family_active", ["familyId", "isActive"])
    .index("by_user_family", ["userId", "familyId"])
    .index("by_role", ["familyId", "role"]),

  // Transactions optimized for real-time family sync
  transactions: defineTable({
    familyId: v.id("families"),
    userId: v.string(), // Who created the transaction
    userName: v.string(), // For quick display without joins
    // Transaction details
    amount: v.number(),
    description: v.string(),
    category: v.union(v.literal("fixed"), v.literal("variable"), v.literal("savings")),
    subcategory: v.optional(v.string()), // "groceries", "gas", "family fun"
    type: v.union(v.literal("income"), v.literal("expense")),
    // Temporal data for daily budget calculations
    date: v.string(), // ISO date string (YYYY-MM-DD)
    createdAt: v.number(),
    updatedAt: v.number(),
    // Family sync optimization
    syncVersion: v.number(), // For optimistic updates
    // Transaction status for reliability
    status: v.union(v.literal("confirmed"), v.literal("pending"), v.literal("failed")),
    retryCount: v.optional(v.number()),
  })
    .index("by_family", ["familyId"])
    .index("by_family_date", ["familyId", "date"])
    .index("by_family_category", ["familyId", "category"])
    .index("by_family_type", ["familyId", "type"])
    .index("by_family_user", ["familyId", "userId"])
    .index("by_family_status", ["familyId", "status"])
    .index("by_family_created", ["familyId", "createdAt"])
    .index("by_sync_version", ["familyId", "syncVersion"])
    // Compound index for daily budget queries (<200ms target)
    .index("by_family_date_category", ["familyId", "date", "category"])
    .index("by_family_date_type", ["familyId", "date", "type"]),

  // Budget categories with family-specific configuration
  budgetCategories: defineTable({
    familyId: v.id("families"),
    name: v.string(),
    type: v.union(v.literal("fixed"), v.literal("variable"), v.literal("savings")),
    budgetedAmount: v.number(),
    currentSpent: v.number(),
    // Category configuration
    isDefault: v.boolean(), // System defaults like "groceries", "gas"
    color: v.optional(v.string()), // Hex color for UI
    icon: v.optional(v.string()), // Icon identifier
    // Temporal tracking
    createdAt: v.number(),
    updatedAt: v.number(),
    isActive: v.boolean(),
  })
    .index("by_family", ["familyId"])
    .index("by_family_type", ["familyId", "type"])
    .index("by_family_active", ["familyId", "isActive"])
    .index("by_default", ["isDefault"]),

  // Daily budget snapshots for performance optimization
  dailyBudgets: defineTable({
    familyId: v.id("families"),
    date: v.string(), // ISO date string (YYYY-MM-DD)
    // Calculated daily budget amounts
    dailyBudgetAmount: v.number(), // (Income - Fixed - Savings) / Days remaining
    totalSpent: v.number(),
    remainingBudget: v.number(),
    // Breakdown by category
    fixedSpent: v.number(),
    variableSpent: v.number(),
    savingsContributed: v.number(),
    // Performance metadata
    calculatedAt: v.number(),
    lastTransactionId: v.optional(v.id("transactions")), // For cache invalidation
    // Status for reliability
    isValid: v.boolean(), // False if needs recalculation
  })
    .index("by_family_date", ["familyId", "date"])
    .index("by_family_calculated", ["familyId", "calculatedAt"])
    .index("by_validity", ["familyId", "isValid"]),

  // Real-time family activity feed
  familyActivity: defineTable({
    familyId: v.id("families"),
    userId: v.string(),
    userName: v.string(),
    // Activity details
    action: v.union(
      v.literal("transaction_added"),
      v.literal("transaction_updated"),
      v.literal("transaction_deleted"),
      v.literal("budget_updated"),
      v.literal("member_joined"),
      v.literal("member_left")
    ),
    targetId: v.optional(v.string()), // ID of affected resource
    description: v.string(), // Human-readable activity
    metadata: v.optional(v.object({
      amount: v.optional(v.number()),
      category: v.optional(v.string()),
      oldValue: v.optional(v.any()),
      newValue: v.optional(v.any()),
    })),
    // Temporal data
    createdAt: v.number(),
    // Notification status
    notificationSent: v.boolean(),
  })
    .index("by_family_time", ["familyId", "createdAt"])
    .index("by_family_action", ["familyId", "action"])
    .index("by_notification_status", ["familyId", "notificationSent"]),

  // Family sync state for optimistic updates
  syncState: defineTable({
    familyId: v.id("families"),
    resourceType: v.union(v.literal("transaction"), v.literal("budget"), v.literal("category")),
    resourceId: v.string(),
    version: v.number(),
    // Sync metadata
    lastSyncAt: v.number(),
    syncedBy: v.string(), // userId
    // Conflict resolution
    conflictCount: v.number(),
    hasConflict: v.boolean(),
  })
    .index("by_family_resource", ["familyId", "resourceType"])
    .index("by_resource_id", ["resourceId"])
    .index("by_family_version", ["familyId", "version"])
    .index("by_conflicts", ["familyId", "hasConflict"]),

  // Error tracking and recovery
  errorLogs: defineTable({
    familyId: v.optional(v.id("families")),
    userId: v.optional(v.string()),
    operation: v.string(),
    errorType: v.string(),
    errorMessage: v.string(),
    stackTrace: v.optional(v.string()),
    // Context for debugging
    context: v.object({
      userAgent: v.optional(v.string()),
      url: v.optional(v.string()),
      timestamp: v.number(),
      retryAttempt: v.optional(v.number()),
    }),
    // Recovery status
    resolved: v.boolean(),
    resolvedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_family_time", ["familyId", "createdAt"])
    .index("by_operation", ["operation"])
    .index("by_error_type", ["errorType"])
    .index("by_resolved", ["resolved"]),

  // SUBSCRIPTION TABLES - Premium tier management and billing

  // User subscription status and billing
  users: defineTable({
    email: v.string(),
    name: v.string(),
    // Subscription fields
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
    subscriptionEndDate: v.optional(v.number()), // Unix timestamp
    // Feature access flags
    hasAccessToBankIntegration: v.boolean(),
    hasAccessToUnlimitedFamilies: v.boolean(),
    hasAccessToPredictiveAlerts: v.boolean(),
    hasAccessToAdvancedAnalytics: v.boolean(),
    // Trial tracking
    trialEndDate: v.optional(v.number()),
    hasUsedTrial: v.boolean(),
    // Tracking
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_stripe_customer", ["stripeCustomerId"])
    .index("by_subscription_status", ["subscriptionStatus"]),

  // Subscription events for analytics
  subscriptionEvents: defineTable({
    userId: v.id("users"),
    eventType: v.union(
      v.literal("trial_started"),
      v.literal("trial_ended"),
      v.literal("subscription_created"),
      v.literal("subscription_updated"),
      v.literal("subscription_canceled"),
      v.literal("payment_succeeded"),
      v.literal("payment_failed")
    ),
    subscriptionTier: v.optional(v.string()),
    amount: v.optional(v.number()),
    currency: v.optional(v.string()),
    metadata: v.optional(v.object({
      stripeEventId: v.optional(v.string()),
      reason: v.optional(v.string()),
      previousTier: v.optional(v.string()),
    })),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_event_type", ["eventType"])
    .index("by_created", ["createdAt"]),

  // SECURITY TABLES - Bank-grade security monitoring and audit trails

  // Secure family invitations with cryptographic tokens
  familyInvitations: defineTable({
    familyId: v.id("families"),
    invitationToken: v.string(), // Cryptographically secure token
    invitedBy: v.string(), // User ID of inviter
    inviteeEmail: v.string(),
    role: v.union(v.literal("manager"), v.literal("member")),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("expired"), v.literal("revoked")),
    // Security metadata
    createdAt: v.number(),
    expiresAt: v.number(),
    acceptedAt: v.optional(v.number()),
    maxUseCount: v.number(), // Usually 1 for security
    currentUseCount: v.number(),
    // Enhanced security controls
    securityFlags: v.object({
      requiresEmailVerification: v.boolean(),
      requiresDeviceVerification: v.boolean(),
      allowedDomains: v.array(v.string()), // For enterprise deployments
    }),
    // Immutable audit trail
    auditTrail: v.array(v.object({
      action: v.string(),
      timestamp: v.number(),
      userId: v.string(),
      metadata: v.optional(v.any()),
    })),
  })
    .index("by_token", ["invitationToken"])
    .index("by_family", ["familyId"])
    .index("by_status", ["status"])
    .index("by_invitee", ["inviteeEmail"])
    .index("by_expiration", ["expiresAt"]),

  // Security events and monitoring
  securityEvents: defineTable({
    eventType: v.string(), // UNAUTHORIZED_ACCESS, ANOMALOUS_ACTIVITY, etc.
    severity: v.union(v.literal("INFO"), v.literal("MEDIUM"), v.literal("HIGH"), v.literal("CRITICAL")),
    userId: v.optional(v.string()),
    familyId: v.optional(v.id("families")),
    operation: v.optional(v.string()),
    userRole: v.optional(v.string()),
    resourceType: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    // Security context metadata
    metadata: v.object({
      timestamp: v.number(),
      userAgent: v.optional(v.string()),
      ipAddress: v.optional(v.string()),
      deviceFingerprint: v.optional(v.string()),
      sessionId: v.optional(v.string()),
      requestId: v.optional(v.string()),
    }),
    // Investigation status
    resolved: v.boolean(),
    resolvedAt: v.optional(v.number()),
    resolvedBy: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_severity", ["severity"])
    .index("by_event_type", ["eventType"])
    .index("by_family_time", ["familyId", "createdAt"])
    .index("by_user_time", ["userId", "createdAt"])
    .index("by_resolved", ["resolved"])
    .index("by_severity_time", ["severity", "createdAt"]),

  // Invitation attempt tracking for security monitoring
  invitationAttempts: defineTable({
    invitationToken: v.string(),
    attemptedEmail: v.string(),
    result: v.union(
      v.literal("VALID"),
      v.literal("TOKEN_NOT_FOUND"),
      v.literal("ALREADY_USED"),
      v.literal("EXPIRED"),
      v.literal("EMAIL_MISMATCH"),
      v.literal("VALIDATION_ERROR")
    ),
    timestamp: v.number(),
    errorMessage: v.optional(v.string()),
    // Security metadata for analysis
    metadata: v.object({
      expectedEmail: v.optional(v.string()),
      userAgent: v.optional(v.string()),
      ipAddress: v.optional(v.string()),
      deviceFingerprint: v.optional(v.string()),
    }),
  })
    .index("by_token", ["invitationToken"])
    .index("by_result", ["result"])
    .index("by_time", ["timestamp"])
    .index("by_email", ["attemptedEmail"]),

  // Security anomaly detection
  securityAnomalies: defineTable({
    userId: v.string(),
    familyId: v.id("families"),
    activityType: v.string(),
    // Detected anomalies
    anomalies: v.array(v.object({
      type: v.string(),
      severity: v.union(v.literal("LOW"), v.literal("MEDIUM"), v.literal("HIGH"), v.literal("CRITICAL")),
      details: v.string(),
      confidence: v.optional(v.number()), // 0.0 - 1.0
      metadata: v.optional(v.any()),
    })),
    severity: v.union(v.literal("LOW"), v.literal("MEDIUM"), v.literal("HIGH"), v.literal("CRITICAL")),
    detectedAt: v.number(),
    // Investigation workflow
    investigated: v.boolean(),
    investigatedAt: v.optional(v.number()),
    investigatedBy: v.optional(v.string()),
    resolution: v.optional(v.string()),
    falsePositive: v.optional(v.boolean()),
  })
    .index("by_family_severity", ["familyId", "severity"])
    .index("by_user_time", ["userId", "detectedAt"])
    .index("by_investigated", ["investigated"])
    .index("by_severity_time", ["severity", "detectedAt"]),

  // Comprehensive audit trail for compliance
  auditTrail: defineTable({
    // Event identification
    eventId: v.string(), // Unique event identifier
    eventType: v.string(), // DATA_ACCESS, DATA_MODIFICATION, USER_ACTION, etc.
    userId: v.string(),
    familyId: v.optional(v.id("families")),
    
    // Resource information
    resourceType: v.string(), // transaction, budget, family, etc.
    resourceId: v.string(),
    
    // Action details
    action: v.string(), // CREATE, READ, UPDATE, DELETE, EXPORT, etc.
    previousValue: v.optional(v.any()), // For data modifications
    newValue: v.optional(v.any()),
    
    // Context and metadata
    timestamp: v.number(),
    sessionId: v.optional(v.string()),
    requestId: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    
    // Compliance metadata
    dataClassification: v.optional(v.string()), // PII, FINANCIAL, PUBLIC, etc.
    complianceRelevant: v.boolean(),
    retentionRequired: v.boolean(),
    
    // Integrity verification
    checksum: v.optional(v.string()), // For tamper detection
    signature: v.optional(v.string()), // Cryptographic signature
  })
    .index("by_user_time", ["userId", "timestamp"])
    .index("by_family_time", ["familyId", "timestamp"])
    .index("by_resource", ["resourceType", "resourceId"])
    .index("by_event_type", ["eventType"])
    .index("by_compliance", ["complianceRelevant"])
    .index("by_data_classification", ["dataClassification"]),

  // Data encryption metadata for field-level encryption
  encryptionMetadata: defineTable({
    // Resource identification
    resourceType: v.string(), // transaction, budget, etc.
    resourceId: v.string(),
    fieldName: v.string(), // amount, income, etc.
    
    // Encryption details
    encryptionAlgorithm: v.string(), // AES-256-GCM
    keyVersion: v.number(),
    encryptedAt: v.number(),
    encryptedBy: v.string(), // User ID
    
    // Key management
    keyId: v.string(), // Reference to encryption key
    familyId: v.id("families"), // For family-specific key derivation
    
    // Integrity and verification
    checksum: v.string(),
    lastVerified: v.optional(v.number()),
    
    // Metadata
    createdAt: v.number(),
    isActive: v.boolean(),
  })
    .index("by_resource", ["resourceType", "resourceId"])
    .index("by_family", ["familyId"])
    .index("by_key_version", ["keyVersion"])
    .index("by_encrypted_time", ["encryptedAt"]),

  // Session security tracking
  securitySessions: defineTable({
    userId: v.string(),
    sessionId: v.string(),
    familyId: v.optional(v.id("families")),
    
    // Session metadata
    createdAt: v.number(),
    lastActivityAt: v.number(),
    expiresAt: v.number(),
    
    // Device and location
    deviceFingerprint: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    location: v.optional(v.object({
      country: v.optional(v.string()),
      region: v.optional(v.string()),
      city: v.optional(v.string()),
    })),
    
    // Security flags
    suspicious: v.boolean(),
    verified: v.boolean(),
    mfaCompleted: v.boolean(),
    
    // Status
    isActive: v.boolean(),
    terminatedAt: v.optional(v.number()),
    terminationReason: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_session", ["sessionId"])
    .index("by_activity", ["lastActivityAt"])
    .index("by_suspicious", ["suspicious"])
    .index("by_active", ["isActive"]),
});