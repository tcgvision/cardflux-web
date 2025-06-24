import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";

export async function GET() {
  try {
    const { userId } = await auth();
    const clerkUser = await currentUser();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log('🔍 DEBUG: Current user info:', {
      clerkId: userId,
      email: clerkUser?.emailAddresses?.[0]?.emailAddress
    });

    // Get all users
    const allUsers = await db.user.findMany({
      select: {
        id: true,
        clerkId: true,
        email: true,
        shopId: true,
        shop: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    // Get all shops
    const allShops = await db.shop.findMany({
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

    // Find current user
    const currentUserRecord = allUsers.find(u => u.clerkId === userId || u.email === clerkUser?.emailAddresses?.[0]?.emailAddress);

    return NextResponse.json({
      currentUser: {
        clerkId: userId,
        email: clerkUser?.emailAddresses?.[0]?.emailAddress,
        foundInDatabase: !!currentUserRecord,
        userRecord: currentUserRecord
      },
      allUsers,
      allShops,
      summary: {
        totalUsers: allUsers.length,
        usersWithShops: allUsers.filter(u => u.shopId).length,
        totalShops: allShops.length
      }
    });

  } catch (error) {
    console.error("❌ DEBUG: Error:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 