"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSignUp, useUser, useOrganization } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Link from "next/link";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Mail, UserPlus, CheckCircle } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "~/components/ui/input-otp";

// Form validation schema
const signUpSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  emailAddress: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { user } = useUser();
  const { organization } = useOrganization();
  const router = useRouter();

  // Form state
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Verification state
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      emailAddress: "",
      password: "",
    },
  });

  // Handle user already authenticated - redirect them
  useEffect(() => {
    if (user) {
      console.log("✅ User already authenticated, checking organization...");
          if (organization) {
        console.log("✅ User has organization, redirecting to dashboard");
            router.push("/dashboard");
          } else {
        console.log("✅ User authenticated but no organization, redirecting to create-shop");
        router.push("/create-shop");
      }
    }
  }, [user, organization, router]);

  // Email/password sign-up handler using useSignUp (this is the correct approach)
  const onSubmit = async (data: SignUpFormData) => {
    if (!isLoaded || !signUp) return;

    setIsLoading(true);
    try {
      await signUp.create({
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        emailAddress: data.emailAddress,
        password: data.password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
      toast.success("Verification email sent! Please check your inbox.");
    } catch (err: unknown) {
      console.error("Sign up error:", err);
      const error = err as { errors?: Array<{ message: string }> };
      toast.error(error.errors?.[0]?.message ?? "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Email verification handler (unchanged)
  const onPressVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signUp || !verificationCode || verificationCode.length !== 6 || isLoading) return;

    setIsLoading(true);
    
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
          code: verificationCode,
        });

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        await syncUserToDatabase();
        
        toast.success("Email verified successfully!");
        
        // Check shop membership and redirect appropriately
        setTimeout(() => {
          void (async () => {
            try {
              const membershipResponse = await fetch('/api/check-shop-membership');
              const membershipData = await membershipResponse.json() as { hasShop: boolean };
              
              if (membershipData.hasShop) {
                router.push("/dashboard");
              } else {
                router.push("/create-shop");
              }
            } catch (error) {
              console.error("Error checking shop membership:", error);
              router.push("/create-shop");
            }
          })();
        }, 1000);
      } else {
        toast.error("Verification incomplete. Please try again.");
      }
    } catch (err: unknown) {
      console.error("Verification error:", err);
      const error = err as { errors?: Array<{ message: string }> };
      toast.error(error.errors?.[0]?.message ?? "Invalid verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Sync user to database function (unchanged)
  const syncUserToDatabase = async () => {
    if (!user) return;
    
    try {
      console.log("🔄 Syncing user to database...");
      const response = await fetch("/api/sync-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.emailAddresses[0]?.emailAddress,
          name: `${user.firstName} ${user.lastName}`.trim(),
        }),
      });
      
      if (response.ok) {
        console.log("✅ User synced to database successfully");
      } else {
        console.error("❌ Failed to sync user to database");
      }
    } catch (error) {
      console.error("❌ Error syncing user to database:", error);
    }
  };
    
  // Helper functions (unchanged)
  const handleResendCode = async () => {
    if (!isLoaded || !signUp) return;
    
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      toast.success("New verification code sent!");
    } catch (err: unknown) {
      console.error("Error resending code:", err);
      toast.error("Failed to resend verification code. Please try again.");
    }
  };

  const handleStartOver = () => {
    setPendingVerification(false);
    setVerificationCode("");
    form.reset();
    toast.info("Starting over with a fresh sign-up form");
  };

  // Rest of your render logic remains the same...
  // (Don't render if user authenticated, verification state, main form)

  // Don't render anything if user is already authenticated
  if (user) {
    return (
      <div className="min-h-[calc(100vh-7rem)] flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>You&apos;re already signed in. Redirecting...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render: Email verification state (unchanged)
  if (pendingVerification) {
    return (
      <div className="min-h-[calc(100vh-7rem)] flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md border-border shadow-lg">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-semibold text-foreground">
              Verify your email
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              We&apos;ve sent a 6-digit verification code to your email address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={onPressVerify} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Enter verification code
                  </label>
                  <InputOTP
                    value={verificationCode}
                    onChange={setVerificationCode}
                    maxLength={6}
                    disabled={isLoading}
                    containerClassName="justify-center"
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                
                <div className="text-center space-y-2">
                  <Button
                    type="button"
                    variant="link"
                    onClick={handleResendCode}
                    disabled={isLoading}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Didn&apos;t receive the code? Resend
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleStartOver}
                    disabled={isLoading}
                    className="text-sm"
                  >
                    Start Over with New Email
                  </Button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || verificationCode.length !== 6}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Verify Email
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render: Main sign-up form
  return (
    <div className="min-h-[calc(100vh-7rem)] flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md border-border shadow-lg">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-semibold text-foreground">
            Create your account
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Get started with CardFlux to manage your TCG business
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email/Password Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Your existing form fields */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="johndoe" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emailAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="john@example.com" type="email" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Create a password"
                          type={showPassword ? "text" : "password"}
                          {...field}
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !isLoaded}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create account
                  </>
                )}
              </Button>
            </form>
          </Form>

          {/* Clerk CAPTCHA element - required for bot protection */}
          <div id="clerk-captcha" className="hidden" />

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/sign-in" className="text-primary hover:text-primary/90">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 