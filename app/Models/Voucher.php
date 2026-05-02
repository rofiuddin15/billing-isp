<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Voucher extends Model
{
    protected $fillable = ['package_id', 'code', 'status', 'sold_at', 'created_by'];

    protected $casts = [
        'sold_at' => 'datetime',
    ];

    public function package()
    {
        return $this->belongsTo(VoucherPackage::class, 'package_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
