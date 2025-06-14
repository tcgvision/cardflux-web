import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { TRPCReactProvider } from "~/trpc/react";
import { ClerkProvider } from "@clerk/nextjs";
import { EnterpriseNavbar } from "./_components/enterprise-navbar";
import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import type { PrismaClient } from "@prisma/client";

// const geist = Geist;

// Generate dynamic metadata based on the current organization
export async function generateMetadata(): Promise<Metadata> {
  const { orgId } = await auth();
  
  if (!orgId) {
    return {
      title: "TCG Vision Enterprise",
      description: "Manage your TCG business with TCG Vision Enterprise",
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
        title: "TCG Vision Enterprise",
        description: "Manage your TCG business with TCG Vision Enterprise",
      };
    }

    return {
      title: `${shop.name} | TCG Vision`,
      description: `Manage ${shop.name} with TCG Vision Enterprise`,
    };
  } catch (error) {
    console.error("Error fetching shop details:", error);
    return {
      title: "TCG Vision Enterprise",
      description: "Manage your TCG business with TCG Vision Enterprise",
    };
  }
}

// This tells Next.js not to inherit the root layout
export const dynamic = "force-dynamic";

export default function EnterpriseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <TRPCReactProvider>
        <div className="min-h-screen bg-background font-sans antialiased">
          <EnterpriseNavbar />
          <main className="container mx-auto px-4 py-6">{children}</main>
        </div>
      </TRPCReactProvider>
    </ClerkProvider>
  );
} 