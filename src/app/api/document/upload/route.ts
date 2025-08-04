import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest } from "next/server";



export async function POST(request: NextRequest) {
    try {
        // Check authentication
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
                { status: 401 }
            );
        }

        const userId = session.user.id;

        // Parse form data
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;

        // Validate required fields
        if (!file) {
            return Response.json(
                {
                    success: false,
                    error: 'File is required',
                    message: 'Please select a file to upload',
                },
                { status: 400 }
            );
        }

        if (!title?.trim()) {
            return Response.json(
                {
                    success: false,
                    error: 'Title is required',
                    message: 'Please provide a title for the document',
                },
                { status: 400 }
            );
        }

        // Validate file type (only PDF and PowerPoint)
        const allowedMimeTypes = [
            'application/pdf',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        ];
        
        if (!allowedMimeTypes.includes(file.type)) {
            return Response.json(
                {
                    success: false,
                    error: 'Invalid file type',
                    message: 'Only PDF and PowerPoint files are allowed',
                },
                { status: 400 }
            );
        }

        // Validate file size (10MB limit)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return Response.json(
                {
                    success: false,
                    error: 'File too large',
                    message: 'File size must be less than 10MB',
                },
                { status: 400 }
            );
        }

                // Upload to Azure Blob Storage
        const sasUrl = process.env.BlobserviceSASURL;
        const containerName = process.env.DOCUMENT_CONTAINER;

        if (!sasUrl || !containerName) {
            return Response.json(
                {
                    success: false,
                    error: 'Storage configuration missing',
                    message: 'BlobserviceSASURL or DOCUMENT_CONTAINER env vars are not set',
                },
                { status: 500 }
            );
        }

        // Dynamically import to keep edge bundle small if using edge runtime
        const { BlobServiceClient } = await import("@azure/storage-blob");

        const blobServiceClient = new BlobServiceClient(sasUrl);
        const containerClient = blobServiceClient.getContainerClient(containerName);

        const blobName = `${Date.now()}-${file.name}`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        // Convert file to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload with correct content-type
        await blockBlobClient.uploadData(buffer, {
            blobHTTPHeaders: {
                blobContentType: file.type || "application/octet-stream",
            },
        });

        const fileUrl = blockBlobClient.url;
        
        // Save document to database
        const document = await prisma.document.create({
            data: {
                userId,
                fileUrl, // have to update it with website url
                awsFileUrl:fileUrl,
                fileName: file.name,
                title: title.trim(),
                description: description?.trim() || null,
                fileSize: BigInt(file.size),
                mimeType: file.type || null,
                isEmbedded: false, // Will be processed later
            },
        });

        // Trigger embeddings generation in backend
        const backendUrl = process.env.BACKEND_URL;
            try {
                const embedRes = await fetch(`${backendUrl}/add_embeddings`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-backend-secret': process.env.BACKEND_SECRET ?? '',
                    },
                    body: JSON.stringify({ fileUrl, userId }),
                });

                if (!embedRes.ok) {
                    console.error('Failed to trigger embeddings:', await embedRes.text());
                }
            } catch (err) {
                console.error('Error calling backend /add_embeddings:', err);
            }
            await prisma.document.update({
                where: { id: document.id },
                data: { isEmbedded: true },
            });

        return Response.json({
            success: true,
            data: {
                id: document.id,
                fileName: document.fileName,
                title: document.title,
                fileSize: Number(document.fileSize),
                mimeType: document.mimeType,
                uploadedAt: document.uploadedAt.toISOString(),
            },
            message: 'Document uploaded successfully',
        });

    } catch (error) {
        console.error('Error uploading document:', error);
        return Response.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
                message: 'Failed to upload document',
            },
            { status: 500 }
        );
    }
}