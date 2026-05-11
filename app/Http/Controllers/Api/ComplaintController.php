<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ComplaintController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        
        if ($user->hasRole('customer')) {
            $complaints = Complaint::where('customer_id', $user->customer->id)
                ->orderBy('created_at', 'desc')
                ->get();
        } else {
            $complaints = Complaint::with('customer')
                ->orderBy('created_at', 'desc')
                ->get();
        }
        
        return response()->json($complaints);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        
        if (!$user->hasRole('customer')) {
            return response()->json(['message' => 'Hanya pelanggan yang dapat mengirim aduan'], 403);
        }

        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        $complaint = Complaint::create([
            'customer_id' => $user->customer->id,
            'subject' => $validated['subject'],
            'message' => $validated['message'],
            'status' => 'pending',
        ]);

        return response()->json($complaint, 201);
    }

    public function update(Request $request, Complaint $complaint)
    {
        $user = Auth::user();
        
        if ($user->hasRole('customer')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:pending,processing,resolved,closed',
            'staff_note' => 'nullable|string',
        ]);

        $complaint->update($validated);

        return response()->json($complaint);
    }

    public function show(Complaint $complaint)
    {
        $user = Auth::user();
        
        if ($user->hasRole('customer') && $complaint->customer_id !== $user->customer->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($complaint->load('customer'));
    }
}
