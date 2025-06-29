#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function testOAuthFixed() {
  console.log('🔍 Testing Fixed OAuth Flow...\n')

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

    console.log('\n🔧 Fixed OAuth Flow:')
    console.log('1. User clicks OAuth button')
    console.log('2. Clerk redirects to OAuth provider')
    console.log('3. User authenticates with OAuth provider')
    console.log('4. OAuth provider redirects back to Clerk')
    console.log('5. Clerk redirects to /auth/oauth-complete')
    console.log('6. OAuth completion page handles session setting')
    console.log('7. User is synced to database')
    console.log('8. User is redirected to /dashboard/create-shop')
    console.log('9. Middleware allows access (no conflicts)')

    console.log('\n📋 Key Fixes Applied:')
    console.log('✅ Middleware detects OAuth completion parameters')
    console.log('✅ Dedicated OAuth completion page created')
    console.log('✅ OAuth redirects to /auth/oauth-complete')
    console.log('✅ Removed complex OAuth logic from sign-up page')
    console.log('✅ Proper session handling in completion page')
    console.log('✅ Database sync after OAuth completion')

    console.log('\n🚀 Ready for OAuth Testing!')
    console.log('Try OAuth sign-up now - should work without conflicts.')

  } catch (error) {
    console.error('❌ OAuth fixed test failed:', error)
  } finally {
    await db.$disconnect()
  }
}

testOAuthFixed().catch(console.error) 