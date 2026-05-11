<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Complaint extends Model
{
    protected $fillable = [
        'customer_id',
        'subject',
        'message',
        'status',
        'staff_note'
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
