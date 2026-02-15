import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { getPresentation, getSlidesDirectory, initializeDataStore } from '@/lib/dataStore';

// Initialize on first request
initializeDataStore();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const slideNum = request.nextUrl.searchParams.get('slide') || '1';
    const slideIndex = parseInt(slideNum, 10);

    const presentation = getPresentation(code);
    if (!presentation) {
      return NextResponse.json({ error: 'Presentation not found' }, { status: 404 });
    }

    if (slideIndex < 1 || slideIndex > presentation.totalSlides) {
      return NextResponse.json({ error: 'Invalid slide number' }, { status: 400 });
    }

    // Read the slide image
    const slidesDir = getSlidesDirectory(code);
    const slideFile = path.join(slidesDir, `slide-${slideIndex}.png`);

    console.log('[v0] Fetching slide:', {
      code,
      slideIndex,
      slidesDir,
      slideFile,
    });

    try {
      const imageBuffer = await readFile(slideFile);
      console.log('[v0] Slide file found:', slideFile);
      return new NextResponse(imageBuffer, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    } catch (err) {
      console.log('[v0] Slide file not found, returning placeholder:', slideFile, err);
      // Return placeholder if slide doesn't exist
      const pngBuffer = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
        0x89, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x44, 0x41, 0x54, 0x08, 0x5b, 0x63, 0xf8, 0x0f, 0x00, 0x00,
        0x01, 0x01, 0x01, 0x00, 0x18, 0xdd, 0x8d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44,
        0xae, 0x42, 0x60, 0x82,
      ]);
      return new NextResponse(pngBuffer, {
        headers: { 'Content-Type': 'image/png' },
      });
    }
  } catch (error) {
    console.error('Slide fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch slide' }, { status: 500 });
  }
}
