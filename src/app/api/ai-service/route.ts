import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { isAction } from "@reduxjs/toolkit";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

const endpoints = {
    factcheck: "/AI-Fact-Check",
    summary: "/AI-Summary",
    AIAnswer: "/AI-Answer",
    fiveyearold: "/explain-like-5-year-old",
    createactionplan: "/create-action-plan",
};

export async function POST(request: Request) {
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

            const body = await request.json();
            const { conversation, use_web, requestType = "AIAnswer", useHighlightedText, copiedText, sessionId,useRag } = body;

    try{
        const AppSession = await prisma.appSession.findFirst({
            where:{
                userId ,
                isActive : true,
                id : sessionId
            },
            select:{
                documents : true,
                template : true,
            }
        })
        if(!AppSession){
            return Response.json(
                {
                    success: false,
                    error: 'Session not found',
                    message: 'Session not found',
                },
                { status: 404 },
            );
        }

        const template = AppSession.template;

        let payload = {
            raw_conversation: conversation,
            use_web: use_web ?? true,
            userId,
            useHighlightedText,
            highlightedText: copiedText,
            meetingTemplate: JSON.stringify(template),
            useRag:useRag,
            documents: AppSession.documents.map(doc => doc.fileUrl)
        };

        const response = await fetch(`${process.env.BACKEND_URL}${endpoints[requestType as keyof typeof endpoints]}`, {
              method: "POST",
              headers: { 
                "Content-Type": "application/json",
                "BACKEND-SECRET": process.env.BACKEND_SECRET || ''
              },
              body: JSON.stringify(payload),
            });
        
            if (!response.body) {
                return NextResponse.json({ error: 'No response body' }, { status: 500 });
            }
        
        const encoder = new TextEncoder();
            const readableStream = new ReadableStream({
                async start(controller) {
                    const reader = response.body?.getReader();
                    while (true) {
                        const { done, value } = await reader?.read();
                        if (done) break;
                        controller.enqueue(value);
                    }
                    controller.close();
                }
            });
          
            return new NextResponse(readableStream, {
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache',
                },
            });
       

    }
    catch(error){
        console.error("BACKEND API error:", error);
        return NextResponse.json({ failure: "An error occurred while processing the request." }, { status: 500 });
    }
}