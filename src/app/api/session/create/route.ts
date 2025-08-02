import { auth } from "@/lib/auth";
import { headers } from "next/headers";


export async function POST(request : Request){
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if(!session || !session.user.id){
        return Response.json({
            success: false,
            error: 'Unauthorized',
            message: 'User not authenticated'
        }, { status: 401 });
    }
    const body = await request.json();
    const userId = session.user.id;

}