#!/usr/bin/env tsx

import { db } from '../src/server/db';

async function fixShopSettings() {
  console.log('🔧 Fixing missing shop settings...');

  try {
    // Get all shops without settings
    const shopsWithoutSettings = await db.shop.findMany({
      where: {
        settings: null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    console.log(`Found ${shopsWithoutSettings.length} shops without settings`);

    if (shopsWithoutSettings.length === 0) {
      console.log('✅ All shops already have settings!');
      return;
    }

    // Create settings for each shop
    for (const shop of shopsWithoutSettings) {
      try {
        const settings = await db.shopSettings.create({
          data: {
            shopId: shop.id,
            defaultCurrency: 'USD',
            enableNotifications: true,
            autoPriceSync: true,
            lowStockThreshold: 5,
            enableStoreCredit: true,
            minCreditAmount: 0,
            maxCreditAmount: 1000,
          },
        });

        console.log(`✅ Created settings for shop: ${shop.name} (${shop.slug})`);
      } catch (error) {
        console.error(`❌ Failed to create settings for shop ${shop.name}:`, error);
      }
    }

    console.log('🎉 Shop settings fix completed!');

  } catch (error) {
    console.error('❌ Error fixing shop settings:', error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

// Run the fix
fixShopSettings()
  .then(() => {
    console.log('✅ Shop settings fix completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Shop settings fix failed:', error);
    process.exit(1);
  }); 