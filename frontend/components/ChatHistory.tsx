"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css"; // シンタックスハイライトのスタイル

type ChatMessage = {
  message: string;
  sender: "user" | "ai";
  created_at: string;
};

export default function ChatHistory() {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string>("");

  // セッションID の取得
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedSessionId = localStorage.getItem("session_id") || "";
      setSessionId(storedSessionId);
    }
  }, []);

  // 履歴の取得
  useEffect(() => {
    if (!sessionId) return;
    const fetchHistory = async () => {
      try {
        const response = await fetch(`http://localhost/api/chat/history?session_id=${sessionId}`, {
          headers: { Accept: "application/json" },
        });
        if (!response.ok) throw new Error("履歴の取得に失敗しました");
        const data: ChatMessage[] = await response.json();
        setHistory(data);
      } catch (error) {
        setHistory([
          ...history,
          { message: `エラー: ${(error as Error).message}`, sender: "ai", created_at: new Date().toISOString() },
        ]);
      }
    };
    fetchHistory();
  }, [sessionId, history]);

  return (
    <div className="space-y-4">
      {history.length === 0 ? (
        <div className="text-center text-gray-500 mt-10 animate-fade-in">
          履歴がありません。チャットを始めましょう！
        </div>
      ) : (
        history.map((item, index) => (
          <div
            key={index}
            className={`flex ${item.sender === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
          >
            <div
              className={`max-w-full sm:max-w-md p-4 rounded-2xl shadow-md break-words ${
                item.sender === "user"
                  ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white"
                  : item.message.startsWith("エラー:")
                  ? "bg-red-100 text-red-800"
                  : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800"
              }`}
            >
              <span className="font-semibold">{item.sender === "user" ? "You: " : "AI: "}</span>
              <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{item.message}</ReactMarkdown>
              <div className="text-xs text-gray-400 mt-1 opacity-70 hover:opacity-100 transition-opacity">
                {new Date(item.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}