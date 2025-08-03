// Slice Service Interfaces - API Boundaries Between Slices
// Defines clean contracts for inter-slice communication

import { 
  TransactionData, 
  BudgetCategoryData, 
  DailyBudgetData, 
  ServiceResponse,
  TransactionCategory,
  PaginationOptions 
} from '@/types/shared';

/**
 * Transaction Management Service Interface
 * Exposes transaction operations to other slices without direct database access
 */
export interface ITransactionService {
  // Core transaction operations
  createTransaction(params: {
    familyId: string;
    userId: string;
    userName: string;
    amount: number;
    description: string;
    category: TransactionCategory;
    subcategory?: string;
    type: "income" | "expense";
    date: string;
    clientId?: string;
    syncVersion?: number;
  }): Promise<ServiceResponse<string>>; // Returns transaction ID

  updateTransaction(params: {
    transactionId: string;
    userId: string;
    amount?: number;
    description?: string;
    category?: TransactionCategory;
    subcategory?: string;
    expectedSyncVersion?: number;
  }): Promise<ServiceResponse<{ newSyncVersion: number }>>;

  deleteTransaction(params: {
    transactionId: string;
    userId: string;
  }): Promise<ServiceResponse<boolean>>;

  // Query operations
  getFamilyTransactions(params: {
    familyId: string;
    options?: PaginationOptions & {
      category?: TransactionCategory;
      type?: "income" | "expense";
    };
  }): Promise<ServiceResponse<TransactionData[]>>;

  getDailyTransactions(params: {
    familyId: string;
    date: string;
  }): Promise<ServiceResponse<TransactionData[]>>;

  getTransactionSummary(params: {
    familyId: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ServiceResponse<{
    totalIncome: number;
    totalExpenses: number;
    netAmount: number;
    transactionCount: number;
    categoryBreakdown: Record<string, { income: number; expenses: number; count: number }>;
    averageTransaction: number;
  }>>;
}

/**
 * Budget Tracking Service Interface
 * Exposes budget operations to other slices without direct database access
 */
export interface IBudgetService {
  // Budget category operations
  updateCategorySpending(params: {
    familyId: string;
    category: TransactionCategory;
    amountChange: number;
    userId: string;
  }): Promise<ServiceResponse<BudgetCategoryData>>;

  getCategoryBudget(params: {
    familyId: string;
    category: TransactionCategory;
  }): Promise<ServiceResponse<BudgetCategoryData | null>>;

  getAllCategoryBudgets(params: {
    familyId: string;
  }): Promise<ServiceResponse<BudgetCategoryData[]>>;

  // Daily budget operations
  invalidateDailyBudget(params: {
    familyId: string;
    date: string;
    userId: string;
  }): Promise<ServiceResponse<boolean>>;

  getDailyBudget(params: {
    familyId: string;
    date: string;
  }): Promise<ServiceResponse<DailyBudgetData | null>>;

  calculateDailyBudget(params: {
    familyId: string;
    date: string;
  }): Promise<ServiceResponse<DailyBudgetData>>;
}

/**
 * Family Activity Service Interface
 * Manages family activity feed across all slices
 */
export interface IFamilyActivityService {
  logActivity(params: {
    familyId: string;
    userId: string;
    userName: string;
    action: string;
    targetId: string;
    description: string;
    metadata?: Record<string, any>;
  }): Promise<ServiceResponse<string>>; // Returns activity ID

  getFamilyActivity(params: {
    familyId: string;
    options?: PaginationOptions & {
      since?: number; // Timestamp for incremental updates
    };
  }): Promise<ServiceResponse<any[]>>;

  markNotificationSent(params: {
    activityId: string;
  }): Promise<ServiceResponse<boolean>>;
}

/**
 * Error Logging Service Interface
 * Centralized error logging across all slices
 */
export interface IErrorLogService {
  logError(params: {
    familyId?: string;
    userId: string;
    operation: string;
    errorType: string;
    errorMessage: string;
    context: Record<string, any>;
  }): Promise<ServiceResponse<string>>; // Returns error log ID

  getErrorLogs(params: {
    familyId?: string;
    userId?: string;
    resolved?: boolean;
    options?: PaginationOptions;
  }): Promise<ServiceResponse<any[]>>;

  markErrorResolved(params: {
    errorLogId: string;
  }): Promise<ServiceResponse<boolean>>;
}

/**
 * Service Registry - Central access point for all slice services
 * Implements dependency injection pattern for slice services
 */
export class ServiceRegistry {
  private static instance: ServiceRegistry | null = null;
  private services: Map<string, any> = new Map();

  private constructor() {}

  static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry();
    }
    return ServiceRegistry.instance;
  }

  // Register service implementation
  register<T>(serviceName: string, implementation: T): void {
    this.services.set(serviceName, implementation);
  }

  // Get service implementation
  get<T>(serviceName: string): T {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not registered`);
    }
    return service as T;
  }

  // Type-safe service getters
  getTransactionService(): ITransactionService {
    return this.get<ITransactionService>('TransactionService');
  }

  getBudgetService(): IBudgetService {
    return this.get<IBudgetService>('BudgetService');
  }

  getFamilyActivityService(): IFamilyActivityService {
    return this.get<IFamilyActivityService>('FamilyActivityService');
  }

  getErrorLogService(): IErrorLogService {
    return this.get<IErrorLogService>('ErrorLogService');
  }

  // Clear all services (useful for testing)
  clear(): void {
    this.services.clear();
  }
}

// Export singleton instance
export const serviceRegistry = ServiceRegistry.getInstance();

// Helper functions for common service operations
export const ServiceHelpers = {
  /**
   * Create standardized service response
   */
  createResponse<T>(
    success: boolean,
    data?: T,
    error?: string
  ): ServiceResponse<T> {
    return {
      success,
      data,
      error,
      timestamp: Date.now()
    };
  },

  /**
   * Create success response
   */
  success<T>(data: T): ServiceResponse<T> {
    return ServiceHelpers.createResponse(true, data);
  },

  /**
   * Create error response
   */
  error(message: string): ServiceResponse {
    return ServiceHelpers.createResponse(false, undefined, message);
  }
};