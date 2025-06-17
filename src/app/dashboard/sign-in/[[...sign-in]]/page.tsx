"use client";

import { SignIn } from "@clerk/nextjs";
import { useTheme } from "next-themes";

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
  const { theme } = useTheme();

  return (
    <div className="container mx-auto flex h-[calc(100vh-4rem)] items-center justify-center px-4">
      <SignIn
        appearance={{
          elements: {
            formButtonPrimary: "bg-primary hover:bg-primary/90",
            footerActionLink: "text-primary hover:text-primary/90",
          },
        }}
        afterSignInUrl="/dashboard"
        signUpUrl="/dashboard/sign-up"
      />
    </div>
  );
} 