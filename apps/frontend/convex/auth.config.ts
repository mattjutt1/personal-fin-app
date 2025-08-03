import { convexAuth } from "@convex-dev/auth/server";
import GitHub from "@auth/core/providers/github";
import Google from "@auth/core/providers/google";
import { Password } from "@convex-dev/auth/providers/Password";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile(params) {
        return {
          email: params.email as string,
          name: params.name as string,
        };
      },
    }),
    GitHub({
      profile(profile) {
        return {
          email: profile.email!,
          name: profile.name || profile.login,
        };
      },
    }),
    Google({
      profile(profile) {
        return {
          email: profile.email!,
          name: profile.name!,
        };
      },
    }),
  ],
  callbacks: {
    async createOrUpdateUser(ctx, args) {
      // Production-ready callback for user creation and updates
      // Integrates with existing subscription and family system
      
      const now = Date.now();
      const email = args.profile.email!;
      const name = args.profile.name!;

      try {
        // Find existing user by email  
        const existingUser = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("email"), email))
          .first();

        if (existingUser) {
          // Update existing user with fresh auth provider data
          await ctx.db.patch(existingUser._id, {
            name: name,
            updatedAt: now,
          });

          // Log authentication event for security monitoring
          await ctx.db.insert("auditTrail", {
            eventId: `auth_${existingUser._id}_${now}`,
            eventType: "USER_AUTHENTICATION",
            userId: existingUser._id.toString(),
            resourceType: "user",
            resourceId: existingUser._id.toString(),
            action: "SIGN_IN",
            timestamp: now,
            complianceRelevant: true,
            retentionRequired: true,
          });

          return existingUser._id;
        }

        // Create new user with default subscription settings
        const userId = await ctx.db.insert("users", {
          email: email,
          name: name,
          // Default subscription configuration
          subscriptionStatus: "free",
          hasAccessToBankIntegration: false,
          hasAccessToUnlimitedFamilies: false,
          hasAccessToPredictiveAlerts: false,
          hasAccessToAdvancedAnalytics: false,
          hasUsedTrial: false,
          trialEndDate: undefined,
          stripeCustomerId: undefined,
          stripeSubscriptionId: undefined,
          subscriptionEndDate: undefined,
          // Timestamps
          createdAt: now,
          updatedAt: now,
        });

        // Log user creation event
        await ctx.db.insert("auditTrail", {
          eventId: `user_created_${userId}_${now}`,
          eventType: "USER_CREATION",
          userId: userId.toString(),
          resourceType: "user",
          resourceId: userId.toString(),
          action: "CREATE",
          timestamp: now,
          complianceRelevant: true,
          retentionRequired: true,
        });

        // Create subscription event for analytics
        await ctx.db.insert("subscriptionEvents", {
          userId: userId,
          eventType: "trial_started",
          subscriptionTier: "free",
          metadata: {
            reason: "new_user_registration",
          },
          createdAt: now,
        });

        return userId;
      } catch (error) {
        // Log error for monitoring and debugging
        await ctx.db.insert("errorLogs", {
          operation: "createOrUpdateUser",
          errorType: "AuthError",
          errorMessage: error instanceof Error ? error.message : "Unknown error during user creation",
          context: {
            timestamp: now,
            userAgent: undefined,
            retryAttempt: 0,
          },
          resolved: false,
          createdAt: now,
        });

        throw error;
      }
    },

    async redirect({ redirectTo }) {
      // Security callback to validate redirect URLs
      // Prevents open redirect attacks
      
      const allowedDomains = [
        process.env.SITE_URL || "http://localhost:3000",
        "http://localhost:3000",
        "https://localhost:3000",
      ];

      // Add production domains if configured
      if (process.env.CONVEX_SITE_URL) {
        allowedDomains.push(process.env.CONVEX_SITE_URL);
      }

      // Check if redirectTo is a relative path or allowed domain
      if (redirectTo.startsWith("/")) {
        return redirectTo; // Relative paths are safe
      }

      // Check against allowed domains
      const isAllowed = allowedDomains.some(domain => 
        redirectTo.startsWith(domain)
      );

      if (!isAllowed) {
        throw new Error(`Invalid redirect URL: ${redirectTo}. Only authorized domains are allowed.`);
      }

      return redirectTo;
    },
  },
});