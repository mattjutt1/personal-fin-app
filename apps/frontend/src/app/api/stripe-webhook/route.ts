import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/api-clients/stripe/server';
import Stripe from 'stripe';

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

    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      console.error('Missing Stripe signature');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('Missing STRIPE_WEBHOOK_SECRET environment variable');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Checkout session completed:', session.id);
        
        // TODO: Update user subscription status in your database
        // await updateUserSubscription({
        //   userId: session.client_reference_id,
        //   subscriptionId: session.subscription,
        //   customerId: session.customer,
        //   status: 'trialing' or 'active'
        // });
        
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Subscription created:', subscription.id);
        
        // TODO: Handle new subscription
        // await handleSubscriptionCreated(subscription);
        
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Subscription updated:', subscription.id);
        
        // TODO: Handle subscription changes (plan change, trial ending, etc.)
        // await handleSubscriptionUpdated(subscription);
        
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Subscription cancelled:', subscription.id);
        
        // TODO: Handle subscription cancellation
        // await handleSubscriptionCancelled(subscription);
        
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Payment succeeded for invoice:', invoice.id);
        
        // TODO: Handle successful payment
        // await handlePaymentSucceeded(invoice);
        
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Payment failed for invoice:', invoice.id);
        
        // TODO: Handle failed payment (send email, update status, etc.)
        // await handlePaymentFailed(invoice);
        
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
        return NextResponse.json(
          { error: 'Unhandled event type' },
          { status: 400 }
        );
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// TODO: Implement these helper functions when you have your database set up
/*
async function updateUserSubscription(data: {
  userId: string;
  subscriptionId: string;
  customerId: string;
  status: string;
}) {
  // Update user record in your database
  // This could be Convex, Supabase, etc.
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  // Handle new subscription logic
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  // Handle subscription update logic
}

async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  // Handle cancellation logic
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // Handle successful payment logic
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // Handle failed payment logic
}
*/