#!/usr/bin/env tsx

import { db } from '../src/server/db';

async function verifyWebhookSetup() {
  console.log('🔍 Verifying webhook setup...');

  try {
    // Check if we can connect to the database
    console.log('📊 Testing database connection...');
    await db.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful');

    // Check if we have any shops in the database
    const shops = await db.shop.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        createdAt: true,
        settings: {
          select: {
            defaultCurrency: true,
            enableStoreCredit: true,
          }
        }
      }
    });

    console.log(`📊 Found ${shops.length} shops in database:`);
    shops.forEach(shop => {
      console.log(`  • ${shop.name} (${shop.slug}) - ${shop.type}`);
      console.log(`    Settings: Currency=${shop.settings?.defaultCurrency}, Store Credit=${shop.settings?.enableStoreCredit}`);
    });

    // Check if we have any users
    const users = await db.$queryRaw<Array<{
      id: number;
      email: string;
      name: string | null;
      shopId: string | null;
      role: string | null;
    }>>`
      SELECT id, email, name, "shopId", role 
      FROM "User" 
      ORDER BY id
    `;

    console.log(`👥 Found ${users.length} users in database:`);
    users.forEach(user => {
      console.log(`  • ${user.email} (${user.name}) - Shop: ${user.shopId}, Role: ${user.role ?? 'none'}`);
    });

    // Check environment variables
    console.log('🔧 Environment check:');
    console.log(`  • SIGNING_SECRET: ${process.env.SIGNING_SECRET ? '✅ Set' : '❌ Missing'}`);
    console.log(`  • CLERK_SECRET_KEY: ${process.env.CLERK_SECRET_KEY ? '✅ Set' : '❌ Missing'}`);
    console.log(`  • DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Set' : '❌ Missing'}`);

    console.log('\n🎉 Webhook verification completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Ensure your development server is running (npm run dev)');
    console.log('2. Check that your webhook URL is correctly configured in Clerk');
    console.log('3. Test with a real organization.created event from Clerk');

  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

// Run the verification
verifyWebhookSetup()
  .then(() => {
    console.log('✅ Verification script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Verification script failed:', error);
    process.exit(1);
  }); 