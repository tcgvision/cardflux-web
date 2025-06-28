#!/usr/bin/env tsx

import { db } from '../src/server/db';
import { clerkClient } from '@clerk/nextjs/server';

async function testWebhookFlow() {
  console.log('🧪 Testing complete webhook flow...');

  try {
    // Get the Clerk client
    const clerk = await clerkClient();

    // Step 1: Check current state
    console.log('\n📊 Step 1: Current Database State');
    const currentShops = await db.shop.findMany({
      select: { id: true, name: true, slug: true, createdAt: true }
    });
    console.log(`Found ${currentShops.length} existing shops`);

    const currentUsers = await db.$queryRaw<Array<{
      id: number;
      email: string;
      name: string | null;
      shopId: string | null;
      role: string | null;
      clerkId: string;
    }>>`
      SELECT id, email, name, "shopId", role, "clerkId"
      FROM "User" 
      ORDER BY id
    `;
    console.log(`Found ${currentUsers.length} existing users`);

    // Step 2: Check Clerk organizations
    console.log('\n🏢 Step 2: Checking Clerk Organizations');
    try {
      const organizations = await clerk.organizations.getOrganizationList();
      console.log(`Found ${organizations.data.length} organizations in Clerk:`);
      organizations.data.forEach(org => {
        console.log(`  • ${org.name} (${org.id}) - Slug: ${org.slug}`);
      });
    } catch (error) {
      console.log('⚠️ Could not fetch Clerk organizations:', error);
    }

    // Step 3: Check for pending invitations
    console.log('\n📧 Step 3: Checking Pending Invitations');
    for (const shop of currentShops) {
      try {
        const invitations = await clerk.organizations.getOrganizationInvitationList({
          organizationId: shop.id,
        });
        console.log(`Shop ${shop.name}: ${invitations.data.length} pending invitations`);
        invitations.data.forEach(inv => {
          console.log(`  • ${inv.emailAddress} - Role: ${inv.role} - Status: ${inv.status}`);
        });
      } catch (error) {
        console.log(`⚠️ Could not fetch invitations for shop ${shop.name}:`, error);
      }
    }

    // Step 4: Check organization memberships
    console.log('\n👥 Step 4: Checking Organization Memberships');
    for (const shop of currentShops) {
      try {
        const members = await clerk.organizations.getOrganizationMembershipList({
          organizationId: shop.id,
        });
        console.log(`Shop ${shop.name}: ${members.data.length} members`);
        members.data.forEach(member => {
          console.log(`  • ${member.publicUserData?.identifier} - Role: ${member.role}`);
        });
      } catch (error) {
        console.log(`⚠️ Could not fetch members for shop ${shop.name}:`, error);
      }
    }

    // Step 5: Verify role sync
    console.log('\n🔄 Step 5: Verifying Role Sync');
    for (const user of currentUsers) {
      if (user.shopId) {
        try {
          const clerkUser = await clerk.users.getUser(user.clerkId || '');
          const userOrgMemberships = (clerkUser as any)?.organizationMemberships ?? [];
          const shopMembership = userOrgMemberships.find((membership: any) => 
            membership.organization?.id === user.shopId
          );
          
          if (shopMembership) {
            const clerkRole = shopMembership.role as string;
            console.log(`User ${user.email}: DB Role: ${user.role ?? 'none'} | Clerk Role: ${clerkRole}`);
            
            if (user.role !== clerkRole) {
              console.log(`  ⚠️ Role mismatch detected!`);
            } else {
              console.log(`  ✅ Roles match`);
            }
          } else {
            console.log(`User ${user.email}: No Clerk membership found for shop ${user.shopId}`);
          }
        } catch (error) {
          console.log(`⚠️ Could not check user ${user.email}:`, error);
        }
      }
    }

    // Step 6: Check shop settings
    console.log('\n⚙️ Step 6: Checking Shop Settings');
    const shopsWithSettings = await db.shop.findMany({
      include: { settings: true }
    });
    
    shopsWithSettings.forEach(shop => {
      if (shop.settings) {
        console.log(`✅ Shop ${shop.name}: Settings exist`);
      } else {
        console.log(`⚠️ Shop ${shop.name}: No settings found`);
      }
    });

    console.log('\n🎉 Webhook flow test completed!');
    console.log('\n📝 Summary:');
    console.log('• If you see role mismatches, run: npm run sync-roles');
    console.log('• If shops are missing settings, the webhook may need to be re-triggered');
    console.log('• If users have pending invitations, they need to accept them');

  } catch (error) {
    console.error('❌ Error during webhook flow test:', error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

// Run the test
testWebhookFlow()
  .then(() => {
    console.log('✅ Webhook flow test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Webhook flow test failed:', error);
    process.exit(1);
  }); 