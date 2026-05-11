import React, { useEffect, useState } from 'react';
import { 
    History, 
    Search, 
    User, 
    ShieldAlert, 
    Database, 
    Calendar,
    Filter,
    ArrowRight
} from 'lucide-react';
import apiFetch from '../../utils/api';
import DataTable from '../../components/DataTable';
import Badge from '../../components/Badge';

const AuditTrail = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        lastPage: 1,
    });
    const [search, setSearch] = useState('');
    const [moduleFilter, setModuleFilter] = useState('');

    const fetchLogs = async (page = 1, searchQuery = '', module = '') => {
        setLoading(true);
        try {
            const res = await apiFetch(`/api/activity-logs?page=${page}&search=${searchQuery}&module=${module}`);
            setLogs(res.data);
            setPagination({
                currentPage: res.current_page,
                lastPage: res.last_page,
            });
        } catch (error) {
            console.error('Failed to load logs', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const handleSearch = (val) => {
        setSearch(val);
        fetchLogs(1, val, moduleFilter);
    };

    const handleModuleFilter = (e) => {
        const val = e.target.value;
        setModuleFilter(val);
        fetchLogs(1, search, val);
    };

    const columns = [
        {
            header: 'Waktu',
            accessorKey: 'created_at',
            cell: info => (
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-800 dark:text-white">
                        {new Date(info.getValue()).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(info.getValue()).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            )
        },
        {
            header: 'Pelaku',
            accessorKey: 'user.name',
            cell: info => (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <User className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-700 dark:text-slate-300 tracking-tight">{info.getValue() || 'Sistem'}</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest">{info.row.original.ip_address}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Modul',
            accessorKey: 'module',
            cell: info => (
                <Badge variant="default" className="text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 bg-slate-100 text-slate-600 border-0">
                    {info.getValue()}
                </Badge>
            )
        },
        {
            header: 'Aktivitas',
            accessorKey: 'activity',
            cell: info => (
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                    <span className="text-sm font-black text-slate-800 dark:text-white">{info.getValue()}</span>
                </div>
            )
        },
        {
            header: 'Deskripsi',
            accessorKey: 'description',
            cell: info => (
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-md italic">
                    "{info.getValue()}"
                </p>
            )
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
                        <History className="w-8 h-8 text-indigo-600" /> Audit Trail
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Log aktivitas sistem dan catatan transaksi keuangan.</p>
                </div>
            </div>

            <DataTable 
                columns={columns}
                data={logs}
                loading={loading}
                manualPagination={true}
                pageCount={pagination.lastPage}
                paginationState={{
                    pageIndex: pagination.currentPage - 1,
                    pageSize: 20
                }}
                onPaginationChange={(updater) => {
                    const next = typeof updater === 'function' ? updater({ pageIndex: pagination.currentPage - 1, pageSize: 20 }) : updater;
                    fetchLogs(next.pageIndex + 1, search, moduleFilter);
                }}
                onSearchChange={handleSearch}
                searchPlaceholder="Cari aktivitas atau pelaku..."
                actions={
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm">
                            <Filter className="w-3.5 h-3.5 text-slate-400" />
                            <select 
                                value={moduleFilter}
                                onChange={handleModuleFilter}
                                className="bg-transparent border-0 text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 outline-none cursor-pointer"
                            >
                                <option value="">Semua Modul</option>
                                <option value="Pelanggan">Pelanggan</option>
                                <option value="Pembayaran">Pembayaran</option>
                                <option value="Kas">Kas</option>
                                <option value="Autentikasi">Autentikasi</option>
                            </select>
                        </div>
                    </div>
                }
            />
        </div>
    );
};

export default AuditTrail;
