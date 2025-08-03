"use client";

import { useState } from "react";

// Client-side pricing configuration (duplicated from server for client use)
const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Free',
    price: 0,
    features: [
      '1 Family Budget',
      'Manual Transaction Entry',
      'Basic Reports',
      '30-Day History',
      'Real-time Family Sync',
    ],
  },
  premium: {
    name: 'Premium',
    price: 4.99,
    features: [
      'Everything in Free',
      'Bank Account Sync',
      'Unlimited Families',
      'Predictive Spending Alerts',
      'Advanced Analytics',
      'Bill Reminders',
      'Unlimited History',
      'Export & Reports',
      'Priority Support',
    ],
  },
} as const;

const PRICES = {
  monthly: 'price_monthly_placeholder',
  annual: 'price_annual_placeholder',
};

// Disable static generation for this page
export const dynamic = 'force-dynamic';

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly");
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async (tier: "premium" | "premium_annual") => {
    setLoading(true);
    
    try {
      // Check if Stripe is configured
      const { validateClientStripeConfig } = await import('@/lib/env-validation');
      
      if (!validateClientStripeConfig()) {
        alert(
          'Stripe is not configured properly.\n\n' +
          'Please check your environment variables and see STRIPE_SETUP_GUIDE.md for setup instructions.'
        );
        return;
      }

      const { getStripe } = await import('@/api-clients/stripe/client');
      
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          priceId: tier === 'premium' ? PRICES.monthly : PRICES.annual 
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      const stripe = await getStripe();
      
      if (!stripe) {
        throw new Error('Failed to load Stripe');
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });
      
      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert(`Something went wrong: ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple Pricing for Growing Families
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Start free, upgrade when you need more powerful features
          </p>
          
          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingPeriod === "monthly"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("annual")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingPeriod === "annual"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600"
              }`}
            >
              Annual
              <span className="ml-1 text-green-600 text-xs">Save 17%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Free</h2>
              <p className="text-gray-600">Perfect for getting started</p>
              <div className="mt-4">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-gray-600">/month</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              {SUBSCRIPTION_TIERS.free.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <svg
                    className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              className="w-full py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              disabled
            >
              Current Plan
            </button>
          </div>

          {/* Premium Tier */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-600 p-8 relative">
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                MOST POPULAR
              </span>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Premium</h2>
              <p className="text-gray-600">Everything you need to succeed</p>
              <div className="mt-4">
                <span className="text-4xl font-bold">
                  ${billingPeriod === "monthly" ? "4.99" : "49.99"}
                </span>
                <span className="text-gray-600">
                  /{billingPeriod === "monthly" ? "month" : "year"}
                </span>
                {billingPeriod === "annual" && (
                  <div className="text-sm text-green-600 mt-1">
                    Only $4.17/month (2 months free!)
                  </div>
                )}
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              {SUBSCRIPTION_TIERS.premium.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <svg
                    className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-700">
                    {feature === "Everything in Free" ? (
                      <strong>{feature}</strong>
                    ) : (
                      feature
                    )}
                  </span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleUpgrade(billingPeriod === "monthly" ? "premium" : "premium_annual")}
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Loading..." : "Start 14-Day Free Trial"}
            </button>
            <p className="text-xs text-gray-500 text-center mt-3">
              No credit card required • Cancel anytime
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">
                What happens after my free trial?
              </h3>
              <p className="text-gray-600">
                After 14 days, you&apos;ll be charged the monthly or annual fee based on your selection. 
                You can cancel anytime before the trial ends and won&apos;t be charged.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I change plans later?
              </h3>
              <p className="text-gray-600">
                Yes! You can upgrade, downgrade, or cancel your subscription at any time from your 
                account settings. Changes take effect at the next billing cycle.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">
                Is my financial data secure?
              </h3>
              <p className="text-gray-600">
                Absolutely. We use bank-level 256-bit encryption and never store your bank credentials. 
                Our read-only access ensures your accounts remain secure.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-gray-600">
                We offer a 30-day money-back guarantee. If you&apos;re not satisfied within the first 30 days, 
                contact support for a full refund.
              </p>
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">Trusted by growing families</p>
          <div className="flex items-center justify-center space-x-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">10,000+</div>
              <div className="text-sm text-gray-600">Active Families</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">$200/mo</div>
              <div className="text-sm text-gray-600">Average Savings</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">4.8/5</div>
              <div className="text-sm text-gray-600">User Rating</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}