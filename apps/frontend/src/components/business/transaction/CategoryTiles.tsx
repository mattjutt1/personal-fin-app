"use client";

import { Home, Coffee, PiggyBank } from "lucide-react";
import { TransactionCategoryUI } from "@/types/domain/transaction";
import { clsx } from "clsx";

interface CategoryTilesProps {
  selectedCategory?: "fixed" | "variable" | "savings";
  onSelectCategory: (category: "fixed" | "variable" | "savings") => void;
  className?: string;
}

// Pre-defined categories based on validated 3-category system
const TRANSACTION_CATEGORIES: TransactionCategoryUI[] = [
  {
    id: "fixed",
    name: "Fixed",
    icon: "🏠",
    type: "fixed",
    color: "bg-blue-500",
    touchTarget: true,
  },
  {
    id: "variable", 
    name: "Variable",
    icon: "🍕",
    type: "variable",
    color: "bg-green-500",
    touchTarget: true,
  },
  {
    id: "savings",
    name: "Savings",
    icon: "💰",
    type: "savings", 
    color: "bg-purple-500",
    touchTarget: true,
  }
];

const getIconComponent = (categoryId: string) => {
  switch (categoryId) {
    case "fixed":
      return <Home className="w-8 h-8" />;
    case "variable":
      return <Coffee className="w-8 h-8" />;
    case "savings":
      return <PiggyBank className="w-8 h-8" />;
    default:
      return <Coffee className="w-8 h-8" />;
  }
};

export default function CategoryTiles({ 
  selectedCategory, 
  onSelectCategory, 
  className 
}: CategoryTilesProps) {
  return (
    <div className={clsx("grid grid-cols-3 gap-4", className)}>
      {TRANSACTION_CATEGORIES.map((category) => {
        const isSelected = selectedCategory === category.type;
        
        return (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.type)}
            className={clsx(
              // Base styles with 44px minimum touch target
              "relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 min-h-[112px]",
              
              // Touch target optimization for mobile
              "active:scale-95 touch-manipulation",
              
              // Selected state
              isSelected
                ? `${category.color} text-white border-transparent shadow-lg scale-105`
                : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 shadow-sm",
              
              // Focus states for accessibility
              "focus:outline-none focus:ring-4 focus:ring-blue-500/20",
              
              // Interaction feedback
              "hover:shadow-md active:shadow-sm"
            )}
            type="button"
            aria-label={`Select ${category.name} category`}
            aria-pressed={isSelected}
          >
            {/* Category Icon */}
            <div className="mb-2">
              {isSelected ? (
                getIconComponent(category.id)
              ) : (
                <div className="text-3xl">{category.icon}</div>
              )}
            </div>
            
            {/* Category Name */}
            <span className="text-sm font-semibold">
              {category.name}
            </span>
            
            {/* Category Description */}
            <span className={clsx(
              "text-xs mt-1 text-center",
              isSelected ? "text-white/80" : "text-gray-500"
            )}>
              {category.type === "fixed" && "Rent, bills"}
              {category.type === "variable" && "Food, fun"}
              {category.type === "savings" && "Goals, future"}
            </span>
            
            {/* Selection Indicator */}
            {isSelected && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

// Export categories for use in other components
export { TRANSACTION_CATEGORIES };