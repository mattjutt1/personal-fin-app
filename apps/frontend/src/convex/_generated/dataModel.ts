// Mock Convex DataModel for build compatibility
// This will be replaced by actual generated file when Convex is initialized

export interface DataModel {
  families: {
    document: {
      _id: Id<"families">;
      name: string;
      isActive: boolean;
      monthlyIncome: number;
      fixedExpenses: number;
      savingsGoal: number;
      budgetStartDate: string;
      createdAt: number;
      updatedAt: number;
    };
    fieldPaths: "name" | "isActive" | "monthlyIncome" | "fixedExpenses" | "savingsGoal" | "budgetStartDate" | "createdAt" | "updatedAt";
    indexes: {};
    searchIndexes: {};
    vectorIndexes: {};
  };
  
  transactions: {
    document: {
      _id: Id<"transactions">;
      familyId: Id<"families">;
      userId: string;
      userName: string;
      amount: number;
      description: string;
      category: "fixed" | "variable" | "savings";
      subcategory?: string;
      type: "income" | "expense";
      date: string;
      createdAt: number;
      updatedAt: number;
      syncVersion: number;
      status: "confirmed" | "pending" | "failed";
      retryCount: number;
    };
    fieldPaths: "familyId" | "userId" | "userName" | "amount" | "description" | "category" | "subcategory" | "type" | "date" | "createdAt" | "updatedAt" | "syncVersion" | "status" | "retryCount";
    indexes: {};
    searchIndexes: {};
    vectorIndexes: {};
  };

  familyActivity: {
    document: {
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
    };
    fieldPaths: "familyId" | "userId" | "userName" | "action" | "targetId" | "description" | "metadata" | "createdAt" | "notificationSent";
    indexes: {};
    searchIndexes: {};
    vectorIndexes: {};
  };
}

export type Id<TableName extends keyof DataModel> = string & { __tableName: TableName };

export declare const dataModel: DataModel;