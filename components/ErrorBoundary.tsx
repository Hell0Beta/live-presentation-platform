'use client';

import React, { Component, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-0 shadow-lg">
            <CardHeader className="bg-destructive text-destructive-foreground rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Something Went Wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-sm text-foreground">
                An unexpected error occurred. Please try refreshing the page or contact support.
              </p>
              {this.state.error && (
                <details className="text-xs">
                  <summary className="cursor-pointer font-medium text-muted-foreground">Error Details</summary>
                  <pre className="mt-2 p-2 bg-muted rounded overflow-auto text-foreground">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
              <Button
                onClick={() => window.location.reload()}
                className="w-full bg-destructive hover:bg-destructive/90"
              >
                Reload Page
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
