import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVouchers, fetchVoucherPackages, generateVouchers, sellVoucher } from '../../store/slices/voucherSlice';
import Badge from '../../components/Badge';
import DataTable from '../../components/DataTable';
import { Ticket, Plus, Search, Filter, ShoppingCart, Trash2 } from 'lucide-react';

const VoucherInventory = () => {
    const dispatch = useDispatch();
    const { vouchers, packages, loading, pagination } = useSelector(state => state.vouchers);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [generateData, setGenerateData] = useState({ package_id: '', count: 10 });
    const [search, setSearch] = useState('');

    const handleSearch = (val) => {
        setSearch(val);
        dispatch(fetchVouchers({ page: 1, search: val }));
    };

    useEffect(() => {
        dispatch(fetchVouchers({ page: 1 }));
        dispatch(fetchVoucherPackages());
    }, [dispatch]);

    const handleGenerate = async (e) => {
        e.preventDefault();
        const result = await dispatch(generateVouchers(generateData));
        if (generateVouchers.fulfilled.match(result)) {
            setShowGenerateModal(false);
        }
    };

    const handleSell = (id) => {
        if (confirm('Jual voucher ini?')) {
            dispatch(sellVoucher(id));
        }
    };

    const columns = React.useMemo(() => [
        {
            header: 'Kode Voucher',
            accessorKey: 'code',
            cell: info => (
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded text-slate-500">
                        <Ticket className="w-4 h-4" />
                    </div>
                    <span className="font-mono font-bold text-slate-800 dark:text-white">{info.getValue()}</span>
                </div>
            )
        },
        {
            header: 'Paket',
            accessorKey: 'package.name',
            cell: info => (
                <div>
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">{info.getValue()}</div>
                    <div className="text-xs text-slate-500 font-bold text-emerald-600 dark:text-emerald-400">
                        Rp {Number(info.row.original.package?.price).toLocaleString()}
                    </div>
                </div>
            )
        },
        {
            header: 'Status',
            accessorKey: 'status',
            cell: info => {
                const status = info.getValue();
                const label = status === 'ready' ? 'SIAP' : 'TERJUAL';
                return (
                    <Badge variant={status === 'ready' ? 'success' : 'warning'}>
                        {label}
                    </Badge>
                );
            }
        },
        {
            header: 'Dibuat Pada',
            accessorKey: 'created_at',
            cell: info => <span className="text-xs text-slate-500">{new Date(info.getValue()).toLocaleString('id-ID')}</span>
        },
        {
            header: 'Aksi',
            id: 'actions',
            cell: info => (
                <div className="flex items-center gap-2">
                    {info.row.original.status === 'ready' && (
                        <button 
                            onClick={() => handleSell(info.row.original.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-sm text-xs font-bold transition-all"
                        >
                            <ShoppingCart className="w-3 h-3" />
                            Jual
                        </button>
                    )}
                </div>
            )
        }
    ], []);

    const filteredCategories = React.useMemo(() => {
        return packages; // Placeholder if needed, but DataTable handles search
    }, [packages]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Inventori Voucher</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Kelola dan jual voucher yang telah dibuat.</p>
                </div>
            </div>

            <DataTable 
                columns={columns}
                data={vouchers}
                loading={loading}
                manualPagination={true}
                pageCount={pagination.lastPage}
                paginationState={{
                    pageIndex: pagination.currentPage - 1,
                    pageSize: 10
                }}
                onPaginationChange={(updater) => {
                    const next = typeof updater === 'function' ? updater({ pageIndex: pagination.currentPage - 1, pageSize: 10 }) : updater;
                    dispatch(fetchVouchers({ page: next.pageIndex + 1, per_page: next.pageSize, search }));
                }}
                onSearchChange={handleSearch}
                searchPlaceholder="Cari kode voucher..."
                exportFileName="inventori-voucher"
                actions={
                    <button 
                        onClick={() => setShowGenerateModal(true)}
                        className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-sm text-sm font-semibold transition-all shadow-sm active:scale-95"
                    >
                        <Plus className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Buat Batch</span>
                    </button>
                }
            />

            {/* Generate Modal */}
            {showGenerateModal && (
                <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-sm shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="font-bold text-slate-800 dark:text-white">Buat Voucher</h3>
                            <button onClick={() => setShowGenerateModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                <Plus className="w-5 h-5 rotate-45" />
                            </button>
                        </div>
                        <form onSubmit={handleGenerate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pilih Paket</label>
                                <select 
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-sm px-4 py-2.5 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={generateData.package_id}
                                    onChange={e => setGenerateData({...generateData, package_id: e.target.value})}
                                >
                                    <option value="">Pilih Paket...</option>
                                    {packages.map(pkg => (
                                        <option key={pkg.id} value={pkg.id}>{pkg.name} - Rp {Number(pkg.price).toLocaleString()}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Jumlah</label>
                                <input 
                                    type="number" 
                                    min="1" 
                                    max="1000"
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-sm px-4 py-2.5 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={generateData.count}
                                    onChange={e => setGenerateData({...generateData, count: e.target.value})}
                                />
                            </div>
                            <div className="pt-4">
                                <button 
                                    type="submit"
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-sm shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                                >
                                    Buat Sekarang
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VoucherInventory;
