import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";

export async function POST() {
  try {
    // Get the authenticated user from Clerk
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get full user data from Clerk
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "User not found in Clerk" }, { status: 404 });
    }

    // Check if user already exists in database
    const existingUser = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (existingUser) {
      return NextResponse.json({ 
        message: "User already exists in database",
        user: existingUser 
      });
    }

    // Create user in database
    const newUser = await db.user.create({
      data: {
        clerkId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
        name: `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() || null,
      },
    });

    console.log('Manually synced user to database:', newUser);

    return NextResponse.json({ 
      message: "User successfully synced to database",
      user: newUser 
    });

  } catch (error) {
    console.error('Error syncing user:', error);
    return NextResponse.json(
      { error: "Failed to sync user to database" },
      { status: 500 }
    );
  }
} 