"use client";

import { Plus, MessageCircle, FileText,  User, MoreHorizontal } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,  
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { sidebarData } from "./mockdata";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
  return (
    <Sidebar className="w-64 bg-[#2f2f2f] border-r border-gray-700">
      <SidebarHeader className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="p-1 h-8 w-8 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors" />
            <span className="text-white font-semibold">2A</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 overflow-y-auto overflow-x-hidden">
        {/* New Chat Button */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="w-full">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start bg-transparent border-gray-600 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New chat
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Navigation Menu */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#" className="flex items-center text-gray-300 hover:text-white hover:bg-gray-700 p-2 rounded transition-colors">
                    <MessageCircle className="w-4 h-4 mr-3" />
                    Chats
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#" className="flex items-center text-gray-300 hover:text-white hover:bg-gray-700 p-2 rounded transition-colors">
                    <FileText className="w-4 h-4 mr-3" />
                    Artifacts
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="bg-gray-700" />

        {/* Recents Section */}
        <SidebarGroup className="flex-1 overflow-hidden">
          <SidebarGroupLabel className="text-gray-500 text-sm font-medium px-2 py-2">
            Recents
          </SidebarGroupLabel>
          <SidebarGroupContent className="overflow-y-auto overflow-x-hidden">
            <SidebarMenu>
              {sidebarData.recentChats.map((chat) => (
                <SidebarMenuItem key={chat.id}>
                  <SidebarMenuButton asChild>
                    <a
                      href={`#${chat.id}`}
                      className="flex items-center w-full text-gray-300 hover:text-white hover:bg-gray-700 p-2 rounded group transition-colors overflow-hidden"
                    >
                      <div className="flex items-center flex-1 min-w-0 pr-2">
                        <MessageCircle className="w-4 h-4 mr-3 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm truncate max-w-[160px]">
                            {chat.title}
                          </div>
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <MoreHorizontal className="w-4 h-4" />
                      </div>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">
                {sidebarData.user.name}
              </div>
              <div className="text-xs text-gray-400">
                {sidebarData.user.email}
              </div>
            </div>
          </div>
          <MoreHorizontal className="w-4 h-4 text-gray-400" />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
