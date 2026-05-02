<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CashFlow extends Model
{
    protected $fillable = [
        'transaction_date', 'type', 'category', 'amount', 
        'description', 'reference_id', 'created_by'
    ];

    protected $casts = [
        'transaction_date' => 'date',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
