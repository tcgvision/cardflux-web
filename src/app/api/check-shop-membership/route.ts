import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is linked to a shop in the database
    const user = await db.user.findUnique({
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

    if (!user) {
      return NextResponse.json({ 
        hasShop: false, 
        message: "User not found in database" 
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
      message: "User not linked to any shop" 
    });

  } catch (error) {
    console.error("Error checking shop membership:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
} 