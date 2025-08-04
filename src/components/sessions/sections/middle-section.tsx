"use client"

import { useRef, useEffect } from "react"
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Loader2 } from "lucide-react"

export default function MiddleSection() {
  const chatEndRef = useRef<HTMLDivElement>(null)
  const { aiResponses, currentAIResponse, isAIResponseLoading } = useSelector((state: RootState) => state.meetSession)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [aiResponses, currentAIResponse])

  return (
    <div className="flex flex-col h-full min-w-0 p-2 sm:p-4">
      <div className="flex-1 flex flex-col overflow-hidden p-0">
        <Card className="flex-1 flex flex-col overflow-hidden bg-zinc-900/30 dark:bg-zinc-900/30 border border-zinc-700/30 dark:border-zinc-700/30 backdrop-blur-sm">
          <CardContent className="flex-1 overflow-hidden p-2 sm:p-4">
            <ScrollArea className="h-full">
              {(aiResponses.length > 0 || currentAIResponse) ? (
                <div className="space-y-3 sm:space-y-4 pr-2 sm:pr-4">
                  {/* Completed AI Responses */}
                  {aiResponses.map((response) => (
                    <div key={response.id} className="space-y-2 sm:space-y-3">
                      {/* User Question */}
                      <div className="flex justify-end">
                        <Badge
                          variant="default"
                          className="max-w-[90%] sm:max-w-[85%] dark:bg-zinc-700/70 text-zinc-200 dark:text-zinc-200 rounded-lg px-2 sm:px-3 py-1 sm:py-2 backdrop-blur-sm h-auto whitespace-normal text-xs sm:text-sm"
                        >
                          {response.query}
                        </Badge>
                      </div>

                      {/* AI Answer */}
                      <div className="flex justify-start">
                        <Card className="max-w-[95%] sm:max-w-[90%] bg-zinc-800/40 dark:bg-zinc-800/40 backdrop-blur-sm border border-zinc-600/30 dark:border-zinc-600/30">
                          <CardContent className="p-2 sm:p-3">
                            <div className="text-xs sm:text-sm text-zinc-100 dark:text-zinc-100 leading-relaxed">
                              <div className="prose prose-zinc prose-sm max-w-none dark:prose-invert">
                                {response.result}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  ))}

                  {/* Current Streaming Response */}
                  {currentAIResponse && (
                    <div className="space-y-2 sm:space-y-3">
                      {/* User Question for current response */}
                      <div className="flex justify-end">
                        <Badge
                          variant="default"
                          className="max-w-[90%] sm:max-w-[85%] dark:bg-zinc-700/70 text-zinc-200 dark:text-zinc-200 rounded-lg px-2 sm:px-3 py-1 sm:py-2 backdrop-blur-sm h-auto whitespace-normal text-xs sm:text-sm"
                        >
                          {currentAIResponse.query}
                        </Badge>
                      </div>

                      {/* Streaming AI Answer */}
                      <div className="flex justify-start">
                        <Card className="max-w-[95%] sm:max-w-[90%] bg-zinc-800/40 dark:bg-zinc-800/40 backdrop-blur-sm border border-zinc-600/30 dark:border-zinc-600/30">
                          <CardContent className="p-2 sm:p-3">
                            <div className="text-xs sm:text-sm text-zinc-100 dark:text-zinc-100 leading-relaxed">
                              {currentAIResponse.result && (
                                <div className="prose prose-zinc prose-sm max-w-none dark:prose-invert">
                                  {currentAIResponse.result}
                                </div>
                              )}
                              {currentAIResponse.isStreaming && (
                                <div className="flex items-center gap-2 mt-2">
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  <span className="text-xs text-zinc-400">Streaming response...</span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}
                  
                  <div ref={chatEndRef} />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-center">
                  <div className="text-zinc-400 dark:text-zinc-400">
                    <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2" />
                    <p className="text-xs sm:text-sm mb-1">AI responses will appear here</p>
                    <p className="text-xs">Ask questions or use AI actions to get started</p>
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
