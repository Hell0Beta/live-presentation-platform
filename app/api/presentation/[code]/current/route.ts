import { NextRequest, NextResponse } from 'next/server';
import { getPresentation } from '@/lib/dataStore';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const presentation = getPresentation(code);
    if (!presentation) {
      return NextResponse.json({ success: false, error: 'Presentation not found' }, { status: 404 });
    }

    const slideUrl = (presentation.currentSlide >= 0 && presentation.currentSlide < presentation.totalSlides)
      ? `/uploads/${code}/slides/slide-${presentation.currentSlide + 1}.png`
      : null;

    return NextResponse.json({
      success: true,
      data: {
        currentSlide: presentation.currentSlide,
        slideUrl,
        type: presentation.type,
        totalSlides: presentation.totalSlides,
        presenterName: presentation.presenterName,
        connectedAudience: presentation.connectedAudience || [],
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch current slide' }, { status: 500 });
  }
}
