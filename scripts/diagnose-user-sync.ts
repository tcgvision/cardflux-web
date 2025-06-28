#!/usr/bin/env tsx

import { clerkClient } from '@clerk/nextjs/server';
import { db } from '../src/server/db';
import { env } from '../src/env';

async function diagnoseUserSync() {
  console.log('🔍 Diagnosing user synchronization issues...');

  if (!env.CLERK_SECRET_KEY) {
    throw new Error('CLERK_SECRET_KEY is not set in the environment!');
  }

  try {
    const clerk = await clerkClient();

    // Get all shops from database
    const shops = await db.shop.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    console.log(`Found ${shops.length} shops in database`);

    for (const shop of shops) {
      console.log(`\n🏪 Analyzing shop: ${shop.name} (${shop.slug})`);
      console.log(`   Clerk ID: ${shop.id}`);

      // Get users from database for this shop
      const dbUsers = await db.user.findMany({
        where: { shopId: shop.id },
        select: {
          id: true,
          clerkId: true,
          email: true,
          name: true,
          role: true,
          shopId: true,
        },
      });

      console.log(`   Database users: ${dbUsers.length}`);
      dbUsers.forEach(user => {
        console.log(`     - ${user.email} (${user.name}) - Role: ${user.role || 'none'} - Clerk ID: ${user.clerkId || 'none'}`);
      });

      // Get organization members from Clerk
      try {
        const orgMembersResponse = await clerk.organizations.getOrganizationMembershipList({
          organizationId: shop.id,
        });
        const clerkMembers = orgMembersResponse.data;

        console.log(`   Clerk members: ${clerkMembers.length}`);
        clerkMembers.forEach((member: any) => {
          const userData = member.publicUserData;
          console.log(`     - ${userData?.identifier} (${userData?.firstName} ${userData?.lastName}) - Role: ${member.role} - Status: ${member.status}`);
        });

        // Find mismatches
        const dbEmails = new Set(dbUsers.map(u => u.email));
        const clerkEmails = new Set(clerkMembers.map((m: any) => m.publicUserData?.identifier));

        const missingInDb = Array.from(clerkEmails).filter(email => !dbEmails.has(email));
        const missingInClerk = Array.from(dbEmails).filter(email => !clerkEmails.has(email));

        if (missingInDb.length > 0) {
          console.log(`   ❌ Missing in database: ${missingInDb.join(', ')}`);
        }

        if (missingInClerk.length > 0) {
          console.log(`   ❌ Missing in Clerk: ${missingInClerk.join(', ')}`);
        }

        if (missingInDb.length === 0 && missingInClerk.length === 0) {
          console.log(`   ✅ All users are synchronized`);
        }

        // Check for users with missing clerkId
        const usersWithoutClerkId = dbUsers.filter(u => !u.clerkId);
        if (usersWithoutClerkId.length > 0) {
          console.log(`   ⚠️ Users without Clerk ID: ${usersWithoutClerkId.map(u => u.email).join(', ')}`);
        }

        // Check for users with empty clerkId
        const usersWithEmptyClerkId = dbUsers.filter(u => u.clerkId === '');
        if (usersWithEmptyClerkId.length > 0) {
          console.log(`   ⚠️ Users with empty Clerk ID: ${usersWithEmptyClerkId.map(u => u.email).join(', ')}`);
        }

      } catch (error) {
        console.error(`   ❌ Error fetching Clerk members:`, error);
      }

      // Check for orphaned users (users with shopId but no matching shop)
      const orphanedUsers = await db.user.findMany({
        where: {
          shopId: { not: null },
          shop: null,
        },
        select: {
          id: true,
          email: true,
          shopId: true,
        },
      });

      if (orphanedUsers.length > 0) {
        console.log(`   ⚠️ Orphaned users (shopId but no shop): ${orphanedUsers.map(u => `${u.email} (shopId: ${u.shopId})`).join(', ')}`);
      }
    }

    // Check for users without any shop
    const usersWithoutShop = await db.user.findMany({
      where: { shopId: null },
      select: {
        id: true,
        email: true,
        clerkId: true,
      },
    });

    if (usersWithoutShop.length > 0) {
      console.log(`\n👥 Users without any shop: ${usersWithoutShop.length}`);
      usersWithoutShop.forEach(user => {
        console.log(`   - ${user.email} (Clerk ID: ${user.clerkId || 'none'})`);
      });
    }

  } catch (error) {
    console.error('❌ Error during diagnosis:', error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

// Run the script
diagnoseUserSync()
  .then(() => {
    console.log('\n🎉 Diagnosis completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Diagnosis failed:', error);
    process.exit(1);
  }); 