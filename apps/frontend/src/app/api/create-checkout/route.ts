import { NextRequest, NextResponse } from 'next/server';
import { stripe, PRICES, STRIPE_CONFIG } from '@/api-clients/stripe/server';

export async function POST(req: NextRequest) {
  try {
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

    const { priceId } = await req.json();

    // Validate price ID
    const validPriceIds = Object.values(PRICES);
    if (!validPriceIds.includes(priceId)) {
      return NextResponse.json(
        { error: 'Invalid price ID' },
        { status: 400 }
      );
    }

    // For now, create checkout without user - in production you'd get user from auth
    // const userId = await getCurrentUserId();
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: STRIPE_CONFIG.successUrl,
      cancel_url: STRIPE_CONFIG.cancelUrl,
      subscription_data: {
        trial_period_days: STRIPE_CONFIG.trialPeriodDays,
      },
      // In production, you'd set this to the authenticated user's ID
      // client_reference_id: userId,
      metadata: {
        // Store any additional data you need
        source: 'pricing_page',
        timestamp: new Date().toISOString(),
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}