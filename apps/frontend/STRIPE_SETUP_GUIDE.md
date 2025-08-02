# Stripe Setup Guide
## Simple Daily Family Budget - Payment Integration

This guide will walk you through setting up Stripe for the subscription system.

## Prerequisites

- Stripe account (create at https://stripe.com)
- Vercel account for deployment
- Access to your app's environment variables

## Step 1: Create Your Stripe Account

1. Go to https://stripe.com and sign up
2. Complete the onboarding process
3. Switch to **Test Mode** for initial setup (toggle in dashboard)

## Step 2: Create Products and Prices

### In Stripe Dashboard:

1. Navigate to **Products** → **Add product**

2. **Create Monthly Subscription:**
   - Name: `Premium Monthly`
   - Description: `Monthly subscription to Atlas Family Budget Premium`
   - Pricing: 
     - Model: `Standard pricing`
     - Price: `$4.99`
     - Billing period: `Monthly`
   - Save the price ID (looks like `price_1234...`)

3. **Create Annual Subscription:**
   - Name: `Premium Annual`
   - Description: `Annual subscription to Atlas Family Budget Premium (2 months free)`
   - Pricing:
     - Model: `Standard pricing`
     - Price: `$49.99`
     - Billing period: `Yearly`
   - Save the price ID

## Step 3: Set Up Webhook Endpoint

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://your-app.vercel.app/api/stripe-webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
   - `invoice.payment_succeeded`
5. Save the webhook signing secret (starts with `whsec_`)

## Step 4: Configure Environment Variables

### Local Development (.env.local)

```env
# Stripe Keys (Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Price IDs from Step 2
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_ANNUAL=price_...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Production (Vercel Dashboard)

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add all the above variables
4. Use **Production** Stripe keys (not test keys)
5. Update `NEXT_PUBLIC_APP_URL` to your production URL

## Step 5: Test Stripe Integration

### Test Cards for Development

Use these test card numbers:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires authentication: `4000 0025 0000 3155`

### Testing Workflow

1. Start your development server
2. Navigate to `/pricing`
3. Click "Start 14-Day Free Trial"
4. Use a test card
5. Complete the checkout
6. Verify webhook is received
7. Check user status is updated

## Step 6: API Route Implementation

### Create Checkout Session (`/api/create-checkout/route.ts`)

This endpoint is already stubbed in the architecture. Uncomment and implement:

```typescript
import { stripe, PRICES } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const { priceId } = await req.json();
    
    // Get user from your auth system
    // const user = await getCurrentUser();
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/welcome-premium?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      subscription_data: {
        trial_period_days: 14,
      },
    });

    return Response.json({ sessionId: session.id });
  } catch (error) {
    return new Response('Internal Server Error', { status: 500 });
  }
}
```

### Webhook Handler (`/api/stripe-webhook/route.ts`)

Implement webhook handling for subscription events.

## Step 7: Go Live Checklist

- [ ] Switch to Production Stripe keys
- [ ] Update all environment variables in Vercel
- [ ] Test with real card (you can refund yourself)
- [ ] Enable Stripe tax collection (if needed)
- [ ] Set up Stripe customer portal
- [ ] Configure email receipts in Stripe
- [ ] Test subscription cancellation flow
- [ ] Monitor first real transactions

## Common Issues

### Webhook Not Receiving Events
- Check endpoint URL is correct
- Verify webhook secret is properly set
- Use Stripe CLI for local testing: `stripe listen --forward-to localhost:3000/api/stripe-webhook`

### Checkout Redirect Fails
- Ensure `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
- Check that price IDs are correct
- Verify success/cancel URLs are absolute

### Subscription Status Not Updating
- Check webhook event handling
- Verify database updates in webhook handler
- Use Stripe Dashboard logs to debug

## Security Considerations

1. **Never expose secret keys**: Only `NEXT_PUBLIC_*` keys go to client
2. **Validate webhooks**: Always verify webhook signatures
3. **Use HTTPS**: Required for production webhooks
4. **Implement idempotency**: Handle duplicate webhook events
5. **Regular monitoring**: Check Stripe Dashboard for failures

## Next Steps

1. Implement user authentication (if not done)
2. Create customer portal integration
3. Add subscription management UI
4. Implement usage-based features
5. Set up revenue analytics

---

For support, check:
- Stripe Documentation: https://stripe.com/docs
- Stripe Support: https://support.stripe.com
- Our GitHub Issues: [your-repo]/issues