import ConversationInterface from '@/components/sessions/conversation-interface'
import React from 'react'

export default function SessionPage() {
  return (
    <div className="min-h-screen w-full relative bg-black">
    <div
      className="absolute inset-0 z-0"
      style={{
        background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(226, 232, 240, 0.15), transparent 70%), #000000",
      }}
    />
    <ConversationInterface />
  </div>
  )
}
