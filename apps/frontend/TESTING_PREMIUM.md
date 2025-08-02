# Testing Premium Features - Simple Daily Family Budget

## Quick Premium Testing

To test premium features without setting up Stripe, you can temporarily enable premium status.

### Enable Premium Testing Mode

1. **Edit the subscription hook**: 
   Open `src/hooks/useSubscription.ts`

2. **Uncomment the demo premium user block**:
   ```typescript
   // Uncomment this block around line 40:
   setSubscription({
     isPremium: true,
     isTrialing: true,
     status: 'trialing',
     trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
     features: {
       bankIntegration: true,
       unlimitedFamilies: true,
       predictiveAlerts: true,
       advancedAnalytics: true,
       prioritySupport: true,
       exportData: true,
     },
   });
   ```

3. **Save and reload** - You'll now see premium features enabled

### What You'll See

**Home Page Changes:**
- Premium badge appears next to the tagline
- "Go Premium" button is replaced with "Premium Active" status
- Trial end date is displayed

**Bank Sync Page:**
- Full bank connection interface is now accessible
- No paywall blocking the premium content
- All bank selection options are available

**UI Changes:**
- Premium features marked with 🔒 are now unlocked
- Bank sync link on home page shows as accessible

### Testing Stripe Integration

To test the actual Stripe flow:

1. **Set up Stripe** (see STRIPE_SETUP_GUIDE.md)
2. **Configure environment variables** in `.env.local`
3. **Use test cards** for checkout:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`

### Disable Premium Testing

To return to free tier:
1. Re-comment the demo premium user block in `useSubscription.ts`
2. Save and reload

---

**Note**: This is for development testing only. In production, premium status comes from actual Stripe subscriptions and user authentication.