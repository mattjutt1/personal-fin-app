// Environment variable validation for Stripe integration

export interface StripeConfig {
  publishableKey: string;
  secretKey: string;
  webhookSecret: string;
  priceMonthly: string;
  priceAnnual: string;
  appUrl: string;
}

export function validateStripeEnvironment(): { isValid: boolean; errors: string[]; config?: StripeConfig } {
  const errors: string[] = [];
  
  // Required environment variables
  const requiredEnvVars = {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    priceMonthly: process.env.STRIPE_PRICE_MONTHLY,
    priceAnnual: process.env.STRIPE_PRICE_ANNUAL,
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
  };

  // Check for missing variables
  Object.entries(requiredEnvVars).forEach(([key, value]) => {
    if (!value || value.includes('placeholder')) {
      errors.push(`Missing or invalid ${key}: ${value || 'undefined'}`);
    }
  });

  // Validate publishable key format
  if (requiredEnvVars.publishableKey && !requiredEnvVars.publishableKey.startsWith('pk_')) {
    errors.push('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must start with "pk_"');
  }

  // Validate secret key format
  if (requiredEnvVars.secretKey && !requiredEnvVars.secretKey.startsWith('sk_')) {
    errors.push('STRIPE_SECRET_KEY must start with "sk_"');
  }

  // Validate webhook secret format
  if (requiredEnvVars.webhookSecret && !requiredEnvVars.webhookSecret.startsWith('whsec_')) {
    errors.push('STRIPE_WEBHOOK_SECRET must start with "whsec_"');
  }

  // Validate price ID formats
  if (requiredEnvVars.priceMonthly && !requiredEnvVars.priceMonthly.startsWith('price_')) {
    errors.push('STRIPE_PRICE_MONTHLY must start with "price_"');
  }

  if (requiredEnvVars.priceAnnual && !requiredEnvVars.priceAnnual.startsWith('price_')) {
    errors.push('STRIPE_PRICE_ANNUAL must start with "price_"');
  }

  const isValid = errors.length === 0;
  
  return {
    isValid,
    errors,
    config: isValid ? (requiredEnvVars as StripeConfig) : undefined,
  };
}

export function getStripeSetupInstructions(): string {
  return `
Stripe Setup Required
====================

To enable premium subscriptions, you need to configure Stripe:

1. Create a Stripe account at https://stripe.com
2. Set up products and prices in your Stripe Dashboard
3. Get your API keys from the Stripe Dashboard
4. Configure webhook endpoints
5. Set environment variables in .env.local

For detailed instructions, see STRIPE_SETUP_GUIDE.md

Required Environment Variables:
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
- STRIPE_SECRET_KEY=sk_test_...
- STRIPE_WEBHOOK_SECRET=whsec_...
- STRIPE_PRICE_MONTHLY=price_...
- STRIPE_PRICE_ANNUAL=price_...
- NEXT_PUBLIC_APP_URL=http://localhost:3000

Current Status:
${validateStripeEnvironment().errors.map(error => `❌ ${error}`).join('\n')}
`;
}

// Client-side check (only checks public keys)
export function validateClientStripeConfig(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.startsWith('pk_') &&
    process.env.NEXT_PUBLIC_APP_URL
  );
}