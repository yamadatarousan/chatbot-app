<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Http\Controllers\Api\ChatController;

Route::post('/chat', [ChatController::class, 'handle']);
Route::get('/chat/history', [ChatController::class, 'history']);

/*
Route::post('/chat', function (Request $request) {
    try {
        $message = $request->input('message');
        if (empty($message)) {
            return response()->json(['error' => 'Message is required'], 400);
        }

        $response = Http::withHeaders(['Authorization' => 'Bearer ' . env('OPENAI_API_KEY')])
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-4o-mini',
                'messages' => [['role' => 'user', 'content' => $message]]
            ]);

        if ($response->successful()) {
            return response()->json([
                'message' => $response->json()['choices'][0]['message']['content']
            ], 200);
        } else {
            return response()->json(['error' => 'OpenAI API error', 'details' => $response->json()], $response->status());
        }
    } catch (\Exception $e) {
        return response()->json(['error' => 'Server error', 'message' => $e->getMessage()], 500);
    }
});
*/