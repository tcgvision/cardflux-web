#!/usr/bin/env tsx

/**
 * Debug script to understand OAuth flow issues
 */

import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';
import { PrismaClient } from '@prisma/client'

// Load environment variables
config();

const db = new PrismaClient()

async function debugOAuthFlow() {
  console.log('🔍 Debugging OAuth Flow...\n')

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

    console.log('\n🔧 OAuth Flow Debug Steps:')
    console.log('1. Open browser developer tools (F12)')
    console.log('2. Go to Console tab')
    console.log('3. Navigate to /auth/sign-up')
    console.log('4. Click Google OAuth button')
    console.log('5. Check console logs for:')
    console.log('   • "🔄 Starting OAuth with oauth_google..."')
    console.log('   • Any error messages')
    console.log('   • URL redirects')
    console.log('6. After OAuth completion, check for:')
    console.log('   • "🔍 Checking for OAuth parameters..."')
    console.log('   • "URL search params: ..."')
    console.log('   • "Has OAuth params: true/false"')
    console.log('   • "User authenticated: true/false"')

    console.log('\n📋 Common OAuth Issues:')
    console.log('• Clerk configuration not set up properly')
    console.log('• OAuth redirect URLs not configured in Clerk dashboard')
    console.log('• Google OAuth app not configured correctly')
    console.log('• Missing or incorrect environment variables')
    console.log('• CORS issues with OAuth redirects')

    console.log('\n📋 Clerk Dashboard Check:')
    console.log('1. Go to Clerk Dashboard')
    console.log('2. Check OAuth settings for Google')
    console.log('3. Verify redirect URLs include:')
    console.log('   • http://localhost:3001/auth/sign-up')
    console.log('   • http://localhost:3001/auth/sign-in')
    console.log('4. Check if Google OAuth is enabled')
    console.log('5. Verify Google OAuth app configuration')

    console.log('\n📋 Google OAuth App Check:')
    console.log('1. Go to Google Cloud Console')
    console.log('2. Check OAuth 2.0 Client IDs')
    console.log('3. Verify authorized redirect URIs include:')
    console.log('   • https://clerk.your-domain.com/v1/oauth_callback')
    console.log('4. Check if OAuth consent screen is configured')

    console.log('\n🚀 Debug Instructions:')
    console.log('1. Try OAuth sign-up and check browser console')
    console.log('2. Look for any error messages')
    console.log('3. Check if OAuth redirects are happening')
    console.log('4. Verify if user is being created in Clerk')
    console.log('5. Check if webhook is firing')
    console.log('6. Report back with console logs and any errors')

  } catch (error) {
    console.error('❌ OAuth debug failed:', error)
  } finally {
    await db.$disconnect()
  }
}

debugOAuthFlow().catch(console.error) 