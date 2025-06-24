import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create a sample shop
  const shop = await prisma.shop.upsert({
    where: { id: 'org_2yepdd2yQRhWmhsBKyztGPhjcAs' },
    update: {},
    create: {
      id: 'org_2yepdd2yQRhWmhsBKyztGPhjcAs',
      name: 'TCG Haven',
      slug: 'tcg-haven',
      description: 'Your premier destination for trading card games',
      location: 'New York, NY',
      type: 'local',
      settings: {
        create: {
          defaultCurrency: 'USD',
          enableNotifications: true,
          autoPriceSync: true,
          lowStockThreshold: 5,
          enableStoreCredit: true,
          minCreditAmount: 0,
          maxCreditAmount: 1000,
        },
      },
    },
  });

  console.log('✅ Shop created:', shop.name);

  // Create a sample user
  const user = await prisma.user.upsert({
    where: { clerkId: 'user_2yepdd2yQRhWmhsBKyztGPhjcAs' },
    update: {},
    create: {
      clerkId: 'user_2yepdd2yQRhWmhsBKyztGPhjcAs',
      email: 'admin@tcghaven.com',
      name: 'John Doe',
      shopId: shop.id,
    },
  });

  console.log('✅ User created:', user.name);

  // Create sample customers
  const customers = await Promise.all([
    prisma.customer.upsert({
      where: { shopId_phone: { shopId: shop.id, phone: '555-0101' } },
      update: {},
      create: {
        shopId: shop.id,
        name: 'Alice Johnson',
        phone: '555-0101',
        currentCredit: 25.50,
        totalEarned: 150.00,
        lastVisit: new Date(),
        notes: 'Regular customer, prefers One Piece cards',
      },
    }),
    prisma.customer.upsert({
      where: { shopId_phone: { shopId: shop.id, phone: '555-0102' } },
      update: {},
      create: {
        shopId: shop.id,
        name: 'Bob Smith',
        phone: '555-0102',
        currentCredit: 0,
        totalEarned: 75.00,
        lastVisit: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        notes: 'New customer, interested in competitive play',
      },
    }),
    prisma.customer.upsert({
      where: { shopId_phone: { shopId: shop.id, phone: '555-0103' } },
      update: {},
      create: {
        shopId: shop.id,
        name: 'Carol Davis',
        phone: '555-0103',
        currentCredit: 100.00,
        totalEarned: 300.00,
        lastVisit: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        notes: 'High-value customer, collects rare cards',
      },
    }),
  ]);

  console.log('✅ Customers created:', customers.length);

  // Create sample products
  const products = await Promise.all([
    prisma.product.upsert({
      where: { 
        shopId_tcgLine_setCode_cardNumber: {
          shopId: shop.id,
          tcgLine: 'One Piece TCG',
          setCode: 'OP06',
          cardNumber: 'OP06-001',
        }
      },
      update: {},
      create: {
        shopId: shop.id,
        name: 'Monkey D. Luffy',
        setCode: 'OP06',
        setName: 'Awakening of the New Era',
        tcgLine: 'One Piece TCG',
        rarity: 'Leader',
        cardNumber: 'OP06-001',
        imageUrl: 'https://example.com/luffy.jpg',
        marketPrice: 15.99,
        lastPriceUpdate: new Date(),
      },
    }),
    prisma.product.upsert({
      where: { 
        shopId_tcgLine_setCode_cardNumber: {
          shopId: shop.id,
          tcgLine: 'One Piece TCG',
          setCode: 'OP06',
          cardNumber: 'OP06-002',
        }
      },
      update: {},
      create: {
        shopId: shop.id,
        name: 'Roronoa Zoro',
        setCode: 'OP06',
        setName: 'Awakening of the New Era',
        tcgLine: 'One Piece TCG',
        rarity: 'SR',
        cardNumber: 'OP06-002',
        imageUrl: 'https://example.com/zoro.jpg',
        marketPrice: 8.50,
        lastPriceUpdate: new Date(),
      },
    }),
    prisma.product.upsert({
      where: { 
        shopId_tcgLine_setCode_cardNumber: {
          shopId: shop.id,
          tcgLine: 'One Piece TCG',
          setCode: 'OP05',
          cardNumber: 'OP05-001',
        }
      },
      update: {},
      create: {
        shopId: shop.id,
        name: 'Trafalgar Law',
        setCode: 'OP05',
        setName: 'Awakening of the New Era',
        tcgLine: 'One Piece TCG',
        rarity: 'Leader',
        cardNumber: 'OP05-001',
        imageUrl: 'https://example.com/law.jpg',
        marketPrice: 12.99,
        lastPriceUpdate: new Date(),
      },
    }),
  ]);

  console.log('✅ Products created:', products.length);

  // Create inventory items
  const inventoryItems = await Promise.all([
    prisma.inventoryItem.upsert({
      where: { 
        shopId_productId_condition: {
          shopId: shop.id,
          productId: products[0].id,
          condition: 'NM',
        }
      },
      update: {},
      create: {
        shopId: shop.id,
        productId: products[0].id,
        quantity: 5,
        price: 15.99,
        condition: 'NM',
        notes: 'Fresh from booster box',
      },
    }),
    prisma.inventoryItem.upsert({
      where: { 
        shopId_productId_condition: {
          shopId: shop.id,
          productId: products[1].id,
          condition: 'NM',
        }
      },
      update: {},
      create: {
        shopId: shop.id,
        productId: products[1].id,
        quantity: 3,
        price: 8.50,
        condition: 'NM',
        notes: 'Popular card, restock soon',
      },
    }),
    prisma.inventoryItem.upsert({
      where: { 
        shopId_productId_condition: {
          shopId: shop.id,
          productId: products[2].id,
          condition: 'NM',
        }
      },
      update: {},
      create: {
        shopId: shop.id,
        productId: products[2].id,
        quantity: 2,
        price: 12.99,
        condition: 'NM',
        notes: 'Limited stock',
      },
    }),
  ]);

  console.log('✅ Inventory items created:', inventoryItems.length);

  // Create sample transactions
  const transactions = await Promise.all([
    prisma.transaction.create({
      data: {
        shopId: shop.id,
        customerId: customers[0].id,
        type: 'CHECKOUT',
        staffId: user.id,
        subtotal: 31.98,
        tax: 2.56,
        discount: 0,
        totalAmount: 34.54,
        amountPaid: 34.54,
        storeCreditUsed: 0,
        paymentMethod: 'CREDIT_CARD',
        status: 'COMPLETED',
        notes: 'First purchase for Alice',
        items: {
          create: [
            {
              productId: products[0].id,
              quantity: 2,
              pricePerUnit: 15.99,
              condition: 'NM',
            },
          ],
        },
      },
    }),
    prisma.transaction.create({
      data: {
        shopId: shop.id,
        customerId: customers[1].id,
        type: 'CHECKOUT',
        staffId: user.id,
        subtotal: 8.50,
        tax: 0.68,
        discount: 0,
        totalAmount: 9.18,
        amountPaid: 9.18,
        storeCreditUsed: 0,
        paymentMethod: 'CASH',
        status: 'COMPLETED',
        notes: 'Bob\'s first visit',
        items: {
          create: [
            {
              productId: products[1].id,
              quantity: 1,
              pricePerUnit: 8.50,
              condition: 'NM',
            },
          ],
        },
      },
    }),
  ]);

  console.log('✅ Transactions created:', transactions.length);

  // Create sample buylist
  const buylist = await prisma.buylist.create({
    data: {
      shopId: shop.id,
      customerId: customers[2].id,
      staffId: user.id,
      status: 'CREDITED',
      totalValue: 45.00,
      storeCreditAmount: 45.00,
      cashAmount: 0,
      notes: 'Carol sold some cards for store credit',
      items: {
        create: [
          {
            productId: products[0].id,
            quantity: 2,
            offerPrice: 12.00,
            condition: 'NM',
          },
          {
            productId: products[1].id,
            quantity: 1,
            offerPrice: 6.00,
            condition: 'LP',
          },
        ],
      },
    },
  });

  console.log('✅ Buylist created');

  // Create store credit transaction for the buylist
  await prisma.storeCreditTransaction.create({
    data: {
      customerId: customers[2].id,
      shopId: shop.id,
      type: 'EARNED',
      amount: 45.00,
      balanceBefore: 55.00,
      balanceAfter: 100.00,
      referenceId: buylist.id,
      referenceType: 'BUYLIST',
      staffId: user.id,
      notes: 'Credit from buylist #' + buylist.id.slice(-6),
    },
  });

  console.log('✅ Store credit transaction created');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 