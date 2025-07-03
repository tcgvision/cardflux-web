import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { headers } from "next/headers";

// Validation schema for waitlist signup
const waitlistSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  storeName: z.string().optional(),
  storeType: z.enum(["TCG", "Comic", "Figure", "General", "Other"]).optional(),
  expectedLaunch: z.string().optional(),
  source: z.string().optional(),
  referrer: z.string().optional(),
});

// Generate a unique discount code
function generateDiscountCode(): string {
  const prefix = "EARLY";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const headersList = await headers();
    
    // Validate input
    const validatedData = waitlistSchema.parse(body);
    
    // Check if email already exists
    const existingEntry = await db.waitlistEntry.findUnique({
      where: { email: validatedData.email },
    });
    
    if (existingEntry) {
      return NextResponse.json(
        { 
          success: false, 
          message: "You're already on our waitlist! We'll notify you when CardFlux launches." 
        },
        { status: 409 }
      );
    }
    
    // Generate unique discount code
    let discountCode: string;
    let isUnique = false;
    
    while (!isUnique) {
      discountCode = generateDiscountCode();
      const existingCode = await db.waitlistEntry.findUnique({
        where: { discountCode },
      });
      if (!existingCode) {
        isUnique = true;
      }
    }
    
    // Create waitlist entry
    const waitlistEntry = await db.waitlistEntry.create({
      data: {
        email: validatedData.email,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        storeName: validatedData.storeName,
        storeType: validatedData.storeType,
        expectedLaunch: validatedData.expectedLaunch,
        source: validatedData.source,
        referrer: validatedData.referrer,
        ipAddress: request.ip || headersList.get("x-forwarded-for") || "unknown",
        userAgent: headersList.get("user-agent") || "unknown",
        discountCode,
      },
    });
    
    // TODO: Send welcome email with discount code
    // await sendWelcomeEmail(waitlistEntry);
    
    return NextResponse.json({
      success: true,
      message: "Welcome to the CardFlux waitlist! You'll receive a 10% discount code when we launch.",
      data: {
        id: waitlistEntry.id,
        email: waitlistEntry.email,
        discountCode: waitlistEntry.discountCode,
      },
    });
    
  } catch (error) {
    console.error("Waitlist signup error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid input data", 
          errors: error.errors 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: "Something went wrong. Please try again." 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get waitlist stats (for admin dashboard)
    const totalSignups = await db.waitlistEntry.count();
    const recentSignups = await db.waitlistEntry.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        storeName: true,
        storeType: true,
        createdAt: true,
      },
    });
    
    const storeTypeBreakdown = await db.waitlistEntry.groupBy({
      by: ["storeType"],
      _count: {
        storeType: true,
      },
    });
    
    return NextResponse.json({
      success: true,
      data: {
        totalSignups,
        recentSignups,
        storeTypeBreakdown,
      },
    });
    
  } catch (error) {
    console.error("Waitlist stats error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to fetch waitlist stats" 
      },
      { status: 500 }
    );
  }
} 