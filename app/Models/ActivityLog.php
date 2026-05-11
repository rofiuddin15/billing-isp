<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    protected $fillable = [
        'user_id',
        'activity',
        'module',
        'description',
        'details',
        'ip_address'
    ];

    protected $casts = [
        'details' => 'array'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Helper to log an activity
     */
    public static function log($activity, $module, $description, $details = null)
    {
        return self::create([
            'user_id' => auth()->id(),
            'activity' => $activity,
            'module' => $module,
            'description' => $description,
            'details' => $details,
            'ip_address' => request()->ip()
        ]);
    }
}
