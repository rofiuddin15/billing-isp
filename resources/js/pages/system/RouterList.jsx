import React, { useEffect, useState } from 'react';
import { Server, Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import apiFetch from '../../utils/api';
import { toast } from 'react-toastify';
import Badge from '../../components/Badge';

const RouterList = () => {
    const [routers, setRouters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingRouter, setEditingRouter] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        ip_address: '',
        port: 8728,
        username: '',
        password: '',
        description: '',
        is_active: true
    });
    const [submitting, setSubmitting] = useState(false);
    const [testing, setTesting] = useState(false);

    const fetchRouters = async () => {
        try {
            const data = await apiFetch('/api/routers');
            setRouters(data);
        } catch (error) {
            toast.error('Gagal memuat data router');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRouters();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingRouter) {
                await apiFetch(`/api/routers/${editingRouter.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(formData)
                });
                toast.success('Router berhasil diperbarui');
            } else {
                await apiFetch('/api/routers', {
                    method: 'POST',
                    body: JSON.stringify(formData)
                });
                toast.success('Router berhasil ditambahkan');
            }
            setShowModal(false);
            fetchRouters();
        } catch (error) {
            toast.error(error.message || 'Terjadi kesalahan');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Apakah Anda yakin ingin menghapus router ini?')) return;
        try {
            await apiFetch(`/api/routers/${id}`, { method: 'DELETE' });
            toast.success('Router berhasil dihapus');
            fetchRouters();
        } catch (error) {
            toast.error(error.message || 'Gagal menghapus router');
        }
    };

    const testConnection = async () => {
        if (!formData.ip_address || !formData.port || !formData.username) {
            toast.warning('Isi IP Address, Port, dan Username terlebih dahulu');
            return;
        }
        setTesting(true);
        try {
            await apiFetch('/api/routers/test-connection', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            toast.success('Koneksi berhasil!');
        } catch (error) {
            toast.error(error.message || 'Koneksi gagal');
        } finally {
            setTesting(false);
        }
    };

    const openModal = (router = null) => {
        if (router) {
            setEditingRouter(router);
            setFormData({
                name: router.name,
                ip_address: router.ip_address,
                port: router.port,
                username: router.username,
                password: '', // leave empty if not changing
                description: router.description || '',
                is_active: router.is_active
            });
        } else {
            setEditingRouter(null);
            setFormData({
                name: '',
                ip_address: '',
                port: 8728,
                username: 'admin',
                password: '',
                description: '',
                is_active: true
            });
        }
        setShowModal(true);
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Memuat...</div>;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Mikrotik Routers</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-widest mt-0.5">Manajemen Perangkat Mikrotik</p>
                </div>
                <button 
                    onClick={() => openModal()}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-sm text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                >
                    <Plus className="w-4 h-4" /> Tambah Router
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Router Name</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">IP Address</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                        {routers.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                                    <Server className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    Belum ada router Mikrotik yang ditambahkan.
                                </td>
                            </tr>
                        ) : (
                            routers.map((r) => (
                                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-700 dark:text-slate-300">{r.name}</div>
                                        <div className="text-[10px] text-slate-500">{r.description}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded">
                                            {r.ip_address}:{r.port}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant={r.is_active ? 'success' : 'danger'}>
                                            {r.is_active ? 'AKTIF' : 'NON-AKTIF'}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => openModal(r)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow-sm">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(r.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow-sm">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-sm shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                            <h3 className="font-bold text-slate-800 dark:text-white">
                                {editingRouter ? 'Edit Router' : 'Tambah Router Baru'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Nama Router</label>
                                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-sm text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Misal: Core Router Pusat" />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">IP Address</label>
                                    <input type="text" required value={formData.ip_address} onChange={e => setFormData({...formData, ip_address: e.target.value})} className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-sm text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="192.168.1.1" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">API Port</label>
                                    <input type="number" required value={formData.port} onChange={e => setFormData({...formData, port: Number(e.target.value)})} className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-sm text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Username</label>
                                    <input type="text" required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-sm text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Password</label>
                                    <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder={editingRouter ? '(Biarkan kosong jika tidak diubah)' : ''} required={!editingRouter} className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-sm text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Status</label>
                                <select value={formData.is_active ? '1' : '0'} onChange={e => setFormData({...formData, is_active: e.target.value === '1'})} className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-sm text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                                    <option value="1">Aktif</option>
                                    <option value="0">Non-Aktif</option>
                                </select>
                            </div>
                            
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <button type="button" onClick={testConnection} disabled={testing} className="px-5 py-2.5 bg-emerald-600/10 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 font-bold text-xs uppercase tracking-widest rounded-sm hover:bg-emerald-600/20 transition-colors disabled:opacity-50">
                                    {testing ? 'Menguji...' : 'Test Koneksi'}
                                </button>
                                <div className="flex gap-3">
                                    <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs uppercase tracking-widest rounded-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                        Batal
                                    </button>
                                    <button type="submit" disabled={submitting} className="px-5 py-2.5 bg-indigo-600 text-white font-bold text-xs uppercase tracking-widest rounded-sm hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50">
                                        {submitting ? 'Menyimpan...' : 'Simpan'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RouterList;
