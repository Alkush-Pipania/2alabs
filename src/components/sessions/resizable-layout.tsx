"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"

interface ResizableLayoutProps {
  children: React.ReactNode[]
  className?: string
}

export default function ResizableLayout({ children, className }: ResizableLayoutProps) {
  const [leftWidth, setLeftWidth] = useState(30.33) // Default 1/3
  const [rightWidth, setRightWidth] = useState(28.33) // Default 1/3
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef<"left" | "right" | null>(null)

  const handleMouseDown = useCallback((divider: "left" | "right") => {
    isDragging.current = divider
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none"
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const containerWidth = containerRect.width
    const mouseX = e.clientX - containerRect.left
    const percentage = (mouseX / containerWidth) * 100

    if (isDragging.current === "left") {
      // Left panel: min 20%, max 50%
      const newLeftWidth = Math.min(Math.max(percentage, 20), 50)
      setLeftWidth(newLeftWidth)
    } else if (isDragging.current === "right") {
      // Right panel: min 20%, max 50%
      const newRightWidth = Math.min(Math.max(100 - percentage, 20), 50)
      setRightWidth(newRightWidth)
    }
  }, [])

  const handleMouseUp = useCallback(() => {
    isDragging.current = null
    document.removeEventListener("mousemove", handleMouseMove)
    document.removeEventListener("mouseup", handleMouseUp)
    document.body.style.cursor = ""
    document.body.style.userSelect = ""
  }, [handleMouseMove])

  const middleWidth = 100 - leftWidth - rightWidth

  return (
    <div ref={containerRef} className={cn("flex h-full w-full relative", className)}>
      {/* Left Panel */}
      <div className="flex flex-col min-w-0 " style={{ width: `${leftWidth}%` }}>
        {children[0]}
      </div>

      {/* Left Resizer */}
      <div
        className="w-1 bg-zinc-800 hover:bg-zinc-700 cursor-col-resize transition-colors relative group"
        onMouseDown={() => handleMouseDown("left")}
      >
        <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-zinc-700/20" />
      </div>

      {/* Middle Panel */}
      <div className="flex flex-col border-r border-zinc-800/10  min-w-0" style={{ width: `${middleWidth}%` }}>
        {children[1]}
      </div>

      {/* Right Resizer */}
      <div
        className="w-1 bg-zinc-800 hover:bg-zinc-700 cursor-col-resize transition-colors relative group"
        onMouseDown={() => handleMouseDown("right")}
      >
        <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-zinc-700/20" />
      </div>

      {/* Right Panel */}
      <div className="flex flex-col  min-w-0" style={{ width: `${rightWidth}%` }}>
        {children[2]}
      </div>
    </div>
  )
}
