"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSignIn, useUser } from "@clerk/nextjs";
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
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";

/**
 * SignInPage Component
 * 
 * A custom sign-in page using Clerk Elements with shadcn/ui styling.
 * Handles user authentication with email and password.
 * 
 * Features:
 * - Email and password validation
 * - Loading states
 * - Error handling
 * - Automatic redirect if already signed in
 * - Responsive design
 */

// Form validation schema
const signInSchema = z.object({
  emailAddress: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type SignInFormData = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      emailAddress: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    if (!isLoaded) return;

    setIsLoading(true);
    try {
      const result = await signIn.create({
        identifier: data.emailAddress,
        password: data.password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        
        // Check if user has an organization, if not redirect to create-shop
        // The middleware will handle this, but we can also check here for better UX
        router.push("/dashboard");
      } else {
        console.log(JSON.stringify(result, null, 2));
      }
    } catch (err: unknown) {
      console.error("Error:", err);
      const error = err as { errors?: Array<{ message: string }> };
      toast.error(error.errors?.[0]?.message ?? "Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-7rem)] flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md border-border shadow-lg">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-semibold text-foreground">Welcome back</CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign in to your CardFlux account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="emailAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="john@example.com"
                        type="email"
                        {...field}
                        disabled={isLoading}
                        className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </FormControl>
                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Enter your password"
                          type={showPassword ? "text" : "password"}
                          {...field}
                          disabled={isLoading}
                          className="bg-background border-border text-foreground placeholder:text-muted-foreground pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer disabled:cursor-not-allowed" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </>
                )}
              </Button>
            </form>
          </Form>

          <div className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/auth/sign-up" className="text-primary hover:text-primary/90 font-medium">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 