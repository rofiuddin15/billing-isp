<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Journal extends Model
{
    protected $fillable = ['date', 'description', 'reference_id', 'reference_type'];

    public function entries()
    {
        return $this->hasMany(JournalEntry::class);
    }

    public function reference()
    {
        return $this->morphTo();
    }
}
