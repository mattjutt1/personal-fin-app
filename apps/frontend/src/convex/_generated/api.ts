/* eslint-disable @typescript-eslint/no-explicit-any */
// Mock Convex API for build compatibility
// This will be replaced by actual generated file when Convex is initialized

export const api = {
  budgets: {
    calculateDailyBudget: "budgets:calculateDailyBudget" as any,
  },
  transactions: {
    createTransaction: "transactions:createTransaction" as any,
    getFamilyTransactions: "transactions:getFamilyTransactions" as any,
    getFamilyTransactionSummary: "transactions:getFamilyTransactionSummary" as any,
  },
  activity: {
    getFamilyActivity: "activity:getFamilyActivity" as any,
  },
  myFunctions: {
    hello: "myFunctions:hello" as any,
    sum: "myFunctions:sum" as any,
  },
};