import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCustomers, deleteCustomer } from '../../store/slices/customerSlice';
import { 
    useReactTable, 
    getCoreRowModel, 
    flexRender, 
} from '@tanstack/react-table';
import { 
    Plus, 
    Search, 
    Edit2, 
    Trash2, 
    MapPin, 
    CreditCard, 
    AlertCircle, 
    CheckCircle2, 
    X,
    Banknote,
    User,
    Calendar,
    Upload,
    Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Badge from '../../components/Badge';
import apiFetch from '../../utils/api';
import { toast } from 'react-toastify';
import { saveAs } from 'file-saver';

import DataTable from '../../components/DataTable';

const CustomerList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items: customers, loading, pagination } = useSelector(state => state.customers);
    const [search, setSearch] = useState('');
    const [importLoading, setImportLoading] = useState(false);
    
    // Modal States
    const [showPayModal, setShowPayModal] = useState(false);
    const [showActionModal, setShowActionModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [unpaidInvoices, setUnpaidInvoices] = useState([]);
    const [payLoading, setPayLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [payingInvoice, setPayingInvoice] = useState(null);
    const [appSettings, setAppSettings] = useState({});
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    useEffect(() => {
        dispatch(fetchCustomers({ page: 1 }));
        apiFetch('/api/settings').then(res => setAppSettings(res)).catch(err => console.error(err));
    }, [dispatch]);

    const handleSearch = (val) => {
        setSearch(val);
        dispatch(fetchCustomers({ page: 1, search: val }));
    };

    const handleDownloadTemplate = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/customers/template', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                }
            });
            const blob = await response.blob();
            saveAs(blob, 'template_pelanggan.xlsx');
        } catch (error) {
            toast.error('Gagal mengunduh template');
        }
    };

    const handleImportFile = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setImportLoading(true);
        try {
            const res = await apiFetch('/api/customers/import', {
                method: 'POST',
                body: formData
            });
            toast.success(res.message);
            dispatch(fetchCustomers({ page: 1 }));
        } catch (error) {
            toast.error(error.message);
        } finally {
            setImportLoading(false);
            e.target.value = ''; // Reset input
        }
    };

    const openPayModal = (e, customer) => {
        e.stopPropagation();
        setSelectedCustomer(customer);
        setPayLoading(true);
        setShowPayModal(true);
        setPayingInvoice(null);
        setPaymentSuccess(false);
        apiFetch(`/api/payments?customer_id=${customer.id}&status=unpaid`)
            .then(res => setUnpaidInvoices(res.data))
            .catch(err => toast.error(err.message))
            .finally(() => setPayLoading(false));
    };

    const handlePayInvoice = async () => {
        if (!payingInvoice) return;
        setPayLoading(true);
        try {
            const paidInvoice = await apiFetch(`/api/payments/${payingInvoice.id}/pay`, { method: 'POST' });
            toast.success('Pembayaran berhasil dicatat');
            setPaymentSuccess(true);
            setPayingInvoice(paidInvoice);
            const res = await apiFetch(`/api/payments?customer_id=${selectedCustomer.id}&status=unpaid`);
            setUnpaidInvoices(res.data);
            dispatch(fetchCustomers({ page: pagination.currentPage, search }));
        } catch (error) {
            toast.error(error.message);
        } finally {
            setPayLoading(false);
        }
    };

    const openActionModal = (e, customer) => {
        e.stopPropagation();
        setSelectedCustomer(customer);
        setShowActionModal(true);
    };

    const handleUpdateStatus = async (newStatus) => {
        setActionLoading(true);
        try {
            await apiFetch(`/api/customers/${selectedCustomer.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    ...selectedCustomer,
                    monthly_package_id: selectedCustomer.monthly_package_id,
                    status: newStatus
                })
            });
            toast.success('Status pelanggan berhasil diperbarui');
            setShowActionModal(false);
            dispatch(fetchCustomers({ page: pagination.currentPage, search }));
        } catch (error) {
            toast.error(error.message);
        } finally {
            setActionLoading(false);
        }
    };

    const columns = useMemo(() => [
        {
            header: 'Pelanggan',
            accessorKey: 'name',
            cell: info => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-slate-800 dark:text-white leading-none mb-1">{info.getValue()}</div>
                        <div className="text-xs text-slate-500 font-mono tracking-tight">{info.row.original.customer_code}</div>
                    </div>
                </div>
            )
        },
        {
            header: 'Paket',
            accessorKey: 'monthly_package.name',
            cell: info => <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">{info.getValue() || 'Tanpa Paket'}</div>
        },
        {
            header: 'Penagihan',
            id: 'billing_status',
            cell: info => {
                const payments = info.row.original.payments || [];
                const currentPeriod = new Date().toISOString().slice(0, 7);
                const currentBill = payments.find(p => p.period === currentPeriod);
                
                if (!currentBill) return <Badge variant="default" className="text-[10px] px-1.5 py-0.5">TIDAK ADA TAGIHAN</Badge>;
                
                return currentBill.status === 'paid' ? (
                    <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[10px] uppercase tracking-wide bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded">
                        <CheckCircle2 className="w-3 h-3" /> LUNAS
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5 text-rose-600 font-bold text-[10px] animate-pulse uppercase tracking-wide bg-rose-50 dark:bg-rose-500/10 px-2 py-1 rounded">
                        <AlertCircle className="w-3 h-3" /> BELUM BAYAR
                    </div>
                );
            }
        },
        {
            header: 'Tunggakan',
            accessorKey: 'total_arrears',
            cell: info => {
                const amount = Number(info.getValue() || 0);
                if (amount === 0) return <span className="text-slate-300">-</span>;
                return (
                    <div className="text-sm font-black text-rose-600 bg-rose-50 dark:bg-rose-500/10 px-2 py-1 rounded w-fit">
                        Rp {amount.toLocaleString()}
                    </div>
                );
            }
        },
        {
            header: 'Status',
            accessorKey: 'status',
            cell: info => {
                const status = info.getValue();
                let variant = 'success';
                let label = 'Aktif';
                if (status === 'isolir') {
                    variant = 'warning';
                    label = 'Isolir';
                }
                if (status === 'non-active') {
                    variant = 'danger';
                    label = 'Non-Aktif';
                }
                
                return (
                    <Badge variant={variant} className="text-[10px] px-2 py-0.5 uppercase tracking-wider font-black">
                        {label}
                    </Badge>
                );
            }
        },
        {
            header: 'Aksi',
            id: 'actions',
            cell: info => (
                <div className="flex items-center justify-end gap-2">
                    <button 
                        onClick={(e) => openActionModal(e, info.row.original)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-sm text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 border border-slate-200"
                    >
                        <AlertCircle className="w-3.5 h-3.5" /> Tindakan
                    </button>
                    <button 
                        onClick={(e) => openPayModal(e, info.row.original)}
                        className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-sm transition-all shadow-md shadow-emerald-500/10 active:scale-95"
                        title="Bayar Cepat"
                    >
                        <CreditCard className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/customers/${info.row.original.id}/edit`);
                        }}
                        className="p-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-sm transition-all shadow-md shadow-indigo-500/10 active:scale-95"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Hapus pelanggan ini?')) dispatch(deleteCustomer(info.row.original.id));
                        }}
                        className="p-2 bg-rose-500 hover:bg-rose-600 text-white rounded-sm transition-all shadow-md shadow-rose-500/10 active:scale-95"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ], [pagination.currentPage, search, dispatch, navigate]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Manajemen Pelanggan</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Pantau status berlangganan dan penagihan pelanggan.</p>
                </div>
            </div>

            <DataTable 
                columns={columns}
                data={customers}
                loading={loading}
                onRowClick={(customer) => navigate(`/customers/${customer.id}`)}
                manualPagination={true}
                pageCount={pagination.lastPage}
                paginationState={{
                    pageIndex: pagination.currentPage - 1,
                    pageSize: 10
                }}
                onPaginationChange={(updater) => {
                    const next = typeof updater === 'function' ? updater({ pageIndex: pagination.currentPage - 1, pageSize: 10 }) : updater;
                    dispatch(fetchCustomers({ page: next.pageIndex + 1, per_page: next.pageSize, search }));
                }}
                onSearchChange={handleSearch}
                exportFileName="daftar-pelanggan"
                actions={
                    <div className="flex gap-2">
                        <button 
                            onClick={handleDownloadTemplate}
                            className="flex items-center px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-sm text-sm font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                        >
                            <Download className="w-4 h-4 sm:mr-2 text-emerald-600" />
                            <span className="hidden sm:inline">Template</span>
                        </button>
                        <label className="flex items-center px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-sm text-sm font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95 cursor-pointer">
                            <Upload className={`w-4 h-4 sm:mr-2 text-indigo-600 ${importLoading ? 'animate-bounce' : ''}`} />
                            <span className="hidden sm:inline">{importLoading ? 'Importing...' : 'Import'}</span>
                            <input type="file" accept=".xlsx,.csv" className="hidden" onChange={handleImportFile} disabled={importLoading} />
                        </label>
                        <button 
                            onClick={async () => {
                                if (confirm('Hasilkan tagihan untuk semua pelanggan aktif bulan ini?')) {
                                    try {
                                        const res = await apiFetch('/api/payments/generate', { method: 'POST' });
                                        toast.success(res.message);
                                        dispatch(fetchCustomers({ page: 1 }));
                                    } catch (error) {
                                        toast.error(error.message);
                                    }
                                }
                            }}
                            className="flex items-center px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-sm text-sm font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                        >
                            <CreditCard className="w-4 h-4 sm:mr-2 text-indigo-600" />
                            <span className="hidden sm:inline">Tagihan</span>
                        </button>
                        <button 
                            onClick={() => navigate('/customers/create')}
                            className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-sm text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                        >
                            <Plus className="w-4 h-4 sm:mr-2" />
                            <span className="hidden sm:inline">Tambah</span>
                        </button>
                    </div>
                }
            />

            {/* Payment Modal */}
            {showPayModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-sm shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-lg">
                                    <Banknote className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Gerbang Pembayaran</h3>
                            </div>
                            <button onClick={() => setShowPayModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="p-8 space-y-8">
                            {selectedCustomer && (
                                <div className="flex items-center gap-5 p-5 bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-sm">
                                    <div className="w-14 h-14 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-indigo-600 border border-indigo-100 dark:border-indigo-800">
                                        <User className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-slate-800 dark:text-white leading-tight">{selectedCustomer.name}</p>
                                        <p className="text-sm text-slate-500 mt-1 font-medium">{selectedCustomer.customer_code} • <span className="text-indigo-600 font-bold">{selectedCustomer.monthly_package?.name}</span></p>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Calendar className="w-3 h-3" /> {payingInvoice ? 'Konfirmasi Pembayaran' : 'Tagihan Belum Dibayar'}
                                </h4>

                                {payLoading && !payingInvoice ? (
                                    <div className="py-12 text-center text-slate-400 italic font-medium">Memuat tagihan...</div>
                                ) : payingInvoice ? (
                                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-sm border border-slate-200 dark:border-slate-800 space-y-6">
                                        <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-700">
                                            <span className="text-sm text-slate-500 font-medium">Periode Tagihan</span>
                                            <span className="text-sm font-bold text-slate-800 dark:text-white">{payingInvoice.period}</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-700">
                                            <span className="text-sm text-slate-500 font-medium">Nomor Invoice</span>
                                            <span className="text-xs font-mono text-slate-400">{payingInvoice.invoice_number}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-slate-500 font-medium">Total Pembayaran</span>
                                            <span className="text-2xl font-black text-indigo-600">Rp {Number(payingInvoice.amount).toLocaleString()}</span>
                                        </div>

                                        <div className="pt-4 flex gap-3">
                                            {paymentSuccess ? (
                                                <button 
                                                    onClick={() => {
                                                        import('../../utils/ReceiptService').then(m => {
                                                            m.default.generatePaymentReceipt(payingInvoice, selectedCustomer, appSettings);
                                                        });
                                                    }}
                                                    className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest rounded-sm shadow-xl shadow-indigo-600/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                                                >
                                                    <Download className="w-5 h-5" /> Cetak Struk Pembayaran
                                                </button>
                                            ) : (
                                                <>
                                                    <button 
                                                        onClick={() => setPayingInvoice(null)}
                                                        className="flex-1 py-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold rounded-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                                                    >
                                                        Kembali
                                                    </button>
                                                    <button 
                                                        onClick={handlePayInvoice}
                                                        disabled={payLoading}
                                                        className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-sm shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
                                                    >
                                                        {payLoading ? 'Memproses...' : 'Bayar Sekarang'}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ) : unpaidInvoices.length === 0 ? (
                                    <div className="py-10 text-center bg-emerald-50/30 dark:bg-emerald-900/10 rounded-sm border border-dashed border-emerald-200 dark:border-emerald-900/30">
                                        <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                                        <p className="text-emerald-600 dark:text-emerald-400 font-bold text-base">Luar biasa! Semua tagihan telah lunas.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                                        {unpaidInvoices.map((inv) => (
                                            <div key={inv.id} className="flex items-center justify-between p-5 border border-slate-200 dark:border-slate-800 rounded-sm hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/5 transition-all group">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded shadow-sm">
                                                        <Calendar className="w-5 h-5 text-slate-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-base font-bold text-slate-800 dark:text-white leading-none">{inv.period}</p>
                                                        <p className="text-xs text-slate-400 font-mono mt-1">{inv.invoice_number}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <span className="text-lg font-black text-slate-900 dark:text-white">Rp {Number(inv.amount).toLocaleString()}</span>
                                                    <button 
                                                        onClick={() => setPayingInvoice(inv)}
                                                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-sm shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                                                    >
                                                        Konfirmasi Bayar
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="px-8 py-5 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 flex justify-end items-center gap-4">
                             <p className="text-xs text-slate-400 italic mr-auto">Pembayaran dicatat langsung ke Arus Kas.</p>
                            <button 
                                onClick={() => setShowPayModal(false)}
                                className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Action Modal (Tindakan) */}
            {showActionModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-sm shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-rose-600 text-white">
                            <h3 className="text-lg font-bold">Tindakan Pelanggan</h3>
                            <button onClick={() => setShowActionModal(false)}><X className="w-6 h-6" /></button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="text-center space-y-2">
                                <p className="text-slate-500 text-sm">Kelola status untuk pelanggan:</p>
                                <p className="text-xl font-black text-slate-800 dark:text-white">{selectedCustomer?.name}</p>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <button 
                                    onClick={() => handleUpdateStatus('active')}
                                    disabled={actionLoading || selectedCustomer?.status === 'active'}
                                    className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/20 rounded-sm hover:bg-emerald-100 transition-all group disabled:opacity-50"
                                >
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                        <span className="font-bold text-emerald-700">Aktifkan Kembali</span>
                                    </div>
                                </button>

                                <button 
                                    onClick={() => handleUpdateStatus('isolir')}
                                    disabled={actionLoading || selectedCustomer?.status === 'isolir'}
                                    className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/20 rounded-sm hover:bg-amber-100 transition-all group disabled:opacity-50"
                                >
                                    <div className="flex items-center gap-3">
                                        <AlertCircle className="w-5 h-5 text-amber-600" />
                                        <span className="font-bold text-amber-700">Isolir Layanan</span>
                                    </div>
                                </button>

                                <button 
                                    onClick={() => handleUpdateStatus('non-active')}
                                    disabled={actionLoading || selectedCustomer?.status === 'non-active'}
                                    className="flex items-center justify-between p-4 bg-rose-50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/20 rounded-sm hover:bg-rose-100 transition-all group disabled:opacity-50"
                                >
                                    <div className="flex items-center gap-3">
                                        <X className="w-5 h-5 text-rose-600" />
                                        <span className="font-bold text-rose-700">Non-Aktifkan</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerList;
