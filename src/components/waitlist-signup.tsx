"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Checkbox } from "~/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { 
  Mail, 
  Store, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Gift,
  Users,
  Calendar
} from "lucide-react";

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (command: string, action: string, params: Record<string, unknown>) => void;
  }
}

// Form validation schema
const waitlistSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  storeName: z.string().min(1, "Store name is required"),
  storeType: z.enum(["TCG", "Comic", "Figure", "General", "Other"]),
  expectedLaunch: z.enum(["Q1 2024", "Q2 2024", "Q3 2024", "Q4 2024", "2025+"]),
  emailUpdates: z.boolean(),
  progressUpdates: z.boolean(),
  launchNotifications: z.boolean(),
});

type WaitlistFormData = z.infer<typeof waitlistSchema>;

interface WaitlistSignupProps {
  source?: string;
  referrer?: string;
  variant?: "default" | "compact" | "hero";
  className?: string;
}

export function WaitlistSignup({ 
  source = "landing_page", 
  referrer, 
  variant = "default",
  className = "" 
}: WaitlistSignupProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<WaitlistFormData>({
    resolver: zodResolver(waitlistSchema),
  });

  const onSubmit = async (data: WaitlistFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          source,
          referrer,
        }),
      });

      const result = await response.json() as { success: boolean; message?: string };

      if (result.success) {
        setIsSuccess(true);
        // Track conversion
        if (typeof window !== "undefined" && window.gtag) {
          window.gtag("event", "waitlist_signup", {
            event_category: "engagement",
            event_label: source,
          });
        }
      } else {
        setError(result.message ?? "Something went wrong. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`text-center ${className}`}
      >
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
          <CardContent className="pt-6">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-green-900 dark:text-green-100">
              Welcome to the CardFlux Waitlist!
            </h3>
            <p className="mb-4 text-sm text-green-700 dark:text-green-300">
              You&apos;re all set! We&apos;ll send you updates about our progress and notify you 
              when CardFlux launches with your exclusive 10% discount code.
            </p>
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <Gift className="mr-1 h-3 w-3" />
              10% Launch Discount Secured
            </Badge>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="text-center">
          <h3 className="text-lg font-semibold">Join the Waitlist</h3>
          <p className="text-sm text-muted-foreground">
            Get early access and 10% off when we launch
          </p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="flex gap-2">
            <Input
              {...register("email")}
              type="email"
              placeholder="Enter your email"
              className="flex-1"
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Join"
              )}
            </Button>
          </div>
          
          {errors.email && (
            <p className="text-xs text-red-600 dark:text-red-400">
              {errors.email.message}
            </p>
          )}
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </form>
      </div>
    );
  }

  if (variant === "hero") {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            <Gift className="mr-1 h-3 w-3" />
            Early Access + 10% Discount
          </Badge>
          <h3 className="text-2xl font-bold mb-2">Be First to Experience CardFlux</h3>
          <p className="text-muted-foreground">
            Join our waitlist and get exclusive early access with a 10% launch discount
          </p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                {...register("firstName")}
                id="firstName"
                placeholder="John"
              />
              {errors.firstName && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                {...register("lastName")}
                id="lastName"
                placeholder="Doe"
              />
              {errors.lastName && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>
          
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              {...register("email")}
              id="email"
              type="email"
              placeholder="john@yourstore.com"
            />
            {errors.email && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="storeName">Store Name</Label>
            <Input
              {...register("storeName")}
              id="storeName"
              placeholder="Your Collectible Store"
            />
            {errors.storeName && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                {errors.storeName.message}
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="storeType">Store Type</Label>
              <Select onValueChange={(value: "TCG" | "Comic" | "Figure" | "General" | "Other") => setValue("storeType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select store type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TCG">Trading Card Games</SelectItem>
                  <SelectItem value="Comic">Comics & Books</SelectItem>
                  <SelectItem value="Figure">Figures & Statues</SelectItem>
                  <SelectItem value="General">General Collectibles</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.storeType && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {errors.storeType.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="expectedLaunch">Expected Launch</Label>
              <Select onValueChange={(value: "Q1 2024" | "Q2 2024" | "Q3 2024" | "Q4 2024" | "2025+") => setValue("expectedLaunch", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="When do you plan to launch?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Q1 2024">Q1 2024</SelectItem>
                  <SelectItem value="Q2 2024">Q2 2024</SelectItem>
                  <SelectItem value="Q3 2024">Q3 2024</SelectItem>
                  <SelectItem value="Q4 2024">Q4 2024</SelectItem>
                  <SelectItem value="2025+">2025 or later</SelectItem>
                </SelectContent>
              </Select>
              {errors.expectedLaunch && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {errors.expectedLaunch.message}
                </p>
              )}
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Joining Waitlist...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Join the Waitlist
              </>
            )}
          </Button>
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </form>
      </div>
    );
  }

  // Default variant
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Join the CardFlux Waitlist
        </CardTitle>
        <CardDescription>
          Be among the first to experience the ultimate collectible store management platform. 
          Get early access and a 10% launch discount.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                {...register("firstName")}
                id="firstName"
                placeholder="John"
              />
              {errors.firstName && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                {...register("lastName")}
                id="lastName"
                placeholder="Doe"
              />
              {errors.lastName && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>
          
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              {...register("email")}
              id="email"
              type="email"
              placeholder="john@yourstore.com"
            />
            {errors.email && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="storeName">Store Name</Label>
            <Input
              {...register("storeName")}
              id="storeName"
              placeholder="Your Collectible Store"
            />
            {errors.storeName && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                {errors.storeName.message}
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="storeType">Store Type</Label>
              <Select onValueChange={(value: "TCG" | "Comic" | "Figure" | "General" | "Other") => setValue("storeType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select store type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TCG">Trading Card Games</SelectItem>
                  <SelectItem value="Comic">Comics & Books</SelectItem>
                  <SelectItem value="Figure">Figures & Statues</SelectItem>
                  <SelectItem value="General">General Collectibles</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.storeType && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {errors.storeType.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="expectedLaunch">Expected Launch</Label>
              <Select onValueChange={(value: "Q1 2024" | "Q2 2024" | "Q3 2024" | "Q4 2024" | "2025+") => setValue("expectedLaunch", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="When do you plan to launch?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Q1 2024">Q1 2024</SelectItem>
                  <SelectItem value="Q2 2024">Q2 2024</SelectItem>
                  <SelectItem value="Q3 2024">Q3 2024</SelectItem>
                  <SelectItem value="Q4 2024">Q4 2024</SelectItem>
                  <SelectItem value="2025+">2025 or later</SelectItem>
                </SelectContent>
              </Select>
              {errors.expectedLaunch && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {errors.expectedLaunch.message}
                </p>
              )}
            </div>
          </div>
          
          <div className="space-y-3">
            <Label className="text-sm font-medium">Communication Preferences</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  {...register("emailUpdates")}
                  id="emailUpdates"
                />
                <Label htmlFor="emailUpdates" className="text-sm">
                  Product updates and announcements
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  {...register("progressUpdates")}
                  id="progressUpdates"
                />
                <Label htmlFor="progressUpdates" className="text-sm">
                  Development progress and behind-the-scenes
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  {...register("launchNotifications")}
                  id="launchNotifications"
                />
                <Label htmlFor="launchNotifications" className="text-sm">
                  Launch notifications and discount codes
                </Label>
              </div>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Joining Waitlist...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Join the Waitlist
              </>
            )}
          </Button>
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
    </Card>
  );
} 