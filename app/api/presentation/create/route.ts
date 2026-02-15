import { NextRequest, NextResponse } from 'next/server';
import { addPresentation, initializeDataStore } from '@/lib/dataStore';
import { generatePresentationCode } from '@/lib/codeGenerator';

// Initialize on first request
initializeDataStore();

export async function POST(request: NextRequest) {
  try {
    const { presenterName, sessionId } = await request.json();

    if (!presenterName || !sessionId) {
      return NextResponse.json({ success: false, error: 'Presenter name and session ID are required' }, { status: 400 });
    }

    const code = generatePresentationCode();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 8 * 60 * 60 * 1000); // 8 hours

    const presentation = {
      code,
      presenterName,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      type: 'presentation' as const,
      status: 'active' as const,
      currentSlide: 0,
      totalSlides: 0,
      slidesPath: `/uploads/${code}/slides/`,
      presentationFile: '',
      connectedAudience: [],
    };

    addPresentation(presentation);

    return NextResponse.json({
      success: true,
      data: {
        code,
        expiresAt: expiresAt.toISOString(),
      },
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to create presentation, ', err }, { status: 500 });
  }
}
