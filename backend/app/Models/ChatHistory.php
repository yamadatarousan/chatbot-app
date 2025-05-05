<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatHistory extends Model
{
    protected $table = 'chat_history'; // テーブル名を明示
    protected $fillable = ['session_id', 'message', 'sender'];
}               
