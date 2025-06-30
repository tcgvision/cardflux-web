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
  console.log('🔍 Debugging OAuth Flow Issue\n');

  try {
    // Check middleware logic
    console.log('1. Checking middleware logic...');
    const middlewarePath = join(process.cwd(), 'src/middleware.ts');
    const middlewareContent = readFileSync(middlewarePath, 'utf8');

    // Check OAuth completion detection
    console.log('\n📋 OAuth Completion Detection:');
    const oauthDetectionLines = middlewareContent
      .split('\n')
      .filter(line => line.includes('isOAuthCompletion') || line.includes('hasClerkStatus') || line.includes('hasOAuthCode'))
      .map(line => line.trim());

    oauthDetectionLines.forEach(line => {
      console.log(`   ${line}`);
    });

    // Check create-shop route handling
    console.log('\n📋 Create-Shop Route Handling:');
    const createShopLines = middlewareContent
      .split('\n')
      .filter(line => line.includes('isCreateShopRoute') || line.includes('create-shop'))
      .map(line => line.trim());

    createShopLines.forEach(line => {
      console.log(`   ${line}`);
    });

    // Check authentication checks
    console.log('\n📋 Authentication Checks:');
    const authCheckLines = middlewareContent
      .split('\n')
      .filter(line => line.includes('!userId') || line.includes('userId &&') || line.includes('await auth()'))
      .map(line => line.trim());

    authCheckLines.forEach(line => {
      console.log(`   ${line}`);
    });

    // Check sign-up page OAuth redirects
    console.log('\n2. Checking sign-up page OAuth redirects...');
    const signUpPath = join(process.cwd(), 'src/app/auth/sign-up/[[...sign-up]]/page.tsx');
    const signUpContent = readFileSync(signUpPath, 'utf8');

    const oauthRedirectLines = signUpContent
      .split('\n')
      .filter(line => line.includes('redirectUrl') || line.includes('authenticateWithRedirect'))
      .map(line => line.trim());

    console.log('\n📋 OAuth Redirect Configuration:');
    oauthRedirectLines.forEach(line => {
      console.log(`   ${line}`);
    });

    // Check if create-shop page exists
    console.log('\n3. Checking create-shop page...');
    const createShopPagePath = join(process.cwd(), 'src/app/create-shop/page.tsx');
    try {
      const createShopPageContent = readFileSync(createShopPagePath, 'utf8');
      console.log('✅ Create-shop page exists');
      
      // Check if it has proper authentication handling
      if (createShopPageContent.includes('useUser') || createShopPageContent.includes('useOrganization')) {
        console.log('✅ Create-shop page has authentication hooks');
      } else {
        console.log('⚠️ Create-shop page may not have proper authentication handling');
      }
    } catch (error) {
      console.log('❌ Create-shop page does not exist');
    }

    // Check environment variables
    console.log('\n4. Checking environment variables...');
    const envPath = join(process.cwd(), 'src/env.js');
    try {
      const envContent = readFileSync(envPath, 'utf8');
      
      const requiredVars = [
        'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
        'CLERK_SECRET_KEY',
        'NEXT_PUBLIC_CLERK_SIGN_IN_URL',
        'NEXT_PUBLIC_CLERK_SIGN_UP_URL',
        'NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL',
        'NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL'
      ];
      
      requiredVars.forEach(varName => {
        if (envContent.includes(varName)) {
          console.log(`✅ ${varName} is configured`);
        } else {
          console.log(`❌ ${varName} is missing`);
        }
      });
    } catch (error) {
      console.log('❌ Could not read env.js file');
    }

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

    // Analysis and recommendations
    console.log('\n🔍 ANALYSIS:');
    console.log('\nThe issue is likely one of these:');
    console.log('1. OAuth completion timing - user not authenticated when reaching /create-shop');
    console.log('2. Session not properly set after OAuth completion');
    console.log('3. Middleware redirecting before Clerk finishes processing OAuth');

    console.log('\n💡 RECOMMENDATIONS:');
    console.log('1. Add more detailed logging to middleware to see auth state');
    console.log('2. Check if OAuth completion parameters are being detected properly');
    console.log('3. Consider adding a delay or retry mechanism for OAuth completion');
    console.log('4. Verify that Clerk environment variables are set correctly');

    console.log('\n🔧 NEXT STEPS:');
    console.log('1. Test OAuth flow and check browser console for middleware logs');
    console.log('2. Check if user is properly authenticated when reaching /create-shop');
    console.log('3. Verify OAuth completion parameters in URL');
    console.log('4. Check Clerk dashboard for OAuth configuration');

  } catch (error) {
    console.error('❌ OAuth debug failed:', error)
  } finally {
    await db.$disconnect()
  }
}

debugOAuthFlow().catch(console.error) 