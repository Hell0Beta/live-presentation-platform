'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Monitor, X, AlertCircle } from 'lucide-react';

interface ScreenShareControlProps {
  presentationCode: string;
  onModeChange: (mode: 'presentation' | 'screenshare') => void;
  currentMode: 'presentation' | 'screenshare';
}

export function ScreenShareControl({
  presentationCode,
  onModeChange,
  currentMode,
}: ScreenShareControlProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState('');
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleStartScreenShare = async () => {
    try {
      setError('');

      // Request screen capture
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: false,
      });

      streamRef.current = stream;
      setIsSharing(true);

      // Notify backend
      const response = await fetch('/api/screenshare/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: presentationCode }),
      });

      const result = await response.json();
      if (result.success) {
        onModeChange('screenshare');
      }

      // Listen for when user stops sharing via browser UI
      stream.getVideoTracks()[0].addEventListener('ended', handleStopScreenShare);
    } catch (err) {
      if ((err as Error).name === 'NotAllowedError') {
        setError('Screen capture permission denied');
      } else {
        setError('Failed to start screen sharing');
      }
      setIsSharing(false);
    }
  };

  const handleStopScreenShare = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setIsSharing(false);

    // Switch back to presentation mode
    try {
      await fetch(`/api/presentation/${presentationCode}/navigate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction: 'prev' }),
      });
    } catch (err) {
      console.error('Failed to switch back to presentation mode:', err);
    }

    onModeChange('presentation');
  };

  if (currentMode === 'screenshare' && !isSharing) {
    return null;
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-accent text-accent-foreground rounded-t-lg">
        <CardTitle className="text-lg flex items-center gap-2">
          <Monitor className="w-5 h-5" />
          Screen Share
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
            <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {isSharing ? (
          <div className="space-y-4">
            <div className="p-4 bg-accent/20 border border-accent rounded-lg">
              <p className="text-sm font-medium text-foreground flex items-center gap-2">
                <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                Screen sharing is active
              </p>
            </div>
            <Button
              onClick={handleStopScreenShare}
              variant="destructive"
              className="w-full gap-2"
            >
              <X className="w-4 h-4" />
              Stop Screen Share
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleStartScreenShare}
            className="w-full gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            <Monitor className="w-4 h-4" />
            Start Screen Share
          </Button>
        )}

        <p className="text-xs text-muted-foreground text-center">
          {isSharing
            ? 'Sharing your screen with audience members'
            : 'Click to share your screen with audience members'}
        </p>
      </CardContent>
    </Card>
  );
}
