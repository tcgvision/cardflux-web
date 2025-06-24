import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();
    const clerkUser = await currentUser();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log('🔍 CLERK DEBUG: User info:', {
      clerkId: userId,
      email: clerkUser?.emailAddresses?.[0]?.emailAddress,
      firstName: clerkUser?.firstName,
      lastName: clerkUser?.lastName
    });

    // Get organization memberships with detailed logging
    const memberships = (clerkUser as any)?.organizationMemberships;
    
    console.log('🔍 CLERK DEBUG: Organization memberships:', {
      memberships,
      count: memberships?.length ?? 0,
      details: memberships?.map((org: any) => ({
        id: org.organization?.id,
        name: org.organization?.name,
        role: org.role,
        permissions: org.permissions,
      }))
    });

    return NextResponse.json({
      user: {
        clerkId: userId,
        email: clerkUser?.emailAddresses?.[0]?.emailAddress,
        firstName: clerkUser?.firstName,
        lastName: clerkUser?.lastName
      },
      organizationMemberships: memberships,
      organizationDetails: memberships?.map((org: any) => ({
        id: org.organization?.id,
        name: org.organization?.name,
        role: org.role,
        permissions: org.permissions,
      })) ?? [],
      summary: {
        totalMemberships: memberships?.length ?? 0,
        hasMemberships: (memberships?.length ?? 0) > 0,
        membershipIds: memberships?.map((org: any) => org.organization?.id) ?? [],
        membershipNames: memberships?.map((org: any) => org.organization?.name) ?? [],
      }
    });

  } catch (error) {
    console.error("❌ CLERK DEBUG: Error:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 