'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PresenterDashboard } from '@/components/PresenterDashboard';

interface Presentation {
  code: string;
  presenterName: string;
  currentSlide: number;
  totalSlides: number;
  type: 'presentation' | 'screenshare';
  connectedAudience: Array<{ name: string; joinedAt: string }>;
  uploadedFileName?: string;
  fileType?: string;
}

export default function PresenterPage() {
  const router = useRouter();
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const initPresentation = async () => {
      try {
        const userName = sessionStorage.getItem('userName');
        const sessionId = sessionStorage.getItem('sessionId');
        const role = sessionStorage.getItem('role');

        if (!userName || !sessionId || role !== 'presenter') {
          router.push('/login');
          return;
        }

        // Create new presentation session
        const response = await fetch('/api/presentation/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ presenterName: userName, sessionId }),
        });

        const result = await response.json();
        if (!result.success) {
          setError('Failed to create presentation');
          return;
        }

        const newPresentation: Presentation = {
          code: result.data.code,
          presenterName: userName,
          currentSlide: 0,
          totalSlides: 0,
          type: 'presentation',
          connectedAudience: [],
        };

        setPresentation(newPresentation);
        sessionStorage.setItem('presentationCode', result.data.code);

        // Start polling for updates
        const pollInterval = setInterval(() => {
          fetchPresentationState(result.data.code);
        }, 2000);

        return () => clearInterval(pollInterval);
      } catch (err) {
        setError('An error occurred');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    initPresentation();
  }, [router]);

  const fetchPresentationState = async (code: string) => {
    try {
      const response = await fetch(`/api/presentation/${code}/current`);
      const result = await response.json();

      if (result.success) {
        setPresentation((prev) =>
          prev
            ? {
                ...prev,
                currentSlide: result.data.currentSlide,
                totalSlides: result.data.totalSlides,
              }
            : null
        );
      }
    } catch (err) {
      console.error('Failed to fetch presentation state:', err);
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    router.push('/login');
  };

  const handleNavigate = async (direction: string) => {
    if (!presentation) return;

    try {
      const response = await fetch(`/api/presentation/${presentation.code}/navigate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction }),
      });

      const result = await response.json();
      if (result.success) {
        setPresentation((prev) =>
          prev
            ? {
                ...prev,
                currentSlide: result.data.currentSlide,
              }
            : null
        );
      }
    } catch (err) {
      console.error('Navigation failed:', err);
    }
  };

  const handleUpload = async (file: File) => {
    if (!presentation) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('code', presentation.code);

    try {
      const response = await fetch('/api/presentation/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        console.log('[v0] Upload successful:', result.data);
        setPresentation((prev) =>
          prev
            ? {
                ...prev,
                totalSlides: result.data.slideCount,
                currentSlide: 0,
                uploadedFileName: result.data.fileName,
                fileType: result.data.fileType,
              }
            : null
        );
      }
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-foreground font-medium">Loading presentation...</p>
        </div>
      </div>
    );
  }

  if (error || !presentation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive font-medium mb-4">{error || 'Failed to load presentation'}</p>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <PresenterDashboard
      presentation={presentation}
      onLogout={handleLogout}
      onNavigate={handleNavigate}
      onUpload={handleUpload}
    />
  );
}
