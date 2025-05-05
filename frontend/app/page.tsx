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
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
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
      await fetchHistory();
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
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-blue-600 to-emerald-500 text-white p-4 flex justify-center items-center shadow-lg">
        <div className="flex space-x-4">
          <Image src="/icons/globe.svg" alt="Globe" width={100} height={24} priority className="hover:scale-110 transition-transform duration-300" />
          <Image src="/icons/next.svg" alt="Next.js" width={100} height={24} priority className="hover:scale-110 transition-transform duration-300" />
          <Image src="/icons/vercel.svg" alt="Vercel" width={100} height={24} priority className="hover:scale-110 transition-transform duration-300" />
        </div>
        <h1 className="text-2xl font-bold text-center flex-1">AIチャットボット</h1>
      </header>

      <div ref={chatRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {history.length === 0 ? (
          <div className="text-center text-gray-500 mt-10 animate-fade-in">
            AIとチャットを始めましょう！下にメッセージを入力してください。
          </div>
        ) : (
          history.map((item, index) => (
            <div
              key={index}
              data-index={index}
              className={`flex ${item.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div
                className={`message-bubble max-w-xs md:max-w-md p-4 rounded-2xl shadow-md ${
                  item.sender === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white'
                    : item.message.startsWith('エラー:')
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800'
                }`}
              >
                <span className="font-semibold">{item.sender === 'user' ? 'You: ' : 'AI: '}</span>
                {item.message}
                <div className="text-xs text-gray-400 mt-1 opacity-70 hover:opacity-100 transition-opacity">
                  {new Date(item.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-white p-4 border-t shadow-lg">
        <div className="flex space-x-3 max-w-3xl mx-auto">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="メッセージを入力..."
            className="message-input flex-1 p-3 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none shadow-sm"
            rows={1}
          />
          <button
            onClick={sendMessage}
            disabled={!message.trim() || isLoading}
            className={`send-button px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
            }`}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
            ) : (
              '送信'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;