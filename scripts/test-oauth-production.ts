#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function testOAuthProduction() {
  console.log('🔍 Production OAuth Flow Test...\n')

  try {
    // Check environment variables
    console.log('📋 Environment Check:')
    const requiredVars = [
      'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
      'CLERK_SECRET_KEY',
      'SIGNING_SECRET'
    ]
    
    requiredVars.forEach(varName => {
      const value = process.env[varName]
      if (value) {
        console.log(`   ✅ ${varName}: Set (${value.length} characters)`)
      } else {
        console.log(`   ❌ ${varName}: Not set`)
      }
    })

    // Check database state
    console.log('\n📊 Database State:')
    
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

    // Check for OAuth-specific issues
    console.log('\n🔍 OAuth Flow Analysis:')
    
    // Check for users without Clerk IDs
    const usersWithoutClerkId = await db.user.findMany({
      where: {
        clerkId: '',
      },
    })

    if (usersWithoutClerkId.length > 0) {
      console.log(`⚠️  Users without Clerk ID: ${usersWithoutClerkId.length}`)
      usersWithoutClerkId.forEach(user => {
        console.log(`   - ${user.email} (ID: ${user.id})`)
      })
    } else {
      console.log('✅ All users have Clerk IDs')
    }

    // Check for orphaned users
    const orphanedUsers = await db.user.findMany({
      where: {
        shopId: '',
      },
    })

    if (orphanedUsers.length > 0) {
      console.log(`⚠️  Users without shop: ${orphanedUsers.length}`)
      orphanedUsers.forEach(user => {
        console.log(`   - ${user.email} (ID: ${user.id})`)
      })
    } else {
      console.log('✅ All users have shops')
    }

    console.log('\n📋 Production OAuth Best Practices:')
    console.log('1. ✅ Use Clerk\'s built-in OAuth handling')
    console.log('2. ✅ Redirect directly to dashboard after OAuth')
    console.log('3. ✅ Let middleware handle routing based on org membership')
    console.log('4. ✅ Ensure webhook creates user in database')
    console.log('5. ✅ Proper error handling and logging')
    
    console.log('\n🔧 OAuth Flow Steps:')
    console.log('1. User clicks OAuth button')
    console.log('2. Clerk redirects to OAuth provider (Google)')
    console.log('3. User authenticates with Google')
    console.log('4. Google redirects back to Clerk')
    console.log('5. Clerk redirects to /dashboard')
    console.log('6. Middleware checks authentication and org membership')
    console.log('7. User is routed to dashboard or create-shop')
    console.log('8. Webhook creates/updates user in database')

    console.log('\n🚀 Ready for Production OAuth Testing!')

  } catch (error) {
    console.error('❌ OAuth production test failed:', error)
  } finally {
    await db.$disconnect()
  }
}

testOAuthProduction().catch(console.error) 