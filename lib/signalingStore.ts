
export interface SignalMessage {
    type: 'offer' | 'answer' | 'ice-candidate';
    target: string; // 'presenter' or audience ID
    sender: string;
    data: any;
    timestamp: number;
}

// Simple in-memory store for signaling
// In a real app, use Redis or a database
const POLL_TIMEOUT = 20000; // 20s long poll

// Basic monotonically increasing timestamp generator
let lastTimestamp = Date.now();
function getUniqueTimestamp() {
    let now = Date.now();
    if (now <= lastTimestamp) {
        now = lastTimestamp + 1;
    }
    lastTimestamp = now;
    return now;
}

declare global {
    var signalingMessages: SignalMessage[] | undefined;
}

const messages: SignalMessage[] = globalThis.signalingMessages || [];
if (process.env.NODE_ENV !== 'production') globalThis.signalingMessages = messages;

export function addMessage(message: SignalMessage) {
    const timestamp = getUniqueTimestamp();
    console.log(`[SignalingStore] Add: ${message.type} from ${message.sender} to ${message.target} at ${timestamp}`);
    messages.push({ ...message, timestamp });

    // Cleanup old messages (> 1 minute)
    const now = Date.now();
    if (messages.length > 1000) {
        const cutoff = now - 60000;
        const index = messages.findIndex(m => m.timestamp > cutoff);
        if (index > 0) messages.splice(0, index);
    }
}

export function getMessagesFor(recipient: string, since: number = 0): SignalMessage[] {
    const msgs = messages.filter(m => m.target === recipient && m.timestamp > since);
    if (msgs.length > 0) {
        console.log(`[SignalingStore] Get: ${msgs.length} messages for ${recipient} since ${since}`);
    }
    return msgs;
}
