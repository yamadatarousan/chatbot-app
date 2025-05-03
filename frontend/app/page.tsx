'use client';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';

const Home: React.FC = () => {
  const [message, setMessage] = useState('');
  const [replies, setReplies] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  const sendMessage = async () => {
    if (!message.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ message }),
      });
      if (!res.ok) throw new Error('API error');
      const data = await res.json(); // JSONとしてパース
      const reply = data.message; // バックエンドが返すメッセージフィールド
      setReplies([...replies, `You: ${message}`, `AI: ${reply}`]);
      setMessage('');
    } catch (error) {
      setReplies([...replies, `Error: ${(error as Error).message}`]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') sendMessage();
  };

  // 自動スクロール
  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [replies]);

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
        {replies.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            AIとチャットを始めましょう！下にメッセージを入力してください。
          </div>
        ) : (
          replies.map((reply, index) => (
            <div
              key={index}
              className={`flex ${reply.startsWith('You:') ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs md:max-w-md p-3 rounded-lg ${
                  reply.startsWith('You:')
                    ? 'bg-blue-500 text-white'
                    : reply.startsWith('Error:')
                    ? 'bg-red-100 text-red-800'
                    : 'bg-white text-gray-800 shadow'
                }`}
              >
                {reply}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-white p-4 border-t shadow-sm">
        <div className="flex space-x-2 max-w-3xl mx-auto">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="メッセージを入力..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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