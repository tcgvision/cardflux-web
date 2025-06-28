#!/usr/bin/env tsx

/**
 * Test script to verify authentication flow
 * This script helps diagnose authentication issues
 */

import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function testAuthFlow() {
  console.log('🔍 Testing authentication flow...\n');

  try {
    // Test 1: Check database connection
    console.log('1. Testing database connection...');
    await db.$connect();
    console.log('✅ Database connection successful\n');

    // Test 2: Check user table structure
    console.log('2. Checking user table structure...');
    const userCount = await db.user.count();
    console.log(`✅ User table accessible, ${userCount} users found\n`);

    // Test 3: Check shop table structure
    console.log('3. Checking shop table structure...');
    const shopCount = await db.shop.count();
    console.log(`✅ Shop table accessible, ${shopCount} shops found\n`);

    // Test 4: Check for any orphaned users
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

    // Test 5: Check for any orphaned shops
    console.log('5. Checking for orphaned shops...');
    const orphanedShops = await db.shop.findMany({
      where: {
        users: {
          none: {},
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
      },
    });
    
    if (orphanedShops.length > 0) {
      console.log(`⚠️  Found ${orphanedShops.length} shops without users:`);
      orphanedShops.forEach(shop => {
        console.log(`   - ${shop.name} (${shop.slug})`);
      });
    } else {
      console.log('✅ No orphaned shops found');
    }
    console.log('');

    // Test 6: Check recent user activity
    console.log('6. Checking recent user activity...');
    const recentUsers = await db.user.findMany({
      take: 5,
      select: {
        id: true,
        email: true,
        clerkId: true,
        name: true,
        shop: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });
    
    console.log('Recent users:');
    recentUsers.forEach(user => {
      const shopInfo = user.shop ? ` - Shop: ${user.shop.name}` : ' - No shop';
      console.log(`   - ${user.email}${shopInfo}`);
    });
    console.log('');

    console.log('✅ Authentication flow test completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - Database: ✅ Connected`);
    console.log(`   - Users: ${userCount} total`);
    console.log(`   - Shops: ${shopCount} total`);
    console.log(`   - Orphaned users: ${orphanedUsers.length}`);
    console.log(`   - Orphaned shops: ${orphanedShops.length}`);

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

// Run the test
testAuthFlow().catch(console.error); 