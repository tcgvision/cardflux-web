"use client";

import { useState } from "react";
import { useOrganization } from "@clerk/nextjs";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { 
  Loader2, 
  CreditCard, 
  Crown,
  CheckCircle,
  Shield,
  Users,
  Database,
  BarChart3,
  Zap,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { PLANS } from "~/lib/billing-types";

export default function BillingPage() {
  const { organization, isLoaded } = useOrganization();
  const [isLoading, setIsLoading] = useState(false);

  // Get billing status
  const { data: billingStatus, isLoading: isLoadingBilling } = api.billing.getBillingStatus.useQuery(
    undefined,
    {
      enabled: !!organization,
    }
  );

  // Create billing portal session
  const createPortalSession = api.billing.createPortalSession.useMutation({
    onSuccess: (data: any) => {
      if (data?.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
    },
    onError: (error) => {
      toast.error("Error", {
        description: error.message || "Failed to open billing portal",
      });
    },
  });

  const handleManageBilling = async () => {
    setIsLoading(true);
    try {
      await createPortalSession.mutateAsync();
    } catch (error) {
      console.error("Error opening billing portal:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            You need to be a member of an organization to access billing information.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const currentPlan = billingStatus?.organization?.privateMetadata?.planId || 'starter';
  const planData = PLANS[currentPlan as keyof typeof PLANS] || PLANS.starter;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Billing & Plans</h1>
          <p className="text-muted-foreground">
            Manage your subscription and billing information
          </p>
        </div>
        <Button 
          onClick={handleManageBilling}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ExternalLink className="h-4 w-4" />
          )}
          Manage Billing
        </Button>
      </div>

      {/* Current Plan Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Current Plan
          </CardTitle>
          <CardDescription>
            Your current subscription and billing status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">{planData.name} Plan</h3>
              <p className="text-muted-foreground">
                {planData.price === 0 ? 'Free' : `$${planData.price}/month`}
              </p>
            </div>
            <Badge variant={currentPlan === 'starter' ? 'secondary' : 'default'}>
              {currentPlan === 'starter' ? 'Free' : 'Active'}
            </Badge>
          </div>

          {isLoadingBilling ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading billing details...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium">Organization</p>
                <p className="text-muted-foreground">{organization.name}</p>
              </div>
              <div>
                <p className="font-medium">Plan Status</p>
                <p className="text-muted-foreground">
                  {(billingStatus as any)?.organization?.privateMetadata?.planStatus || 'Active'}
                </p>
              </div>
              <div>
                <p className="font-medium">Next Billing</p>
                <p className="text-muted-foreground">
                  {currentPlan === 'starter' ? 'N/A' : 'Monthly'}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(PLANS).map(([planId, plan]) => (
            <Card 
              key={planId}
              className={`relative ${
                currentPlan === planId 
                  ? 'border-primary shadow-lg ring-2 ring-primary/20' 
                  : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    <Crown className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {plan.name}
                  {currentPlan === planId && (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  )}
                </CardTitle>
                <div className="text-3xl font-bold">
                  {plan.price === 0 ? 'Free' : `$${plan.price}`}
                  {plan.price > 0 && <span className="text-sm font-normal text-muted-foreground">/month</span>}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {Object.entries(plan.features).map(([key, value]) => {
                    if (typeof value === 'boolean' && value) {
                      return (
                        <li key={key} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                        </li>
                      );
                    }
                    if (typeof value === 'number') {
                      const label = key === 'teamMembers' ? 'Team Members' :
                                   key === 'products' ? 'Products' :
                                   key === 'customers' ? 'Customers' : key;
                      const displayValue = value === -1 ? 'Unlimited' : value.toLocaleString();
                      return (
                        <li key={key} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Up to {displayValue} {label}</span>
                        </li>
                      );
                    }
                    return null;
                  })}
                </ul>

                {currentPlan === planId ? (
                  <Button disabled className="w-full">
                    Current Plan
                  </Button>
                ) : (
                  <Button 
                    onClick={handleManageBilling}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CreditCard className="mr-2 h-4 w-4" />
                    )}
                    {plan.price === 0 ? 'Downgrade' : 'Upgrade'}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Billing Information */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Information</CardTitle>
          <CardDescription>
            Manage your payment methods and billing preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            All billing is handled securely through Clerk and Stripe. You can manage your subscription, 
            update payment methods, and view billing history through the billing portal.
          </p>
          <Button 
            onClick={handleManageBilling}
            disabled={isLoading}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ExternalLink className="h-4 w-4" />
            )}
            Open Billing Portal
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 