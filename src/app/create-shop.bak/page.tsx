"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useClerk, useUser, useOrganization } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { 
  Loader2, 
  Store, 
  CheckCircle, 
  Crown,
  ArrowRight,
  CreditCard,
  Shield,
  Users,
  Database,
  BarChart3,
  Zap
} from "lucide-react";

// Form validation schema for shop name
const shopNameSchema = z.object({
  name: z.string().min(2, "Shop name must be at least 2 characters"),
});

type ShopNameData = z.infer<typeof shopNameSchema>;

export default function CreateShopPage() {
  const router = useRouter();
  const { user } = useUser();
  const { createOrganization, setActive } = useClerk();
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle organization changes - redirect to dashboard when organization is available
  useEffect(() => {
    if (orgLoaded && organization && !isRedirecting) {
      setIsRedirecting(true);
      // Use setTimeout to avoid setState during render
      setTimeout(() => {
        router.push("/dashboard");
      }, 0);
    }
  }, [orgLoaded, organization, router, isRedirecting]);

  // Shop name form setup
  const shopNameForm = useForm<ShopNameData>({
    resolver: zodResolver(shopNameSchema),
    defaultValues: {
      name: "",
    },
  });

  // Create shop mutation
  const createShopMutation = api.shop.create.useMutation({
    onSuccess: () => {
      toast.success("Success!", {
        description: "Your shop has been created successfully.",
      });
    },
    onError: (error) => {
      toast.error("Error", {
        description: error.message || "Failed to create shop. Please try again.",
      });
    },
  });

  // Handle shop creation
  const onShopNameSubmit = async (data: ShopNameData) => {
    if (!user) {
      toast.error("Error", {
        description: "You must be signed in to create a shop.",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Create the Clerk organization first
      const org = await createOrganization({
        name: data.name,
      });

      if (org) {
        // Set the organization as active
        await setActive({ organization: org });
        
        // Create the shop in our database
        await createShopMutation.mutateAsync({
          name: data.name,
          type: "local",
          slug: data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        });

        toast.success("Shop created successfully!", {
          description: "You can now select a plan to unlock all features.",
        });

        // Redirect to dashboard where they can access billing
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error creating shop:", error);
      toast.error("Error", {
        description: "Failed to create shop. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Show loading while organization context is loading
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

  // Show redirecting state if user already has an organization
  if (orgLoaded && organization) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-7rem)] items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-7rem)] items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Store className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h1 className="text-3xl font-bold">Create Your Shop</h1>
          <p className="text-muted-foreground mt-2">
            Get started with CardFlux in just a few steps
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Step 1: Name Your Shop</CardTitle>
            <CardDescription>
              Let's start by giving your shop a name. You can always change this later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...shopNameForm}>
              <form onSubmit={shopNameForm.handleSubmit(onShopNameSubmit)} className="space-y-4">
                <FormField
                  control={shopNameForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shop Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your shop name..."
                          {...field}
                          disabled={isProcessing}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Shop...
                    </>
                  ) : (
                    <>
                      Create Shop
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Your shop will be created with a free starter plan. You can upgrade to unlock additional features later.
          </AlertDescription>
        </Alert>

        <div className="text-center text-sm text-muted-foreground">
          <p>By creating a shop, you agree to our Terms of Service and Privacy Policy.</p>
        </div>
      </div>
    </div>
  );
} 