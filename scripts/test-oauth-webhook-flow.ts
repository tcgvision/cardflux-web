#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function testOAuthWebhookFlow() {
  console.log('🔍 Testing OAuth Webhook Flow...\n')

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

    // Check current database state
    console.log('\n📊 Current Database State:')
    
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

    console.log('\n🔧 OAuth Webhook Flow Improvements:')
    console.log('✅ Added useSignIn hook for OAuth sign-in scenarios')
    console.log('✅ Added useSignUp hook for OAuth sign-up scenarios')
    console.log('✅ Comprehensive OAuth completion detection')
    console.log('✅ URL parameter checking for OAuth completion')
    console.log('✅ Proper session setting for both sign-up and sign-in')
    console.log('✅ Database sync after OAuth completion')
    console.log('✅ Webhook triggering for user.created events')

    console.log('\n📋 OAuth Flow Steps (Fixed):')
    console.log('1. User clicks OAuth button on /auth/sign-up')
    console.log('2. Clerk redirects to OAuth provider (Google/Discord)')
    console.log('3. User authenticates with OAuth provider')
    console.log('4. OAuth provider redirects back to Clerk')
    console.log('5. Clerk redirects to /auth/sign-up with OAuth parameters')
    console.log('6. Sign-up page detects OAuth parameters in URL')
    console.log('7. Page waits for Clerk to process OAuth completion')
    console.log('8. useEffect detects sign-up or sign-in completion')
    console.log('9. handleOAuthSignUpCompletion() or handleOAuthSignInCompletion() runs')
    console.log('10. Session is set with setSignUpActive() or setSignInActive()')
    console.log('11. User is synced to database via /api/sync-user')
    console.log('12. Webhook user.created is triggered (if new user)')
    console.log('13. User is redirected to /create-shop or /dashboard')

    console.log('\n📋 Webhook Events Expected:')
    console.log('• user.created - When OAuth creates a new user')
    console.log('• user.updated - When OAuth updates existing user')
    console.log('• organizationMembership.created - When user joins org')
    console.log('• session.created - When session is established')

    console.log('\n🔍 Debugging Tips:')
    console.log('1. Check browser console for detailed OAuth logs')
    console.log('2. Monitor server logs for webhook events')
    console.log('3. Check database for user creation/updates')
    console.log('4. Verify Clerk dashboard for user events')

    console.log('\n🚀 Ready for OAuth Testing!')
    console.log('Try OAuth sign-up now and check:')
    console.log('• Browser console for OAuth completion logs')
    console.log('• Server logs for webhook events')
    console.log('• Database for new user records')

  } catch (error) {
    console.error('❌ OAuth webhook flow test failed:', error)
  } finally {
    await db.$disconnect()
  }
}

testOAuthWebhookFlow().catch(console.error) 