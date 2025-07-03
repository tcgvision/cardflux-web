# Clerk Billing Integration for CardFlux

This document outlines the implementation of Clerk's built-in billing system with Stripe integration for CardFlux.

## Overview

CardFlux uses Clerk's B2B SaaS billing system, which provides:
- **Seamless integration** with Stripe for payment processing
- **Built-in billing portal** for subscription management
- **Automatic plan enforcement** through Clerk's feature system
- **Webhook-driven updates** for real-time billing status

## Architecture

### Data Flow

1. **User creates shop** → Clerk Organization created → Database shop record created
2. **User selects plan** → Clerk billing portal → Stripe payment processing
3. **Payment successful** → Clerk webhook → Database updated with plan info
4. **Feature access** → Clerk's `has()` method → Plan-based feature gating

### Key Components

- **Clerk Organizations**: Source of truth for billing and user management
- **Database Shop Model**: Business logic and usage tracking
- **Clerk Webhooks**: Real-time synchronization between Clerk and database
- **tRPC Billing Router**: API endpoints for billing operations

## Setup Instructions

### 1. Enable Clerk Billing

1. Go to your [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to **Billing** section
3. Enable billing for your application
4. Connect your Stripe account

### 2. Create Plans in Clerk

1. In Clerk Dashboard, go to **Plans** page
2. Select **"Plans for Organizations"** tab
3. Create the following plans:

#### Starter Plan (Free)
- **Plan ID**: `starter`
- **Price**: $0/month
- **Features**: 
  - `basic_pos`
  - `single_franchise`
  - `email_support`
  - `basic_reports`

#### Professional Plan
- **Plan ID**: `professional`
- **Price**: $49/month
- **Features**:
  - `advanced_pos`
  - `all_franchises`
  - `buylist`
  - `store_credit`
  - `advanced_analytics`
  - `api_access`
  - `priority_support`
  - `custom_branding`
  - `bulk_operations`

#### Enterprise Plan
- **Plan ID**: `enterprise`
- **Price**: $99/month
- **Features**:
  - `multi_location`
  - `white_label`
  - `custom_integrations`
  - `predictive_analytics`
  - `support_247`
  - `dedicated_manager`
  - `custom_training`
  - `advanced_security`
  - `unlimited_history`
  - `custom_dashboards`
  - `automation`
  - `customer_segmentation`

### 3. Configure Webhooks

1. In Clerk Dashboard, go to **Webhooks**
2. Add webhook endpoint: `https://your-domain.com/api/webhooks`
3. Select events:
   - `organization.created`
   - `organization.updated`
   - `organization.deleted`
   - `organizationMembership.created`
   - `organizationMembership.updated`
   - `organizationMembership.deleted`

### 4. Environment Variables

Add these to your `.env.local`:

```env
# Clerk Billing
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
SIGNING_SECRET=whsec_...

# App URL for billing portal redirects
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Implementation Details

### Database Schema

The `Shop` model includes billing fields:

```prisma
model Shop {
  id          String   @id @default(cuid())
  name        String
  clerkOrgId  String   @unique // Links to Clerk Organization
  
  // Billing fields
  planId              String?   @default("starter")
  planStatus          String?   @default("active")
  clerkSubscriptionId String?
  trialEndsAt         DateTime?
  
  // Usage tracking
  currentUsers        Int @default(0)
  currentProducts     Int @default(0)
  monthlyTransactions Int @default(0)
  
  // ... other fields
}
```

### tRPC Billing Router

```typescript
// src/server/api/routers/billing.ts
export const billingRouter = createTRPCRouter({
  // Get current billing status
  getBillingStatus: protectedProcedure.query(async ({ ctx }) => {
    const { orgId } = ctx.auth;
    const clerk = await clerkClient();
    const organization = await clerk.organizations.getOrganization({
      organizationId: orgId,
    });
    return { organization };
  }),

  // Create billing portal session
  createPortalSession: protectedProcedure.mutation(async ({ ctx }) => {
    const { orgId } = ctx.auth;
    const clerk = await clerkClient();
    const portalSession = await clerk.billing.createPortalSession({
      organizationId: orgId,
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });
    return { redirectUrl: portalSession.url };
  }),
});
```

### Webhook Handler

```typescript
// src/app/api/webhooks/route.ts
async function handleOrganizationUpdated(orgData: any) {
  const { id, name, slug, private_metadata } = orgData;
  
  await db.shop.update({
    where: { id },
    data: {
      name,
      slug,
      // Update billing from Clerk's private metadata
      planId: private_metadata?.planId || 'starter',
      planStatus: private_metadata?.planStatus || 'active',
      clerkSubscriptionId: private_metadata?.subscriptionId,
      trialEndsAt: private_metadata?.trialEndsAt ? new Date(private_metadata.trialEndsAt) : null,
    },
  });
}
```

### Feature Gating

Use Clerk's `has()` method for feature access:

```typescript
// In server-side code
const { has } = await auth();
const hasAdvancedPos = has({ feature: 'advanced_pos' });

// In React components
import { useAuth } from '@clerk/nextjs';

function MyComponent() {
  const { has } = useAuth();
  const hasAdvancedPos = has({ feature: 'advanced_pos' });
  
  if (!hasAdvancedPos) {
    return <UpgradePrompt />;
  }
  
  return <AdvancedPOSComponent />;
}
```

## User Flow

### 1. Shop Creation
1. User signs up with Clerk
2. User navigates to `/create-shop`
3. User enters shop name
4. System creates Clerk Organization and database shop record
5. User is redirected to dashboard with free starter plan

### 2. Plan Selection
1. User clicks "Manage Billing" in dashboard
2. System creates Clerk billing portal session
3. User is redirected to Clerk's billing portal
4. User selects and pays for plan
5. Stripe processes payment
6. Clerk updates organization's private metadata
7. Webhook updates database with new plan info

### 3. Feature Access
1. User tries to access feature
2. System checks if user's organization has feature
3. If yes: feature is accessible
4. If no: upgrade prompt is shown

## Billing Page

The billing page (`/dashboard/billing`) provides:

- **Current plan status** with usage information
- **Available plans** with feature comparison
- **Billing portal access** for subscription management
- **Real-time plan updates** via webhooks

## Error Handling

### Common Issues

1. **Billing portal not configured**
   - Ensure Clerk billing is enabled
   - Check Stripe connection
   - Verify webhook configuration

2. **Plan not updating**
   - Check webhook endpoint is accessible
   - Verify webhook secret is correct
   - Check database connection

3. **Feature access denied**
   - Verify plan has required feature
   - Check organization's private metadata
   - Ensure user is organization member

### Debugging

Use the debug endpoints:

```bash
# Check billing status
curl /api/debug-clerk

# Test webhook
curl /api/webhooks

# Verify database sync
curl /api/verify-consistency
```

## Security Considerations

1. **Webhook Verification**: All webhooks are verified using Clerk's signing secret
2. **Feature Gating**: Server-side validation prevents unauthorized access
3. **Plan Enforcement**: Database and Clerk are kept in sync via webhooks
4. **Payment Security**: Stripe handles all payment processing

## Monitoring

### Key Metrics to Track

1. **Plan Distribution**: How many users on each plan
2. **Upgrade Conversion**: Free to paid conversion rate
3. **Feature Usage**: Which features are most used
4. **Billing Issues**: Failed payments, past due accounts

### Logging

The system logs:
- Webhook events and processing
- Billing portal session creation
- Plan changes and updates
- Feature access attempts

## Future Enhancements

1. **Usage-based Billing**: Track actual usage and bill accordingly
2. **Custom Plans**: Allow custom plan creation for enterprise customers
3. **Trial Management**: Automated trial period handling
4. **Dunning Management**: Automated payment failure handling
5. **Analytics Dashboard**: Detailed billing and usage analytics

## Support

For issues with Clerk billing integration:

1. Check [Clerk Billing Documentation](https://clerk.com/docs/billing/b2b-saas)
2. Verify Stripe account configuration
3. Test webhook endpoints
4. Review server logs for errors
5. Contact Clerk support if needed

## Migration from Custom Billing

If migrating from a custom billing system:

1. **Export existing subscriptions** from current system
2. **Create corresponding plans** in Clerk
3. **Migrate users** to Clerk organizations
4. **Update webhook handlers** to handle new format
5. **Test thoroughly** before going live
6. **Monitor closely** during transition period

---

This implementation provides a robust, scalable billing solution that leverages Clerk's proven infrastructure while maintaining full control over business logic and user experience. 