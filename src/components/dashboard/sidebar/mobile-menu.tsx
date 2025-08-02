"use client"

import * as React from "react"
import { Menu, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"

export function MobileMenuToggle() {
  const { toggleSidebar, openMobile } = useSidebar()

  return (
    <Button
      variant="ghost"
      size="icon"
      className="md:hidden"
      onClick={toggleSidebar}
      aria-label="Toggle menu"
    >
      {openMobile ? (
        <X className="h-5 w-5" />
      ) : (
        <Menu className="h-5 w-5" />
      )}
    </Button>
  )
}

export function DesktopMenuToggle() {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      variant="ghost"
      size="icon"
      className="hidden md:flex"
      onClick={toggleSidebar}
      aria-label="Toggle sidebar"
    >
      <Menu className="h-5 w-5" />
    </Button>
  )
}
