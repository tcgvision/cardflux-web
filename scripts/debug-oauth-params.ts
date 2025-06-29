#!/usr/bin/env tsx

async function debugOAuthParams() {
  console.log('🔍 Debugging OAuth Parameters...\n')

  console.log('📋 OAuth Status Meanings:')
  console.log('• missing_requirements: Clerk needs more info to complete sign-up')
  console.log('• needs_identifier: Clerk needs email/username to sign in')
  console.log('• complete: OAuth flow completed successfully')
  console.log('• missing_requirements + needs_identifier: OAuth incomplete')

  console.log('\n🚨 Your Current Issue:')
  console.log('OAuth is stuck in incomplete state - this means:')
  console.log('1. Google OAuth returned successfully')
  console.log('2. But Clerk couldn\'t extract required user data')
  console.log('3. Or there\'s a configuration mismatch')

  console.log('\n🔧 Debugging Steps:')

  console.log('\n1. Check Browser URL After OAuth:')
  console.log('   Look for these parameters in your URL:')
  console.log('   • __clerk_status=complete (should be "complete")')
  console.log('   • __clerk_strategy=oauth_google')
  console.log('   • code=... (OAuth authorization code)')
  console.log('   • state=... (OAuth state parameter)')

  console.log('\n2. Check Clerk Dashboard OAuth Settings:')
  console.log('   • Go to Clerk Dashboard > User & Authentication > Social Connections')
  console.log('   • Check Google OAuth is enabled')
  console.log('   • Verify OAuth credentials are correct')
  console.log('   • Check redirect URLs match your app')

  console.log('\n3. Check Google OAuth Console:')
  console.log('   • Go to Google Cloud Console > APIs & Services > Credentials')
  console.log('   • Check OAuth 2.0 Client ID is configured')
  console.log('   • Verify authorized redirect URIs include Clerk\'s domain')
  console.log('   • Check if OAuth consent screen is configured')

  console.log('\n4. Common OAuth Issues:')
  console.log('   ❌ Missing email scope in Google OAuth')
  console.log('   ❌ Incorrect redirect URL in Google OAuth console')
  console.log('   ❌ OAuth consent screen not configured')
  console.log('   ❌ Client ID/Secret mismatch in Clerk')
  console.log('   ❌ Domain not verified in Google OAuth')

  console.log('\n5. Quick Fixes to Try:')
  console.log('   • Clear browser cookies and try again')
  console.log('   • Check if you\'re using the correct Google account')
  console.log('   • Try OAuth with a different Google account')
  console.log('   • Check if Google account has email verified')

  console.log('\n6. What to Look For in DevTools:')
  console.log('   • Network tab: Check for failed requests to Google/Clerk')
  console.log('   • Console tab: Look for OAuth error messages')
  console.log('   • Application tab: Check if any OAuth tokens are stored')

  console.log('\n7. Expected OAuth Flow:')
  console.log('   1. Click OAuth button')
  console.log('   2. Redirect to Google (accounts.google.com)')
  console.log('   3. User authenticates with Google')
  console.log('   4. Google redirects to Clerk with code')
  console.log('   5. Clerk exchanges code for user data')
  console.log('   6. Clerk redirects to your app with complete status')
  console.log('   7. Your app detects completion and sets session')

  console.log('\n8. Debugging Commands:')
  console.log('   • Check current URL parameters after OAuth')
  console.log('   • Look for any error messages in browser console')
  console.log('   • Check Network tab for failed requests')
  console.log('   • Verify Clerk dashboard OAuth configuration')

  console.log('\n🚀 Next Steps:')
  console.log('1. Try OAuth again and check the URL parameters')
  console.log('2. Verify Clerk dashboard OAuth settings')
  console.log('3. Check Google OAuth console configuration')
  console.log('4. Report back what you find in the URL and any errors')
}

debugOAuthParams().catch(console.error) 