"use client";

import { SignUp } from "@clerk/nextjs";
import { useTheme } from "next-themes";

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
  const { theme } = useTheme();

  return (
    <div className="container mx-auto flex h-[calc(100vh-4rem)] items-center justify-center px-4">
      <SignUp
        appearance={{
          elements: {
            formButtonPrimary: "bg-primary hover:bg-primary/90",
            footerActionLink: "text-primary hover:text-primary/90",
          },
        }}
        afterSignUpUrl="/dashboard/create-shop"
        signInUrl="/dashboard/sign-in"
      />
    </div>
  );
} 