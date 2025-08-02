import React from 'react';
import { UserAvatar } from './UserAvatar';
import { Calendar, Mail, ExternalLink, Shield } from 'lucide-react';
import type { UserProfile } from '../../hooks/useUserProfile';

interface UserHeaderProps {
  user: UserProfile;
}

export function UserHeader({ user }: UserHeaderProps) {
  const joinedDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  const lastActive = new Date(user.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        {/* Avatar */}
        <UserAvatar 
          src={user.image} 
          alt={user.name || 'User'} 
          size="xl" 
          className="shrink-0"
        />

        {/* User Info */}
        <div className="flex-1 space-y-3">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              {user.name || 'Anonymous User'}
            </h1>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-gray-300 text-sm">{user.email}</span>
              {user.emailVerified && (
                <div className="flex items-center gap-1 text-green-400">
                  <Shield className="w-4 h-4" />
                  <span className="text-xs">Verified</span>
                </div>
              )}
            </div>
          </div>

          {/* Additional Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Joined {joinedDate}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <span>Last active {lastActive}</span>
            </div>

            {user.leetcodeUsername && (
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                <a 
                  href={`https://leetcode.com/${user.leetcodeUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  @{user.leetcodeUsername}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-300 text-sm">Overall Progress</span>
          <span className="text-white font-medium text-sm">
            {user.stats.completedQuestions}/{user.stats.totalQuestions}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
            style={{ 
              width: `${Math.round((user.stats.completedQuestions / user.stats.totalQuestions) * 100)}%` 
            }}
          ></div>
        </div>
        <p className="text-gray-400 text-xs mt-1">
          {Math.round((user.stats.completedQuestions / user.stats.totalQuestions) * 100)}% Complete
        </p>
      </div>
    </div>
  );
}
