import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

// GET  /api/templates/get
// Returns all active meeting templates for the given user
export async function GET() {
  // Get userId from session
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const templates = await prisma.meetingTemplate.findMany({
      where: {
        userId,
        isActive: true,
      },
      select: {
        id: true,
        purpose: true,
        goal: true,
        additionalInfo: true,
        duration: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: templates,
      message: 'Templates retrieved successfully'
    });
  } catch (error) {
    console.error("[GET_TEMPLATES]", error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch templates'
      },
      { status: 500 }
    );
  }
}
