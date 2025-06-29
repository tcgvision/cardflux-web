#!/usr/bin/env tsx

/**
 * Test script to verify webhook endpoint is working
 */

import { config } from 'dotenv';

// Load environment variables
config();

async function testWebhookEndpoint() {
  console.log('🔍 Testing webhook endpoint...\n');

  try {
    // Test 1: Check if webhook endpoint is accessible
    console.log('1. Testing webhook endpoint accessibility...');
    const response = await fetch('http://localhost:3000/api/webhooks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'svix-id': 'test-id',
        'svix-timestamp': Date.now().toString(),
        'svix-signature': 'test-signature',
      },
      body: JSON.stringify({
        type: 'test',
        data: { id: 'test' }
      }),
    });

    console.log(`Response status: ${response.status}`);
    const responseText = await response.text();
    console.log(`Response body: ${responseText}`);
    
    if (response.status === 400) {
      console.log('✅ Webhook endpoint is accessible (400 is expected for invalid signature)');
    } else {
      console.log(`⚠️  Unexpected response: ${response.status}`);
    }
    console.log('');

    // Test 2: Check if other API endpoints are working
    console.log('2. Testing other API endpoints...');
    
    // Test check-shop-membership endpoint
    try {
      const membershipResponse = await fetch('http://localhost:3000/api/check-shop-membership');
      console.log(`Check membership endpoint: ${membershipResponse.status}`);
    } catch (error) {
      console.log('❌ Check membership endpoint failed:', error);
    }

    // Test debug-clerk endpoint
    try {
      const debugResponse = await fetch('http://localhost:3000/api/debug-clerk');
      console.log(`Debug clerk endpoint: ${debugResponse.status}`);
    } catch (error) {
      console.log('❌ Debug clerk endpoint failed:', error);
    }

    console.log('');

    // Test 3: Check environment variables
    console.log('3. Checking webhook-related environment variables...');
    const requiredVars = ['SIGNING_SECRET', 'CLERK_SECRET_KEY'];
    
    requiredVars.forEach(varName => {
      const value = process.env[varName];
      if (value) {
        console.log(`   ✅ ${varName}: Set (${value.length} characters)`);
      } else {
        console.log(`   ❌ ${varName}: Not set`);
      }
    });

    console.log('\n✅ Webhook endpoint test completed!');
    console.log('\n📋 Next steps:');
    console.log('   1. Check Clerk dashboard for webhook configuration');
    console.log('   2. Verify webhook URL is: http://localhost:3000/api/webhooks');
    console.log('   3. Ensure webhook events include: user.created, user.updated, organization.created');
    console.log('   4. Check if SIGNING_SECRET matches Clerk webhook signing secret');

  } catch (error) {
    console.error('❌ Webhook test failed:', error);
  }
}

// Run the test
testWebhookEndpoint().catch(console.error); 