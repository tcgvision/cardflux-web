"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSignUp, useSignIn, useOrganization, useUser } from "@clerk/nextjs";
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
import { Eye, EyeOff, Loader2, Mail, CheckCircle, ArrowRight } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "~/components/ui/input-otp";

// Form validation schema
const signUpSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  username: z.string().min(3, "Username must be at least 3 characters").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  emailAddress: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const { isLoaded: signUpLoaded, signUp, setActive: setSignUpActive } = useSignUp();
  const { isLoaded: signInLoaded, signIn, setActive: setSignInActive } = useSignIn();
  const { organization } = useOrganization();
  const router = useRouter();

  // Form state
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  // Verification state
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

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

  // Check if both hooks are loaded
  const isLoaded = signUpLoaded && signInLoaded;

  // Check for OAuth completion on component mount
  useEffect(() => {
    if (!isLoaded) return;

    // Check URL parameters for OAuth completion
    const urlParams = new URLSearchParams(window.location.search);
    const hasOAuthParams = urlParams.has('__clerk_status') || 
                          urlParams.has('__clerk_db_jwt') || 
                          urlParams.has('__clerk_strategy') ||
                          (urlParams.has('code') && urlParams.has('state'));
    
    if (hasOAuthParams) {
      console.log("🔍 OAuth parameters detected in URL:", {
        __clerk_status: urlParams.get('__clerk_status'),
        __clerk_strategy: urlParams.get('__clerk_strategy'),
        hasCode: urlParams.has('code'),
        hasState: urlParams.has('state'),
      });
    }
  }, [isLoaded]);

  // Check if user is already verified on component load
  useEffect(() => {
    if (isLoaded && signUp?.status === "complete") {
      console.log("User already verified on component load");
      void handleSignUpComplete();
    }
  }, [isLoaded, signUp?.status]);

  // Handle OAuth completion for both sign-up and sign-in
  useEffect(() => {
    if (!isLoaded) return;

    console.log("🔍 Checking OAuth completion status...");
    console.log("Sign-up status:", signUp?.status);
    console.log("Sign-in status:", signIn?.status);
    console.log("Sign-up createdSessionId:", signUp?.createdSessionId);
    console.log("Sign-in createdSessionId:", signIn?.createdSessionId);

    // Handle OAuth sign-up completion
    if (signUp?.status === "complete" && signUp?.createdSessionId) {
      console.log("🔄 OAuth sign-up completed, setting session...");
      void handleOAuthSignUpCompletion();
      return;
    }

    // Handle OAuth sign-in completion
    if (signIn?.status === "complete" && signIn?.createdSessionId) {
      console.log("🔄 OAuth sign-in completed, setting session...");
      void handleOAuthSignInCompletion();
      return;
    }
  }, [isLoaded, signUp?.status, signIn?.status]);

  // Handle routing after verification
  useEffect(() => {
    if (isVerified && !isRedirecting) {
      setIsRedirecting(true);
      console.log("Routing after verification...");
      
      setTimeout(() => {
        void handlePostVerificationRouting();
      }, 2000);
    }
  }, [isVerified, isRedirecting]);

  // Simple timeout for OAuth completion
  useEffect(() => {
    if (!isLoaded) return;

    // Only set timeout if no sign-up or sign-in is in progress
    if (!signUp?.status && !signIn?.status) {
      const timeout = setTimeout(() => {
        console.log("⏰ OAuth completion timeout - redirecting to create-shop");
        router.push("/create-shop");
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [isLoaded, signUp?.status, signIn?.status, router]);

  // OAuth sign-up handler
  const signUpWithOAuth = async (strategy: "oauth_google" | "oauth_discord") => {
    if (!isLoaded) return;

    try {
      setOauthLoading(strategy);
      console.log(`🔄 Starting OAuth sign-up with ${strategy}...`);
      
      // Use the correct OAuth approach for Clerk
      await signUp.authenticateWithRedirect({
        strategy,
        redirectUrl: "/auth/sign-up",
        redirectUrlComplete: "/auth/sign-up",
        unsafeMetadata: {
          oauthProvider: strategy,
        },
      });
    } catch (err: unknown) {
      console.error("OAuth error:", err);
      setOauthLoading(null);
      const error = err as { errors?: Array<{ longMessage?: string }> };
      toast.error(error.errors?.[0]?.longMessage ?? "Failed to sign up with OAuth");
    }
  };

  // Email/password sign-up handler
  const onSubmit = async (data: SignUpFormData) => {
    if (!isLoaded) return;

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

  // Email verification handler
  const onPressVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !verificationCode || verificationCode.length !== 6 || isLoading) return;

    setIsLoading(true);
    
    try {
      // Check if already complete
      if (signUp.status === "complete") {
        await handleSignUpComplete();
        return;
      }
      
      // Attempt verification
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (completeSignUp.status === "complete") {
        await setSignUpActive({ session: completeSignUp.createdSessionId });
        await syncUserToDatabase();
        
        setIsVerified(true);
        setVerificationCode("");
        toast.success("Email verified successfully!");
      } else {
        toast.error("Verification incomplete. Please try again.");
      }
    } catch (err: unknown) {
      console.error("Verification error:", err);
      
      const error = err as { errors?: Array<{ message: string }> };
      const errorMessage = error.errors?.[0]?.message ?? "Invalid verification code. Please try again.";
      
      // Handle already verified case
      if (errorMessage.includes("already verified")) {
        await handleSignUpComplete();
        return;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper: Handle sign-up completion
  const handleSignUpComplete = async () => {
    try {
      if (signUp?.createdSessionId) {
        await setSignUpActive({ session: signUp.createdSessionId });
        await syncUserToDatabase();
        setIsVerified(true);
        toast.success("Account verified! Redirecting...");
      }
    } catch (error) {
      console.error("Error completing sign-up:", error);
      toast.error("Account verified but unable to sign in. Please try signing in instead.");
      setTimeout(() => router.push("/auth/sign-in"), 3000);
    }
  };

  // Helper: Sync user to database
  const syncUserToDatabase = async () => {
    try {
      const response = await fetch('/api/sync-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        const data = await response.json() as { message: string };
        console.log('User sync result:', data);
      }
    } catch (error) {
      console.log('User sync error:', error);
      // Don't fail the flow if sync fails - webhook might handle it
    }
  };

  // Helper: Handle post-verification routing
  const handlePostVerificationRouting = async () => {
    try {
      const membershipResponse = await fetch('/api/check-shop-membership');
      const membershipData = await membershipResponse.json() as { hasShop: boolean };
      
      if (membershipData.hasShop) {
        console.log("User linked to shop, redirecting to dashboard");
        router.push("/dashboard");
      } else {
        console.log("User not linked to shop, redirecting to create-shop");
        router.push("/create-shop");
      }
    } catch (error) {
      console.error("Error checking shop membership:", error);
      router.push("/create-shop");
    }
  };

  // Helper: Resend verification code
  const handleResendCode = async () => {
    if (!isLoaded) return;
    
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      toast.success("New verification code sent!");
    } catch (err: unknown) {
      console.error("Error resending code:", err);
      toast.error("Failed to resend verification code. Please try again.");
    }
  };

  // Helper: Start over with new email
  const handleStartOver = () => {
    setPendingVerification(false);
    setVerificationCode("");
    setIsVerified(false);
    setIsRedirecting(false);
    form.reset();
    toast.info("Starting over with a fresh sign-up form");
  };

  // Helper: Handle OAuth sign-up completion
  const handleOAuthSignUpCompletion = async () => {
    try {
      console.log("🔄 Starting OAuth sign-up completion handler...");
      console.log("Sign-up status:", signUp?.status);
      console.log("Sign-up createdSessionId:", signUp?.createdSessionId);
      
      if (signUp?.createdSessionId) {
        console.log("Setting active session...");
        await setSignUpActive({ session: signUp.createdSessionId });
        console.log("Session set successfully");
        
        console.log("Syncing user to database...");
        await syncUserToDatabase();
        console.log("User synced to database");
        
        setIsVerified(true);
        toast.success("OAuth sign-up completed! Redirecting...");
        console.log("OAuth sign-up completion successful, user verified");
      }
    } catch (error) {
      console.error("Error completing OAuth sign-up:", error);
      toast.error("OAuth sign-up completed but unable to sign in. Please try signing in instead.");
      setTimeout(() => router.push("/auth/sign-in"), 3000);
    }
  };

  // Helper: Handle OAuth sign-in completion
  const handleOAuthSignInCompletion = async () => {
    try {
      console.log("🔄 Starting OAuth sign-in completion handler...");
      console.log("Sign-in status:", signIn?.status);
      console.log("Sign-in createdSessionId:", signIn?.createdSessionId);
      
      if (signIn?.createdSessionId) {
        console.log("Setting active session...");
        await setSignInActive({ session: signIn.createdSessionId });
        console.log("Session set successfully");
        
        console.log("Syncing user to database...");
        await syncUserToDatabase();
        console.log("User synced to database");
        
        setIsVerified(true);
        toast.success("OAuth sign-in completed! Redirecting...");
        console.log("OAuth sign-in completion successful, user verified");
      }
    } catch (error) {
      console.error("Error completing OAuth sign-in:", error);
      toast.error("OAuth sign-in completed but unable to sign in. Please try signing in instead.");
      setTimeout(() => router.push("/auth/sign-in"), 3000);
    }
  };

  // Render: Verification success state
  if (isVerified) {
    return (
      <div className="min-h-[calc(100vh-7rem)] flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md border-border shadow-lg">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-semibold text-foreground">
              Email Verified!
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {organization 
                ? "Redirecting you to your organization dashboard..."
                : "Setting up your account..."
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">
                {organization ? "Joining your team..." : "Creating your workspace..."}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render: Email verification state
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
          {/* OAuth Buttons */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => signUpWithOAuth("oauth_google")}
              disabled={oauthLoading !== null}
            >
              {oauthLoading === "oauth_google" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              Continue with Google
            </Button>
            
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => signUpWithOAuth("oauth_discord")}
              disabled={oauthLoading !== null}
            >
              {oauthLoading === "oauth_discord" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0188 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9554 2.4189-2.1568 2.4189Z"/>
                </svg>
              )}
              Continue with Discord
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Create account
                  </>
                )}
              </Button>
            </form>
          </Form>

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/sign-in" className="text-primary hover:text-primary/90">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
      
      {/* Required CAPTCHA element for Clerk OAuth flows */}
      <div id="clerk-captcha" style={{ display: 'none' }}></div>
    </div>
  );
}