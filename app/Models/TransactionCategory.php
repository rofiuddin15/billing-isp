<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransactionCategory extends Model
{
    protected $fillable = ['name', 'type', 'account_id'];

    public function account()
    {
        return $this->belongsTo(Account::class);
    }
}
