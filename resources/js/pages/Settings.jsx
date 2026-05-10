import React, { useEffect, useState } from 'react';
import { Save, Settings as SettingsIcon, Calendar, Bell, ShieldCheck } from 'lucide-react';
import apiFetch from '../utils/api';
import { toast } from 'react-toastify';

const Settings = () => {
    const [settings, setSettings] = useState({
        due_date_day: 10,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await apiFetch('/api/settings');
                if (res) {
                    setSettings(prev => ({
                        ...prev,
                        ...res
                    }));
                }
            } catch (error) {
                toast.error('Failed to load settings');
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await apiFetch('/api/settings', {
                method: 'POST',
                body: JSON.stringify({ settings })
            });
            toast.success('Settings updated successfully');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-slate-500 animate-pulse">Memuat pengaturan...</div>;

    return (
        <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
                    <SettingsIcon className="w-8 h-8 text-indigo-600" /> Pengaturan Sistem
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Konfigurasikan parameter global untuk sistem manajemen ISP Anda.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-indigo-600" />
                        <h3 className="font-black text-slate-800 dark:text-white tracking-tight">Penagihan & Jatuh Tempo</h3>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-2">Tanggal Jatuh Tempo Bulanan</label>
                                <div className="relative">
                                    <select 
                                        value={settings.due_date_day}
                                        onChange={(e) => setSettings({ ...settings, due_date_day: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border-0 ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-3.5 text-slate-800 dark:text-white font-bold transition-all outline-none appearance-none"
                                    >
                                        {[...Array(31)].map((_, i) => (
                                            <option key={i + 1} value={i + 1}>Tanggal {i + 1}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-12 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase pointer-events-none">setiap bulan</div>
                                </div>
                                <p className="text-[11px] text-slate-400 leading-relaxed pt-2">
                                    Pelanggan yang belum membayar pada hari ini akan dianggap <strong>menunggak</strong>. 
                                    Tanggal ini berlaku untuk semua invoice langganan bulanan.
                                </p>
                            </div>
                            
                            <div className="bg-indigo-50 dark:bg-indigo-500/5 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-500/10">
                                <h4 className="text-xs font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4" /> Referensi Sistem
                                </h4>
                                <p className="text-xs text-indigo-900/60 dark:text-indigo-300/60 leading-relaxed">
                                    Mengatur tanggal jatuh tempo membantu sistem mengotomatiskan laporan tunggakan dan isolasi pelanggan (jika dikonfigurasi). 
                                    Nilai umum adalah antara tanggal 5 sampai 10.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button 
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-600/20 active:scale-95 disabled:opacity-50"
                    >
                        {saving ? 'Menyimpan...' : (
                            <>
                                <Save className="w-4 h-4" /> Simpan Konfigurasi
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Settings;
