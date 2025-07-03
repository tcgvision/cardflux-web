"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Checkbox } from "~/components/ui/checkbox";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { 
  Mail, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Gift,
  X,
  Store,
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

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  source?: string;
  referrer?: string;
}

export function WaitlistModal({ 
  isOpen, 
  onClose, 
  source = "landing_page", 
  referrer 
}: WaitlistModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<WaitlistFormData>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: {
      emailUpdates: true,
      progressUpdates: true,
      launchNotifications: true,
    },
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

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      // Reset form after a short delay to allow animation to complete
      setTimeout(() => {
        setIsSuccess(false);
        setError(null);
        reset();
      }, 200);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md mx-4 bg-background rounded-lg shadow-xl border"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted transition-colors disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>

            {isSuccess ? (
              <div className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">
                  Welcome to the CardFlux Waitlist!
                </h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  You&apos;re all set! We&apos;ll send you updates about our progress and notify you 
                  when CardFlux launches with your exclusive 10% discount code.
                </p>
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  <Gift className="mr-1 h-3 w-3" />
                  10% Launch Discount Secured
                </Badge>
                <Button onClick={handleClose} className="mt-4 w-full">
                  Close
                </Button>
              </div>
            ) : (
              <div className="p-6">
                <div className="text-center mb-6">
                  <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">
                    <Gift className="mr-1 h-3 w-3" />
                    Early Access + 10% Discount
                  </Badge>
                  <h2 className="text-xl font-bold mb-2">Join the CardFlux Waitlist</h2>
                  <p className="text-sm text-muted-foreground">
                    Be among the first to experience the ultimate collectible store management platform
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="firstName" className="text-sm">First Name</Label>
                      <Input
                        {...register("firstName")}
                        id="firstName"
                        placeholder="John"
                        className="mt-1"
                      />
                      {errors.firstName && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          {errors.firstName.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-sm">Last Name</Label>
                      <Input
                        {...register("lastName")}
                        id="lastName"
                        placeholder="Doe"
                        className="mt-1"
                      />
                      {errors.lastName && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          {errors.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email" className="text-sm">Email Address</Label>
                    <Input
                      {...register("email")}
                      id="email"
                      type="email"
                      placeholder="john@yourstore.com"
                      className="mt-1"
                    />
                    {errors.email && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="storeName" className="text-sm">Store Name</Label>
                    <Input
                      {...register("storeName")}
                      id="storeName"
                      placeholder="Your Collectible Store"
                      className="mt-1"
                    />
                    {errors.storeName && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        {errors.storeName.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="storeType" className="text-sm">Store Type</Label>
                      <Select onValueChange={(value: "TCG" | "Comic" | "Figure" | "General" | "Other") => setValue("storeType", value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TCG">Trading Cards</SelectItem>
                          <SelectItem value="Comic">Comics</SelectItem>
                          <SelectItem value="Figure">Figures</SelectItem>
                          <SelectItem value="General">General</SelectItem>
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
                      <Label htmlFor="expectedLaunch" className="text-sm">Launch Timeline</Label>
                      <Select onValueChange={(value: "Q1 2024" | "Q2 2024" | "Q3 2024" | "Q4 2024" | "2025+") => setValue("expectedLaunch", value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="When?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Q1 2024">Q1 2024</SelectItem>
                          <SelectItem value="Q2 2024">Q2 2024</SelectItem>
                          <SelectItem value="Q3 2024">Q3 2024</SelectItem>
                          <SelectItem value="Q4 2024">Q4 2024</SelectItem>
                          <SelectItem value="2025+">2025+</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.expectedLaunch && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          {errors.expectedLaunch.message}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Updates</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          {...register("emailUpdates")}
                          id="emailUpdates"
                        />
                        <Label htmlFor="emailUpdates" className="text-xs">
                          Product updates
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          {...register("progressUpdates")}
                          id="progressUpdates"
                        />
                        <Label htmlFor="progressUpdates" className="text-xs">
                          Development progress
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          {...register("launchNotifications")}
                          id="launchNotifications"
                        />
                        <Label htmlFor="launchNotifications" className="text-xs">
                          Launch notifications
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
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
} 