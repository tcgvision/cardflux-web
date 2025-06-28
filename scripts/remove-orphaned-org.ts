#!/usr/bin/env tsx

import { db } from '../src/server/db';

async function removeOrphanedOrg() {
  console.log('🗑️ Removing orphaned organization: Acme Inc...\n');

  const orphanedOrgId = 'org_29w9IfBrPmcpi0IeBVaKtA7R94W';

  try {
    // Use transaction to ensure data consistency and proper cleanup order
    await db.$transaction(async (tx) => {
      console.log(`🔄 Starting cleanup for organization: ${orphanedOrgId}`);

      // 1. First, remove all users from this organization (clear shopId and role)
      const usersRemoved = await tx.user.updateMany({
        where: { shopId: orphanedOrgId },
        data: {
          shopId: null,
          role: null,
        },
      });
      console.log(`✅ Removed ${usersRemoved.count} users from organization ${orphanedOrgId}`);

      // 2. Delete all store credit transactions for this shop
      const creditTransactionsDeleted = await tx.storeCreditTransaction.deleteMany({
        where: { shopId: orphanedOrgId },
      });
      console.log(`✅ Deleted ${creditTransactionsDeleted.count} store credit transactions`);

      // 3. Delete all transaction items (must be done before transactions)
      const transactionItemsDeleted = await tx.transactionItem.deleteMany({
        where: {
          transaction: {
            shopId: orphanedOrgId,
          },
        },
      });
      console.log(`✅ Deleted ${transactionItemsDeleted.count} transaction items`);

      // 4. Delete all transactions
      const transactionsDeleted = await tx.transaction.deleteMany({
        where: { shopId: orphanedOrgId },
      });
      console.log(`✅ Deleted ${transactionsDeleted.count} transactions`);

      // 5. Delete all buylist items (must be done before buylists)
      const buylistItemsDeleted = await tx.buylistItem.deleteMany({
        where: {
          buylist: {
            shopId: orphanedOrgId,
          },
        },
      });
      console.log(`✅ Deleted ${buylistItemsDeleted.count} buylist items`);

      // 6. Delete all buylists
      const buylistsDeleted = await tx.buylist.deleteMany({
        where: { shopId: orphanedOrgId },
      });
      console.log(`✅ Deleted ${buylistsDeleted.count} buylists`);

      // 7. Delete all inventory items
      const inventoryItemsDeleted = await tx.inventoryItem.deleteMany({
        where: { shopId: orphanedOrgId },
      });
      console.log(`✅ Deleted ${inventoryItemsDeleted.count} inventory items`);

      // 8. Delete all products
      const productsDeleted = await tx.product.deleteMany({
        where: { shopId: orphanedOrgId },
      });
      console.log(`✅ Deleted ${productsDeleted.count} products`);

      // 9. Delete all customers
      const customersDeleted = await tx.customer.deleteMany({
        where: { shopId: orphanedOrgId },
      });
      console.log(`✅ Deleted ${customersDeleted.count} customers`);

      // 10. Delete shop settings
      const settingsDeleted = await tx.shopSettings.deleteMany({
        where: { shopId: orphanedOrgId },
      });
      console.log(`✅ Deleted shop settings`);

      // 11. Finally, delete the shop itself
      const shopDeleted = await tx.shop.delete({
        where: { id: orphanedOrgId },
      });

      console.log(`✅ Successfully deleted shop: ${shopDeleted.name} (${shopDeleted.slug})`);
      console.log(`🎉 Complete cleanup finished for organization: ${orphanedOrgId}`);
    });

    console.log(`✅ Orphaned organization removal completed successfully: ${orphanedOrgId}`);
  } catch (error) {
    console.error(`❌ Error removing orphaned organization ${orphanedOrgId}:`, error);
    
    // Log more specific error details
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        organizationId: orphanedOrgId,
      });
    }
    
    throw error;
  } finally {
    await db.$disconnect();
  }
}

// Run the cleanup
removeOrphanedOrg()
  .then(() => {
    console.log('\n🎉 Orphaned organization removal completed successfully!');
    console.log('💡 Run the sync-organizations.ts script again to verify synchronization.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Orphaned organization removal failed:', error);
    process.exit(1);
  }); 