<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VoucherPackage extends Model
{
    protected $fillable = ['name', 'duration_minutes', 'price', 'active_period_days'];

    public function vouchers()
    {
        return $this->hasMany(Voucher::class, 'package_id');
    }
}
