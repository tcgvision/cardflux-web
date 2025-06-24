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
    prisma.customer.upsert({
      where: { shopId_phone: { shopId: shop.id, phone: '555-0104' } },
      update: {},
      create: {
        shopId: shop.id,
        name: 'David Wilson',
        phone: '555-0104',
        currentCredit: 45.75,
        totalEarned: 200.00,
        lastVisit: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        notes: 'Competitive player, buys singles frequently',
      },
    }),
    prisma.customer.upsert({
      where: { shopId_phone: { shopId: shop.id, phone: '555-0105' } },
      update: {},
      create: {
        shopId: shop.id,
        name: 'Emma Brown',
        phone: '555-0105',
        currentCredit: 0,
        totalEarned: 50.00,
        lastVisit: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        notes: 'Casual player, likes sealed products',
      },
    }),
  ]);

  console.log('✅ Customers created:', customers.length);

  // Create sample products (One Piece TCG cards)
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
    prisma.product.upsert({
      where: { 
        shopId_tcgLine_setCode_cardNumber: {
          shopId: shop.id,
          tcgLine: 'One Piece TCG',
          setCode: 'OP06',
          cardNumber: 'OP06-003',
        }
      },
      update: {},
      create: {
        shopId: shop.id,
        name: 'Nami',
        setCode: 'OP06',
        setName: 'Awakening of the New Era',
        tcgLine: 'One Piece TCG',
        rarity: 'UC',
        cardNumber: 'OP06-003',
        imageUrl: 'https://example.com/nami.jpg',
        marketPrice: 2.99,
        lastPriceUpdate: new Date(),
      },
    }),
    prisma.product.upsert({
      where: { 
        shopId_tcgLine_setCode_cardNumber: {
          shopId: shop.id,
          tcgLine: 'One Piece TCG',
          setCode: 'OP06',
          cardNumber: 'OP06-004',
        }
      },
      update: {},
      create: {
        shopId: shop.id,
        name: 'Usopp',
        setCode: 'OP06',
        setName: 'Awakening of the New Era',
        tcgLine: 'One Piece TCG',
        rarity: 'UC',
        cardNumber: 'OP06-004',
        imageUrl: 'https://example.com/usopp.jpg',
        marketPrice: 1.99,
        lastPriceUpdate: new Date(),
      },
    }),
    prisma.product.upsert({
      where: { 
        shopId_tcgLine_setCode_cardNumber: {
          shopId: shop.id,
          tcgLine: 'One Piece TCG',
          setCode: 'OP06',
          cardNumber: 'OP06-005',
        }
      },
      update: {},
      create: {
        shopId: shop.id,
        name: 'Sanji',
        setCode: 'OP06',
        setName: 'Awakening of the New Era',
        tcgLine: 'One Piece TCG',
        rarity: 'SR',
        cardNumber: 'OP06-005',
        imageUrl: 'https://example.com/sanji.jpg',
        marketPrice: 6.50,
        lastPriceUpdate: new Date(),
      },
    }),
  ]);

  console.log('✅ Products created:', products.length);

  // Create inventory items with different conditions and quantities
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
          productId: products[0].id,
          condition: 'LP',
        }
      },
      update: {},
      create: {
        shopId: shop.id,
        productId: products[0].id,
        quantity: 2,
        price: 12.99,
        condition: 'LP',
        notes: 'Light edge wear',
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
    prisma.inventoryItem.upsert({
      where: { 
        shopId_productId_condition: {
          shopId: shop.id,
          productId: products[3].id,
          condition: 'NM',
        }
      },
      update: {},
      create: {
        shopId: shop.id,
        productId: products[3].id,
        quantity: 15,
        price: 2.99,
        condition: 'NM',
        notes: 'Common card, good stock',
      },
    }),
    prisma.inventoryItem.upsert({
      where: { 
        shopId_productId_condition: {
          shopId: shop.id,
          productId: products[4].id,
          condition: 'NM',
        }
      },
      update: {},
      create: {
        shopId: shop.id,
        productId: products[4].id,
        quantity: 8,
        price: 1.99,
        condition: 'NM',
        notes: 'Common card',
      },
    }),
    prisma.inventoryItem.upsert({
      where: { 
        shopId_productId_condition: {
          shopId: shop.id,
          productId: products[5].id,
          condition: 'NM',
        }
      },
      update: {},
      create: {
        shopId: shop.id,
        productId: products[5].id,
        quantity: 4,
        price: 6.50,
        condition: 'NM',
        notes: 'SR card, moderate demand',
      },
    }),
  ]);

  console.log('✅ Inventory items created:', inventoryItems.length);

  // Create sample transactions over the last 30 days for chart data
  const transactions = [];
  const now = new Date();
  
  // Generate transactions for the last 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dayOfWeek = date.getDay();
    
    // More activity on weekends
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const baseTransactions = isWeekend ? 3 : 1;
    const randomTransactions = Math.floor(Math.random() * (isWeekend ? 4 : 3));
    const dailyTransactions = baseTransactions + randomTransactions;
    
    for (let j = 0; j < dailyTransactions; j++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const product = products[Math.floor(Math.random() * products.length)];
      
      if (!customer || !product) continue;
      
      const quantity = Math.floor(Math.random() * 3) + 1;
      const pricePerUnit = product.marketPrice ?? 10;
      const subtotal = quantity * pricePerUnit;
      const tax = subtotal * 0.08; // 8% tax
      const totalAmount = subtotal + tax;
      
      const transaction = await prisma.transaction.create({
        data: {
          shopId: shop.id,
          customerId: customer.id,
          type: 'CHECKOUT',
          staffId: user.id,
          subtotal,
          tax,
          discount: 0,
          totalAmount,
          amountPaid: totalAmount,
          storeCreditUsed: Math.random() > 0.8 ? Math.min(customer.currentCredit, totalAmount * 0.3) : 0, // 20% chance of using store credit
          paymentMethod: ['CASH', 'CREDIT_CARD', 'DEBIT_CARD'][Math.floor(Math.random() * 3)] as 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD',
          status: 'COMPLETED',
          notes: `Daily transaction ${j + 1}`,
          createdAt: date,
          items: {
            create: [
              {
                productId: product.id,
                quantity,
                pricePerUnit,
                condition: 'NM',
              },
            ],
          },
        },
      });
      
      transactions.push(transaction);
    }
  }

  console.log('✅ Transactions created:', transactions.length);

  // Create sample buylists
  const buylists = await Promise.all([
    prisma.buylist.create({
      data: {
        shopId: shop.id,
        customerId: customers[2].id,
        staffId: user.id,
        status: 'CREDITED',
        totalValue: 45.00,
        storeCreditAmount: 45.00,
        cashAmount: 0,
        notes: 'Carol sold some cards for store credit',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
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
    }),
    prisma.buylist.create({
      data: {
        shopId: shop.id,
        customerId: customers[3].id,
        staffId: user.id,
        status: 'PENDING',
        totalValue: 32.50,
        storeCreditAmount: 32.50,
        cashAmount: 0,
        notes: 'David wants to sell some cards',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        items: {
          create: [
            {
              productId: products[2].id,
              quantity: 1,
              offerPrice: 8.00,
              condition: 'NM',
            },
            {
              productId: products[5].id,
              quantity: 2,
              offerPrice: 4.00,
              condition: 'LP',
            },
          ],
        },
      },
    }),
    prisma.buylist.create({
      data: {
        shopId: shop.id,
        customerId: customers[0].id,
        staffId: user.id,
        status: 'APPROVED',
        totalValue: 18.00,
        storeCreditAmount: 18.00,
        cashAmount: 0,
        notes: 'Alice selling some commons',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        items: {
          create: [
            {
              productId: products[3].id,
              quantity: 5,
              offerPrice: 1.50,
              condition: 'NM',
            },
            {
              productId: products[4].id,
              quantity: 3,
              offerPrice: 1.00,
              condition: 'NM',
            },
          ],
        },
      },
    }),
  ]);

  console.log('✅ Buylists created:', buylists.length);

  // Create store credit transactions
  const creditTransactions = await Promise.all([
    prisma.storeCreditTransaction.create({
      data: {
        customerId: customers[2].id,
        shopId: shop.id,
        type: 'EARNED',
        amount: 45.00,
        balanceBefore: 55.00,
        balanceAfter: 100.00,
        referenceId: buylists[0]?.id ?? '',
        referenceType: 'BUYLIST',
        staffId: user.id,
        notes: 'Credit from buylist #' + (buylists[0]?.id.slice(-6) ?? ''),
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.storeCreditTransaction.create({
      data: {
        customerId: customers[0].id,
        shopId: shop.id,
        type: 'SPENT',
        amount: 15.00,
        balanceBefore: 40.50,
        balanceAfter: 25.50,
        referenceId: transactions[0]?.id ?? '',
        referenceType: 'TRANSACTION',
        staffId: user.id,
        notes: 'Used credit for purchase',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.storeCreditTransaction.create({
      data: {
        customerId: customers[3].id,
        shopId: shop.id,
        type: 'EARNED',
        amount: 32.50,
        balanceBefore: 13.25,
        balanceAfter: 45.75,
        referenceId: buylists[1]?.id ?? '',
        referenceType: 'BUYLIST',
        staffId: user.id,
        notes: 'Credit from buylist #' + (buylists[1]?.id.slice(-6) ?? ''),
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  console.log('✅ Store credit transactions created:', creditTransactions.length);

  // Update customer credit balances based on transactions
  void Promise.all([
    prisma.customer.update({
      where: { id: customers[0].id },
      data: { currentCredit: 25.50 },
    }),
    prisma.customer.update({
      where: { id: customers[2].id },
      data: { currentCredit: 100.00 },
    }),
    prisma.customer.update({
      where: { id: customers[3].id },
      data: { currentCredit: 45.75 },
    }),
  ]);

  console.log('✅ Customer credit balances updated');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📊 Dashboard Data Summary:');
  console.log(`  • Shop: ${shop.name}`);
  console.log(`  • Customers: ${customers.length}`);
  console.log(`  • Products: ${products.length}`);
  console.log(`  • Inventory Items: ${inventoryItems.length}`);
  console.log(`  • Transactions (30 days): ${transactions.length}`);
  console.log(`  • Buylists: ${buylists.length}`);
  console.log(`  • Store Credit Transactions: ${creditTransactions.length}`);
  console.log('\n🚀 Your dashboard should now display real data!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  }); 