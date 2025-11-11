import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // First try to find user by clerkId
    let user = await db.user.findUnique({
      where: { clerkId: userId },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // If not found by clerkId, try to find by email (fallback for clerkId mismatch)
    if (!user) {
      // Get user email from Clerk
      const clerkUser = await currentUser();
      const userEmail = clerkUser?.emailAddresses?.[0]?.emailAddress;
      
      if (userEmail) {
        user = await db.user.findUnique({
          where: { email: userEmail },
          include: {
            shop: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        });
        
        if (user) {
          // Update the clerkId to match the current session
          await db.user.update({
            where: { id: user.id },
            data: { clerkId: userId }
          });
        }
      }
    }

    if (!user) {
      return NextResponse.json({ 
        hasShop: false, 
        message: "User not found in database",
        searchedClerkId: userId
      });
    }

    if (user.shopId && user.shop) {
      return NextResponse.json({ 
        hasShop: true, 
        shop: user.shop,
        message: "User is linked to a shop" 
      });
    }

    return NextResponse.json({ 
      hasShop: false, 
      message: "User not linked to any shop",
      userEmail: user.email,
      userClerkId: user.clerkId
    });

  } catch (error) {
    console.error("Error checking shop membership:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 