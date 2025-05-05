<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ChatController extends Controller
{
    public function handle(Request $request): JsonResponse
    {
        $message = $request->input('message');
        $response = $message . '！お元気ですか？';

        return response()->json(['message' => $response]);
    }
}