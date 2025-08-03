import { NextRequest, NextResponse } from 'next/server';
// TODO: Re-enable these imports when authentication system is complete
// import { stripe } from '@/api-clients/stripe/server';
// import { fetchQuery } from "convex/nextjs";
// import { api } from "@/convex/_generated/api";
// import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import type { SubscriptionStatus } from '@/hooks/useSubscription';

export async function GET(_req: NextRequest) {
  try {
    // Authentication system not fully implemented yet
    // Return default free tier status for testing
    const subscriptionStatus: SubscriptionStatus = {
      isAuthenticated: false, // Set to false since auth isn't working
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
        automatedCategorization: false,
        billReminders: false,
      },
    };

    return NextResponse.json(subscriptionStatus);

    /* TODO: Uncomment when authentication system is complete
    // Check if Stripe is configured
    if (!stripe) {
      return NextResponse.json(
        { 
          error: 'Stripe not configured',
          message: 'Please set up your Stripe environment variables. See STRIPE_SETUP_GUIDE.md for instructions.'
        },
        { status: 503 }
      );
    }

    // Get the current user from Convex Auth
    const token = await convexAuthNextjsToken();
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Fetch current user from Convex
    const user = await fetchQuery(api.users.currentUser, {}, { token }) as { 
      subscriptionStatus: string, 
      stripeCustomerId?: string, 
      hasAccessToBankIntegration: boolean, 
      hasAccessToUnlimitedFamilies: boolean, 
      hasAccessToPredictiveAlerts: boolean, 
      hasAccessToAdvancedAnalytics: boolean, 
      trialEndDate?: number 
    };
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Default to free tier
    let subscriptionStatus: SubscriptionStatus = {
      isAuthenticated: true,
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
        automatedCategorization: false,
        billReminders: false,
      },
    };

    // Check subscription status from user record
    const isPremium = ["premium", "premium_annual", "trialing"].includes(user.subscriptionStatus);
    const isTrialing = user.subscriptionStatus === "trialing";

    subscriptionStatus = {
      isAuthenticated: true,
      isPremium,
      isTrialing,
      status: user.subscriptionStatus as any,
      customerId: user.stripeCustomerId,
      features: {
        bankIntegration: user.hasAccessToBankIntegration,
        unlimitedFamilies: user.hasAccessToUnlimitedFamilies,
        predictiveAlerts: user.hasAccessToPredictiveAlerts,
        advancedAnalytics: user.hasAccessToAdvancedAnalytics,
        prioritySupport: isPremium,
        exportData: isPremium,
        automatedCategorization: isPremium,
        billReminders: isPremium,
      },
    };

    // If user has trial end date, include it
    if (user.trialEndDate) {
      subscriptionStatus.trialEndsAt = new Date(user.trialEndDate);
    }

    return NextResponse.json(subscriptionStatus);
    */
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}