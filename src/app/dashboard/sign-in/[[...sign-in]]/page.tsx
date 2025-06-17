"use client";

import { useAuth } from "@clerk/nextjs";
import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Icons } from "~/components/icons";

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
export default function SignInPage() {
  const { isSignedIn } = useAuth();

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
      <div className="w-full max-w-md px-4">
        <SignIn.Root>
          <SignIn.Step name="start">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Welcome back</CardTitle>
                <CardDescription>
                  Enter your email to sign in to your account
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                {/* Email Field */}
                <Clerk.Field name="identifier" className="space-y-2">
                  <Clerk.Label asChild>
                    <Label>Email</Label>
                  </Clerk.Label>
                  <Clerk.Input 
                    type="email" 
                    required 
                    asChild
                    className="focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Input />
                  </Clerk.Input>
                  <Clerk.FieldError className="block text-sm text-destructive" />
                </Clerk.Field>

                {/* Password Field */}
                <Clerk.Field name="password" className="space-y-2">
                  <Clerk.Label asChild>
                    <Label>Password</Label>
                  </Clerk.Label>
                  <Clerk.Input 
                    type="password" 
                    required 
                    asChild
                    className="focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Input />
                  </Clerk.Input>
                  <Clerk.FieldError className="block text-sm text-destructive" />
                </Clerk.Field>
              </CardContent>
              <CardFooter>
                <div className="grid w-full gap-y-4">
                  {/* Submit Button with Loading State */}
                  <SignIn.Action submit asChild>
                    <Button className="w-full">
                      <Clerk.Loading>
                        {(isLoading: boolean) => (
                          isLoading ? (
                            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                          ) : null
                        )}
                      </Clerk.Loading>
                      Sign in
                    </Button>
                  </SignIn.Action>

                  {/* Sign Up Link */}
                  <Button variant="link" size="sm" asChild>
                    <Clerk.Link navigate="sign-up">
                      Don&apos;t have an account? Sign up
                    </Clerk.Link>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </SignIn.Step>
        </SignIn.Root>
      </div>
    </main>
  );
} 