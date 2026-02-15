'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface SessionData {
  sessionId: string;
  userName: string;
  role: 'presenter' | 'audience';
  presentationCode?: string;
}

export function useSession() {
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionId = sessionStorage.getItem('sessionId');
    const userName = sessionStorage.getItem('userName');
    const role = sessionStorage.getItem('role');
    const presentationCode = sessionStorage.getItem('presentationCode');

    if (sessionId && userName && role) {
      setSession({
        sessionId,
        userName,
        role: role as 'presenter' | 'audience',
        presentationCode: presentationCode || undefined,
      });
    }

    setLoading(false);
  }, []);

  const clearSession = () => {
    sessionStorage.clear();
    setSession(null);
    router.push('/login');
  };

  const updateSession = (updates: Partial<SessionData>) => {
    const updated = { ...session, ...updates } as SessionData;
    setSession(updated);

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        sessionStorage.setItem(key, String(value));
      }
    });
  };

  return {
    session,
    loading,
    clearSession,
    updateSession,
    isAuthenticated: !!session,
  };
}
