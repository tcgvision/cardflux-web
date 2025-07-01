#!/usr/bin/env tsx

/**
 * Fix User-Shop Linking Issues
 * 
 * This script identifies and fixes users who are not properly linked to shops
 * or missing role assignments after shop creation.
 */

import { PrismaClient } from '@prisma/client'
import { clerkClient } from '@clerk/nextjs/server'

const prisma = new PrismaClient()

async function fixUserShopLinking() {
  try {
    console.log('🔍 Starting user-shop linking fix...')

    // Get all users without shopId
    const usersWithoutShop = await prisma.user.findMany({
      where: {
        shopId: null,
      },
      select: {
        id: true,
        clerkId: true,
        email: true,
        name: true,
        role: true,
      },
    })

    console.log(`📊 Found ${usersWithoutShop.length} users without shopId`)

    if (usersWithoutShop.length === 0) {
      console.log('✅ All users are already linked to shops')
      return
    }

    // Get all shops
    const shops = await prisma.shop.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
    })

    console.log(`🏪 Found ${shops.length} shops in database`)

    if (shops.length === 0) {
      console.log('❌ No shops found in database')
      return
    }

    let fixedCount = 0
    let errorCount = 0

    for (const user of usersWithoutShop) {
      try {
        console.log(`\n🔍 Processing user: ${user.email} (${user.clerkId})`)

        // Try to get user's Clerk organization memberships
        let clerkUser
        try {
          clerkUser = await clerkClient.users.getUser(user.clerkId)
        } catch (error) {
          console.log(`⚠️ Could not fetch Clerk user for ${user.clerkId}:`, error)
          continue
        }

        const orgMemberships = (clerkUser as any)?.organizationMemberships ?? []
        console.log(`🏢 User has ${orgMemberships.length} organization memberships`)

        if (orgMemberships.length === 0) {
          console.log(`⚠️ User ${user.email} has no organization memberships`)
          continue
        }

        // Find matching shop for each organization membership
        for (const membership of orgMemberships) {
          const orgId = membership.organization?.id
          const orgName = membership.organization?.name
          const orgRole = membership.role

          console.log(`🔍 Checking organization: ${orgName} (${orgId}) with role: ${orgRole}`)

          // Find shop with matching ID
          const matchingShop = shops.find(shop => shop.id === orgId)
          
          if (matchingShop) {
            console.log(`✅ Found matching shop: ${matchingShop.name}`)
            
            // Update user to link to this shop
            await prisma.user.update({
              where: { id: user.id },
              data: {
                shopId: matchingShop.id,
                role: orgRole || 'org:member', // Use Clerk role or default
              },
            })

            console.log(`✅ Linked user ${user.email} to shop ${matchingShop.name}`)
            fixedCount++
            break // Only link to first matching shop
          } else {
            console.log(`❌ No matching shop found for organization ${orgId}`)
          }
        }

        // If no matching shop found but user has org memberships, create a shop
        if (orgMemberships.length > 0 && !user.shopId) {
          const firstOrg = orgMemberships[0]
          const orgId = firstOrg.organization?.id
          const orgName = firstOrg.organization?.name
          const orgRole = firstOrg.role

          console.log(`🏗️ Creating shop for organization: ${orgName} (${orgId})`)

          // Create shop
          const newShop = await prisma.shop.create({
            data: {
              id: orgId,
              name: orgName || 'Unnamed Shop',
              slug: orgName?.toLowerCase().replace(/\s+/g, '-') || `shop-${orgId.substring(0, 8)}`,
              description: `Shop for ${orgName}`,
              type: 'both',
            },
          })

          // Link user to new shop
          await prisma.user.update({
            where: { id: user.id },
            data: {
              shopId: newShop.id,
              role: orgRole || 'org:admin', // Give admin role to shop creator
            },
          })

          console.log(`✅ Created shop ${newShop.name} and linked user ${user.email}`)
          fixedCount++
        }

      } catch (error) {
        console.error(`❌ Error processing user ${user.email}:`, error)
        errorCount++
      }
    }

    console.log(`\n📊 Summary:`)
    console.log(`✅ Fixed: ${fixedCount} users`)
    console.log(`❌ Errors: ${errorCount} users`)
    console.log(`📋 Total processed: ${usersWithoutShop.length} users`)

  } catch (error) {
    console.error('❌ Script error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
fixUserShopLinking()
  .then(() => {
    console.log('✅ Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  }) 