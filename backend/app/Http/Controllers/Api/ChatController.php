<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChatHistory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class ChatController extends Controller
{
    public function handle(Request $request): JsonResponse
    {
        $request->validate([
            'message' => 'required|string|max:1000',
            'session_id' => 'nullable|uuid',
        ]);
        $message = $request->input('message');
        $sessionId = $request->input('session_id', Str::uuid()->toString());

        // OpenAI APIで応答を生成
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . env('OPENAI_API_KEY'),
                'Content-Type' => 'application/json',
            ])->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-4o-mini',
                'messages' => [
                    ['role' => 'system', 'content' => 'You are a friendly AI assistant.'],
                    ['role' => 'user', 'content' => $message],
                ],
                'max_tokens' => 150,
            ]);

            if ($response->successful()) {
                $responseText = $response->json()['choices'][0]['message']['content'] ?? 'エラー：AI応答を取得できませんでした';
            } else {
                \Log::error('OpenAI API error: ' . json_encode($response->json()));
                $responseText = 'エラー：AI応答を取得できませんでした';
            }
        } catch (\Exception $e) {
            \Log::error('OpenAI API exception: ' . $e->getMessage());
            $responseText = 'エラー：AI応答を取得できませんでした';
        }

        // 履歴を保存
        \DB::beginTransaction();
        try {
            ChatHistory::create([
                'session_id' => $sessionId,
                'message' => $message,
                'sender' => 'user',
            ]);
            ChatHistory::create([
                'session_id' => $sessionId,
                'message' => $responseText,
                'sender' => 'ai',
            ]);
            $this->limitHistory($sessionId);
            \DB::commit();
        } catch (\Exception $e) {
            \DB::rollBack();
            \Log::error('Failed to save chat history: ' . $e->getMessage());
            throw $e;
        }

        return response()->json([
            'message' => $responseText,
            'session_id' => $sessionId
        ]);
    }

    public function history(Request $request): JsonResponse
    {
        $request->validate([
            'session_id' => 'required|uuid',
        ]);
        try {
            $sessionId = $request->input('session_id');
            \Log::info('History request for session_id: ' . $sessionId);
            $histories = ChatHistory::where('session_id', $sessionId)
                ->orderBy('created_at', 'asc') // 新しいメッセージが下に表示
                ->take(100)
                ->get(['message', 'sender', 'created_at']);
            \Log::info('Found histories: ' . $histories->toJson());
            return response()->json($histories);
        } catch (\Exception $e) {
            \Log::error('History fetch failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch history'], 500);
        }
    }   

    private function limitHistory(string $sessionId): void
    {
        $count = ChatHistory::where('session_id', $sessionId)->count();
        if ($count > 100) {
            ChatHistory::where('session_id', $sessionId)
                ->orderBy('created_at', 'asc')
                ->limit($count - 100)
                ->delete();
        }
    }
}