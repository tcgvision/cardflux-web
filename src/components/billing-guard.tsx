"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useOrganization } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { 
  AlertTriangle, 
  CreditCard, 
  Shield, 
  CheckCircle, 
  Clock,
  XCircle,
  Crown
} from "lucide-react";
import { api } from "~/trpc/react";
import { BillingStatus } from "~/lib/billing-types";

interface BillingGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function BillingGuard({ children, fallback }: BillingGuardProps) {
  const { organization } = useOrganization();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isChecking, setIsChecking] = useState(true);
  const [billingError, setBillingError] = useState<string | null>(null);

  // Get billing status
  const { data: billingData, error: tRPCError, isLoading } = api.shop.getBillingStatus.useQuery(undefined, {
    enabled: !!organization?.id,
    refetchInterval: 30000, // Check every 30 seconds
  });

  useEffect(() => {
    if (!organization?.id) {
      setIsChecking(false);
      return;
    }

    if (isLoading) return;

    if (tRPCError) {
      console.error('Billing check error:', tRPCError);
      setBillingError('Failed to check billing status');
      setIsChecking(false);
      return;
    }

    if (!billingData) {
      setIsChecking(false);
      return;
    }

    // Check if we're already on the billing page
    if (window.location.pathname === '/dashboard/billing') {
      setIsChecking(false);
      return;
    }

    // Handle different billing statuses
    const status = billingData.status as string;
    switch (status) {
      case BillingStatus.ACTIVE:
      case BillingStatus.TRIALING:
        // Allow access
        setIsChecking(false);
        break;

      case BillingStatus.PAST_DUE:
        // Redirect to billing with warning
        router.push('/dashboard/billing?warning=payment_required');
        break;

      case BillingStatus.CANCELED:
      case BillingStatus.INCOMPLETE:
      case BillingStatus.INCOMPLETE_EXPIRED:
        // Redirect to billing with error
        router.push('/dashboard/billing?error=subscription_required');
        break;

      default:
        // Unknown status, redirect to billing
        router.push('/dashboard/billing?error=subscription_required');
        break;
    }
  }, [organization?.id, billingData, tRPCError, isLoading, router]);

  // Show loading state
  if (isChecking || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking subscription status...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (billingError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-500" />
              Billing Error
            </CardTitle>
            <CardDescription>
              Unable to verify your subscription status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {billingError}. Please contact support if this issue persists.
              </AlertDescription>
            </Alert>
            <div className="mt-4 space-y-2">
              <Button 
                onClick={() => window.location.reload()} 
                className="w-full"
              >
                Retry
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push('/dashboard/billing')}
                className="w-full"
              >
                Go to Billing
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show fallback if provided and billing is not active
  if (fallback && billingData && billingData.status !== BillingStatus.ACTIVE && billingData.status !== BillingStatus.TRIALING) {
    return <>{fallback}</>;
  }

  // Allow access if billing is active or trialing
  if (billingData && (billingData.status === BillingStatus.ACTIVE || billingData.status === BillingStatus.TRIALING)) {
    return <>{children}</>;
  }

  // Default: show billing required message
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Subscription Required
          </CardTitle>
          <CardDescription>
            Please subscribe to continue using CardFlux
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <CreditCard className="h-4 w-4" />
            <AlertDescription>
              Your subscription is required to access the dashboard. Please visit the billing page to set up your subscription.
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button 
              onClick={() => router.push('/dashboard/billing')}
              className="w-full"
            >
              Set Up Subscription
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Billing status indicator component
export function BillingStatusIndicator() {
  const { organization } = useOrganization();
  const { data: billingData } = api.shop.getBillingStatus.useQuery(undefined, {
    enabled: !!organization?.id,
    refetchInterval: 30000,
  });

  if (!billingData) return null;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case BillingStatus.ACTIVE:
        return {
          icon: CheckCircle,
          color: "text-green-500",
          bgColor: "bg-green-100",
          text: "Active"
        };
      case BillingStatus.TRIALING:
        return {
          icon: Clock,
          color: "text-blue-500",
          bgColor: "bg-blue-100",
          text: "Trial"
        };
      case BillingStatus.PAST_DUE:
        return {
          icon: AlertTriangle,
          color: "text-orange-500",
          bgColor: "bg-orange-100",
          text: "Past Due"
        };
      case BillingStatus.CANCELED:
        return {
          icon: XCircle,
          color: "text-red-500",
          bgColor: "bg-red-100",
          text: "Canceled"
        };
      default:
        return {
          icon: AlertTriangle,
          color: "text-gray-500",
          bgColor: "bg-gray-100",
          text: "Unknown"
        };
    }
  };

  const config = getStatusConfig(billingData.status);
  const Icon = config.icon;

  return (
    <Badge variant="secondary" className={`${config.bgColor} ${config.color} border-0`}>
      <Icon className="h-3 w-3 mr-1" />
      {config.text}
    </Badge>
  );
} 