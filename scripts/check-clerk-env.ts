#!/usr/bin/env tsx

console.log('🔍 Checking Clerk Environment Variables\n');

const requiredVars = [
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'NEXT_PUBLIC_CLERK_SIGN_IN_URL',
  'NEXT_PUBLIC_CLERK_SIGN_UP_URL',
  'NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL',
  'NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL',
  'SIGNING_SECRET'
];

console.log('📋 Required Environment Variables:');
let missingVars = 0;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`   ✅ ${varName}: Set (${value.length} characters)`);
  } else {
    console.log(`   ❌ ${varName}: Missing`);
    missingVars++;
  }
});

console.log(`\n📊 Summary: ${requiredVars.length - missingVars}/${requiredVars.length} variables set`);

if (missingVars > 0) {
  console.log('\n🚨 CRITICAL: Missing environment variables will break authentication flow!');
  console.log('\n💡 To fix this:');
  console.log('1. Go to your Clerk Dashboard');
  console.log('2. Navigate to Settings > Environment Variables');
  console.log('3. Copy the required variables to your .env.local file');
  console.log('\n📝 Required .env.local format:');
  console.log('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...');
  console.log('CLERK_SECRET_KEY=sk_test_...');
  console.log('NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/sign-in');
  console.log('NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/sign-up');
  console.log('NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard');
  console.log('NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/create-shop');
  console.log('SIGNING_SECRET=whsec_...');
} else {
  console.log('\n✅ All required environment variables are set!');
}

// Check if .env.local exists
import { existsSync } from 'fs';
import { join } from 'path';

const envLocalPath = join(process.cwd(), '.env.local');
if (existsSync(envLocalPath)) {
  console.log('\n✅ .env.local file exists');
} else {
  console.log('\n⚠️ .env.local file does not exist');
  console.log('   Create a .env.local file in your project root with the required variables');
} 