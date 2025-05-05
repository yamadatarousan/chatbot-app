"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { v4 as uuidv4 } from "uuid";

export default function Home() {
  const [messages, setMessages] = useState<{ sender: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // セッションID の初期化
  useEffect(() => {
    if (typeof window !== "undefined") {
      let storedSessionId = localStorage.getItem("session_id");
      if (!storedSessionId) {
        storedSessionId = uuidv4();
        localStorage.setItem("session_id", storedSessionId);
      }
      setSessionId(storedSessionId);
    }
  }, []);

  // 履歴取得関数
  const fetchHistory = useCallback(async () => {
    if (!sessionId) return; // sessionId が空の場合はスキップ
    try {
      const response = await fetch(`/api/chat/history?session_id=${sessionId}`);
      if (!response.ok) throw new Error("Failed to fetch history");
      const data = await response.json();
      setMessages(data.map((item: { sender: string; message: string }) => ({
        sender: item.sender,
        content: item.message,
      })));
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  }, [sessionId]);

  // 初回履歴取得
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // メッセージ送信
  const handleSend = async () => {
    if (!input.trim() || !sessionId) return;
    setIsLoading(true);

    const newMessage = { sender: "user", content: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, message: input }),
      });
      if (!response.ok) throw new Error("Failed to send message");
      const result = await response.json();
      setMessages((prev) => [...prev, { sender: "ai", content: result.message }]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [...prev, { sender: "ai", content: "Error occurred." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // 入力欄の自動リサイズ
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [input]);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-100 to-emerald-100">
      <header className="p-4 bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow-md">
        <h1 className="text-2xl font-bold">AI Chatbot</h1>
      </header>
      <main className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg shadow-md animate-fade-in ${
                msg.sender === "user"
                  ? "bg-gradient-to-r from-blue-300 to-blue-500 text-white ml-auto"
                  : "bg-gradient-to-r from-gray-200 to-gray-400 text-black mr-auto"
              } max-w-md`}
            >
              {msg.content}
            </div>
          ))}
        </div>
      </main>
      <footer className="p-4 bg-white shadow-inner">
        <div className="max-w-3xl mx-auto flex gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your message..."
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-emerald-500 text-white rounded-lg hover:scale-105 transition-transform disabled:opacity-50"
          >
            {isLoading ? "Sending..." : "Send"}
          </button>
        </div>
      </footer>
    </div>
  );
}