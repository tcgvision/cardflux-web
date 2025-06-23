"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser, useOrganization } from "@clerk/nextjs";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { CheckCircle, Camera, BarChart3, Settings, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

const onboardingSteps = [
  {
    id: "welcome",
    title: "Welcome to TCG Vision!",
    description: "Let's get your shop set up in just a few steps.",
    icon: CheckCircle,
    completed: false,
  },
  {
    id: "first-scan",
    title: "Scan Your First Card",
    description: "Try our AI-powered scanner to add cards to your inventory.",
    icon: Camera,
    completed: false,
  },
  {
    id: "dashboard",
    title: "Explore Your Dashboard",
    description: "Learn about your analytics and inventory management tools.",
    icon: BarChart3,
    completed: false,
  },
  {
    id: "complete",
    title: "You're All Set!",
    description: "Your shop is ready. Start managing your TCG business.",
    icon: Settings,
    completed: false,
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user has organization
  useEffect(() => {
    if (orgLoaded && !organization) {
      router.push("/dashboard/create-shop");
    }
  }, [orgLoaded, organization, router]);

  // Skip onboarding if already completed
  useEffect(() => {
    // TODO: Check if user has completed onboarding
    // For now, we'll just redirect to dashboard after a delay
    const timer = setTimeout(() => {
      if (orgLoaded && organization) {
        router.push("/dashboard");
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [orgLoaded, organization, router]);

  const handleNextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      setIsLoading(true);
      // TODO: Mark onboarding as completed in database
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    }
  };

  const handleSkipOnboarding = () => {
    setIsLoading(true);
    // TODO: Mark onboarding as completed in database
    setTimeout(() => {
      router.push("/dashboard");
    }, 500);
  };

  if (!orgLoaded) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-7rem)] items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!organization) {
    return null; // Will redirect to create-shop
  }

  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;
  const currentStepData = onboardingSteps[currentStep];

  if (!currentStepData) {
    return null;
  }

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-7rem)] items-center justify-center px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <currentStepData.icon className="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-semibold text-foreground">
              {currentStepData.title}
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              {currentStepData.description}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-primary transition-all duration-300 ease-in-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          <div className="min-h-[200px] flex items-center justify-center">
            {currentStep === 0 && (
              <div className="text-center space-y-4">
                <h3 className="text-lg font-medium">Welcome, {user?.firstName}!</h3>
                <p className="text-muted-foreground max-w-md">
                  Your shop &quot;{organization.name}&quot; has been created successfully. 
                  Let&apos;s walk through the key features to get you started.
                </p>
              </div>
            )}
            
            {currentStep === 1 && (
              <div className="text-center space-y-4">
                <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                  <Camera className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-lg font-medium">AI-Powered Card Scanning</h3>
                <p className="text-muted-foreground max-w-md">
                  Use your camera to instantly identify cards and add them to your inventory. 
                  Our AI recognizes thousands of cards across multiple TCGs.
                </p>
                <Button variant="outline" className="mt-4">
                  Try Scanner Demo
                </Button>
              </div>
            )}
            
            {currentStep === 2 && (
              <div className="text-center space-y-4">
                <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                  <BarChart3 className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-lg font-medium">Powerful Analytics</h3>
                <p className="text-muted-foreground max-w-md">
                  Track your inventory value, sales performance, and market trends. 
                  Make data-driven decisions to grow your business.
                </p>
              </div>
            )}
            
            {currentStep === 3 && (
              <div className="text-center space-y-4">
                <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-lg font-medium">You&apos;re Ready!</h3>
                <p className="text-muted-foreground max-w-md">
                  Your shop is fully set up and ready to use. 
                  Start scanning cards, managing inventory, and growing your TCG business.
                </p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={handleSkipOnboarding}
              disabled={isLoading}
              className="text-muted-foreground hover:text-foreground"
            >
              Skip Onboarding
            </Button>
            
            <Button
              onClick={handleNextStep}
              disabled={isLoading}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {currentStep === onboardingSteps.length - 1 ? "Completing..." : "Loading..."}
                </>
              ) : (
                <>
                  {currentStep === onboardingSteps.length - 1 ? "Get Started" : "Next Step"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 