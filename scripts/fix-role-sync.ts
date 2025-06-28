#!/usr/bin/env tsx

import { db } from '../src/server/db';
import { clerkClient } from '@clerk/nextjs/server';
import { env } from '../src/env';

async function fixRoleSync() {
  console.log('🔄 Fixing role sync for existing users...');

  if (!env.CLERK_SECRET_KEY) {
    throw new Error('CLERK_SECRET_KEY is not set in the environment!');
  }

  try {
    const clerk = await clerkClient();

    // Get all users with shopId (users who are part of organizations)
    const users = await db.$queryRaw<Array<{
      id: number;
      email: string;
      name: string | null;
      shopId: string | null;
      role: string | null;
      clerkId: string;
    }>>`
      SELECT id, email, name, "shopId", role, "clerkId"
      FROM "User" 
      WHERE "shopId" IS NOT NULL
      ORDER BY id
    `;

    console.log(`Found ${users.length} users to check for role sync`);

    let syncedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // Group users by shop to minimize API calls
    const usersByShop = users.reduce((acc, user) => {
      if (user.shopId) {
        acc[user.shopId] ??= [];
        acc[user.shopId]!.push(user);
      }
      return acc;
    }, {} as Record<string, typeof users>);

    // Process each shop
    for (const [shopId, shopUsers] of Object.entries(usersByShop)) {
      console.log(`\n🏪 Processing shop ${shopId} with ${shopUsers.length} users`);
      
      try {
        // Get organization memberships directly from the organization
        const membershipsResponse = await clerk.organizations.getOrganizationMembershipList({
          organizationId: shopId,
        });
        const memberships = membershipsResponse.data;

        console.log(`Found ${memberships.length} memberships in Clerk for shop ${shopId}`);

        // Process each user in this shop
        for (const user of shopUsers) {
          try {
            if (!user.clerkId) {
              console.log(`Skipping user ${user.email}: no clerkId`);
              skippedCount++;
              continue;
            }

            console.log(`\n👤 Processing user: ${user.email}`);

            // Find the user's membership in this organization
            const userMembership = memberships.find(membership => 
              membership.publicUserData?.identifier === user.email
            );

            if (userMembership) {
              const clerkRole = userMembership.role;
              const dbRole = user.role;

              console.log(`  Clerk Role: ${clerkRole}`);
              console.log(`  DB Role: ${dbRole ?? 'none'}`);

              if (dbRole !== clerkRole) {
                console.log(`  🔄 Syncing role: ${dbRole ?? 'none'} -> ${clerkRole}`);
                
                // Update the user's role in the database using raw query
                await db.$executeRaw`
                  UPDATE "User" 
                  SET role = ${clerkRole}
                  WHERE id = ${user.id}
                `;

                console.log(`  ✅ Role synced successfully`);
                syncedCount++;
              } else {
                console.log(`  ✅ Roles already match`);
                skippedCount++;
              }
            } else {
              console.log(`  ⚠️ No Clerk membership found for user ${user.email} in shop ${shopId}`);
              console.log(`  Available members: ${memberships.map(m => m.publicUserData?.identifier).join(', ')}`);
              skippedCount++;
            }

          } catch (error) {
            console.error(`  ❌ Error processing user ${user.email}:`, error);
            errorCount++;
          }
        }
      } catch (error) {
        console.error(`Error processing shop ${shopId}:`, error);
        errorCount++;
      }
    }

    console.log('\n🎉 Role sync fix completed!');
    console.log(`📊 Summary:`);
    console.log(`  • Synced: ${syncedCount} users`);
    console.log(`  • Skipped: ${skippedCount} users`);
    console.log(`  • Errors: ${errorCount} users`);

    if (syncedCount > 0) {
      console.log('\n✅ Role sync was successful! Users should now have correct roles.');
    } else {
      console.log('\n⚠️ No roles were synced. This might indicate:');
      console.log('  • Users don\'t have Clerk memberships');
      console.log('  • Roles are already in sync');
      console.log('  • There are data inconsistencies');
    }

  } catch (error) {
    console.error('❌ Error during role sync fix:', error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

// Run the fix
fixRoleSync()
  .then(() => {
    console.log('✅ Role sync fix completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Role sync fix failed:', error);
    process.exit(1);
  }); 