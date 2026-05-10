<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Journal;
use Illuminate\Http\Request;

class JournalController extends Controller
{
    public function index(Request $request)
    {
        $query = Journal::with(['entries.account']);

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('date', [$request->start_date, $request->end_date]);
        }

        if ($request->has('search')) {
            $query->where('description', 'like', "%{$request->search}%");
        }

        return $query->latest('date')->paginate($request->get('per_page', 20));
    }

    public function show(Journal $journal)
    {
        return $journal->load(['entries.account', 'reference']);
    }
}
