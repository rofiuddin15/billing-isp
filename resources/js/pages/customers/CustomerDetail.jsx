import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    User, 
    MapPin, 
    Phone, 
    Mail, 
    Package, 
    Calendar, 
    ArrowLeft, 
    Edit, 
    CreditCard, 
    CheckCircle, 
    AlertCircle,
    Download,
    History,
    CheckCircle2,
    Clock,
    Hash,
    ShieldCheck,
    X
} from 'lucide-react';
import apiFetch from '../../utils/api';
import Badge from '../../components/Badge';
import MapPicker from '../../components/MapPicker';
import { toast } from 'react-toastify';
import ReceiptService from '../../utils/ReceiptService';

const CustomerDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);

    // Payment Modal States
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [useBalance, setUseBalance] = useState(false);
    const [amountPaid, setAmountPaid] = useState('');
    const [submittingPay, setSubmittingPay] = useState(false);

    const fetchCustomerData = async () => {
        try {
            const data = await apiFetch(`/api/customers/${id}`);
            setCustomer(data);
        } catch (error) {
            toast.error('Gagal memuat detail pelanggan');
            navigate('/customers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomerData();
    }, [id]);

    const openPaymentModal = (invoice) => {
        setSelectedInvoice(invoice);
        setUseBalance(false);
        setAmountPaid(String(invoice.amount));
        setShowPaymentModal(true);
    };

    const handlePaySubmit = async (e) => {
        e.preventDefault();
        setSubmittingPay(true);
        try {
            await apiFetch(`/api/payments/${selectedInvoice.id}/pay`, {
                method: 'POST',
                body: JSON.stringify({
                    amount_paid: amountPaid,
                    use_balance: useBalance
                })
            });
            toast.success('Pembayaran berhasil dicatat');
            setShowPaymentModal(false);
            fetchCustomerData();
        } catch (error) {
            toast.error(error.message || 'Gagal memproses pembayaran');
        } finally {
            setSubmittingPay(false);
        }
    };

    if (loading) return (
        <div className="p-8 space-y-6 animate-pulse">
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-48"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-sm"></div>
                <div className="lg:col-span-2 space-y-6">
                    <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-sm"></div>
                    <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-sm"></div>
                </div>
            </div>
        </div>
    );
    
    if (!customer) return null;

    const unpaidInvoices = customer.payments?.filter(p => p.status === 'unpaid') || [];
    const totalUnpaid = unpaidInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header / Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/customers')}
                        className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-indigo-600 rounded-sm transition-all shadow-sm active:scale-95"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Detail Pelanggan</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-widest mt-0.5">Informasi Lengkap & Riwayat Tagihan</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => navigate(`/customers/${id}/edit`)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-sm text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                    >
                        <Edit className="w-4 h-4" /> Edit Profil
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Profile Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm overflow-hidden shadow-sm relative">
                        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 h-28"></div>
                        <div className="px-6 pb-8">
                            <div className="-mt-14 flex justify-center relative z-10">
                                <div className="w-28 h-28 rounded-full border-4 border-white dark:border-slate-900 bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 shadow-xl overflow-hidden">
                                    <User className="w-14 h-14" />
                                </div>
                            </div>
                            <div className="text-center mt-4">
                                <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{customer.name}</h2>
                                <div className="flex items-center justify-center gap-2 mt-1">
                                    <Hash className="w-3 h-3 text-slate-400" />
                                    <span className="text-xs text-slate-400 font-black tracking-widest">{customer.customer_code}</span>
                                </div>
                                <div className="flex justify-center mt-5">
                                    <Badge variant={customer.status === 'active' ? 'success' : (customer.status === 'isolir' ? 'warning' : 'danger')} className="px-4 py-1 text-[10px] font-black uppercase tracking-widest">
                                        {customer.status === 'active' ? 'Pelanggan Aktif' : (customer.status === 'isolir' ? 'Status Terisolir' : 'Non-Aktif')}
                                    </Badge>
                                </div>
                            </div>

                            <div className="mt-10 space-y-6 border-t border-slate-50 dark:border-slate-800 pt-8 px-2">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-400">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Alamat Lokasi</p>
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed">{customer.address || 'Alamat belum diatur'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-400">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Kontak WhatsApp</p>
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{customer.phone || 'Kontak tidak tersedia'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-indigo-600">
                                        <Package className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Paket Langganan</p>
                                        <p className="text-base font-black text-indigo-600 dark:text-indigo-400 tracking-tight">{customer.monthly_package?.name || 'Belum pilih paket'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 border-t border-slate-50 dark:border-slate-800 pt-4">
                                    <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg text-emerald-600">
                                        <CreditCard className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Saldo Aktif Pelanggan</p>
                                        <p className="text-base font-black text-emerald-600 dark:text-emerald-400 tracking-tight">Rp {Number(customer.balance || 0).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 rounded-sm shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Titik Koordinat</h3>
                        </div>
                        <div className="rounded-sm overflow-hidden border border-slate-100 dark:border-slate-800">
                            <MapPicker lat={customer.latitude} lng={customer.longitude} onChange={() => {}} />
                        </div>
                    </div>
                </div>

                {/* Right Column: Billing History */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Summary Bar */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Tunggakan Card */}
                        <div className={`p-6 rounded-sm flex items-center justify-between gap-4 relative overflow-hidden transition-all duration-500 border ${totalUnpaid > 0 ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/30' : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30'}`}>
                            <div className="flex items-center gap-4 relative z-10">
                                <div className={`p-3 rounded-xl shadow-md transition-colors ${totalUnpaid > 0 ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 shadow-rose-200 dark:shadow-none' : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 shadow-emerald-200 dark:shadow-none'}`}>
                                    {totalUnpaid > 0 ? <AlertCircle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                                </div>
                                <div>
                                    <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${totalUnpaid > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>Total Tunggakan</p>
                                    <p className={`text-2xl font-black tabular-nums tracking-tight ${totalUnpaid > 0 ? 'text-rose-800 dark:text-rose-400' : 'text-emerald-800 dark:text-emerald-400'}`}>
                                        Rp {Number(totalUnpaid).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <div className="relative z-10">
                                {totalUnpaid > 0 ? (
                                    <div className="px-3 py-1 bg-rose-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full">
                                        MENUNGGAK
                                    </div>
                                ) : (
                                    <div className="px-3 py-1 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full">
                                        LUNAS
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Saldo Card */}
                        <div className="p-6 rounded-sm bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/30 flex items-center justify-between gap-4 relative overflow-hidden transition-all duration-500">
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 shadow-md shadow-indigo-200 dark:shadow-none">
                                    <CreditCard className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Saldo Aktif</p>
                                    <p className="text-2xl font-black text-indigo-800 dark:text-indigo-400 tabular-nums tracking-tight">
                                        Rp {Number(customer.balance || 0).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <div className="relative z-10">
                                <div className="px-3 py-1 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full">
                                    SALDO
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table Container */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-sm overflow-hidden flex flex-col">
                        <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
                            <div>
                                <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">Riwayat Penagihan</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Semua invoice dan status pembayaran</p>
                            </div>
                            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 rounded-lg">
                                <History className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="overflow-x-auto overflow-y-auto max-h-[600px] custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-sm">
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nomor Invoice</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Periode</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Jumlah Tagihan</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                    {customer.payments?.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-8 py-20 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <CreditCard className="w-10 h-10 text-slate-200" />
                                                    <p className="text-slate-400 italic font-bold text-sm">Belum ada riwayat tagihan.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        customer.payments?.map((inv) => (
                                            <tr key={inv.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all">
                                                <td className="px-8 py-6">
                                                    <span className="text-sm font-black text-slate-700 dark:text-slate-300 font-mono tracking-tight group-hover:text-indigo-600 transition-colors">{inv.invoice_number}</span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400">
                                                        <Calendar className="w-4 h-4 text-slate-400" />
                                                        {inv.period}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="text-base font-black text-slate-800 dark:text-white tabular-nums">
                                                        Rp {Number(inv.amount).toLocaleString()}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <Badge variant={inv.status === 'paid' ? 'success' : 'danger'} className="px-3 py-1 text-[9px] font-black uppercase tracking-widest">
                                                        {inv.status === 'paid' ? 'LUNAS' : 'MENUNGGAK'}
                                                    </Badge>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    {inv.status === 'unpaid' && (
                                                        <button 
                                                            onClick={() => openPaymentModal(inv)}
                                                            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-sm text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/20 active:scale-95 flex items-center gap-2 ml-auto"
                                                        >
                                                            <CreditCard className="w-3.5 h-3.5" /> Konfirmasi Bayar
                                                        </button>
                                                    )}
                                                    {inv.status === 'paid' && (
                                                        <div className="flex items-center justify-end gap-3">
                                                            <button 
                                                                onClick={() => ReceiptService.generatePaymentReceipt(inv, customer)}
                                                                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                                                            >
                                                                <Download className="w-3.5 h-3.5 text-indigo-600" /> Cetak Struk
                                                            </button>
                                                            <div className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-widest">
                                                                <CheckCircle className="w-5 h-5" /> TERBAYAR
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            {/* Interactive Payment Modal */}
            {showPaymentModal && selectedInvoice && (() => {
                const invoiceAmt = Number(selectedInvoice.amount || 0);
                const custBal = Number(customer.balance || 0);
                
                const maxBalanceUse = useBalance ? Math.min(invoiceAmt, custBal) : 0;
                const netInvoiceAmount = Math.max(0, invoiceAmt - maxBalanceUse);
                
                const cashReceived = Number(amountPaid || 0);
                const excessPayment = Math.max(0, cashReceived - netInvoiceAmount);
                const projectedNewBalance = custBal - maxBalanceUse + excessPayment;
                
                const cashShortfall = netInvoiceAmount > cashReceived ? (netInvoiceAmount - cashReceived) : 0;

                return (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-sm shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-indigo-600 text-white">
                                <div>
                                    <h3 className="text-lg font-bold">Konfirmasi Pembayaran</h3>
                                    <p className="text-xs text-indigo-100 mt-0.5">{selectedInvoice.invoice_number} • Periode {selectedInvoice.period}</p>
                                </div>
                                <button onClick={() => setShowPaymentModal(false)} className="text-white hover:text-indigo-200 transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            
                            <form onSubmit={handlePaySubmit} className="p-6 space-y-5">
                                {/* Current Stats */}
                                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800/30 rounded-sm border border-slate-100 dark:border-slate-800/50">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tagihan Asli</p>
                                        <p className="text-lg font-black text-slate-700 dark:text-slate-200 mt-0.5">Rp {invoiceAmt.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saldo Saat Ini</p>
                                        <p className="text-lg font-black text-slate-700 dark:text-slate-200 mt-0.5">Rp {custBal.toLocaleString()}</p>
                                    </div>
                                </div>

                                {/* Use Balance Checkbox */}
                                {custBal > 0 && (
                                    <label className="flex items-center gap-3 p-3.5 bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-900/30 rounded-sm cursor-pointer select-none">
                                        <input 
                                            type="checkbox"
                                            checked={useBalance}
                                            onChange={(e) => {
                                                const checked = e.target.checked;
                                                setUseBalance(checked);
                                                // Pre-fill remaining amount automatically when check state changes
                                                const newDeduction = checked ? Math.min(invoiceAmt, custBal) : 0;
                                                setAmountPaid(String(invoiceAmt - newDeduction));
                                            }}
                                            className="w-4.5 h-4.5 text-indigo-600 border-slate-300 dark:border-slate-700 rounded focus:ring-indigo-500"
                                        />
                                        <div>
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Gunakan Saldo Aktif</p>
                                            <p className="text-[10px] text-slate-500 mt-0.5">Potong maksimal Rp {Math.min(invoiceAmt, custBal).toLocaleString()}</p>
                                        </div>
                                    </label>
                                )}

                                {/* Cash Input Field */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Jumlah Uang Tunai Diterima (Rp)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">Rp</span>
                                        <input 
                                            type="number"
                                            required
                                            min="0"
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-sm pl-10 pr-4 py-3 text-base font-black text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                            value={amountPaid}
                                            onChange={(e) => setAmountPaid(e.target.value)}
                                            placeholder="Masukkan nominal tunai..."
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-400 italic">Masukkan jumlah yang dibayarkan secara fisik oleh pelanggan.</p>
                                </div>

                                {/* Calculation Details */}
                                <div className="border-t border-dashed border-slate-200 dark:border-slate-800 pt-4 space-y-2.5 text-sm">
                                    {useBalance && (
                                        <div className="flex justify-between text-slate-500">
                                            <span>Potong dari Saldo:</span>
                                            <span className="font-bold text-rose-600 dark:text-rose-400">-Rp {maxBalanceUse.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-slate-700 dark:text-slate-300 font-bold">
                                        <span>Sisa Tagihan Tunai:</span>
                                        <span>Rp {netInvoiceAmount.toLocaleString()}</span>
                                    </div>
                                    
                                    {excessPayment > 0 && (
                                        <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/15 p-2 rounded-sm">
                                            <span>Kelebihan (Masuk Saldo):</span>
                                            <span>+Rp {excessPayment.toLocaleString()}</span>
                                        </div>
                                    )}
                                    
                                    {cashShortfall > 0 && (
                                        <div className="flex justify-between text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/15 p-2 rounded-sm">
                                            <span>Kekurangan Bayar:</span>
                                            <span>Rp {cashShortfall.toLocaleString()}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between text-indigo-600 dark:text-indigo-400 font-bold border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
                                        <span>Saldo Akhir Pelanggan:</span>
                                        <span>Rp {projectedNewBalance.toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div className="pt-4 flex gap-3">
                                    <button 
                                        type="button"
                                        onClick={() => setShowPaymentModal(false)}
                                        className="flex-1 py-3 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-bold rounded-sm text-sm transition-all"
                                    >
                                        Batal
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={submittingPay || cashShortfall > 0}
                                        className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-sm text-sm shadow-lg shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {submittingPay ? 'Memproses...' : 'Catat Pembayaran'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

export default CustomerDetail;
