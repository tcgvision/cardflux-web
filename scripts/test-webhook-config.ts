#!/usr/bin/env tsx

import { env } from '../src/env'

async function testWebhookConfig() {
  console.log('🔍 Testing Webhook Configuration...\n')

  try {
    // Check environment variables
    console.log('📋 Environment Variables:')
    console.log(`   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'Set' : 'Not set'}`)
    console.log(`   CLERK_SECRET_KEY: ${process.env.CLERK_SECRET_KEY ? 'Set' : 'Not set'}`)
    console.log(`   SIGNING_SECRET: ${process.env.SIGNING_SECRET ? 'Set' : 'Not set'}`)

    // Check app environment variables
    console.log('\n📋 App Environment Variables:')
    console.log(`   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'Set' : 'Not set'}`)
    console.log(`   CLERK_SECRET_KEY: ${env.CLERK_SECRET_KEY ? 'Set' : 'Not set'}`)
    console.log(`   SIGNING_SECRET: ${env.SIGNING_SECRET ? 'Set' : 'Not set'}`)

    // Determine webhook URL
    const isLocalhost = process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV !== 'production'
    const baseUrl = isLocalhost ? 'http://localhost:3001' : 'https://your-production-domain.com'
    const webhookUrl = `${baseUrl}/api/webhooks`

    console.log('\n🌐 Webhook Configuration:')
    console.log(`   Environment: ${isLocalhost ? 'Development' : 'Production'}`)
    console.log(`   Base URL: ${baseUrl}`)
    console.log(`   Webhook URL: ${webhookUrl}`)

    console.log('\n📋 Clerk Dashboard Configuration:')
    console.log('1. Go to Clerk Dashboard > Webhooks')
    console.log(`2. Set webhook endpoint to: ${webhookUrl}`)
    console.log('3. Enable these events:')
    console.log('   • user.created')
    console.log('   • user.updated')
    console.log('   • user.deleted')
    console.log('   • organization.created')
    console.log('   • organization.updated')
    console.log('   • organization.deleted')
    console.log('   • organizationMembership.created')
    console.log('   • organizationMembership.updated')
    console.log('   • organizationMembership.deleted')
    console.log('   • session.created')
    console.log('   • session.revoked')

    console.log('\n🔧 Webhook Testing:')
    console.log('1. Use ngrok to expose localhost: npx ngrok http 3001')
    console.log('2. Update Clerk webhook URL with ngrok URL')
    console.log('3. Test sign-up')
    console.log('4. Check ngrok logs for webhook requests')

    console.log('\n📋 Common Issues:')
    console.log('• Webhook URL not set in Clerk dashboard')
    console.log('• Wrong webhook URL (should be /api/webhooks)')
    console.log('• Webhook events not enabled')
    console.log('• Network issues (firewall, etc.)')
    console.log('• Invalid signing secret')

    console.log('\n🚀 Next Steps:')
    console.log('1. Verify webhook URL in Clerk dashboard')
    console.log('2. Enable all required webhook events')
    console.log('3. Test sign-up with ngrok')
    console.log('4. Monitor webhook delivery logs')

  } catch (error) {
    console.error('❌ Webhook config test failed:', error)
  }
}

testWebhookConfig().catch(console.error) 