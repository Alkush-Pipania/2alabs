import React from 'react';
import { User } from 'lucide-react';

interface UserAvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-base',
  xl: 'w-24 h-24 text-lg'
};

export function UserAvatar({ 
  src, 
  alt = 'User avatar', 
  size = 'md', 
  className = '' 
}: UserAvatarProps) {
  if (src) {
    return (
      <div className={`relative ${sizeClasses[size]} ${className}`}>
        <img
          src={src}
          alt={alt}
          className="w-full h-full rounded-full object-cover ring-2 ring-gray-700 hover:ring-gray-600 transition-all duration-200"
        />
      </div>
    );
  }

  return (
    <div className={`
      relative ${sizeClasses[size]} ${className}
      bg-gray-800 rounded-full 
      flex items-center justify-center 
      ring-2 ring-gray-700 hover:ring-gray-600 
      transition-all duration-200
    `}>
      <User className="w-1/2 h-1/2 text-gray-400" />
    </div>
  );
}
