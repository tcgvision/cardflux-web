import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";

export async function POST() {
  try {
    console.log('🔧 FIX USER SHOP: Starting fix...');

    const { userId, orgId } = await auth();
    const clerkUser = await currentUser();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" }, 
        { status: 401 }
      );
    }

    if (!clerkUser) {
      return NextResponse.json(
        { error: "No clerk user found" }, 
        { status: 401 }
      );
    }

    console.log('🔧 FIX USER SHOP: Processing user:', userId);
    console.log('🔧 FIX USER SHOP: Organization ID:', orgId);

    // Get current user from database
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        clerkId: true,
        email: true,
        name: true,
        shopId: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found in database" }, 
        { status: 404 }
      );
    }

    console.log('🔧 FIX USER SHOP: Current user state:', {
      hasShopId: !!user.shopId,
      shopId: user.shopId,
      role: user.role,
    });

    // If user already has shopId, return success
    if (user.shopId) {
      const shop = await db.shop.findUnique({
        where: { id: user.shopId },
        select: { id: true, name: true },
      });

      return NextResponse.json({
        success: true,
        message: "User already linked to shop",
        data: {
          shopId: user.shopId,
          shopName: shop?.name,
          role: user.role,
        },
      });
    }

    // If no organization ID, user needs to create or join a shop
    if (!orgId) {
      return NextResponse.json({
        success: false,
        message: "No organization found. Please create or join a shop first.",
        data: {
          needsShop: true,
        },
      });
    }

    // Check if shop exists with this org ID
    let shop = await db.shop.findUnique({
      where: { id: orgId },
      select: { id: true, name: true },
    });

    if (!shop) {
      console.log('🔧 FIX USER SHOP: Creating shop for organization:', orgId);
      
      // Get organization name from Clerk
      const orgName = clerkUser.organizationMemberships?.[0]?.organization?.name || 'Unnamed Shop';
      
      // Create shop
      shop = await db.shop.create({
        data: {
          id: orgId,
          name: orgName,
          slug: orgName.toLowerCase().replace(/\s+/g, '-') || `shop-${orgId.substring(0, 8)}`,
          description: `Shop for ${orgName}`,
          type: 'both',
        },
        select: { id: true, name: true },
      });

      console.log('🔧 FIX USER SHOP: Created shop:', shop.name);
    }

    // Get user's role from Clerk organization
    const orgRole = clerkUser.organizationMemberships?.[0]?.role || 'org:member';

    // Link user to shop
    await db.user.update({
      where: { id: user.id },
      data: {
        shopId: shop.id,
        role: orgRole,
      },
    });

    console.log('🔧 FIX USER SHOP: Linked user to shop:', shop.name);

    return NextResponse.json({
      success: true,
      message: "User successfully linked to shop",
      data: {
        shopId: shop.id,
        shopName: shop.name,
        role: orgRole,
        wasCreated: !shop.id,
      },
    });

  } catch (error) {
    console.error('❌ FIX USER SHOP: Error:', error);
    
    return NextResponse.json({ 
      success: false,
      error: "Failed to fix user-shop linking",
      message: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
} 