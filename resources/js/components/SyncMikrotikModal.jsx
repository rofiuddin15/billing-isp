import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Server, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const SyncMikrotikModal = ({ isOpen, onClose, onSyncComplete, title, endpoint, description }) => {
    const [routers, setRouters] = useState([]);
    const [selectedRouter, setSelectedRouter] = useState('');
    const [syncing, setSyncing] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            fetchRouters();
        }
    }, [isOpen]);

    const fetchRouters = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/routers');
            setRouters(response.data);
            if (response.data.length === 1) {
                setSelectedRouter(response.data[0].id);
            }
        } catch (error) {
            toast.error('Gagal memuat data router');
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        if (!selectedRouter) {
            toast.error('Pilih router terlebih dahulu');
            return;
        }

        setSyncing(true);
        try {
            const response = await axios.post(`/api/sync/${endpoint}`, { router_id: selectedRouter });
            toast.success(response.data.message);
            onSyncComplete();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal sinkronisasi');
        } finally {
            setSyncing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <RefreshCw className="w-5 h-5 text-indigo-600" />
                        {title}
                    </h3>
                    <button 
                        onClick={onClose}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-5">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                        {description}
                    </p>

                    <div className="mb-6">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pilih Router Sumber</label>
                        {loading ? (
                            <div className="animate-pulse h-10 bg-slate-100 dark:bg-slate-800 rounded-sm"></div>
                        ) : routers.length === 0 ? (
                            <div className="flex items-start gap-3 p-3 bg-red-50 text-red-600 dark:bg-red-500/10 rounded-sm border border-red-100 dark:border-red-500/20">
                                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-semibold">Router belum tersedia</p>
                                    <p className="mt-1">Anda harus menambahkan Router Mikrotik terlebih dahulu di menu Data Router.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="relative">
                                <Server className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <select 
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-sm pl-10 pr-4 py-2.5 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                                    value={selectedRouter}
                                    onChange={e => setSelectedRouter(e.target.value)}
                                >
                                    <option value="">-- Pilih Router --</option>
                                    {routers.map(router => (
                                        <option key={router.id} value={router.id}>{router.name} ({router.ip_address})</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 rounded-b-lg">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-sm transition-colors"
                        disabled={syncing}
                    >
                        Batal
                    </button>
                    <button 
                        onClick={handleSync}
                        disabled={syncing || !selectedRouter || routers.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        {syncing ? (
                            <><RefreshCw className="w-4 h-4 animate-spin" /> Sedang Menarik...</>
                        ) : (
                            'Tarik Data Sekarang'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SyncMikrotikModal;
