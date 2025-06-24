import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";

export async function GET() {
  try {
    const { userId, orgId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ 
        isAuthenticated: false,
        hasOrganization: false,
        hasShop: false,
        redirectTo: "/auth/sign-in"
      });
    }

    // Check if user has organization in Clerk
    const hasOrganization = !!orgId;

    // Check if user has shop in database
    let hasShop = false;
    let shopId = null;
    
    if (userId) {
      const user = await db.user.findUnique({
        where: { clerkId: userId },
        select: {
          shopId: true,
          shop: {
            select: {
              id: true,
              name: true,
              slug: true,
            }
          }
        },
      });
      
      hasShop = !!user?.shopId;
      shopId = user?.shopId;
    }

    // Determine redirect path
    let redirectTo = null;
    
    if (!hasOrganization && !hasShop) {
      redirectTo = "/dashboard/create-shop";
    } else if (hasOrganization || hasShop) {
      redirectTo = "/dashboard";
    }

    return NextResponse.json({ 
      isAuthenticated: true,
      hasOrganization,
      hasShop,
      shopId,
      redirectTo
    });

  } catch (error) {
    console.error("Error checking auth status:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
} 