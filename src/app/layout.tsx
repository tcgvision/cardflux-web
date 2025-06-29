import { ClerkProvider } from "@clerk/nextjs";
import { Montserrat } from "next/font/google";
import "~/styles/globals.css";
import { type Metadata } from "next";
import { TRPCReactProvider } from "~/trpc/react";
import { Toaster } from "sonner";
import { NavbarWrapper } from "./_components/navbar-wrapper";
import { ThemeProvider } from "~/components/themeprovider";

const montserrat = Montserrat({ 
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "CardFlux",
  description: "Advanced analytics for your Trading Card Game collection",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${montserrat.className}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClerkProvider
            appearance={{
              elements: {
                formButtonPrimary: "bg-primary hover:bg-primary/90",
                footerActionLink: "text-primary hover:text-primary/90",
              },
            }}
            signInUrl="/auth/sign-in"
            signUpUrl="/auth/sign-up"
            afterSignInUrl="/dashboard"
            afterSignUpUrl="/create-shop"
            publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
          >
            <NavbarWrapper />
            <TRPCReactProvider>{children}</TRPCReactProvider>
            <Toaster />
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
