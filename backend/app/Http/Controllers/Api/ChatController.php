<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ChatHistory;
use Illuminate\Support\Str;
use Illuminate\Http\JsonResponse; // 正しい JsonResponse をインポート

class ChatController extends Controller
{
    public function handle(Request $request): JsonResponse
    {
        $message = $request->input('message');
        $response = $message . '！お元気ですか？'; // モック応答

        return response()->json(['message' => $response]);
    }
}