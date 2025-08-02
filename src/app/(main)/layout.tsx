import * as React from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { MainSidebar } from "@/components/dashboard/sidebar"
import { MobileMenuToggle } from "@/components/dashboard/sidebar"
import Navbar from "@/components/dashboard/navbar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <MainSidebar />
      <SidebarInset>
        <Navbar/>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}