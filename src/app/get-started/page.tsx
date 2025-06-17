"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { SignIn } from "@clerk/nextjs";
import { SignUp } from "@clerk/nextjs";

export default function GetStarted() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  // If user is already signed in, redirect to create-shop
  if (isSignedIn) {
    router.push("/create-shop");
    return null;
  }

  return (
    <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Get Started with TCG Vision</CardTitle>
          <CardDescription>
            Choose your preferred sign in method
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="sign-in" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sign-in">Sign In</TabsTrigger>
              <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="sign-in" className="mt-6">
              <SignIn 
                appearance={{
                  elements: {
                    formButtonPrimary: "bg-primary hover:bg-primary/90",
                    footerActionLink: "text-primary hover:text-primary/90",
                  },
                }}
                afterSignInUrl="/create-shop"
                signUpUrl="/get-started?tab=sign-up"
              />
            </TabsContent>
            <TabsContent value="sign-up" className="mt-6">
              <SignUp 
                appearance={{
                  elements: {
                    formButtonPrimary: "bg-primary hover:bg-primary/90",
                    footerActionLink: "text-primary hover:text-primary/90",
                  },
                }}
                afterSignUpUrl="/create-shop"
                signInUrl="/get-started?tab=sign-in"
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 