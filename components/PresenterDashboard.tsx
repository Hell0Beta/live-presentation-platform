'use client';

import React from "react"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Copy, LogOut, Users, FileUp } from 'lucide-react';
import { ScreenShareControl } from './ScreenShareControl';
import { PresenterSidebar } from './PresenterSidebar';

interface Presentation {
  code: string;
  presenterName: string;
  currentSlide: number;
  totalSlides: number;
  type: 'presentation' | 'screenshare';
  connectedAudience: Array<{ name: string; joinedAt: string }>;
}

interface PresenterDashboardProps {
  presentation: Presentation;
  onLogout: () => void;
  onNavigate: (direction: string) => Promise<void>;
  onUpload: (file: File) => Promise<void>;
  onModeChange?: (mode: 'presentation' | 'screenshare') => void;
}

export function PresenterDashboard({
  presentation,
  onLogout,
  onNavigate,
  onUpload,
  onModeChange,
}: PresenterDashboardProps) {
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [sessionStart] = useState(new Date());

  const handleCopyCode = () => {
    navigator.clipboard.writeText(presentation.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await onUpload(file);
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const getSessionDuration = () => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - sessionStart.getTime()) / 1000);
    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <PresenterSidebar
        code={presentation.code}
        presenterName={presentation.presenterName}
        audienceCount={presentation.connectedAudience.length}
        onCopyCode={handleCopyCode}
        onLogout={onLogout}
        mode={presentation.type}
        onModeChange={onModeChange || (() => {})}
        sessionDuration={getSessionDuration()}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="border-b border-border bg-card px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              {presentation.type === 'presentation' ? 'Presentation Mode' : 'Screen Share Mode'}
            </h1>
          </div>
          <div className="text-xs text-muted-foreground">
            Slide {presentation.currentSlide + 1} of {presentation.totalSlides || 0}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="grid grid-cols-2 gap-8">
              {/* Left Column - Upload & Controls */}
              <div className="space-y-6">
                {/* Upload Panel */}
                <div className="bg-card border border-border rounded-md p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">Upload Presentation</h2>
                  <div className="border-2 border-dashed border-border rounded-md p-8 text-center hover:border-primary/50 transition-colors cursor-pointer relative hover:bg-blue-50">
                    <input
                      type="file"
                      accept=".ppt,.pptx,.pdf"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="space-y-2 flex flex-col items-center">
                      <FileUp className="w-8 h-8 text-primary" />
                      <p className="text-sm font-medium text-foreground">
                        {uploading ? 'Uploading...' : 'Drag & drop or click to upload'}
                      </p>
                      <p className="text-xs text-muted-foreground">PPT, PPTX, or PDF up to 50MB</p>
                    </div>
                  </div>
                  {presentation.totalSlides > 0 && (
                    <div className="mt-4 p-3 bg-success/10 border border-success/20 rounded-md text-center">
                      <p className="text-sm font-medium text-success">
                        {presentation.totalSlides} slide{presentation.totalSlides !== 1 ? 's' : ''} loaded
                      </p>
                      {(presentation as any).uploadedFileName && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {(presentation as any).uploadedFileName}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Navigation Panel */}
                {presentation.totalSlides > 0 && (
                  <div className="bg-card border border-border rounded-md p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Navigate Slides</h2>
                    <div className="flex gap-3 mb-4">
                      <Button
                        onClick={() => onNavigate('prev')}
                        disabled={presentation.currentSlide === 0}
                        variant="outline"
                        className="flex-1"
                      >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Previous
                      </Button>
                      <Button
                        onClick={() => onNavigate('next')}
                        disabled={presentation.currentSlide >= presentation.totalSlides - 1}
                        className="flex-1 bg-primary hover:bg-primary-dark"
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                    <div className="bg-background rounded-md p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-1">Current Slide</p>
                      <p className="text-3xl font-bold text-primary">{presentation.currentSlide + 1}</p>
                      <p className="text-xs text-muted-foreground mt-1">of {presentation.totalSlides}</p>
                    </div>
                  </div>
                )}

                {/* Screen Share Control */}
                <ScreenShareControl
                  presentationCode={presentation.code}
                  currentMode={presentation.type}
                  onModeChange={(mode) => onModeChange?.(mode)}
                />
              </div>

              {/* Right Column - Preview & Audience */}
              <div className="space-y-6">
                {/* Slide Preview */}
                {presentation.totalSlides > 0 && (
                  <div className="bg-card border border-border rounded-md overflow-hidden">
                    <div className="bg-background p-4 border-b border-border">
                      <p className="text-sm font-medium text-foreground">Live Preview</p>
                    </div>
                    <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
                      <img
                        src={`/api/presentation/${presentation.code}/slide?slide=${presentation.currentSlide + 1}`}
                        alt={`Slide ${presentation.currentSlide + 1}`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                )}

                {/* Audience List */}
                <div className="bg-card border border-border rounded-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-foreground">Connected Viewers</h2>
                    <span className="text-2xl font-bold text-primary">{presentation.connectedAudience.length}</span>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {presentation.connectedAudience.length > 0 ? (
                      presentation.connectedAudience.map((member, idx) => (
                        <div key={idx} className="p-3 bg-background rounded-md border border-border">
                          <p className="font-medium text-sm text-foreground">{member.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(member.joinedAt).toLocaleTimeString()}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground text-sm py-6">
                        Waiting for audience members...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
