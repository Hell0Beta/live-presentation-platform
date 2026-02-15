'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

interface AudienceViewerProps {
  code: string;
  userName: string;
  presenterName: string;
  onLogout: () => void;
}

interface SlideData {
  currentSlide: number;
  slideUrl: string | null;
  totalSlides: number;
  type: 'presentation' | 'screenshare';
}

export function AudienceViewer({ code, userName, presenterName, onLogout }: AudienceViewerProps) {
  const [slide, setSlide] = useState<SlideData>({
    currentSlide: 0,
    slideUrl: null,
    totalSlides: 0,
    type: 'presentation',
  });
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const lastSignalTimeRef = useRef<number>(Date.now());
  const hasJoinedRef = useRef(false);
  const candidatesQueue = useRef<RTCIceCandidateInit[]>([]);

  // Configuration for ICE servers
  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
    ],
  };

  const cleanup = useCallback(() => {
    if (pollingRef.current) {
      clearTimeout(pollingRef.current);
      pollingRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    hasJoinedRef.current = false;
  }, []);

  const sendSignal = async (type: string, data: any) => {
    await fetch('/api/signaling', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        target: 'presenter',
        sender: userName, // Use userName as ID
        data
      }),
    });
  };

  const handleSignaling = async () => {
    try {
      // Poll for messages targeting this user
      const response = await fetch(`/api/signaling?target=${encodeURIComponent(userName)}&since=${lastSignalTimeRef.current}`);
      const result = await response.json();

      if (result.success && result.messages.length > 0) {
        for (const msg of result.messages) {
          lastSignalTimeRef.current = Math.max(lastSignalTimeRef.current, msg.timestamp);

          if (msg.type === 'offer') {
            await handleOffer(msg.data);
          } else if (msg.type === 'ice-candidate') {
            console.log('Received ICE candidate from presenter');
            try {
              if (pcRef.current && pcRef.current.remoteDescription) {
                await pcRef.current.addIceCandidate(new RTCIceCandidate(msg.data));
                console.log('Added ICE candidate from presenter');
              } else {
                candidatesQueue.current.push(msg.data);
                console.log('Queued ICE candidate from presenter');
              }
            } catch (e) {
              console.error('Error adding ICE candidate:', e);
            }
          }
        }
      }
    } catch (err) {
      console.error('Signaling poll error:', err);
    }
  };

  const handleOffer = async (offer: RTCSessionDescriptionInit) => {
    if (pcRef.current) pcRef.current.close();

    const pc = new RTCPeerConnection(rtcConfig);
    pcRef.current = pc;

    pc.ontrack = (event) => {
      console.log('Received remote track');
      if (videoRef.current) {
        videoRef.current.srcObject = event.streams[0];
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal('ice-candidate', event.candidate);
      }
    };

    await pc.setRemoteDescription(new RTCSessionDescription(offer));

    // Process queued candidates
    for (const candidate of candidatesQueue.current) {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
    candidatesQueue.current = [];

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    await sendSignal('answer', answer);
  };

  const startWebRTC = async () => {
    if (hasJoinedRef.current) return;
    hasJoinedRef.current = true;

    // Send join request
    await sendSignal('join_request', {});

    // Start polling (recursive setTimeout)
    const poll = async () => {
      if (!hasJoinedRef.current) return;
      await handleSignaling();
      if (pollingRef.current) {
        pollingRef.current = setTimeout(poll, 1000);
      }
    };
    pollingRef.current = setTimeout(poll, 1000);
  };

  useEffect(() => {
    const fetchSlide = async () => {
      try {
        const response = await fetch(`/api/presentation/${code}/current`);
        const result = await response.json();

        if (result.success) {
          setSlide(result.data);

          // Check if mode switched to screenshare
          if (result.data.type === 'screenshare' && !hasJoinedRef.current) {
            startWebRTC();
          } else if (result.data.type !== 'screenshare' && hasJoinedRef.current) {
            // Stop WebRTC if switched back
            cleanup();
          }
        }
      } catch (err) {
        console.error('Failed to fetch slide:', err);
      } finally {
        setLoading(false);
      }
    };

    // Fetch immediately
    fetchSlide();

    // Set up polling every 2 seconds
    const interval = setInterval(fetchSlide, 2000);

    return () => {
      clearInterval(interval);
      cleanup();
    };
  }, [code, cleanup, userName]);

  // Join the presentation
  useEffect(() => {
    const joinPresentation = async () => {
      try {
        await fetch(`/api/presentation/${code}/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: userName }),
        });
      } catch (err) {
        console.error('Failed to join:', err);
      }
    };
    joinPresentation();
  }, [code, userName]);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Top Bar */}
      <div className="bg-card border-b border-border px-8 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-foreground">Live Presentation Platform</h1>
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
            <span>•</span>
            <span>Presented by {presenterName}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span className="text-xs font-medium text-foreground">Live</span>
          </div>
          <Button onClick={onLogout} variant="ghost" size="sm" className="h-8 px-3 text-muted-foreground hover:text-foreground">
            <LogOut className="w-4 h-4 mr-2" />
            Exit
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex items-center justify-center bg-black relative">
        {slide.type === 'screenshare' ? (
          <div className="w-full h-full flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            />
            {!videoRef.current?.srcObject && (
              <div className="absolute inset-0 flex items-center justify-center text-white bg-black/50">
                <p>Connecting to stream...</p>
              </div>
            )}
          </div>
        ) : slide.slideUrl ? (
          <img
            src={slide.slideUrl || "/placeholder.svg"}
            alt={`Slide ${slide.currentSlide + 1}`}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="text-center text-muted-foreground">
            <p className="text-lg font-medium mb-2">Waiting for presentation to start...</p>
            <p className="text-sm">Slides will appear when the presenter shares them</p>
          </div>
        )}
      </div>

      {/* Footer Bar */}
      <div className="bg-card border-t border-border px-8 py-4 flex items-center justify-between text-sm flex-shrink-0">
        <div className="text-muted-foreground">
          <span className="font-medium text-foreground">{userName}</span>
          <span className="mx-2">•</span>
          Code: <span className="font-mono font-semibold text-primary">{code}</span>
        </div>
        <div className="text-muted-foreground">
          {slide.type === 'screenshare' ? (
            <span className="text-primary font-semibold flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Viewing Screen Share
            </span>
          ) : (
            <>
              Slide <span className="font-semibold text-foreground">{slide.currentSlide + 1}</span> of{' '}
              <span className="font-semibold text-foreground">{slide.totalSlides || '—'}</span>
            </>
          )}
          {loading && <span className="ml-3 inline-block">↻ syncing...</span>}
        </div>
      </div>
    </div>
  );
}
