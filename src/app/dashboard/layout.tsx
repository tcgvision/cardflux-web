import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { TRPCReactProvider } from "~/trpc/react";
import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import type { PrismaClient } from "@prisma/client";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { AppSidebar } from "~/components/app-sidebar";
import { SiteHeader } from "~/components/site-header";
import { LoadingProvider } from "~/components/loading-provider";
import { DashboardContent } from "~/components/dashboard-content";

// const geist = Geist;

// Generate dynamic metadata based on the current organization
export const metadata: Metadata = {
  title: "CardFlux Dashboard",
  description: "Manage your TCG business with CardFlux",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      signInUrl="/auth/sign-in"
      signUpUrl="/auth/sign-up"
    >
      <TRPCReactProvider>
        <LoadingProvider>
          <SidebarProvider
            style={
              {
                "--sidebar-width": "calc(var(--spacing) * 72)",
                "--header-height": "calc(var(--spacing) * 12)",
              } as React.CSSProperties
            }
          >
            <AppSidebar variant="inset" />
            <SidebarInset>
              <SiteHeader />
              <DashboardContent>
                {children}
              </DashboardContent>
            </SidebarInset>
          </SidebarProvider>
        </LoadingProvider>
      </TRPCReactProvider>
    </ClerkProvider>
  );
} 