import { NextRequest, NextResponse } from 'next/server';
import { getPresentation, updatePresentation } from '@/lib/dataStore';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const { direction } = await request.json();

    const presentation = getPresentation(code);
    if (!presentation) {
      return NextResponse.json({ success: false, error: 'Presentation not found' }, { status: 404 });
    }

    let newSlide = presentation.currentSlide;

    if (direction === 'next') {
      if (newSlide < presentation.totalSlides - 1) {
        newSlide++;
      }
    } else if (direction === 'prev') {
      if (newSlide > 0) {
        newSlide--;
      }
    } else if (typeof direction === 'number') {
      if (direction >= 0 && direction <= presentation.totalSlides) {
        newSlide = direction;
      }
    }

    updatePresentation(code, { currentSlide: newSlide });

    return NextResponse.json({
      success: true,
      data: {
        currentSlide: newSlide,
        totalSlides: presentation.totalSlides,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to navigate' }, { status: 500 });
  }
}
