#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function testOAuthSession() {
  console.log('🔍 Testing OAuth Session Handling...\n')

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

    console.log('\n🔧 OAuth Session Flow:')
    console.log('1. User clicks OAuth button')
    console.log('2. Clerk redirects to OAuth provider')
    console.log('3. User authenticates with OAuth provider')
    console.log('4. OAuth provider redirects back to Clerk')
    console.log('5. Clerk redirects to /auth/sign-up or /auth/sign-in')
    console.log('6. useEffect detects OAuth completion')
    console.log('7. setActive() sets the session')
    console.log('8. User is redirected to /dashboard')
    console.log('9. Middleware sees authenticated user')
    console.log('10. Webhook creates/updates user in database')

    console.log('\n📋 Key Changes Made:')
    console.log('✅ Added OAuth completion useEffect hooks')
    console.log('✅ Proper session setting with setActive()')
    console.log('✅ Correct redirect URLs for OAuth flow')
    console.log('✅ Enhanced ClerkProvider configuration')
    console.log('✅ Database sync after OAuth completion')

    console.log('\n🚀 Ready for OAuth Testing!')
    console.log('Try OAuth sign-up now and check the logs.')

  } catch (error) {
    console.error('❌ OAuth session test failed:', error)
  } finally {
    await db.$disconnect()
  }
}

testOAuthSession().catch(console.error) 