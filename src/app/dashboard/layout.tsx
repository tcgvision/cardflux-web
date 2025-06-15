import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { TRPCReactProvider } from "~/trpc/react";
import { ClerkProvider } from "@clerk/nextjs";
import { DashboardNavbar } from "./_components/enterprise-navbar";
import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import type { PrismaClient } from "@prisma/client";

// const geist = Geist;

// Generate dynamic metadata based on the current organization
export async function generateMetadata(): Promise<Metadata> {
  const { orgId } = await auth();
  
  if (!orgId) {
    return {
      title: "TCG Vision Dashboard",
      description: "Manage your TCG business with TCG Vision",
    };
  }

  try {
    // Fetch shop details from database
    const shop = await (db as PrismaClient).shop.findUnique({
      where: { id: orgId },
      select: { name: true },
    });

    if (!shop) {
      return {
        title: "TCG Vision Dashboard",
        description: "Manage your TCG business with TCG Vision",
      };
    }

    return {
      title: `${shop.name} | TCG Vision`,
      description: `Manage ${shop.name} with TCG Vision`,
    };
  } catch (error) {
    console.error("Error fetching shop details:", error);
    return {
      title: "TCG Vision Dashboard",
      description: "Manage your TCG business with TCG Vision",
    };
  }
}

// This tells Next.js not to inherit the root layout
export const dynamic = "force-dynamic";

// Prevent inheriting from root layout
// export const metadata: Metadata = {
//   title: "TCG Vision Enterprise",
//   description: "Manage your TCG business with TCG Vision Enterprise",
// };

// This tells Next.js not to inherit the root layout
export const layout = false;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <TRPCReactProvider>
        <div className="min-h-screen bg-background font-sans antialiased">
          <DashboardNavbar />
          <main className="container mx-auto px-4 py-6">{children}</main>
        </div>
      </TRPCReactProvider>
    </ClerkProvider>
  );
} 