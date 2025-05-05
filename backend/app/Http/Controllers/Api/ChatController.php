<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChatHistory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use OpenAI\Laravel\Facades\OpenAI;

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
            $result = OpenAI::chat()->create([
                'model' => 'gpt-3.5-turbo',
                'messages' => [
                    ['role' => 'system', 'content' => 'You are a friendly AI assistant.'],
                    ['role' => 'user', 'content' => $message],
                ],
                'max_tokens' => 150,
            ]);
            $response = $result->choices[0]->message->content ?? 'エラー：AI応答を取得できませんでした';
        } catch (\Exception $e) {
            \Log::error('OpenAI API error: ' . $e->getMessage());
            $response = 'エラー：AI応答を取得できませんでした';
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
                'message' => $response,
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
            'message' => $response,
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
                ->orderBy('created_at', 'desc')
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