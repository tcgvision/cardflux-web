#!/usr/bin/env tsx

// Load environment variables from .env files
import 'dotenv/config';

import { clerkClient } from '@clerk/nextjs/server';
import { db } from '../src/server/db';
import { env } from '../src/env';

// Type definitions for Clerk data
interface ClerkOrganizationMembership {
  organization?: {
    id: string;
    name?: string;
    slug?: string;
  };
  role: string;
}

interface ClerkUser {
  id: string;
  emailAddresses: Array<{
    emailAddress: string;
  }>;
  firstName?: string;
  lastName?: string;
  organizationMemberships?: ClerkOrganizationMembership[];
}

interface ClerkOrganization {
  id: string;
  name: string;
  slug: string;
  membersCount?: number;
}

async function syncUsersAndOrganizations() {
  console.log('🔄 Starting comprehensive user and organization sync...');

  if (!env.CLERK_SECRET_KEY) {
    throw new Error('CLERK_SECRET_KEY is not set in the environment!');
  }

  console.log('✅ CLERK_SECRET_KEY found in environment');

  try {
    const clerk = await clerkClient();

    // Step 1: Sync organizations from Clerk to database
    console.log('\n📋 Step 1: Syncing organizations...');
    const clerkOrganizationsResponse = await clerk.organizations.getOrganizationList();
    const clerkOrganizations = clerkOrganizationsResponse.data;
    console.log(`Found ${clerkOrganizations.length} organizations in Clerk`);

    let orgsCreated = 0;
    let orgsUpdated = 0;

    for (const org of clerkOrganizations) {
      try {
        const existingShop = await db.shop.findUnique({
          where: { id: org.id },
        });

        if (existingShop) {
          // Update existing shop if needed
          if (existingShop.name !== org.name || existingShop.slug !== org.slug) {
            await db.shop.update({
              where: { id: org.id },
              data: {
                name: org.name,
                slug: org.slug,
              },
            });
            orgsUpdated++;
            console.log(`✅ Updated shop: ${org.name}`);
          }
        } else {
          // Create new shop
          await db.shop.create({
            data: {
              id: org.id,
              name: org.name,
              slug: org.slug,
              type: 'RETAIL', // Default type
            },
          });
          orgsCreated++;
          console.log(`✅ Created shop: ${org.name}`);
        }
      } catch (error) {
        console.error(`❌ Error syncing organization ${org.name}:`, error);
      }
    }

    console.log(`📊 Organizations: ${orgsCreated} created, ${orgsUpdated} updated`);

    // Step 2: Sync users and their organization memberships
    console.log('\n👥 Step 2: Syncing users and memberships...');
    const clerkUsersResponse = await clerk.users.getUserList();
    const clerkUsers = clerkUsersResponse.data;
    console.log(`Found ${clerkUsers.length} users in Clerk`);

    let usersCreated = 0;
    let usersUpdated = 0;
    let membershipsFixed = 0;

    for (const clerkUser of clerkUsers) {
      try {
        const user = clerkUser as ClerkUser;
        const email = user.emailAddresses[0]?.emailAddress;
        const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || null;

        if (!email) {
          console.log(`⚠️ User ${user.id} has no email - skipping`);
          continue;
        }

        // Check if user exists in database
        let dbUser = await db.user.findUnique({
          where: { clerkId: user.id },
        });

        if (!dbUser) {
          // Create new user
          dbUser = await db.user.create({
            data: {
              clerkId: user.id,
              email,
              name,
            },
          });
          usersCreated++;
          console.log(`✅ Created user: ${email}`);
        } else {
          // Update existing user if needed
          if (dbUser.email !== email || dbUser.name !== name) {
            await db.user.update({
              where: { id: dbUser.id },
              data: {
                email,
                name,
              },
            });
            usersUpdated++;
            console.log(`✅ Updated user: ${email}`);
          }
        }

        // Sync organization memberships
        const memberships = user.organizationMemberships ?? [];
        if (memberships.length > 0) {
          const membership = memberships[0]; // Take first membership
          if (!membership) {
            console.log(`⚠️ User ${email} has empty membership object`);
            continue;
          }
          const organizationId = membership.organization?.id;
          const role = membership.role;

          if (organizationId && dbUser.shopId !== organizationId) {
            // Check if organization exists in database
            const shop = await db.shop.findUnique({
              where: { id: organizationId },
            });

            if (shop) {
              await db.user.update({
                where: { id: dbUser.id },
                data: {
                  shopId: organizationId,
                  role,
                },
              });
              membershipsFixed++;
              console.log(`✅ Fixed membership for ${email}: ${shop.name} (${role})`);
            } else {
              console.log(`⚠️ Organization ${organizationId} not found in database for user ${email}`);
            }
          }
        } else if (dbUser.shopId) {
          // User has no Clerk memberships but has shopId in database
          console.log(`⚠️ User ${email} has shopId in database but no Clerk memberships`);
        }
      } catch (error) {
        console.error(`❌ Error syncing user ${clerkUser.id}:`, error);
      }
    }

    console.log(`📊 Users: ${usersCreated} created, ${usersUpdated} updated, ${membershipsFixed} memberships fixed`);

    // Step 3: Check for orphaned users
    console.log('\n🔍 Step 3: Checking for orphaned users...');
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

    if (orphanedUsers.length > 0) {
      console.log('Orphaned users:');
      orphanedUsers.forEach(user => {
        console.log(`  - ${user.email} (${user.clerkId})`);
      });
    }

    // Step 4: Summary
    console.log('\n🎉 Sync completed!');
    console.log('📊 Final Summary:');
    console.log(`  • Organizations: ${orgsCreated} created, ${orgsUpdated} updated`);
    console.log(`  • Users: ${usersCreated} created, ${usersUpdated} updated`);
    console.log(`  • Memberships: ${membershipsFixed} fixed`);
    console.log(`  • Orphaned users: ${orphanedUsers.length}`);

  } catch (error) {
    console.error('❌ Error during sync:', error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

// Run the script
syncUsersAndOrganizations()
  .then(() => {
    console.log('🎉 Sync script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Sync script failed:', error);
    process.exit(1);
  }); 