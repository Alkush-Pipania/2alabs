import React from 'react'
import { SessionsTable } from '@/components/dashboard/sessions/sessions-table'
import { LiquidButton } from '@/components/liquid-glass-button'
import CreateSessionDialog from '@/components/dashboard/sessions/create-dialog-box'

export default function DashboardPage() {
  return (
    <div className="flex flex-col space-y-6 md:space-y-8 p-4 md:p-8">

      {/* Sessions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Sessions</h2>
            <p className="text-sm text-muted-foreground">
              View and manage your application sessions
            </p>
          </div>
          <CreateSessionDialog>
            <LiquidButton>
              Create Session
            </LiquidButton>
          </CreateSessionDialog>
        </div>
        
        {/* Sessions Table */}
        <div className="rounded-lg border bg-card md:border">
          <SessionsTable />
        </div>
      </div>
    </div>
  )
}
