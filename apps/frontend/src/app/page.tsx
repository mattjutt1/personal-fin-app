"use client";

import { useSubscription, getSubscriptionDisplayInfo } from "@/hooks/useSubscription";


export default function Home() {
  const subscription = useSubscription();
  const displayInfo = getSubscriptionDisplayInfo(subscription);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Desktop Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">Atlas Family Budget</h1>
              </div>
              <nav className="hidden md:flex space-x-8">
                <a href="/" className="text-blue-600 font-medium">Dashboard</a>
                <a href="/budget" className="text-gray-600 hover:text-gray-900">Budget</a>
                <a href="/transactions" className="text-gray-600 hover:text-gray-900">Transactions</a>
                <a href="/analytics" className="text-gray-600 hover:text-gray-900">Analytics</a>
                <a href="/testing" className="text-gray-600 hover:text-gray-900">Testing</a>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2">
                <span className="text-sm text-gray-600">Simple daily budgeting for busy families</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${displayInfo.color}`}>
                  {displayInfo.badge}
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                {subscription.isAuthenticated && (
                  <a
                    href="/settings"
                    className="text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100"
                    title="Settings"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      </header>

      {/* Main Dashboard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Key Metrics and Actions */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Daily Budget Preview */}
            <section className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">$47</div>
                <div className="text-blue-100 text-lg">Available Today</div>
                <div className="text-sm text-blue-200 mt-2">
                  From your family budget calculation
                </div>
              </div>
            </section>

            {/* Quick Stats Card */}
            <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">This Month Preview</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Monthly Income</span>
                  <span className="text-xl font-bold text-green-600">$5,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Fixed + Savings</span>
                  <span className="text-xl font-bold text-red-600">$3,000</span>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Variable Budget</span>
                    <span className="text-2xl font-bold text-blue-600">$2,000</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Quick Action Buttons */}
            <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors">
                  Add Expense
                </button>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors">
                  Log Income
                </button>
                <button className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors">
                  View Transactions
                </button>
              </div>
            </section>
          </div>

          {/* Center Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Getting Started Guide */}
            <section className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">👋 Welcome to Atlas Family Budget!</h3>
              <p className="text-gray-600 mb-6">
                Start tracking your family&apos;s spending in under 5 seconds per transaction!
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 bg-white p-4 rounded-lg">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <div>
                    <div className="font-medium text-gray-900">Fixed</div>
                    <div className="text-sm text-gray-600">Rent, bills, subscriptions</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 bg-white p-4 rounded-lg">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <div>
                    <div className="font-medium text-gray-900">Variable</div>
                    <div className="text-sm text-gray-600">Food, entertainment, shopping</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 bg-white p-4 rounded-lg">
                  <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                  <div>
                    <div className="font-medium text-gray-900">Savings</div>
                    <div className="text-sm text-gray-600">Emergency fund, goals</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Key Features Preview */}
            <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">MVP Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3 p-4 border border-gray-100 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 text-lg font-bold">✓</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 mb-1">Family Budget Setup</div>
                    <div className="text-sm text-gray-600">Create and manage family budgets together</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-4 border border-gray-100 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 text-lg font-bold">✓</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 mb-1">Quick Expense Entry</div>
                    <div className="text-sm text-gray-600">Add expenses in under 5 seconds</div>
                  </div>
                </div>
                
                <a href="/bank-sync" className="flex items-start space-x-3 p-4 border border-purple-200 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 text-lg font-bold">🔒</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 mb-1">Bank Account Sync
                      <span className="ml-2 text-xs bg-purple-200 text-purple-700 px-2 py-0.5 rounded-full">Premium</span>
                    </div>
                    <div className="text-sm text-gray-600">Connect banks for automatic import</div>
                  </div>
                </a>
                
                <div className="flex items-start space-x-3 p-4 border border-gray-100 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 text-lg font-bold">✓</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 mb-1">Real-time Family Sync</div>
                    <div className="text-sm text-gray-600">All family members see updates instantly</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Action Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Testing Environment Link */}
              <section className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🧪</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">MVP Testing Ready</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Set up test families and validate core workflows
                    </p>
                    <a
                      href="/testing"
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Start Testing
                    </a>
                  </div>
                </div>
              </section>

              {/* Premium Feature Teaser */}
              <section className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">Go Premium</h3>
                    <p className="text-purple-100 text-sm mb-3">
                      Connect your bank, get predictive insights, and save $200+/month
                    </p>
                    <a
                      href="/pricing"
                      className="bg-white text-purple-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-50 transition-colors"
                    >
                      Learn More
                    </a>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}