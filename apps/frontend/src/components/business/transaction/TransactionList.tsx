"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Transaction } from "@/types";
import { TRANSACTION_CATEGORIES } from "./CategoryTiles";
import { formatDistanceToNow } from "date-fns";
import { User, Clock, TrendingUp, TrendingDown } from "lucide-react";
import { clsx } from "clsx";

interface TransactionListProps {
  familyId: Id<"families">;
  limit?: number;
  showDate?: boolean;
  className?: string;
}

function TransactionItem({ transaction }: { transaction: Transaction }) {
  const category = TRANSACTION_CATEGORIES.find(cat => cat.type === transaction.category);
  const isExpense = transaction.type === "expense";
  
  // Format relative time
  const timeAgo = formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true });

  return (
    <div className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
      {/* Category Icon */}
      <div className={clsx(
        "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xl",
        category?.color || "bg-gray-100"
      )}>
        {category?.icon || "💰"}
      </div>
      
      {/* Transaction Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {transaction.description}
          </h3>
          <div className={clsx(
            "text-lg font-bold",
            isExpense ? "text-red-600" : "text-green-600"
          )}>
            {isExpense ? "-" : "+"}${transaction.amount.toFixed(2)}
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <User className="w-3 h-3" />
            <span>{transaction.userName}</span>
            <span>•</span>
            <span className="capitalize">{transaction.category}</span>
          </div>
          
          <div className="flex items-center space-x-1 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            <span>{timeAgo}</span>
          </div>
        </div>
      </div>
      
      {/* Type Indicator */}
      <div className="flex-shrink-0">
        {isExpense ? (
          <TrendingDown className="w-4 h-4 text-red-500" />
        ) : (
          <TrendingUp className="w-4 h-4 text-green-500" />
        )}
      </div>
    </div>
  );
}

export default function TransactionList({ 
  familyId, 
  limit = 10, 
  showDate = true,
  className 
}: TransactionListProps) {
  const transactions = useQuery(api.transactions.getFamilyTransactions, {
    familyId,
    limit,
  });

  if (transactions === undefined) {
    return (
      <div className={clsx("space-y-3", className)}>
        {/* Loading skeleton */}
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-gray-100 animate-pulse">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="w-16 h-4 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className={clsx("text-center py-12", className)}>
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-500 mb-2">No transactions yet</h3>
        <p className="text-gray-400">Start tracking your family&apos;s spending by adding your first expense!</p>
      </div>
    );
  }

  // Group transactions by date if showDate is true
  const groupedTransactions: Record<string, Transaction[]> = showDate 
    ? transactions.reduce((acc: Record<string, Transaction[]>, transaction: Transaction) => {
        const date = transaction.date;
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(transaction);
        return acc;
      }, {} as Record<string, Transaction[]>)
    : { today: transactions };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  return (
    <div className={clsx("space-y-6", className)}>
      {Object.entries(groupedTransactions).map(([date, dateTransactions]) => (
        <div key={date}>
          {showDate && date !== 'today' && (
            <h3 className="text-sm font-semibold text-gray-500 mb-3 px-2">
              {formatDate(date)}
            </h3>
          )}
          
          <div className="space-y-3">
            {dateTransactions.map((transaction) => (
              <TransactionItem 
                key={transaction._id} 
                transaction={transaction} 
              />
            ))}
          </div>
        </div>
      ))}
      
      {/* Load More Button (Future Enhancement) */}
      {transactions.length >= limit && (
        <div className="text-center py-4">
          <button className="text-blue-500 hover:text-blue-600 font-medium text-sm">
            Load more transactions
          </button>
        </div>
      )}
    </div>
  );
}