<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Router extends Model
{
    protected $fillable = [
        'name',
        'ip_address',
        'port',
        'username',
        'password',
        'description',
        'is_active',
    ];
    
    protected $hidden = [
        'password',
    ];
}
