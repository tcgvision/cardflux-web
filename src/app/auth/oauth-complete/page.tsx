"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSignIn, useUser, useOrganization } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Loader2 } from "lucide-react";

export default function OAuthCompletePage() {
  const { isLoaded, signIn } = useSignIn();
  const { user } = useUser();
  const { organization } = useOrganization();
  const router = useRouter();
  const [status, setStatus] = useState<string>("Processing OAuth completion...");

  useEffect(() => {
    if (!isLoaded) return;

    console.log("🔍 OAuth completion page loaded");
    console.log("URL search params:", window.location.search);
    console.log("User authenticated:", !!user);
    console.log("Organization:", organization?.name || "None");

    const handleOAuthCompletion = async () => {
      try {
        // Check if OAuth just completed
        const urlParams = new URLSearchParams(window.location.search);
        const hasOAuthParams = urlParams.has('__clerk_status') || 
                              urlParams.has('__clerk_db_jwt') || 
                              urlParams.has('__clerk_strategy') ||
                              (urlParams.has('code') && urlParams.has('state'));

        if (hasOAuthParams) {
          console.log("✅ OAuth parameters detected");
          setStatus("OAuth parameters detected, processing...");

          // Wait for Clerk to process OAuth completion
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Check if user is now authenticated
          if (user) {
            console.log("✅ User authenticated after OAuth");
            setStatus("User authenticated successfully!");

            // Sync user to database
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

            // Route based on organization status
            if (organization) {
              console.log("✅ User has organization, redirecting to dashboard");
              setStatus("Redirecting to dashboard...");
              router.push("/dashboard");
            } else {
              console.log("✅ User authenticated but no organization, redirecting to create-shop");
              setStatus("Redirecting to create shop...");
              router.push("/create-shop");
            }
          } else {
            console.log("⚠️ OAuth completed but user not authenticated yet, waiting...");
            setStatus("OAuth completed, waiting for authentication...");

            // Wait a bit more and check again
            setTimeout(() => {
              if (user) {
                console.log("✅ User now authenticated after OAuth");
                setStatus("User authenticated, redirecting...");
                router.push("/create-shop");
              } else {
                console.log("❌ OAuth completed but user still not authenticated");
                setStatus("Authentication failed. Please try again.");
              }
            }, 3000);
          }
        } else {
          console.log("❌ No OAuth parameters found");
          setStatus("No OAuth parameters found. Redirecting to sign-up...");
          router.push("/auth/sign-up");
        }
      } catch (error) {
        console.error("❌ Error handling OAuth completion:", error);
        setStatus("Error occurred. Redirecting to sign-up...");
        router.push("/auth/sign-up");
      }
    };

    void handleOAuthCompletion();
  }, [isLoaded, user, organization, router]);

  return (
    <div className="min-h-[calc(100vh-7rem)] flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md border-border shadow-lg">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-semibold text-foreground">
            Completing OAuth
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Please wait while we complete your authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">{status}</p>
        </CardContent>
      </Card>
    </div>
  );
} 