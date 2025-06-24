import { Webhook } from 'svix'
import { headers } from 'next/headers'
import type { WebhookEvent } from '@clerk/nextjs/server'
import { db } from '~/server/db'


export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET

  if (!SIGNING_SECRET) {
    throw new Error('Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // Create new Svix instance with secret
  const wh = new Webhook(SIGNING_SECRET)

  // Get headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing Svix headers', {
      status: 400,
    })
  }

  // Get body
  const payload = await req.json() as Record<string, unknown>;
  const body = JSON.stringify(payload)

  let evt: WebhookEvent

  // Verify payload with headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error: Could not verify webhook:', err)
    return new Response('Error: Verification error', {
      status: 400,
    })
  }

  // // Do something with payload
  // // For this guide, log payload to console
  const eventData = evt.data as unknown as Record<string, unknown>;
  const { id } = eventData;
  const eventType = evt.type
  console.log(`Received webhook with ID ${String(id)} and event type of ${eventType}`)
  console.log('Webhook payload:', body)

  if(evt.type === 'user.created') {
    const userData = evt.data as {
      id: string;
      email_addresses: Array<{ email_address: string }>;
      first_name?: string;
      last_name?: string;
    };
    
    const { id, email_addresses, first_name, last_name } = userData;
    console.log('Creating user in database:', { id, email: email_addresses[0]?.email_address, first_name, last_name })
    
    try {
      const newUser = await db.user.create({
        data: {
          clerkId: id,
          email: email_addresses[0]?.email_address ?? '',
          name: `${first_name ?? ''} ${last_name ?? ''}`.trim() || null,
        }
      });
      
      console.log('Successfully created user in database:', newUser)
      return new Response(JSON.stringify(newUser), {
        status: 201,
      })
    } catch(error) {
      console.error('Error: Failed to store user in the database:', error)
      return new Response('Error: Failed to store user in the database', {
        status: 500,
      });
    }
  }

  if (evt.type === 'organization.created') {
    const orgData = evt.data as { 
      id: string; 
      name: string; 
      slug: string; 
    };
    
    const { id, name, slug } = orgData;
    try {
      const newShop = await db.shop.upsert({
        where: { id },
        update: {},
        create: {
          id, 
          name, 
          slug,
          type: "local", // Default type since it's required
        },
      });
      console.log("Created Shop (Org):", newShop);
    } catch (error) {
      console.error("Error creating shop:", error);
    }
  }
  
  if (evt.type === 'organizationMembership.created') {
    const { organization, public_user_data } = evt.data as { organization: { id: string }; public_user_data: { identifier: string; first_name: string } };
  
    const email = public_user_data?.identifier;
    const name = public_user_data?.first_name;
  
    try {
      await db.user.update({
        where: { email },
        data: {
          shopId: organization.id,
          name: name ?? undefined,
        },
      });
      console.log(`Linked user to shop: ${organization.id}`);
    } catch (error) {
      console.error("Error linking user to shop:", error);
    }
  }
  

  return new Response('Webhook received', { status: 200 })
}