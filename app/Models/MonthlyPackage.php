<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MonthlyPackage extends Model
{
    protected $fillable = ['name', 'price', 'description'];

    public function customers()
    {
        return $this->hasMany(Customer::class);
    }
}
