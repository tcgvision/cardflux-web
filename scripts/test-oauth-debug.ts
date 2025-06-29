#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function testOAuthDebug() {
  console.log('🔍 Debugging OAuth Flow...\n')

  try {
    // Check for recent users (potential OAuth users)
    const recentUsers = await db.user.findMany({
      orderBy: {
        id: 'desc',
      },
      take: 10,
    })

    console.log('📊 Recent Users:')
    recentUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`)
      console.log(`   ID: ${user.id}`)
      console.log(`   Clerk ID: ${user.clerkId ?? 'Not set'}`)
      console.log(`   Shop ID: ${user.shopId ?? 'No shop'}`)
      console.log(`   Name: ${user.name ?? 'No name'}`)
      console.log('')
    })

    // Check for users with empty Clerk IDs (potential OAuth issues)
    const usersWithoutClerkId = await db.user.findMany({
      where: {
        clerkId: '',
      },
    })

    if (usersWithoutClerkId.length > 0) {
      console.log('⚠️  Users without Clerk ID (potential OAuth issues):')
      usersWithoutClerkId.forEach(user => {
        console.log(`   - ${user.email} (ID: ${user.id})`)
      })
      console.log('')
    }

    // Check webhook logs or recent activity
    console.log('🔧 OAuth Debugging Steps:')
    console.log('1. Check if webhook is firing for OAuth users')
    console.log('2. Verify Clerk OAuth configuration in dashboard')
    console.log('3. Check if OAuth provider (Google) is properly configured')
    console.log('4. Ensure environment variables are set correctly')
    console.log('5. Check browser console for any JavaScript errors')
    console.log('6. Verify that Clerk session is being set after OAuth')
    console.log('')
    
    console.log('📋 Common OAuth Issues:')
    console.log('- Webhook not firing for OAuth users')
    console.log('- Clerk session not being set after OAuth')
    console.log('- OAuth provider configuration issues')
    console.log('- Environment variables not loaded')
    console.log('- Middleware blocking OAuth callback')
    console.log('')
    
    console.log('🔍 Next Steps:')
    console.log('1. Try OAuth sign-up and check server logs')
    console.log('2. Check Clerk dashboard for OAuth configuration')
    console.log('3. Verify webhook is receiving user.created events')
    console.log('4. Check if user appears in database after OAuth')

  } catch (error) {
    console.error('❌ OAuth debug failed:', error)
  } finally {
    await db.$disconnect()
  }
}

testOAuthDebug().catch(console.error) 