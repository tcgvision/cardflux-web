npx#!/usr/bin/env tsx

import { db } from '../src/server/db';
import { clerkClient } from '@clerk/nextjs/server';
import { env } from '../src/env';

async function syncOrganizations() {
  console.log('🔄 Starting organization synchronization between Clerk and database...\n');

  if (!env.CLERK_SECRET_KEY) {
    throw new Error('CLERK_SECRET_KEY is not set in the environment!');
  }

  try {
    const clerk = await clerkClient();

    // Get all organizations from Clerk
    console.log('📋 Step 1: Fetching organizations from Clerk...');
    const clerkOrgs = await clerk.organizations.getOrganizationList();
    const clerkOrgMap = new Map(
      clerkOrgs.data.map(org => [org.id, org])
    );

    console.log(`Found ${clerkOrgs.data.length} organizations in Clerk`);

    // Get all shops from database
    console.log('\n📋 Step 2: Fetching shops from database...');
    const dbShops = await db.shop.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        location: true,
        type: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const dbShopMap = new Map(
      dbShops.map(shop => [shop.id, shop])
    );

    console.log(`Found ${dbShops.length} shops in database`);

    // Step 3: Find organizations that need to be created in database
    console.log('\n📋 Step 3: Identifying missing organizations...');
    const missingOrgs = clerkOrgs.data.filter(org => !dbShopMap.has(org.id));

    if (missingOrgs.length > 0) {
      console.log(`Found ${missingOrgs.length} organizations in Clerk that don't exist in database:`);
      missingOrgs.forEach(org => {
        console.log(`  • ${org.name} (${org.id}) - ${org.slug}`);
      });

      // Create missing organizations
      console.log('\n🆕 Creating missing organizations in database...');
      for (const org of missingOrgs) {
        try {
          const newShop = await db.shop.create({
            data: {
              id: org.id,
              name: org.name,
              slug: org.slug,
              type: 'local', // Default type
              description: null,
              location: null,
            },
          });

          // Create default shop settings
          await db.shopSettings.create({
            data: {
              shopId: org.id,
              defaultCurrency: 'USD',
              enableNotifications: true,
              autoPriceSync: true,
              lowStockThreshold: 5,
              enableStoreCredit: true,
              minCreditAmount: 0,
              maxCreditAmount: 1000,
            },
          });

          console.log(`✅ Created shop: ${newShop.name} (${newShop.slug})`);
        } catch (error) {
          console.error(`❌ Failed to create shop ${org.name}:`, error);
        }
      }
    } else {
      console.log('✅ All Clerk organizations exist in database');
    }

    // Step 4: Find orphaned organizations in database
    console.log('\n📋 Step 4: Identifying orphaned organizations...');
    const orphanedOrgs = dbShops.filter(shop => !clerkOrgMap.has(shop.id));

    if (orphanedOrgs.length > 0) {
      console.log(`Found ${orphanedOrgs.length} organizations in database that don't exist in Clerk:`);
      orphanedOrgs.forEach(shop => {
        console.log(`  • ${shop.name} (${shop.id}) - ${shop.slug}`);
      });

      console.log('\n⚠️ Orphaned organizations found. These may need manual cleanup.');
      console.log('💡 Run the cleanup-orphaned-data.ts script to remove them safely.');
    } else {
      console.log('✅ No orphaned organizations found');
    }

    // Step 5: Update organization details to match Clerk
    console.log('\n📋 Step 5: Updating organization details...');
    let updatedCount = 0;

    for (const org of clerkOrgs.data) {
      const dbShop = dbShopMap.get(org.id);
      if (dbShop) {
        const needsUpdate = 
          dbShop.name !== org.name ||
          dbShop.slug !== org.slug;

        if (needsUpdate) {
          try {
            await db.shop.update({
              where: { id: org.id },
              data: {
                name: org.name,
                slug: org.slug,
                updatedAt: new Date(),
              },
            });

            console.log(`✅ Updated shop: ${org.name} (${org.slug})`);
            updatedCount++;
          } catch (error) {
            console.error(`❌ Failed to update shop ${org.name}:`, error);
          }
        }
      }
    }

    if (updatedCount === 0) {
      console.log('✅ All organization details are up to date');
    }

    // Step 6: Summary
    console.log('\n📊 Synchronization Summary:');
    console.log(`  • Clerk organizations: ${clerkOrgs.data.length}`);
    console.log(`  • Database shops: ${dbShops.length}`);
    console.log(`  • Created: ${missingOrgs.length}`);
    console.log(`  • Updated: ${updatedCount}`);
    console.log(`  • Orphaned: ${orphanedOrgs.length}`);

    // Step 7: Verify sync
    console.log('\n📋 Step 6: Verifying synchronization...');
    const finalDbShops = await db.shop.findMany({
      select: { id: true, name: true, slug: true },
    });

    const finalDbShopIds = new Set(finalDbShops.map(shop => shop.id));
    const clerkOrgIds = new Set(clerkOrgs.data.map(org => org.id));

    const inSync = finalDbShopIds.size === clerkOrgIds.size &&
      [...finalDbShopIds].every(id => clerkOrgIds.has(id));

    if (inSync) {
      console.log('✅ Organizations are now synchronized!');
    } else {
      console.log('⚠️ Organizations are not fully synchronized');
      console.log('   This may be due to orphaned organizations that need cleanup.');
    }

  } catch (error) {
    console.error('❌ Error during organization synchronization:', error);
    throw error;
  } finally {
    await db.$disconnect();
  }
}

// Run the synchronization
syncOrganizations()
  .then(() => {
    console.log('\n🎉 Organization synchronization completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Organization synchronization failed:', error);
    process.exit(1);
  }); 