"use client"
import React from 'react';
import { useUserProfile } from '../../hooks/useUserProfile';
import { UserHeader } from './UserHeader';
import { UserStats } from './UserStats';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

interface UserProfileContainerProps {
  userId: string;
}

export function UserProfileContainer({ userId }: UserProfileContainerProps) {
  const { user, loading, error, refetch } = useUserProfile(userId);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Loading user profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Error Loading Profile</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="flex items-center gap-2 mx-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-300">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 via-black to-gray-900/20 pointer-events-none"></div>
      
      <div className="relative max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Section */}
          <div className="lg:col-span-2 space-y-6">
            <UserHeader user={user} />
            
            {/* Future sections can be added here */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
              <div className="text-gray-400 text-center py-8">
                <p>Recent activity will be displayed here...</p>
              </div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Achievements</h3>
              <div className="text-gray-400 text-center py-8">
                <p>Achievements and badges will be displayed here...</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <UserStats stats={user.stats} />
            
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Calendar</h3>
              <div className="text-gray-400 text-center py-8">
                <p>Progress calendar will be displayed here...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
