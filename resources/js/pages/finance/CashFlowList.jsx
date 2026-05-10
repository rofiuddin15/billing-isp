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

const StatCard = ({ title, amount, icon: Icon, colorClass }) => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-sm border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
        <div className={`p-4 rounded-xl ${colorClass} bg-opacity-10 text-opacity-100`}>
            <Icon className="w-6 h-6" />
        </div>
        <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{title}</p>
            <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">Rp {Number(amount).toLocaleString()}</p>
        </div>
    </div>
);

import DataTable from '../../components/DataTable';

const CashFlowList = () => {
    const dispatch = useDispatch();
    const { entries, stats, loading, pagination } = useSelector(state => state.finance);
    const { items: categories } = useSelector(state => state.transactionCategories);
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState('');
    const [formData, setFormData] = useState({
        transaction_date: new Date().toISOString().split('T')[0],
        type: 'expense',
        category_id: '',
        amount: '',
        description: ''
    });

    useEffect(() => {
        dispatch(fetchCashFlows({ page: 1 }));
        dispatch(fetchFinanceStats());
        dispatch(fetchTransactionCategories());
    }, [dispatch]);

    const handleSearch = (val) => {
        setSearch(val);
        dispatch(fetchCashFlows({ page: 1, search: val }));
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
            dispatch(fetchFinanceStats());
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
                    {info.row.original.type === 'income' ? '+' : '-'} Rp {Number(info.getValue()).toLocaleString()}
                </span>
            )
        }
    ], []);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Arus Kas</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Pantau pemasukan dan pengeluaran Anda.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Pemasukan" amount={stats.total_income} icon={TrendingUp} colorClass="text-emerald-600 bg-emerald-600" />
                <StatCard title="Total Pengeluaran" amount={stats.total_expense} icon={TrendingDown} colorClass="text-rose-600 bg-rose-600" />
                <StatCard title="Saldo Saat Ini" amount={stats.balance} icon={Wallet} colorClass="text-indigo-600 bg-indigo-600" />
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
                    dispatch(fetchCashFlows({ page: next.pageIndex + 1, per_page: next.pageSize, search }));
                }}
                onSearchChange={handleSearch}
                exportFileName="laporan-arus-kas"
                actions={
                    <button 
                        onClick={() => setShowModal(true)}
                        className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-sm text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Transaksi
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
                                        onChange={e => setFormData({...formData, type: e.target.value})}
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
