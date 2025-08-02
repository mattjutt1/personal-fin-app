"use client";

import { useState, useEffect } from 'react';
import { useAuthToken } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export interface SubscriptionStatus {
  isAuthenticated: boolean;
  userId?: string;
  email?: string;
  name?: string;
  isPremium: boolean;
  isTrialing: boolean;
  subscriptionId?: string;
  customerId?: string;
  trialEndsAt?: Date;
  subscriptionEndDate?: Date;
  status: 'free' | 'trialing' | 'premium' | 'premium_annual' | 'past_due' | 'canceled';
  features: {
    bankIntegration: boolean;
    unlimitedFamilies: boolean;
    predictiveAlerts: boolean;
    advancedAnalytics: boolean;
    prioritySupport: boolean;
    exportData: boolean;
  };
}

export function useSubscription(): SubscriptionStatus {
  const token = useAuthToken();
  const isAuthenticated = token !== null;
  const [subscription, setSubscription] = useState<SubscriptionStatus>({
    isAuthenticated: false,
    isPremium: false,
    isTrialing: false,
    status: 'free',
    features: {
      bankIntegration: false,
      unlimitedFamilies: false,
      predictiveAlerts: false,
      advancedAnalytics: false,
      prioritySupport: false,
      exportData: false,
    },
  });

  // Temporarily skip problematic API calls for testing
  // TODO: Re-enable after fixing Convex API compilation
  const currentUser = null; // useQuery(api.users.currentUser, isAuthenticated ? {} : "skip");
  const subscriptionData = null; // useQuery(api["auth-integration"].getUserSubscriptionStatus, (!isAuthenticated || !currentUser?.email) ? "skip" : { email: currentUser.email });

  useEffect(() => {
    // DEMO: Check for test user simulation via URL parameter
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      const urlParams = new URLSearchParams(window.location.search);
      const testUser = urlParams.get('user');
      
      if (testUser === 'premium' || testUser === 'test') {
        setSubscription({
          isAuthenticated: true,
          userId: 'test-user-premium',
          email: 'test@example.com',
          name: 'Premium Test User',
          isPremium: true,
          isTrialing: false,
          status: 'premium',
          customerId: 'cus_test_123',
          features: {
            bankIntegration: true,
            unlimitedFamilies: true,
            predictiveAlerts: true,
            advancedAnalytics: true,
            prioritySupport: true,
            exportData: true,
          },
        });
        return;
      }
      
      if (testUser === 'trial') {
        setSubscription({
          isAuthenticated: true,
          userId: 'test-user-trial',
          email: 'trial@example.com',
          name: 'Trial Test User',
          isPremium: true,
          isTrialing: true,
          status: 'trialing',
          customerId: 'cus_trial_123',
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
          features: {
            bankIntegration: true,
            unlimitedFamilies: true,
            predictiveAlerts: true,
            advancedAnalytics: true,
            prioritySupport: true,
            exportData: true,
          },
        });
        return;
      }
      
      if (testUser === 'free') {
        setSubscription({
          isAuthenticated: true,
          userId: 'test-user-free',
          email: 'free@example.com',
          name: 'Free Test User',
          isPremium: false,
          isTrialing: false,
          status: 'free',
          features: {
            bankIntegration: false,
            unlimitedFamilies: false,
            predictiveAlerts: false,
            advancedAnalytics: false,
            prioritySupport: false,
            exportData: false,
          },
        });
        return;
      }
    }
    
    if (!isAuthenticated) {
      // User is not authenticated - return free tier
      setSubscription({
        isAuthenticated: false,
        isPremium: false,
        isTrialing: false,
        status: 'free',
        features: {
          bankIntegration: false,
          unlimitedFamilies: false,
          predictiveAlerts: false,
          advancedAnalytics: false,
          prioritySupport: false,
          exportData: false,
        },
      });
      return;
    }

    if (subscriptionData) {
      // Update subscription from Convex data
      setSubscription({
        isAuthenticated: subscriptionData.isAuthenticated,
        userId: subscriptionData.userId?.toString(),
        email: subscriptionData.email,
        name: subscriptionData.name,
        isPremium: subscriptionData.isPremium,
        isTrialing: subscriptionData.isTrialing,
        subscriptionId: subscriptionData.stripeSubscriptionId,
        customerId: subscriptionData.stripeCustomerId,
        trialEndsAt: subscriptionData.trialEndsAt,
        subscriptionEndDate: subscriptionData.subscriptionEndDate,
        status: subscriptionData.subscriptionStatus,
        features: subscriptionData.features,
      });
    } else if (isAuthenticated && !subscriptionData) {
      // User is authenticated but we don't have subscription data yet
      // Show loading state or default to free tier
      setSubscription(prev => ({
        ...prev,
        isAuthenticated: true,
      }));
    }
  }, [isAuthenticated, subscriptionData, currentUser]);

  return subscription;
}

// Helper function to check if user has access to a specific feature
export function hasFeatureAccess(subscription: SubscriptionStatus, feature: keyof SubscriptionStatus['features']): boolean {
  return subscription.features[feature];
}

// Helper function to get subscription display info
export function getSubscriptionDisplayInfo(subscription: SubscriptionStatus) {
  if (subscription.isTrialing) {
    const daysLeft = subscription.trialEndsAt 
      ? Math.ceil((subscription.trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : 0;
    return {
      badge: 'Premium Trial',
      color: 'bg-blue-100 text-blue-800',
      message: `${daysLeft} days left in trial`,
    };
  }
  
  if (subscription.isPremium) {
    return {
      badge: 'Premium',
      color: 'bg-green-100 text-green-800',
      message: 'All features unlocked',
    };
  }
  
  return {
    badge: 'Free',
    color: 'bg-gray-100 text-gray-800',
    message: 'Upgrade to unlock premium features',
  };
}