// /src/api/webhooks/route.ts
import { Webhook } from 'svix'
import { headers } from 'next/headers'
import type { WebhookEvent } from '@clerk/nextjs/server'
import { db } from '~/server/db'
import { syncRoleToDatabase, normalizeRole } from '~/lib/roles'
import { env } from '~/env'
import type { PrismaClient } from '@prisma/client'

export async function POST(req: Request) {
  console.log('🔍 Webhook received - checking configuration...')
  console.log('SIGNING_SECRET length:', env.SIGNING_SECRET?.length ?? 0)

  if (!env.SIGNING_SECRET) {
    console.error('❌ SIGNING_SECRET is not configured')
    return new Response('Webhook signing secret not configured', {
      status: 500,
    })
  }

  const wh = new Webhook(env.SIGNING_SECRET)
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  console.log('📋 Webhook headers:', {
    svix_id: svix_id?.substring(0, 10) + '...',
    svix_timestamp,
    svix_signature: svix_signature?.substring(0, 10) + '...',
  })

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('❌ Missing Svix headers:', { svix_id: !!svix_id, svix_timestamp: !!svix_timestamp, svix_signature: !!svix_signature })
    return new Response('Error: Missing Svix headers', { status: 400 })
  }

  const payload = await req.json() as Record<string, unknown>
  const body = JSON.stringify(payload)

  console.log('📦 Webhook payload type:', payload.type)
  console.log('📦 Webhook payload data keys:', Object.keys(payload.data ?? {}))

  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
    console.log('✅ Webhook verification successful')
  } catch (err) {
    console.error('❌ Error: Could not verify webhook:', err)
    return new Response('Error: Verification error', { status: 400 })
  }

  const eventData = evt.data as unknown as Record<string, unknown>
  const { id } = eventData
  const eventType = evt.type
  console.log(`🔄 Processing webhook: ${eventType} for ID ${String(id)}`)
  console.log('📊 Full event data:', JSON.stringify(evt.data, null, 2))

  try {
    switch (evt.type) {
      case 'user.created':
        console.log('🔄 Processing user.created event')
        await handleUserCreated(evt.data as UserCreatedData)
        break
      case 'user.updated':
        console.log('🔄 Processing user.updated event')
        await handleUserUpdated(evt.data as UserUpdatedData)
        break
      case 'user.deleted':
        console.log('🔄 Processing user.deleted event')
        await handleUserDeleted(evt.data as unknown as UserDeletedData)
        break
      case 'organization.created':
        console.log('🔄 Processing organization.created event')
        await handleOrganizationCreated(evt.data as OrganizationCreatedData)
        break
      case 'organization.updated':
        console.log('🔄 Processing organization.updated event')
        await handleOrganizationUpdated(evt.data as OrganizationUpdatedData)
        break
      case 'organization.deleted':
        console.log('🔄 Processing organization.deleted event')
        await handleOrganizationDeleted(evt.data as OrganizationDeletedData)
        break
      case 'organizationMembership.created':
        console.log('🔄 Processing organizationMembership.created event')
        await handleMembershipCreated(evt.data as MembershipCreatedData)
        break
      case 'organizationMembership.updated':
        console.log('🔄 Processing organizationMembership.updated event')
        await handleMembershipUpdated(evt.data as MembershipUpdatedData)
        break
      case 'organizationMembership.deleted':
        console.log('🔄 Processing organizationMembership.deleted event')
        await handleMembershipDeleted(evt.data as MembershipDeletedData)
        break
      // Future-proofing: Add handlers for potential future events
      case 'organizationInvitation.created':
        console.log('🔄 Processing organizationInvitation.created event')
        // TODO: Handle invitation creation if needed
        break
      case 'organizationInvitation.accepted':
        console.log('🔄 Processing organizationInvitation.accepted event')
        // TODO: Handle invitation acceptance if needed
        break
      case 'organizationInvitation.revoked':
        console.log('🔄 Processing organizationInvitation.revoked event')
        // TODO: Handle invitation revocation if needed
        break
      case 'session.created':
        console.log('🔄 Processing session.created event')
        // TODO: Handle session creation if needed
        break
      case 'session.revoked':
        console.log('🔄 Processing session.revoked event')
        // TODO: Handle session revocation if needed
        break
      default:
        console.log(`⚠️ Unhandled webhook event: ${evt.type}`)
        // Log the event data for debugging future events
        console.log(`📊 Event data:`, JSON.stringify(evt.data, null, 2))
    }

    console.log('✅ Webhook processed successfully')
    return new Response('Webhook processed successfully', { status: 200 })
  } catch (error) {
    console.error(`❌ Error processing webhook ${evt.type}:`, error)
    
    // Log more details for debugging
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        eventType: evt.type,
        eventData: evt.data,
      })
    }
    
    return new Response(`Error processing webhook: ${error instanceof Error ? error.message : 'Unknown error'}`, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}

// Type definitions for webhook data
type UserCreatedData = {
  id: string
  email_addresses: Array<{ email_address: string }>
  first_name?: string
  last_name?: string
}

type UserUpdatedData = UserCreatedData

type UserDeletedData = {
  id: string
  email_addresses: Array<{ email_address: string }>
}

type OrganizationCreatedData = {
  id: string
  name: string
  slug: string
}

type OrganizationUpdatedData = OrganizationCreatedData

type OrganizationDeletedData = {
  id: string
}

type MembershipCreatedData = {
  organization: { id: string }
  public_user_data: {
    identifier: string
    first_name?: string
    last_name?: string
  }
  role: string
}

type MembershipUpdatedData = {
  organization: { id: string }
  public_user_data: { identifier: string }
  role: string
}

type MembershipDeletedData = {
  organization: { id: string }
  public_user_data: { identifier: string }
}

// Helper functions for cleaner code
async function handleUserCreated(userData: UserCreatedData) {
  const { id, email_addresses, first_name, last_name } = userData
  const email = email_addresses[0]?.email_address ?? ''
  const name = `${first_name ?? ''} ${last_name ?? ''}`.trim() || null

  console.log('🔄 Creating user:', { id, email, name })
  console.log('📧 Email addresses:', email_addresses)
  console.log('👤 First name:', first_name)
  console.log('👤 Last name:', last_name)
  console.log('🔍 User signup method:', first_name && last_name ? 'Regular signup' : 'Minimal signup')

  try {
  // Check if user already exists (from invitation flow)
  const existingUser = await db.user.findUnique({
    where: { email },
  })

  if (existingUser) {
      console.log('📝 User already exists, updating with Clerk ID:', existingUser.id)
    // Update existing user with Clerk ID
    const updatedUser = await db.user.update({
      where: { email },
      data: {
        clerkId: id,
        name: name ?? existingUser.name,
      },
    })
      console.log('✅ Linked existing user to Clerk account:', updatedUser.id)
    return updatedUser
  } else {
      console.log('🆕 Creating new user in database...')
    // Create new user
    const newUser = await db.user.create({
      data: {
        clerkId: id,
        email,
        name,
      },
    })
      console.log('✅ Created new user:', newUser.id)
    return newUser
    }
  } catch (error) {
    console.error('❌ Error in handleUserCreated:', error)
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        userData: { id, email, name },
        emailAddresses: email_addresses,
      })
    }
    throw error // Re-throw to be handled by the main webhook handler
  }
}

async function handleUserUpdated(userData: UserUpdatedData) {
  const { id, email_addresses, first_name, last_name } = userData
  const email = email_addresses[0]?.email_address ?? ''
  const name = `${first_name ?? ''} ${last_name ?? ''}`.trim() || null

  console.log('Updating user:', { id, email, name })

  // Always try to update by clerkId first
  const existingUser = await db.user.findUnique({
    where: { clerkId: id },
  })

  if (existingUser) {
    const updatedUser = await db.user.update({
      where: { clerkId: id },
      data: { email, name },
    })
    console.log('Updated user:', updatedUser)
    return updatedUser
  } else {
    // Fallback: try to find by email and link
    const userByEmail = await db.user.findUnique({
      where: { email },
    })

    if (userByEmail && !userByEmail.clerkId) {
      const updatedUser = await db.user.update({
        where: { email },
        data: {
          clerkId: id,
          name: name ?? userByEmail.name,
        },
      })
      console.log('Linked user by email:', updatedUser)
      return updatedUser
    } else {
      // Create new user if not found
      const newUser = await db.user.create({
        data: { clerkId: id, email, name },
      })
      console.log('Created user from update event:', newUser)
      return newUser
    }
  }
}

async function handleOrganizationCreated(orgData: OrganizationCreatedData) {
  const { id, name, slug } = orgData

  console.log('Creating organization:', { id, name, slug })

  try {
    // Use transaction to ensure data consistency
    const newShop = await db.$transaction(async (tx) => {
      // Create or update the shop
      const shop = await tx.shop.upsert({
        where: { id },
        update: { 
          name, 
          slug,
          updatedAt: new Date(),
        },
        create: {
          id,
          name,
          slug,
          type: 'local',
          description: null,
        },
      })

      // Create default shop settings if they don't exist
      await tx.shopSettings.upsert({
        where: { shopId: id },
        update: {},
        create: {
          shopId: id,
          defaultCurrency: 'USD',
          enableNotifications: true,
          autoPriceSync: true,
          lowStockThreshold: 5,
          enableStoreCredit: true,
          minCreditAmount: 0,
          maxCreditAmount: 1000,
        },
      })

      console.log('✅ Shop and settings created/updated:', shop)
      return shop
    })

    return newShop
  } catch (error) {
    console.error('❌ Error creating organization:', error)
    throw error
  }
}

async function handleMembershipCreated(membershipData: MembershipCreatedData) {
  const email = membershipData.public_user_data?.identifier
  const name = `${membershipData.public_user_data?.first_name ?? ''} ${membershipData.public_user_data?.last_name ?? ''}`.trim() || null
  const organizationId = membershipData.organization?.id
  const role = membershipData.role

  console.log('Processing membership creation:', {
    email,
    organizationId,
    role,
  })

  // First check if the shop exists in our database
  const existingShop = await db.shop.findUnique({
    where: { id: organizationId },
    select: { id: true, name: true, slug: true },
  })

  if (!existingShop) {
    console.log(`⚠️ Shop ${organizationId} not found in database, skipping membership creation (shop may have been deleted or never created)`)
    return
  }

  console.log(`🔄 Found shop for membership: ${existingShop.name} (${existingShop.slug})`)

  // Use transaction for data consistency
  await db.$transaction(async (tx) => {
    // Find or create user
    let user = await tx.user.findUnique({
      where: { email },
    })

    if (user) {
      // Handle shop ownership conflicts
      if (user.shopId && user.shopId !== organizationId) {
        await handleShopOwnershipConflict(tx, user.id, user.shopId, organizationId)
      }

      // Update user's shop and role
      user = await tx.user.update({
        where: { email },
        data: {
          shopId: organizationId,
          name: name ?? user.name,
          role: role, // Always update role when membership is created
        },
      })
      console.log(`✅ Updated existing user ${email} with shop ${organizationId} and role ${role}`)
    } else {
      // Create new user (invitation accepted before account creation)
      user = await tx.user.create({
        data: {
          email,
          name,
          clerkId: '', // Will be set when user completes signup
          shopId: organizationId,
          role: role, // Set role immediately
        },
      })
      console.log(`✅ Created new user ${email} with shop ${organizationId} and role ${role}`)
    }

    // Verify the update/creation worked
    const verifyUser = await tx.user.findUnique({
      where: { email },
      select: { id: true, email: true, shopId: true, role: true },
    })

    console.log(`🔍 Verification - User ${email}:`, {
      id: verifyUser?.id,
      shopId: verifyUser?.shopId,
      role: verifyUser?.role,
      expectedShopId: organizationId,
      expectedRole: role,
    })

    if (verifyUser?.shopId !== organizationId || verifyUser?.role !== role) {
      console.error(`❌ User ${email} not properly linked or role not set correctly`)
      throw new Error(`Failed to properly link user ${email} to shop ${organizationId} with role ${role}`)
    }
  })
}

async function handleMembershipUpdated(membershipData: MembershipUpdatedData) {
  const email = membershipData.public_user_data?.identifier
  const organizationId = membershipData.organization?.id
  const role = membershipData.role

  console.log('Updating membership role:', { email, organizationId, role })

  // First check if the shop exists in our database
  const existingShop = await db.shop.findUnique({
    where: { id: organizationId },
    select: { id: true, name: true, slug: true },
  })

  if (!existingShop) {
    console.log(`⚠️ Shop ${organizationId} not found in database, skipping membership update (shop may have been deleted or never created)`)
    return
  }

  console.log(`🔄 Found shop for membership update: ${existingShop.name} (${existingShop.slug})`)

  if (role === "org:admin" || role === "org:member") {
    await db.user.update({
      where: { email },
      data: { role: role },
    });
    console.log(`Updated role for ${email}: ${role}`);
  } else {
    console.warn(`Invalid role received from Clerk: ${role}`);
  }
}

async function handleMembershipDeleted(membershipData: MembershipDeletedData) {
  const email = membershipData.public_user_data?.identifier
  const organizationId = membershipData.organization?.id

  console.log('👤 Removing user from organization:', { email, organizationId })

  // First check if the shop exists in our database
  const existingShop = await db.shop.findUnique({
    where: { id: organizationId },
    select: { id: true, name: true, slug: true },
  })

  if (!existingShop) {
    console.log(`⚠️ Shop ${organizationId} not found in database, skipping membership deletion (shop may have been deleted or never created)`)
    return
  }

  console.log(`🔄 Found shop for membership deletion: ${existingShop.name} (${existingShop.slug})`)

  try {
    // Use transaction for data consistency
    await db.$transaction(async (tx) => {
      // Find the user
      const user = await tx.user.findUnique({
        where: { email },
      })

      if (!user) {
        console.log(`⚠️ User not found in database: ${email}`)
        return
      }

      // Check if user is being removed from their current shop
      if (user.shopId === organizationId) {
        // Remove user from shop and clear their role
        const updatedUser = await tx.user.update({
          where: { email },
          data: {
            shopId: null,
            role: null, // Clear role when removed from organization
          },
        })

        console.log(`✅ Removed ${email} from shop ${organizationId} and cleared role`)
        console.log(`📊 User status: shopId=${updatedUser.shopId}, role=${updatedUser.role}`)
      } else {
        console.log(`⚠️ User ${email} is not a member of shop ${organizationId} (current shop: ${user.shopId})`)
      }
    })
  } catch (error) {
    console.error(`❌ Error removing user ${email} from organization ${organizationId}:`, error)
    throw error
  }
}

// Enhanced shop ownership conflict handler
async function handleShopOwnershipConflict(
  tx: Parameters<Parameters<typeof db.$transaction>[0]>[0],
  userId: number,
  currentShopId: string,
  newShopId: string
) {
  const currentShopMembers = await tx.user.count({
    where: { shopId: currentShopId },
  })

  if (currentShopMembers === 1) {
    // User owns the shop - delete it
    const currentShop = await tx.shop.findUnique({
      where: { id: currentShopId },
      select: { name: true, slug: true },
    })

    console.log(
      `Deleting user's shop: ${currentShop?.name} (${currentShop?.slug})`
    )

    await tx.shop.delete({
      where: { id: currentShopId },
    })

    return { action: 'deleted_own_shop', shopName: currentShop?.name }
  } else {
    // Just remove user from shop
    console.log(
      `User leaving shop ${currentShopId} (${currentShopMembers} members remain)`
    )

    await tx.user.update({
      where: { id: userId },
      data: { shopId: null },
      // role: null, // Clear role when removed from org - handled by syncRoleToDatabase
    })

    return { action: 'left_shop', remainingMembers: currentShopMembers - 1 }
  }
}

// Handle user deletion
async function handleUserDeleted(userData: UserDeletedData) {
  const { id } = userData

  console.log('Deleting user:', { id })

  try {
    // Remove user from database
    await db.user.deleteMany({
      where: { clerkId: id },
    })

    console.log(`✅ Deleted user with clerkId: ${id}`)
  } catch (error) {
    console.error('❌ Error deleting user:', error)
    throw error
  }
}

// Handle organization updates
async function handleOrganizationUpdated(orgData: OrganizationUpdatedData) {
  const { id, name, slug } = orgData

  console.log('Updating organization:', { id, name, slug })

  try {
    // First check if the shop exists in our database
    const existingShop = await db.shop.findUnique({
      where: { id },
      select: { id: true, name: true, slug: true },
    })

    if (!existingShop) {
      console.log(`⚠️ Shop ${id} not found in database, skipping update (may have been deleted or never created)`)
      return
    }

    const updatedShop = await db.shop.update({
      where: { id },
      data: {
        name,
        slug,
        updatedAt: new Date(),
      },
    })

    console.log('✅ Organization updated:', updatedShop)
    return updatedShop
  } catch (error) {
    console.error('❌ Error updating organization:', error)
    throw error
  }
}

// Handle organization deletion
async function handleOrganizationDeleted(orgData: OrganizationDeletedData) {
  const { id } = orgData

  console.log('🗑️ Deleting organization:', { id })

  try {
    // First check if the shop exists in our database
    const existingShop = await db.shop.findUnique({
      where: { id },
      select: { id: true, name: true, slug: true },
    })

    if (!existingShop) {
      console.log(`⚠️ Shop ${id} not found in database, skipping deletion (may have been deleted already or never created)`)
      return
    }

    console.log(`🔄 Found shop to delete: ${existingShop.name} (${existingShop.slug})`)

    // Use transaction to ensure data consistency and proper cleanup order
    await db.$transaction(async (tx) => {
      console.log(`🔄 Starting cleanup for organization: ${id}`)

      // 1. First, remove all users from this organization (clear shopId and role)
      const usersRemoved = await tx.user.updateMany({
        where: { shopId: id },
        data: {
          shopId: null,
          role: null,
        },
      })
      console.log(`✅ Removed ${usersRemoved.count} users from organization ${id}`)

      // 2. Delete all store credit transactions for this shop
      const creditTransactionsDeleted = await tx.storeCreditTransaction.deleteMany({
        where: { shopId: id },
      })
      console.log(`✅ Deleted ${creditTransactionsDeleted.count} store credit transactions`)

      // 3. Delete all transaction items (must be done before transactions)
      const transactionItemsDeleted = await tx.transactionItem.deleteMany({
        where: {
          transaction: {
            shopId: id,
          },
        },
      })
      console.log(`✅ Deleted ${transactionItemsDeleted.count} transaction items`)

      // 4. Delete all transactions
      const transactionsDeleted = await tx.transaction.deleteMany({
        where: { shopId: id },
      })
      console.log(`✅ Deleted ${transactionsDeleted.count} transactions`)

      // 5. Delete all buylist items (must be done before buylists)
      const buylistItemsDeleted = await tx.buylistItem.deleteMany({
        where: {
          buylist: {
            shopId: id,
          },
        },
      })
      console.log(`✅ Deleted ${buylistItemsDeleted.count} buylist items`)

      // 6. Delete all buylists
      const buylistsDeleted = await tx.buylist.deleteMany({
        where: { shopId: id },
      })
      console.log(`✅ Deleted ${buylistsDeleted.count} buylists`)

      // 7. Delete all inventory items
      const inventoryItemsDeleted = await tx.inventoryItem.deleteMany({
        where: { shopId: id },
      })
      console.log(`✅ Deleted ${inventoryItemsDeleted.count} inventory items`)

      // 8. Delete all products
      const productsDeleted = await tx.product.deleteMany({
        where: { shopId: id },
      })
      console.log(`✅ Deleted ${productsDeleted.count} products`)

      // 9. Delete all customers
      const customersDeleted = await tx.customer.deleteMany({
        where: { shopId: id },
      })
      console.log(`✅ Deleted ${customersDeleted.count} customers`)

      // 10. Delete shop settings
      const settingsDeleted = await tx.shopSettings.deleteMany({
        where: { shopId: id },
      })
      console.log(`✅ Deleted shop settings`)

      // 11. Finally, delete the shop itself
      const shopDeleted = await tx.shop.delete({
        where: { id },
      })

      console.log(`✅ Successfully deleted shop: ${shopDeleted.name} (${shopDeleted.slug})`)
      console.log(`🎉 Complete cleanup finished for organization: ${id}`)
    })

    console.log(`✅ Organization deletion completed successfully: ${id}`)
  } catch (error) {
    console.error(`❌ Error deleting organization ${id}:`, error)
    
    // Log more specific error details
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        organizationId: id,
      })
    }
    
    throw error
  }
}