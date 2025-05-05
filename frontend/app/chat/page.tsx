"use client";

import { Suspense } from "react";
import ChatHistory from "../../components/ChatHistory";

export default function ChatPage() {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-blue-600 to-emerald-500 text-white p-4 flex justify-center items-center shadow-lg">
        <h1 className="text-2xl font-bold text-center flex-1">チャット履歴</h1>
      </header>
      <main className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <Suspense fallback={<div className="text-center text-gray-500">読み込み中...</div>}>
            <ChatHistory />
          </Suspense>
        </div>
      </main>
    </div>
  );
}