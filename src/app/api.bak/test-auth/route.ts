import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log('🔍 TEST AUTH: Testing authentication context...');

    const { userId } = await auth();
    const clerkUser = await currentUser();
    
    console.log('🔍 TEST AUTH: Auth context:', { 
      userId: userId ? userId.substring(0, 8) + '...' : 'null',
      hasClerkUser: !!clerkUser,
      userEmail: clerkUser?.emailAddresses?.[0]?.emailAddress
    });

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: "No user ID found",
        message: "Please ensure you are signed in"
      }, { status: 401 });
    }

    if (!clerkUser) {
      return NextResponse.json({
        success: false,
        error: "No clerk user found",
        message: "Please ensure you are signed in"
      }, { status: 401 });
    }

    // Get organization info
    const orgMemberships = (clerkUser as any)?.organizationMemberships ?? [];
    const currentOrg = orgMemberships[0];

    return NextResponse.json({
      success: true,
      message: "Authentication working",
      data: {
        userId: userId.substring(0, 8) + '...',
        userEmail: clerkUser.emailAddresses?.[0]?.emailAddress,
        hasOrganization: !!currentOrg,
        organizationId: currentOrg?.organization?.id,
        organizationName: currentOrg?.organization?.name,
        userRole: currentOrg?.role
      }
    });

  } catch (error) {
    console.error("❌ TEST AUTH: Error:", error);
    
    return NextResponse.json({ 
      success: false,
      error: "Authentication test failed",
      message: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
} 