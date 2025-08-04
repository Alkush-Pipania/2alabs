import { auth } from "@/lib/auth";
import { BlobServiceClient } from "@azure/storage-blob";
import prisma from "@/lib/db";
import { headers } from "next/headers";
import { NextRequest } from "next/server";


export async function DELETE(request: NextRequest) {
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

       try{
        const body = await request.json();
        const documentId = body.documentId;

        // Find the document first to get fileUrl
        const existingDoc = await prisma.document.findFirst({ where: { id: documentId, userId } });
        if (!existingDoc) {
            return Response.json({ success: false, error: 'Document not found', message: 'Document not found' }, { status: 404 });
        }

        // Call backend to delete embeddings
        const backendUrl = process.env.BACKEND_URL;
        try {
            await fetch(`${backendUrl}/delete_embeddings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-backend-secret': process.env.BACKEND_SECRET ?? '',
                },
                body: JSON.stringify({ pdf_url: existingDoc.fileUrl, userId }),
            });
        } catch (err) {
            console.error('Failed to delete embeddings:', err);
        }

        // TODO: Optionally delete blob file from Azure storage here (skipped)

        const document = await prisma.document.delete({
            where: { 
                id: documentId,
                userId
             },
        });

        if (!document) {
            return Response.json(
                {
                    success: false,
                    error: 'Document not found',
                    message: 'Document not found',
                },
                { status: 404 },
            );
        }

        return Response.json(
            {
                success: true,
                message: 'Document deleted successfully',
            },
            { status: 200 },
        );

       }catch(error){
        return Response.json(
            {
                success: false,
                error: 'Internal Server Error',
                message: 'Failed to delete document',
            },
            { status: 500 },
        );
       }

}
    