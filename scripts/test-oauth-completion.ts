#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function testOAuthCompletion() {
  console.log('🔍 Testing OAuth Completion Flow...\n')

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
      console.log(`  Role: ${user.role ?? 'No role'}`)
    })

    console.log('\n🔧 OAuth Completion Flow:')
    console.log('1. User clicks OAuth button on /auth/sign-up')
    console.log('2. Clerk redirects to OAuth provider (Google)')
    console.log('3. User authenticates with Google')
    console.log('4. Google redirects back to Clerk')
    console.log('5. Clerk processes OAuth and creates user')
    console.log('6. Clerk redirects to /auth/sign-up with OAuth parameters')
    console.log('7. Sign-up page detects OAuth parameters')
    console.log('8. Page waits for Clerk to complete OAuth processing')
    console.log('9. Page checks user authentication status')
    console.log('10. Page checks organization status')
    console.log('11. Routes to /dashboard (if has org) or /create-shop (if no org)')

    console.log('\n📋 Expected Console Logs:')
    console.log('🔍 OAuth parameters detected, waiting for completion...')
    console.log('✅ OAuth completed successfully, user authenticated')
    console.log('✅ User has organization, redirecting to dashboard')
    console.log('OR')
    console.log('✅ User authenticated but no organization, redirecting to create-shop')

    console.log('\n📋 Middleware Behavior:')
    console.log('• OAuth completion detected → Allow through')
    console.log('• Auth routes → Always allow access')
    console.log('• Authenticated user with org → Redirect to dashboard')
    console.log('• Authenticated user without org → Allow access for OAuth completion')
    console.log('• Unauthenticated user → Allow access to auth routes')

    console.log('\n📋 Webhook Flow:')
    console.log('1. Clerk sends user.created webhook')
    console.log('2. Webhook creates user in database')
    console.log('3. User is ready for organization creation')

    console.log('\n🚀 Ready for OAuth Testing!')
    console.log('Try OAuth sign-up now and check:')
    console.log('• Browser console for OAuth completion logs')
    console.log('• Server logs for webhook events')
    console.log('• Database for new user records')
    console.log('• Proper routing based on organization status')

  } catch (error) {
    console.error('❌ OAuth completion test failed:', error)
  } finally {
    await db.$disconnect()
  }
}

testOAuthCompletion().catch(console.error) 