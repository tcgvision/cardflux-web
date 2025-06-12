import { Webhook } from "svix";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { env } from "~/env";
import { headers } from "next/headers";

// Type definitions for better type safety
interface ClerkUserData {
  id: string;
  email_addresses?: Array<{
    email_address: string;
    id: string;
  }>;
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
}

type UserCreatedEvent = WebhookEvent & {
  type: "user.created";
  data: ClerkUserData;
};

type UserUpdatedEvent = WebhookEvent & {
  type: "user.updated";
  data: ClerkUserData;
};

type UserDeletedEvent = WebhookEvent & {
  type: "user.deleted";
  data: {
    id: string;
  };
};

type SupportedWebhookEvent = UserCreatedEvent | UserUpdatedEvent | UserDeletedEvent;

// Helper function to safely get primary email
function getPrimaryEmail(emailAddresses: ClerkUserData['email_addresses']): string | null {
  return emailAddresses?.[0]?.email_address ?? null;
}

// Helper function to get display name
function getDisplayName(firstName?: string | null, username?: string | null): string {
  return firstName ?? username ?? "Anonymous";
}

// Required for Clerk's raw body signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: Request): Promise<Response> {
  try {
    const headersList = await headers();
    const svixId = headersList.get("svix-id");
    const svixTimestamp = headersList.get("svix-timestamp");
    const svixSignature = headersList.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      console.warn("Missing required svix headers");
      return new Response("Missing required headers", { status: 400 });
    }

    if (!env.CLERK_WEBHOOK_SECRET) {
      console.error("CLERK_WEBHOOK_SECRET environment variable is not configured");
      return new Response("Server configuration error", { status: 500 });
    }

    const rawBody = await req.text();
    const webhook = new Webhook(env.CLERK_WEBHOOK_SECRET);

    let event: WebhookEvent;
    try {
      event = webhook.verify(rawBody, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as WebhookEvent;
    } catch (error) {
      console.error("Webhook signature verification failed:", error);
      return new Response("Invalid webhook signature", { status: 400 });
    }

    // Handle the webhook event
    const eventType = event.type;
    console.log("Processing webhook event:", eventType);

    switch (eventType) {
      case "user.created":
      case "user.updated": {
        const { id, email_addresses, first_name, username } = event.data as ClerkUserData;
        const primaryEmail = getPrimaryEmail(email_addresses);

        if (!primaryEmail) {
          console.warn("User without primary email:", id);
          return new Response("User must have a primary email", { status: 400 });
        }

        try {
          await db.user.upsert({
            where: { id },
            create: {
              id,
              email: primaryEmail,
              name: getDisplayName(first_name, username),
            },
            update: {
              email: primaryEmail,
              name: getDisplayName(first_name, username),
            },
          });
          console.info("✅ User synced successfully:", { id, email: primaryEmail });
        } catch (error) {
          console.error("Failed to sync user:", { id, error });
          return new Response("Failed to sync user", { status: 500 });
        }
        break;
      }

      case "user.deleted": {
        const { id } = event.data as { id: string };
        try {
          await db.user.delete({
            where: { id },
          });
          console.info("🗑️ User deleted successfully:", { id });
        } catch (error) {
          console.error("Failed to delete user:", { id, error });
          return new Response("Failed to delete user", { status: 500 });
        }
        break;
      }

      default:
        console.log(`Unhandled webhook event type: ${eventType}`);
    }

    return new Response("Webhook processed successfully", { status: 200 });
  } catch (error) {
    console.error("Unexpected error processing webhook:", error);
    return new Response("Internal server error", { status: 500 });
  }
}