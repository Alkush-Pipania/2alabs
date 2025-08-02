import { useState, useEffect } from 'react';

export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  emailVerified: boolean;
  image: string | null;
  leetcodeUsername: string | null;
  createdAt: string;
  updatedAt: string;
  stats: {
    totalQuestions: number;
    completedQuestions: number;
    easyCompleted: number;
    mediumCompleted: number;
    hardCompleted: number;
    streakCount: number;
  };
}

export function useUserProfile(userId?: string) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Mock data for now - replace with actual API call later
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        
        // Hardcoded mock data
        const mockUser: UserProfile = {
          id: userId || "user_123",
          name: "John Doe",
          email: "john.doe@example.com",
          emailVerified: true,
          image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
          leetcodeUsername: "johndoe_lc",
          createdAt: "2024-01-15T10:30:00Z",
          updatedAt: "2024-07-31T18:27:00Z",
          stats: {
            totalQuestions: 150,
            completedQuestions: 89,
            easyCompleted: 45,
            mediumCompleted: 32,
            hardCompleted: 12,
            streakCount: 7
          }
        };

        // Simulate API delay
        setTimeout(() => {
          setUser(mockUser);
          setLoading(false);
        }, 500);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user profile');
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  return {
    user,
    loading,
    error,
    refetch: () => {
      setLoading(true);
      setError(null);
      // Trigger refetch logic here
    }
  };
}
