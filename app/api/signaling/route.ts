import { NextRequest, NextResponse } from 'next/server';
import { addMessage, getMessagesFor } from '@/lib/signalingStore';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        console.log(`[API] POST /api/signaling type=${body.type} sender=${body.sender} target=${body.target}`);
        const { type, target, sender, data } = body;

        if (!type || !target || !sender || !data) {
            return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
        }

        addMessage({ type, target, sender, data, timestamp: Date.now() });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[API] POST Error:', error);
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const target = searchParams.get('target');
    const since = parseInt(searchParams.get('since') || '0');
    // console.log(`[API] GET /api/signaling target=${target} since=${since}`); // Uncomment for verbose logs

    if (!target) {
        console.log(`[API] GET /api/signaling target=${target} since=${since}`);
        return NextResponse.json({ success: false, error: 'Missing target' }, { status: 400 });
    }

    // Simple long-polling simulation
    // Check immediately
    let messages = getMessagesFor(target, since);

    // If no messages, wait a bit (up to 2 seconds) to avoid hammering
    if (messages.length === 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        messages = getMessagesFor(target, since);
    }

    return NextResponse.json({ success: true, messages });
}
