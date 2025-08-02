import React from "react";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'User Profile | LeetCode Tracker',
  description: 'View user profile and progress statistics',
};

interface UserLayoutProps {
  children: React.ReactNode;
}

export default function UserLayout({ children }: UserLayoutProps) {
  return (
    <div className="min-h-screen bg-black">
      {/* Global background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,0.8),rgba(0,0,0,0.8))] pointer-events-none"></div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}