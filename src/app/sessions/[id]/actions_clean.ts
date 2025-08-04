"use server"

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";

// Helper function to get authenticated session
async function getAuthenticatedSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user.id) {
    return { error: "User not authenticated" };
  }

  return { session, userId: session.user.id };
}

interface ConversationMessage {
  id: string;
  user?: string;
  other?: string;
  time?: string;
  timestamp?: string;
  saved?: boolean;
  hidden?: boolean;
  isPartial?: boolean;
  segment?: number;
  [key: string]: any; // Index signature for Prisma Json compatibility
}

// Validate session and get user permissions
export async function validateUserSession(sessionId: string) {
  const authResult = await getAuthenticatedSession();
  
  if ('error' in authResult) {
    return { failure: authResult.error };
  }

  const { userId } = authResult;

  // Find the session and verify ownership
  const session = await prisma.appSession.findFirst({
    where: {
      id: sessionId,
      userId: userId,
    },
    select: {
      id: true,
      userId: true,
      conversation: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!session) {
    return { failure: "Session not found or access denied" };
  }

  return {
    success: true,
    session: session,
    userId: userId,
  };
}

// Enhanced conversation appending with robust message handling
export async function appendConversation({ 
  sessionId, 
  newMessages 
}: { 
  sessionId: string; 
  newMessages: ConversationMessage[] 
}) {
  const validation = await validateUserSession(sessionId);
  
  if ('failure' in validation) {
    return { failure: validation.failure };
  }

  const { session } = validation;
  
  try {
    // Parse existing conversation or initialize empty array
    let existingConversation: ConversationMessage[] = [];
    if (session.conversation && Array.isArray(session.conversation)) {
      existingConversation = session.conversation as unknown as ConversationMessage[];
    }
    
    // Process new messages with intelligent update/append logic
    const updatedConversation = [...existingConversation];
    
    newMessages.forEach((newMsg) => {
      const existingIndex = updatedConversation.findIndex(
        (msg) => msg.id === newMsg.id && 
                (msg.user === newMsg.user || msg.other === newMsg.other)
      );
      
      if (existingIndex !== -1) {
        // Update existing message
        updatedConversation[existingIndex] = {
          ...updatedConversation[existingIndex],
          ...newMsg,
          segment: newMsg.segment || updatedConversation[existingIndex].segment,
          timestamp: newMsg.timestamp || updatedConversation[existingIndex].timestamp,
        };
      } else {
        // Add new message
        updatedConversation.push({
          ...newMsg,
          timestamp: newMsg.timestamp || new Date().toISOString(),
        });
      }
    });
    
    // Update session with new conversation
    // const updatedSession = await prisma.appSession.update({
    //   where: { id: sessionId },
    //   data: {
    //     conversation: updatedConversation as any,
    //     updatedAt: new Date(),
    //   },
    //   select: {
    //     id: true,
    //     conversation: true,
    //     updatedAt: true,
    //   },
    // });

    return {
      success: true,
      savedMessages: newMessages,
      savedCount: newMessages.length,
      conversationLength: updatedConversation.length,
    };
  } catch (error) {
    console.error('Error appending conversation:', error);
    return { failure: "Failed to save conversation" };
  }
}

// Batch save multiple unsaved messages
export async function batchSaveMessages({
  sessionId,
  unsavedMessages,
}: {
  sessionId: string;
  unsavedMessages: ConversationMessage[];
}) {
  const sessionValidation = await validateUserSession(sessionId);

  if ('failure' in sessionValidation) {
    return { failure: sessionValidation.failure };
  }

  try {
    // Save messages using appendConversation
    const result = await appendConversation({
      sessionId,
      newMessages: unsavedMessages,
    });

    if ('success' in result && result.success) {
      return {
        success: true,
        savedCount: unsavedMessages.length,
        savedMessageIds: result.savedMessages?.map(msg => msg.id) || [],
        conversationLength: result.conversationLength
      };
    } else {
      return result;
    }
  } catch (error) {
    console.error("Error batch saving messages:", error);
    return { failure: "Failed to save messages" };
  }
}

// Update a specific conversation message
export async function updateConversationMessage({
  sessionId,
  messageUpdate,
}: {
  sessionId: string;
  messageUpdate: ConversationMessage;
}) {
  const sessionValidation = await validateUserSession(sessionId);

  if ('failure' in sessionValidation) {
    return { failure: sessionValidation.failure };
  }

  try {
    const conversation = (sessionValidation.session.conversation as unknown as ConversationMessage[]) || [];
    const messageIndex = conversation.findIndex((msg: any) => msg.id === messageUpdate.id);

    if (messageIndex === -1) {
      return { failure: "Message not found" };
    }

    // Update the message
    conversation[messageIndex] = {
      ...conversation[messageIndex],
      ...messageUpdate,
    };

    // Save to database
    await prisma.appSession.update({
      where: { id: sessionId },
      data: { conversation: conversation as any },
    });

    return {
      success: true,
      updatedMessage: conversation[messageIndex],
    };
  } catch (error) {
    console.error("Error updating message:", error);
    return { failure: "Failed to update message" };
  }
}

// Retrieve conversation with optional filters
export async function getConversation({
  sessionId,
  includePartial = false,
  includeHidden = false,
}: {
  sessionId: string;
  includePartial?: boolean;
  includeHidden?: boolean;
}) {
  const sessionValidation = await validateUserSession(sessionId);

  if ('failure' in sessionValidation) {
    return { failure: sessionValidation.failure };
  }

  try {
    let conversation = (sessionValidation.session.conversation as unknown as ConversationMessage[]) || [];

    // Apply filters
    if (!includePartial) {
      conversation = conversation.filter((msg: ConversationMessage) => !msg.isPartial);
    }

    if (!includeHidden) {
      conversation = conversation.filter((msg: ConversationMessage) => !msg.hidden);
    }

    return {
      success: true,
      conversation: conversation,
      messageCount: conversation.length,
    };
  } catch (error) {
    console.error("Error retrieving conversation:", error);
    return { failure: "Failed to retrieve conversation" };
  }
}
