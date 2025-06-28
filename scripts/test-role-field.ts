#!/usr/bin/env tsx

import { db } from '../src/server/db';

async function testRoleField() {
  console.log('🧪 Testing role field accessibility...');

  try {
    // Test 1: Check if we can query the role field
    const users = await db.user.findMany({
      select: {
        id: true,
        clerkId: true,
        email: true,
        role: true,
        shopId: true,
      },
      take: 5,
    });

    console.log('✅ Successfully queried users with role field:');
    users.forEach(user => {
      console.log(`  - ${user.email}: role = ${user.role ?? 'null'}`);
    });

    // Test 2: Check if we can filter by role
    const adminUsers = await db.user.findMany({
      where: { role: 'admin' },
      select: { email: true, role: true },
    });

    console.log(`\n✅ Found ${adminUsers.length} admin users:`);
    adminUsers.forEach(user => {
      console.log(`  - ${user.email}: ${user.role}`);
    });

    // Test 3: Check if we can update role
    if (users.length > 0) {
      const testUser = users[0];
      console.log(`\n🧪 Testing role update for user: ${testUser.email}`);
      
      const updatedUser = await db.user.update({
        where: { id: testUser.id },
        data: { role: testUser.role }, // Update with same value to test
        select: { email: true, role: true },
      });
      
      console.log(`✅ Successfully updated user role: ${updatedUser.email} -> ${updatedUser.role}`);
    }

    console.log('\n🎉 All role field tests passed!');
    
  } catch (error) {
    console.error('❌ Error testing role field:', error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

testRoleField()
  .then(() => {
    console.log('✅ Test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  }); 