import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seed temporarily disabled for deployment');
  return; // TODO: Fix schema issues before re-enabling seed

  console.log('🌱 Starting database seed...');

  // Create a sample shop with enhanced details
  const shop = await prisma.shop.upsert({
    where: { id: 'org_2yepdd2yQRhWmhsBKyztGPhjcAs' },
    update: {},
    create: {
      id: 'org_2yepdd2yQRhWmhsBKyztGPhjcAs',
      name: 'TCG Haven',
      slug: 'tcg-haven',
      description: 'Your premier destination for trading card games',
      type: 'local',
      address: {
        create: {
          street: '123 Card Street',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'US',
        },
      },
      contactInfo: {
        create: {
          phone: '+1-555-0123',
          email: 'info@tcghaven.com',
          website: 'https://tcghaven.com',
          taxId: '12-3456789',
          businessHours: {
            create: [
              { dayOfWeek: 1, openTime: '09:00', closeTime: '18:00' }, // Monday
              { dayOfWeek: 2, openTime: '09:00', closeTime: '18:00' }, // Tuesday
              { dayOfWeek: 3, openTime: '09:00', closeTime: '18:00' }, // Wednesday
              { dayOfWeek: 4, openTime: '09:00', closeTime: '18:00' }, // Thursday
              { dayOfWeek: 5, openTime: '09:00', closeTime: '18:00' }, // Friday
              { dayOfWeek: 6, openTime: '10:00', closeTime: '17:00' }, // Saturday
              { dayOfWeek: 0, isClosed: true }, // Sunday
            ],
          },
        },
      },
      posSettings: {
        create: {
          enableScanner: true,
          scannerDeviceType: 'camera',
          enableReceipts: true,
          enableCustomerDisplay: false,
          defaultPaymentMethod: 'CASH',
          taxRate: 8.875, // NY state tax
          enableDiscounts: true,
          maxDiscountPercent: 15.0,
          enableReturns: true,
          returnWindowDays: 30,
        },
      },
      supportedFranchises: {
        create: [
          { franchise: 'One Piece TCG', isActive: true },
          { franchise: 'Magic The Gathering', isActive: true },
          { franchise: 'Pokemon TCG', isActive: true },
        ],
      },
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
        lastVisit: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
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
        lastVisit: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        notes: 'MTG player, buys booster boxes',
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
        totalEarned: 200.00,
        lastVisit: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        notes: 'Pokemon collector, trades frequently',
      },
    }),
    prisma.customer.upsert({
      where: { shopId_phone: { shopId: shop.id, phone: '555-0104' } },
      update: {},
      create: {
        shopId: shop.id,
        name: 'David Wilson',
        phone: '555-0104',
        currentCredit: 13.25,
        totalEarned: 45.00,
        lastVisit: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        notes: 'Casual player, likes sealed products',
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

  // Create sample products with franchise-specific attributes
  const products = await Promise.all([
    // One Piece TCG cards
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
        franchiseAttributes: {
          create: {
            character: 'Monkey D. Luffy',
            cardType: 'Leader',
            cost: 5,
            power: 5000,
            counter: 2000,
            effect: 'This Leader can attack twice per turn.',
          },
        },
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
        franchiseAttributes: {
          create: {
            character: 'Roronoa Zoro',
            cardType: 'Character',
            cost: 4,
            power: 4000,
            counter: 1000,
            effect: 'When this card attacks, draw 1 card.',
          },
        },
      },
    }),
    // Magic The Gathering cards
    prisma.product.upsert({
      where: { 
        shopId_tcgLine_setCode_cardNumber: {
          shopId: shop.id,
          tcgLine: 'Magic The Gathering',
          setCode: 'MKM',
          cardNumber: 'MKM-001',
        }
      },
      update: {},
      create: {
        shopId: shop.id,
        name: 'Sol Ring',
        setCode: 'MKM',
        setName: 'Murders at Karlov Manor',
        tcgLine: 'Magic The Gathering',
        rarity: 'Uncommon',
        cardNumber: 'MKM-001',
        imageUrl: 'https://example.com/sol-ring.jpg',
        marketPrice: 2.50,
        lastPriceUpdate: new Date(),
        franchiseAttributes: {
          create: {
            manaCost: '{1}',
            manaValue: 1,
            mtgCardType: 'Artifact',
            subtypes: ['Equipment'],
            mtgFlavorText: 'The ring grants its bearer great power.',
            artist: 'John Doe',
            cardText: '{T}: Add {C}{C}.',
          },
        },
      },
    }),
    // Pokemon TCG cards
    prisma.product.upsert({
      where: { 
        shopId_tcgLine_setCode_cardNumber: {
          shopId: shop.id,
          tcgLine: 'Pokemon TCG',
          setCode: 'SV151',
          cardNumber: 'SV151-004',
        }
      },
      update: {},
      create: {
        shopId: shop.id,
        name: 'Pikachu',
        setCode: 'SV151',
        setName: 'Scarlet & Violet—151',
        tcgLine: 'Pokemon TCG',
        rarity: 'Common',
        cardNumber: 'SV151-004',
        imageUrl: 'https://example.com/pikachu.jpg',
        marketPrice: 0.50,
        lastPriceUpdate: new Date(),
        franchiseAttributes: {
          create: {
            pokemonType: 'Lightning',
            hp: 60,
            attack1: 'Thunder Shock',
            attack2: 'Quick Attack',
            weakness: 'Fighting',
            resistance: 'Metal',
            retreatCost: 1,
            artist: 'Jane Smith',
            cardText: 'This Pokemon can use Thunder Shock for 20 damage.',
          },
        },
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
        quantity: 8,
        price: 15.99,
        condition: 'NM',
        notes: 'Leader card, high demand',
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
        quantity: 12,
        price: 8.50,
        condition: 'NM',
        notes: 'SR card, moderate demand',
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
        quantity: 25,
        price: 2.50,
        condition: 'NM',
        notes: 'MTG staple, always in demand',
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
        quantity: 50,
        price: 0.50,
        condition: 'NM',
        notes: 'Common Pokemon card',
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
      const tax = subtotal * 0.08875; // 8.875% tax (NY)
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
              productId: products[3].id,
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
              productId: products[2].id,
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
  console.log(`  • Address: ${shop.address?.street}, ${shop.address?.city}, ${shop.address?.state}`);
  console.log(`  • Supported Franchises: ${shop.supportedFranchises?.length ?? 0}`);
  console.log(`  • Customers: ${customers.length}`);
  console.log(`  • Products: ${products.length}`);
  console.log(`  • Inventory Items: ${inventoryItems.length}`);
  console.log(`  • Transactions (30 days): ${transactions.length}`);
  console.log(`  • Buylists: ${buylists.length}`);
  console.log(`  • Store Credit Transactions: ${creditTransactions.length}`);
  console.log('\n🚀 Your dashboard should now display real data!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  }); 