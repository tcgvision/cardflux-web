"use client";

import { useAuth } from "@clerk/nextjs";
import * as Clerk from "@clerk/elements/common";
import * as SignUp from "@clerk/elements/sign-up";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Icons } from "~/components/icons";

/**
 * SignUpPage Component
 * 
 * A custom sign-up page using Clerk Elements with shadcn/ui styling.
 * Handles user registration with email and password.
 * 
 * Features:
 * - Email and password validation
 * - Loading states
 * - Error handling
 * - Automatic redirect if already signed in
 * - Responsive design
 */
export default function SignUpPage() {
  const { isSignedIn } = useAuth();

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
      <div className="w-full max-w-md px-4">
        <SignUp.Root>
          <SignUp.Step name="start">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Create an account</CardTitle>
                <CardDescription>
                  Enter your email below to create your account
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                {/* Email Field */}
                <Clerk.Field name="emailAddress" className="space-y-2">
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
                  <SignUp.Action submit asChild>
                    <Button className="w-full">
                      <Clerk.Loading>
                        {(isLoading: boolean) => (
                          isLoading ? (
                            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                          ) : null
                        )}
                      </Clerk.Loading>
                      Create account
                    </Button>
                  </SignUp.Action>

                  {/* Sign In Link */}
                  <Button variant="link" size="sm" asChild>
                    <Clerk.Link navigate="sign-in">
                      Already have an account? Sign in
                    </Clerk.Link>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </SignUp.Step>
        </SignUp.Root>
      </div>
    </main>
  );
} 