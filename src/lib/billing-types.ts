// Billing status types - safe for client-side import
export const BillingStatus = {
  ACTIVE: 'active',
  PAST_DUE: 'past_due',
  CANCELED: 'canceled',
  TRIALING: 'trialing',
  INCOMPLETE: 'incomplete',
  INCOMPLETE_EXPIRED: 'incomplete_expired',
} as const;

export type BillingStatusType = typeof BillingStatus[keyof typeof BillingStatus];

// Plan definitions for display
export const PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 0,
    popular: false,
    features: {
      teamMembers: 2,
      products: 500,
      customers: 100,
      basicPos: true,
      singleFranchise: true,
      emailSupport: true,
      basicReports: true,
    }
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    price: 49,
    popular: true,
    features: {
      teamMembers: 8,
      products: 5000,
      customers: -1, // unlimited
      advancedPos: true,
      allFranchises: true,
      buylist: true,
      storeCredit: true,
      advancedAnalytics: true,
      apiAccess: true,
      prioritySupport: true,
      customBranding: true,
      bulkOperations: true,
    }
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    popular: false,
    features: {
      teamMembers: -1, // unlimited
      products: -1, // unlimited
      customers: -1, // unlimited
      multiLocation: true,
      whiteLabel: true,
      customIntegrations: true,
      predictiveAnalytics: true,
      support247: true,
      dedicatedManager: true,
      customTraining: true,
      advancedSecurity: true,
      unlimitedHistory: true,
      customDashboards: true,
      automation: true,
      customerSegmentation: true,
    }
  }
} as const;

export type PlanId = keyof typeof PLANS; 