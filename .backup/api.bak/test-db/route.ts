import { NextResponse } from "next/server";
import { db } from "~/server/db";

export async function GET() {
  try {
    console.log('🔍 TEST DB: Testing database connection...');

    // Test basic connection
    const result = await db.$queryRaw`SELECT 1 as test`;
    console.log('✅ TEST DB: Basic connection successful:', result);

    // Test if tables exist
    const tables = await db.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('Shop', 'User', 'Customer', 'Product', 'Transaction', 'Buylist', 'ShopSettings')
      ORDER BY table_name
    `;
    console.log('📋 TEST DB: Available tables:', tables);

    // Test shop table structure
    const shopColumns = await db.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Shop' 
      ORDER BY ordinal_position
    `;
    console.log('🏪 TEST DB: Shop table columns:', shopColumns);

    // Test if there are any shops
    const shopCount = await db.shop.count();
    console.log('🏪 TEST DB: Total shops in database:', shopCount);

    // Test if there are any users
    const userCount = await db.user.count();
    console.log('👤 TEST DB: Total users in database:', userCount);

    // Test if there are any customers
    const customerCount = await db.customer.count();
    console.log('👥 TEST DB: Total customers in database:', customerCount);

    // Test if there are any products
    const productCount = await db.product.count();
    console.log('📦 TEST DB: Total products in database:', productCount);

    // Test if there are any transactions
    const transactionCount = await db.transaction.count();
    console.log('💰 TEST DB: Total transactions in database:', transactionCount);

    // Test if there are any buylists
    const buylistCount = await db.buylist.count();
    console.log('📋 TEST DB: Total buylists in database:', buylistCount);

    return NextResponse.json({
      success: true,
      message: "Database connection and queries successful",
      data: {
        connection: "OK",
        tables: tables,
        counts: {
          shops: shopCount,
          users: userCount,
          customers: customerCount,
          products: productCount,
          transactions: transactionCount,
          buylists: buylistCount,
        },
        shopColumns: shopColumns,
      }
    });

  } catch (error) {
    console.error("❌ TEST DB: Error:", error);
    
    return NextResponse.json({ 
      success: false,
      error: "Database test failed",
      message: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
} 