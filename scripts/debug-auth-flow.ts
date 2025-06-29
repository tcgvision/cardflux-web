#!/usr/bin/env tsx

/**
 * Debug script to test authentication flow
 * This script helps identify issues with the auth flow
 */

import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function debugAuthFlow() {
  console.log('🔍 Debugging authentication flow...\n');

  try {
    // Test 1: Check database connection
    console.log('1. Testing database connection...');
    await db.$connect();
    console.log('✅ Database connection successful\n');

    // Test 2: Check user table
    console.log('2. Checking user table...');
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        clerkId: true,
        name: true,
        shopId: true,
        role: true,
      },
    });
    
    console.log(`Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`   - ${user.email} (Clerk: ${user.clerkId}) - Shop: ${user.shopId ?? 'None'} - Role: ${user.role ?? 'None'}`);
    });
    console.log('');

    // Test 3: Check shop table
    console.log('3. Checking shop table...');
    const shops = await db.shop.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        createdAt: true,
      },
    });
    
    console.log(`Found ${shops.length} shops:`);
    shops.forEach(shop => {
      console.log(`   - ${shop.name} (${shop.slug}) - Type: ${shop.type} - Created: ${shop.createdAt.toISOString()}`);
    });
    console.log('');

    // Test 4: Check for orphaned users
    console.log('4. Checking for orphaned users...');
    const orphanedUsers = await db.user.findMany({
      where: {
        shopId: null,
      },
      select: {
        id: true,
        email: true,
        clerkId: true,
        name: true,
      },
    });
    
    if (orphanedUsers.length > 0) {
      console.log(`⚠️  Found ${orphanedUsers.length} users without shop membership:`);
      orphanedUsers.forEach(user => {
        console.log(`   - ${user.email} (${user.clerkId}) - ${user.name}`);
      });
    } else {
      console.log('✅ No orphaned users found');
    }
    console.log('');

    // Test 5: Check webhook events (if any)
    console.log('5. Checking recent activity...');
    const recentUsers = await db.user.findMany({
      orderBy: {
        id: 'desc',
      },
      take: 3,
      select: {
        id: true,
        email: true,
        clerkId: true,
        name: true,
        shopId: true,
      },
    });
    
    console.log('Most recent users:');
    recentUsers.forEach(user => {
      const shopInfo = user.shopId ? ` - Shop ID: ${user.shopId}` : ' - No shop';
      console.log(`   - ${user.email}${shopInfo}`);
    });
    console.log('');

    // Test 6: Check environment variables (basic check)
    console.log('6. Checking environment variables...');
    const requiredEnvVars = [
      'DATABASE_URL',
      'CLERK_SECRET_KEY',
      'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
      'SIGNING_SECRET',
    ];
    
    requiredEnvVars.forEach(envVar => {
      const value = process.env[envVar];
      if (value) {
        console.log(`   ✅ ${envVar}: ${envVar.includes('KEY') || envVar.includes('SECRET') ? '***' : value.substring(0, 20) + '...'}`);
      } else {
        console.log(`   ❌ ${envVar}: Not set`);
      }
    });
    console.log('');

    console.log('✅ Authentication flow debug completed!');
    console.log('\n📋 Summary:');
    console.log(`   - Users: ${users.length} total`);
    console.log(`   - Shops: ${shops.length} total`);
    console.log(`   - Orphaned users: ${orphanedUsers.length}`);
    console.log(`   - Database: ✅ Connected`);
    
    if (orphanedUsers.length > 0) {
      console.log('\n🔧 Recommendations:');
      console.log('   1. Users without shop membership should be redirected to create-shop');
      console.log('   2. Check if webhooks are working properly');
      console.log('   3. Verify Clerk configuration');
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

// Run the debug
debugAuthFlow().catch(console.error); 