import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";

export async function GET() {
  console.log('🔍 API: check-shop-membership request received');
  
  try {
    const { userId } = await auth();
    console.log('🔍 API: Auth result:', { 
      userId: userId ?? 'missing',
      userIdType: typeof userId,
      userIdLength: userId?.length
    });
    
    if (!userId) {
      console.log('❌ API: Unauthorized - no userId');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log('🔍 API: Checking user in database for clerkId:', userId);
    
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
      console.log('🔍 API: User not found by clerkId, trying to find by email...');
      
      // Get user email from Clerk
      const clerkUser = await currentUser();
      const userEmail = clerkUser?.emailAddresses?.[0]?.emailAddress;
      
      if (userEmail) {
        console.log('🔍 API: Looking for user by email:', userEmail);
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
          console.log('🔍 API: Found user by email, updating clerkId...');
          // Update the clerkId to match the current session
          await db.user.update({
            where: { id: user.id },
            data: { clerkId: userId }
          });
          console.log('✅ API: Updated clerkId from', user.clerkId, 'to', userId);
        }
      }
    }

    console.log('🔍 API: Database query result:', { 
      userFound: !!user, 
      userId: user?.id,
      clerkId: user?.clerkId,
      email: user?.email,
      hasShopId: !!user?.shopId,
      hasShop: !!user?.shop,
      shopId: user?.shopId,
      shopName: user?.shop?.name,
      shopSlug: user?.shop?.slug
    });

    // If user exists but has no shop, let's check what shops exist
    if (user && !user.shopId) {
      console.log('🔍 API: User exists but has no shopId, checking available shops...');
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
      console.log('🔍 API: Available shops:', shops);
      
      // Also check if there are any users with shopId
      const usersWithShops = await db.user.findMany({
        where: {
          shopId: {
            not: null
          }
        },
        select: {
          id: true,
          clerkId: true,
          email: true,
          shopId: true,
          shop: {
            select: {
              name: true,
              slug: true
            }
          }
        }
      });
      console.log('🔍 API: Users with shops:', usersWithShops);
    }

    // Also let's check if there are any users with this email
    if (!user) {
      console.log('🔍 API: User not found by clerkId or email, checking if user exists at all...');
      const allUsers = await db.user.findMany({
        select: {
          id: true,
          clerkId: true,
          email: true,
          shopId: true,
        },
        take: 10
      });
      console.log('🔍 API: All users in database:', allUsers);
    }

    if (!user) {
      console.log('❌ API: User not found in database');
      return NextResponse.json({ 
        hasShop: false, 
        message: "User not found in database",
        searchedClerkId: userId
      });
    }

    if (user.shopId && user.shop) {
      console.log('✅ API: User is linked to shop:', user.shop);
      return NextResponse.json({ 
        hasShop: true, 
        shop: user.shop,
        message: "User is linked to a shop" 
      });
    }

    console.log('❌ API: User not linked to any shop');
    return NextResponse.json({ 
      hasShop: false, 
      message: "User not linked to any shop",
      userEmail: user.email,
      userClerkId: user.clerkId
    });

  } catch (error) {
    console.error("❌ API: Error checking shop membership:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 