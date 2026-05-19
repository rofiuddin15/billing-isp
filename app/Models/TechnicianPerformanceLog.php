<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TechnicianPerformanceLog extends Model
{
    protected $fillable = [
        'performance_id',
        'status',
        'notes',
        'operator_name',
        'photo_path'
    ];

    public function performance()
    {
        return $this->belongsTo(TechnicianPerformance::class, 'performance_id');
    }
}
