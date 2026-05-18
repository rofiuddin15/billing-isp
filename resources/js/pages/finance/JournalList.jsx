import React, { useEffect, useState, useMemo } from 'react';
import apiFetch from '../../utils/api';
import { FileText, ChevronDown, ChevronRight, Filter, Calendar } from 'lucide-react';
import Badge from '../../components/Badge';
import DataTable from '../../components/DataTable';

const JournalList = () => {
    const [journals, setJournals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState({
        currentPage: 1,
        lastPage: 1,
        pageSize: 10,
        total: 0
    });

    // Period Filters State
    const [filterType, setFilterType] = useState('this_month'); // Default is 'this_month' (Bulan Ini)
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Helper to calculate local ISO-formatted date range
    const getDateRangeForFilter = (type, customStart, customEnd) => {
        const now = new Date();
        let start = '';
        let end = '';

        const formatDateLocal = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        if (type === 'this_month') {
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
            const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            start = formatDateLocal(firstDay);
            end = formatDateLocal(lastDay);
        } else if (type === 'last_month') {
            const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
            start = formatDateLocal(firstDay);
            end = formatDateLocal(lastDay);
        } else if (type === 'custom') {
            start = customStart;
            end = customEnd;
        }

        return { start, end };
    };

    const activeRange = useMemo(() => {
        return getDateRangeForFilter(filterType, startDate, endDate);
    }, [filterType, startDate, endDate]);

    const fetchJournals = async (page = 1, perPage = 10, querySearch = '', start = '', end = '') => {
        setLoading(true);
        try {
            const res = await apiFetch(`/api/journals?page=${page}&per_page=${perPage}&search=${querySearch}&start_date=${start}&end_date=${end}`);
            setJournals(res.data || []);
            setPagination({
                currentPage: res.current_page || 1,
                lastPage: res.last_page || 1,
                pageSize: Number(res.per_page || perPage),
                total: res.total || 0
            });
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (filterType === 'custom' && (!startDate || !endDate)) {
            return;
        }
        fetchJournals(1, pagination.pageSize, search, activeRange.start, activeRange.end);
    }, [filterType, startDate, endDate, activeRange, search]);

    const columns = [
        {
            id: 'expander',
            header: () => null,
            cell: ({ row }) => (
                <button
                    onClick={row.getToggleExpandedHandler()}
                    className="text-slate-400 hover:text-indigo-600 transition-colors"
                >
                    {row.getIsExpanded() ? (
                        <ChevronDown className="w-5 h-5" />
                    ) : (
                        <ChevronRight className="w-5 h-5" />
                    )}
                </button>
            ),
        },
        {
            header: 'Journal Entry',
            accessorKey: 'description',
            cell: ({ row, getValue }) => (
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <FileText className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-800 dark:text-white">{getValue()}</span>
                            <Badge variant="primary">{row.original.reference_type?.split('\\').pop()}</Badge>
                        </div>
                        <span className="text-xs text-slate-500">{new Date(row.original.date).toLocaleDateString()}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Date',
            accessorKey: 'date',
            cell: ({ getValue }) => (
                <span className="text-sm text-slate-600 dark:text-slate-400">
                    {new Date(getValue()).toLocaleDateString()}
                </span>
            )
        },
        {
            header: 'Total Amount',
            accessorFn: row => row.entries.reduce((sum, e) => sum + Number(e.debit), 0),
            cell: ({ getValue }) => (
                <span className="text-sm font-bold text-slate-800 dark:text-white">
                    Rp {Number(getValue()).toLocaleString()}
                </span>
            )
        }
    ];

    const renderSubComponent = ({ row }) => (
        <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 p-4">
            <table className="w-full text-left">
                <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <th className="px-6 py-3">Account</th>
                        <th className="px-6 py-3 text-right">Debit</th>
                        <th className="px-6 py-3 text-right">Credit</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {row.original.entries.map(entry => (
                        <tr key={entry.id}>
                            <td className="px-6 py-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono text-slate-500">{entry.account.code}</span>
                                    <span className="text-sm text-slate-700 dark:text-slate-300">{entry.account.name}</span>
                                </div>
                            </td>
                            <td className="px-6 py-3 text-right">
                                {Number(entry.debit) > 0 ? (
                                    <span className="text-sm font-bold text-emerald-600">Rp {Number(entry.debit).toLocaleString()}</span>
                                ) : '-'}
                            </td>
                            <td className="px-6 py-3 text-right">
                                {Number(entry.credit) > 0 ? (
                                    <span className="text-sm font-bold text-indigo-600">Rp {Number(entry.credit).toLocaleString()}</span>
                                ) : '-'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white leading-tight">General Ledger</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">View all accounting journal entries.</p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-sm border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 transition-all">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Filter Periode:</span>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                    {[
                        { value: 'this_month', label: 'Bulan Ini' },
                        { value: 'last_month', label: 'Bulan Lalu' },
                        { value: 'all_time', label: 'Semua Waktu' },
                        { value: 'custom', label: 'Kustom Tanggal' }
                    ].map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => setFilterType(opt.value)}
                            className={`px-3 py-1.5 rounded-sm text-[10px] font-bold transition-all border ${
                                filterType === opt.value
                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                {filterType === 'custom' && (
                    <div className="flex items-center gap-2 animate-in slide-in-from-right duration-300">
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-[9px] text-slate-400 font-bold uppercase">Dari</span>
                            <input
                                type="date"
                                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-sm pl-11 pr-2 py-1 text-[10px] text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-[9px] text-slate-400 font-bold uppercase">Sampai</span>
                            <input
                                type="date"
                                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-sm pl-15 pr-2 py-1 text-[10px] text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                )}
            </div>

            <DataTable 
                columns={columns}
                data={journals}
                loading={loading}
                renderSubComponent={renderSubComponent}
                searchPlaceholder="Search journals..."
                exportFileName="general-ledger"
                manualPagination={true}
                pageCount={pagination.lastPage}
                paginationState={{
                    pageIndex: pagination.currentPage - 1,
                    pageSize: pagination.pageSize
                }}
                onPaginationChange={(updater) => {
                    const next = typeof updater === 'function' ? updater({ pageIndex: pagination.currentPage - 1, pageSize: pagination.pageSize }) : updater;
                    fetchJournals(next.pageIndex + 1, next.pageSize, search, activeRange.start, activeRange.end);
                }}
                onSearchChange={(val) => setSearch(val)}
            />
        </div>
    );
};

export default JournalList;
