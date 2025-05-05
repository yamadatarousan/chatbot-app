<?php

return [
    'paths' => ['api/*'], // /api/* に適用
    'allowed_methods' => ['*'], // GET, POST など全部許可
    'allowed_origins' => ['http://localhost:3001'], // フロントエンドのURL
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'], // Content-Type とか全部許可
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];