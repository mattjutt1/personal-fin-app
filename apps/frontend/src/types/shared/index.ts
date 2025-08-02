// Shared Types - Eliminates Cross-Slice Import Dependencies
// Central type definitions used across multiple slices

// Base types for all slices
export interface BaseEntity {
  _id: string;
  createdAt: number;
  updatedAt: number;
}

// Family and User Types
export interface FamilyId {
  familyId: string;
}

export interface UserContext {
  userId: string;
  userName: string;
}

// Transaction Types (shared across transaction-management and budget-tracking)
export type TransactionCategory = "fixed" | "variable" | "savings";
export type TransactionType = "income" | "expense";

export interface TransactionData extends BaseEntity, FamilyId, UserContext {
  amount: number;
  description: string;
  category: TransactionCategory;
  subcategory?: string;
  type: TransactionType;
  date: string; // ISO date string
  status: "pending" | "confirmed" | "failed";
  syncVersion: number;
  retryCount: number;
}

// Budget Types (shared across budget-tracking and transaction-management)
export interface BudgetCategoryData extends BaseEntity, FamilyId {
  name: string;
  type: TransactionCategory;
  budgetAmount: number;
  currentSpent: number;
  isActive: boolean;
  sortOrder: number;
}

export interface DailyBudgetData extends BaseEntity, FamilyId {
  date: string;
  dailyBudgetAmount: number;
  totalSpent: number;
  remainingBudget: number;
  isValid: boolean; // Cache invalidation flag
  calculatedAt: number;
}

// Family Activity Types (shared across all slices)
export interface FamilyActivityData extends BaseEntity, FamilyId, UserContext {
  action: "transaction_added" | "transaction_updated" | "transaction_deleted" | "budget_updated" | "goal_created";
  targetId: string;
  description: string;
  metadata: Record<string, unknown>;
  notificationSent: boolean;
}

// Sync State Types (shared across all slices)
export interface SyncStateData extends BaseEntity, FamilyId {
  resourceType: "transaction" | "budget" | "goal";
  resourceId: string;
  version: number;
  lastSyncAt: number;
  syncedBy: string;
  conflictCount: number;
  hasConflict: boolean;
}

// Event Types for Inter-Slice Communication
export interface SliceEvent<T = unknown> {
  type: string;
  familyId: string;
  userId: string;
  timestamp: number;
  data: T;
}

// Transaction Events
export interface TransactionCreatedEvent extends SliceEvent<TransactionData> {
  type: "transaction.created";
}

export interface TransactionUpdatedEvent extends SliceEvent<{
  transactionId: string;
  oldAmount: number;
  newAmount: number;
  oldCategory: TransactionCategory;
  newCategory: TransactionCategory;
}> {
  type: "transaction.updated";
}

export interface TransactionDeletedEvent extends SliceEvent<{
  transactionId: string;
  amount: number;
  category: TransactionCategory;
}> {
  type: "transaction.deleted";
}

// Budget Events
export interface BudgetUpdatedEvent extends SliceEvent<{
  categoryId: string;
  category: TransactionCategory;
  oldSpent: number;
  newSpent: number;
}> {
  type: "budget.updated";
}

export interface DailyBudgetInvalidatedEvent extends SliceEvent<{
  date: string;
}> {
  type: "dailyBudget.invalidated";
}

// Union of all events
export type SliceEventType = 
  | TransactionCreatedEvent
  | TransactionUpdatedEvent
  | TransactionDeletedEvent
  | BudgetUpdatedEvent
  | DailyBudgetInvalidatedEvent;

// Service Interface Types
export interface ServiceResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

export interface PaginationOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
}

// Performance and Error Types
export interface PerformanceMetrics {
  operationTime: number;
  cacheHit: boolean;
  queryCount: number;
}

export interface ErrorContext {
  operation: string;
  userId: string;
  familyId?: string;
  timestamp: number;
  retryAttempt: number;
}