import React from 'react';
import { useSelector } from 'react-redux';
import { Package, User, CreditCard, Clock, CheckCircle2, AlertCircle, MapPin, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const CustomerDashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const customer = user?.customer;
    const monthlyPackage = customer?.monthly_package;

    if (!customer) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="text-center">
                    <AlertCircle className="mx-auto h-12 w-12 text-rose-500 mb-4" />
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Data Pelanggan Tidak Ditemukan</h2>
                    <p className="text-slate-500 mt-2">Akun Anda tidak terhubung dengan data pelanggan.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-10 transition-colors duration-300">
            <div className="max-w-6xl mx-auto">
                <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Halo, {user.name}!</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Selamat datang di portal pelanggan MinISP.</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
                            <Package className="text-indigo-600 dark:text-indigo-400 h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">ID Pelanggan</p>
                            <p className="text-sm font-black text-slate-900 dark:text-white">{customer.customer_code}</p>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Package & Billing Status */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Status Card */}
                        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <CreditCard size={160} />
                            </div>
                            
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                                        <Clock className="text-indigo-600 h-5 w-5" /> Status Layanan
                                    </h2>
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                        customer.status === 'active' 
                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                                            : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                                    }`}>
                                        {customer.status === 'active' ? 'Aktif' : 'Nonaktif'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Paket Saat Ini</p>
                                        <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
                                            {monthlyPackage?.name || 'Tidak ada paket'}
                                        </p>
                                        <p className="text-sm text-slate-500 font-medium">Layanan internet bulanan Anda.</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tagihan Bulanan</p>
                                        <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">
                                            Rp {monthlyPackage ? new Intl.NumberFormat('id-ID').format(monthlyPackage.price) : '0'}
                                        </p>
                                        <p className="text-sm text-slate-500 font-medium">Jatuh tempo setiap tanggal 10.</p>
                                    </div>
                                </div>

                                <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                            <CheckCircle2 className="text-emerald-600 dark:text-emerald-400 h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Tagihan Terbayar</p>
                                            <p className="text-[10px] text-slate-500 font-bold">Periode Mei 2026</p>
                                        </div>
                                    </div>
                                    <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
                                        Riwayat Tagihan
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Additional Info / Ads */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-600/20">
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Upgrade Kecepatan</p>
                                <h3 className="text-xl font-black mb-4 tracking-tight">Nikmati Internet 2x Lebih Cepat!</h3>
                                <button className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-colors">
                                    Lihat Penawaran
                                </button>
                            </div>
                            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pusat Bantuan</p>
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Butuh Bantuan?</h3>
                                    <p className="text-[10px] text-slate-500 font-bold">Hubungi tim teknis kami 24/7.</p>
                                </div>
                                <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    <Phone className="text-slate-900 dark:text-white h-6 w-6" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Profile Info */}
                    <div className="space-y-8">
                        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8 flex items-center gap-2">
                                <User className="text-indigo-600 h-5 w-5" /> Profil Saya
                            </h2>

                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                                        <Mail className="text-slate-400 h-5 w-5" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Email</p>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                                        <Phone className="text-slate-400 h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Nomor HP</p>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{customer.phone}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                                        <MapPin className="text-slate-400 h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Alamat</p>
                                        <p className="text-xs font-bold text-slate-900 dark:text-white leading-relaxed">{customer.address}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10">
                                <button className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all">
                                    Edit Profil
                                </button>
                            </div>
                        </div>

                        <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-3xl p-6 border border-indigo-100 dark:border-indigo-900/30">
                            <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2 text-center">Keamanan Akun</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 text-center leading-relaxed italic">
                                Jaga kerahasiaan password Anda dan jangan bagikan kode akses WiFi kepada pihak yang tidak dikenal.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDashboard;
