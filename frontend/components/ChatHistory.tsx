'use client';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { fetchChatHistory, sendMessage } from '../lib/api';

type ChatMessage = {
    message: string;
    sender: 'user' | 'ai';
    created_at: string;
};

function getSessionId() {
    let sessionId = localStorage.getItem('session_id');
    if (!sessionId) {
        sessionId = uuidv4();
        localStorage.setItem('session_id', sessionId);
    }
    return sessionId;
}

export default function ChatHistory() {
    const sessionId = getSessionId();
    const [history, setHistory] = useState<ChatMessage[]>([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadHistory() {
            try {
                const data = await fetchChatHistory(sessionId);
                setHistory(data);
            } catch (error) {
                console.error('Error loading history:', error);
            } finally {
                setLoading(false);
            }
        }
        loadHistory();
    }, [sessionId]);

    const handleSend = async () => {
        if (!message.trim()) return;
        try {
            await sendMessage(sessionId, message);
            const updatedHistory = await fetchChatHistory(sessionId);
            setHistory(updatedHistory);
            setMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <div className="chat-history">
            {loading ? (
                <div>読み込み中...</div>
            ) : history.length === 0 ? (
                <div>履歴がありません</div>
            ) : (
                history.map((item, index) => (
                    <div key={index} className={`message ${item.sender}`}>
                        <strong>{item.sender === 'user' ? 'あなた' : 'AI'}:</strong> {item.message}
                        <span className="timestamp">{new Date(item.created_at).toLocaleString()}</span>
                    </div>
                ))
            )}
            <div className="input-area">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="メッセージを入力..."
                />
                <button onClick={handleSend}>送信</button>
            </div>
        </div>
    );
}