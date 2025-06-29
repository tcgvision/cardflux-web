#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function testOAuthSimple() {
  console.log('🔍 Testing Simple OAuth Flow...\n')

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
      take: 3,
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

    console.log('\n🔧 NEW Simple OAuth Flow:')
    console.log('1. User clicks OAuth button on /auth/sign-up')
    console.log('2. Clerk redirects to OAuth provider (Google)')
    console.log('3. User authenticates with Google')
    console.log('4. Google redirects back to Clerk')
    console.log('5. Clerk processes OAuth and creates user + sets session')
    console.log('6. Clerk redirects to /create-shop (user already authenticated)')
    console.log('7. Webhook fires and syncs user to database')
    console.log('8. User can create shop or join existing organization')

    console.log('\n📋 Expected Behavior:')
    console.log('• OAuth completion → User automatically authenticated')
    console.log('• Redirect to /create-shop → User can create organization')
    console.log('• Webhook syncs user → Database updated')
    console.log('• No infinite loops → Clean flow')

    console.log('\n📋 Middleware Behavior:')
    console.log('• Authenticated user with org → /dashboard')
    console.log('• Authenticated user without org → /create-shop')
    console.log('• Unauthenticated user → Access to auth routes')

    console.log('\n🚀 Ready for OAuth Testing!')
    console.log('Try OAuth sign-up now and check:')
    console.log('• User should be redirected to /create-shop after OAuth')
    console.log('• User should be authenticated (no sign-in loop)')
    console.log('• Webhook should sync user to database')
    console.log('• User can create shop or join organization')

  } catch (error) {
    console.error('❌ OAuth simple test failed:', error)
  } finally {
    await db.$disconnect()
  }
}

testOAuthSimple().catch(console.error) 