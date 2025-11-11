import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { clerkClient } from "@clerk/nextjs/server";

export const billingRouter = createTRPCRouter({
  // Get the current organization's billing status
  getBillingStatus: protectedProcedure
    .query(async ({ ctx }) => {
      const { orgId } = ctx.auth;

      if (!orgId) {
        throw new Error("No active organization selected.");
      }

      try {
        const clerk = await clerkClient();
        
        // Get organization details from Clerk
        const organization = await clerk.organizations.getOrganization({
          organizationId: orgId,
        });

        return {
          organization: {
            id: organization.id,
            name: organization.name,
            slug: organization.slug,
            privateMetadata: organization.privateMetadata,
          },
        };
      } catch (error) {
        console.error("Error getting billing status:", error);
        throw new Error("Failed to get billing status");
      }
    }),

  // Placeholder for billing portal session creation
  // This will be implemented once Clerk billing is properly configured
  createPortalSession: protectedProcedure
    .mutation(async ({ ctx }) => {
      const { orgId } = ctx.auth;

      if (!orgId) {
        throw new Error("No active organization selected.");
      }

      // For now, return a placeholder response
      // This will be replaced with actual Clerk billing integration
      throw new Error("Billing portal not yet configured. Please contact support.");
    }),
}); 