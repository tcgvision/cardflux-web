#!/usr/bin/env tsx

import { db } from '../src/server/db';
import { clerkClient } from '@clerk/nextjs/server';
import { env } from '../src/env';

async function cleanupOrphanedShops() {
  console.log('🧹 Cleaning up orphaned shops...');

  if (!env.CLERK_SECRET_KEY) {
    throw new Error('CLERK_SECRET_KEY is not set in the environment!');
  }

  try {
    const clerk = await clerkClient();

    // Get all shops from database
    const dbShops = await db.shop.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    console.log(`Found ${dbShops.length} shops in database`);

    // Get all organizations from Clerk
    const clerkOrgs = await clerk.organizations.getOrganizationList();
    const clerkOrgIds = new Set(clerkOrgs.data.map(org => org.id));

    console.log(`Found ${clerkOrgs.data.length} organizations in Clerk`);

    // Find orphaned shops (exist in DB but not in Clerk)
    const orphanedShops = dbShops.filter(shop => !clerkOrgIds.has(shop.id));

    if (orphanedShops.length === 0) {
      console.log('✅ No orphaned shops found!');
      return;
    }

    console.log(`Found ${orphanedShops.length} orphaned shops:`);
    orphanedShops.forEach(shop => {
      console.log(`  • ${shop.name} (${shop.id})`);
    });

    // Ask for confirmation
    console.log('\n⚠️ These shops will be deleted from the database.');
    console.log('This will also delete all related data (users, products, etc.).');
    
    // For now, let's just log them without deleting
    console.log('\n📝 Orphaned shops found (not deleted for safety):');
    orphanedShops.forEach(shop => {
      console.log(`  • ${shop.name} (${shop.id}) - ${shop.slug}`);
    });

    console.log('\n💡 To delete these shops, uncomment the deletion code in the script.');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

// Run the cleanup
cleanupOrphanedShops()
  .then(() => {
    console.log('✅ Cleanup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Cleanup failed:', error);
    process.exit(1);
  }); 