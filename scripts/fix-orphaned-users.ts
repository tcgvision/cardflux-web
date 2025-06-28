#!/usr/bin/env tsx

// Load environment variables from .env files
import 'dotenv/config';

import { clerkClient } from '@clerk/nextjs/server';
import { db } from '../src/server/db';
import { env } from '../src/env';

// Type definitions for Clerk user data
interface ClerkOrganizationMembership {
  organization?: {
    id: string;
    name?: string;
  };
  role: string;
}

interface ClerkUser {
  id: string;
  emailAddresses: Array<{
    emailAddress: string;
  }>;
  organizationMemberships?: ClerkOrganizationMembership[];
}

async function fixOrphanedUsers() {
  console.log('🔧 Fixing orphaned users...');

  if (!env.CLERK_SECRET_KEY) {
    throw new Error('CLERK_SECRET_KEY is not set in the environment!');
  }

  console.log('✅ CLERK_SECRET_KEY found in environment');

  try {
    const clerk = await clerkClient();

    // Get all users without a shop
    const orphanedUsers = await db.user.findMany({
      where: { shopId: null },
      select: {
        id: true,
        email: true,
        clerkId: true,
        name: true,
      },
    });

    console.log(`Found ${orphanedUsers.length} orphaned users`);

    if (orphanedUsers.length === 0) {
      console.log('✅ No orphaned users found!');
      return;
    }

    // Get all shops
    const shops = await db.shop.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    console.log(`Found ${shops.length} shops`);

    let fixedCount = 0;
    let errorCount = 0;

    for (const user of orphanedUsers) {
      try {
        console.log(`\n🔍 Checking user: ${user.email} (Clerk ID: ${user.clerkId})`);

        if (!user.clerkId) {
          console.log(`⚠️ User ${user.email} has no Clerk ID - skipping`);
          continue;
        }

        // Get user's organization memberships from Clerk
        let clerkUser: ClerkUser;
        try {
          clerkUser = await clerk.users.getUser(user.clerkId) as ClerkUser;
        } catch (error) {
          console.log(`❌ Could not fetch Clerk user data for ${user.email}:`, error);
          continue;
        }

        // Get user's organization memberships
        const userOrgMemberships = clerkUser?.organizationMemberships ?? [];
        
        if (userOrgMemberships.length === 0) {
          console.log(`ℹ️ User ${user.email} has no organization memberships`);
          continue;
        }

        // Find the first organization membership
        const membership = userOrgMemberships[0];
        if (!membership) {
          console.log(`⚠️ User ${user.email} has empty organization memberships array`);
          continue;
        }
        const organizationId = membership.organization?.id;
        const role = membership.role;

        if (!organizationId) {
          console.log(`⚠️ User ${user.email} has membership but no organization ID`);
          continue;
        }

        // Check if this organization exists in our database
        const shop = shops.find(s => s.id === organizationId);
        if (!shop) {
          console.log(`⚠️ Organization ${organizationId} not found in database for user ${user.email}`);
          continue;
        }

        console.log(`✅ Found organization membership: ${shop.name} (${shop.slug}) with role: ${role}`);

        // Update user to link them to the organization
        const updatedUser = await db.user.update({
          where: { id: user.id },
          data: {
            shopId: organizationId,
            role: role,
          },
        });

        console.log(`✅ Fixed user ${user.email}: linked to shop ${shop.name} with role ${role}`);
        fixedCount++;

      } catch (error) {
        console.error(`❌ Error fixing user ${user.email}:`, error);
        errorCount++;
      }
    }

    console.log('\n🎉 User fix completed!');
    console.log(`📊 Summary:`);
    console.log(`  • Fixed: ${fixedCount} users`);
    console.log(`  • Errors: ${errorCount} users`);

    // Verify the fix
    const remainingOrphanedUsers = await db.user.count({
      where: { shopId: null },
    });

    console.log(`  • Remaining orphaned users: ${remainingOrphanedUsers}`);

  } catch (error) {
    console.error('❌ Error during user fix:', error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

// Run the script
fixOrphanedUsers()
  .then(() => {
    console.log('🎉 User fix script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 User fix script failed:', error);
    process.exit(1);
  }); 