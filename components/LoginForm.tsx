'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export function LoginForm() {
  const [name, setName] = useState('');
  const [role, setRole] = useState<'presenter' | 'audience' | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!role) {
      setError('Please select a role');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), role }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || 'Authentication failed');
        return;
      }

      // Store session info
      sessionStorage.setItem('sessionId', result.data.sessionId);
      sessionStorage.setItem('userName', result.data.userName);
      sessionStorage.setItem('role', result.data.role);

      // Redirect based on role
      if (role === 'presenter') {
        router.push('/presenter');
      } else {
        router.push('/audience');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Live Presentation Platform</h1>
          <p className="text-muted-foreground">Join or host a real-time presentation</p>
        </div>

        {/* Form Container */}
        <div className="bg-card border border-border rounded-md p-8 space-y-6">
          {/* Name Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Your Name</label>
            <Input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && name && role) {
                  handleLogin();
                }
              }}
              disabled={loading}
              className="w-full px-4 py-3 border border-border rounded-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Role Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground">Select Your Role</label>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setRole('presenter');
                  setError('');
                }}
                disabled={loading}
                className={`w-full p-4 rounded-md border transition-colors text-left ${
                  role === 'presenter'
                    ? 'border-primary bg-blue-50 text-foreground'
                    : 'border-border bg-card text-foreground hover:border-primary/50'
                } disabled:opacity-50`}
              >
                <div className="font-medium">Presenter</div>
                <div className="text-sm text-muted-foreground">Share slides and control presentation</div>
              </button>
              <button
                onClick={() => {
                  setRole('audience');
                  setError('');
                }}
                disabled={loading}
                className={`w-full p-4 rounded-md border transition-colors text-left ${
                  role === 'audience'
                    ? 'border-primary bg-blue-50 text-foreground'
                    : 'border-border bg-card text-foreground hover:border-primary/50'
                } disabled:opacity-50`}
              >
                <div className="font-medium">Audience Member</div>
                <div className="text-sm text-muted-foreground">Watch and follow along</div>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-3 p-3 bg-error/10 border border-error/20 rounded-md">
              <AlertCircle className="w-4 h-4 text-error flex-shrink-0 mt-0.5" />
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            onClick={handleLogin}
            disabled={loading || !name.trim() || !role}
            className="w-full bg-primary hover:bg-primary-dark text-primary-foreground py-3 rounded-md font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Joining...' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
}
