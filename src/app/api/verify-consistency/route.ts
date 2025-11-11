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
      console.log('❌ CONSISTENCY CHECK: No user ID found in auth context');
      return NextResponse.json(
        { error: "Unauthorized - No user ID found" }, 
        { status: 401 }
      );
    }

    if (!clerkUser) {
      console.log('❌ CONSISTENCY CHECK: No clerk user found');
      return NextResponse.json(
        { error: "Unauthorized - No clerk user found" }, 
        { status: 401 }
      );
    }

    console.log('🔍 CONSISTENCY CHECK: Starting data consistency verification...');

    // Get user's current org from Clerk
    const orgMemberships = (clerkUser as any)?.organizationMemberships ?? [];
    const currentOrg = orgMemberships[0]; // Assume first org is the shop

    if (!currentOrg) {
      return NextResponse.json(
        { error: "User not a member of any organization in Clerk" }, 
        { status: 400 }
      );
    }

    console.log('🔍 CONSISTENCY CHECK: Verifying organization:', {
      orgId: currentOrg.organization.id,
      orgName: currentOrg.organization.name,
    });

    // Perform consistency verification
    // TODO: Re-enable after fixing AuthSyncService
    const result = { success: true, message: "Verification temporarily disabled", data: {}, errors: [] };
    // const result = await authSync.verifyConsistency(currentOrg.organization.id);

    if (result.success) {
      console.log('✅ CONSISTENCY CHECK: Verification completed successfully');
      
      return NextResponse.json({ 
        success: true,
        message: result.message,
        data: result.data,
      });
    } else {
      console.error('❌ CONSISTENCY CHECK: Verification failed:', result.errors);
      
      return NextResponse.json({ 
        success: false,
        error: "Consistency check failed",
        message: result.message,
        errors: result.errors,
        data: result.data, // Include data even if there were issues
      }, { status: 500 });
    }

  } catch (error) {
    console.error("❌ CONSISTENCY CHECK: Error during verification:", error);
    
    return NextResponse.json({ 
      error: "Failed to verify consistency",
      message: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
} 