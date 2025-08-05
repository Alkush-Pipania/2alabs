"use client"

import { Button } from "@/components/ui/button"
import { MonitorSmartphone, StopCircle } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useParams } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
  setScreenConnected,
  setScreenStream,
  setWholeConversation,
  setScreenPartialTranscript,
  type ChatMessage
} from "@/store/slice/meetSessionslice"
import { cn } from "@/lib/utils"

// Toast functionality
const useToast = () => {
  const toast = ({ title, description, variant }: { title: string; description: string; variant?: string }) => {
    console.log(`Toast ${variant || 'info'}: ${title} - ${description}`);
    alert(`${title}: ${description}`);
  };
  return { toast };
};

interface CaptureScreenButtonProps {
  className?: string
  videoRef?: React.RefObject<HTMLVideoElement>
}

export default function CaptureScreenButton({ className, videoRef }: CaptureScreenButtonProps) {
  const dispatch = useAppDispatch()
  const { 
    screenConnected, 
    screenStream, 
    wholeConversation
  } = useAppSelector((state) => state.meetSession)

  const [isConnecting, setIsConnecting] = useState(false)
  const params = useParams()
  const { toast } = useToast()
  
  const socketRef = useRef<WebSocket | null>(null)
  const controllerRef = useRef<any>(null)
  const keepAliveIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)

  const fetchDeepgramToken = async (): Promise<string> => {
    try {
      const sessionId = (params as { id?: string }).id;
      if (!sessionId) throw new Error('Session ID not available');
      
      const response = await fetch("/api/deepgram-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, keyType: "capturescreen" }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch token: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      return data.token?.key || data.token;
    } catch (error) {
      console.error('Token fetch error:', error);
      throw error;
    }
  }

  const openWebSocket = async (): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        const token = await fetchDeepgramToken();
        const url = "wss://api.deepgram.com/v1/listen?model=nova-3&language=en&smart_format=true&punctuate=true&keep_alive=true&timeout=120000&endpointing=500";

        socketRef.current = new WebSocket(url, ["token", token]);

        socketRef.current.onopen = () => {
          console.log("Connected to Deepgram for screen capture");
          socketRef.current?.send(JSON.stringify({
            type: "Configure", token, encoding: "opus", sample_rate: 44100,
            interim_results: true, keep_alive: true, timeout: 120000, endpointing: 500,
          }));

          keepAliveIntervalRef.current = setInterval(() => {
            if (socketRef.current?.readyState === WebSocket.OPEN) {
              socketRef.current.send(JSON.stringify({ type: 'KeepAlive' }));
            }
          }, 30000);
          resolve();
        };

        socketRef.current.onerror = (error) => {
          console.error("Screen WebSocket error", error);
          reject(error);
        };

        socketRef.current.onclose = () => {
          if (keepAliveIntervalRef.current) {
            clearInterval(keepAliveIntervalRef.current);
            keepAliveIntervalRef.current = null;
          }
        };

        socketRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const transcript = data?.channel?.alternatives?.[0]?.transcript;
            const isFinal = data?.is_final || false;
            
            if (transcript?.trim()) {
              if (!isFinal) dispatch(setScreenPartialTranscript(transcript));
              
              const timestamp = new Date().toISOString();
              const messageId = `screen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
              
              const updatedConversation = [...wholeConversation];
              const lastMessage = updatedConversation[updatedConversation.length - 1];
              
              if (lastMessage?.other && !lastMessage.saved) {
                const updatedMessage = lastMessage.other + " " + transcript;
                if (updatedMessage.length > 200) {
                  updatedConversation.push({
                    id: messageId, other: transcript, time: timestamp,
                    saved: false, hidden: false, isPartial: !isFinal
                  });
                } else {
                  updatedConversation[updatedConversation.length - 1] = {
                    ...lastMessage, other: updatedMessage, time: timestamp, isPartial: !isFinal
                  };
                }
              } else {
                updatedConversation.push({
                  id: messageId, other: transcript, time: timestamp,
                  saved: false, hidden: false, isPartial: !isFinal
                });
              }
              
              dispatch(setWholeConversation(updatedConversation));
              if (isFinal) dispatch(setScreenPartialTranscript(''));
            }
          } catch (error) {
            console.error("Error parsing screen message:", error);
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  const startScreenShare = async () => {
    setIsConnecting(true);
    controllerRef.current = null;

    try {
      if (typeof (window as any).CaptureController !== 'undefined') {
        controllerRef.current = new (window as any).CaptureController();
      }

      const displayMediaOptions: any = {
        video: { cursor: "always" },
        audio: { echoCancellation: true, noiseSuppression: true, suppressLocalAudioPlayback: true },
        surfaceSwitching: "exclude",
      };

      if (controllerRef.current) displayMediaOptions.controller = controllerRef.current;
      const mediaStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);

      const videoTracks = mediaStream.getVideoTracks();
      const audioTracks = mediaStream.getAudioTracks();
      const displaySurface = videoTracks.length > 0 ? (videoTracks[0].getSettings() as any).displaySurface : null;
      const hasAudio = audioTracks.length > 0;

      if (displaySurface === "browser" && hasAudio) {
        console.log("Valid selection: Browser tab with audio.");
        
        if (controllerRef.current) {
          try {
            controllerRef.current.setFocusBehavior("no-focus-change");
          } catch (error) {
            console.warn("Could not set focus behavior:", error);
          }
        }

        dispatch(setScreenStream(mediaStream));
        dispatch(setScreenConnected(true));
        if (videoRef?.current) videoRef.current.srcObject = mediaStream;

        videoTracks[0].onended = () => stopScreenShare();

        const audioStream = new MediaStream(audioTracks);
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm';
        
        mediaRecorderRef.current = new MediaRecorder(audioStream, { mimeType, audioBitsPerSecond: 128000 });
        await openWebSocket();

        mediaRecorderRef.current.ondataavailable = (event) => {
          if (socketRef.current?.readyState === WebSocket.OPEN && event.data.size > 0) {
            socketRef.current.send(event.data);
          }
        };
        
        mediaRecorderRef.current.onerror = (error) => console.error('Screen MediaRecorder error:', error);
        mediaRecorderRef.current.start(100);
      } else {
        mediaStream.getTracks().forEach(track => track.stop());
        toast({ variant: "destructive", title: "Screen Share Failed", description: "Please select a 'Browser Tab' and ensure 'Share tab audio' is checked." });
        return;
      }
    } catch (error: any) {
      console.error("Error starting screen share:", error);
      toast({ variant: "destructive", title: "Screen Share Error", description: error.message === "Permission denied" ? "Permission denied." : "Could not start screen sharing." });
      stopScreenShare();
    } finally {
      setIsConnecting(false);
    }
  }

  const stopScreenShare = () => {
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      dispatch(setScreenStream(null));
    }
    dispatch(setScreenConnected(false));
    if (videoRef?.current) videoRef.current.srcObject = null;
    if (socketRef.current?.readyState === WebSocket.OPEN) socketRef.current.close();
    if (mediaRecorderRef.current?.state !== 'inactive') mediaRecorderRef.current?.stop();
    if (keepAliveIntervalRef.current) {
      clearInterval(keepAliveIntervalRef.current);
      keepAliveIntervalRef.current = null;
    }
    socketRef.current = null;
    controllerRef.current = null;
  }

  useEffect(() => {
    return () => {
      if (socketRef.current?.readyState === WebSocket.OPEN) socketRef.current.close();
      if (mediaRecorderRef.current?.state !== 'inactive') mediaRecorderRef.current?.stop();
      if (keepAliveIntervalRef.current) clearInterval(keepAliveIntervalRef.current);
      if (screenStream) screenStream.getTracks().forEach(track => track.stop());
    };
  }, [screenStream]);

  return (
    <Button
      onClick={screenConnected ? stopScreenShare : startScreenShare}
      disabled={isConnecting}
      variant={screenConnected ? "destructive" : "default"}
      className={cn(
        "flex-1 gap-x-2 h-8 sm:h-9 cursor-pointer text-xs rounded-none sm:text-sm transition-all duration-200",
        screenConnected
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
      ) : screenConnected ? (
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
  )
}