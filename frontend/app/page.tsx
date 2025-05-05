// frontend/app/page.tsx
'use client';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

type ChatMessage = {
  message: string;
  sender: 'user' | 'ai';
  created_at: string;
};

const Home: React.FC = () => {
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // セッションID管理
  const sessionId = useRef(localStorage.getItem('session_id') || uuidv4()).current;
  useEffect(() => {
    localStorage.setItem('session_id', sessionId);
  }, [sessionId]);

  // デバッグ用ログ
  useEffect(() => {
    console.log('message:', message, 'isLoading:', isLoading);
  }, [message, isLoading]);

  // テキストエリアの高さを動的に調整
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; // リセット
      textarea.style.height = `${textarea.scrollHeight}px`; // 内容に合わせて高さを設定
    }
  }, [message]);

  // 履歴取得
  const fetchHistory = async () => {
    try {
      const res = await fetch(`http://localhost/api/chat/history?session_id=${sessionId}`, {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error('履歴の取得に失敗しました');
      const data: ChatMessage[] = await res.json();
      setHistory(data);
    } catch (error) {
      setHistory([
        ...history,
        { message: `エラー: ${(error as Error).message}`, sender: 'ai', created_at: new Date().toISOString() },
      ]);
    }
  };

  // 初回ロード時に履歴を取得
  useEffect(() => {
    fetchHistory();
  }, [sessionId]);

  // メッセージ送信
  const sendMessage = async () => {
    if (!message.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ message, session_id: sessionId }),
      });
      if (!res.ok) throw new Error('サーバーエラーです');
      const data: { message: string; session_id: string } = await res.json();
      await fetchHistory(); // 送信後に履歴を更新
      setMessage('');
    } catch (error) {
      setHistory([
        ...history,
        { message: `エラー: ${(error as Error).message}`, sender: 'ai', created_at: new Date().toISOString() },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // 自動スクロール
  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [history]);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <div className="flex space-x-4">
          <Image src="/icons/globe.svg" alt="Globe" width={100} height={24} priority />
          <Image src="/icons/next.svg" alt="Next.js" width={100} height={24} priority />
          <Image src="/icons/vercel.svg" alt="Vercel" width={100} height={24} priority />
        </div>
        <h1 className="text-xl font-semibold text-gray-800">AIチャットボット</h1>
      </header>

      <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {history.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            AIとチャットを始めましょう！下にメッセージを入力してください。
          </div>
        ) : (
          history.map((item, index) => (
            <div
              key={index}
              className={`flex ${item.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs md:max-w-md p-3 rounded-lg ${
                  item.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : item.message.startsWith('エラー:')
                    ? 'bg-red-100 text-red-800'
                    : 'bg-white text-gray-800 shadow'
                }`}
              >
                {item.sender === 'user' ? 'You: ' : 'AI: '}
                {item.message}
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(item.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-white p-4 border-t shadow-sm">
        <div className="flex space-x-2 max-w-3xl mx-auto">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="メッセージを入力..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={1}
          />
          <button
            onClick={sendMessage}
            disabled={!message.trim() || isLoading}
            className={`px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 transition-colors ${
              isLoading ? 'opacity-50' : ''
            }`}
          >
            {isLoading ? '送信中...' : '送信'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;