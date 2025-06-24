import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";

export async function POST() {
  try {
    const { userId } = await auth();
    const clerkUser = await currentUser();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized", message: "User not authenticated" }, 
        { status: 401 }
      );
    }

    console.log('🔄 SYNC: Starting organization sync for user:', userId);
    console.log('👤 CLERK USER DEBUG:', {
      userId,
      clerkUser: {
        id: clerkUser?.id,
        email: clerkUser?.emailAddresses?.[0]?.emailAddress,
        firstName: clerkUser?.firstName,
        lastName: clerkUser?.lastName,
        organizationMemberships: (clerkUser as any)?.organizationMemberships,
        organizationMembershipsCount: (clerkUser as any)?.organizationMemberships?.length,
      }
    });

    // Get user's database record
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: { shop: true },
    });

    console.log('🗄️ DATABASE USER DEBUG:', {
      userFound: !!user,
      user: user ? {
        id: user.id,
        clerkId: user.clerkId,
        email: user.email,
        shopId: user.shopId,
        shopName: user.shop?.name,
      } : null
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found", message: "User not found in database" }, 
        { status: 404 }
      );
    }

    if (!user.shopId) {
      return NextResponse.json(
        { error: "No shop membership", message: "User not linked to any shop" }, 
        { status: 400 }
      );
    }

    // Get shop details
    const shop = await db.shop.findUnique({
      where: { id: user.shopId },
    });

    console.log('🏪 SHOP DEBUG:', {
      shopFound: !!shop,
      shop: shop ? {
        id: shop.id,
        name: shop.name,
        slug: shop.slug,
      } : null
    });

    if (!shop) {
      return NextResponse.json(
        { error: "Shop not found", message: "Shop not found in database" }, 
        { status: 404 }
      );
    }

    console.log('🔄 SYNC: User is linked to shop:', shop.name, 'ID:', shop.id);

    // Check current Clerk organization membership
    const currentOrgs = (clerkUser as any)?.organizationMemberships ?? [];
    console.log('🏢 CLERK ORGANIZATIONS DEBUG:', {
      currentOrgs,
      currentOrgsCount: currentOrgs.length,
      orgIds: currentOrgs.map((org: any) => org.organization?.id),
      orgNames: currentOrgs.map((org: any) => org.organization?.name),
      lookingForShopId: shop.id,
    });

    const hasOrgMembership = currentOrgs.some((org: { organization?: { id: string } }) => org.organization?.id === shop.id);

    console.log('🔍 MEMBERSHIP CHECK:', {
      hasOrgMembership,
      shopId: shop.id,
      foundInOrgs: currentOrgs.filter((org: any) => org.organization?.id === shop.id).map((org: any) => ({
        id: org.organization?.id,
        name: org.organization?.name,
        role: org.role,
      }))
    });

    if (hasOrgMembership) {
      console.log('✅ SYNC: User already has Clerk organization membership');
      return NextResponse.json({ 
        success: true, 
        message: "Already synced",
        shopId: shop.id,
        shopName: shop.name
      });
    }

    // User needs to be added to the Clerk organization
    // Since we can't directly add users to organizations via API,
    // we need to trigger the invitation flow or redirect them
    
    console.log('⚠️ SYNC: User needs Clerk organization membership');
    console.log('📧 RECOMMENDATION: Send invitation to user for organization:', shop.name);
    
    return NextResponse.json({ 
      success: false, 
      needsInvitation: true,
      message: "User needs to accept organization invitation",
      shopId: shop.id,
      shopName: shop.name
    });

  } catch (error) {
    console.error("❌ SYNC: Error syncing organization:", error);
    
    // Don't expose internal error details in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    return NextResponse.json({ 
      error: "Internal server error",
      message: "Failed to sync organization",
      ...(isDevelopment && { details: error instanceof Error ? error.message : 'Unknown error' })
    }, { status: 500 });
  }
} 