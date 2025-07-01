import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { authSync } from "~/lib/auth-sync";

export async function POST() {
  try {
    // Only allow in development
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: "This endpoint is only available in development" }, 
        { status: 403 }
      );
    }

    const { userId } = await auth();
    const clerkUser = await currentUser();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" }, 
        { status: 401 }
      );
    }

    console.log('🔄 DEV SYNC: Starting comprehensive sync for development...');

    // Get user's current org from Clerk
    const orgMemberships = (clerkUser as any)?.organizationMemberships ?? [];
    const currentOrg = orgMemberships[0]; // Assume first org is the shop

    if (!currentOrg) {
      return NextResponse.json(
        { error: "User not a member of any organization in Clerk" }, 
        { status: 400 }
      );
    }

    console.log('🔄 DEV SYNC: Current organization in Clerk:', {
      orgId: currentOrg.organization.id,
      orgName: currentOrg.organization.name,
      userRole: currentOrg.role,
    });

    // Perform full organization sync
    const syncResult = await authSync.syncOrganizationFromClerk(currentOrg.organization.id);

    if (syncResult.success) {
      console.log('✅ DEV SYNC: Comprehensive sync completed successfully');
      
      return NextResponse.json({ 
        success: true,
        message: "Comprehensive sync completed",
        data: syncResult.data,
      });
    } else {
      console.error('❌ DEV SYNC: Comprehensive sync failed:', syncResult.errors);
      
      return NextResponse.json({ 
        success: false,
        error: "Sync failed",
        message: syncResult.message,
        errors: syncResult.errors,
      }, { status: 500 });
    }

  } catch (error) {
    console.error("❌ DEV SYNC: Error during comprehensive sync:", error);
    
    return NextResponse.json({ 
      error: "Failed to sync users",
      message: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
} 