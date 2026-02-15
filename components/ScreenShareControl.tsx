'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Monitor, X, AlertCircle } from 'lucide-react';

interface ScreenShareControlProps {
  presentationCode: string;
  onModeChange: (mode: 'presentation' | 'screenshare') => void;
  currentMode: 'presentation' | 'screenshare';
}

interface PeerConnection {
  id: string; // audience member ID (or session ID)
  pc: RTCPeerConnection;
  candidatesQueue: RTCIceCandidate[];
}

export function ScreenShareControl({
  presentationCode,
  onModeChange,
  currentMode,
}: ScreenShareControlProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState('');
  const streamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<PeerConnection[]>([]);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const lastSignalTimeRef = useRef<number>(Date.now());
  const isSharingRef = useRef(false);

  // Configuration for ICE servers (using public STUN for now)
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

    peersRef.current.forEach(p => p.pc.close());
    peersRef.current = [];

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const sendSignal = async (type: string, target: string, data: any) => {
    await fetch('/api/signaling', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        target, // Target specific audience member
        sender: 'presenter',
        data
      }),
    });
  };

  const handleSignaling = async () => {
    try {
      const response = await fetch(`/api/signaling?target=presenter&since=${lastSignalTimeRef.current}`);
      const result = await response.json();

      if (result.success && result.messages.length > 0) {
        for (const msg of result.messages) {
          lastSignalTimeRef.current = Math.max(lastSignalTimeRef.current, msg.timestamp);

          if (msg.type === 'join_request') {
            // Audience wants to join, initiate connection
            createPeerConnection(msg.sender);
          } else if (msg.type === 'answer') {
            const peer = peersRef.current.find(p => p.id === msg.sender);
            if (peer) {
              console.log(`Received answer from ${msg.sender}. Current state: ${peer.pc.signalingState}`);
              if (peer.pc.signalingState === 'have-local-offer') {
                await peer.pc.setRemoteDescription(new RTCSessionDescription(msg.data));
                // Process queued candidates
                for (const candidate of peer.candidatesQueue) {
                  await peer.pc.addIceCandidate(candidate);
                }
                peer.candidatesQueue = [];
              } else {
                console.warn(`Ignored answer from ${msg.sender} in state ${peer.pc.signalingState}`);
              }
            }
          } else if (msg.type === 'ice-candidate') {
            const peer = peersRef.current.find(p => p.id === msg.sender);
            if (peer) {
              console.log(`Received ICE candidate from ${msg.sender}`);
              try {
                if (peer.pc.remoteDescription) {
                  await peer.pc.addIceCandidate(new RTCIceCandidate(msg.data));
                  console.log(`Added ICE candidate from ${msg.sender}`);
                } else {
                  peer.candidatesQueue.push(new RTCIceCandidate(msg.data));
                  console.log(`Queued ICE candidate from ${msg.sender}`);
                }
              } catch (e) {
                console.error('Error adding ICE candidate:', e);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('Signaling poll error:', err);
    }
  };

  const createPeerConnection = async (audienceId: string) => {
    // Check if already connected, if so, cleanup and reconnect
    const existingPeerIndex = peersRef.current.findIndex(p => p.id === audienceId);
    if (existingPeerIndex !== -1) {
      console.log('Re-establishing connection for:', audienceId);
      peersRef.current[existingPeerIndex].pc.close();
      peersRef.current.splice(existingPeerIndex, 1);
    }

    console.log('Creating connection for:', audienceId);
    const pc = new RTCPeerConnection(rtcConfig);

    // Add local stream tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, streamRef.current!);
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal('ice-candidate', audienceId, event.candidate);
      }
    };

    pc.onconnectionstatechange = () => {
      console.log(`Connection state for ${audienceId}: ${pc.connectionState}`);
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        // Remove peer
        peersRef.current = peersRef.current.filter(p => p.id !== audienceId);
      }
    };

    peersRef.current.push({ id: audienceId, pc, candidatesQueue: [] });

    // Create Offer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    await sendSignal('offer', audienceId, offer);
  };

  const handleStartScreenShare = async () => {
    try {
      setError('');

      // Request screen capture
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      streamRef.current = stream;
      setIsSharing(true);
      isSharingRef.current = true;
      lastSignalTimeRef.current = Date.now();

      // Notify backend to update session mode
      const response = await fetch('/api/screenshare/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: presentationCode }),
      });

      const result = await response.json();
      if (result.success) {
        onModeChange('screenshare');
      }

      // Start Polling (recursive setTimeout)
      const poll = async () => {
        if (!isSharingRef.current) return; // Use ref to avoid stale closure
        await handleSignaling();
        if (pollingRef.current) {
          pollingRef.current = setTimeout(poll, 1000);
        }
      };
      pollingRef.current = setTimeout(poll, 1000);

      // Listen for when user stops sharing via browser UI
      stream.getVideoTracks()[0].addEventListener('ended', handleStopScreenShare);
    } catch (err) {
      if ((err as Error).name === 'NotAllowedError') {
        setError('Screen capture permission denied');
      } else {
        setError('Failed to start screen sharing');
        console.error(err);
      }
      setIsSharing(false);
      isSharingRef.current = false;
    }
  };

  const handleStopScreenShare = async () => {
    cleanup();
    setIsSharing(false);
    isSharingRef.current = false;

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
            <div className="text-xs text-muted-foreground">
              Connected Peers: {peersRef.current.length}
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
