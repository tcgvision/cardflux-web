#!/usr/bin/env tsx

import { Webhook } from 'svix';
import { env } from '../src/env';

async function testOrganizationCreatedWebhook() {
  console.log('🧪 Testing organization.created webhook...');

  if (!env.SIGNING_SECRET) {
    console.error('❌ SIGNING_SECRET is not set in environment');
    process.exit(1);
  }

  // Sample organization.created webhook payload
  const webhookPayload = {
    data: {
      id: 'org_test_' + Date.now(),
      name: 'Test Organization',
      slug: 'test-org-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    object: 'organization',
    type: 'organization.created',
  };

  console.log('📦 Webhook payload:', JSON.stringify(webhookPayload, null, 2));

  // Create Svix webhook signature
  const wh = new Webhook(env.SIGNING_SECRET);
  const body = JSON.stringify(webhookPayload);
  const svixId = 'test_' + Date.now();
  const svixTimestamp = Math.floor(Date.now() / 1000).toString();
  const svixSignature = wh.sign(body, {
    'svix-id': svixId,
    'svix-timestamp': svixTimestamp,
  }, {
    'svix-id': svixId,
    'svix-timestamp': svixTimestamp,
  });

  const headers = {
    'svix-id': svixId,
    'svix-timestamp': svixTimestamp,
    'svix-signature': svixSignature,
  };

  console.log('🔐 Generated headers:', headers);

  // Send webhook to local endpoint
  const webhookUrl = 'http://localhost:3000/api/webhooks';
  
  try {
    console.log(`📤 Sending webhook to ${webhookUrl}...`);
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'svix-id': headers['svix-id'],
        'svix-timestamp': headers['svix-timestamp'],
        'svix-signature': headers['svix-signature'],
      },
      body,
    });

    console.log(`📥 Response status: ${response.status}`);
    console.log(`📥 Response headers:`, Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log(`📥 Response body: ${responseText}`);

    if (response.ok) {
      console.log('✅ Webhook test successful!');
    } else {
      console.log('❌ Webhook test failed!');
    }

  } catch (error) {
    console.error('💥 Error sending webhook:', error);
  }
}

// Run the test
testOrganizationCreatedWebhook()
  .then(() => {
    console.log('🎉 Webhook test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Webhook test failed:', error);
    process.exit(1);
  }); 