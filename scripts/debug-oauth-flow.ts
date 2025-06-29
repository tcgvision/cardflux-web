#!/usr/bin/env tsx

/**
 * Debug script to understand OAuth flow issues
 */

import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
config();

console.log('🔍 Debugging OAuth Flow');
console.log('=======================');

// Check OAuth completion page
console.log('\n1. Checking OAuth completion page...');
try {
  const oauthPage = readFileSync(join(process.cwd(), 'src/app/auth/oauth-complete/page.tsx'), 'utf8');
  
  const checks = [
    { name: 'useSignUp hook', pattern: 'useSignUp' },
    { name: 'useUser hook', pattern: 'useUser' },
    { name: 'setActive call', pattern: 'setActive' },
    { name: 'signUp.status check', pattern: 'signUp\\?\\..*status' },
    { name: 'createdSessionId check', pattern: 'createdSessionId' },
    { name: 'router.push to create-shop', pattern: 'router\\.push\\("/create-shop"\\)' },
    { name: 'Error handling', pattern: 'catch.*error' },
    { name: 'Search params logging', pattern: 'searchParams' }
  ];
  
  for (const check of checks) {
    if (oauthPage.includes(check.pattern)) {
      console.log(`✅ ${check.name}`);
    } else {
      console.log(`❌ Missing: ${check.name}`);
    }
  }
} catch (error) {
  console.log('❌ Error reading OAuth completion page:', error instanceof Error ? error.message : String(error));
}

// Check sign-up page OAuth configuration
console.log('\n2. Checking sign-up page OAuth config...');
try {
  const signUpPage = readFileSync(join(process.cwd(), 'src/app/auth/sign-up/[[...sign-up]]/page.tsx'), 'utf8');
  
  if (signUpPage.includes('redirectUrl: "/auth/oauth-complete"')) {
    console.log('✅ OAuth redirects to oauth-complete');
  } else {
    console.log('❌ OAuth not configured to redirect to oauth-complete');
  }
  
  if (signUpPage.includes('redirectUrlComplete')) {
    console.log('❌ redirectUrlComplete is still configured (this might cause conflicts)');
  } else {
    console.log('✅ redirectUrlComplete removed (good)');
  }
} catch (error) {
  console.log('❌ Error reading sign-up page:', error instanceof Error ? error.message : String(error));
}

// Check middleware configuration
console.log('\n3. Checking middleware...');
try {
  const middleware = readFileSync(join(process.cwd(), 'src/middleware.ts'), 'utf8');
  
  if (middleware.includes('/auth/oauth-complete')) {
    console.log('✅ OAuth completion route allowed in middleware');
  } else {
    console.log('❌ OAuth completion route not allowed in middleware');
  }
  
  if (middleware.includes('/create-shop')) {
    console.log('✅ Create-shop route configured in middleware');
  } else {
    console.log('❌ Create-shop route not configured in middleware');
  }
} catch (error) {
  console.log('❌ Error reading middleware:', error instanceof Error ? error.message : String(error));
}

// Check ClerkProvider configuration
console.log('\n4. Checking ClerkProvider config...');
try {
  const layout = readFileSync(join(process.cwd(), 'src/app/layout.tsx'), 'utf8');
  
  if (layout.includes('afterSignUpUrl="/create-shop"')) {
    console.log('✅ ClerkProvider configured for create-shop redirect');
  } else {
    console.log('❌ ClerkProvider not configured for create-shop redirect');
  }
} catch (error) {
  console.log('❌ Error reading layout:', error instanceof Error ? error.message : String(error));
}

console.log('\n📋 Potential Issues:');
console.log('1. OAuth completion page might not be getting the right signUp state');
console.log('2. Clerk might be redirecting before our completion page can process');
console.log('3. Middleware might be interfering with the OAuth completion');
console.log('4. Session might not be properly set before redirect');

console.log('\n🔧 Suggested Debugging Steps:');
console.log('1. Add console.log in oauth-complete page to see what signUp.status is');
console.log('2. Check browser network tab for any failed requests');
console.log('3. Check if Clerk webhooks are firing correctly');
console.log('4. Verify that the OAuth provider is returning the right parameters');

console.log('\n🚀 Next Steps:');
console.log('1. Test OAuth flow and check browser console');
console.log('2. Look for the console.log output from oauth-complete page');
console.log('3. Check if signUp.status is "complete" when the page loads');
console.log('4. Verify that createdSessionId exists'); 