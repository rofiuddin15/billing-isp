import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import apiFetch from '../../utils/api';
import { Megaphone, Plus, Clock, CheckCircle2, AlertCircle, MessageSquare, User, Search, ChevronRight, X } from 'lucide-react';
import { toast } from 'react-toastify';

const ComplaintList = () => {
    const { user } = useSelector(state => state.auth);
    const [complaints, setComplaints] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isStaff, setIsStaff] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Form for new complaint
    const [newComplaint, setNewComplaint] = useState({ subject: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form for staff update
    const [staffUpdate, setStaffUpdate] = useState({ status: '', staff_note: '' });

    useEffect(() => {
        setIsStaff(!user?.roles?.includes('customer'));
        fetchComplaints();
    }, [user]);

    const fetchComplaints = async () => {
        try {
            const data = await apiFetch('/api/complaints');
            setComplaints(data);
        } catch (error) {
            toast.error('Gagal mengambil data aduan');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateComplaint = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await apiFetch('/api/complaints', {
                method: 'POST',
                body: JSON.stringify(newComplaint)
            });
            toast.success('Aduan berhasil dikirim');
            setNewComplaint({ subject: '', message: '' });
            setShowModal(false);
            fetchComplaints();
        } catch (error) {
            toast.error(error.message || 'Gagal mengirim aduan');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateStatus = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await apiFetch(`/api/complaints/${selectedComplaint.id}`, {
                method: 'PUT',
                body: JSON.stringify(staffUpdate)
            });
            toast.success('Status aduan berhasil diperbarui');
            setSelectedComplaint(null);
            fetchComplaints();
        } catch (error) {
            toast.error(error.message || 'Gagal memperbarui status');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
            processing: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
            resolved: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
            closed: 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-500'
        };
        const labels = {
            pending: 'Tertunda',
            processing: 'Diproses',
            resolved: 'Selesai',
            closed: 'Ditutup'
        };
        return (
            <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest ${styles[status]}`}>
                {labels[status]}
            </span>
        );
    };

    const filteredComplaints = complaints.filter(c => 
        c.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) return <div className="p-8 text-center text-slate-500 uppercase font-black tracking-widest text-xs">Memuat Aduan...</div>;

    return (
        <div className="p-4 sm:p-8 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                        <Megaphone className="text-indigo-600" /> Pusat Aduan
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm font-medium">
                        {isStaff ? 'Kelola dan tanggapi aduan dari pelanggan.' : 'Laporkan kendala teknis atau layanan Anda di sini.'}
                    </p>
                </div>

                {!isStaff && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-indigo-600 text-white px-6 py-3 rounded font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Plus size={16} /> Kirim Aduan Baru
                    </button>
                )}
            </div>

            <div className="mb-6 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                    type="text"
                    placeholder="Cari berdasarkan subjek atau nama pelanggan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm font-medium"
                />
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredComplaints.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded p-12 text-center">
                        <Megaphone className="w-12 h-12 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
                        <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">Belum ada aduan</p>
                    </div>
                ) : (
                    filteredComplaints.map(complaint => (
                        <div 
                            key={complaint.id}
                            onClick={() => {
                                setSelectedComplaint(complaint);
                                setStaffUpdate({ status: complaint.status, staff_note: complaint.staff_note || '' });
                            }}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-4 sm:p-6 transition-all hover:border-indigo-500/50 cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded shrink-0 ${
                                    complaint.status === 'resolved' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                }`}>
                                    {complaint.status === 'resolved' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight group-hover:text-indigo-600 transition-colors">
                                        {complaint.subject}
                                    </h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        {isStaff && (
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                <User size={10} /> {complaint.customer?.name}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            <Clock size={10} /> {new Date(complaint.created_at).toLocaleDateString('id-ID')}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-1 italic">
                                        "{complaint.message}"
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100 dark:border-slate-800">
                                {getStatusBadge(complaint.status)}
                                <ChevronRight className="text-slate-300 group-hover:translate-x-1 transition-transform hidden sm:block" size={20} />
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal Send Complaint (Customer) */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 rounded shadow-2xl max-w-lg w-full p-8 border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">Kirim Aduan Baru</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreateComplaint} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Subjek / Judul Kendala</label>
                                <input
                                    required
                                    type="text"
                                    value={newComplaint.subject}
                                    onChange={(e) => setNewComplaint({...newComplaint, subject: e.target.value})}
                                    placeholder="Contoh: Koneksi Internet Lambat"
                                    className="w-full px-4 py-3 rounded bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Detail Pesan</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={newComplaint.message}
                                    onChange={(e) => setNewComplaint({...newComplaint, message: e.target.value})}
                                    placeholder="Jelaskan detail kendala yang Anda alami..."
                                    className="w-full px-4 py-3 rounded bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium outline-none resize-none"
                                />
                            </div>
                            <div className="pt-2">
                                <button
                                    disabled={isSubmitting}
                                    className="w-full bg-indigo-600 text-white py-4 rounded font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Mengirim...' : 'Kirim Sekarang'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal View/Process (Staff & View Detail) */}
            {selectedComplaint && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 rounded shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-8 border-b border-slate-100 dark:border-slate-800 pb-6">
                            <div>
                                <div className="mb-2">{getStatusBadge(selectedComplaint.status)}</div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{selectedComplaint.subject}</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mt-1">
                                    <User size={10} /> {selectedComplaint.customer?.name} • <Clock size={10} /> {new Date(selectedComplaint.created_at).toLocaleString('id-ID')}
                                </p>
                            </div>
                            <button onClick={() => setSelectedComplaint(null)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <MessageSquare size={12} /> Isi Aduan
                                </h4>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                                    {selectedComplaint.message}
                                </div>
                            </div>

                            {isStaff ? (
                                <form onSubmit={handleUpdateStatus} className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                                    <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Tanggapan Staff</h4>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Update Status</label>
                                        <select
                                            value={staffUpdate.status}
                                            onChange={(e) => setStaffUpdate({...staffUpdate, status: e.target.value})}
                                            className="w-full px-4 py-3 rounded bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-black uppercase outline-none cursor-pointer"
                                        >
                                            <option value="pending">Tertunda</option>
                                            <option value="processing">Diproses</option>
                                            <option value="resolved">Selesai</option>
                                            <option value="closed">Ditutup</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Catatan Internal / Solusi</label>
                                        <textarea
                                            rows={3}
                                            value={staffUpdate.staff_note}
                                            onChange={(e) => setStaffUpdate({...staffUpdate, staff_note: e.target.value})}
                                            placeholder="Tulis tindakan atau solusi yang telah dilakukan..."
                                            className="w-full px-4 py-3 rounded bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium outline-none resize-none"
                                        />
                                    </div>
                                    <button
                                        disabled={isSubmitting}
                                        className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white py-4 rounded font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-lg"
                                    >
                                        {isSubmitting ? 'Memproses...' : 'Simpan Perubahan'}
                                    </button>
                                </form>
                            ) : (
                                selectedComplaint.staff_note && (
                                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                        <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3">Tanggapan Staff / Solusi</h4>
                                        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded text-sm text-indigo-900 dark:text-indigo-200 leading-relaxed font-bold italic">
                                            "{selectedComplaint.staff_note}"
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComplaintList;
