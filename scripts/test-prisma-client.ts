#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testPrismaClient() {
  console.log('🧪 Testing Prisma client...\n');

  try {
    // Test 1: Check if we can query the User model
    console.log('📋 Test 1: Checking User model structure...');
    const userCount = await prisma.user.count();
    console.log(`✅ User count: ${userCount}`);

    // Test 2: Try to select the role field specifically
    console.log('\n📋 Test 2: Testing role field access...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        clerkId: true,
        email: true,
        name: true,
        shopId: true,
        role: true, // This should work if the field exists
      },
      take: 1,
    });

    if (users.length > 0) {
      const user = users[0];
      console.log('✅ Successfully queried user with role field:');
      console.log(`  - ID: ${user.id}`);
      console.log(`  - Clerk ID: ${user.clerkId}`);
      console.log(`  - Email: ${user.email}`);
      console.log(`  - Name: ${user.name}`);
      console.log(`  - Shop ID: ${user.shopId}`);
      console.log(`  - Role: ${user.role ?? 'null'}`);
    } else {
      console.log('⚠️ No users found in database');
    }

    // Test 3: Try to update a user's role
    console.log('\n📋 Test 3: Testing role field update...');
    if (users.length > 0) {
      const testUser = users[0];
      const updatedUser = await prisma.user.update({
        where: { id: testUser.id },
        data: { role: 'admin' },
        select: {
          id: true,
          role: true,
        },
      });
      console.log(`✅ Successfully updated user role: ${updatedUser.role}`);

      // Revert the change
      await prisma.user.update({
        where: { id: testUser.id },
        data: { role: testUser.role },
      });
      console.log('✅ Reverted role change');
    }

    console.log('\n🎉 All Prisma client tests passed!');
    console.log('✅ The role field is properly accessible in the Prisma client.');

  } catch (error) {
    console.error('❌ Prisma client test failed:', error);
    
    if (error instanceof Error) {
      console.error('Error details:');
      console.error(`  - Message: ${error.message}`);
      console.error(`  - Stack: ${error.stack}`);
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testPrismaClient()
  .then(() => {
    console.log('\n🎉 Prisma client test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Prisma client test failed:', error);
    process.exit(1);
  }); 