import { Suspense } from 'react';
import ChatHistory from '../../components/ChatHistory';

export default function ChatPage() {
    return (
        <div>
            <h1>チャット</h1>
            <Suspense fallback={<div>読み込み中...</div>}>
                <ChatHistory />
            </Suspense>
        </div>
    );
}