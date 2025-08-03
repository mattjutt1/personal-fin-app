"use client";

import { PaywallGate } from "@/components/business/monetization/PaywallGate";


export default function BankSyncPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bank Account Integration
          </h1>
          <p className="text-gray-600">
            Connect your bank accounts to automatically import transactions
          </p>
        </div>

        {/* Paywall Gate */}
        <PaywallGate feature="Bank Account Sync" requiresFeature="bankIntegration">
          {/* This content only shows for premium users */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Connect Your Bank
            </h2>
            
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 cursor-pointer transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Chase</h3>
                    <p className="text-sm text-gray-600">Connect your Chase accounts</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 cursor-pointer transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Bank of America</h3>
                    <p className="text-sm text-gray-600">Connect your BofA accounts</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 cursor-pointer transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Wells Fargo</h3>
                    <p className="text-sm text-gray-600">Connect your Wells Fargo accounts</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600 mb-4">
                Don&apos;t see your bank? Search from 12,000+ supported institutions
              </p>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Search All Banks
              </button>
            </div>
          </div>
        </PaywallGate>

        {/* Benefits Section (Always visible) */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Why Connect Your Bank?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-3xl mb-3">⏱️</div>
              <h3 className="font-semibold text-gray-900 mb-2">Save 30 Minutes Weekly</h3>
              <p className="text-gray-600 text-sm">
                Stop manually entering every transaction. Everything syncs automatically.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-semibold text-gray-900 mb-2">Never Miss a Transaction</h3>
              <p className="text-gray-600 text-sm">
                Every purchase, bill, and deposit is automatically categorized.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="font-semibold text-gray-900 mb-2">Bank-Level Security</h3>
              <p className="text-gray-600 text-sm">
                256-bit encryption with read-only access. Your money stays safe.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}