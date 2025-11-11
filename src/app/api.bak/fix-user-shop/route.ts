import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { AuthSyncService } from "~/lib/auth-sync";

export async function POST() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" }, 
        { status: 401 }
      );
    }

    // Use the dedicated auth sync service
    const result = await AuthSyncService.fixUserShopLinking(userId);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }

  } catch (error) {
    console.error('Fix user-shop error:', error);
    
    return NextResponse.json({ 
      success: false,
      error: "Failed to fix user-shop linking",
      message: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
} 