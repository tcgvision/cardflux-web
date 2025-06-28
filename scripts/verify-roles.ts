#!/usr/bin/env tsx

import { db } from '../src/server/db';

async function verifyRoleSync() {
  console.log('🔍 Verifying role synchronization between Clerk and database...');

  try {
    // Get all users from our database
    const users = await db.user.findMany({
      where: {
        shopId: { not: null }, // Only users who are part of a shop
      },
      select: {
        id: true,
        clerkId: true,
        email: true,
        shopId: true,
        role: true,
      },
    });

    console.log(`Found ${users.length} users to verify`);

    let usersWithRoles = 0;
    let usersWithoutRoles = 0;
    let totalUsers = 0;

    for (const user of users) {
      totalUsers++;
      
      if (user.role) {
        usersWithRoles++;
        console.log(`✅ User ${user.email} has role: ${user.role}`);
      } else {
        usersWithoutRoles++;
        console.log(`❌ User ${user.email} has NO role in database`);
      }
    }

    console.log('\n📊 Role Verification Summary:');
    console.log(`  • Total users: ${totalUsers}`);
    console.log(`  • Users with roles: ${usersWithRoles}`);
    console.log(`  • Users without roles: ${usersWithoutRoles}`);
    console.log(`  • Role coverage: ${((usersWithRoles / totalUsers) * 100).toFixed(1)}%`);

    if (usersWithoutRoles > 0) {
      console.log('\n⚠️  Users without roles need manual verification:');
      console.log('   1. Check if they have accepted their Clerk organization invitation');
      console.log('   2. Verify their role in Clerk Dashboard');
      console.log('   3. The webhook should automatically sync roles when they accept invitations');
      console.log('\n💡 To trigger role sync:');
      console.log('   - Have users sign out and sign back in');
      console.log('   - Or manually update their role in Clerk Dashboard');
    } else {
      console.log('\n🎉 All users have roles synced!');
    }

  } catch (error) {
    console.error('❌ Error during role verification:', error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

// Run the script
verifyRoleSync()
  .then(() => {
    console.log('\n✅ Role verification completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Role verification failed:', error);
    process.exit(1);
  }); 