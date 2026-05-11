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
    ShieldCheck
} from 'lucide-react';
import apiFetch from '../../utils/api';
import Badge from '../../components/Badge';
import MapPicker from '../../components/MapPicker';
import { toast } from 'react-toastify';

const CustomerDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);

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

    const handlePay = async (invoiceId) => {
        if (confirm('Konfirmasi pembayaran untuk invoice ini?')) {
            try {
                await apiFetch(`/api/payments/${invoiceId}/pay`, { method: 'POST' });
                toast.success('Pembayaran berhasil dicatat');
                fetchCustomerData();
            } catch (error) {
                toast.error(error.message);
            }
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
                    <div className={`p-8 rounded-sm flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden transition-all duration-500 ${totalUnpaid > 0 ? 'bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30' : 'bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30'}`}>
                        <div className="flex items-center gap-6 relative z-10">
                            <div className={`p-4 rounded-2xl shadow-lg transition-colors ${totalUnpaid > 0 ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 shadow-rose-200 dark:shadow-none' : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 shadow-emerald-200 dark:shadow-none'}`}>
                                {totalUnpaid > 0 ? <AlertCircle className="w-8 h-8" /> : <CheckCircle2 className="w-8 h-8" />}
                            </div>
                            <div>
                                <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${totalUnpaid > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>Total Tunggakan Saat Ini</p>
                                <p className={`text-4xl font-black tabular-nums tracking-tighter ${totalUnpaid > 0 ? 'text-rose-800 dark:text-rose-400' : 'text-emerald-800 dark:text-emerald-400'}`}>
                                    Rp {Number(totalUnpaid).toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <div className="relative z-10 w-full sm:w-auto">
                            {totalUnpaid > 0 ? (
                                <div className="px-6 py-2.5 bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-rose-600/30 flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5" /> Segera Bayar
                                </div>
                            ) : (
                                <div className="px-6 py-2.5 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-emerald-600/30 flex items-center gap-2">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Lunas Sempurna
                                </div>
                            )}
                        </div>
                        <div className={`absolute top-0 right-0 w-32 h-32 opacity-[0.03] pointer-events-none -mr-8 -mt-8 ${totalUnpaid > 0 ? 'text-rose-900' : 'text-emerald-900'}`}>
                             {totalUnpaid > 0 ? <AlertCircle className="w-full h-full" /> : <CheckCircle2 className="w-full h-full" />}
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
                                                            onClick={() => handlePay(inv.id)}
                                                            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-sm text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/20 active:scale-95 flex items-center gap-2 ml-auto"
                                                        >
                                                            <CreditCard className="w-3.5 h-3.5" /> Konfirmasi Bayar
                                                        </button>
                                                    )}
                                                    {inv.status === 'paid' && (
                                                        <div className="flex items-center justify-end gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-widest">
                                                            <CheckCircle className="w-5 h-5" /> TERBAYAR
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
        </div>
    );
};

export default CustomerDetail;
