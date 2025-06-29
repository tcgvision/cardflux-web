#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { join } from 'path'

const db = new PrismaClient()

async function debugOAuthDeepDive() {
  console.log('🔍 Deep Dive OAuth Authentication Debug...\n')

  try {
    // 1. Environment Check
    console.log('📋 1. Environment Variables Check:')
    const requiredVars = [
      'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
      'CLERK_SECRET_KEY',
      'SIGNING_SECRET'
    ]
    
    let envOk = true
    requiredVars.forEach(varName => {
      const value = process.env[varName]
      if (value) {
        console.log(`   ✅ ${varName}: Set (${value.length} characters)`)
      } else {
        console.log(`   ❌ ${varName}: Not set`)
        envOk = false
      }
    })

    if (!envOk) {
      console.log('\n❌ Environment variables missing - OAuth will fail!')
      return
    }

    // 2. Database State Analysis
    console.log('\n📊 2. Database State Analysis:')
    
    const users = await db.user.findMany({
      include: {
        shop: true,
      },
      orderBy: {
        id: 'desc',
      },
    })

    console.log(`Total users: ${users.length}`)
    
    const usersWithClerkId = users.filter(u => u.clerkId && u.clerkId !== '')
    const usersWithoutClerkId = users.filter(u => !u.clerkId || u.clerkId === '')
    
    console.log(`Users with Clerk ID: ${usersWithClerkId.length}`)
    console.log(`Users without Clerk ID: ${usersWithoutClerkId.length}`)

    if (usersWithoutClerkId.length > 0) {
      console.log('\n⚠️  Users without Clerk ID (potential OAuth issues):')
      usersWithoutClerkId.forEach(user => {
        console.log(`   - ${user.email} (ID: ${user.id}) - Shop: ${user.shop?.name ?? 'None'}`)
      })
    }

    // 3. Code Analysis
    console.log('\n🔍 3. Code Flow Analysis:')

    // Check sign-up page OAuth configuration
    try {
      const signUpPage = readFileSync(join(process.cwd(), 'src/app/auth/sign-up/[[...sign-up]]/page.tsx'), 'utf8')
      
      console.log('\n📄 Sign-up Page Analysis:')
      
      if (signUpPage.includes('authenticateWithRedirect')) {
        console.log('   ✅ OAuth redirect method used')
      } else {
        console.log('   ❌ OAuth redirect method not found')
      }
      
      if (signUpPage.includes('redirectUrl: "/auth/sign-up"')) {
        console.log('   ✅ Correct redirect URL configured')
      } else {
        console.log('   ❌ Incorrect redirect URL')
      }
      
      if (signUpPage.includes('handleOAuthSignUpCompletion')) {
        console.log('   ✅ OAuth completion handler exists')
      } else {
        console.log('   ❌ OAuth completion handler missing')
      }
      
      if (signUpPage.includes('setSignUpActive')) {
        console.log('   ✅ Session setting method exists')
      } else {
        console.log('   ❌ Session setting method missing')
      }
      
      if (signUpPage.includes('syncUserToDatabase')) {
        console.log('   ✅ Database sync method exists')
      } else {
        console.log('   ❌ Database sync method missing')
      }
    } catch (error) {
      console.log('   ❌ Error reading sign-up page:', error instanceof Error ? error.message : String(error))
    }

    // Check webhook configuration
    try {
      const webhookRoute = readFileSync(join(process.cwd(), 'src/app/api/webhooks/route.ts'), 'utf8')
      
      console.log('\n🪝 Webhook Analysis:')
      
      if (webhookRoute.includes('user.created')) {
        console.log('   ✅ user.created event handler exists')
      } else {
        console.log('   ❌ user.created event handler missing')
      }
      
      if (webhookRoute.includes('handleUserCreated')) {
        console.log('   ✅ handleUserCreated function exists')
      } else {
        console.log('   ❌ handleUserCreated function missing')
      }
      
      if (webhookRoute.includes('clerkId: id')) {
        console.log('   ✅ Clerk ID linking in webhook')
      } else {
        console.log('   ❌ Clerk ID linking missing in webhook')
      }
    } catch (error) {
      console.log('   ❌ Error reading webhook route:', error instanceof Error ? error.message : String(error))
    }

    // Check middleware configuration
    try {
      const middleware = readFileSync(join(process.cwd(), 'src/middleware.ts'), 'utf8')
      
      console.log('\n🛡️ Middleware Analysis:')
      
      if (middleware.includes('isOAuthCompletion')) {
        console.log('   ✅ OAuth completion detection exists')
      } else {
        console.log('   ❌ OAuth completion detection missing')
      }
      
      if (middleware.includes('/auth/sign-up')) {
        console.log('   ✅ Sign-up route allowed in middleware')
      } else {
        console.log('   ❌ Sign-up route not allowed in middleware')
      }
      
      if (middleware.includes('/api/webhooks')) {
        console.log('   ✅ Webhook route allowed in middleware')
      } else {
        console.log('   ❌ Webhook route not allowed in middleware')
      }
    } catch (error) {
      console.log('   ❌ Error reading middleware:', error instanceof Error ? error.message : String(error))
    }

    // 4. OAuth Flow Steps Analysis
    console.log('\n🔄 4. OAuth Flow Steps Analysis:')
    console.log('Step 1: User clicks OAuth button')
    console.log('   - Clerk authenticateWithRedirect() called')
    console.log('   - User redirected to OAuth provider (Google)')
    console.log('   - User authenticates with Google')
    console.log('   - Google redirects back to Clerk')
    console.log('   - Clerk processes OAuth response')
    console.log('   - Clerk redirects to /auth/sign-up with OAuth parameters')
    
    console.log('\nStep 2: Sign-up page receives OAuth completion')
    console.log('   - useEffect detects OAuth parameters in URL')
    console.log('   - useEffect waits for Clerk to process OAuth')
    console.log('   - signUp.status changes to "complete"')
    console.log('   - signUp.createdSessionId becomes available')
    console.log('   - handleOAuthSignUpCompletion() called')
    
    console.log('\nStep 3: Session and database setup')
    console.log('   - setSignUpActive() sets the session')
    console.log('   - syncUserToDatabase() called')
    console.log('   - /api/sync-user creates user in database')
    console.log('   - Webhook user.created triggered (if new user)')
    console.log('   - User redirected to /create-shop or /dashboard')

    // 5. Potential Issues
    console.log('\n⚠️ 5. Potential Issues to Check:')
    console.log('Issue 1: Webhook not firing')
    console.log('   - Check Clerk dashboard webhook configuration')
    console.log('   - Verify webhook URL is correct (ngrok URL)')
    console.log('   - Ensure user.created event is enabled')
    console.log('   - Check webhook delivery logs in Clerk dashboard')
    
    console.log('\nIssue 2: OAuth completion not detected')
    console.log('   - Check browser console for OAuth parameter logs')
    console.log('   - Verify signUp.status changes to "complete"')
    console.log('   - Check if signUp.createdSessionId is available')
    console.log('   - Ensure useEffect dependencies are correct')
    
    console.log('\nIssue 3: Session not being set')
    console.log('   - Check if setSignUpActive() is called')
    console.log('   - Verify session is set before database sync')
    console.log('   - Check for errors in session setting')
    
    console.log('\nIssue 4: Database sync failing')
    console.log('   - Check /api/sync-user endpoint logs')
    console.log('   - Verify user is created in database')
    console.log('   - Check if Clerk ID is properly linked')
    
    console.log('\nIssue 5: Middleware blocking flow')
    console.log('   - Check middleware logs for OAuth completion')
    console.log('   - Verify sign-up page access is allowed')
    console.log('   - Check for redirect loops')

    // 6. Debugging Commands
    console.log('\n🔧 6. Debugging Commands:')
    console.log('1. Start server: npm run dev')
    console.log('2. Start ngrok: npx ngrok http 3001')
    console.log('3. Update Clerk webhook URL with ngrok URL')
    console.log('4. Try OAuth sign-up')
    console.log('5. Check browser console for detailed logs')
    console.log('6. Check server logs for webhook events')
    console.log('7. Check ngrok logs for webhook requests')
    console.log('8. Check database for new user records')

    // 7. Expected Logs
    console.log('\n📋 7. Expected Logs During OAuth:')
    console.log('Browser Console:')
    console.log('   - "🔍 OAuth parameters detected in URL"')
    console.log('   - "🔄 Starting OAuth sign-up with oauth_google"')
    console.log('   - "🔄 OAuth sign-up completed, setting session"')
    console.log('   - "Session set successfully"')
    console.log('   - "User synced to database"')
    
    console.log('\nServer Logs:')
    console.log('   - "🪝 Webhook request: POST /api/webhooks"')
    console.log('   - "🔄 Processing webhook: user.created"')
    console.log('   - "🆕 Creating new user in database"')
    console.log('   - "✅ Created new user: [ID]"')
    
    console.log('\nDatabase:')
    console.log('   - New user record with Clerk ID')
    console.log('   - Email and name populated')
    console.log('   - No shop assigned yet')

    console.log('\n🚀 Ready for OAuth Testing!')
    console.log('Follow the debugging steps above to identify the exact issue.')

  } catch (error) {
    console.error('❌ OAuth deep dive debug failed:', error)
  } finally {
    await db.$disconnect()
  }
}

debugOAuthDeepDive().catch(console.error) 