import React, { useEffect, useState } from 'react';
import { 
    Users, 
    Ticket, 
    TrendingUp, 
    TrendingDown, 
    ArrowUpRight, 
    ArrowDownRight,
    Activity,
    Package,
    ShieldCheck,
    CreditCard,
    ArrowRight
} from 'lucide-react';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts';
import apiFetch from '../utils/api';
import Badge from '../components/Badge';

const DashboardCard = ({ title, value, icon: Icon, subValue, trend, colorClass, gradient }) => (
    <div className="group bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 overflow-hidden relative">
        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradient} opacity-[0.03] group-hover:opacity-[0.08] transition-opacity -mr-8 -mt-8 rounded-full`} />
        <div className="flex justify-between items-start relative z-10">
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</p>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{value}</h3>
                <div className="flex items-center mt-3 bg-slate-50 dark:bg-slate-800/50 w-fit px-2 py-1 rounded-lg">
                    {trend === 'up' ? (
                        <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500 mr-1" />
                    ) : (
                        <ArrowDownRight className="w-3.5 h-3.5 text-rose-500 mr-1" />
                    )}
                    <span className={`text-[11px] font-bold ${trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>{subValue}</span>
                    <span className="text-[10px] text-slate-400 ml-1 font-medium">vs last month</span>
                </div>
            </div>
            <div className={`p-3.5 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg ${colorClass} shadow-current/20`}>
                <Icon className="w-5 h-5" />
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await apiFetch('/api/dashboard');
                setData(res);
            } catch (error) {
                console.error('Dashboard fetch failed', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) return (
        <div className="p-8 space-y-8 animate-pulse">
            <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>)}
            </div>
            <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Ringkasan Finansial</h2>
                        <div className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Sistem Aktif
                        </div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Memantau denyut nadi finansial ISP Anda secara real-time.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                        Ekspor Laporan
                    </button>
                    <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
                        Transaksi Baru
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard 
                    title="Pelanggan Aktif" 
                    value={data.stats.total_customers} 
                    icon={Users} 
                    subValue="+12%" 
                    trend="up"
                    gradient="from-indigo-500 to-blue-600"
                />
                <DashboardCard 
                    title="Inventori Voucher" 
                    value={data.stats.vouchers_ready} 
                    icon={Ticket} 
                    subValue="+5.4%" 
                    trend="up"
                    gradient="from-amber-400 to-orange-500"
                />
                <DashboardCard 
                    title="Pendapatan Bulan Ini" 
                    value={`Rp ${Number(data.stats.month_income).toLocaleString()}`} 
                    icon={TrendingUp} 
                    subValue="+18%" 
                    trend="up"
                    gradient="from-emerald-400 to-teal-600"
                />
                <DashboardCard 
                    title="Biaya Operasional" 
                    value={`Rp ${Number(data.stats.month_expense).toLocaleString()}`} 
                    icon={TrendingDown} 
                    subValue="-2.1%" 
                    trend="down"
                    gradient="from-rose-400 to-pink-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <TrendingUp className="w-32 h-32 text-indigo-600" />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4 relative z-10">
                        <div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Analisis Performa</h3>
                            <p className="text-xs text-slate-500 font-medium mt-1">Perbandingan antara pendapatan dan pengeluaran</p>
                        </div>
                        <div className="flex items-center gap-6 p-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl px-4">
                            <div className="flex items-center gap-2 text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/50"></div> Pendapatan
                            </div>
                            <div className="flex items-center gap-2 text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                <div className="w-2 h-2 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50"></div> Pengeluaran
                            </div>
                        </div>
                    </div>
                    
                    <div className="h-[380px] w-full relative z-10">
                        <ResponsiveContainer width="100%" height="100%" debounce={100}>
                            <AreaChart data={data.monthly_chart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                                <XAxis 
                                    dataKey="month" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} 
                                    dy={15}
                                    tickFormatter={(val) => val.split('-')[1] + '/' + val.split('-')[0].slice(2)}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} 
                                    tickFormatter={(value) => value === 0 ? '0' : `Rp ${value / 1000}rb`}
                                    dx={-10}
                                />
                                <Tooltip 
                                    cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }}
                                    contentStyle={{ 
                                        borderRadius: '12px', 
                                        border: 'none', 
                                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        padding: '12px'
                                    }}
                                    itemStyle={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase' }}
                                    labelStyle={{ color: '#64748b', fontSize: '10px', marginBottom: '8px', fontWeight: 700 }}
                                    formatter={(value) => `Rp ${Number(value).toLocaleString()}`}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="income" 
                                    stroke="#6366f1" 
                                    strokeWidth={4} 
                                    fillOpacity={1} 
                                    fill="url(#colorIncome)" 
                                    animationDuration={2000}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="expense" 
                                    stroke="#f43f5e" 
                                    strokeWidth={3} 
                                    strokeDasharray="5 5"
                                    fillOpacity={1} 
                                    fill="url(#colorExpense)" 
                                    animationDuration={2000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
                        <div>
                            <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">Arus Kas</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Aktivitas Terkini</p>
                        </div>
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 rounded-lg">
                            <Activity className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {data.recent_transactions.map((tx, i) => (
                            <div key={tx.id} className="p-5 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all border-b border-slate-50 dark:border-slate-800 last:border-0 group">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${tx.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                    {tx.type === 'income' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black text-slate-800 dark:text-white truncate leading-tight mb-1">{tx.description}</p>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={tx.type === 'income' ? 'success' : 'danger'} className="text-[9px] px-1.5 py-0">
                                            {tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                                        </Badge>
                                        <p className="text-[10px] font-bold text-slate-400">{new Date(tx.transaction_date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}</p>
                                    </div>
                                </div>
                                <div className={`text-sm font-black tabular-nums ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {tx.type === 'income' ? '+' : '-'} {Number(tx.amount).toLocaleString()}
                                </div>
                            </div>
                        ))}
                        {data.recent_transactions.length === 0 && (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CreditCard className="w-8 h-8 text-slate-200" />
                                </div>
                                <p className="text-slate-400 font-bold text-sm">Tidak ada transaksi terkini.</p>
                                <p className="text-[10px] text-slate-300 uppercase mt-1 tracking-widest font-black">Semua akun tenang</p>
                            </div>
                        )}
                    </div>
                    <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                        <button className="w-full py-2.5 bg-slate-50 dark:bg-slate-800 text-[11px] font-black text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 uppercase tracking-[0.2em] transition-all rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                            Lihat Riwayat Lengkap
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* New Customers List */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Onboarding</h3>
                            <p className="text-xs text-slate-500 font-medium">Pelanggan terbaru yang bergabung minggu ini</p>
                        </div>
                        <button className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400">
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {data.recent_customers.map(cust => (
                            <div key={cust.id} className="flex items-center gap-4 p-4 bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-2xl group cursor-pointer hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all">
                                <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center text-slate-300 group-hover:text-indigo-500 transition-colors border border-slate-100 dark:border-slate-800">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-black text-slate-800 dark:text-white truncate">{cust.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <p className="text-[10px] font-bold text-slate-400 font-mono">{cust.customer_code}</p>
                                        <div className={`w-1.5 h-1.5 rounded-full ${cust.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500'}`}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {data.recent_customers.length === 0 && (
                            <div className="col-span-2 py-8 text-center text-slate-400 font-bold italic text-sm">Tidak ada pelanggan baru.</div>
                        )}
                    </div>
                </div>

                {/* Promo Card */}
                <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-700 rounded-2xl p-10 text-white flex flex-col justify-center relative overflow-hidden shadow-2xl shadow-indigo-600/30 group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl transition-transform group-hover:scale-150 duration-1000" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/10 rounded-full -ml-24 -mb-24 blur-2xl transition-transform group-hover:-translate-x-12 duration-1000" />
                    
                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 shadow-inner">
                            <Package className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-3xl font-black mb-4 tracking-tight leading-tight">Tingkatkan operasional <br/>ISP Anda hari ini.</h3>
                        <p className="text-indigo-100 mb-10 max-w-xs leading-relaxed font-medium">Siap untuk meningkatkan pendapatan? Buat voucher internet kecepatan tinggi secara massal dan kelola arus kas Anda dengan mudah.</p>
                        <div className="flex items-center gap-4">
                            <button className="px-8 py-4 bg-white text-indigo-700 font-black text-xs uppercase tracking-[0.15em] rounded-xl shadow-xl hover:bg-indigo-50 hover:shadow-indigo-900/40 transition-all active:scale-95">
                                Buat Voucher
                            </button>
                            <button className="p-4 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all">
                                <ArrowRight className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    </div>
                    <Package className="absolute -right-12 -bottom-12 w-64 h-64 text-white/5 rotate-12 pointer-events-none group-hover:rotate-45 transition-transform duration-1000" />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

