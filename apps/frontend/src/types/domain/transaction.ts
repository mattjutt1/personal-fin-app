// Transaction Management Slice - Type Definitions
// Atomic Vertical Slice: Self-contained types for transaction management

import { Id } from "../../../convex/_generated/dataModel";
import { TransactionData, TransactionCategory, TransactionType } from "../../shared/types";

// Extend shared types with Convex-specific IDs
export interface Transaction extends Omit<TransactionData, '_id' | 'familyId'> {
  _id: Id<"transactions">;
  familyId: Id<"families">;
}

export interface TransactionCategoryUI {
  id: string;
  name: string;
  icon: string;
  type: TransactionCategory;
  color: string;
  touchTarget: boolean; // For mobile-first design
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
  transactionCount: number;
  categoryBreakdown: Record<string, { income: number; expenses: number; count: number }>;
  averageTransaction: number;
}

export interface TransactionFilters {
  category?: TransactionCategory;
  type?: TransactionType;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

// Daily Budget specific types
export interface DailyBudget {
  date: string;
  dailyBudgetAmount: number;
  totalSpent: number;
  remainingBudget: number;
  fixedSpent: number;
  variableSpent: number;
  savingsContributed: number;
  daysRemaining: number;
  monthlyIncome: number;
  fixedExpenses: number;
  savingsGoal: number;
  isCached?: boolean;
  calculatedAt?: number;
}

// Family Activity for real-time updates
export interface FamilyActivity {
  _id: Id<"familyActivity">;
  familyId: Id<"families">;
  userId: string;
  userName: string;
  action: "transaction_added" | "transaction_updated" | "transaction_deleted";
  targetId: Id<"transactions">;
  description: string;
  metadata: Record<string, any>;
  createdAt: number;
  notificationSent: boolean;
}

// Quick Add Expense Form
export interface QuickExpenseForm {
  amount: string;
  description: string;
  category: TransactionCategory;
}

// Mobile-first UI Props
export interface MobileActionProps {
  onSubmit: (data: QuickExpenseForm) => Promise<void>;
  isLoading: boolean;
  familyId: Id<"families">;
  userId: string;
  userName: string;
}