import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";

export async function POST(req: Request) {
  try {
    const { email } = await req.json() as { email: string };
    
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    console.log(`Attempting to reset sign-up state for email: ${email}`);

    // Remove user from database if exists (for testing purposes)
    const deletedUser = await db.user.deleteMany({
      where: { email },
    });

    console.log(`Deleted ${deletedUser.count} user records for ${email}`);

    return NextResponse.json({ 
      message: `Reset complete for ${email}. Deleted ${deletedUser.count} user records.`,
      deletedRecords: deletedUser.count
    });

  } catch (error) {
    console.error('Error resetting sign-up:', error);
    return NextResponse.json(
      { error: "Failed to reset sign-up state" },
      { status: 500 }
    );
  }
} 