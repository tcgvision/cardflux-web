// app/create-shop/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Label } from "~/components/ui/label";

export default function CreateShopPage() {
  const router = useRouter();
  const { createOrganization } = useClerk();
  const [formData, setFormData] = useState({
    shopName: "",
    description: "",
    location: "",
    shopType: "local" as "local" | "online" | "both",
  });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsCreating(true);
    setError("");

    try {
      await createOrganization({
        name: formData.shopName,
        slug: formData.shopName.toLowerCase().replace(/\s+/g, '-'),
      });
      
      router.push("/");
    } catch (err) {
      console.error("Error creating shop:", err);
      setError("Failed to create shop. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, shopType: value as "local" | "online" | "both" }));
  };

  return (
    <div className="container flex h-[calc(100vh-4rem)] items-center justify-center py-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Your TCG Shop</CardTitle>
          <CardDescription>
            Set up your trading card game shop to start managing inventory and sales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shopName">Shop Name *</Label>
              <Input
                id="shopName"
                name="shopName"
                value={formData.shopName}
                onChange={handleInputChange}
                placeholder="e.g., Dragon's Den Cards"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Brief description of your shop and specialties"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., Los Angeles, CA"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shopType">Shop Type *</Label>
              <Select
                value={formData.shopType}
                onValueChange={handleSelectChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select shop type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Local Store Only</SelectItem>
                  <SelectItem value="online">Online Only</SelectItem>
                  <SelectItem value="both">Both Local & Online</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="text-sm text-red-500 text-center">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isCreating || !formData.shopName.trim()}
            >
              {isCreating ? "Creating Shop..." : "Create Shop"}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              By creating a shop, you agree to our terms of service and privacy policy
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}