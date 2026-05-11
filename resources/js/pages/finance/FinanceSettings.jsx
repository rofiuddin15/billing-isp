import React, { useState, useEffect } from 'react';
import { Save, Wallet, Percent, HardDrive, Tag } from 'lucide-react';
import apiFetch from '../../utils/api';
import { toast } from 'react-toastify';

const FinanceSettings = () => {
    const [settings, setSettings] = useState({
        installation_fee: 0,
        tax_rate: 0,
        admin_fee: 0,
        discount: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const data = await apiFetch('/api/auth/finance-settings');
            setSettings(data);
        } catch (error) {
            toast.error('Gagal mengambil pengaturan keuangan');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await apiFetch('/api/auth/finance-settings', {
                method: 'POST',
                body: JSON.stringify(settings)
            });
            toast.success('Pengaturan keuangan berhasil diperbarui');
        } catch (error) {
            toast.error(error.message || 'Gagal menyimpan pengaturan');
        } finally {
            setIsSaving(false);
        }
    };

    const formatNumber = (num) => {
        return new Intl.NumberFormat('id-ID').format(num);
    };

    const parseNumber = (val) => {
        return val.replace(/\./g, '');
    };

    const handleInputChange = (key, value) => {
        // Remove leading zeros and non-numeric chars except for tax rate which can be decimal
        let cleanValue = value.replace(/\D/g, '');
        if (cleanValue === '') cleanValue = '0';
        
        // Remove leading zero if there's other digits
        if (cleanValue.length > 1 && cleanValue.startsWith('0')) {
            cleanValue = cleanValue.replace(/^0+/, '');
        }

        setSettings({ ...settings, [key]: cleanValue });
    };

    if (isLoading) {
        return <div className="p-8 text-center">Memuat pengaturan...</div>;
    }

    return (
        <div className="p-4 sm:p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Pengaturan Biaya Pendaftaran</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Konfigurasi biaya default untuk pendaftaran pelanggan baru.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Installation Fee */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
                                <HardDrive className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Biaya Pemasangan</label>
                                <p className="text-[10px] text-slate-500">Biaya pasang baru (PSB).</p>
                            </div>
                        </div>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">Rp</span>
                            <input
                                type="text"
                                value={formatNumber(settings.installation_fee)}
                                onChange={(e) => handleInputChange('installation_fee', parseNumber(e.target.value))}
                                className="w-full pl-12 pr-4 py-4 rounded bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-blue-500/20 font-black text-slate-900 dark:text-white transition-all outline-none"
                            />
                        </div>
                    </div>

                    {/* Admin Fee */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded">
                                <Wallet className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Biaya Admin</label>
                                <p className="text-[10px] text-slate-500">Biaya administrasi pendaftaran.</p>
                            </div>
                        </div>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">Rp</span>
                            <input
                                type="text"
                                value={formatNumber(settings.admin_fee)}
                                onChange={(e) => handleInputChange('admin_fee', parseNumber(e.target.value))}
                                className="w-full pl-12 pr-4 py-4 rounded bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500/20 font-black text-slate-900 dark:text-white transition-all outline-none"
                            />
                        </div>
                    </div>

                    {/* Tax Rate */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded">
                                <Percent className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Pajak (PPN)</label>
                                <p className="text-[10px] text-slate-500">Persentase pajak dalam %.</p>
                            </div>
                        </div>
                        <div className="relative">
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">%</span>
                            <input
                                type="text"
                                value={settings.tax_rate}
                                onChange={(e) => {
                                    let val = e.target.value.replace(/[^0-9.]/g, '');
                                    if (val.startsWith('0') && val.length > 1 && val[1] !== '.') val = val.substring(1);
                                    setSettings({ ...settings, tax_rate: val });
                                }}
                                className="w-full px-4 py-4 rounded bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-amber-500/20 font-black text-slate-900 dark:text-white transition-all outline-none"
                            />
                        </div>
                    </div>

                    {/* Discount */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-rose-100 dark:bg-rose-900/30 p-2 rounded">
                                <Tag className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Diskon Default</label>
                                <p className="text-[10px] text-slate-500">Potongan harga pendaftaran.</p>
                            </div>
                        </div>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">Rp</span>
                            <input
                                type="text"
                                value={formatNumber(settings.discount)}
                                onChange={(e) => handleInputChange('discount', parseNumber(e.target.value))}
                                className="w-full pl-12 pr-4 py-4 rounded bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-rose-500/20 font-black text-slate-900 dark:text-white transition-all outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="bg-indigo-600 text-white px-8 py-4 rounded font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSaving ? 'Menyimpan...' : (
                            <>
                                <Save size={16} /> Simpan Pengaturan
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FinanceSettings;
