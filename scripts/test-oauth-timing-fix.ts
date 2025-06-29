#!/usr/bin/env tsx

/**
 * Test script to verify OAuth timing fix
 * 
 * This script tests the updated OAuth completion flow with proper timing handling
 */

import { config } from 'dotenv';

// Load environment variables
config();

console.log('🧪 Testing OAuth Timing Fix');
console.log('============================');

// Test 1: Verify environment variables
console.log('\n1. Checking environment variables...');
const requiredEnvVars = [
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'DATABASE_URL',
  'CLERK_WEBHOOK_SECRET'
];

let envVarsOk = true;
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.log(`❌ Missing: ${envVar}`);
    envVarsOk = false;
  } else {
    console.log(`✅ Found: ${envVar}`);
  }
}

if (!envVarsOk) {
  console.log('\n❌ Environment variables not properly configured');
  process.exit(1);
}

// Test 2: Verify route structure
console.log('\n2. Checking route structure...');
import { existsSync } from 'fs';
import { join } from 'path';

const routes = [
  'src/app/create-shop/page.tsx',
  'src/app/auth/oauth-complete/page.tsx',
  'src/middleware.ts'
];

let routesOk = true;
for (const route of routes) {
  if (!existsSync(join(process.cwd(), route))) {
    console.log(`❌ Missing: ${route}`);
    routesOk = false;
  } else {
    console.log(`✅ Found: ${route}`);
  }
}

if (!routesOk) {
  console.log('\n❌ Route structure not properly set up');
  process.exit(1);
}

// Test 3: Verify middleware configuration
console.log('\n3. Checking middleware configuration...');
import { readFileSync } from 'fs';

try {
  const middlewareContent = readFileSync(join(process.cwd(), 'src/middleware.ts'), 'utf8');
  
  const checks = [
    { name: 'Create-shop route matcher', pattern: '/create-shop' },
    { name: 'OAuth completion route', pattern: '/auth/oauth-complete' },
    { name: 'Redirect to create-shop', pattern: 'redirecting to create-shop' }
  ];
  
  let middlewareOk = true;
  for (const check of checks) {
    if (!middlewareContent.includes(check.pattern)) {
      console.log(`❌ Missing: ${check.name}`);
      middlewareOk = false;
    } else {
      console.log(`✅ Found: ${check.name}`);
    }
  }
  
  if (!middlewareOk) {
    console.log('\n❌ Middleware not properly configured');
    process.exit(1);
  }
} catch (error) {
  console.log('❌ Error reading middleware file:', error instanceof Error ? error.message : String(error));
  process.exit(1);
}

// Test 4: Verify ClerkProvider configuration
console.log('\n4. Checking ClerkProvider configuration...');
try {
  const layoutContent = readFileSync(join(process.cwd(), 'src/app/layout.tsx'), 'utf8');
  
  if (layoutContent.includes('afterSignUpUrl="/create-shop"')) {
    console.log('✅ ClerkProvider configured for create-shop redirect');
  } else {
    console.log('❌ ClerkProvider not configured for create-shop redirect');
    process.exit(1);
  }
} catch (error) {
  console.log('❌ Error reading layout file:', error instanceof Error ? error.message : String(error));
  process.exit(1);
}

// Test 5: Verify OAuth completion page logic
console.log('\n5. Checking OAuth completion page logic...');
try {
  const oauthPageContent = readFileSync(join(process.cwd(), 'src/app/auth/oauth-complete/page.tsx'), 'utf8');
  
  const checks = [
    { name: 'Retry logic with attempts', pattern: 'attempts' },
    { name: 'Processing state', pattern: 'isProcessing' },
    { name: 'User authentication check', pattern: 'user && userId' },
    { name: 'Timeout handling', pattern: 'setTimeout' }
  ];
  
  let oauthPageOk = true;
  for (const check of checks) {
    if (!oauthPageContent.includes(check.pattern)) {
      console.log(`❌ Missing: ${check.name}`);
      oauthPageOk = false;
    } else {
      console.log(`✅ Found: ${check.name}`);
    }
  }
  
  if (!oauthPageOk) {
    console.log('\n❌ OAuth completion page not properly configured');
    process.exit(1);
  }
} catch (error) {
  console.log('❌ Error reading OAuth completion page:', error instanceof Error ? error.message : String(error));
  process.exit(1);
}

console.log('\n✅ All tests passed!');
console.log('\n📋 OAuth Flow Summary:');
console.log('1. User clicks OAuth sign-up');
console.log('2. Clerk redirects to OAuth provider');
console.log('3. OAuth provider redirects back to /auth/oauth-complete');
console.log('4. OAuth completion page waits for Clerk to process session');
console.log('5. Once user is authenticated, redirects to /create-shop');
console.log('6. Middleware allows access to /create-shop for users without orgs');
console.log('7. User creates shop and gets redirected to /dashboard');

console.log('\n🚀 Ready to test OAuth sign-up flow!');
console.log('Start your dev server and try signing up with Google OAuth.'); 