import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";


export async function GET(request: Request) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session || !session.user.id) {
        return Response.json(
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
        const documents = await prisma.document.findMany({
            where: { userId },
            select: {
                id: true,
                fileUrl: true,
                fileName: true,
                uploadedAt: true,
                mimeType: true,
                fileSize: true,
                title: true,
                description: true,
                isEmbedded: true,
            },
            orderBy: { uploadedAt: 'desc' },
        });

        const serializedDocs = documents.map((doc) => ({
            ...doc,
            fileSize: Number(doc.fileSize),
            uploadedAt: doc.uploadedAt.toISOString(),
        }));

        return Response.json({
            success: true,
            data: serializedDocs,
            message: 'Documents retrieved successfully',
        });
    } catch (err) {
        console.error('Error fetching documents:', err);
        return Response.json(
            {
                success: false,
                error: err instanceof Error ? err.message : 'Unknown error occurred',
                message: 'Failed to fetch documents',
            },
            { status: 500 },
        );
    }
}