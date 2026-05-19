<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TechnicianPerformance;
use App\Models\TechnicianPerformanceLog;
use App\Models\User;
use App\Models\Customer;
use App\Models\Complaint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class TechnicianPerformanceController extends Controller
{
    public function index(Request $request)
    {
        $query = TechnicianPerformance::with(['technician', 'logs', 'customer', 'complaint']);

        if ($request->filled('technician_id')) {
            $query->where('technician_id', $request->technician_id);
        }

        if ($request->filled('task_type')) {
            $query->where('task_type', $request->task_type);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('created_at', [
                Carbon::parse($request->start_date)->startOfDay(),
                Carbon::parse($request->end_date)->endOfDay()
            ]);
        }

        // If logged in user is a technician, they should only see their own tasks
        $user = Auth::user();
        if ($user->hasRole('teknisi')) {
            $query->where('technician_id', $user->id);
        }

        $performances = $query->orderBy('created_at', 'desc')->get();
        return response()->json($performances);
    }

    public function getTechnicians()
    {
        // Find users with role 'teknisi'
        $technicians = User::whereHas('roles', function ($query) {
            $query->where('name', 'teknisi');
        })->get();

        return response()->json($technicians);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'technician_id' => 'required|exists:users,id',
            'task_type' => 'required|in:installation,repair',
            'reference_id' => 'nullable|integer',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $performance = TechnicianPerformance::create([
            'technician_id' => $validated['technician_id'],
            'task_type' => $validated['task_type'],
            'reference_id' => $validated['reference_id'],
            'title' => $validated['title'],
            'description' => $validated['description'],
            'status' => 'open',
        ]);

        // Create initial log
        TechnicianPerformanceLog::create([
            'performance_id' => $performance->id,
            'status' => 'open',
            'notes' => 'Tugas baru dibuat dan didelegasikan kepada teknisi.',
            'operator_name' => Auth::user()->name,
        ]);

        return response()->json($performance->load(['technician', 'logs']), 201);
    }

    public function update(Request $request, $id)
    {
        $performance = TechnicianPerformance::findOrFail($id);
        $user = Auth::user();

        // 1. If updating status
        if ($request->filled('status')) {
            $newStatus = $request->status;
            $oldStatus = $performance->status;

            if ($newStatus !== $oldStatus) {
                $updateData = ['status' => $newStatus];
                $logNotes = $request->input('notes', 'Status pengerjaan diperbarui.');

                if ($newStatus === 'proses') {
                    $updateData['start_time'] = Carbon::now();
                    $logNotes = $request->input('notes', 'Teknisi mulai melakukan pengerjaan di lokasi.');
                } elseif ($newStatus === 'selesai') {
                    $updateData['end_time'] = Carbon::now();
                    $startTime = $performance->start_time ?: Carbon::now();
                    $updateData['duration_minutes'] = Carbon::now()->diffInMinutes($startTime);
                    $logNotes = $request->input('notes', 'Teknisi menyatakan pengerjaan telah selesai.');
                }

                // Handle WebP photo upload
                $photoPath = null;
                if ($request->hasFile('photo')) {
                    $file = $request->file('photo');
                    $filename = time() . '_' . uniqid() . '.webp';
                    $directory = storage_path('app/public/activities');

                    if (!file_exists($directory)) {
                        mkdir($directory, 0755, true);
                    }

                    $path = $directory . '/' . $filename;
                    $uploadedPath = $file->getRealPath();

                    // Convert image to WebP using native GD
                    $imageInfo = @getimagesize($uploadedPath);
                    $mime = $imageInfo['mime'] ?? '';
                    $image = null;

                    if ($mime === 'image/jpeg' || $mime === 'image/jpg') {
                        $image = @imagecreatefromjpeg($uploadedPath);
                    } elseif ($mime === 'image/png') {
                        $image = @imagecreatefrompng($uploadedPath);
                    } elseif ($mime === 'image/gif') {
                        $image = @imagecreatefromgif($uploadedPath);
                    } elseif ($mime === 'image/webp') {
                        $image = @imagecreatefromwebp($uploadedPath);
                    }

                    if ($image) {
                        // Compress and save as WebP
                        imagewebp($image, $path, 80);
                        imagedestroy($image);
                        $photoPath = '/storage/activities/' . $filename;
                    } else {
                        // Fallback: move file directly
                        $file->move($directory, $filename);
                        $photoPath = '/storage/activities/' . $filename;
                    }

                    $updateData['photo_path'] = $photoPath;
                }

                $performance->update($updateData);

                // Add to log
                TechnicianPerformanceLog::create([
                    'performance_id' => $performance->id,
                    'status' => $newStatus,
                    'notes' => $logNotes,
                    'operator_name' => $user->name,
                    'photo_path' => $photoPath,
                ]);

                // Auto update reference status
                if ($newStatus === 'selesai' && $performance->task_type === 'repair' && $performance->reference_id) {
                    $complaint = Complaint::find($performance->reference_id);
                    if ($complaint) {
                        $complaint->update([
                            'status' => 'resolved',
                            'staff_note' => $complaint->staff_note . "\n[Sistem] Otomatis ditandai selesai berdasarkan Laporan Kinerja Teknisi."
                        ]);
                    }
                }
            }
        }

        // 2. If staff/admin is giving evaluation rating
        if ($request->filled('performance_rating')) {
            $performance->update([
                'performance_rating' => $request->performance_rating,
                'notes' => $request->notes,
            ]);

            // Add an evaluation log
            TechnicianPerformanceLog::create([
                'performance_id' => $performance->id,
                'status' => $performance->status,
                'notes' => 'Staff memberikan penilaian bintang ' . $request->performance_rating . ' dengan catatan: ' . $request->notes,
                'operator_name' => $user->name,
            ]);
        }

        return response()->json($performance->load(['technician', 'logs', 'customer', 'complaint']));
    }

    public function stats(Request $request)
    {
        $query = TechnicianPerformance::query();

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('created_at', [
                Carbon::parse($request->start_date)->startOfDay(),
                Carbon::parse($request->end_date)->endOfDay()
            ]);
        }

        // Total Counts
        $total = $query->count();
        $open = $query->clone()->where('status', 'open')->count();
        $proses = $query->clone()->where('status', 'proses')->count();
        $selesai = $query->clone()->where('status', 'selesai')->count();

        // Averages
        $avgDuration = $query->clone()->where('status', 'selesai')->avg('duration_minutes') ?: 0;
        $avgRating = $query->clone()->whereNotNull('performance_rating')->avg('performance_rating') ?: 0;

        // Breakdown per technician
        $techStats = User::whereHas('roles', function ($q) {
            $q->where('name', 'teknisi');
        })->get()->map(function($tech) use ($request) {
            $techQuery = TechnicianPerformance::where('technician_id', $tech->id);
            if ($request->filled('start_date') && $request->filled('end_date')) {
                $techQuery->whereBetween('created_at', [
                    Carbon::parse($request->start_date)->startOfDay(),
                    Carbon::parse($request->end_date)->endOfDay()
                ]);
            }

            $totalTech = $techQuery->count();
            $completedTech = $techQuery->clone()->where('status', 'selesai')->count();
            $avgDurationTech = $techQuery->clone()->where('status', 'selesai')->avg('duration_minutes') ?: 0;
            $avgRatingTech = $techQuery->clone()->whereNotNull('performance_rating')->avg('performance_rating') ?: 0;

            return [
                'id' => $tech->id,
                'name' => $tech->name,
                'total_tasks' => $totalTech,
                'completed_tasks' => $completedTech,
                'avg_duration' => round($avgDurationTech),
                'avg_rating' => round($avgRatingTech, 1)
            ];
        });

        // Task type breakdown
        $installations = $query->clone()->where('task_type', 'installation')->count();
        $repairs = $query->clone()->where('task_type', 'repair')->count();

        return response()->json([
            'total' => $total,
            'open' => $open,
            'proses' => $proses,
            'selesai' => $selesai,
            'avg_duration' => round($avgDuration),
            'avg_rating' => round($avgRating, 1),
            'technicians' => $techStats,
            'types' => [
                'installation' => $installations,
                'repair' => $repairs
            ]
        ]);
    }

    public function destroy($id)
    {
        $performance = TechnicianPerformance::findOrFail($id);
        
        // Delete photo if exists
        if ($performance->photo_path) {
            $relativePath = str_replace('/storage/', 'public/', $performance->photo_path);
            Storage::delete($relativePath);
        }

        // Also delete any photos in logs
        foreach ($performance->logs as $log) {
            if ($log->photo_path) {
                $relativePath = str_replace('/storage/', 'public/', $log->photo_path);
                Storage::delete($relativePath);
            }
        }

        $performance->delete();
        return response()->json(['message' => 'Laporan kinerja teknisi berhasil dihapus']);
    }
}
