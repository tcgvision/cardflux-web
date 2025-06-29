#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'
import { env } from '../src/env'

const db = new PrismaClient()

async function testOAuthFlow() {
  console.log('🔍 Testing OAuth Flow Debug...\n')

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
      take: 10,
    })

    console.log(`Total users: ${users.length}`)
    
    users.forEach((user, index) => {
      console.log(`\nUser ${index + 1}:`)
      console.log(`  ID: ${user.id}`)
      console.log(`  Email: ${user.email}`)
      console.log(`  Name: ${user.name}`)
      console.log(`  Clerk ID: ${user.clerkId ?? 'Not set'}`)
      console.log(`  Shop: ${user.shop?.name ?? 'No shop'}`)
      console.log(`  Role: ${user.role ?? 'No role'}`)
    })

    // Check shops
    console.log('\n🏪 Shops:')
    const shops = await db.shop.findMany({
      include: {
        users: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    })

    console.log(`Total shops: ${shops.length}`)
    shops.forEach((shop, index) => {
      console.log(`\nShop ${index + 1}:`)
      console.log(`  ID: ${shop.id}`)
      console.log(`  Name: ${shop.name}`)
      console.log(`  Slug: ${shop.slug}`)
      console.log(`  Users: ${shop.users.length}`)
      shop.users.forEach(user => {
        console.log(`    - ${user.email} (${user.name}) - Role: ${user.role}`)
      })
    })

    console.log('\n🔧 OAuth Flow Debug Steps:')
    console.log('1. User clicks OAuth button on /auth/sign-up')
    console.log('2. Clerk redirects to OAuth provider')
    console.log('3. User authenticates with OAuth provider')
    console.log('4. OAuth provider redirects back to Clerk')
    console.log('5. Clerk redirects to /auth/sign-up (not /create-shop)')
    console.log('6. useEffect detects OAuth completion')
    console.log('7. handleOAuthCompletion() sets session and syncs user')
    console.log('8. User is redirected to /create-shop or /dashboard')

    console.log('\n📋 Key Changes Made:')
    console.log('✅ Changed OAuth redirect URLs to /auth/sign-up')
    console.log('✅ Added OAuth completion detection useEffect')
    console.log('✅ Added handleOAuthCompletion() function')
    console.log('✅ Updated middleware to allow sign-up page access after OAuth')
    console.log('✅ Added detailed logging for debugging')

    console.log('\n🚀 Ready for OAuth Testing!')
    console.log('Try OAuth sign-up now and check the browser console for detailed logs.')

  } catch (error) {
    console.error('❌ OAuth flow test failed:', error)
  } finally {
    await db.$disconnect()
  }
}

testOAuthFlow().catch(console.error) 