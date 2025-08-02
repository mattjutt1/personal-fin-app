"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { TrendingDown, AlertCircle, CheckCircle2 } from "lucide-react";
import { clsx } from "clsx";

interface DailyBudgetHeaderProps {
  familyId: Id<"families">;
  date?: string; // Defaults to today
}

export default function DailyBudgetHeader({ familyId, date }: DailyBudgetHeaderProps) {
  const today = date || new Date().toISOString().split('T')[0];
  
  const dailyBudget = useQuery(api.budgets.calculateDailyBudget, {
    familyId,
    date: today,
  });

  if (!dailyBudget) {
    return (
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-b-3xl shadow-lg animate-pulse">
        <div className="text-center">
          <div className="h-8 bg-white/20 rounded w-48 mx-auto mb-2"></div>
          <div className="h-12 bg-white/20 rounded w-32 mx-auto"></div>
        </div>
      </div>
    );
  }

  // Calculate budget status for color coding
  const spentPercentage = dailyBudget.dailyBudgetAmount > 0 
    ? (dailyBudget.variableSpent / dailyBudget.dailyBudgetAmount) * 100 
    : 0;
  
  const getStatusColor = () => {
    if (spentPercentage <= 75) return "from-green-500 to-emerald-600"; // Green: Good
    if (spentPercentage <= 100) return "from-yellow-500 to-orange-500"; // Yellow: Warning
    return "from-red-500 to-pink-600"; // Red: Over budget
  };

  const getStatusIcon = () => {
    if (spentPercentage <= 75) return <CheckCircle2 className="w-6 h-6" />;
    if (spentPercentage <= 100) return <AlertCircle className="w-6 h-6" />;
    return <TrendingDown className="w-6 h-6" />;
  };

  const getStatusMessage = () => {
    if (spentPercentage <= 75) return "On track!";
    if (spentPercentage <= 100) return "Getting close";
    return "Over budget";
  };

  return (
    <div className={clsx(
      "bg-gradient-to-r text-white p-6 rounded-b-3xl shadow-lg transition-all duration-300",
      getStatusColor()
    )}>
      {/* Header Info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="text-lg font-medium opacity-90">
            {getStatusMessage()}
          </span>
        </div>
        <div className="text-right text-sm opacity-75">
          <div>{dailyBudget.daysRemaining} days left</div>
          <div>this month</div>
        </div>
      </div>

      {/* Available Today - Prominent Display */}
      <div className="text-center mb-6">
        <div className="text-lg font-medium opacity-90 mb-1">Available Today</div>
        <div className="text-5xl font-bold mb-2">
          ${Math.max(0, dailyBudget.remainingBudget).toFixed(0)}
        </div>
        {dailyBudget.remainingBudget < 0 && (
          <div className="text-lg opacity-90">
            ${Math.abs(dailyBudget.remainingBudget).toFixed(2)} over budget
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm opacity-90 mb-1">
          <span>Spent: ${dailyBudget.variableSpent.toFixed(2)}</span>
          <span>Budget: ${dailyBudget.dailyBudgetAmount.toFixed(2)}</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-3">
          <div 
            className={clsx(
              "h-3 rounded-full transition-all duration-300",
              spentPercentage <= 100 ? "bg-white" : "bg-red-300"
            )}
            style={{ 
              width: `${Math.min(100, spentPercentage)}%` 
            }}
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 text-center text-sm">
        <div className="bg-white/10 rounded-lg p-3">
          <div className="text-lg font-semibold">${dailyBudget.fixedSpent.toFixed(0)}</div>
          <div className="opacity-75">Fixed</div>
        </div>
        <div className="bg-white/10 rounded-lg p-3">
          <div className="text-lg font-semibold">${dailyBudget.variableSpent.toFixed(0)}</div>
          <div className="opacity-75">Variable</div>
        </div>
        <div className="bg-white/10 rounded-lg p-3">
          <div className="text-lg font-semibold">${dailyBudget.savingsContributed.toFixed(0)}</div>
          <div className="opacity-75">Savings</div>
        </div>
      </div>

      {/* Monthly Context (Collapsed) */}
      <div className="mt-4 text-center text-sm opacity-75">
        <div>Monthly Income: ${dailyBudget.monthlyIncome.toFixed(0)} | Fixed: ${dailyBudget.fixedExpenses.toFixed(0)} | Savings Goal: ${dailyBudget.savingsGoal.toFixed(0)}</div>
      </div>
    </div>
  );
}