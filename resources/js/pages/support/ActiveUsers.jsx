import React, { useEffect, useState } from 'react';
import { Activity, Wifi, ShieldAlert, CheckCircle, RefreshCcw, Server } from 'lucide-react';
import apiFetch from '../../utils/api';
import { toast } from 'react-toastify';
import Badge from '../../components/Badge';

const ActiveUsers = () => {
    const [routers, setRouters] = useState([]);
    const [selectedRouter, setSelectedRouter] = useState('');
    const [activeUsers, setActiveUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        const fetchRouters = async () => {
            try {
                const data = await apiFetch('/api/routers');
                setRouters(data);
                if (data.length > 0) {
                    setSelectedRouter(data[0].id);
                }
            } catch (error) {
                toast.error('Gagal memuat router');
            } finally {
                setLoading(false);
            }
        };
        fetchRouters();
    }, []);

    const fetchActiveUsers = async () => {
        if (!selectedRouter) return;
        setSyncing(true);
        try {
            const data = await apiFetch(`/api/mikrotik/${selectedRouter}/active-users`);
            setActiveUsers(data || []);
        } catch (error) {
            toast.error(error.message || 'Gagal memuat user aktif');
        } finally {
            setSyncing(false);
        }
    };

    useEffect(() => {
        if (selectedRouter) {
            fetchActiveUsers();
        }
    }, [selectedRouter]);

    if (loading) return <div className="p-8 text-center text-slate-500">Memuat...</div>;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Active Mikrotik Users</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-widest mt-0.5">Pantau koneksi live pelanggan</p>
                </div>
                <div className="flex items-center gap-3">
                    <select 
                        value={selectedRouter} 
                        onChange={(e) => setSelectedRouter(e.target.value)}
                        className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                    >
                        {routers.length === 0 && <option value="">Tidak ada router</option>}
                        {routers.map(r => (
                            <option key={r.id} value={r.id}>{r.name} ({r.ip_address})</option>
                        ))}
                    </select>
                    <button 
                        onClick={fetchActiveUsers}
                        disabled={syncing || !selectedRouter}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-sm text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20 active:scale-95 disabled:opacity-50"
                    >
                        <RefreshCcw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} /> Refresh
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-6 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-xl shadow-md shadow-emerald-200 dark:shadow-none">
                        <Activity className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Online</p>
                        <p className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{activeUsers.length}</p>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="bg-white dark:bg-slate-900 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">User / IP</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Service</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Uptime</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Caller ID (MAC)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                        {activeUsers.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                                    <ShieldAlert className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    Tidak ada user yang sedang aktif di router ini.
                                </td>
                            </tr>
                        ) : (
                            activeUsers.map((user, idx) => (
                                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-700 dark:text-slate-300">{user.name}</div>
                                        <div className="text-[10px] text-slate-500 font-mono mt-1">{user.address}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant={user.service === 'pppoe' ? 'primary' : 'warning'}>
                                            {user.service?.toUpperCase() || 'UNKNOWN'}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                                            {user.uptime}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-mono text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded border border-slate-100 dark:border-slate-700">
                                            {user['caller-id'] || '-'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ActiveUsers;
