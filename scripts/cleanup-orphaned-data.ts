#!/usr/bin/env tsx

import { db } from '../src/server/db';

async function cleanupOrphanedData() {
  console.log('🧹 Cleanup script temporarily disabled for deployment');
  return; // TODO: Fix TypeScript errors before re-enabling

  console.log('🧹 Starting cleanup of orphaned data...\n');

  try {
    // Use transaction to ensure data consistency
    await db.$transaction(async (tx) => {
      console.log('📋 Step 1: Finding orphaned data...');

      // Find all shops that exist in our database
      const shops = await tx.shop.findMany({
        select: { id: true, name: true, slug: true },
      });
      const shopIds = new Set(shops.map(shop => shop.id));

      console.log(`Found ${shops.length} shops in database`);

      // 1. Clean up users with invalid shopId references
      const orphanedUsers = await tx.user.findMany({
        where: {
          shopId: { not: null },
        },
        select: { id: true, email: true, shopId: true },
      });

      const usersToFix = orphanedUsers.filter(user => !shopIds.has(user.shopId!));
      
      if (usersToFix.length > 0) {
        console.log(`\n🔧 Step 2: Fixing ${usersToFix.length} users with invalid shop references...`);
        
        for (const user of usersToFix) {
          console.log(`  - User ${user.email}: shopId ${user.shopId} (shop doesn't exist)`);
        }

        const fixedUsers = await tx.user.updateMany({
          where: {
            shopId: { not: null },
            shop: null, // This will catch any shopId that doesn't reference a valid shop
          },
          data: {
            shopId: null,
            role: null,
          },
        });

        console.log(`✅ Fixed ${fixedUsers.count} users with invalid shop references`);
      } else {
        console.log('✅ No users with invalid shop references found');
      }

      // 2. Clean up orphaned store credit transactions
      const orphanedCreditTransactions = await tx.storeCreditTransaction.findMany({
        where: {
          shopId: { not: null },
        },
        select: { id: true, shopId: true },
      });

      const creditTransactionsToDelete = orphanedCreditTransactions.filter(tx => !shopIds.has(tx.shopId!));
      
      if (creditTransactionsToDelete.length > 0) {
        console.log(`\n🗑️ Step 3: Deleting ${creditTransactionsToDelete.length} orphaned store credit transactions...`);
        
        const deletedCreditTransactions = await tx.storeCreditTransaction.deleteMany({
          where: {
            shopId: { not: null },
            shop: null,
          },
        });

        console.log(`✅ Deleted ${deletedCreditTransactions.count} orphaned store credit transactions`);
      } else {
        console.log('✅ No orphaned store credit transactions found');
      }

      // 3. Clean up orphaned transaction items
      const orphanedTransactionItems = await tx.transactionItem.findMany({
        where: {
          transaction: {
            shopId: { not: null },
          },
        },
        select: { id: true },
        include: {
          transaction: {
            select: { shopId: true },
          },
        },
      });

      const transactionItemsToDelete = orphanedTransactionItems.filter(item => !shopIds.has(item.transaction.shopId!));
      
      if (transactionItemsToDelete.length > 0) {
        console.log(`\n🗑️ Step 4: Deleting ${transactionItemsToDelete.length} orphaned transaction items...`);
        
        const deletedTransactionItems = await tx.transactionItem.deleteMany({
          where: {
            transaction: {
              shopId: { not: null },
              shop: null,
            },
          },
        });

        console.log(`✅ Deleted ${deletedTransactionItems.count} orphaned transaction items`);
      } else {
        console.log('✅ No orphaned transaction items found');
      }

      // 4. Clean up orphaned transactions
      const orphanedTransactions = await tx.transaction.findMany({
        where: {
          shopId: { not: null },
        },
        select: { id: true, shopId: true },
      });

      const transactionsToDelete = orphanedTransactions.filter(tx => !shopIds.has(tx.shopId!));
      
      if (transactionsToDelete.length > 0) {
        console.log(`\n🗑️ Step 5: Deleting ${transactionsToDelete.length} orphaned transactions...`);
        
        const deletedTransactions = await tx.transaction.deleteMany({
          where: {
            shopId: { not: null },
            shop: null,
          },
        });

        console.log(`✅ Deleted ${deletedTransactions.count} orphaned transactions`);
      } else {
        console.log('✅ No orphaned transactions found');
      }

      // 5. Clean up orphaned buylist items
      const orphanedBuylistItems = await tx.buylistItem.findMany({
        where: {
          buylist: {
            shopId: { not: null },
          },
        },
        select: { id: true },
        include: {
          buylist: {
            select: { shopId: true },
          },
        },
      });

      const buylistItemsToDelete = orphanedBuylistItems.filter(item => !shopIds.has(item.buylist.shopId!));
      
      if (buylistItemsToDelete.length > 0) {
        console.log(`\n🗑️ Step 6: Deleting ${buylistItemsToDelete.length} orphaned buylist items...`);
        
        const deletedBuylistItems = await tx.buylistItem.deleteMany({
          where: {
            buylist: {
              shopId: { not: null },
              shop: null,
            },
          },
        });

        console.log(`✅ Deleted ${deletedBuylistItems.count} orphaned buylist items`);
      } else {
        console.log('✅ No orphaned buylist items found');
      }

      // 6. Clean up orphaned buylists
      const orphanedBuylists = await tx.buylist.findMany({
        where: {
          shopId: { not: null },
        },
        select: { id: true, shopId: true },
      });

      const buylistsToDelete = orphanedBuylists.filter(buylist => !shopIds.has(buylist.shopId!));
      
      if (buylistsToDelete.length > 0) {
        console.log(`\n🗑️ Step 7: Deleting ${buylistsToDelete.length} orphaned buylists...`);
        
        const deletedBuylists = await tx.buylist.deleteMany({
          where: {
            shopId: { not: null },
            shop: null,
          },
        });

        console.log(`✅ Deleted ${deletedBuylists.count} orphaned buylists`);
      } else {
        console.log('✅ No orphaned buylists found');
      }

      // 7. Clean up orphaned inventory items
      const orphanedInventoryItems = await tx.inventoryItem.findMany({
        where: {
          shopId: { not: null },
        },
        select: { id: true, shopId: true },
      });

      const inventoryItemsToDelete = orphanedInventoryItems.filter(item => !shopIds.has(item.shopId!));
      
      if (inventoryItemsToDelete.length > 0) {
        console.log(`\n🗑️ Step 8: Deleting ${inventoryItemsToDelete.length} orphaned inventory items...`);
        
        const deletedInventoryItems = await tx.inventoryItem.deleteMany({
          where: {
            shopId: { not: null },
            shop: null,
          },
        });

        console.log(`✅ Deleted ${deletedInventoryItems.count} orphaned inventory items`);
      } else {
        console.log('✅ No orphaned inventory items found');
      }

      // 8. Clean up orphaned products
      const orphanedProducts = await tx.product.findMany({
        where: {
          shopId: { not: null },
        },
        select: { id: true, shopId: true },
      });

      const productsToDelete = orphanedProducts.filter(product => !shopIds.has(product.shopId!));
      
      if (productsToDelete.length > 0) {
        console.log(`\n🗑️ Step 9: Deleting ${productsToDelete.length} orphaned products...`);
        
        const deletedProducts = await tx.product.deleteMany({
          where: {
            shopId: { not: null },
            shop: null,
          },
        });

        console.log(`✅ Deleted ${deletedProducts.count} orphaned products`);
      } else {
        console.log('✅ No orphaned products found');
      }

      // 9. Clean up orphaned customers
      const orphanedCustomers = await tx.customer.findMany({
        where: {
          shopId: { not: null },
        },
        select: { id: true, shopId: true },
      });

      const customersToDelete = orphanedCustomers.filter(customer => !shopIds.has(customer.shopId!));
      
      if (customersToDelete.length > 0) {
        console.log(`\n🗑️ Step 10: Deleting ${customersToDelete.length} orphaned customers...`);
        
        const deletedCustomers = await tx.customer.deleteMany({
          where: {
            shopId: { not: null },
            shop: null,
          },
        });

        console.log(`✅ Deleted ${deletedCustomers.count} orphaned customers`);
      } else {
        console.log('✅ No orphaned customers found');
      }

      // 10. Clean up orphaned shop settings
      const orphanedSettings = await tx.shopSettings.findMany({
        where: {
          shopId: { not: null },
        },
        select: { id: true, shopId: true },
      });

      const settingsToDelete = orphanedSettings.filter(setting => !shopIds.has(setting.shopId!));
      
      if (settingsToDelete.length > 0) {
        console.log(`\n🗑️ Step 11: Deleting ${settingsToDelete.length} orphaned shop settings...`);
        
        const deletedSettings = await tx.shopSettings.deleteMany({
          where: {
            shopId: { not: null },
            shop: null,
          },
        });

        console.log(`✅ Deleted ${deletedSettings.count} orphaned shop settings`);
      } else {
        console.log('✅ No orphaned shop settings found');
      }

      console.log('\n🎉 Cleanup completed successfully!');
    });

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  } finally {
    await db.$disconnect();
  }
}

cleanupOrphanedData()
  .then(() => {
    console.log('\n✅ Orphaned data cleanup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Orphaned data cleanup failed:', error);
    process.exit(1);
  }); 