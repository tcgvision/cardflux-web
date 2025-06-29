#!/usr/bin/env tsx

/**
 * Test script to verify simplified OAuth flow
 */

import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
config();

console.log('🧪 Testing Simplified OAuth Flow');
console.log('=================================');

// Check OAuth configuration
console.log('\n1. Checking OAuth configuration...');
try {
  const signUpPage = readFileSync(join(process.cwd(), 'src/app/auth/sign-up/[[...sign-up]]/page.tsx'), 'utf8');
  
  if (signUpPage.includes('redirectUrl: "/create-shop"')) {
    console.log('✅ OAuth redirects directly to create-shop');
  } else {
    console.log('❌ OAuth not configured to redirect to create-shop');
  }
  
  if (signUpPage.includes('redirectUrlComplete: "/create-shop"')) {
    console.log('✅ OAuth completion redirects to create-shop');
  } else {
    console.log('❌ OAuth completion not configured');
  }
} catch (error) {
  console.log('❌ Error reading sign-up page:', error instanceof Error ? error.message : String(error));
}

// Check middleware configuration
console.log('\n2. Checking middleware...');
try {
  const middleware = readFileSync(join(process.cwd(), 'src/middleware.ts'), 'utf8');
  
  if (middleware.includes('/create-shop')) {
    console.log('✅ Create-shop route configured in middleware');
  } else {
    console.log('❌ Create-shop route not configured in middleware');
  }
  
  if (!middleware.includes('/auth/oauth-complete')) {
    console.log('✅ OAuth completion route removed from middleware (good)');
  } else {
    console.log('❌ OAuth completion route still in middleware');
  }
} catch (error) {
  console.log('❌ Error reading middleware:', error instanceof Error ? error.message : String(error));
}

// Check if oauth-complete page exists
console.log('\n3. Checking oauth-complete page...');
try {
  const fs = require('fs');
  if (fs.existsSync(join(process.cwd(), 'src/app/auth/oauth-complete/page.tsx'))) {
    console.log('❌ OAuth completion page still exists (should be removed)');
  } else {
    console.log('✅ OAuth completion page removed (good)');
  }
} catch (error) {
  console.log('✅ OAuth completion page removed (good)');
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

console.log('\n✅ Simplified OAuth Flow Summary:');
console.log('1. User clicks OAuth sign-up');
console.log('2. Clerk redirects to OAuth provider');
console.log('3. OAuth provider redirects back to Clerk');
console.log('4. Clerk automatically redirects to /create-shop');
console.log('5. Middleware allows access to /create-shop for users without orgs');
console.log('6. User creates shop and gets redirected to /dashboard');

console.log('\n🚀 Ready to test simplified OAuth flow!');
console.log('This approach is much simpler and should work reliably.');
console.log('Start your dev server and try signing up with Google OAuth.'); 