"use client"

import { useState, useEffect } from "react"
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '@/store'
import { sendAIRequest, setEnableWebSearch, setUseRag, setCopiedText } from '@/store/slice/meetSessionslice'
import { Button } from "@/components/ui/button"
import { Toggle } from "@/components/ui/toggle"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { LiquidButton } from "@/components/liquid-glass-button"
import {
  Search,
  FileText,
  ExternalLink,
  LogOut,
  Database,
  Globe,
  BookOpen,
  Clock,
  CheckCircle,
  List,
  Lightbulb,
  MessageSquare,
  ArrowUp,
  Brain,
  FileCheck2,
  FileStack,
  ThumbsUp,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface RightSectionProps {
  params: { id?: string };
}

interface CitationItem {
  id: number;
  title: string;
  url: string;
  type: string;
  preview: string;
}

export default function RightSection({ params }: RightSectionProps) {
  const dispatch = useDispatch<AppDispatch>()
  const {
    enableWebSearch,
    useRag,
    copiedText,
    wholeConversation,
    isAIResponseLoading,
    currentAIResponse,
    aiResponses
  } = useSelector((state: RootState) => state.meetSession)
  
  const [userInput, setUserInput] = useState("")
  const sessionId = (params as { id?: string }).id
  
  // Update Redux state when local toggles change
  const handleWebSearchToggle = (pressed: boolean) => {
    dispatch(setEnableWebSearch(pressed))
  }
  
  const handleDocSearchToggle = (pressed: boolean) => {
    dispatch(setUseRag(pressed))
  }
  
  // Convert conversation to string format expected by API
  const getConversationString = () => {
    return wholeConversation
      .map((msg) => {
        if (msg.user) return `User: ${msg.user}`;
        if (msg.other) return `Assistant: ${msg.other}`;
        return '';
      })
      .filter(Boolean)
      .join('\n');
  }
  
  // Handle AI request with specific action type
  const handleAIRequest = async (requestType: string) => {
    if (!sessionId) {
      console.error('Session ID is required');
      return;
    }
    
    const conversationString = getConversationString();
    if (!conversationString.trim()) {
      console.error('No conversation to send');
      return;
    }
    
    try {
      await dispatch(sendAIRequest({
        conversation: conversationString,
        use_web: enableWebSearch,
        requestType,
        useHighlightedText: '', // Empty for now as requested
        copiedText,
        sessionId,
        useRag,
      })).unwrap();
    } catch (error) {
      console.error('AI request failed:', error);
    }
  }

  // Get citations from all AI responses
  const getAllCitations = (): CitationItem[] => {
    const citations: CitationItem[] = []
    let citationId = 1
    
    // Get citations from completed responses
    aiResponses.forEach(response => {
      if (response.citations) {
        Object.values(response.citations).forEach(citation => {
          citations.push({
            id: citationId++,
            title: citation.text_preview.substring(0, 50) + '...',
            url: citation.source,
            type: citation.type,
            preview: citation.text_preview
          })
        })
      }
    })
    
    // Get citations from current streaming response
    if (currentAIResponse?.citations) {
      Object.values(currentAIResponse.citations).forEach(citation => {
        citations.push({
          id: citationId++,
          title: citation.text_preview.substring(0, 50) + '...',
          url: citation.source,
          type: citation.type,
          preview: citation.text_preview
        })
      })
    }
    
    return citations
  }
  
  const citations = getAllCitations()

  const quickActions = [
    { icon: Brain, label: "AI Answer", requestType: "AIAnswer" },
    { icon: FileCheck2, label: "Fact Checking", requestType: "factcheck" },
    { icon: FileStack, label: "Summarize", requestType: "summary" },
    { icon: List, label: "Action Plan", requestType: "createactionplan" },
    { icon: Lightbulb, label: "Explain Simply", requestType: "fiveyearold" },
    { icon: ThumbsUp, label: "Make Convincing", requestType: "AIAnswer" },
  ]

  const handleSendMessage = async () => {
    if (userInput.trim() && sessionId) {
      try {
        await dispatch(sendAIRequest({
          conversation: userInput,
          use_web: enableWebSearch,
          requestType: 'AIAnswer',
          useHighlightedText: '', // Empty for now as requested
          copiedText,
          sessionId,
          useRag,
        })).unwrap();
        setUserInput("");
      } catch (error) {
        console.error('AI request failed:', error);
      }
    }
  }

  return (
    <div className="flex flex-col h-full min-w-0 p-2 sm:p-4 gap-2 sm:gap-4">
      {/* AI Actions */}
      <div className="p-0">
        <Card className="bg-zinc-900/30 dark:bg-zinc-900/30 border border-zinc-700/30 dark:border-zinc-700/30 backdrop-blur-sm">
          {/* <CardHeader className="">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm sm:text-base text-zinc-100 dark:text-zinc-100">AI Actions</CardTitle>
              <Button
                variant="destructive"
                size="sm"
                className="h-6 sm:h-8 px-2 sm:px-3 text-xs bg-red-500/80 hover:bg-red-500 text-white border-0"
              >
                <LogOut className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">Exit</span>
              </Button>
            </div>
          </CardHeader> */}

          {/* <Separator className="bg-zinc-700/30 dark:bg-zinc-700/30" /> */}

          <CardContent className="pt-2 sm:pt-4 px-2 sm:px-6 space-y-3 sm:space-y-4">
            {/* Web/Docs Toggle Buttons */}
            <div className="flex gap-2  sm:gap-4">
              <Toggle
                pressed={enableWebSearch}
                onPressedChange={handleWebSearchToggle}
                variant="outline"
                className={cn(
                  " h-9 text-xs cursor-pointer px-4 sm:text-sm transition-all duration-200",
                  enableWebSearch
                    ? "bg-blue-500/20 dark:bg-zinc-800 border-zinc-500 text-zinc-500 data-[state=on]:bg-blue-500/30"
                    : "bg-zinc-700/20 dark:bg-zinc-700/20 border-zinc-600/40 text-zinc-400 "
                )}
              >
                <Globe className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Web Search</span>
                <span className="sm:hidden">Web</span>
              </Toggle>
              
              <Toggle
                pressed={useRag}
                onPressedChange={handleDocSearchToggle}
                variant="outline"
                className={cn(
                  "h-9 text-xs cursor-pointer px-4 sm:text-sm transition-all duration-200",
                  useRag
                    ? "bg-green-500/20 dark:bg-zinc-800 border-zinc-500 text-zinc-500 data-[state=on]:bg-green-500/30"
                    : "bg-zinc-700/20 dark:bg-zinc-700/20 border-zinc-600/40 text-zinc-400"
                )}
              >
                <Database className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Doc Search</span>
                <span className="sm:hidden">Docs</span>
              </Toggle>
            </div>

            <Separator className="bg-zinc-700/30 dark:bg-zinc-700/30" />

            {/* Quick Action Buttons - Right Aligned */}
            <div className="flex flex-wrap justify-end md:justify-start gap-1.5 sm:gap-2 md:gap-3 max-h-48 overflow-y-auto">
              {quickActions.map((action, index) => {
                const Icon = action.icon
                return (
                  <Button
                    key={index}
                    variant="default"
                    size="sm"
                    onClick={() => handleAIRequest(action.requestType)}
                    disabled={isAIResponseLoading}
                   className="group flex items-center justify-center relative shrink-0 h-8 md:h-9 px-2.5 md:px-3.5 text-[10px] sm:text-xs text-zinc-200 dark:text-zinc-200 rounded-md bg-gradient-to-br from-zinc-800/60 cursor-pointer to-zinc-700/60 dark:from-zinc-800/50 dark:to-zinc-700/50 border border-zinc-600/30 hover:from-zinc-800 dark:hover:bg-zinc-800 hover:to-zinc-600/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Icon className="w-3 h-3 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">{action.label}</span>
                    <span className="sm:hidden">{action.label.split(" ")[0]}</span>
                  </Button>
                )
              })}
            </div>

            <Separator className="bg-zinc-700/30 dark:bg-zinc-700/30" />

            {/* Input Area with Integrated Send Button */}
            <div className="relative">
              <Textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Ask JarWiz directly for assistance..."
                className="min-h-[100px] sm:min-h-[60px] pr-12 sm:pr-14 resize-none bg-zinc-800/50 dark:bg-zinc-800/50 border-zinc-600/40 dark:border-zinc-600/40 text-zinc-100 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-400 focus:border-blue-400/60 focus:ring-blue-400/20 text-xs sm:text-sm backdrop-blur-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!userInput.trim() || isAIResponseLoading}
                size="sm"
                className={cn(
                  "absolute right-2 bottom-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full p-0 transition-all duration-200",
                  userInput.trim() && !isAIResponseLoading
                    ? "bg-blue-500/80 hover:bg-blue-500 dark:bg-blue-500/80 dark:hover:bg-blue-500 border-0 shadow-lg"
                    : "bg-zinc-600/50 dark:bg-zinc-600/50 border-0 opacity-50 cursor-not-allowed"
                )}
              >
                <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Citations Section */}
      <div className="flex-1 flex flex-col overflow-hidden p-0">
        <Card className="flex-1 flex flex-col overflow-hidden bg-zinc-900/30 dark:bg-zinc-900/30 border border-zinc-700/30 dark:border-zinc-700/30 backdrop-blur-sm">
          <CardHeader className="">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm sm:text-base text-zinc-100 dark:text-zinc-100">Citations</CardTitle>
              <Badge variant="secondary" className="text-xs bg-zinc-700/30 dark:bg-zinc-700/30 text-zinc-300 dark:text-zinc-300 hover:bg-zinc-600/50">
                {citations.length}
              </Badge>
            </div>
          </CardHeader>

          <Separator className="bg-zinc-700/30 dark:bg-zinc-700/30" />

          <CardContent className="flex-1 overflow-hidden pt-2 sm:pt-4 px-2 sm:px-6">
            <ScrollArea className="h-full">
              {citations.length > 0 ? (
                <div className="space-y-2 sm:space-y-3 pr-2 sm:pr-4">
                  {citations.map((citation) => (
                    <Card
                      key={citation.id}
                      className="bg-zinc-800/40 dark:bg-zinc-800/40 border border-zinc-600/30 dark:border-zinc-600/30 hover:bg-zinc-700/50 dark:hover:bg-zinc-700/50 transition-colors backdrop-blur-sm"
                    >
                      <CardContent className="p-2 sm:p-3">
                        <div className="flex items-start gap-2 sm:gap-3">
                          <Badge
                            variant="outline"
                            className="flex-shrink-0 bg-zinc-700/50 dark:bg-zinc-700/50 text-zinc-300 dark:text-zinc-300 border-zinc-500/30 dark:border-zinc-500/30 text-xs"
                          >
                            #{citation.id}
                          </Badge>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs sm:text-sm font-medium text-zinc-100 dark:text-zinc-100 mb-1 line-clamp-2">
                              {citation.title}
                            </h4>
                            <div className="flex items-center gap-2 mb-1 sm:mb-2">
                              <Badge
                                variant="secondary"
                                className="text-xs bg-zinc-700/30 dark:bg-zinc-700/30 text-zinc-300 dark:text-zinc-300 hover:bg-zinc-600/50"
                              >
                                {citation.type}
                              </Badge>
                            </div>
                            <Button
                              variant="link"
                              size="sm"
                              className="h-auto p-0 text-xs text-zinc-400 dark:text-zinc-400 hover:text-zinc-200 dark:hover:text-zinc-200 justify-start"
                              asChild
                            >
                              <a
                                href={citation.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 hover:underline"
                              >
                                <Globe className="w-3 h-3" />
                                <span className="truncate">{citation.url}</span>
                                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                              </a>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-center">
                  <div className="text-zinc-400 dark:text-zinc-400">
                    <FileText className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2" />
                    <p className="text-xs sm:text-sm mb-1">No citations available</p>
                    <p className="text-xs">Citations will appear here as you interact with AI</p>
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
