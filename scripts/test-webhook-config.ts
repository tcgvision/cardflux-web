#!/usr/bin/env tsx

import { Webhook } from 'svix'
import { headers } from 'next/headers'

console.log('🔍 Testing Webhook Configuration...\n')

// Check environment variables
console.log('📋 Environment Variables:')
console.log('SIGNING_SECRET length:', process.env.SIGNING_SECRET?.length ?? 0)
console.log('WEBHOOK_SECRET length:', process.env.WEBHOOK_SECRET?.length ?? 0)
console.log('CLERK_SECRET_KEY length:', process.env.CLERK_SECRET_KEY?.length ?? 0)
console.log('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY length:', process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.length ?? 0)

// Check if webhook secret is available
const SIGNING_SECRET = process.env.SIGNING_SECRET ?? process.env.WEBHOOK_SECRET
if (!SIGNING_SECRET) {
  console.error('\n❌ ERROR: No webhook signing secret found!')
  console.error('Please set either SIGNING_SECRET or WEBHOOK_SECRET in your .env.local file')
  console.error('\nTo get your webhook secret:')
  console.error('1. Go to Clerk Dashboard')
  console.error('2. Navigate to Webhooks')
  console.error('3. Create or edit your webhook')
  console.error('4. Copy the signing secret')
  process.exit(1)
}

console.log('\n✅ Webhook signing secret found')

// Test webhook verification
try {
  const wh = new Webhook(SIGNING_SECRET)
  console.log('✅ Webhook instance created successfully')
} catch (error) {
  console.error('❌ Error creating webhook instance:', error)
  process.exit(1)
}

console.log('\n📋 Next Steps to Debug:')
console.log('1. Check your Clerk Dashboard webhook configuration:')
console.log('   - Go to https://dashboard.clerk.com')
console.log('   - Navigate to Webhooks')
console.log('   - Verify your webhook URL is correct')
console.log('   - Make sure the webhook is enabled')
console.log('   - Check that all required events are selected')

console.log('\n2. Verify your webhook URL:')
console.log('   - If using ngrok: https://your-ngrok-url.ngrok.io/api/webhooks')
console.log('   - If deployed: https://your-domain.com/api/webhooks')

console.log('\n3. Test webhook delivery:')
console.log('   - In Clerk Dashboard, click "Send Test Event"')
console.log('   - Check your server logs for webhook receipt')
console.log('   - Check ngrok logs if using ngrok')

console.log('\n4. Check webhook delivery logs:')
console.log('   - In Clerk Dashboard, go to Webhooks > [Your Webhook] > Delivery Logs')
console.log('   - Look for failed deliveries and error messages')

console.log('\n5. Verify your server is accessible:')
console.log('   - Make sure your server is running')
console.log('   - Test with: curl -X POST http://localhost:3001/api/webhooks')

console.log('\n6. Check system clock:')
console.log('   - Run: date')
console.log('   - If clock is off, sync it: sudo sntp -sS time.apple.com')

console.log('\n🔍 Current time:', new Date().toISOString()) 