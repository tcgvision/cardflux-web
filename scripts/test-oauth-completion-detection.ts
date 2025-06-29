#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function testOAuthCompletionDetection() {
  console.log('🔍 Testing OAuth Completion Detection Flow...\n')

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

    console.log('\n🔧 OAuth Completion Detection Flow:')
    console.log('1. User clicks OAuth button on /auth/sign-up')
    console.log('2. Uses signIn.authenticateWithRedirect() with redirect to /auth/sign-up')
    console.log('3. Clerk redirects to OAuth provider (Google)')
    console.log('4. User authenticates with Google')
    console.log('5. Google redirects back to Clerk')
    console.log('6. Clerk processes OAuth and creates user + sets session')
    console.log('7. Clerk redirects to /auth/sign-up with OAuth parameters')
    console.log('8. Middleware detects OAuth parameters and allows access')
    console.log('9. Sign-up page detects OAuth parameters and waits for completion')
    console.log('10. Page checks if user is authenticated')
    console.log('11. If authenticated, syncs user to database and routes appropriately')
    console.log('12. Routes to /dashboard (if has org) or /create-shop (if no org)')

    console.log('\n📋 OAuth Parameters Detected:')
    console.log('• __clerk_status - OAuth completion status')
    console.log('• __clerk_db_jwt - Clerk database JWT')
    console.log('• __clerk_strategy - OAuth strategy used')
    console.log('• code & state - OAuth authorization code and state')

    console.log('\n📋 Middleware OAuth Detection:')
    console.log('• Checks for OAuth parameters in URL')
    console.log('• Allows access to auth routes if OAuth completion detected')
    console.log('• Prevents redirect loops during OAuth completion')

    console.log('\n📋 Sign-up Page OAuth Detection:')
    console.log('• Detects OAuth parameters in URL')
    console.log('• Waits for Clerk to process OAuth completion')
    console.log('• Checks user authentication status')
    console.log('• Syncs user to database when authenticated')
    console.log('• Routes based on organization status')

    console.log('\n📋 Expected Console Logs:')
    console.log('✅ OAuth completion detected on /auth/sign-up, allowing access')
    console.log('🔍 OAuth parameters detected, waiting for completion...')
    console.log('✅ OAuth completed successfully, user authenticated')
    console.log('🔄 Syncing user to database...')
    console.log('✅ User synced to database successfully')
    console.log('✅ User authenticated but no organization, redirecting to create-shop')

    console.log('\n🚀 Ready for OAuth Testing!')
    console.log('Try OAuth sign-up now and check:')
    console.log('• OAuth should redirect back to /auth/sign-up with parameters')
    console.log('• Middleware should allow access during OAuth completion')
    console.log('• Sign-up page should detect OAuth completion')
    console.log('• User should be authenticated and synced to database')
    console.log('• User should be redirected to /create-shop')
    console.log('• No more "Unauthenticated user" errors')

  } catch (error) {
    console.error('❌ OAuth completion detection test failed:', error)
  } finally {
    await db.$disconnect()
  }
}

testOAuthCompletionDetection().catch(console.error) 