#!/usr/bin/env tsx

import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setupDatabase() {
  console.log('🚀 Setting up CardFlux database...\n');

  try {
    // Step 1: Push schema to database
    console.log('📋 Pushing Prisma schema to database...');
    execSync('npx prisma db push', { stdio: 'inherit' });
    console.log('✅ Schema pushed successfully\n');

    // Step 2: Generate Prisma client
    console.log('🔧 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma client generated\n');

    // Step 3: Check if we need to seed
    console.log('🌱 Checking if database needs seeding...');
    const shopCount = await prisma.shop.count();
    
    if (shopCount === 0) {
      console.log('📦 Database is empty, running seed script...');
      execSync('pnpm db:seed', { stdio: 'inherit' });
      console.log('✅ Database seeded successfully\n');
    } else {
      console.log('✅ Database already has data, skipping seed\n');
    }

    console.log('🎉 Database setup completed successfully!');
    console.log('\n📊 You can now:');
    console.log('  • Run the development server: pnpm dev');
    console.log('  • View your data: pnpm db:studio');
    console.log('  • Access the dashboard at: http://localhost:3000/dashboard');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

void setupDatabase(); 