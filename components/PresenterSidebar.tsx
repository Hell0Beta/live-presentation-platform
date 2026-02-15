'use client';

import { Copy, LogOut, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PresenterSidebarProps {
  code: string;
  presenterName: string;
  audienceCount: number;
  onCopyCode: () => void;
  onLogout: () => void;
  mode: 'presentation' | 'screenshare';
  onModeChange: (mode: 'presentation' | 'screenshare') => void;
  sessionDuration: string;
}

export function PresenterSidebar({
  code,
  presenterName,
  audienceCount,
  onCopyCode,
  onLogout,
  mode,
  onModeChange,
  sessionDuration,
}: PresenterSidebarProps) {
  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground">SESSION</h2>
          <Button variant="ghost" size="sm" onClick={onLogout} className="h-8 w-8 p-0">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mb-1">Presentation Code</p>
        <div className="flex items-center gap-2 mb-4">
          <div className="font-mono text-lg font-bold text-foreground flex-1">{code}</div>
          <Button variant="outline" size="sm" onClick={onCopyCode} className="h-8 w-8 p-0 bg-transparent">
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Viewers Count */}
      <div className="px-6 py-4 border-b border-border">
        <p className="text-xs text-muted-foreground mb-2">VIEWERS</p>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-2xl font-bold text-foreground">{audienceCount}</span>
        </div>
      </div>

      {/* Session Duration */}
      <div className="px-6 py-4 border-b border-border">
        <p className="text-xs text-muted-foreground mb-1">SESSION DURATION</p>
        <p className="text-sm font-medium text-foreground">{sessionDuration}</p>
      </div>

      {/* Mode Selection */}
      <div className="px-6 py-4 border-b border-border flex-1">
        <p className="text-xs font-semibold text-foreground mb-3">MODE</p>
        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              checked={mode === 'presentation'}
              onChange={() => onModeChange('presentation')}
              className="w-4 h-4 text-primary"
            />
            <span className="text-sm text-foreground">Presentation</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              checked={mode === 'screenshare'}
              onChange={() => onModeChange('screenshare')}
              className="w-4 h-4 text-primary"
            />
            <span className="text-sm text-foreground">Screen Share</span>
          </label>
        </div>
      </div>

      {/* Presenter Info */}
      <div className="px-6 py-4">
        <p className="text-xs text-muted-tertiary">Presenter</p>
        <p className="text-sm font-medium text-foreground truncate">{presenterName}</p>
      </div>
    </div>
  );
}
