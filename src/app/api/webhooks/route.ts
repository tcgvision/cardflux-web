// /src/api/webhooks/route.ts
import { Webhook } from 'svix'
import { headers } from 'next/headers'
import type { WebhookEvent } from '@clerk/nextjs/server'
import { db } from '~/server/db'
import { normalizeRole } from '~/lib/roles'
import { env } from '~/env'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = env.SIGNING_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400
    })
  }

  // Get the body
  const payload = await req.text()
  const body = JSON.parse(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred', {
      status: 400
    })
  }

  // Get the ID and type
  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`Webhook received: ${eventType} for ID: ${id}`);

  try {
    switch (eventType) {
      case 'user.created':
        await handleUserCreated(evt.data);
        break;
      case 'user.updated':
        await handleUserUpdated(evt.data);
        break;
      case 'user.deleted':
        await handleUserDeleted(evt.data);
        break;
      case 'organization.created':
        await handleOrganizationCreated(evt.data);
        break;
      case 'organization.updated':
        await handleOrganizationUpdated(evt.data);
        break;
      case 'organization.deleted':
        await handleOrganizationDeleted(evt.data);
        break;
      case 'organizationMembership.created':
        await handleMembershipCreated(evt.data);
        break;
      case 'organizationMembership.updated':
        await handleMembershipUpdated(evt.data);
        break;
      case 'organizationMembership.deleted':
        await handleMembershipDeleted(evt.data);
        break;
      default:
        console.log(`Unhandled webhook event type: ${eventType}`);
    }

    return new Response('Webhook processed successfully', { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response('Error processing webhook', { status: 500 });
  }
}

// Simple webhook handlers that directly perform database operations

async function handleUserCreated(userData: any) {
  const { id, email_addresses, first_name, last_name } = userData;
  
  const email = email_addresses?.[0]?.email_address;
  
  if (!email) {
    console.error('No email found for user:', id);
    return;
  }

  const name = [first_name, last_name].filter(Boolean).join(' ') || null;

  try {
    await db.user.upsert({
      where: { clerkId: id },
      update: {
        email,
        name,
      },
      create: {
        clerkId: id,
        email,
        name,
      },
    });
    
    console.log(`User created/updated: ${id}`);
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

async function handleUserUpdated(userData: any) {
  const { id, email_addresses, first_name, last_name } = userData;
  
  const email = email_addresses?.[0]?.email_address;
  
  if (!email) {
    console.error('No email found for user:', id);
    return;
  }

  const name = [first_name, last_name].filter(Boolean).join(' ') || null;

  try {
    await db.user.update({
      where: { clerkId: id },
      data: {
        email,
        name,
      },
    });
    
    console.log(`User updated: ${id}`);
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

async function handleUserDeleted(userData: any) {
  const { id } = userData;

  try {
    await db.user.delete({
      where: { clerkId: id },
    });
    
    console.log(`User deleted: ${id}`);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

async function handleOrganizationCreated(orgData: any) {
  const { id, name, slug } = orgData;

  try {
    await db.shop.upsert({
      where: { id },
      update: {
        name,
        slug,
        clerkOrgId: id, // Link to Clerk organization ID
      },
      create: {
        id,
        name,
        slug,
        type: 'local',
        clerkOrgId: id, // Link to Clerk organization ID
      },
    });
    
    console.log(`Organization created: ${id}`);
  } catch (error) {
    console.error('Error creating organization:', error);
    throw error;
  }
}

async function handleOrganizationUpdated(orgData: any) {
  const { id, name, slug, private_metadata } = orgData;

  try {
    await db.shop.update({
      where: { id },
      data: {
        name,
        slug,
        // Update billing information from Clerk's private metadata
        planId: private_metadata?.planId || 'starter',
        planStatus: private_metadata?.planStatus || 'active',
        clerkSubscriptionId: private_metadata?.subscriptionId,
        trialEndsAt: private_metadata?.trialEndsAt ? new Date(private_metadata.trialEndsAt) : null,
      },
    });
    
    console.log(`Organization updated: ${id}`);
  } catch (error) {
    console.error('Error updating organization:', error);
    throw error;
  }
}

async function handleOrganizationDeleted(orgData: any) {
  const { id } = orgData;

  try {
    await db.shop.delete({
      where: { id },
    });
    
    console.log(`Organization deleted: ${id}`);
  } catch (error) {
    console.error('Error deleting organization:', error);
    throw error;
  }
}

async function handleMembershipCreated(membershipData: any) {
  const { organization, public_user_data, role } = membershipData;
  const { id: orgId } = organization;
  const { identifier: userId } = public_user_data;
  const normalizedRole = normalizeRole(role);

  try {
    // Update user with shopId and role
    await db.user.update({
      where: { clerkId: userId },
      data: {
        shopId: orgId,
        role: normalizedRole,
      },
    });
    
    console.log(`Membership created: User ${userId} added to org ${orgId} with role ${normalizedRole}`);
  } catch (error) {
    console.error('Error creating membership:', error);
    throw error;
  }
}

async function handleMembershipUpdated(membershipData: any) {
  const { organization, public_user_data, role } = membershipData;
  const { id: orgId } = organization;
  const { identifier: userId } = public_user_data;
  const normalizedRole = normalizeRole(role);

  try {
    // Update user's role
    await db.user.update({
      where: { clerkId: userId },
      data: {
        role: normalizedRole,
      },
    });
    
    console.log(`Membership updated: User ${userId} role changed to ${normalizedRole} in org ${orgId}`);
  } catch (error) {
    console.error('Error updating membership:', error);
    throw error;
  }
}

async function handleMembershipDeleted(membershipData: any) {
  const { organization, public_user_data } = membershipData;
  const { identifier: userId } = public_user_data;

  try {
    // Remove user's shop association and role
    await db.user.update({
      where: { clerkId: userId },
      data: {
        shopId: null,
        role: null,
      },
    });
    
    console.log(`Membership deleted: User ${userId} removed from org`);
  } catch (error) {
    console.error('Error deleting membership:', error);
    throw error;
  }
}