import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";

export async function POST() {
  try {
    const { userId } = await auth();
    const clerkUser = await currentUser();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log('🔧 FIX: Attempting to fix user-shop linking for:', {
      clerkId: userId,
      email: clerkUser?.emailAddresses?.[0]?.emailAddress
    });

    // Find the current user
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: {
        shop: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log('🔧 FIX: Current user state:', {
      userId: user.id,
      email: user.email,
      shopId: user.shopId,
      hasShop: !!user.shop
    });

    // If user already has a shop, return success
    if (user.shopId && user.shop) {
      return NextResponse.json({
        success: true,
        message: "User already linked to shop",
        shop: user.shop
      });
    }

    // Get all available shops
    const shops = await db.shop.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: {
            users: true
          }
        }
      }
    });

    console.log('🔧 FIX: Available shops:', shops);

    // Strategy 1: Try to find a shop by email pattern or name
    let targetShop = null;
    
    // Look for shops that might be related to this user
    const userEmail = user.email.toLowerCase();
    const emailPrefix = userEmail.split('@')[0];
    
    // Try to find a shop that matches the user's email or name
    targetShop = shops.find(shop => {
      const shopName = shop.name?.toLowerCase() ?? '';
      const shopSlug = shop.slug?.toLowerCase() ?? '';
      
      return shopName.includes(emailPrefix) ||
             shopSlug.includes(emailPrefix) ||
             shopName.includes('eric') ||
             shopName.includes('yun');
    });

    // If no specific match, use the first available shop
    if (!targetShop && shops.length > 0) {
      targetShop = shops[0];
    }

    if (targetShop) {
      console.log('🔧 FIX: Linking user to shop:', targetShop);
      
      // Update the user to link to the shop
      const updatedUser = await db.user.update({
        where: { id: user.id },
        data: { shopId: targetShop.id },
        include: {
          shop: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      });

      console.log('✅ FIX: Successfully linked user to shop:', updatedUser.shop);

      return NextResponse.json({
        success: true,
        message: "User successfully linked to shop",
        shop: updatedUser.shop,
        action: "linked"
      });
    } else {
      return NextResponse.json({
        success: false,
        message: "No shops available to link to",
        availableShops: shops
      }, { status: 400 });
    }

  } catch (error) {
    console.error("❌ FIX: Error fixing user-shop linking:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 