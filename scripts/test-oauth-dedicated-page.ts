#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function testOAuthDedicatedPage() {
  console.log('🔍 Testing OAuth Flow with Dedicated Completion Page...\n')

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

    console.log('\n🔧 NEW OAuth Flow with Dedicated Completion Page:')
    console.log('1. User clicks OAuth button on /auth/sign-up')
    console.log('2. Uses signIn.authenticateWithRedirect() with redirect to /auth/oauth-complete')
    console.log('3. Clerk redirects to OAuth provider (Google)')
    console.log('4. User authenticates with Google')
    console.log('5. Google redirects back to Clerk')
    console.log('6. Clerk processes OAuth and creates user + sets session')
    console.log('7. Clerk redirects to /auth/oauth-complete with OAuth parameters')
    console.log('8. OAuth completion page detects OAuth parameters')
    console.log('9. Page waits for Clerk to complete OAuth processing')
    console.log('10. Page checks if user is authenticated')
    console.log('11. If authenticated, syncs user to database')
    console.log('12. Routes to /dashboard (if has org) or /create-shop (if no org)')

    console.log('\n📋 OAuth Completion Page Features:')
    console.log('• Dedicated page for OAuth completion handling')
    console.log('• Detailed logging of OAuth parameters')
    console.log('• Proper session establishment')
    console.log('• User database synchronization')
    console.log('• Organization-based routing')
    console.log('• Error handling and fallbacks')

    console.log('\n📋 Expected Console Logs:')
    console.log('🔍 OAuth completion page loaded')
    console.log('URL search params: ...')
    console.log('User authenticated: true/false')
    console.log('✅ OAuth parameters detected')
    console.log('✅ User authenticated after OAuth')
    console.log('🔄 Syncing user to database...')
    console.log('✅ User synced to database successfully')
    console.log('✅ User authenticated but no organization, redirecting to create-shop')

    console.log('\n📋 Middleware Behavior:')
    console.log('• OAuth completion page always allowed')
    console.log('• Auth routes allowed for unauthenticated users')
    console.log('• Authenticated users with org → /dashboard')
    console.log('• Authenticated users without org → /create-shop')

    console.log('\n🚀 Ready for OAuth Testing!')
    console.log('Try OAuth sign-up now and check:')
    console.log('• OAuth should redirect to /auth/oauth-complete')
    console.log('• OAuth completion page should show loading state')
    console.log('• Console should show detailed OAuth completion logs')
    console.log('• User should be authenticated and synced to database')
    console.log('• User should be redirected to /create-shop')
    console.log('• No more redirect loops or authentication issues')

  } catch (error) {
    console.error('❌ OAuth dedicated page test failed:', error)
  } finally {
    await db.$disconnect()
  }
}

testOAuthDedicatedPage().catch(console.error) 