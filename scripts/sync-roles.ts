#!/usr/bin/env tsx

import { clerkClient } from '@clerk/nextjs/server';
import { db } from '../src/server/db';
import { syncRoleToDatabase } from '../src/lib/roles';
import { env } from '../src/env';

async function syncExistingRoles() {
  console.log('🔄 Starting role synchronization from Clerk...');

  if (!env.CLERK_SECRET_KEY) {
    throw new Error('CLERK_SECRET_KEY is not set in the environment!');
  }

  try {
    // Get the Clerk client
    const clerk = await clerkClient();

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
      },
    });

    console.log(`Found ${users.length} users to check for role synchronization`);

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
        // Get organization invitations to see who has been invited and their roles
        const invitationsResponse = await clerk.organizations.getOrganizationInvitationList({
          organizationId: shopId,
        });
        const invitations = invitationsResponse.data;

        console.log(`Found ${invitations.length} invitations for shop ${shopId}`);

        // Process each user in this shop
        for (const user of shopUsers) {
          try {
            if (!user.clerkId) {
              console.log(`Skipping user ${user.email}: no clerkId`);
              skippedCount++;
              continue;
            }

            // Try to get user data from Clerk
            let clerkUser;
            try {
              clerkUser = await clerk.users.getUser(user.clerkId);
            } catch (error) {
              console.log(`Could not fetch Clerk user data for ${user.email}:`, error);
              skippedCount++;
              continue;
            }

            // Get user's organization memberships
            const userOrgMemberships = (clerkUser as any)?.organizationMemberships ?? [];
            const shopMembership = userOrgMemberships.find((membership: any) => 
              membership.organization?.id === shopId
            );

            if (shopMembership) {
              const clerkRole = shopMembership.role as string;
              
              // Get current role from database using raw query to avoid TypeScript issues
              const dbUser = await db.$queryRaw<Array<{ role: string | null }>>`
                SELECT role FROM "User" WHERE id = ${user.id}
              `;
              const dbRole = dbUser[0]?.role;

              if (dbRole !== clerkRole) {
                console.log(`Syncing role for ${user.email}: ${dbRole} -> ${clerkRole}`);
                await syncRoleToDatabase(db, user.email, clerkRole, shopId);
                syncedCount++;
              } else {
                console.log(`Role already synced for ${user.email}: ${dbRole}`);
                skippedCount++;
              }
            } else {
              // Check if user has a pending invitation
              const pendingInvitation = invitations.find((inv: any) => inv.emailAddress === user.email);
              if (pendingInvitation) {
                console.log(`User ${user.email} has pending invitation with role ${pendingInvitation.role}`);
                // Don't sync pending invitations - wait for them to accept
                skippedCount++;
              } else {
                console.log(`User ${user.email} not found in Clerk organization memberships or invitations`);
                skippedCount++;
              }
            }
          } catch (error) {
            console.error(`Error processing user ${user.email}:`, error);
            errorCount++;
          }
        }
      } catch (error) {
        console.error(`Error processing shop ${shopId}:`, error);
        errorCount++;
      }
    }

    console.log('\n✅ Role synchronization completed!');
    console.log(`📊 Summary:`);
    console.log(`  • Synced: ${syncedCount} users`);
    console.log(`  • Skipped: ${skippedCount} users`);
    console.log(`  • Errors: ${errorCount} users`);

  } catch (error) {
    console.error('❌ Error during role synchronization:', error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

// Run the script
syncExistingRoles()
  .then(() => {
    console.log('🎉 Role synchronization script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Role synchronization script failed:', error);
    process.exit(1);
  }); 