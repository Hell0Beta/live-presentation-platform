'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AudienceCodeEntry } from '@/components/AudienceCodeEntry';
import { AudienceViewer } from '@/components/AudienceViewer';

export default function AudiencePage() {
  const router = useRouter();
  const [joined, setJoined] = useState(false);
  const [code, setCode] = useState('');
  const [userName, setUserName] = useState('');
  const [presenterName, setPresenterName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUserName = sessionStorage.getItem('userName');
    const storedRole = sessionStorage.getItem('role');

    if (!storedUserName || storedRole !== 'audience') {
      router.push('/login');
      return;
    }

    setUserName(storedUserName);
  }, [router]);

  const handleJoin = async (presentationCode: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/presentation/${presentationCode}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audienceName: userName }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || 'Failed to join presentation');
        return;
      }

      setCode(presentationCode);
      setPresenterName(result.data.presenterName);
      setJoined(true);
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    router.push('/login');
  };

  if (!userName) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-foreground font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (joined) {
    return (
      <AudienceViewer
        code={code}
        userName={userName}
        presenterName={presenterName}
        onLogout={handleLogout}
      />
    );
  }

  return <AudienceCodeEntry onSubmit={handleJoin} loading={loading} error={error} />;
}
