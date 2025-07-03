import { clerkClient } from '@clerk/nextjs/server';
import { db } from '~/server/db';
import { z } from 'zod';

// Plan definitions
export const PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 19,
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

// Billing status types
export const BillingStatus = {
  ACTIVE: 'active',
  PAST_DUE: 'past_due',
  CANCELED: 'canceled',
  TRIALING: 'trialing',
  INCOMPLETE: 'incomplete',
  INCOMPLETE_EXPIRED: 'incomplete_expired',
} as const;

export type BillingStatusType = typeof BillingStatus[keyof typeof BillingStatus];

// Feature checking
export class FeatureGates {
  static async hasFeature(shopId: string, feature: string): Promise<boolean> {
    try {
      const shop = await db.shop.findUnique({
        where: { id: shopId },
        select: { planId: true, planStatus: true }
      });

      if (!shop || shop.planStatus !== BillingStatus.ACTIVE) {
        return false;
      }

      const plan = PLANS[shop.planId as PlanId];
      if (!plan) return false;

      return feature in plan.features;
    } catch (error) {
      console.error('Error checking feature:', error);
      return false;
    }
  }

  static async hasPlan(shopId: string, planId: PlanId): Promise<boolean> {
    try {
      const shop = await db.shop.findUnique({
        where: { id: shopId },
        select: { planId: true, planStatus: true }
      });

      return shop?.planId === planId && shop.planStatus === BillingStatus.ACTIVE;
    } catch (error) {
      console.error('Error checking plan:', error);
      return false;
    }
  }

  static async checkUsageLimit(shopId: string, limit: string): Promise<{ current: number; max: number; allowed: boolean }> {
    try {
      const shop = await db.shop.findUnique({
        where: { id: shopId },
        select: { 
          planId: true, 
          planStatus: true,
          currentUsers: true,
          currentProducts: true,
          monthlyTransactions: true
        }
      });

      if (!shop || shop.planStatus !== BillingStatus.ACTIVE) {
        return { current: 0, max: 0, allowed: false };
      }

      const plan = PLANS[shop.planId as PlanId];
      if (!plan) return { current: 0, max: 0, allowed: false };

      switch (limit) {
        case 'team_members':
          return {
            current: shop.currentUsers,
            max: plan.features.teamMembers,
            allowed: plan.features.teamMembers === -1 || shop.currentUsers < plan.features.teamMembers
          };
        case 'products':
          return {
            current: shop.currentProducts,
            max: plan.features.products,
            allowed: plan.features.products === -1 || shop.currentProducts < plan.features.products
          };
        case 'transactions':
          return {
            current: shop.monthlyTransactions,
            max: 1000, // Default monthly limit
            allowed: shop.monthlyTransactions < 1000
          };
        default:
          return { current: 0, max: 0, allowed: false };
      }
    } catch (error) {
      console.error('Error checking usage limit:', error);
      return { current: 0, max: 0, allowed: false };
    }
  }
}

// Usage tracking
export class UsageTracker {
  static async trackUserAdded(shopId: string): Promise<void> {
    try {
      const usage = await FeatureGates.checkUsageLimit(shopId, 'team_members');
      if (!usage.allowed) {
        throw new Error('Team member limit reached. Please upgrade your plan.');
      }

      await db.shop.update({
        where: { id: shopId },
        data: { currentUsers: { increment: 1 } }
      });
    } catch (error) {
      console.error('Error tracking user addition:', error);
      throw error;
    }
  }

  static async trackUserRemoved(shopId: string): Promise<void> {
    try {
      await db.shop.update({
        where: { id: shopId },
        data: { currentUsers: { decrement: 1 } }
      });
    } catch (error) {
      console.error('Error tracking user removal:', error);
      throw error;
    }
  }

  static async trackProductAdded(shopId: string): Promise<void> {
    try {
      const usage = await FeatureGates.checkUsageLimit(shopId, 'products');
      if (!usage.allowed) {
        throw new Error('Product limit reached. Please upgrade your plan.');
      }

      await db.shop.update({
        where: { id: shopId },
        data: { currentProducts: { increment: 1 } }
      });
    } catch (error) {
      console.error('Error tracking product addition:', error);
      throw error;
    }
  }

  static async trackProductRemoved(shopId: string): Promise<void> {
    try {
      await db.shop.update({
        where: { id: shopId },
        data: { currentProducts: { decrement: 1 } }
      });
    } catch (error) {
      console.error('Error tracking product removal:', error);
      throw error;
    }
  }

  static async trackTransaction(shopId: string): Promise<void> {
    try {
      const usage = await FeatureGates.checkUsageLimit(shopId, 'transactions');
      if (!usage.allowed) {
        throw new Error('Monthly transaction limit reached. Please upgrade your plan.');
      }

      await db.shop.update({
        where: { id: shopId },
        data: { monthlyTransactions: { increment: 1 } }
      });
    } catch (error) {
      console.error('Error tracking transaction:', error);
      throw error;
    }
  }

  // Reset monthly usage (should be called by a cron job)
  static async resetMonthlyUsage(): Promise<void> {
    try {
      await db.shop.updateMany({
        data: { monthlyTransactions: 0 }
      });
    } catch (error) {
      console.error('Error resetting monthly usage:', error);
      throw error;
    }
  }
}

// Billing service
export class BillingService {
  static async createSubscription(organizationId: string, planId: PlanId): Promise<any> {
    try {
      const subscription = await clerkClient.organizations.createSubscription({
        organizationId,
        planId,
        paymentMethodId: null, // Will use default payment method
      });

      // Update database
      await db.shop.update({
        where: { id: organizationId },
        data: {
          planId,
          planStatus: subscription.status,
          nextBillingDate: new Date(subscription.current_period_end * 1000),
          clerkSubscriptionId: subscription.id,
        }
      });

      // Log billing event
      await db.billingEvent.create({
        data: {
          shopId: organizationId,
          eventType: 'subscription.created',
          eventData: subscription,
        }
      });

      return subscription;
    } catch (error) {
      console.error('Failed to create subscription:', error);
      throw error;
    }
  }

  static async updateSubscription(organizationId: string, planId: PlanId): Promise<any> {
    try {
      const subscription = await clerkClient.organizations.updateSubscription({
        organizationId,
        planId,
      });

      // Update database
      await db.shop.update({
        where: { id: organizationId },
        data: {
          planId,
          planStatus: subscription.status,
          nextBillingDate: new Date(subscription.current_period_end * 1000),
        }
      });

      // Log billing event
      await db.billingEvent.create({
        data: {
          shopId: organizationId,
          eventType: 'subscription.updated',
          eventData: subscription,
        }
      });

      return subscription;
    } catch (error) {
      console.error('Failed to update subscription:', error);
      throw error;
    }
  }

  static async cancelSubscription(organizationId: string): Promise<void> {
    try {
      await clerkClient.organizations.cancelSubscription({
        organizationId,
      });

      // Update database
      await db.shop.update({
        where: { id: organizationId },
        data: {
          planId: 'starter',
          planStatus: BillingStatus.CANCELED,
        }
      });

      // Log billing event
      await db.billingEvent.create({
        data: {
          shopId: organizationId,
          eventType: 'subscription.canceled',
          eventData: { canceledAt: new Date() },
        }
      });
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      throw error;
    }
  }

  static async getSubscription(organizationId: string): Promise<any> {
    try {
      const subscription = await clerkClient.organizations.getSubscription({
        organizationId,
      });

      return subscription;
    } catch (error) {
      console.error('Failed to get subscription:', error);
      throw error;
    }
  }

  static async getBillingStatus(shopId: string): Promise<any> {
    try {
      const shop = await db.shop.findUnique({
        where: { id: shopId },
        select: {
          planId: true,
          planStatus: true,
          nextBillingDate: true,
          currentUsers: true,
          currentProducts: true,
          monthlyTransactions: true,
        }
      });

      if (!shop) {
        throw new Error('Shop not found');
      }

      const plan = PLANS[shop.planId as PlanId];
      if (!plan) {
        throw new Error('Invalid plan');
      }

      return {
        plan: shop.planId,
        status: shop.planStatus,
        nextBillingDate: shop.nextBillingDate,
        amount: plan.price,
        currency: 'USD',
        interval: 'month',
        usage: {
          users: shop.currentUsers,
          maxUsers: plan.features.teamMembers,
          products: shop.currentProducts,
          maxProducts: plan.features.products,
          transactions: shop.monthlyTransactions,
          maxTransactions: 1000, // Default monthly limit
        }
      };
    } catch (error) {
      console.error('Failed to get billing status:', error);
      throw error;
    }
  }
}

// Billing validation schemas
export const billingSchemas = {
  createSubscription: z.object({
    planId: z.enum(['starter', 'professional', 'enterprise']),
  }),
  updateSubscription: z.object({
    planId: z.enum(['starter', 'professional', 'enterprise']),
  }),
}; 