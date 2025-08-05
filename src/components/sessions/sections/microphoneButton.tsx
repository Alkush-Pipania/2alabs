"use client"

import { Button } from "@/components/ui/button"
import { Mic, MicOff } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
  setMicrophoneConnected,
  setMicStream,
  setWholeConversation,
  setMicPartialTranscript,
  addChatMessage,
  type ChatMessage
} from "@/store/slice/meetSessionslice"
import { cn } from "@/lib/utils"

interface MicrophoneButtonProps {
  className?: string
}

export default function MicrophoneButton({ className }: MicrophoneButtonProps) {
  const dispatch = useAppDispatch()
  const { 
    microphoneConnected, 
    micStream, 
    wholeConversation,
    micPartialTranscript 
  } = useAppSelector((state) => state.meetSession)

  const [isConnecting, setIsConnecting] = useState(false)
  const params = useParams()
  const socketRef = useRef<WebSocket | null>(null)
  const keepAliveIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)

  const fetchDeepgramToken = async (keyType: "microphone" | "capturescreen" = "microphone"): Promise<string> => {
    try {
      const sessionId = (params as { id?: string }).id;
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
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch Deepgram token: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      return data.token?.key || data.token;
    } catch (error) {
      console.error('Fetch error details:', error);
      throw error;
    }
  }

  const openWebSocket = async (): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        const token = await fetchDeepgramToken("microphone");
        const url = "wss://api.deepgram.com/v1/listen?model=nova-3&language=en&smart_format=true&punctuate=true&keep_alive=true&timeout=120000&endpointing=500";

        socketRef.current = new WebSocket(url, ["token", token]);

        socketRef.current.onopen = () => {
          console.log("Connected to Deepgram WebSocket for microphone");

          socketRef.current?.send(
            JSON.stringify({
              type: "Configure",
              token: token,
              encoding: "opus",
              sample_rate: 44100,
              interim_results: true,
              keep_alive: true,
              timeout: 120000,
              endpointing: 500,
            })
          );

          // Start keep-alive heartbeat
          keepAliveIntervalRef.current = setInterval(() => {
            if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
              socketRef.current.send(JSON.stringify({ type: 'KeepAlive' }));
            }
          }, 30000);

          resolve();
        };

        socketRef.current.onerror = (error) => {
          console.error("Microphone WebSocket error", error);
          socketRef.current = null;
          reject(error);
        };

        socketRef.current.onclose = (event) => {
          console.log(`Microphone WebSocket closed:`, event.code, event.reason);
          
          if (keepAliveIntervalRef.current) {
            clearInterval(keepAliveIntervalRef.current);
            keepAliveIntervalRef.current = null;
          }
          
          socketRef.current = null;
        };

        const MAX_MESSAGE_LENGTH = 200;

        socketRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const transcript = data?.channel?.alternatives?.[0]?.transcript;
            const isFinal = data?.is_final || false;
            const speechFinal = data?.type === 'SpeechFinal';
            
            if (transcript && transcript.trim()) {
              // Update partial transcript for real-time display
              if (!isFinal) {
                dispatch(setMicPartialTranscript(transcript));
              }
              
              const timestamp = new Date().toISOString();
              const messageId = `mic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
              
              // Update conversation in Redux store
              const updatedConversation = [...wholeConversation];
              const lastMessage = updatedConversation[updatedConversation.length - 1];
              
              if (lastMessage?.user && !lastMessage.saved) {
                const updatedMessage = lastMessage.user + " " + transcript;
                
                if (updatedMessage.length > MAX_MESSAGE_LENGTH) {
                  // Start a new message if exceeding max length
                  const newMessage: ChatMessage = {
                    id: messageId,
                    user: transcript,
                    time: timestamp,
                    saved: false,
                    hidden: false,
                    isPartial: !isFinal
                  };
                  updatedConversation.push(newMessage);
                } else {
                  // Update the last message
                  updatedConversation[updatedConversation.length - 1] = {
                    ...lastMessage,
                    user: updatedMessage,
                    time: timestamp,
                    isPartial: !isFinal
                  };
                }
              } else {
                // Create new message
                const newMessage: ChatMessage = {
                  id: messageId,
                  user: transcript,
                  time: timestamp,
                  saved: false,
                  hidden: false,
                  isPartial: !isFinal
                };
                updatedConversation.push(newMessage);
              }
              
              dispatch(setWholeConversation(updatedConversation));
              
              // Clear partial transcript when finalized
              if (isFinal || speechFinal) {
                dispatch(setMicPartialTranscript(''));
              }
            }
          } catch (parseError) {
            console.error("Error parsing microphone WebSocket message:", parseError, event.data);
          }
        };
      } catch (error) {
        console.error("Error setting up microphone WebSocket:", error);
        reject(error);
      }
    });
  }

  const handleConnectMicrophone = async () => {
    setIsConnecting(true);

    if (microphoneConnected) {
      // Disconnect microphone
      if (micStream) {
        micStream.getTracks().forEach((track) => track.stop());
        dispatch(setMicStream(null));
      }
      
      dispatch(setMicrophoneConnected(false));
      
      // Close WebSocket
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
      
      // Stop media recorder
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      
      // Clear keep-alive interval
      if (keepAliveIntervalRef.current) {
        clearInterval(keepAliveIntervalRef.current);
        keepAliveIntervalRef.current = null;
      }
      
      console.log("Microphone disconnected.");
    } else {
      // Connect microphone
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log("Audio tracks:", stream.getAudioTracks());
        
        dispatch(setMicStream(stream));
        dispatch(setMicrophoneConnected(true));

        await openWebSocket();

        // Configure MediaRecorder with optimized settings
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
          ? 'audio/webm;codecs=opus' 
          : 'audio/webm';
        
        mediaRecorderRef.current = new MediaRecorder(stream, {
          mimeType,
          audioBitsPerSecond: 128000
        });

        mediaRecorderRef.current.ondataavailable = (event) => {
          if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN && event.data.size > 0) {
            socketRef.current.send(event.data);
          }
        };
        
        mediaRecorderRef.current.onerror = (error) => {
          console.error('Microphone MediaRecorder error:', error);
        };

        // Start with smaller chunks for better responsiveness
        mediaRecorderRef.current.start(100);
        console.log("Microphone MediaRecorder started with optimized settings");
      } catch (err) {
        console.error("Error connecting microphone:", err);
        dispatch(setMicrophoneConnected(false));
      }
    }
    
    setIsConnecting(false);
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup WebSocket
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
      
      // Cleanup media recorder
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      
      // Cleanup keep-alive interval
      if (keepAliveIntervalRef.current) {
        clearInterval(keepAliveIntervalRef.current);
      }
      
      // Cleanup media stream
      if (micStream) {
        micStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [micStream]);

  return (
    <Button
      onClick={handleConnectMicrophone}
      disabled={isConnecting}
      variant={microphoneConnected ? "destructive" : "default"}
      className={cn(
        "flex-1 gap-x-2 h-8 sm:h-9 cursor-pointer text-xs rounded-none sm:text-sm transition-all duration-200",
        microphoneConnected
          ? "dark:bg-zinc-400/50 dark:hover:bg-zinc-400/60"
          : "dark:bg-white/70 bg-black/70 dark:hover:bg-white/90",
        className
      )}
    >
      {isConnecting ? (
        <>
          <div className="w-3 h-3 mr-1 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span className="hidden sm:inline">Connecting...</span>
        </>
      ) : microphoneConnected ? (
        <>
          <MicOff className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
          <span className="hidden sm:inline">Disconnect Microphone</span>
        </>
      ) : (
        <>
          <Mic className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
          <span className="hidden sm:inline">Connect to Microphone</span>
        </>
      )}
    </Button>
  );
}

