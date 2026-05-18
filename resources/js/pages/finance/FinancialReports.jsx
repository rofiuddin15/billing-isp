import React, { useState, useEffect, useMemo } from 'react';
import apiFetch from '../../utils/api';
import { 
    FileText, 
    Filter, 
    TrendingUp, 
    TrendingDown, 
    DollarSign, 
    CheckCircle, 
    AlertCircle,
    Download,
    Calendar,
    Briefcase,
    Shield
} from 'lucide-react';
import Badge from '../../components/Badge';

const FinancialReports = () => {
    const [activeTab, setActiveTab] = useState('profit_loss'); // profit_loss, trial_balance, or balance_sheet
    const [loading, setLoading] = useState(true);
    
    // Period Filter State
    const [filterType, setFilterType] = useState('this_month');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Data States
    const [profitLossData, setProfitLossData] = useState({
        revenues: [],
        expenses: [],
        total_revenue: 0,
        total_expense: 0,
        net_income: 0
    });
    
    const [trialBalanceData, setTrialBalanceData] = useState({
        accounts: [],
        total_debit: 0,
        total_credit: 0,
        is_balanced: true
    });

    const [balanceSheetData, setBalanceSheetData] = useState({
        assets: [],
        total_assets: 0,
        liabilities: [],
        total_liabilities: 0,
        equity: [],
        total_equity: 0,
        total_liabilities_and_equity: 0,
        is_balanced: true
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

    const fetchData = async () => {
        if (filterType === 'custom' && (!startDate || !endDate)) {
            return;
        }
        setLoading(true);
        try {
            const query = `start_date=${activeRange.start}&end_date=${activeRange.end}`;
            if (activeTab === 'profit_loss') {
                const res = await apiFetch(`/api/reports/profit-loss?${query}`);
                setProfitLossData(res);
            } else if (activeTab === 'trial_balance') {
                const res = await apiFetch(`/api/reports/trial-balance?${query}`);
                setTrialBalanceData(res);
            } else if (activeTab === 'balance_sheet') {
                const res = await apiFetch(`/api/reports/balance-sheet?${query}`);
                setBalanceSheetData(res);
            }
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [activeTab, filterType, startDate, endDate, activeRange.start, activeRange.end]);

    // Handle Printing / Exporting to PDF
    const handlePrint = () => {
        window.print();
    };

    const tabLabel = {
        profit_loss: 'Laporan Laba Rugi',
        trial_balance: 'Laporan Neraca Saldo',
        balance_sheet: 'Laporan Neraca (Balance Sheet)'
    }[activeTab];

    return (
        <div className="space-y-6 animate-in fade-in duration-500 print:p-0">
            {/* Header Block */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white leading-tight">Laporan Keuangan</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Analisis kinerja laba rugi, neraca saldo, dan posisi keuangan instansi Anda.</p>
                </div>
                
                <button
                    onClick={handlePrint}
                    className="flex items-center justify-center px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-indigo-600 rounded-sm text-sm font-bold transition-all shadow-sm"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Cetak / Simpan PDF
                </button>
            </div>

            {/* Print Only Header */}
            <div className="hidden print:block border-b pb-4 mb-6">
                <h1 className="text-3xl font-extrabold text-slate-950 uppercase tracking-wide">MinISP Billing & Accounting</h1>
                <p className="text-xs text-slate-500">LAPORAN KEUANGAN PERIODE: {activeRange.start || 'SEMUA WAKTU'} s/d {activeRange.end || 'SEMUA WAKTU'}</p>
                <p className="text-sm font-bold text-indigo-600 mt-2">
                    Jenis Laporan: {tabLabel}
                </p>
            </div>

            {/* Filter Bar */}
            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-sm border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 transition-all print:hidden">
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

            {/* Tab Navigation */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 print:hidden">
                <button
                    onClick={() => setActiveTab('profit_loss')}
                    className={`pb-3 px-6 text-sm font-bold border-b-2 transition-all ${
                        activeTab === 'profit_loss'
                            ? 'border-indigo-600 text-indigo-600 dark:text-white'
                            : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
                    }`}
                >
                    Laba Rugi (Profit & Loss)
                </button>
                <button
                    onClick={() => setActiveTab('trial_balance')}
                    className={`pb-3 px-6 text-sm font-bold border-b-2 transition-all ${
                        activeTab === 'trial_balance'
                            ? 'border-indigo-600 text-indigo-600 dark:text-white'
                            : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
                    }`}
                >
                    Neraca Saldo (Trial Balance)
                </button>
                <button
                    onClick={() => setActiveTab('balance_sheet')}
                    className={`pb-3 px-6 text-sm font-bold border-b-2 transition-all ${
                        activeTab === 'balance_sheet'
                            ? 'border-indigo-600 text-indigo-600 dark:text-white'
                            : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
                    }`}
                >
                    Neraca (Balance Sheet)
                </button>
            </div>

            {/* Content Switcher */}
            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent" />
                </div>
            ) : activeTab === 'profit_loss' ? (
                <div className="space-y-6 animate-in fade-in duration-300">
                    {/* STATS CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-5 shadow-sm relative overflow-hidden flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Total Pendapatan</span>
                                <span className="text-xl font-bold text-slate-800 dark:text-white">
                                    Rp {Number(profitLossData.total_revenue).toLocaleString()}
                                </span>
                            </div>
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg text-emerald-600">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-5 shadow-sm relative overflow-hidden flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Total Pengeluaran</span>
                                <span className="text-xl font-bold text-slate-800 dark:text-white">
                                    Rp {Number(profitLossData.total_expense).toLocaleString()}
                                </span>
                            </div>
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg text-indigo-600">
                                <TrendingDown className="w-6 h-6" />
                            </div>
                        </div>

                        <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-5 shadow-sm relative overflow-hidden flex items-center justify-between ${
                            profitLossData.net_income >= 0 ? 'ring-1 ring-emerald-500/20' : 'ring-1 ring-red-500/20'
                        }`}>
                            <div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Laba Bersih</span>
                                <span className={`text-xl font-bold ${
                                    profitLossData.net_income >= 0 ? 'text-emerald-600' : 'text-red-500'
                                }`}>
                                    Rp {Number(profitLossData.net_income).toLocaleString()}
                                </span>
                            </div>
                            <div className={`p-3 rounded-lg ${
                                profitLossData.net_income >= 0 
                                    ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600' 
                                    : 'bg-red-50 dark:bg-red-950/30 text-red-500'
                            }`}>
                                <DollarSign className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    {/* TABLES */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-sm overflow-hidden p-6 space-y-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white border-b pb-2 mb-4 uppercase tracking-wide">
                                1. PENDAPATAN (REVENUE)
                            </h3>
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">
                                        <th className="py-2.5">KODE AKUN</th>
                                        <th className="py-2.5">NAMA AKUN REVENUE</th>
                                        <th className="py-2.5 text-right">JUMLAH SALDO</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                                    {profitLossData.revenues.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="py-6 text-center text-slate-400 italic">
                                                Tidak ada transaksi pendapatan pada periode ini.
                                            </td>
                                        </tr>
                                    ) : (
                                        profitLossData.revenues.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/10">
                                                <td className="py-3 font-mono text-xs text-slate-500">{item.code}</td>
                                                <td className="py-3 text-slate-700 dark:text-slate-300 font-medium">{item.name}</td>
                                                <td className="py-3 text-right font-bold text-emerald-600">Rp {Number(item.balance).toLocaleString()}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                            {profitLossData.revenues.length > 0 && (
                                <div className="flex justify-between items-center mt-4 pt-3 border-t border-dashed border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-800 dark:text-white">
                                    <span>TOTAL PENDAPATAN</span>
                                    <span className="text-emerald-600">Rp {Number(profitLossData.total_revenue).toLocaleString()}</span>
                                </div>
                            )}
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white border-b pb-2 mb-4 uppercase tracking-wide">
                                2. BIAYA / PENGELUARAN (EXPENSES)
                            </h3>
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">
                                        <th className="py-2.5">KODE AKUN</th>
                                        <th className="py-2.5">NAMA AKUN BIAYA</th>
                                        <th className="py-2.5 text-right">JUMLAH SALDO</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                                    {profitLossData.expenses.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="py-6 text-center text-slate-400 italic">
                                                Tidak ada transaksi pengeluaran pada periode ini.
                                            </td>
                                        </tr>
                                    ) : (
                                        profitLossData.expenses.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/10">
                                                <td className="py-3 font-mono text-xs text-slate-500">{item.code}</td>
                                                <td className="py-3 text-slate-700 dark:text-slate-300 font-medium">{item.name}</td>
                                                <td className="py-3 text-right font-bold text-indigo-600">Rp {Number(item.balance).toLocaleString()}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                            {profitLossData.expenses.length > 0 && (
                                <div className="flex justify-between items-center mt-4 pt-3 border-t border-dashed border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-800 dark:text-white">
                                    <span>TOTAL PENGELUARAN</span>
                                    <span className="text-indigo-600">Rp {Number(profitLossData.total_expense).toLocaleString()}</span>
                                </div>
                            )}
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-950/30 p-5 rounded-lg flex flex-col sm:flex-row items-center justify-between border border-slate-100 dark:border-slate-800">
                            <div>
                                <h4 className="text-sm font-black text-slate-400 uppercase tracking-wider">LABA / RUGI BERSIH OPERASIONAL</h4>
                                <p className="text-xs text-slate-500 mt-1">Selisih total pendapatan kotor dengan biaya pengeluaran pada periode terpilih.</p>
                            </div>
                            <div className="mt-3 sm:mt-0">
                                <span className={`text-2xl font-black ${
                                    profitLossData.net_income >= 0 ? 'text-emerald-600' : 'text-red-500'
                                }`}>
                                    Rp {Number(profitLossData.net_income).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : activeTab === 'trial_balance' ? (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg ${
                                trialBalanceData.is_balanced 
                                    ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600' 
                                    : 'bg-amber-50 dark:bg-amber-950/30 text-amber-500'
                            }`}>
                                {trialBalanceData.is_balanced ? (
                                    <CheckCircle className="w-8 h-8" />
                                ) : (
                                    <AlertCircle className="w-8 h-8" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 dark:text-white">Audit Double-Entry Buku Besar</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-xs">
                                    {trialBalanceData.is_balanced 
                                        ? 'Semua entri seimbang sempurna (Debit = Kredit). Audit trail bersih!' 
                                        : 'Perhatian! Terdapat selisih antara total debit dan kredit pada Buku Besar.'}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Total Debit</span>
                                <span className="text-md font-bold text-slate-800 dark:text-white">Rp {Number(trialBalanceData.total_debit).toLocaleString()}</span>
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Total Kredit</span>
                                <span className="text-md font-bold text-slate-800 dark:text-white">Rp {Number(trialBalanceData.total_credit).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-sm overflow-hidden p-6">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white border-b pb-2 mb-4 uppercase tracking-wide">
                            NERACA SALDO (TRIAL BALANCE)
                        </h3>
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2.5">
                                    <th className="py-2.5">KODE</th>
                                    <th className="py-2.5">NAMA AKUN</th>
                                    <th className="py-2.5">TIPE AKUN</th>
                                    <th className="py-2.5 text-right">DEBIT</th>
                                    <th className="py-2.5 text-right">KREDIT</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                                {trialBalanceData.accounts.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/10">
                                        <td className="py-3 font-mono text-xs text-slate-500">{item.code}</td>
                                        <td className="py-3 text-slate-700 dark:text-slate-300 font-medium">{item.name}</td>
                                        <td className="py-3">
                                            <Badge variant={
                                                item.type === 'asset' ? 'primary' :
                                                item.type === 'liability' ? 'warning' :
                                                item.type === 'revenue' ? 'success' : 'secondary'
                                            }>
                                                {item.type.toUpperCase()}
                                            </Badge>
                                        </td>
                                        <td className="py-3 text-right font-mono text-slate-700 dark:text-slate-300">
                                            {item.debit > 0 ? `Rp ${Number(item.debit).toLocaleString()}` : '-'}
                                        </td>
                                        <td className="py-3 text-right font-mono text-slate-700 dark:text-slate-300">
                                            {item.credit > 0 ? `Rp ${Number(item.credit).toLocaleString()}` : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="flex justify-between items-center mt-6 pt-3 border-t-2 border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-800 dark:text-white">
                            <span>TOTAL NERACA SALDO</span>
                            <div className="flex gap-10">
                                <span className="text-indigo-600">D: Rp {Number(trialBalanceData.total_debit).toLocaleString()}</span>
                                <span className="text-emerald-600">K: Rp {Number(trialBalanceData.total_credit).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6 animate-in fade-in duration-300">
                    {/* AUDIT STATUS CARD FOR BALANCE SHEET */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg ${
                                balanceSheetData.is_balanced 
                                    ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600' 
                                    : 'bg-amber-50 dark:bg-amber-950/30 text-amber-500'
                            }`}>
                                {balanceSheetData.is_balanced ? (
                                    <CheckCircle className="w-8 h-8" />
                                ) : (
                                    <AlertCircle className="w-8 h-8" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 dark:text-white">Persamaan Neraca Keuangan</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-xs">
                                    {balanceSheetData.is_balanced 
                                        ? 'Neraca seimbang sempurna! Aset = Liabilitas + Ekuitas.' 
                                        : 'Perhatian! Terdapat selisih antara nilai Aset dengan Pasiva (Liabilitas & Ekuitas).'}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Total Aktiva (Aset)</span>
                                <span className="text-md font-bold text-emerald-600">Rp {Number(balanceSheetData.total_assets).toLocaleString()}</span>
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Total Pasiva</span>
                                <span className="text-md font-bold text-slate-800 dark:text-white">Rp {Number(balanceSheetData.total_liabilities_and_equity).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* SIDE-BY-SIDE BALANCE SHEET LAYOUT */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:grid-cols-2">
                        {/* AKTIVA - ASSETS */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-sm p-6 flex flex-col justify-between">
                            <div>
                                <h3 className="text-md font-black text-slate-800 dark:text-white border-b pb-3 mb-4 uppercase tracking-widest flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-indigo-500" />
                                    AKTIVA (ASSETS)
                                </h3>
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">
                                            <th className="py-2">KODE</th>
                                            <th className="py-2">AKUN ASET</th>
                                            <th className="py-2 text-right">SALDO</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                                        {balanceSheetData.assets.length === 0 ? (
                                            <tr>
                                                <td colSpan={3} className="py-4 text-center text-slate-400 italic">
                                                    Tidak ada saldo aset aktif.
                                                </td>
                                            </tr>
                                        ) : (
                                            balanceSheetData.assets.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/10">
                                                    <td className="py-2.5 font-mono text-xs text-slate-500">{item.code}</td>
                                                    <td className="py-2.5 text-slate-700 dark:text-slate-300 font-medium">{item.name}</td>
                                                    <td className="py-2.5 text-right font-bold text-slate-800 dark:text-slate-100">
                                                        Rp {Number(item.balance).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex justify-between items-center mt-6 pt-3 border-t-2 border-slate-200 dark:border-slate-800 text-sm font-black text-indigo-600">
                                <span>TOTAL AKTIVA</span>
                                <span>Rp {Number(balanceSheetData.total_assets).toLocaleString()}</span>
                            </div>
                        </div>

                        {/* PASIVA - LIABILITIES & EQUITY */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-sm p-6 flex flex-col justify-between">
                            <div className="space-y-6">
                                {/* LIABILITIES */}
                                <div>
                                    <h3 className="text-md font-black text-slate-800 dark:text-white border-b pb-3 mb-4 uppercase tracking-widest flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-amber-500" />
                                        LIABILITAS (KEWAJIBAN)
                                    </h3>
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">
                                                <th className="py-2">KODE</th>
                                                <th className="py-2">AKUN LIABILITAS</th>
                                                <th className="py-2 text-right">SALDO</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                                            {balanceSheetData.liabilities.length === 0 ? (
                                                <tr>
                                                    <td colSpan={3} className="py-4 text-center text-slate-400 italic">
                                                        Tidak ada saldo liabilitas/utang.
                                                    </td>
                                                </tr>
                                            ) : (
                                                balanceSheetData.liabilities.map((item, idx) => (
                                                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/10">
                                                        <td className="py-2.5 font-mono text-xs text-slate-500">{item.code}</td>
                                                        <td className="py-2.5 text-slate-700 dark:text-slate-300 font-medium">{item.name}</td>
                                                        <td className="py-2.5 text-right font-bold text-slate-800 dark:text-slate-100">
                                                            Rp {Number(item.balance).toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* EQUITY */}
                                <div>
                                    <h3 className="text-md font-black text-slate-800 dark:text-white border-b pb-3 mb-4 uppercase tracking-widest flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-emerald-500" />
                                        EKUITAS (MODAL)
                                    </h3>
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">
                                                <th className="py-2">KODE</th>
                                                <th className="py-2">AKUN EKUITAS</th>
                                                <th className="py-2 text-right">SALDO</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                                            {balanceSheetData.equity.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/10">
                                                    <td className="py-2.5 font-mono text-xs text-slate-500">{item.code}</td>
                                                    <td className="py-2.5 text-slate-700 dark:text-slate-300 font-medium">{item.name}</td>
                                                    <td className="py-2.5 text-right font-bold text-slate-800 dark:text-slate-100">
                                                        Rp {Number(item.balance).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mt-6 pt-3 border-t-2 border-slate-200 dark:border-slate-800 text-sm font-black text-slate-800 dark:text-white">
                                <span>TOTAL PASIVA</span>
                                <span>Rp {Number(balanceSheetData.total_liabilities_and_equity).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinancialReports;
