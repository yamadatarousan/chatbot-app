export async function fetchChatHistory(sessionId: string) {
    const response = await fetch(`/api/chat/history?session_id=${sessionId}`, {
        headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to fetch chat history');
    return response.json();
}

export async function sendMessage(sessionId: string, message: string) {
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, message }),
    });
    if (!response.ok) throw new Error('Failed to send message');
    return response.json();
}