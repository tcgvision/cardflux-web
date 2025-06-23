import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import "~/styles/globals.css";
import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { TRPCReactProvider } from "~/trpc/react";
import { Toaster } from "sonner";
import { NavbarWrapper } from "./_components/navbar-wrapper";
import { ThemeProvider } from "~/components/themeprovider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TCG Vision",
  description: "Modern TCG Inventory Management",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${inter.className}`}
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
            afterSignUpUrl="/dashboard"
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
