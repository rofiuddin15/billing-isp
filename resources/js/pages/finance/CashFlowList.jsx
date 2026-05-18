import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCashFlows, fetchFinanceStats, addCashFlowEntry } from '../../store/slices/financeSlice';
import { fetchTransactionCategories } from '../../store/slices/transactionCategorySlice';
import { 
    useReactTable, 
    getCoreRowModel, 
    flexRender, 
} from '@tanstack/react-table';
import { TrendingUp, TrendingDown, Wallet, Plus, Search, Filter, Calendar, X } from 'lucide-react';
import Badge from '../../components/Badge';
import { toast } from 'react-toastify';
import DataTable from '../../components/DataTable';

const StatCard = ({ title, amount, icon: Icon, colorClass, subtext }) => (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-sm border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3 h-full">
        <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${colorClass} bg-opacity-10 text-opacity-100 flex-shrink-0`}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
                <p className="text-lg font-black text-slate-800 dark:text-white mt-0.5">Rp {Number(amount).toLocaleString('id-ID')}</p>
                {subtext && (
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-medium">{subtext}</p>
                )}
            </div>
        </div>
    </div>
);

const CashFlowList = () => {
    const dispatch = useDispatch();
    const { entries, stats, loading, pagination } = useSelector(state => state.finance);
    const { items: categories } = useSelector(state => state.transactionCategories);
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState('');
    
    // Period Filters State
    const [filterType, setFilterType] = useState('this_month'); // Default is 'this_month' (Bulan Ini)
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [formData, setFormData] = useState({
        transaction_date: new Date().toISOString().split('T')[0],
        type: 'expense',
        category_id: '',
        amount: '',
        description: ''
    });

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

    useEffect(() => {
        // Fetch categories once on mount
        dispatch(fetchTransactionCategories());
    }, [dispatch]);

    useEffect(() => {
        // If Custom filter selected, wait until both start and end date are input
        if (filterType === 'custom' && (!startDate || !endDate)) {
            return;
        }

        dispatch(fetchCashFlows({ 
            page: 1, 
            search, 
            start_date: activeRange.start, 
            end_date: activeRange.end 
        }));
        dispatch(fetchFinanceStats({ 
            start_date: activeRange.start, 
            end_date: activeRange.end 
        }));
    }, [dispatch, filterType, startDate, endDate, activeRange, search]);

    const handleSearch = (val) => {
        setSearch(val);
    };

    const filteredCategories = useMemo(() => {
        return categories.filter(cat => cat.type === 'both' || cat.type === formData.type);
    }, [categories, formData.type]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await dispatch(addCashFlowEntry(formData)).unwrap();
            toast.success('Transaction recorded successfully');
            setShowModal(false);
            setFormData({
                transaction_date: new Date().toISOString().split('T')[0],
                type: 'expense',
                category_id: '',
                amount: '',
                description: ''
            });
            // Re-fetch using active filters
            dispatch(fetchFinanceStats({ start_date: activeRange.start, end_date: activeRange.end }));
            dispatch(fetchCashFlows({ page: 1, search, start_date: activeRange.start, end_date: activeRange.end }));
        } catch (error) {
            toast.error(error.message || 'Failed to record transaction');
        }
    };

    const columns = useMemo(() => [
        {
            header: 'Tanggal',
            accessorKey: 'transaction_date',
            cell: info => <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{new Date(info.getValue()).toLocaleDateString('id-ID')}</span>
        },
        {
            header: 'Tipe',
            accessorKey: 'type',
            cell: info => (
                <div className="flex items-center gap-2">
                    {info.getValue() === 'income' ? (
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                    ) : (
                        <TrendingDown className="w-4 h-4 text-rose-500" />
                    )}
                    <Badge variant={info.getValue() === 'income' ? 'success' : 'danger'}>
                        {info.getValue() === 'income' ? 'PEMASUKAN' : 'PENGELUARAN'}
                    </Badge>
                </div>
            )
        },
        {
            header: 'Kategori',
            accessorKey: 'category.name',
            cell: info => <span className="text-xs font-black uppercase tracking-widest text-slate-400">{info.getValue() || 'Tanpa Kategori'}</span>
        },
        {
            header: 'Deskripsi',
            accessorKey: 'description',
            cell: info => <span className="text-sm text-slate-700 dark:text-slate-300 line-clamp-1">{info.getValue()}</span>
        },
        {
            header: 'Jumlah',
            accessorKey: 'amount',
            cell: info => (
                <span className={`font-black tracking-tight ${info.row.original.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {info.row.original.type === 'income' ? '+' : '-'} Rp {Number(info.getValue()).toLocaleString('id-ID')}
                </span>
            )
        }
    ], []);

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white leading-tight">Arus Kas</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">Pantau pemasukan dan pengeluaran Anda.</p>
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

            {/* Financial Stats Grid - Compact 4-Card Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                    title={`Pemasukan ${filterType === 'this_month' ? '(Bulan Ini)' : filterType === 'last_month' ? '(Bulan Lalu)' : filterType === 'custom' ? '(Filter)' : ''}`} 
                    amount={stats.total_income} 
                    icon={TrendingUp} 
                    colorClass="text-emerald-600 bg-emerald-600" 
                />
                <StatCard 
                    title={`Pengeluaran ${filterType === 'this_month' ? '(Bulan Ini)' : filterType === 'last_month' ? '(Bulan Lalu)' : filterType === 'custom' ? '(Filter)' : ''}`} 
                    amount={stats.total_expense} 
                    icon={TrendingDown} 
                    colorClass="text-rose-600 bg-rose-600" 
                />
                <StatCard 
                    title="Pengeluaran Bulan Ini" 
                    amount={stats.this_month_expense} 
                    icon={TrendingDown} 
                    colorClass="text-pink-600 bg-pink-600" 
                />
                <StatCard 
                    title={filterType === 'all_time' ? "Saldo Saat Ini" : "Saldo Periode Ini"} 
                    amount={stats.balance} 
                    icon={Wallet} 
                    colorClass="text-indigo-600 bg-indigo-600"
                    subtext={filterType !== 'all_time' ? `Total: Rp ${Number(stats.lifetime_balance || 0).toLocaleString('id-ID')}` : null}
                />
            </div>

            <DataTable 
                columns={columns}
                data={entries}
                loading={loading}
                manualPagination={true}
                pageCount={pagination.lastPage}
                paginationState={{
                    pageIndex: pagination.currentPage - 1,
                    pageSize: 10
                }}
                onPaginationChange={(updater) => {
                    const next = typeof updater === 'function' ? updater({ pageIndex: pagination.currentPage - 1, pageSize: 10 }) : updater;
                    dispatch(fetchCashFlows({ 
                        page: next.pageIndex + 1, 
                        per_page: next.pageSize, 
                        search,
                        start_date: activeRange.start,
                        end_date: activeRange.end
                    }));
                }}
                onSearchChange={handleSearch}
                exportFileName={`laporan-arus-kas-${filterType}`}
                actions={
                    <button 
                        onClick={() => setShowModal(true)}
                        className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-sm text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                    >
                        <Plus className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Tambah Transaksi</span>
                    </button>
                }
            />

            {/* Transaction Modal */}
            {showModal && (
                <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-sm shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="font-bold text-slate-800 dark:text-white">Catat Transaksi</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tipe</label>
                                    <select 
                                        required
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-sm px-4 py-2.5 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={formData.type}
                                        onChange={e => setFormData({...formData, type: e.target.value, category_id: ''})}
                                    >
                                        <option value="expense">Pengeluaran (-)</option>
                                        <option value="income">Pemasukan (+)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kategori</label>
                                    <select 
                                        required
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-sm px-4 py-2.5 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={formData.category_id}
                                        onChange={e => setFormData({...formData, category_id: e.target.value})}
                                    >
                                        <option value="" disabled>Pilih Kategori</option>
                                        {filteredCategories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tanggal</label>
                                <input 
                                    type="date"
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-sm px-4 py-2.5 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={formData.transaction_date}
                                    onChange={e => setFormData({...formData, transaction_date: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Jumlah (Rp)</label>
                                <input 
                                    type="number"
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-sm px-4 py-2.5 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={formData.amount}
                                    onChange={e => setFormData({...formData, amount: e.target.value})}
                                    placeholder="50000"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Deskripsi</label>
                                <textarea 
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-sm px-4 py-2.5 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={formData.description}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                    rows={2}
                                    placeholder="Detail transaksi..."
                                />
                            </div>
                            <div className="pt-4">
                                <button 
                                    type="submit"
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-sm shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                                >
                                    Catat Transaksi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CashFlowList;
