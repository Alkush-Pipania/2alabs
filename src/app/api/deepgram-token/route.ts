import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@deepgram/sdk';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import prisma from '@/lib/db';

type KeyType = 'microphone' | 'capturescreen';
type KeyFieldName = 'microphoneDeepgramKey' | 'capturescreenDeepgramKey';

interface RequestBody {
  sessionId: string;
  keyType: KeyType;
}

interface ErrorResponse {
  error: string;
  details?: string;
}

interface SuccessResponse {
  token: string;
}

// Environment validation
const validateEnvironment = () => {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  const projectId = process.env.DEEPGRAM_PROJECT_ID;
  
  if (!apiKey || !projectId) {
    const missing = [];
    if (!apiKey) missing.push('DEEPGRAM_API_KEY');
    if (!projectId) missing.push('DEEPGRAM_PROJECT_ID');
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
  
  return { apiKey, projectId };
};

// Get key field name based on type
const getKeyFieldName = (keyType: KeyType): KeyFieldName => 
  keyType === 'microphone' ? 'microphoneDeepgramKey' : 'capturescreenDeepgramKey';

export async function POST(request: NextRequest): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  try {
    // Authentication
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body: RequestBody = await request.json();
    const { sessionId, keyType } = body;
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' }, 
        { status: 400 }
      );
    }

    if (!keyType || !['microphone', 'capturescreen'].includes(keyType)) {
      return NextResponse.json(
        { error: 'Valid keyType (microphone or capturescreen) is required' }, 
        { status: 400 }
      );
    }

    const keyFieldName = getKeyFieldName(keyType);
    
    // Single database query to get user and verify session ownership
    const user = await prisma.user.findFirst({
      where: {
        id: session.user.id,
        appSessions: {
          some: {
            id: sessionId
          }
        }
      },
      select: {
        id: true,
        email: true,
        microphoneDeepgramKey: true,
        capturescreenDeepgramKey: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User or session not found' }, 
        { status: 404 }
      );
    }

    // Return existing key if available
    const existingKey = user[keyFieldName] as string;
    if (existingKey) {
      return NextResponse.json({ token: existingKey });
    }

    // Validate environment and create new key
    const { apiKey, projectId } = validateEnvironment();
    const deepgram = createClient(apiKey);

    const { result: apiKeyResult, error: keyError } = await deepgram.manage.createProjectKey(
      projectId,
      {
        comment: `${keyType}-key-${user.email}`,
        scopes: ['usage:write']
      }
    );
    console.log(apiKeyResult)
    console.log(keyError)
    if (keyError || !apiKeyResult) {
      console.error('Deepgram key creation failed:', keyError);
      return NextResponse.json(
        { 
          error: 'Failed to create Deepgram key',
          details: keyError?.message || 'No key returned'
        },
        { status: 500 }
      );
    }

    // Extract the actual key string from the response
    const keyString = apiKeyResult.key as string;
    
    if (!keyString) {
      console.error('No key found in Deepgram response:', apiKeyResult);
      return NextResponse.json(
        { 
          error: 'Failed to extract key from Deepgram response',
          details: 'Key field is missing or empty'
        },
        { status: 500 }
      );
    }

    // Save new key to database
    await prisma.user.update({
      where: { id: user.id },
      data: { [keyFieldName]: keyString }
    });

    return NextResponse.json({ token: keyString });

  } catch (error) {
    console.error('Deepgram token route error:', error);
    
    // Handle specific error types
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    if (error instanceof Error && error.message.includes('Missing environment')) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}