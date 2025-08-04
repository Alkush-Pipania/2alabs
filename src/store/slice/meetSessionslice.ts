import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";

interface Citation {
  source: string;
  type: string;
  image?: string | null;
  text_preview: string;
}

interface AIResponse {
  id: string;
  query: string;
  result: string;
  citations?: Record<string, Citation>;
  isStreaming: boolean;
  isComplete: boolean;
}

interface ChatMessage {
  id: string;  // Add unique identifier for each message
  user?: string;
  other?: string;
  time: string;
  saved: boolean;
  hidden: boolean;
  isPartial?: boolean;  // For handling partial/interim transcripts
  segment?: number;  // For handling speech segments
}

interface SessionAgent {
  // Define properties according to your data structure
  id: string;
  name: string;
}

export interface MeetSessionState {
  capturePartialTranscript: string;
  chatMessages: ChatMessage[];
  userInput: string;
  microphoneConnected: boolean;
  micStream: MediaStream | null;
  micPartialTranscript: string;
  screenPartialTranscript: string;  // Add screen transcript tracking
  isProcessing: boolean;
  wholeConversation: ChatMessage[];
  pendingMessages: ChatMessage[];  // Messages not yet saved to DB
  currentSpeechSegment: ChatMessage | null;  // Current active speech segment
  hasUnsavedChanges: boolean;  // Track unsaved state
  autoSaveEnabled: boolean;  // Control auto-saving
  lastSaveTimestamp: string | null;  // Track last save
  enableWebSearch: boolean;
  showGraph: boolean;
  stream: MediaStream | null;
  screenConnected: boolean;
  screenStream: MediaStream | null;
  usedCitations: string[];
  copiedText: string;
  useHighlightedText: boolean;
  useRag: boolean;
  graphImage: string | null;
  saveChatCounter: number;
  sessionDetails: Record<string, unknown> | null;
  screenshotImage: string | null;
  isScreenshotMode: boolean;
  sessionAgents: SessionAgent[];
  aiResponses: AIResponse[];  // Store AI answers and their streaming state
  currentAIResponse: AIResponse | null;  // Currently streaming response
  isAIResponseLoading: boolean;  // Loading state for AI requests
}

// AI Answer async thunk
export const sendAIRequest = createAsyncThunk(
  'meetSession/sendAIRequest',
  async (params: {
    conversation: string;
    use_web: boolean;
    requestType?: string;
    useHighlightedText: string;
    copiedText: string;
    sessionId: string;
    useRag: boolean;
  }, { dispatch, rejectWithValue }) => {
    try {
      // Create initial AI response
      const aiResponseId = Date.now().toString();
      const initialResponse: AIResponse = {
        id: aiResponseId,
        query: params.conversation,
        result: '',
        isStreaming: true,
        isComplete: false,
      };
      
      // Dispatch the initial response
      dispatch(setCurrentAIResponse(initialResponse));
      dispatch(setIsAIResponseLoading(true));
      
      const response = await fetch('/api/ai-service', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation: params.conversation,
          use_web: params.use_web,
          requestType: params.requestType || 'AIAnswer',
          useHighlightedText: params.useHighlightedText || '',
          copiedText: params.copiedText,
          sessionId: params.sessionId,
          useRag: params.useRag,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        throw new Error('No response body');
      }

      let buffer = '';
      let finalResult = '';
      let citations: Record<string, Citation> | undefined;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line);
              
              if (data.result !== undefined) {
                finalResult = data.result;
                dispatch(updateAIResponseResult({ id: aiResponseId, result: finalResult }));
              }
              
              if (data.used_citations) {
                citations = data.used_citations;
                dispatch(updateAIResponseCitations({ id: aiResponseId, citations: data.used_citations }));
              }
            } catch (e) {
              console.error('Error parsing JSON:', e, 'Line:', line);
            }
          }
        }
      }

      // Mark as complete
      dispatch(completeAIResponse({ id: aiResponseId, finalResult, citations }));
      dispatch(setIsAIResponseLoading(false));
      
      return {
        id: aiResponseId,
        result: finalResult,
        citations,
      };
    } catch (error) {
      dispatch(setIsAIResponseLoading(false));
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

const initialState: MeetSessionState = {
  capturePartialTranscript: "",
  chatMessages: [],
  userInput: "",
  microphoneConnected: false,
  micStream: null,
  micPartialTranscript: "",
  screenPartialTranscript: "",
  isProcessing: false,
  wholeConversation: [],
  pendingMessages: [],
  currentSpeechSegment: null,
  hasUnsavedChanges: false,
  autoSaveEnabled: true,
  lastSaveTimestamp: null,
  enableWebSearch: true,
  screenConnected: false,
  screenStream: null,
  showGraph: false,
  stream: null,
  usedCitations: [],
  copiedText: "",
  useHighlightedText: false,
  useRag: false,
  graphImage: null,
  saveChatCounter: 0,
  sessionDetails: null,
  screenshotImage: null,
  isScreenshotMode: false,
  sessionAgents: [],
  aiResponses: [],
  currentAIResponse: null,
  isAIResponseLoading: false,
};

const meetSessionSlice = createSlice({
  name: "meetSession",
  initialState,
  reducers: {
    setCapturePartialTranscript(state, action: PayloadAction<string>) {
      state.capturePartialTranscript = action.payload;
    },
    setChatMessages(state, action: PayloadAction<ChatMessage[]>) {
      state.chatMessages = action.payload;
    },
    addChatMessage(state, action: PayloadAction<ChatMessage>) {
      state.chatMessages.push(action.payload);
    },
    setUserInput(state, action: PayloadAction<string>) {
      state.userInput = action.payload;
    },
    setMicrophoneConnected(state, action: PayloadAction<boolean>) {
      state.microphoneConnected = action.payload;
    },
    setMicStream(state, action: PayloadAction<MediaStream | null>) {
      state.micStream = action.payload;
    },
    setMicPartialTranscript(state, action: PayloadAction<string>) {
      state.micPartialTranscript = action.payload;
    },
    setIsProcessing(state, action: PayloadAction<boolean>) {
      state.isProcessing = action.payload;
    },
    setWholeConversation(state, action: PayloadAction<ChatMessage[]>) {
      state.wholeConversation = action.payload;
    },
    setEnableWebSearch(state, action: PayloadAction<boolean>) {
      state.enableWebSearch = action.payload;
    },
    setShowGraph(state, action: PayloadAction<boolean>) {
      state.showGraph = action.payload;
    },
    setStream(state, action: PayloadAction<MediaStream | null>) {
      state.stream = action.payload;
    },
    setUsedCitations(state, action: PayloadAction<string[]>) {
      state.usedCitations = action.payload;
    },
    setCopiedText(state, action: PayloadAction<string>) {
      state.copiedText = action.payload;
    },
    setUseHighlightedText(state, action: PayloadAction<boolean>) {
      state.useHighlightedText = action.payload;
    },
    setUseRag(state, action: PayloadAction<boolean>) {
      state.useRag = action.payload;
    },
    setGraphImage(state, action: PayloadAction<string | null>) {
      state.graphImage = action.payload;
    },
    incrementSaveChatCounter(state) {
      state.saveChatCounter += 1;
    },
    setSaveChatCounter(state, action: PayloadAction<number>) {
      state.saveChatCounter = action.payload;
    },
    setSessionDetails(state, action: PayloadAction<Record<string, unknown> | null>) {
      state.sessionDetails = action.payload;
    },
    setScreenshotImage(state, action: PayloadAction<string | null>) {
      state.screenshotImage = action.payload;
    },
    setIsScreenshotMode(state, action: PayloadAction<boolean>) {
      state.isScreenshotMode = action.payload;
    },
    setSessionAgents(state, action: PayloadAction<SessionAgent[]>) {
      state.sessionAgents = action.payload;
    },
    addSessionAgent(state, action: PayloadAction<SessionAgent>) {
      state.sessionAgents.push(action.payload);
    },
    setScreenConnected(state, action: PayloadAction<boolean>) {
      state.screenConnected = action.payload;
    },
    setScreenStream(state, action: PayloadAction<MediaStream | null>) {
      state.screenStream = action.payload;
    },
    // Enhanced conversation management reducers
    setScreenPartialTranscript(state, action: PayloadAction<string>) {
      state.screenPartialTranscript = action.payload;
    },
    addPendingMessage(state, action: PayloadAction<ChatMessage>) {
      state.pendingMessages.push(action.payload);
      state.hasUnsavedChanges = true;
    },
    updateOrAddMessage(state, action: PayloadAction<{ id: string; content: string; type: 'user' | 'other'; isPartial?: boolean }>) {
      const { id, content, type, isPartial = false } = action.payload;
      const timestamp = new Date().toISOString();
      
      // Find existing message in wholeConversation
      const existingIndex = state.wholeConversation.findIndex(msg => msg.id === id);
      
      if (existingIndex !== -1) {
        // Update existing message
        state.wholeConversation[existingIndex] = {
          ...state.wholeConversation[existingIndex],
          [type]: content,
          time: timestamp,
          isPartial,
          saved: false
        };
      } else {
        // Add new message
        const newMessage: ChatMessage = {
          id,
          [type]: content,
          time: timestamp,
          saved: false,
          hidden: false,
          isPartial
        };
        state.wholeConversation.push(newMessage);
      }
      
      state.hasUnsavedChanges = true;
    },
    finalizeMessage(state, action: PayloadAction<string>) {
      const messageId = action.payload;
      const message = state.wholeConversation.find(msg => msg.id === messageId);
      if (message) {
        message.isPartial = false;
        state.hasUnsavedChanges = true;
      }
    },
    setCurrentSpeechSegment(state, action: PayloadAction<ChatMessage | null>) {
      state.currentSpeechSegment = action.payload;
    },
    markMessagesSaved(state, action: PayloadAction<string[]>) {
      const savedIds = action.payload;
      state.wholeConversation.forEach(msg => {
        if (savedIds.includes(msg.id)) {
          msg.saved = true;
        }
      });
      
      // Check if all messages are saved
      const hasUnsaved = state.wholeConversation.some(msg => !msg.saved);
      state.hasUnsavedChanges = hasUnsaved;
      
      if (!hasUnsaved) {
        state.lastSaveTimestamp = new Date().toISOString();
      }
    },
    setAutoSaveEnabled(state, action: PayloadAction<boolean>) {
      state.autoSaveEnabled = action.payload;
    },
    setHasUnsavedChanges(state, action: PayloadAction<boolean>) {
      state.hasUnsavedChanges = action.payload;
    },
    clearPendingMessages(state) {
      state.pendingMessages = [];
    },
    addConversationSegment(state, action: PayloadAction<{ type: 'user' | 'other'; content: string; segmentId?: string }>) {
      const { type, content, segmentId } = action.payload;
      const timestamp = new Date().toISOString();
      const id = segmentId || `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newMessage: ChatMessage = {
        id,
        [type]: content,
        time: timestamp,
        saved: false,
        hidden: false,
        isPartial: true
      };
      
      state.wholeConversation.push(newMessage);
      state.currentSpeechSegment = newMessage;
      state.hasUnsavedChanges = true;
    },
    updateConversationSegment(state, action: PayloadAction<{ id: string; content: string; finalize?: boolean }>) {
      const { id, content, finalize = false } = action.payload;
      
      // Find and update the specific segment
      const messageIndex = state.wholeConversation.findIndex(msg => msg.id === id);
      if (messageIndex !== -1) {
        state.wholeConversation[messageIndex] = {
          ...state.wholeConversation[messageIndex],
          user: state.wholeConversation[messageIndex].user ? content : state.wholeConversation[messageIndex].user,
          other: state.wholeConversation[messageIndex].other ? content : state.wholeConversation[messageIndex].other,
          isPartial: !finalize,
          saved: false
        };
        
        // If finalizing, mark as unsaved changes
        if (finalize) {
          state.hasUnsavedChanges = true;
          // Add to pending if not already there
          const pendingIndex = state.pendingMessages.findIndex(msg => msg.id === id);
          if (pendingIndex === -1) {
            state.pendingMessages.push(state.wholeConversation[messageIndex]);
          }
        }
      }
    },
    // AI Response reducers
    setCurrentAIResponse(state, action: PayloadAction<AIResponse | null>) {
      state.currentAIResponse = action.payload;
    },
    setIsAIResponseLoading(state, action: PayloadAction<boolean>) {
      state.isAIResponseLoading = action.payload;
    },
    updateAIResponseResult(state, action: PayloadAction<{ id: string; result: string }>) {
      if (state.currentAIResponse && state.currentAIResponse.id === action.payload.id) {
        state.currentAIResponse.result = action.payload.result;
      }
    },
    updateAIResponseCitations(state, action: PayloadAction<{ id: string; citations: Record<string, Citation> }>) {
      if (state.currentAIResponse && state.currentAIResponse.id === action.payload.id) {
        state.currentAIResponse.citations = action.payload.citations;
      }
    },
    completeAIResponse(state, action: PayloadAction<{ id: string; finalResult: string; citations?: Record<string, Citation> }>) {
      const { id, finalResult, citations } = action.payload;
      
      if (state.currentAIResponse && state.currentAIResponse.id === id) {
        // Mark current response as complete
        state.currentAIResponse.isStreaming = false;
        state.currentAIResponse.isComplete = true;
        state.currentAIResponse.result = finalResult;
        if (citations) {
          state.currentAIResponse.citations = citations;
        }
        
        // Add to responses history
        state.aiResponses.push({ ...state.currentAIResponse });
        
        // Clear current response
        state.currentAIResponse = null;
      }
    },
    clearAIResponses(state) {
      state.aiResponses = [];
      state.currentAIResponse = null;
      state.isAIResponseLoading = false;
    },
  },
});

export const {
  setCapturePartialTranscript,
  setChatMessages,
  addChatMessage,
  setUserInput,
  setMicrophoneConnected,
  setMicStream,
  setMicPartialTranscript,
  setIsProcessing,
  setWholeConversation,
  setEnableWebSearch,
  setShowGraph,
  setStream,
  setScreenConnected,
  setScreenStream,
  setUsedCitations,
  setCopiedText,
  setUseHighlightedText,
  setUseRag,
  setGraphImage,
  incrementSaveChatCounter,
  setSaveChatCounter,
  setSessionDetails,
  setScreenshotImage,
  setIsScreenshotMode,
  setSessionAgents,
  addSessionAgent,
  // Enhanced conversation management actions
  setScreenPartialTranscript,
  addPendingMessage,
  updateOrAddMessage,
  finalizeMessage,
  setCurrentSpeechSegment,
  markMessagesSaved,
  setAutoSaveEnabled,
  setHasUnsavedChanges,
  clearPendingMessages,
  addConversationSegment,
  updateConversationSegment,
  // AI Response actions
  setCurrentAIResponse,
  setIsAIResponseLoading,
  updateAIResponseResult,
  updateAIResponseCitations,
  completeAIResponse,
  clearAIResponses,
} = meetSessionSlice.actions;

export default meetSessionSlice.reducer;
