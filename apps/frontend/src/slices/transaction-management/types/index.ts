// Transaction Management Slice - Type Definitions
// Atomic Vertical Slice: Self-contained types for transaction management

export interface Transaction {
  _id?: string;
  amount: number;
  description: string;
  category: string;
  date: string; // ISO date string
  type: 'income' | 'expense';
  userId?: string;
}

export interface TransactionCategory {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
  transactionCount: number;
}

export interface TransactionFilters {
  category?: string;
  type?: 'income' | 'expense';
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
}

// API Response types for this slice
export interface TransactionApiResponse {
  success: boolean;
  data?: Transaction;
  error?: string;
}

export interface TransactionListResponse {
  success: boolean;
  data?: Transaction[];
  error?: string;
}