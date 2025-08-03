// HTTP router configuration for Convex Auth
// Handles authentication routes and integrates with existing API endpoints

import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { auth } from "./auth.config";

const http = httpRouter();

// Add Convex Auth HTTP routes for authentication endpoints
auth.addHttpRoutes(http);

// Add custom HTTP routes for integration with Stripe and other services
// These routes can be accessed at https://your-deployment.convex.site/api/custom-route

// Health check endpoint

http.route({
  path: "/health",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    return new Response(
      JSON.stringify({ 
        status: "healthy", 
        timestamp: new Date().toISOString(),
        version: "1.0.0"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }),
});

// Integration endpoint for Stripe webhooks (if needed)
// This would be handled by the existing Stripe webhook in the Next.js API routes
// but we can provide a backup endpoint here if needed
http.route({
  path: "/stripe/webhook-backup",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // This is a backup webhook endpoint
    // The primary webhook should be handled by /api/stripe-webhook in Next.js
    
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return new Response("Missing stripe signature", { status: 400 });
    }

    // Log the webhook attempt for monitoring
    console.log("Backup Stripe webhook received at:", new Date().toISOString());
    
    return new Response(
      JSON.stringify({ 
        message: "Webhook received at backup endpoint - configure primary endpoint",
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }),
});

// Export the configured HTTP router
export default http;