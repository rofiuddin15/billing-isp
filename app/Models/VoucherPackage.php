<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VoucherPackage extends Model
{
    protected $fillable = [
        'name', 'duration_minutes', 'price', 'active_period_days',
        'router_id', 'mikrotik_profile_name', 'mikrotik_rate_limit', 
        'mikrotik_shared_users', 'mikrotik_address_pool'
    ];

    public function vouchers()
    {
        return $this->hasMany(Voucher::class, 'package_id');
    }

    public function router()
    {
        return $this->belongsTo(Router::class, 'router_id');
    }
}
