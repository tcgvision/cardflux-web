"use client";

import { useState } from "react";
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
import { Combobox } from "~/components/ui/combobox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, "Shop name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.object({
    value: z.string().min(1, "Location is required"),
    label: z.string().min(1, "Location is required"),
  }),
  type: z.enum(["local", "online", "both"]),
});

type FormData = z.infer<typeof formSchema>;

// Mock locations for now - replace with Google Places API
const locations = [
  { value: "new-york", label: "New York, NY" },
  { value: "los-angeles", label: "Los Angeles, CA" },
  { value: "chicago", label: "Chicago, IL" },
  { value: "houston", label: "Houston, TX" },
  { value: "phoenix", label: "Phoenix, AZ" },
];

export default function CreateShopPage() {
  const router = useRouter();
  const { user } = useUser();
  const { createOrganization } = useClerk();
  const { organization } = useOrganization();
  const [activeTab, setActiveTab] = useState<"create" | "join">("create");

  // Form setup
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      location: { value: "", label: "" },
      type: "local",
    },
  });

  // Create shop mutation
  const createShopMutation = api.shop.create.useMutation({
    onSuccess: () => {
      toast.success("Success!", {
        description: "Your shop has been created successfully.",
      });
      router.push("/dashboard");
    },
    onError: (error) => {
      toast.error("Error", {
        description: error.message || "Failed to create shop. Please try again.",
      });
    },
  });

  // Form submission handler
  const onSubmit = async (data: FormData) => {
    try {
      // Create organization in Clerk
      const org = await createOrganization({
        name: data.name,
        slug: data.name.toLowerCase().replace(/\s+/g, "-"),
      });

      if (!org) {
        throw new Error("Failed to create organization");
      }

      // Create shop in database
      await createShopMutation.mutateAsync({
        name: data.name,
        description: data.description,
        location: data.location.label,
        type: data.type,
        clerkOrgId: org.id,
      });
    } catch (error) {
      console.error("Error creating shop:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create shop. Please try again.";
      toast.error("Error", {
        description: errorMessage,
      });
    }
  };

  // If user already has an organization, redirect to dashboard
  if (organization) {
    router.push("/dashboard");
    return null;
  }

  return (
    <div className="container mx-auto flex h-[calc(100vh-4rem)] items-center justify-center px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Set Up Your Shop</CardTitle>
          <CardDescription>
            Create a new shop or join an existing one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "create" | "join")} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Create Shop</TabsTrigger>
              <TabsTrigger value="join">Join Shop</TabsTrigger>
            </TabsList>
            <TabsContent value="create">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shop Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your shop name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input placeholder="Describe your shop" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Combobox
                            options={locations}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Select a location"
                            emptyText="No locations found."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shop Type</FormLabel>
                        <FormControl>
                          <select
                            className="w-full rounded-md border border-input bg-background px-3 py-2"
                            {...field}
                          >
                            <option value="local">Local Store</option>
                            <option value="online">Online Store</option>
                            <option value="both">Both Local & Online</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={createShopMutation.isPending}
                  >
                    {createShopMutation.isPending ? "Creating..." : "Create Shop"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
            <TabsContent value="join">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  To join an existing shop, you need an invitation from the shop owner.
                  Please check your email for an invitation link or contact the shop owner.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    // TODO: Implement invitation flow
                    toast.info("Coming soon!", {
                      description: "Shop invitation system will be available soon.",
                    });
                  }}
                >
                  Enter Invitation Code
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 