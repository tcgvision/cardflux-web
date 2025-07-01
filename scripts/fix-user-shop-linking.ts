#!/usr/bin/env tsx

/**
 * Fix User-Shop Linking Issues
 * 
 * This script identifies and fixes users who are not properly linked to shops
 * or missing role assignments after shop creation.
 */

import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function fixUserShopLinking() {
  console.log('🔍 Checking for user-shop linking issues...\n')

  try {
    // Find users without shopId
    const usersWithoutShop = await db.user.findMany({
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

    console.log(`📊 Found ${usersWithoutShop.length} users without shopId:`)
    usersWithoutShop.forEach(user => {
      console.log(`  - ${user.email} (ID: ${user.id}, Clerk: ${user.clerkId})`)
    })

    // Find users with shopId but no role
    const usersWithoutRole = await db.user.findMany({
      where: {
        shopId: { not: null },
        role: null,
      },
      select: {
        id: true,
        clerkId: true,
        email: true,
        name: true,
        shopId: true,
        shop: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    })

    console.log(`\n📊 Found ${usersWithoutRole.length} users with shopId but no role:`)
    usersWithoutRole.forEach(user => {
      console.log(`  - ${user.email} (Shop: ${user.shop?.name}, ID: ${user.shopId})`)
    })

    // Find orphaned users (users with shopId but shop doesn't exist)
    const orphanedUsers = await db.user.findMany({
      where: {
        shopId: { not: null },
      },
      select: {
        id: true,
        clerkId: true,
        email: true,
        name: true,
        shopId: true,
      },
    })

    // Check for orphaned users (users with shopId but shop doesn't exist)
    const orphanedUsersFiltered = []
    for (const user of orphanedUsers) {
      const shopExists = await db.shop.findUnique({
        where: { id: user.shopId! },
      })
      if (!shopExists) {
        orphanedUsersFiltered.push(user)
      }
    }

    console.log(`\n📊 Found ${orphanedUsersFiltered.length} orphaned users (shop doesn't exist):`)
    orphanedUsersFiltered.forEach(user => {
      console.log(`  - ${user.email} (Shop ID: ${user.shopId})`)
    })

    // Summary and recommendations
    console.log('\n📋 Summary:')
    console.log(`  - Users without shopId: ${usersWithoutShop.length}`)
    console.log(`  - Users without role: ${usersWithoutRole.length}`)
    console.log(`  - Orphaned users: ${orphanedUsersFiltered.length}`)

    if (usersWithoutShop.length > 0 || usersWithoutRole.length > 0 || orphanedUsersFiltered.length > 0) {
      console.log('\n🔧 Recommendations:')
      
      if (usersWithoutShop.length > 0) {
        console.log('  1. Users without shopId need to create or join a shop')
        console.log('     - They should visit /create-shop to create a new shop')
        console.log('     - Or accept an invitation to join an existing shop')
      }
      
      if (usersWithoutRole.length > 0) {
        console.log('  2. Users without role need role assignment')
        console.log('     - This should be handled by webhooks when they join organizations')
        console.log('     - Check if webhooks are firing properly')
      }
      
      if (orphanedUsersFiltered.length > 0) {
        console.log('  3. Orphaned users need shop cleanup')
        console.log('     - Their shopId should be cleared or shop should be recreated')
      }
    } else {
      console.log('\n✅ All users are properly linked to shops with roles!')
    }

  } catch (error) {
    console.error('❌ Error checking user-shop linking:', error)
  } finally {
    await db.$disconnect()
  }
}

fixUserShopLinking().catch(console.error) 