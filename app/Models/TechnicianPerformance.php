<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TechnicianPerformance extends Model
{
    protected $fillable = [
        'technician_id',
        'task_type',
        'reference_id',
        'title',
        'description',
        'status',
        'start_time',
        'end_time',
        'duration_minutes',
        'performance_rating',
        'notes',
        'photo_path'
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
    ];

    public function technician()
    {
        return $this->belongsTo(User::class, 'technician_id');
    }

    public function logs()
    {
        return $this->hasMany(TechnicianPerformanceLog::class, 'performance_id')->orderBy('created_at', 'asc');
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'reference_id');
    }

    public function complaint()
    {
        return $this->belongsTo(Complaint::class, 'reference_id');
    }
}
