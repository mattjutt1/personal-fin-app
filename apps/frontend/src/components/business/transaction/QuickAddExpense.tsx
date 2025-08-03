"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Plus, X, Check } from "lucide-react";
import { clsx } from "clsx";
import CategoryTiles from "./CategoryTiles";
import { QuickExpenseForm, MobileActionProps } from "@/types";

interface QuickAddExpenseProps extends Omit<MobileActionProps, 'onSubmit'> {
  onSuccess?: () => void;
}

export default function QuickAddExpense({ 
  familyId, 
  userId, 
  userName, 
  onSuccess 
}: QuickAddExpenseProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'amount' | 'category' | 'description'>('amount');
  const [form, setForm] = useState<QuickExpenseForm>({
    amount: '',
    description: '',
    category: 'variable' // Default to most common category
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const amountInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLInputElement>(null);
  
  const createTransaction = useMutation(api.transactions.createTransaction);

  // Focus management for better UX
  useEffect(() => {
    if (isOpen && step === 'amount' && amountInputRef.current) {
      amountInputRef.current.focus();
    }
    if (step === 'description' && descriptionInputRef.current) {
      descriptionInputRef.current.focus();
    }
  }, [isOpen, step]);

  const handleOpen = () => {
    setIsOpen(true);
    setStep('amount');
    setForm({
      amount: '',
      description: '',
      category: 'variable'
    });
  };

  const handleClose = () => {
    setIsOpen(false);
    setStep('amount');
    setIsSubmitting(false);
  };

  const handleAmountSubmit = () => {
    if (form.amount && parseFloat(form.amount) > 0) {
      setStep('category');
    }
  };

  const handleCategorySelect = (category: "fixed" | "variable" | "savings") => {
    setForm(prev => ({ ...prev, category }));
    setStep('description');
  };

  const handleSubmit = async () => {
    if (!form.amount || !form.description.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      await createTransaction({
        familyId,
        userId,
        userName,
        amount: parseFloat(form.amount),
        description: form.description.trim(),
        category: form.category,
        type: "expense",
        date: today,
        clientId: `${userId}-${Date.now()}`, // For optimistic updates
      });
      
      handleClose();
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create transaction:', error);
      // TODO: Add toast notification for error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAmountChange = (value: string) => {
    // Only allow numbers and decimal point
    const sanitized = value.replace(/[^0-9.]/g, '');
    // Prevent multiple decimal points
    const parts = sanitized.split('.');
    const formatted = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : sanitized;
    
    setForm(prev => ({ ...prev, amount: formatted }));
  };

  if (!isOpen) {
    return (
      <button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200 flex items-center justify-center z-50 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
        aria-label="Add new expense"
      >
        <Plus className="w-8 h-8" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      {/* Modal */}
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-8 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Quick Add Expense</h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Amount Entry */}
          {step === 'amount' && (
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-6 text-gray-800">How much did you spend?</h3>
              <div className="relative mb-6">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl font-bold text-gray-400">$</span>
                <input
                  ref={amountInputRef}
                  type="text"
                  inputMode="decimal"
                  value={form.amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAmountSubmit();
                    }
                  }}
                  className="w-full pl-12 pr-4 py-4 text-3xl font-bold text-center border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="0.00"
                  autoComplete="off"
                />
              </div>
              <button
                onClick={handleAmountSubmit}
                disabled={!form.amount || parseFloat(form.amount) <= 0}
                className="w-full py-4 bg-blue-500 text-white font-semibold rounded-2xl disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600 active:scale-98 transition-all duration-200"
              >
                Next
              </button>
            </div>
          )}

          {/* Step 2: Category Selection */}
          {step === 'category' && (
            <div>
              <h3 className="text-lg font-semibold mb-6 text-gray-800">What category?</h3>
              <CategoryTiles
                selectedCategory={form.category}
                onSelectCategory={handleCategorySelect}
                className="mb-6"
              />
              <div className="text-center text-sm text-gray-500">
                Selected: ${form.amount} for {form.category}
              </div>
            </div>
          )}

          {/* Step 3: Description */}
          {step === 'description' && (
            <div>
              <h3 className="text-lg font-semibold mb-6 text-gray-800">What was it for?</h3>
              <input
                ref={descriptionInputRef}
                type="text"
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && form.description.trim()) {
                    handleSubmit();
                  }
                }}
                className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-colors mb-6"
                placeholder="Coffee, lunch, groceries..."
                autoComplete="off"
                maxLength={50}
              />
              
              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="text-sm text-gray-600 mb-2">Summary:</div>
                <div className="text-lg font-semibold text-gray-900">
                  ${form.amount} • {form.category} • {form.description || 'Description needed'}
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!form.description.trim() || isSubmitting}
                className="w-full py-4 bg-green-500 text-white font-semibold rounded-2xl disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-green-600 active:scale-98 transition-all duration-200 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Add Expense
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="px-6 pb-6">
          <div className="flex justify-center space-x-2">
            {['amount', 'category', 'description'].map((stepName, index) => (
              <div
                key={stepName}
                className={clsx(
                  "w-3 h-3 rounded-full transition-all duration-200",
                  step === stepName 
                    ? "bg-blue-500" 
                    : index < ['amount', 'category', 'description'].indexOf(step)
                      ? "bg-green-500"
                      : "bg-gray-300"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}