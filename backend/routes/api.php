<?php
Route::get('/health', function () {
    return ['status' => 'ok'];
});