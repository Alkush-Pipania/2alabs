import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

const updateSchema = z.object({
  id: z.string().uuid(),
  purpose: z.string().min(1).optional(),
  goal: z.string().min(1).optional(),
  additionalInfo: z.string().optional().nullable(),
  duration: z.string().optional(),
});

// PUT /api/templates/update
export async function PUT(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid JSON body',
        message: 'Request body could not be parsed',
      },
      { status: 400 },
    );
  }

  const result = updateSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      {
        success: false,
        error: 'Validation failed',
        issues: result.error.flatten(),
      },
      { status: 422 },
    );
  }

  const { id, ...data } = result.data;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !session.user.id) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized',
        message: 'User not authenticated',
      },
      { status: 401 },
    );
  }
  const userId = session.user.id;

  try {
    const updated = await prisma.meetingTemplate.updateMany({
      where: { id, userId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    if (updated.count === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Template not found',
        },
        { status: 404 },
      );
    }

    const template = await prisma.meetingTemplate.findUnique({
      where: { id },
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
      message: 'Template updated successfully',
    });
  } catch (error) {
    console.error('[UPDATE_TEMPLATE]', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Failed to update template',
      },
      { status: 500 },
    );
  }
}
