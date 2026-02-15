import { NextRequest, NextResponse } from 'next/server';
import { getPresentation, updatePresentation } from '@/lib/dataStore';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const { audienceName } = await request.json();

    if (!audienceName) {
      return NextResponse.json({ success: false, error: 'Audience name is required' }, { status: 400 });
    }

    const presentation = getPresentation(code);
    if (!presentation) {
      return NextResponse.json({ success: false, error: 'Presentation not found' }, { status: 404 });
    }

    if (presentation.status !== 'active') {
      return NextResponse.json({ success: false, error: 'Presentation is not active' }, { status: 400 });
    }

    // Add audience member
    const newAudience = {
      name: audienceName,
      joinedAt: new Date().toISOString(),
    };

    const updated = updatePresentation(code, {
      connectedAudience: [...presentation.connectedAudience, newAudience],
    });

    return NextResponse.json({
      success: true,
      data: {
        presenterName: presentation.presenterName,
        currentSlide: presentation.currentSlide,
        totalSlides: presentation.totalSlides,
        type: presentation.type,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to join presentation' }, { status: 500 });
  }
}
