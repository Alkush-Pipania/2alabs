import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/db";

interface CreateSessionBody {
  name: string;
  description?: string;
  templateId?: string;
  documentIds?: string[];
}

export async function POST(request: Request) {
  // 1. Auth check
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user.id) {
    return Response.json(
      {
        success: false,
        error: "Unauthorized",
        message: "User not authenticated",
      },
      { status: 401 }
    );
  }

  // 2. Parse & validate body
  let body: CreateSessionBody;
  try {
    body = await request.json();
  } catch (e) {
    return Response.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  if (!body.name || typeof body.name !== "string") {
    return Response.json(
      { success: false, error: "'name' is required" },
      { status: 400 }
    );
  }

  // 3. Create AppSession record
  try {
    const newSession = await prisma.appSession.create({
      data: {
        userId: session.user.id,
        name: body.name,
        description: body.description ?? null,
        templateId: body.templateId ?? null,
        // connect selected documents if supplied
        documents: body.documentIds && body.documentIds.length > 0 ? {
          connect: body.documentIds.map((id) => ({ id })),
        } : undefined,
      },
      include: {
        documents: true,
        template: true,
      },
    });

    // Convert BigInt values to string to avoid JSON serialization errors
    const safeData = JSON.parse(
      JSON.stringify(newSession, (_k, v) => (typeof v === "bigint" ? v.toString() : v))
    );

    return Response.json({ success: true, data: safeData }, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create session", error);
    return Response.json(
      {
        success: false,
        error: "INTERNAL_ERROR",
        message: "Failed to create session",
      },
      { status: 500 }
    );
  }
}