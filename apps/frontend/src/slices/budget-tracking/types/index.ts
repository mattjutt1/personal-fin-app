// Budget Tracking Slice - Type Definitions
// Atomic Vertical Slice: Self-contained types for budget tracking

export interface Budget {
  _id?: string;
  name: string;
  totalAmount: number;
  period: 'weekly' | 'monthly' | 'yearly' | 'custom';
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  categories: BudgetCategory[];
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  allocatedAmount: number;
  spentAmount: number;
  type: 'expense' | 'income';
  color: string;
  icon?: string;
  priority: 'high' | 'medium' | 'low';
  isOverspent: boolean;
  transactions?: string[]; // Transaction IDs
}

export interface BudgetAllocation {
  categoryId: string;
  categoryName: string;
  allocatedAmount: number;
  percentage: number;
  isRequired: boolean;
}

export interface BudgetSummary {
  totalAllocated: number;
  totalSpent: number;
  remainingAmount: number;
  percentageUsed: number;
  categoriesOverBudget: number;
  daysRemaining: number;
  projectedOverspend: number;
}

export interface BudgetAlert {
  id: string;
  budgetId: string;
  categoryId?: string;
  type: 'overspend' | 'approaching_limit' | 'budget_exceeded' | 'no_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  threshold: number;
  currentAmount: number;
  createdAt: string;
  isRead: boolean;
  actionRequired: boolean;
}

export interface BudgetFilters {
  period?: 'weekly' | 'monthly' | 'yearly' | 'custom';
  status?: 'active' | 'completed' | 'overbudget';
  category?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface BudgetTemplate {
  id: string;
  name: string;
  description: string;
  categories: Omit<BudgetCategory, 'id' | 'spentAmount' | 'isOverspent' | 'transactions'>[];
  suggestedPeriod: 'weekly' | 'monthly' | 'yearly';
  tags: string[];
}

export interface BudgetProgress {
  categoryId: string;
  categoryName: string;
  allocated: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
  daysInPeriod: number;
  daysRemaining: number;
  averageDailySpend: number;
  projectedTotal: number;
  isOnTrack: boolean;
  trendDirection: 'up' | 'down' | 'stable';
}

// AI Categorization Integration Types
export interface AIBudgetSuggestion {
  categoryName: string;
  suggestedAmount: number;
  confidence: number;
  reasoning: string;
  historicalData?: {
    averageSpending: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  };
}

export interface BudgetAnalytics {
  budgetId: string;
  accuracy: number; // How accurate the budget predictions were
  varianceData: {
    categoryId: string;
    plannedVsActual: number;
    frequency: number;
  }[];
  recommendations: string[];
  seasonalTrends: {
    month: number;
    averageSpending: number;
  }[];
}

// API Response types for this slice
export interface BudgetApiResponse {
  success: boolean;
  data?: Budget;
  error?: string;
}

export interface BudgetListResponse {
  success: boolean;
  data?: Budget[];
  error?: string;
}

export interface BudgetAlertResponse {
  success: boolean;
  data?: BudgetAlert[];
  error?: string;
}

// Chart Data Types
export interface BudgetChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
}

export interface SpendingTrendData {
  date: string;
  amount: number;
  category: string;
  budget: number;
  isOverBudget: boolean;
}