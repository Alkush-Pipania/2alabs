"use client"

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mic, MicOff, ScrollText, ScreenShareOff, MonitorSmartphone, StopCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setMicrophoneConnected,
  setMicStream,
  setWholeConversation,
  setScreenStream,
  setScreenConnected,
  setScreenPartialTranscript,
  setMicPartialTranscript,
  MeetSessionState,
} from "@/store/slice/meetSessionslice";
import { useRobustConversation } from "@/hooks/useRobustConversation";

// Toast functionality - create a simple toast implementation if the hook doesn't exist
const useToast = () => {
  const toast = ({ title, description, variant }: { title: string; description: string; variant?: string }) => {
    console.log(`Toast ${variant || 'info'}: ${title} - ${description}`);
    // You can implement actual toast display here
    alert(`${title}: ${description}`);
  };
  return { toast };
};

interface LeftSectionProps {
  isConnected: boolean
  setIsConnected: (connected: boolean) => void
  isMicConnected: boolean
  setIsMicConnected: (connected: boolean) => void
}

export default function LeftSection({
  isConnected,
  setIsConnected,
  isMicConnected,
  setIsMicConnected,
}: LeftSectionProps) {
  const [autoScroll, setAutoScroll] = useState(true)

  const videoRef = useRef<HTMLVideoElement>(null)
  const conversationEndRef = useRef<HTMLDivElement>(null)

  const dispatch = useAppDispatch();
  const { 
    microphoneConnected, 
    micStream, 
    wholeConversation, 
    screenConnected, 
    screenStream,
    micPartialTranscript,
    screenPartialTranscript
  } = useAppSelector(
    (state) => state.meetSession
  );

  const { toast } = useToast();

  const [isConnectingMic, setIsConnectingMic] = useState(false);
  const [isConnectingScreen, setIsConnectingScreen] = useState(false);
  const params = useParams();
  const sessionId = (params as { id?: string }).id;

  // Enhanced conversation management
  const {
    handleTranscriptUpdate,
    finalizeCurrentSegment,
    addManualMessage,
    saveAllMessages,
    getConversationStats,
    hasUnsavedChanges,
    currentSegmentId
  } = useRobustConversation({
    sessionId: sessionId || '',
    autoSaveInterval: 5000,
    maxMessageLength: 200
  });

  // Track current active segments for different input sources
  const micSegmentRef = useRef<string | null>(null);
  const screenSegmentRef = useRef<string | null>(null);

  // Auto-scroll effect
  useEffect(() => {
    if (autoScroll && conversationEndRef.current) {
      conversationEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [wholeConversation, autoScroll]);

  // Keep local props in sync with redux state
  useEffect(() => {
    setIsMicConnected(microphoneConnected);
  }, [microphoneConnected, setIsMicConnected]);

  useEffect(() => {
    setIsConnected(screenConnected);
  }, [screenConnected, setIsConnected]);

  /* ------------------ Enhanced Microphone + Deepgram Integration ------------------ */
  let socket: WebSocket | null = null;
  let screenSocket: WebSocket | null = null;
  let screenController: any = null;
  let keepAliveInterval: NodeJS.Timeout | null = null;
  let screenKeepAliveInterval: NodeJS.Timeout | null = null;  // Use any for now since CaptureController might not be available
  let micRecorder: MediaRecorder | null = null;
  let screenRecorder: MediaRecorder | null = null;

  const fetchDeepgramToken = async (keyType: "microphone" | "capturescreen" = "microphone"): Promise<string> => {
    try {
      if (!sessionId) {
        throw new Error('Session ID is not available');
      }
      
      console.log(`Fetching Deepgram token for sessionId: ${sessionId}, keyType: ${keyType}`);
      const response = await fetch("/api/deepgram-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          keyType,
        }),
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to fetch Deepgram token: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Token response data:', data);
      return data.token?.key || data.token;
    } catch (error) {
      console.error('Fetch error details:', error);
      throw error;
    }
  };

  const openWebSocket = async (keyType: "microphone" | "capturescreen" = "microphone") => {
    const token = await fetchDeepgramToken(keyType);
    const url =
      "wss://api.deepgram.com/v1/listen?model=nova-3&language=en&smart_format=true&punctuate=true&keep_alive=true&timeout=120000&endpointing=500";
    
    const currentSocket = keyType === "capturescreen" ? 
      screenSocket = new WebSocket(url, ["token", token]) : 
      socket = new WebSocket(url, ["token", token]);

    currentSocket.onopen = () => {
      console.log(`Connected to Deepgram for ${keyType}`);
      
      // Start keep-alive heartbeat to prevent timeout
      const interval = setInterval(() => {
        if (currentSocket && currentSocket.readyState === WebSocket.OPEN) {
          currentSocket.send(JSON.stringify({ type: 'KeepAlive' }));
          console.log(`Keep-alive sent for ${keyType}`);
        } else {
          clearInterval(interval);
        }
      }, 30000); // Send keep-alive every 30 seconds
      
      if (keyType === "capturescreen") {
        screenKeepAliveInterval = interval;
      } else {
        keepAliveInterval = interval;
      }
    };

    currentSocket.onerror = (error) => {
      console.error(`WebSocket error for ${keyType}`, error);
      if (keyType === "capturescreen") {
        screenSocket = null;
      } else {
        socket = null;
      }
    };

    currentSocket.onclose = (event) => {
      console.log(`WebSocket closed for ${keyType}:`, event.code, event.reason);
      
      // Clear keep-alive intervals
      if (keyType === "capturescreen") {
        if (screenKeepAliveInterval) {
          clearInterval(screenKeepAliveInterval);
          screenKeepAliveInterval = null;
        }
        if (screenStream) {
          screenStream.getTracks().forEach((track) => track.stop());
          dispatch(setScreenStream(null));
        }
        dispatch(setScreenConnected(false));
        screenSocket = null;
        screenController = null;
      } else {
        if (keepAliveInterval) {
          clearInterval(keepAliveInterval);
          keepAliveInterval = null;
        }
      }
    };

    currentSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const transcript = data?.channel?.alternatives?.[0]?.transcript;
        const isFinal = data?.is_final || false;
        const speechFinal = data?.type === 'SpeechFinal';
        
        if (transcript && transcript.trim()) {
          const messageType = keyType === "capturescreen" ? "other" : "user";
          
          // Update partial transcript in Redux for real-time display
          if (!isFinal) {
            if (keyType === "capturescreen") {
              dispatch(setScreenPartialTranscript(transcript));
            } else {
              dispatch(setMicPartialTranscript(transcript));
            }
          }
          
          // Handle transcript with robust conversation management
          const segmentId = handleTranscriptUpdate(transcript, messageType, isFinal);
          
          // Update segment reference for this input source
          if (keyType === "capturescreen") {
            screenSegmentRef.current = segmentId || null;
          } else {
            micSegmentRef.current = segmentId || null;
          }
          
          // Clear partial transcript when finalized
          if (isFinal) {
            if (keyType === "capturescreen") {
              dispatch(setScreenPartialTranscript(''));
            } else {
              dispatch(setMicPartialTranscript(''));
            }
          }
        } else if (data.type === 'Metadata') {
          console.log("Received Metadata:", data);
        } else if (speechFinal) {
          console.log("Received SpeechFinal - finalizing current segment");
          // Finalize current segment when speech ends
          finalizeCurrentSegment();
          
          // Clear segment references
          if (keyType === "capturescreen") {
            screenSegmentRef.current = null;
            dispatch(setScreenPartialTranscript(''));
          } else {
            micSegmentRef.current = null;
            dispatch(setMicPartialTranscript(''));
          }
        }
      } catch (parseError) {
        console.error("Error parsing WebSocket message data:", parseError, event.data);
      }
    };

    return new Promise<void>((resolve, reject) => {
      if (!currentSocket) return reject("socket init failed");

      currentSocket.onopen = () => {
        currentSocket?.send(
          JSON.stringify({
            type: "Configure",
            token,
            encoding: "opus",
            sample_rate: 44100,
            interim_results: true,
            keep_alive: true,
            timeout: 120000,
            endpointing: 500,
          })
        );
        resolve();
      };

      currentSocket.onerror = (err) => reject(err);
    });
  };

  const handleMicrophoneToggle = async () => {
    setIsConnectingMic(true);

    if (microphoneConnected) {
      if (micStream) {
        micStream.getTracks().forEach((track) => track.stop());
        dispatch(setMicStream(null));
      }
      dispatch(setMicrophoneConnected(false));
      socket?.close();
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        dispatch(setMicStream(stream));
        dispatch(setMicrophoneConnected(true));

        await openWebSocket();

        // Configure MediaRecorder with optimized settings for dual audio
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
          ? 'audio/webm;codecs=opus' 
          : 'audio/webm';
        
        micRecorder = new MediaRecorder(stream, {
          mimeType,
          audioBitsPerSecond: 128000
        });
        
        micRecorder.ondataavailable = (e) => {
          if (socket && socket.readyState === WebSocket.OPEN && e.data.size > 0) {
            socket.send(e.data);
          }
        };
        
        micRecorder.onerror = (error) => {
          console.error('Microphone MediaRecorder error:', error);
        };
        
        // Start with smaller chunks for better responsiveness
        micRecorder.start(100);
        console.log("Microphone MediaRecorder started with optimized settings");
      } catch (err) {
        console.error(err);
      }
    }

    setIsConnectingMic(false);
  };

  /* ------------------ Screen Capture + Deepgram Integration ------------------ */
  const handleScreenShare = async () => {
    setIsConnectingScreen(true);

    if (screenConnected) {
      stopScreenShare();
    } else {
      await startScreenShare();
    }

    setIsConnectingScreen(false);
  };

  const startScreenShare = async () => {
    // Reset controller just in case
    screenController = null;

    try {
      // Check if CaptureController is available
      if (typeof (window as any).CaptureController !== 'undefined') {
        screenController = new (window as any).CaptureController();
      }

      const displayMediaOptions: any = {
        video: { cursor: "always" },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          suppressLocalAudioPlayback: true,
        },
        surfaceSwitching: "exclude",
      };

      // Add controller if available
      if (screenController) {
        displayMediaOptions.controller = screenController;
      }

      const mediaStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);

      // Validate the selection
      const videoTracks = mediaStream.getVideoTracks();
      const audioTracks = mediaStream.getAudioTracks();

      let displaySurface = null;
      if (videoTracks.length > 0) {
        displaySurface = (videoTracks[0].getSettings() as any).displaySurface;
      }

      const hasAudio = audioTracks.length > 0;

      // Check if it's a browser tab AND has audio
      if (displaySurface === "browser" && hasAudio) {
        console.log("Valid selection: Browser tab with audio.");

        // Set focus behavior (optional, experimental)
        if (screenController) {
          try {
            screenController.setFocusBehavior("no-focus-change");
            console.log("Focus behavior set to 'no-focus-change'");
          } catch (error) {
            console.warn("Could not set focus behavior:", error);
          }
        }

        // Continue with the rest of the setup
        dispatch(setScreenStream(mediaStream));
        dispatch(setScreenConnected(true));

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }

        // Set up event listener for when the user stops sharing
        videoTracks[0].onended = () => {
          console.log("Screen share stopped via browser UI.");
          stopScreenShare();
        };

        // Setup WebSocket and MediaRecorder using the audio track
        console.log("Audio track found for recording.");
        const audioStream = new MediaStream(audioTracks);
        
        // Configure MediaRecorder with optimized settings for screen audio
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
          ? 'audio/webm;codecs=opus' 
          : 'audio/webm';
        
        const mediaRecorder = new MediaRecorder(audioStream, {
          mimeType,
          audioBitsPerSecond: 128000
        });

        await openWebSocket("capturescreen");

        mediaRecorder.ondataavailable = (event) => {
          if (screenSocket && screenSocket.readyState === WebSocket.OPEN && event.data.size > 0) {
            screenSocket.send(event.data);
          }
        };
        
        mediaRecorder.onerror = (error) => {
          console.error('Screen MediaRecorder error:', error);
        };

        // Start with smaller chunks for better responsiveness, synchronize with microphone
        mediaRecorder.start(100);
        console.log("MediaRecorder started for screen capture with optimized settings.");

      } else {
        // REJECTED: Selection is invalid
        console.warn(`Invalid selection. Surface: ${displaySurface}, Has Audio: ${hasAudio}. Required: 'browser' with audio.`);

        // Stop all tracks from the obtained stream immediately
        mediaStream.getTracks().forEach(track => track.stop());
        console.log("MediaStream tracks stopped due to invalid selection.");

        toast({
          variant: "destructive",
          title: "Screen Share Failed",
          description: "Please select a 'Browser Tab' and ensure 'Share tab audio' is checked.",
        });

        screenController = null;
        return;
      }

    } catch (error: any) {
      console.error("Error starting screen share:", error);
      toast({
        variant: "destructive",
        title: "Screen Share Error",
        description: error.message === "Permission denied" 
          ? "Permission to share screen was denied." 
          : "Could not start screen sharing.",
      });
      stopScreenShare();
    }
  };

  const stopScreenShare = () => {
    console.log("stopScreenShare called.");
    
    if (screenStream) {
      screenStream.getTracks().forEach((track: any) => track.stop());
      console.log("Screen stream tracks stopped.");
      dispatch(setScreenStream(null));
    } else {
      console.log("No active screen stream found to stop.");
    }
    
    dispatch(setScreenConnected(false));

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    if (screenSocket && screenSocket.readyState === WebSocket.OPEN) {
      console.log("Closing screen WebSocket.");
      screenSocket.close();
    } else if (screenSocket) {
      console.log(`Screen WebSocket found but not open (state: ${screenSocket.readyState}).`);
    } else {
      console.log("No active screen WebSocket found to close.");
    }
    
    screenSocket = null;
    screenController = null;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      socket?.close();
      screenSocket?.close();
      if (micStream) {
        micStream.getTracks().forEach((track: any) => track.stop());
      }
      if (screenStream) {
        screenStream.getTracks().forEach((track: any) => track.stop());
      }
    };
  }, [micStream, screenStream]);


  return (
    <div className="flex flex-col h-full min-w-0 p-2 sm:p-4 gap-2 sm:gap-4">
      {/* Screen Capture Section */}
      <div className="p-0">
        <Card className="bg-zinc-900/50 dark:bg-transparent border border-zinc-700/50 dark:border-zinc-700/50 backdrop-blur-sm">
          <CardContent className="p-2 sm:p-4">
            {/* Video Display */}
            <div className="aspect-video bg-zinc-950 dark:bg-zinc-950 rounded-lg overflow-hidden mb-2 sm:mb-4 border border-zinc-600/30 dark:border-zinc-600/30 relative shadow-lg">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              {!isConnected && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-zinc-400 dark:text-zinc-400">
                    <ScreenShareOff className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 text-zinc-500 dark:text-zinc-500" />
                    <p className="text-xs sm:text-sm">No active screen share</p>
                  </div>
                </div>
              )}
            </div>

            {/* Control Buttons */}
            <div className="flex gap-6 px-4">
              <Button
                onClick={handleScreenShare}
                disabled={isConnectingScreen}
                variant={isConnected ? "destructive" : "default"}
                className={cn(
                  "flex-1 gap-x-2 h-8 sm:h-9 cursor-pointer text-xs rounded-none sm:text-sm transition-all duration-200",
                  isConnected
                    ? "dark:bg-zinc-400/50 dark:hover:bg-zinc-400/60"
                    : "dark:bg-white/70 bg-black/70 dark:hover:bg-white/90"
                )}
              >
                {isConnectingScreen ? (
                  <>
                    <div className="w-3 h-3 mr-1 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span className="hidden sm:inline">Connecting...</span>
                  </>
                ) : isConnected ? (
                  <>
                    <StopCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    <span className="hidden sm:inline">Disconnect Meeting</span>
                  </>
                ) : (
                  <>
                    <MonitorSmartphone className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    <span className="hidden sm:inline">Connect to Live Meeting</span>
                  </>
                )}
              </Button>

              <Button
                onClick={handleMicrophoneToggle}
                disabled={isConnectingMic}
                variant={isMicConnected ? "destructive" : "default"}
                className={cn(
                  "flex-1 h-8 sm:h-9 cursor-pointer text-xs rounded-none sm:text-sm transition-all duration-200",
                  isMicConnected
                    ? "dark:bg-zinc-400/50 dark:hover:bg-zinc-400/60"
                    : "dark:bg-white/70 bg-black/70 dark:hover:bg-white/90"
                )}
              >
                {isMicConnected ? (
                  <>
                    <MicOff className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    <span className="hidden sm:inline">Microphone Off</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    <span className="hidden sm:inline">Microphone On</span>
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conversation Section */}
      <div className="flex-1 flex flex-col overflow-hidden p-0">
        <Card className="flex-1 flex flex-col overflow-hidden bg-transparent border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm sm:text-base text-slate-100 dark:text-slate-100">Live Transcription</CardTitle>
              <div className="flex items-center gap-1 sm:gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAutoScroll(!autoScroll)}
                  className={cn(
                    "h-6 sm:h-8 px-2 sm:px-3 cursor-pointer text-xs text-zinc-400 dark:text-zinc-400 hover:text-zinc-200 dark:hover:text-zinc-200 hover:bg-zinc-700/30 dark:hover:bg-zinc-700/30",
                    autoScroll && "bg-zinc-700/30 dark:bg-zinc-700/30 text-zinc-200 dark:text-zinc-200",
                  )}
                >
                  <ScrollText className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Auto-scroll {autoScroll ? "On" : "Off"}</span>
                  <span className="sm:hidden">{autoScroll ? "On" : "Off"}</span>
                </Button>
              </div>
            </div>
          </CardHeader>

          <Separator className="bg-slate-700/30 dark:bg-slate-700/30" />

          <CardContent className="flex-1 overflow-hidden p-2 sm:p-4 lg:p-6">
            <ScrollArea className="h-full">
              {wholeConversation.length > 0 ? (
                <div className="space-y-2 sm:space-y-3 lg:space-y-4 pr-1 sm:pr-2 lg:pr-4">
                  {wholeConversation.map((message, index) => (
                    <div key={index} className={`flex ${message.user ? "justify-end" : "justify-start"}`}>
                      <Badge
                        variant={message.user ? "default" : "secondary"}
                        className={cn(
                          "max-w-[90%] sm:max-w-[85%] lg:max-w-[80%] xl:max-w-[75%] rounded-lg px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-2.5 text-xs sm:text-sm lg:text-base h-auto whitespace-normal break-words",
                          "dark:bg-zinc-900/70 text-white",
                        )}
                      >
                        {message.user ? message.user : message.other}
                      </Badge>
                    </div>
                  ))}
                  <div ref={conversationEndRef} />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-center p-4">
                  <div className="text-slate-400 dark:text-slate-400 max-w-xs">
                    <ScrollText className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 mx-auto mb-3" />
                    <p className="text-sm sm:text-base lg:text-lg mb-2 font-medium">
                      No conversation recorded yet
                    </p>
                    <p className="text-xs sm:text-sm lg:text-base text-slate-500">
                      Start recording to see messages here
                    </p>
                  </div>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
