"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function WelcomePremiumContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // In a real app, you'd verify the session with your backend
    // For now, we'll just simulate verification
    const timer = setTimeout(() => {
      setVerifying(false);
      setSuccess(!!sessionId);
    }, 2000);

    return () => clearTimeout(timer);
  }, [sessionId]);

  if (verifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Verifying your subscription...
          </h1>
          <p className="text-gray-600">
            Please wait while we confirm your payment.
          </p>
        </div>
      </div>
    );
  }

  if (!success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="text-red-600 text-4xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Something went wrong
          </h1>
          <p className="text-gray-600 mb-6">
            We couldn't verify your subscription. Please contact support if you were charged.
          </p>
          <a
            href="/pricing"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Back to Pricing
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Premium!
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Your 14-day free trial has started
          </p>
          <p className="text-gray-500">
            You won't be charged until {new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}
          </p>
        </div>

        {/* Premium Features Unlocked */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Premium Features Now Available
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mt-1">
                  <span className="text-green-600 text-sm font-bold">🏦</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Bank Account Integration</h3>
                  <p className="text-sm text-gray-600">Connect your accounts for automatic transaction import</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mt-1">
                  <span className="text-green-600 text-sm font-bold">🚨</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Predictive Spending Alerts</h3>
                  <p className="text-sm text-gray-600">Get notified before you overspend</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mt-1">
                  <span className="text-green-600 text-sm font-bold">📊</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Advanced Analytics</h3>
                  <p className="text-sm text-gray-600">Detailed insights into your spending patterns</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mt-1">
                  <span className="text-green-600 text-sm font-bold">👨‍👩‍👧‍👦</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Unlimited Family Members</h3>
                  <p className="text-sm text-gray-600">Add everyone to your family budget</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mt-1">
                  <span className="text-green-600 text-sm font-bold">📱</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Priority Support</h3>
                  <p className="text-sm text-gray-600">Get help when you need it most</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mt-1">
                  <span className="text-green-600 text-sm font-bold">📈</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Export & Reports</h3>
                  <p className="text-sm text-gray-600">Download your data anytime</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Ready to Get Started?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <a
              href="/bank-sync"
              className="block bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-2xl mb-3">🏦</div>
              <h3 className="font-semibold text-gray-900 mb-2">Connect Your Bank</h3>
              <p className="text-sm text-gray-600">
                Start by linking your bank account for automatic transaction sync
              </p>
            </a>
            
            <a
              href="/"
              className="block bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-2xl mb-3">🏠</div>
              <h3 className="font-semibold text-gray-900 mb-2">Create Your Budget</h3>
              <p className="text-sm text-gray-600">
                Set up your family budget with our smart recommendations
              </p>
            </a>
            
            <a
              href="/help"
              className="block bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-2xl mb-3">💬</div>
              <h3 className="font-semibold text-gray-900 mb-2">Get Support</h3>
              <p className="text-sm text-gray-600">
                Need help? Our premium support team is here for you
              </p>
            </a>
          </div>
        </div>

        {/* Trial Info */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Questions about your subscription?
          </h3>
          <p className="text-gray-600 mb-4">
            You can manage your subscription, update payment methods, or cancel anytime.
          </p>
          <button
            className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            onClick={() => alert('Customer portal coming soon! For now, contact support to manage your subscription.')}
          >
            Manage Subscription
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WelcomePremiumPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <WelcomePremiumContent />
    </Suspense>
  );
}