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

  // Helper function to handle shop ownership conflicts
  const handleShopOwnershipConflict = async (userId: number, currentShopId: string, newShopId: string) => {
    try {
      // Check if user is the only member of their current shop
      const currentShopMembers = await db.user.count({
        where: { shopId: currentShopId },
      });

      if (currentShopMembers === 1) {
        // User owns the current shop - they're the only member
        console.log(`User ${userId} owns shop ${currentShopId} and is joining ${newShopId}`);
        
        // Get shop details for logging
        const currentShop = await db.shop.findUnique({
          where: { id: currentShopId },
          select: { name: true, slug: true },
        });
        
        console.log(`Deleting user's shop: ${currentShop?.name} (${currentShop?.slug})`);
        
        // Delete the user's own shop
        await db.shop.delete({
          where: { id: currentShopId },
        });
        
        return { action: 'deleted_own_shop', shopName: currentShop?.name };
      } else {
        // User is not the only member - just remove them from the shop
        console.log(`User ${userId} is leaving shop ${currentShopId} (${currentShopMembers} members remain)`);
        
        await db.user.update({
          where: { id: userId },
          data: { shopId: null },
        });
        
        return { action: 'left_shop', remainingMembers: currentShopMembers - 1 };
      }
    } catch (error) {
      console.error('Error handling shop ownership conflict:', error);
      throw error;
    }
  };

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

  if(evt.type === 'user.updated') {
    const userData = evt.data as {
      id: string;
      email_addresses: Array<{ email_address: string }>;
      first_name?: string;
      last_name?: string;
    };
    
    const { id, email_addresses, first_name, last_name } = userData;
    const email = email_addresses[0]?.email_address ?? '';
    const name = `${first_name ?? ''} ${last_name ?? ''}`.trim() || null;
    
    console.log('Updating user in database:', { id, email, first_name, last_name })
    
    try {
      // Check if user exists by clerkId first
      const existingUser = await db.user.findUnique({
        where: { clerkId: id },
      });

      if (existingUser) {
        // Update existing user
        const updatedUser = await db.user.update({
          where: { clerkId: id },
          data: {
            email,
            name,
          }
        });
        
        console.log('Successfully updated user in database:', updatedUser)
      } else {
        // Check if user exists by email (for invitation flow)
        const userByEmail = await db.user.findUnique({
          where: { email },
        });

        if (userByEmail) {
          // Handle the case where we have a user by email but no clerkId
          // This happens when invitation was accepted before account creation
          if (!userByEmail.clerkId) {
            // Link the existing user to the Clerk account
            const updatedUser = await db.user.update({
              where: { email },
              data: {
                clerkId: id,
                name: name ?? userByEmail.name,
              }
            });
            
            console.log('Successfully linked invited user to Clerk account:', updatedUser)
          } else {
            // This is a conflict - we have two users with the same email
            // We need to merge them or handle the conflict
            console.warn(`Conflict detected: User with email ${email} already has clerkId ${userByEmail.clerkId}, but new clerkId is ${id}`);
            
            // Option 1: Update the existing user (if they're the same person)
            // Option 2: Create a new user and handle the conflict
            // For now, we'll update the existing user to avoid duplicates
            const updatedUser = await db.user.update({
              where: { email },
              data: {
                clerkId: id, // Update to the new clerkId
                name: name ?? userByEmail.name,
              }
            });
            
            console.log('Resolved conflict by updating existing user:', updatedUser)
          }
        } else {
          // Create new user
          const newUser = await db.user.create({
            data: {
              clerkId: id,
              email,
              name,
            }
          });
          
          console.log('Successfully created new user in database:', newUser)
        }
      }
      
      return new Response('User updated successfully', {
        status: 200,
      })
    } catch(error) {
      console.error('Error: Failed to update user in the database:', error)
      return new Response('Error: Failed to update user in the database', {
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
    const membershipData = evt.data as { 
      organization: { id: string }; 
      public_user_data: { identifier: string; first_name?: string; last_name?: string };
      role: string;
    };
  
    const email = membershipData.public_user_data?.identifier;
    const name = `${membershipData.public_user_data?.first_name ?? ''} ${membershipData.public_user_data?.last_name ?? ''}`.trim() || null;
    const organizationId = membershipData.organization?.id;
    const role = membershipData.role;
  
    console.log('Organization membership created:', { email, name, organizationId, role });
  
    try {
      // First, try to find an existing user by email
      const existingUser = await db.user.findUnique({
        where: { email },
        include: {
          shop: true, // Include shop info to check if user owns a shop
        },
      });

      if (existingUser) {
        // User already exists - handle different scenarios
        if (existingUser.shopId === organizationId) {
          // User is already a member of this shop
          console.log(`User ${email} is already a member of shop ${organizationId}`);
          return new Response('User already a member', { status: 200 });
        }

        if (existingUser.shopId && existingUser.shopId !== organizationId) {
          // User is a member of a different shop - handle shop ownership conflict
          console.log(`User ${email} is currently a member of shop ${existingUser.shopId}, joining new shop ${organizationId}`);
          
          // Use helper function to handle the conflict
          const conflictResult = await handleShopOwnershipConflict(
            existingUser.id,
            existingUser.shopId,
            organizationId
          );
          
          console.log('Shop ownership conflict resolved:', conflictResult);
        }

        // Update user to link to the new shop
        const updatedUser = await db.user.update({
          where: { email },
          data: {
            shopId: organizationId,
            name: name ?? existingUser.name, // Keep existing name if no new name provided
          },
        });
        
        console.log(`Successfully linked existing user ${email} to shop ${organizationId}:`, updatedUser);
      } else {
        // User doesn't exist - create them (this happens when invitation is accepted before account creation)
        const newUser = await db.user.create({
          data: {
            email,
            name,
            clerkId: "", // Will be set when user completes account creation
            shopId: organizationId,
          },
        });
        console.log(`Created new user for invitation acceptance:`, newUser);
      }
    } catch (error) {
      console.error("Error handling organization membership creation:", error);
      return new Response('Error handling membership creation', { status: 500 });
    }
  }
  
  if (evt.type === 'organizationMembership.updated') {
    const membershipData = evt.data as { 
      organization: { id: string }; 
      public_user_data: { identifier: string };
      role: string;
    };
  
    const email = membershipData.public_user_data?.identifier;
    const organizationId = membershipData.organization?.id;
    const role = membershipData.role;
  
    console.log('Organization membership updated:', { email, organizationId, role });
  
    // Update user role in database if needed
    try {
      await db.user.update({
        where: { email },
        data: {
          // You might want to store role information in your database
          // For now, we'll just log the role change
        },
      });
      console.log(`Updated user ${email} role to ${role} in shop ${organizationId}`);
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  }

  if (evt.type === 'organizationMembership.deleted') {
    const membershipData = evt.data as { 
      organization: { id: string }; 
      public_user_data: { identifier: string };
    };
  
    const email = membershipData.public_user_data?.identifier;
    const organizationId = membershipData.organization?.id;
  
    console.log('Organization membership deleted:', { email, organizationId });
  
    // Remove user from shop in database
    try {
      await db.user.update({
        where: { email },
        data: {
          shopId: null,
        },
      });
      console.log(`Removed user ${email} from shop ${organizationId}`);
    } catch (error) {
      console.error("Error removing user from shop:", error);
    }
  }

  return new Response('Webhook received', { status: 200 })
}