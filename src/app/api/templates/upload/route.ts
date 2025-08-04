import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { z } from "zod";

const templateSchema = z.object({
  purpose: z.string().min(1, "Purpose is required"),
  goal: z.string().min(1, "Goal is required"),
  additionalInfo: z.string().optional(),
  duration: z.string().optional(), // defaults handled below
});

// POST /api/templates/upload
// Body: { userId, purpose, goal, additionalInfo?, duration? }
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({
      success: false,
      error: 'Invalid JSON body',
      message: 'Request body could not be parsed'
    }, { status: 400 });
  }

  const result = templateSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      {
        success: false,
        error: 'Validation failed',
        issues: result.error.flatten()
      },
      { status: 422 }
    );
  }

  const { purpose, goal, additionalInfo, duration } = result.data;

  try {
    // Get userId from session
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated'
        },
        { status: 401 }
      );
    }
    const userId = session.user.id;

    const template = await prisma.meetingTemplate.create({
      data: {
        userId,
        purpose,
        goal,
        additionalInfo: additionalInfo ?? null,
        duration: duration ?? "30 mins",
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
    });

    return NextResponse.json({
      success: true,
      data: template,
      message: 'Template created successfully'
    });
  } catch (error) {
    console.error("[CREATE_TEMPLATE]", error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Failed to create template'
      },
      { status: 500 }
    );
  }
}
