'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface AudienceCodeEntryProps {
  onSubmit: (code: string) => Promise<void>;
  loading: boolean;
  error: string;
}

export function AudienceCodeEntry({ onSubmit, loading, error }: AudienceCodeEntryProps) {
  const [code, setCode] = useState('');

  const handleSubmit = async () => {
    if (!code.trim()) return;
    await onSubmit(code.toUpperCase().trim());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
          <CardTitle className="text-2xl font-bold">Join Presentation</CardTitle>
          <CardDescription className="text-primary-foreground/80">Enter the presentation code to join</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Presentation Code</label>
              <Input
                type="text"
                placeholder="e.g., ABC123"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && code.trim()) {
                    handleSubmit();
                  }
                }}
                disabled={loading}
                maxLength={6}
                className="text-center text-lg font-mono tracking-widest border-border focus:ring-primary uppercase"
              />
              <p className="text-xs text-muted-foreground text-center">6-character code provided by presenter</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={loading || code.trim().length !== 6}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-base font-semibold"
            >
              {loading ? 'Joining...' : 'Join Presentation'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
