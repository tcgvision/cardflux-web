#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function testOAuthFlow() {
  console.log('🔍 Testing OAuth Authentication Flow...\n')

  try {
    // Check database state
    console.log('📊 Database State:')
    
    const users = await db.user.findMany({
      include: {
        shop: true,
      },
      orderBy: {
        id: 'desc',
      },
      take: 5,
    })

    console.log(`Total users: ${users.length}`)
    
    users.forEach((user, index) => {
      console.log(`\nUser ${index + 1}:`)
      console.log(`  ID: ${user.id}`)
      console.log(`  Email: ${user.email}`)
      console.log(`  Name: ${user.name}`)
      console.log(`  Clerk ID: ${user.clerkId ?? 'Not set'}`)
      console.log(`  Shop: ${user.shop?.name ?? 'No shop'}`)
    })

    const shops = await db.shop.findMany({
      include: {
        users: true,
      },
      orderBy: {
        id: 'desc',
      },
      take: 5,
    })

    console.log(`\nTotal shops: ${shops.length}`)
    
    shops.forEach((shop, index) => {
      console.log(`\nShop ${index + 1}:`)
      console.log(`  ID: ${shop.id}`)
      console.log(`  Name: ${shop.name}`)
      console.log(`  Users: ${shop.users.length}`)
    })

    // Check for users without Clerk IDs (potential OAuth issues)
    const usersWithoutClerkId = await db.user.findMany({
      where: {
        clerkId: '',
      },
    })

    if (usersWithoutClerkId.length > 0) {
      console.log(`\n⚠️  Users without Clerk ID: ${usersWithoutClerkId.length}`)
      usersWithoutClerkId.forEach(user => {
        console.log(`  - ${user.email} (ID: ${user.id})`)
      })
    }

    // Check for orphaned users (users without shops)
    const orphanedUsers = await db.user.findMany({
      where: {
        shopId: '',
      },
    })

    if (orphanedUsers.length > 0) {
      console.log(`\n⚠️  Users without shop: ${orphanedUsers.length}`)
      orphanedUsers.forEach(user => {
        console.log(`  - ${user.email} (ID: ${user.id}, Clerk ID: ${user.clerkId ?? 'Not set'})`)
      })
    }

    console.log('\n📋 OAuth Flow Debugging Steps:')
    console.log('1. Check if webhook is firing for OAuth users')
    console.log('2. Verify Clerk OAuth configuration')
    console.log('3. Check middleware logs for redirect patterns')
    console.log('4. Ensure environment variables are set correctly')
    console.log('5. Test OAuth sign-up and monitor server logs')

    console.log('\n🔧 Common OAuth Issues:')
    console.log('- Webhook not firing for OAuth users')
    console.log('- Middleware redirecting OAuth users incorrectly')
    console.log('- Environment variables not loaded properly')
    console.log('- Clerk OAuth configuration issues')

  } catch (error) {
    console.error('❌ OAuth flow test failed:', error)
  } finally {
    await db.$disconnect()
  }
}

testOAuthFlow().catch(console.error) 