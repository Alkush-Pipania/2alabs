"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import LeftSection from "./sections/left-section"
import MiddleSection from "./sections/middle-section"
import RightSection from "./sections/right-section"
import ResizableLayout from "./resizable-layout"
import { useParams } from "next/navigation"

export default function ConversationInterface() {
  const params = useParams();
  const sessionId = (params as { id?: string }).id;
  const [isConnected, setIsConnected] = useState(false)
  const [isMicConnected, setIsMicConnected] = useState(false)
  const [leftSheetOpen, setLeftSheetOpen] = useState(false)
  const [rightSheetOpen, setRightSheetOpen] = useState(false)

  return (
    <>
      {/* Desktop Layout - Hidden on mobile */}
      <div className="hidden lg:flex h-screen text-white relative z-10 ">
        <ResizableLayout>
          <LeftSection
            isConnected={isConnected}
            setIsConnected={setIsConnected}
            isMicConnected={isMicConnected}
            setIsMicConnected={setIsMicConnected}
          />
          <MiddleSection />
          <RightSection params={{ id: sessionId }}/>
        </ResizableLayout>
      </div>

      {/* Tablet Layout - Hidden on mobile and desktop */}
      <div className="hidden md:flex lg:hidden h-screen text-white relative z-10 ">
        <div className="flex w-full">
          {/* Left Panel - 40% */}
          <div className="w-2/5 border-r border-slate-700/30 dark:border-slate-700/30 flex flex-col ">
            <LeftSection
              isConnected={isConnected}
              setIsConnected={setIsConnected}
              isMicConnected={isMicConnected}
              setIsMicConnected={setIsMicConnected}
            />
          </div>

          {/* Right Panel - 60% */}
          <div className="w-3/5 flex flex-col ">
            <div className="flex h-full">
              <div className="w-3/5 border-r border-slate-700/30 dark:border-slate-700/30">
                <MiddleSection />
              </div>
              <div className="w-2/5">
              <RightSection params={{ id: sessionId }}/>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="flex md:hidden h-screen text-white relative z-10 flex-col overflow-x-hidden">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/30 dark:border-slate-700/30">
          <Sheet open={leftSheetOpen} onOpenChange={setLeftSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="text-slate-200 dark:text-slate-200 hover:bg-slate-700/30 dark:hover:bg-slate-700/30">
                <Menu className="w-4 h-4 mr-2" />
                Meeting
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full border-slate-700/30 dark:border-slate-700/30 bg-slate-900/95 dark:bg-slate-900/95 p-0">
              <div className="h-full">
                <LeftSection
                  isConnected={isConnected}
                  setIsConnected={setIsConnected}
                  isMicConnected={isMicConnected}
                  setIsMicConnected={setIsMicConnected}
                />
              </div>
            </SheetContent>
          </Sheet>

          <h1 className="text-lg font-semibold text-slate-100 dark:text-slate-100">AI Conversation</h1>

          <Sheet open={rightSheetOpen} onOpenChange={setRightSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="text-slate-200 dark:text-slate-200 hover:bg-slate-700/30 dark:hover:bg-slate-700/30">
                Actions
                <Menu className="w-4 h-4 ml-2" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full border-slate-700/30 dark:border-slate-700/30 bg-slate-900/95 dark:bg-slate-900/95 p-0">
              <div className="h-full">
              <RightSection params={{ id: sessionId }}/>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Mobile Main Content */}
        <div className="flex-1 overflow-hidden">
          <MiddleSection />
        </div>
      </div>
    </>
  )
}
