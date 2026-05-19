import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { 
    Wrench, Clock, Star, CheckCircle, Calendar, Plus, Trash2, 
    Image as ImageIcon, FileText, Camera, Filter, X, ChevronRight,
    User, AlertCircle, Play, Check, RefreshCw
} from 'lucide-react';
import apiFetch from '../../utils/api';
import { toast } from 'react-toastify';
import Badge from '../../components/Badge';

const TechnicianPerformanceReport = () => {
    const { permissions = [], user } = useSelector(state => state.auth);
    
    // Core state
    const [performances, setPerformances] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [stats, setStats] = useState({
        total: 0, open: 0, proses: 0, selesai: 0, avg_duration: 0, avg_rating: 0
    });
    
    // Loading states
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Filter states
    const [filters, setFilters] = useState({
        technician_id: '',
        task_type: '',
        status: '',
        start_date: '',
        end_date: ''
    });

    // Modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showProcessModal, setShowProcessModal] = useState(false);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);

    // Form inputs
    const [newTask, setNewTask] = useState({
        technician_id: '',
        task_type: 'installation',
        reference_id: '',
        title: '',
        description: ''
    });

    const [processData, setProcessData] = useState({ notes: '' });
    const [completeData, setCompleteData] = useState({ notes: '', photo: null });
    const [reviewData, setReviewData] = useState({ performance_rating: 5, notes: '' });

    // Permissions helpers
    const canCreate = permissions.includes('create.technician_performances');
    const canEdit = permissions.includes('edit.technician_performances');
    const canDelete = permissions.includes('delete.technician_performances');
    const isTech = user?.roles?.some(r => r.name === 'teknisi') || false;

    useEffect(() => {
        fetchData();
        fetchDropdowns();
    }, [filters]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams(filters).toString();
            const [perfRes, statsRes] = await Promise.all([
                apiFetch(`/api/technician-performances?${queryParams}`),
                apiFetch(`/api/technician-performances/stats?${queryParams}`)
            ]);
            setPerformances(perfRes);
            setStats(statsRes);
        } catch (error) {
            toast.error('Gagal mengambil data laporan kinerja');
        } finally {
            setLoading(false);
        }
    };

    const fetchDropdowns = async () => {
        try {
            const [techsRes, custsRes, complsRes] = await Promise.all([
                apiFetch('/api/technician-performances/technicians'),
                apiFetch('/api/customers'),
                apiFetch('/api/complaints')
            ]);
            setTechnicians(techsRes);
            
            // Format customers and complaints lists
            // API returns paginated or direct lists depending on standard implementation
            setCustomers(custsRes.data || custsRes || []);
            setComplaints(complsRes.data || complsRes || []);
        } catch (error) {
            console.error('Gagal memuat daftar referensi drop-down', error);
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            await apiFetch('/api/technician-performances', {
                method: 'POST',
                body: JSON.stringify(newTask)
            });
            toast.success('Tugas baru berhasil didelegasikan');
            setShowCreateModal(false);
            setNewTask({
                technician_id: '',
                task_type: 'installation',
                reference_id: '',
                title: '',
                description: ''
            });
            fetchData();
        } catch (error) {
            toast.error(error.message || 'Gagal membuat tugas');
        } finally {
            setSaving(false);
        }
    };

    const handleStartWork = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            await apiFetch(`/api/technician-performances/${selectedTask.id}`, {
                method: 'POST',
                body: JSON.stringify({
                    status: 'proses',
                    notes: processData.notes
                })
            });
            toast.success('Tugas berhasil ditandai proses kerja');
            setShowProcessModal(false);
            setProcessData({ notes: '' });
            fetchData();
        } catch (error) {
            toast.error(error.message || 'Gagal merubah status');
        } finally {
            setSaving(false);
        }
    };

    const handleCompleteWork = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            const formData = new FormData();
            formData.append('status', 'selesai');
            formData.append('notes', completeData.notes);
            if (completeData.photo) {
                formData.append('photo', completeData.photo);
            }

            // Using direct fetch/axios or native XMLHttpRequest for multipart/form-data
            // Since apiFetch is standard JSON, let's write a standard fetch call with bearer token
            const token = localStorage.getItem('token'); // standard storage key
            const response = await fetch(`/api/technician-performances/${selectedTask.id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Gagal menyimpan penyelesaian');
            }

            toast.success('Pekerjaan berhasil diselesaikan! Bukti foto tersimpan dalam format WebP.');
            setShowCompleteModal(false);
            setCompleteData({ notes: '', photo: null });
            fetchData();
        } catch (error) {
            toast.error(error.message || 'Gagal merubah status');
        } finally {
            setSaving(false);
        }
    };

    const handleReviewTask = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            await apiFetch(`/api/technician-performances/${selectedTask.id}`, {
                method: 'POST',
                body: JSON.stringify(reviewData)
            });
            toast.success('Penilaian kinerja berhasil disimpan');
            setShowReviewModal(false);
            setReviewData({ performance_rating: 5, notes: '' });
            fetchData();
        } catch (error) {
            toast.error(error.message || 'Gagal memberikan penilaian');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus data tugas & laporan kinerja ini?')) return;
        try {
            await apiFetch(`/api/technician-performances/${taskId}`, { method: 'DELETE' });
            toast.success('Laporan kinerja berhasil dihapus');
            fetchData();
        } catch (error) {
            toast.error(error.message || 'Gagal menghapus data');
        }
    };

    const openModal = (task, type) => {
        setSelectedTask(task);
        if (type === 'process') {
            setProcessData({ notes: '' });
            setShowProcessModal(true);
        } else if (type === 'complete') {
            setCompleteData({ notes: '', photo: null });
            setShowCompleteModal(true);
        } else if (type === 'review') {
            setReviewData({ performance_rating: 5, notes: '' });
            setShowReviewModal(true);
        } else if (type === 'detail') {
            setShowDetailModal(true);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2.5">
                        <Wrench className="w-7 h-7 text-indigo-600" />
                        Laporan Kinerja Teknisi
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Pelacakan kinerja instalasi baru & perbaikan aduan pelanggan oleh teknisi lapangan.
                    </p>
                </div>
                {canCreate && (
                    <button 
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider rounded-sm shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
                    >
                        <Plus className="w-4 h-4" /> Tugaskan Teknisi
                    </button>
                )}
            </div>

            {/* KPI statistics grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-sm border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-sm text-indigo-600 dark:text-indigo-400">
                        <Wrench className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Total Tugas</span>
                        <span className="text-2xl font-black text-slate-800 dark:text-white">{stats.total}</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-sm border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-sm text-amber-600 dark:text-amber-400">
                        <Clock className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Sedang Proses</span>
                        <span className="text-2xl font-black text-slate-800 dark:text-white">{stats.proses}</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-sm border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-sm text-emerald-600 dark:text-emerald-400">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Selesai Kerja</span>
                        <span className="text-2xl font-black text-slate-800 dark:text-white">
                            {stats.selesai} <span className="text-xs text-slate-400 font-bold">({stats.total > 0 ? Math.round((stats.selesai / stats.total) * 100) : 0}%)</span>
                        </span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-sm border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-sm text-rose-600 dark:text-rose-400">
                        <Star className="w-6 h-6 fill-rose-600 dark:fill-rose-400" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Rata-rata Rating</span>
                        <span className="text-2xl font-black text-slate-800 dark:text-white">
                            {stats.avg_rating} <span className="text-xs text-slate-400 font-bold">/ 5.0</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Filter section */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-sm border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                    <Filter className="w-4 h-4" /> Saring Pencarian
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {!isTech && (
                        <select 
                            value={filters.technician_id} 
                            onChange={(e) => setFilters({ ...filters, technician_id: e.target.value })}
                            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-sm px-3 py-2.5 text-xs text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                        >
                            <option value="">Semua Teknisi</option>
                            {technicians.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    )}

                    <select 
                        value={filters.task_type} 
                        onChange={(e) => setFilters({ ...filters, task_type: e.target.value })}
                        className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-sm px-3 py-2.5 text-xs text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                    >
                        <option value="">Semua Jenis Tugas</option>
                        <option value="installation">Pasang Baru (PSB)</option>
                        <option value="repair">Perbaikan Aduan</option>
                    </select>

                    <select 
                        value={filters.status} 
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-sm px-3 py-2.5 text-xs text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                    >
                        <option value="">Semua Status</option>
                        <option value="open">Open (Tugas Baru)</option>
                        <option value="proses">Proses Kerja</option>
                        <option value="selesai">Selesai</option>
                    </select>

                    <input 
                        type="date"
                        value={filters.start_date}
                        onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                        className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-sm px-3 py-2.5 text-xs text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                    />

                    <input 
                        type="date"
                        value={filters.end_date}
                        onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                        className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-sm px-3 py-2.5 text-xs text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                    />
                </div>
            </div>

            {/* List & Table block */}
            <div className="bg-white dark:bg-slate-900 rounded-sm border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-800/10">
                                <th className="py-4 px-4">Tugas / Teknisi</th>
                                <th className="py-4 px-4">Jenis Kerja</th>
                                <th className="py-4 px-4">Status</th>
                                <th className="py-4 px-4">Waktu Mulai</th>
                                <th className="py-4 px-4 text-center">Durasi</th>
                                <th className="py-4 px-4 text-center">Rating</th>
                                <th className="py-4 px-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="py-8 text-center text-slate-400">
                                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent mx-auto mb-2" />
                                        Memuat laporan pengerjaan...
                                    </td>
                                </tr>
                            ) : performances.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="py-12 text-center text-slate-400 font-bold">
                                        <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-30 text-indigo-600" />
                                        Tidak ada data pengerjaan teknisi yang ditemukan.
                                    </td>
                                </tr>
                            ) : performances.map(task => (
                                <tr key={task.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-all">
                                    <td className="py-4 px-4">
                                        <div className="flex flex-col">
                                            <span className="font-black text-slate-700 dark:text-slate-200">{task.title}</span>
                                            <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 font-bold uppercase tracking-wider">
                                                <User className="w-3 h-3" /> Teknisi: {task.technician?.name || '-'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <Badge variant={task.task_type === 'installation' ? 'indigo' : 'purple'}>
                                            {task.task_type === 'installation' ? 'Pasang Baru' : 'Perbaikan'}
                                        </Badge>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                                            task.status === 'selesai' ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400' :
                                            task.status === 'proses' ? 'bg-amber-100 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400' :
                                            'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                                        }`}>
                                            {task.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-xs text-slate-500 font-bold">
                                        {task.start_time ? new Date(task.start_time).toLocaleString('id-ID', { hour12: false }) : '-'}
                                    </td>
                                    <td className="py-4 px-4 text-center text-xs font-black text-slate-600 dark:text-slate-300">
                                        {task.duration_minutes !== null ? `${task.duration_minutes} Mnt` : '-'}
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        {task.performance_rating ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 dark:bg-rose-950/30 text-rose-600 text-xs font-black rounded">
                                                <Star className="w-3.5 h-3.5 fill-rose-600" /> {task.performance_rating}.0
                                            </span>
                                        ) : '-'}
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            {/* Action Buttons based on status */}
                                            {task.status === 'open' && (isTech || canEdit) && (
                                                <button 
                                                    onClick={() => openModal(task, 'process')}
                                                    className="flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-black uppercase tracking-wider rounded-sm transition-all"
                                                >
                                                    <Play className="w-3 h-3" /> Proses
                                                </button>
                                            )}

                                            {task.status === 'proses' && (isTech || canEdit) && (
                                                <button 
                                                    onClick={() => openModal(task, 'complete')}
                                                    className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider rounded-sm transition-all"
                                                >
                                                    <Check className="w-3 h-3" /> Selesai
                                                </button>
                                            )}

                                            {task.status === 'selesai' && !task.performance_rating && canEdit && !isTech && (
                                                <button 
                                                    onClick={() => openModal(task, 'review')}
                                                    className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-wider rounded-sm transition-all"
                                                >
                                                    <Star className="w-3 h-3" /> Nilai Kinerja
                                                </button>
                                            )}

                                            <button 
                                                onClick={() => openModal(task, 'detail')}
                                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-black uppercase tracking-wider rounded-sm transition-all"
                                            >
                                                Log & Detail
                                            </button>

                                            {canDelete && (
                                                <button 
                                                    onClick={() => handleDeleteTask(task.id)}
                                                    className="p-1 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-600 rounded transition-all"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal: Tugaskan Tugas Baru */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-sm shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">Delegasi & Penugasan Baru</h3>
                                <p className="text-xs text-slate-500">Buat instruksi penugasan baru kepada teknisi lapangan.</p>
                            </div>
                            <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleCreateTask} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Teknisi Bertugas</label>
                                    <select 
                                        required
                                        value={newTask.technician_id}
                                        onChange={e => setNewTask({ ...newTask, technician_id: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-sm px-3 py-3 text-sm text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                                    >
                                        <option value="">Pilih Teknisi</option>
                                        {technicians.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Jenis Pekerjaan</label>
                                    <select 
                                        value={newTask.task_type}
                                        onChange={e => setNewTask({ ...newTask, task_type: e.target.value, reference_id: '' })}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-sm px-3 py-3 text-sm text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                                    >
                                        <option value="installation">Pasang Baru (PSB)</option>
                                        <option value="repair">Perbaikan Aduan</option>
                                    </select>
                                </div>
                            </div>

                            {newTask.task_type === 'installation' ? (
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Referensi Pelanggan Baru</label>
                                    <select 
                                        value={newTask.reference_id}
                                        onChange={e => setNewTask({ ...newTask, reference_id: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-sm px-3 py-3 text-sm text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                                    >
                                        <option value="">Pilih Pelanggan</option>
                                        {customers.map(c => (
                                            <option key={c.id} value={c.id}>{c.customer_code} - {c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Referensi Aduan Pelanggan</label>
                                    <select 
                                        value={newTask.reference_id}
                                        onChange={e => setNewTask({ ...newTask, reference_id: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-sm px-3 py-3 text-sm text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                                    >
                                        <option value="">Pilih Tiket Aduan</option>
                                        {complaints.filter(c => c.status !== 'resolved' && c.status !== 'closed').map(c => (
                                            <option key={c.id} value={c.id}>#{c.id} - {c.subject} ({c.customer?.name})</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Judul Tugas / Pekerjaan</label>
                                <input 
                                    type="text"
                                    required
                                    value={newTask.title}
                                    onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                                    placeholder="Contoh: Pasang ONT & Tarik Kabel Bp Budi"
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-sm px-4 py-3 text-sm text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Rincian / Deskripsi Tugas</label>
                                <textarea 
                                    value={newTask.description}
                                    onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                                    placeholder="Tuliskan spesifikasi modem, tipe router, alur kabel, atau keluhan detail aduan di sini..."
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-sm px-4 py-3 text-sm text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500 font-bold min-h-[100px]"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button 
                                    type="button" 
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-sm transition-all"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-sm shadow-lg shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    Tugaskan Teknisi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Mulai Proses Kerja */}
            {showProcessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-sm shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">Konfirmasi Mulai Kerja</h3>
                            <button onClick={() => setShowProcessModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleStartWork} className="p-6 space-y-4">
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Menandai tugas <strong>"{selectedTask?.title}"</strong> beralih ke proses pengerjaan. Waktu mulai akan dicatat otomatis.
                            </p>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Catatan Lapangan Awal</label>
                                <textarea 
                                    value={processData.notes}
                                    onChange={e => setProcessData({ notes: e.target.value })}
                                    placeholder="Contoh: Tim teknisi tiba di lokasi pelanggan..."
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-sm px-4 py-3 text-xs text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500 font-bold min-h-[80px]"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button 
                                    type="button" 
                                    onClick={() => setShowProcessModal(false)}
                                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-sm transition-all"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-sm transition-all"
                                >
                                    Mulai Sekarang
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Selesaikan Tugas (dengan Upload Foto WebP) */}
            {showCompleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-sm shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">Selesaikan Tugas & Upload Bukti</h3>
                                <p className="text-xs text-slate-500">Unggah foto kegiatan sebagai bukti pengerjaan selesai.</p>
                            </div>
                            <button onClick={() => setShowCompleteModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleCompleteWork} className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Catatan Teknis Akhir</label>
                                <textarea 
                                    required
                                    value={completeData.notes}
                                    onChange={e => setCompleteData({ ...completeData, notes: e.target.value })}
                                    placeholder="Tulis spesifikasi perangkat terpasang, redaman kabel dBm, atau tindakan perbaikan yang dilakukan..."
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-sm px-4 py-3 text-xs text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500 font-bold min-h-[100px]"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Foto Bukti Kegiatan</label>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 relative flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded px-4 py-6 bg-slate-50 dark:bg-slate-950/20 hover:bg-slate-100 transition-all cursor-pointer">
                                        <input 
                                            type="file"
                                            required
                                            accept="image/*"
                                            onChange={e => setCompleteData({ ...completeData, photo: e.target.files[0] })}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                        <div className="text-center">
                                            <Camera className="w-8 h-8 text-indigo-500 mx-auto mb-1.5" />
                                            <span className="text-xs font-black text-slate-400 uppercase tracking-wide block">
                                                {completeData.photo ? completeData.photo.name : 'Pilih File Foto'}
                                            </span>
                                            <span className="text-[9px] text-slate-400 mt-0.5 block">Format PNG, JPG, JPEG (Maks 5MB)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button 
                                    type="button" 
                                    onClick={() => setShowCompleteModal(false)}
                                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-sm transition-all"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-sm shadow-lg shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {saving ? 'Mengonversi...' : 'Selesaikan Tugas'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Beri Ulasan / Penilaian Kinerja */}
            {showReviewModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-sm shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">Penilaian Kinerja</h3>
                            <button onClick={() => setShowReviewModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleReviewTask} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-center mb-1">Skala Penilaian Kinerja</label>
                                <div className="flex items-center justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            type="button"
                                            key={star}
                                            onClick={() => setReviewData({ ...reviewData, performance_rating: star })}
                                            className="text-slate-200 transition-all focus:outline-none"
                                        >
                                            <Star className={`w-8 h-8 ${star <= reviewData.performance_rating ? 'text-rose-500 fill-rose-500' : 'text-slate-200 dark:text-slate-800'}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Ulasan Evaluasi Staff / Pelanggan</label>
                                <textarea 
                                    required
                                    value={reviewData.notes}
                                    onChange={e => setReviewData({ ...reviewData, notes: e.target.value })}
                                    placeholder="Tulis ulasan mengenai kerapian instalasi kabel, keramahan teknisi, atau kualitas hasil kerja..."
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-sm px-4 py-3 text-xs text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500 font-bold min-h-[80px]"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button 
                                    type="button" 
                                    onClick={() => setShowReviewModal(false)}
                                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-sm transition-all"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-sm transition-all"
                                >
                                    Simpan Ulasan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Log Detail & Timeline */}
            {showDetailModal && selectedTask && (
                <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-xl h-full shadow-2xl overflow-y-auto flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300">
                        {/* Detail Header */}
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/10">
                            <div>
                                <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-indigo-600" /> Log Pengerjaan & Timeline
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">Pelacakan riwayat audit pengerjaan teknisi secara lengkap.</p>
                            </div>
                            <button onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                        </div>

                        {/* Detail Content */}
                        <div className="p-6 space-y-6 flex-1">
                            {/* Summary Card */}
                            <div className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 rounded-sm space-y-3">
                                <div>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">NAMA TUGAS</span>
                                    <h4 className="font-black text-slate-800 dark:text-white text-md">{selectedTask.title}</h4>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-500">
                                    <div>
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">TEKNISI</span>
                                        <span className="text-slate-700 dark:text-slate-300">{selectedTask.technician?.name || '-'}</span>
                                    </div>
                                    <div>
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">JENIS</span>
                                        <span className="capitalize">{selectedTask.task_type === 'installation' ? 'Pasang Baru' : 'Perbaikan'}</span>
                                    </div>
                                </div>
                                {selectedTask.description && (
                                    <div>
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">DESKRIPSI TUGAS</span>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-bold">{selectedTask.description}</p>
                                    </div>
                                )}
                            </div>

                            {/* Timeline Status */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Garis Waktu Operasional</h4>
                                
                                <div className="relative border-l-2 border-indigo-100 dark:border-indigo-950 ml-3 pl-6 space-y-6 py-2">
                                    {selectedTask.logs?.map((log, index) => (
                                        <div key={log.id} className="relative">
                                            {/* Bullet icon */}
                                            <span className={`absolute -left-[35px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                                                log.status === 'selesai' ? 'bg-emerald-50 border-emerald-500 text-emerald-600' :
                                                log.status === 'proses' ? 'bg-amber-50 border-amber-500 text-amber-600' :
                                                'bg-slate-50 border-slate-400 text-slate-600'
                                            }`}>
                                                {log.status === 'selesai' ? <Check className="w-3.5 h-3.5" /> :
                                                 log.status === 'proses' ? <Play className="w-3.5 h-3.5" /> :
                                                 <Wrench className="w-3.5 h-3.5" />}
                                            </span>

                                            <div className="space-y-1">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                                    <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                                        {log.status}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-bold">
                                                        {new Date(log.created_at).toLocaleString('id-ID', { hour12: false })}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium pt-1">
                                                    {log.notes}
                                                </p>
                                                <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">
                                                    Operator: {log.operator_name}
                                                </div>

                                                {log.photo_path && (
                                                    <div className="pt-2">
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1 flex items-center gap-1">
                                                            <Camera className="w-3.5 h-3.5 text-indigo-500" /> Foto Bukti Kegiatan (WebP)
                                                        </span>
                                                        <a 
                                                            href={log.photo_path} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="inline-block relative overflow-hidden rounded border border-slate-200 dark:border-slate-800 max-w-[200px]"
                                                        >
                                                            <img 
                                                                src={log.photo_path} 
                                                                alt="Bukti foto kegiatan"
                                                                className="w-full h-auto max-h-[120px] object-cover hover:scale-105 transition-all duration-300"
                                                            />
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Detail Footer */}
                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 text-right">
                            <button 
                                onClick={() => setShowDetailModal(false)}
                                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-sm transition-all"
                            >
                                Tutup Panel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TechnicianPerformanceReport;
