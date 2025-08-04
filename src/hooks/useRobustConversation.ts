import { useCallback, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  updateOrAddMessage,
  finalizeMessage,
  addConversationSegment,
  updateConversationSegment,
  markMessagesSaved,
  setHasUnsavedChanges,
  setCurrentSpeechSegment,
  MeetSessionState
} from '@/store/slice/meetSessionslice';
import {
  batchSaveMessages,
} from '../app/sessions/[id]/actions_clean';

interface ConversationMessage {
  id: string;
  user?: string;
  other?: string;
  time: string;
  saved: boolean;
  hidden: boolean;
  isPartial?: boolean;
  segment?: number;
}

interface UseRobustConversationProps {
  sessionId: string;
  autoSaveInterval?: number; // milliseconds
  maxMessageLength?: number; // characters before splitting
}

export const useRobustConversation = ({
  sessionId,
  autoSaveInterval = 5000, // 5 seconds
  maxMessageLength = 200
}: UseRobustConversationProps) => {
  const dispatch = useAppDispatch();
  const {
    wholeConversation,
    currentSpeechSegment,
    hasUnsavedChanges,
    autoSaveEnabled
  } = useAppSelector((state) => state.meetSession);

  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentSegmentRef = useRef<string | null>(null);

  // Generate unique message ID
  const generateMessageId = useCallback((type: 'user' | 'other') => {
    return `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Start a new conversation segment (when someone starts speaking)
  const startConversationSegment = useCallback((type: 'user' | 'other', initialContent: string = '') => {
    const segmentId = generateMessageId(type);
    currentSegmentRef.current = segmentId;

    dispatch(addConversationSegment({
      type,
      content: initialContent,
      segmentId
    }));

    return segmentId;
  }, [dispatch, generateMessageId]);

  // Update active conversation segment (for real-time transcription)
  const updateActiveSegment = useCallback((content: string, shouldFinalize: boolean = false) => {
    if (!currentSegmentRef.current) return;

    dispatch(updateConversationSegment({
      id: currentSegmentRef.current,
      content,
      finalize: shouldFinalize
    }));

    if (shouldFinalize) {
      currentSegmentRef.current = null;
    }
  }, [dispatch]);

  // Handle transcript updates with smart segmentation
  const handleTranscriptUpdate = useCallback((
    transcript: string, 
    type: 'user' | 'other',
    isFinal: boolean = false
  ) => {
    if (!transcript.trim()) return;

    // If no active segment, start a new one
    if (!currentSegmentRef.current) {
      const segmentId = startConversationSegment(type, transcript);
      
      if (isFinal) {
        updateActiveSegment(transcript, true);
      }
      return segmentId;
    }

    // Get current segment from state
    const currentSegment = wholeConversation.find(msg => msg.id === currentSegmentRef.current);
    const currentContent = currentSegment ? (currentSegment.user || currentSegment.other || '') : '';

    // Check if we should split into a new segment
    const shouldSplit = currentContent.length + transcript.length > maxMessageLength;

    if (shouldSplit) {
      // Finalize current segment
      updateActiveSegment(currentContent, true);
      
      // Start new segment
      const newSegmentId = startConversationSegment(type, transcript);
      
      if (isFinal) {
        updateActiveSegment(transcript, true);
      }
      
      return newSegmentId;
    } else {
      // Update current segment
      const updatedContent = currentContent + (currentContent ? ' ' : '') + transcript;
      updateActiveSegment(updatedContent, isFinal);
      
      return currentSegmentRef.current;
    }
  }, [startConversationSegment, updateActiveSegment, wholeConversation, maxMessageLength]);

  // Finalize current segment (when speech ends)
  const finalizeCurrentSegment = useCallback(() => {
    if (currentSegmentRef.current) {
      const currentSegment = wholeConversation.find(msg => msg.id === currentSegmentRef.current);
      if (currentSegment) {
        const content = currentSegment.user || currentSegment.other || '';
        updateActiveSegment(content, true);
      }
    }
  }, [updateActiveSegment, wholeConversation]);

  // Add manual message (from user input)
  const addManualMessage = useCallback((content: string, type: 'user' | 'other') => {
    const messageId = generateMessageId(type);
    
    dispatch(updateOrAddMessage({
      id: messageId,
      content,
      type,
      isPartial: false
    }));

    // Finalize immediately since it's manual input
    dispatch(finalizeMessage(messageId));
    
    return messageId;
  }, [dispatch, generateMessageId]);

  // Auto-save unsaved messages
  const autoSave = useCallback(async () => {
    const unsavedMessages = wholeConversation.filter(msg => !msg.saved && !msg.isPartial);
    
    if (unsavedMessages.length === 0) return;

    try {
      console.log(`Auto-saving ${unsavedMessages.length} messages...`);
      
      const result = await batchSaveMessages({
        sessionId,
        unsavedMessages: unsavedMessages
      });

      if ('success' in result && result.success) {
        const savedIds = 'savedMessageIds' in result ? result.savedMessageIds || [] : [];
        const savedCount = 'savedCount' in result ? result.savedCount : 0;
        
        dispatch(markMessagesSaved(savedIds));
        console.log(`Successfully saved ${savedCount} messages`);
      } else if ('failure' in result) {
        console.error('Auto-save failed:', result.failure);
      }
    } catch (error) {
      console.error('Auto-save error:', error);
    }
  }, [wholeConversation, sessionId, dispatch]);

  // Manual save all unsaved messages
  const saveAllMessages = useCallback(async () => {
    const unsavedMessages = wholeConversation.filter(msg => !msg.saved);
    
    if (unsavedMessages.length === 0) {
      return { success: true, savedCount: 0 };
    }

    try {
      const result = await batchSaveMessages({
        sessionId,
        unsavedMessages: unsavedMessages
      });

      if ('success' in result && result.success) {
        const savedIds = 'savedMessageIds' in result ? result.savedMessageIds || [] : [];
        dispatch(markMessagesSaved(savedIds));
      }

      return result;
    } catch (error) {
      console.error('Save all messages error:', error);
      return { failure: 'Failed to save messages' };
    }
  }, [wholeConversation, sessionId, dispatch]);

  // Get conversation statistics
  const getConversationStats = useCallback(() => {
    const total = wholeConversation.length;
    const saved = wholeConversation.filter(msg => msg.saved).length;
    const partial = wholeConversation.filter(msg => msg.isPartial).length;
    const userMessages = wholeConversation.filter(msg => msg.user).length;
    const otherMessages = wholeConversation.filter(msg => msg.other).length;

    return {
      total,
      saved,
      unsaved: total - saved,
      partial,
      userMessages,
      otherMessages,
      hasUnsaved: hasUnsavedChanges
    };
  }, [wholeConversation, hasUnsavedChanges]);

  // Set up auto-save interval
  useEffect(() => {
    if (!autoSaveEnabled) return;

    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
    }

    autoSaveIntervalRef.current = setInterval(autoSave, autoSaveInterval);

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [autoSave, autoSaveInterval, autoSaveEnabled]);

  // Cleanup on unmount - save any remaining messages
  useEffect(() => {
    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
      
      // Force save on unmount if there are unsaved changes
      if (hasUnsavedChanges) {
        autoSave();
      }
    };
  }, [hasUnsavedChanges, autoSave]);

  return {
    // Core conversation data
    wholeConversation,
    currentSpeechSegment,
    hasUnsavedChanges,

    // Conversation actions
    startConversationSegment,
    updateActiveSegment,
    handleTranscriptUpdate,
    finalizeCurrentSegment,
    addManualMessage,

    // Save actions
    saveAllMessages,
    autoSave,

    // Utilities
    getConversationStats,
    generateMessageId,

    // Internal state (for debugging)
    currentSegmentId: currentSegmentRef.current
  };
};
