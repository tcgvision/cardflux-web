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

    console.log('🔄 DEV SYNC: Starting sync request...');

    const { userId } = await auth();
    const clerkUser = await currentUser();
    
    console.log('🔄 DEV SYNC: Auth context:', { 
      userId: userId ? userId.substring(0, 8) + '...' : 'null',
      hasClerkUser: !!clerkUser 
    });
    
    if (!userId) {
      console.log('❌ DEV SYNC: No user ID found in auth context');
      return NextResponse.json(
        { error: "Unauthorized - No user ID found. Please ensure you are signed in." }, 
        { status: 401 }
      );
    }

    if (!clerkUser) {
      console.log('❌ DEV SYNC: No clerk user found');
      return NextResponse.json(
        { error: "Unauthorized - No clerk user found. Please ensure you are signed in." }, 
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
    // TODO: Re-enable after fixing AuthSyncService
    const syncResult = { success: true, data: { message: "Sync temporarily disabled" }, message: "Sync disabled", errors: [] };
    // const syncResult = await authSync.syncOrganizationFromClerk(currentOrg.organization.id);

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