"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, LucideIcon } from "lucide-react"

import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

interface SubItem {
  title: string
  url: string
}

interface NavigationItemProps {
  title: string
  url: string
  icon: LucideIcon
  isActive?: boolean
  subItems?: SubItem[]
  expanded?: boolean
  onToggle?: () => void
}

export function NavigationItem({
  title,
  url,
  icon: Icon,
  isActive = false,
  subItems,
  expanded = false,
  onToggle
}: NavigationItemProps) {
  const pathname = usePathname()
  
  const isSubItemActive = (subUrl: string) => {
    // For exact dashboard route, only match exactly
    if (subUrl === "/dashboard") {
      return pathname === "/dashboard"
    }
    // For other routes, check exact match or sub-routes
    return pathname === subUrl || pathname.startsWith(subUrl + "/")
  }
  if (subItems && subItems.length > 0) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={onToggle}
          isActive={isActive}
          className="w-full justify-between"
        >
          <div className="flex items-center gap-3">
            <Icon className="h-4 w-4" />
            <span>{title}</span>
          </div>
          <ChevronDown 
            className={`h-4 w-4 transition-transform duration-200 ${
              expanded ? "rotate-180" : ""
            }`} 
          />
        </SidebarMenuButton>
        {expanded && (
          <SidebarMenuSub>
            {subItems.map((subItem) => (
              <SidebarMenuSubItem key={subItem.title}>
                <SidebarMenuSubButton 
                  asChild
                  isActive={isSubItemActive(subItem.url)}
                >
                  <Link href={subItem.url}>
                    {subItem.title}
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        )}
      </SidebarMenuItem>
    )
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton 
        asChild
        isActive={isActive}
      >
        <Link href={url}>
          <Icon className="h-4 w-4" />
          <span>{title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
