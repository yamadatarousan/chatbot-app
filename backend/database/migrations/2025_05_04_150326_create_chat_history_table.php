<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('chat_history', function (Blueprint $table) {
            $table->id();
            $table->string('session_id')->index(); // ユーザー識別用（認証未導入時はセッションID）
            $table->text('message');
            $table->enum('sender', ['user', 'ai'])->default('user');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chat_history');
    }
};
