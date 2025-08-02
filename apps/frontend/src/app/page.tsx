"use client";

import { useState } from "react";
import { useSubscription, getSubscriptionDisplayInfo } from "@/hooks/useSubscription";


export default function Home() {
  const subscription = useSubscription();
  const displayInfo = getSubscriptionDisplayInfo(subscription);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Atlas Family Budget</h1>
              <div className="flex items-center space-x-2 mt-1">
                <p className="text-gray-600 text-sm">Simple daily budgeting for busy families</p>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${displayInfo.color}`}>
                  {displayInfo.badge}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {subscription.isAuthenticated && (
                <a
                  href="/settings"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                  title="Settings"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </a>
              )}
              {!subscription.isPremium && !subscription.isTrialing && (
                <a
                  href="/pricing"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Go Premium
                </a>
              )}
              {(subscription.isPremium || subscription.isTrialing) && (
                <div className="text-right">
                  <div className="text-sm font-medium text-green-600">Premium Active</div>
                  {subscription.isTrialing && subscription.trialEndsAt && (
                    <div className="text-xs text-gray-500">
                      Trial ends {subscription.trialEndsAt.toLocaleDateString()}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        
        {/* Daily Budget Preview */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">$47</div>
            <div className="text-blue-100">Available Today</div>
            <div className="text-xs text-blue-200 mt-2">
              From your family budget calculation
            </div>
          </div>
        </section>

        {/* Quick Stats Card */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">This Month Preview</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">$5,000</div>
              <div className="text-sm text-gray-500">Monthly Income</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">$3,000</div>
              <div className="text-sm text-gray-500">Fixed + Savings</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 text-center">
            <div className="text-xl font-bold text-blue-600">$2,000</div>
            <div className="text-sm text-gray-500">Variable Budget</div>
          </div>
        </section>

        {/* Getting Started Guide */}
        <section className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">👋 Welcome to Atlas Family Budget!</h3>
          <p className="text-gray-600 text-sm mb-4">
            Start tracking your family&apos;s spending in under 5 seconds per transaction!
          </p>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span><strong>Fixed:</strong> Rent, bills, subscriptions</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span><strong>Variable:</strong> Food, entertainment, shopping</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span><strong>Savings:</strong> Emergency fund, goals</span>
            </div>
          </div>
        </section>

        {/* Testing Environment Link */}
        <section className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">🧪 MVP Testing Ready</h3>
              <p className="text-gray-600 text-sm">
                Set up test families and validate core workflows
              </p>
            </div>
            <a
              href="/testing"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Start Testing
            </a>
          </div>
        </section>

        {/* Premium Feature Teaser */}
        <section className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">🚀 Go Premium</h3>
              <p className="text-purple-100 text-sm">
                Connect your bank, get predictive insights, and save $200+/month
              </p>
            </div>
            <a
              href="/pricing"
              className="bg-white text-purple-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-50 transition-colors"
            >
              Learn More
            </a>
          </div>
        </section>

        {/* Key Features Preview */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">MVP Features</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm font-bold">✓</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">Family Budget Setup</div>
                <div className="text-sm text-gray-600">Create and manage family budgets together</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm font-bold">✓</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">Quick Expense Entry</div>
                <div className="text-sm text-gray-600">Add expenses in under 5 seconds</div>
              </div>
            </div>
            
            <a href="/bank-sync" className="flex items-center space-x-3 hover:bg-gray-50 -mx-2 px-2 py-1 rounded transition-colors">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-sm font-bold">🔒</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">Bank Account Sync
                  <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Premium</span>
                </div>
                <div className="text-sm text-gray-600">Connect banks for automatic import</div>
              </div>
            </a>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm font-bold">✓</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">Real-time Family Sync</div>
                <div className="text-sm text-gray-600">All family members see updates instantly</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm font-bold">✓</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">Daily Budget Clarity</div>
                <div className="text-sm text-gray-600">&quot;What can we spend today?&quot; made simple</div>
              </div>
            </div>
          </div>
        </section>

        {/* Spacer */}
        <div className="h-4"></div>
      </div>
    </div>
  );
}