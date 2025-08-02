"use client";

import { ReactNode } from "react";
import { useSubscription } from "@/hooks/useSubscription";

interface PaywallGateProps {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
  requiresFeature?: keyof ReturnType<typeof useSubscription>['features'];
}

export function PaywallGate({ feature, children, fallback, requiresFeature }: PaywallGateProps) {
  const subscription = useSubscription();
  
  // Check authentication first
  if (!subscription.isAuthenticated) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-200 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-4xl mb-4">🔐</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Sign In Required
          </h3>
          <p className="text-gray-600 mb-6">
            Please sign in to access {feature} and other premium features.
          </p>
          <a
            href="/auth/signin"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors mr-3"
          >
            Sign In
          </a>
          <a
            href="/auth/signup"
            className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            Create Account
          </a>
        </div>
      </div>
    );
  }

  // Check if user has premium access
  let hasAccess = subscription.isPremium || subscription.isTrialing;
  
  // If a specific feature is required, check for that feature
  if (requiresFeature && hasAccess) {
    hasAccess = subscription.features[requiresFeature];
  }
  
  if (hasAccess) {
    return <>{children}</>;
  }
  
  // Default upgrade prompt
  const defaultFallback = (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-8 border border-purple-200 text-center">
      <div className="max-w-md mx-auto">
        <div className="text-4xl mb-4">🔒</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Premium Feature: {feature}
        </h3>
        <p className="text-gray-600 mb-6">
          Upgrade to Premium to unlock this feature and save time managing your family budget.
        </p>
        <a
          href="/pricing"
          className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
        >
          Upgrade to Premium
        </a>
        <p className="text-sm text-gray-500 mt-4">
          14-day free trial • Cancel anytime
        </p>
      </div>
    </div>
  );
  
  return fallback || defaultFallback;
}