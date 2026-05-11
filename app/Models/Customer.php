<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    protected $fillable = [
        'user_id', 'customer_code', 'name', 'address', 'phone', 
        'pppoe_user', 'monthly_package_id', 'installation_fee', 'status', 'ip_address',
        'latitude', 'longitude'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function monthlyPackage()
    {
        return $this->belongsTo(MonthlyPackage::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function complaints()
    {
        return $this->hasMany(Complaint::class);
    }
}
