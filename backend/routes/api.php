<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

Route::post('/chat', function (Request $request) {
    $message = $request->input('message');
    $response = Http::withHeaders(['Authorization' => 'Bearer ' . env('OPENAI_API_KEY')])
                    ->post('https://api.openai.com/v1/chat/completions', [
                        'model' => 'gpt-4o-mini',
                        'messages' => [['role' => 'user', 'content' => $message]]
                    ]);
    return $response->json()['choices'][0]['message']['content'];
});