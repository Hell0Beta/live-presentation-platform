import { NextRequest, NextResponse } from 'next/server';
import { getPresentation, updatePresentation } from '@/lib/dataStore';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ success: false, error: 'Code is required' }, { status: 400 });
    }

    const presentation = getPresentation(code);
    if (!presentation) {
      return NextResponse.json({ success: false, error: 'Presentation not found' }, { status: 404 });
    }

    // Update presentation to screen share mode
    updatePresentation(code, {
      type: 'screenshare',
      currentSlide: 0,
    });

    return NextResponse.json({
      success: true,
      data: {
        message: 'Screen sharing started',
        type: 'screenshare',
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to start screen sharing' }, { status: 500 });
  }
}
