"use client";

import { useOrganization } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { CheckCircle, Store, Users, CreditCard, BarChart3 } from "lucide-react";

export default function OnboardingPage() {
  const { organization, isLoaded } = useOrganization();
  const router = useRouter();

  // Redirect to dashboard if no organization
  useEffect(() => {
    if (isLoaded && !organization) {
      router.push("/dashboard");
    }
  }, [isLoaded, organization, router]);

  if (!isLoaded) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Loading...</h1>
            <p className="text-muted-foreground">Please wait while we set up your shop.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!organization) {
    return null; // Will redirect
  }

  const steps = [
    {
      title: "Shop Created",
      description: "Your shop has been successfully created and is ready to use.",
      icon: Store,
      completed: true,
    },
    {
      title: "Add Your First Products",
      description: "Start by adding some products to your inventory.",
      icon: CreditCard,
      completed: false,
    },
    {
      title: "Invite Team Members",
      description: "Add staff members to help manage your shop.",
      icon: Users,
      completed: false,
    },
    {
      title: "View Analytics",
      description: "Monitor your shop's performance and sales data.",
      icon: BarChart3,
      completed: false,
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome to {organization.name}!
          </h1>
          <p className="text-muted-foreground">
            Your shop has been created successfully. Let&apos;s get you started.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Follow these steps to set up your shop
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {step.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <step.icon className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks to get you started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                onClick={() => router.push("/dashboard")}
                className="w-full justify-start"
                variant="outline"
              >
                <Store className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Button>
              <Button 
                className="w-full justify-start"
                variant="outline"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Add Products
              </Button>
              <Button 
                className="w-full justify-start"
                variant="outline"
              >
                <Users className="mr-2 h-4 w-4" />
                Invite Staff
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button 
          onClick={() => router.push("/dashboard")}
          size="lg"
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
} 