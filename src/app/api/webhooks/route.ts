// /src/api/webhooks/route.ts
import { Webhook } from 'svix'
import { headers } from 'next/headers'
import type { WebhookEvent } from '@clerk/nextjs/server'
import { db } from '~/server/db'
import { env } from '~/env'
import { syncRoleToDatabase } from '~/lib/roles'
import type { PrismaClient } from '@prisma/client'

export async function POST(req: Request) {
  const SIGNING_SECRET = env.SIGNING_SECRET ?? process.env.SIGNING_SECRET

  if (!SIGNING_SECRET) {
    console.error('SIGNING_SECRET is not configured')
    return new Response('Webhook signing secret not configured', {
      status: 500,
    })
  }

  const wh = new Webhook(SIGNING_SECRET)
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing Svix headers', { status: 400 })
  }

  const payload = await req.json() as Record<string, unknown>
  const body = JSON.stringify(payload)

  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error: Could not verify webhook:', err)
    return new Response('Error: Verification error', { status: 400 })
  }

  const eventData = evt.data as unknown as Record<string, unknown>
  const { id } = eventData
  const eventType = evt.type
  console.log(`Received webhook: ${eventType} for ID ${String(id)}`)

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
      case 'organization.created':
        console.log('🔄 Processing organization.created event')
        await handleOrganizationCreated(evt.data as OrganizationCreatedData)
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
      default:
        console.log(`⚠️ Unhandled webhook event: ${evt.type}`)
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

type OrganizationCreatedData = {
  id: string
  name: string
  slug: string
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

  console.log('Creating user:', { id, email, name })

  // Check if user already exists (from invitation flow)
  const existingUser = await db.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    // Update existing user with Clerk ID
    const updatedUser = await db.user.update({
      where: { email },
      data: {
        clerkId: id,
        name: name ?? existingUser.name,
      },
    })
    console.log('Linked existing user to Clerk account:', updatedUser)
    return updatedUser
  } else {
    // Create new user
    const newUser = await db.user.create({
      data: {
        clerkId: id,
        email,
        name,
      },
    })
    console.log('Created new user:', newUser)
    return newUser
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
          location: null,
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

      // Update user's shop
      user = await tx.user.update({
        where: { email },
        data: {
          shopId: organizationId,
          name: name ?? user.name,
        },
      })
    } else {
      // Create new user (invitation accepted before account creation)
      user = await tx.user.create({
        data: {
          email,
          name,
          clerkId: '', // Will be set when user completes signup
          shopId: organizationId,
        },
      })
    }

    // Sync role to database
    await syncRoleToDatabase(tx, email, role, organizationId)
    console.log(`Synced role for ${email}: ${role}`)
  })
}

async function handleMembershipUpdated(membershipData: MembershipUpdatedData) {
  const email = membershipData.public_user_data?.identifier
  const organizationId = membershipData.organization?.id
  const role = membershipData.role

  console.log('Updating membership role:', { email, organizationId, role })

  await syncRoleToDatabase(db, email, role, organizationId)
  console.log(`Updated role for ${email}: ${role}`)
}

async function handleMembershipDeleted(membershipData: MembershipDeletedData) {
  const email = membershipData.public_user_data?.identifier
  const organizationId = membershipData.organization?.id

  console.log('Removing user from organization:', { email, organizationId })

  await db.user.updateMany({
    where: {
      email,
      shopId: organizationId,
    },
    data: {
      shopId: null,
      // role: null, // Clear role when removed from org - handled by syncRoleToDatabase
    },
  })
  console.log(`Removed ${email} from shop ${organizationId}`)
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