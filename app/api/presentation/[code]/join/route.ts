import { NextRequest, NextResponse } from 'next/server';
import { addAudienceMember, getPresentation } from '@/lib/dataStore';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
    }

    addAudienceMember(code, name);
    const presentation = getPresentation(code);

    if (!presentation) {
      return NextResponse.json({ success: false, error: 'Presentation not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        presenterName: presentation.presenterName
      }
    });
  } catch (error) {
    console.error('Failed to join presentation:', error);
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}
