import React from 'react';
import { Trophy, Target, Flame, Calendar } from 'lucide-react';

interface UserStatsProps {
  stats: {
    totalQuestions: number;
    completedQuestions: number;
    easyCompleted: number;
    mediumCompleted: number;
    hardCompleted: number;
    streakCount: number;
  };
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  subtitle?: string;
  color: string;
}

function StatCard({ icon, label, value, subtitle, color }: StatCardProps) {
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-4 hover:bg-gray-800/50 transition-all duration-200">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-gray-400 text-sm">{label}</p>
          <p className="text-white font-semibold text-lg">{value}</p>
          {subtitle && (
            <p className="text-gray-500 text-xs">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function UserStats({ stats }: UserStatsProps) {
  const completionRate = Math.round((stats.completedQuestions / stats.totalQuestions) * 100);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Statistics</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          icon={<Target className="w-5 h-5 text-blue-400" />}
          label="Total Progress"
          value={stats.completedQuestions}
          subtitle={`${completionRate}% of ${stats.totalQuestions} questions`}
          color="bg-blue-500/10"
        />
        
        <StatCard
          icon={<Flame className="w-5 h-5 text-orange-400" />}
          label="Current Streak"
          value={stats.streakCount}
          subtitle="days in a row"
          color="bg-orange-500/10"
        />
      </div>

      {/* Difficulty Breakdown */}
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-4">
        <h4 className="text-white font-medium mb-3">Difficulty Breakdown</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-gray-300 text-sm">Easy</span>
            </div>
            <span className="text-white font-medium">{stats.easyCompleted}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-gray-300 text-sm">Medium</span>
            </div>
            <span className="text-white font-medium">{stats.mediumCompleted}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-gray-300 text-sm">Hard</span>
            </div>
            <span className="text-white font-medium">{stats.hardCompleted}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
