import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { name, role } = await request.json();

    if (!name || !role) {
      return NextResponse.json({ success: false, error: 'Name and role are required' }, { status: 400 });
    }

    if (!['presenter', 'audience'].includes(role)) {
      return NextResponse.json({ success: false, error: 'Invalid role' }, { status: 400 });
    }

    const sessionId = uuidv4();

    return NextResponse.json({
      success: true,
      data: {
        sessionId,
        userName: name,
        role,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Authentication failed' }, { status: 500 });
  }
}
