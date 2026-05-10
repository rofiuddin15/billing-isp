import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, MapPin } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { createCustomer, updateCustomer } from '../../store/slices/customerSlice';
import { fetchPackages } from '../../store/slices/packageSlice';
import apiFetch from '../../utils/api';
import MapPicker from '../../components/MapPicker';

const schema = z.object({
    customer_code: z.string().optional(),
    name: z.string().min(3),
    address: z.string().optional(),
    phone: z.string().optional(),
    pppoe_user: z.string().optional(),
    monthly_package_id: z.coerce.number().min(1),
    installation_fee: z.coerce.number().min(0).default(0),
    status: z.enum(['active', 'isolir', 'non-active']),
    latitude: z.coerce.number().optional().nullable(),
    longitude: z.coerce.number().optional().nullable(),
});

const CustomerForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { items: packages } = useSelector(state => state.packages);
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            status: 'active',
            latitude: null,
            longitude: null
        }
    });

    const lat = watch('latitude');
    const lng = watch('longitude');

    useEffect(() => {
        dispatch(fetchPackages());

        if (id) {
            const fetchData = async () => {
                setLoading(true);
                try {
                    const cust = await apiFetch(`/api/customers/${id}`);
                    Object.keys(schema.shape).forEach(key => {
                        setValue(key, cust[key]);
                    });
                } catch (error) {
                    console.error('Failed to fetch customer', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [id, setValue, dispatch]);

    const onSubmit = async (data) => {
        const resultAction = await dispatch(id ? updateCustomer({ id, data }) : createCustomer(data));
        if (createCustomer.fulfilled.match(resultAction) || updateCustomer.fulfilled.match(resultAction)) {
            navigate('/customers');
        }
    };

    const handleLocationChange = (newLat, newLng) => {
        setValue('latitude', newLat);
        setValue('longitude', newLng);
    };

    if (loading) return <div className="text-slate-800 dark:text-white p-8">Memuat...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <button 
                    onClick={() => navigate('/customers')}
                    className="flex items-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Kembali ke Daftar
                </button>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{id ? 'Edit Pelanggan' : 'Pelanggan Baru'}</h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Basic Info */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm overflow-hidden shadow-sm">
                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Kode Pelanggan</label>
                                <input 
                                    {...register('customer_code')}
                                    readOnly={!id}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border-0 ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-indigo-500 rounded-sm px-4 py-3 text-slate-800 dark:text-white placeholder:text-slate-400 transition-all outline-none disabled:opacity-50"
                                    placeholder={id ? "" : "Otomatis saat simpan"}
                                />
                                {errors.customer_code && <p className="text-xs text-red-500">{errors.customer_code.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Nama Lengkap</label>
                                <input 
                                    {...register('name')}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border-0 ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-indigo-500 rounded-sm px-4 py-3 text-slate-800 dark:text-white placeholder:text-slate-400 transition-all outline-none"
                                    placeholder="Nama Lengkap"
                                />
                                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Nomor Telepon</label>
                                <input 
                                    {...register('phone')}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border-0 ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-indigo-500 rounded-sm px-4 py-3 text-slate-800 dark:text-white placeholder:text-slate-400 transition-all outline-none"
                                    placeholder="+62..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Pengguna PPPoE</label>
                                <input 
                                    {...register('pppoe_user')}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border-0 ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-indigo-500 rounded-sm px-4 py-3 text-slate-800 dark:text-white placeholder:text-slate-400 transition-all outline-none"
                                    placeholder="user@mikrotik"
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Alamat</label>
                                <textarea 
                                    {...register('address')}
                                    rows={3}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border-0 ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-indigo-500 rounded-sm px-4 py-3 text-slate-800 dark:text-white placeholder:text-slate-400 transition-all outline-none"
                                    placeholder="Detail alamat lengkap..."
                                />
                            </div>
                        </div>
                    </div>
                    <div className="px-8 py-6 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                        <button 
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-sm text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {isSubmitting ? 'Menyimpan...' : (id ? 'Perbarui Pelanggan' : 'Tambah Pelanggan')}
                        </button>
                    </div>
                </div>

                {/* Technical & Map */}
                <div className="space-y-8">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-8 space-y-6 shadow-sm">
                        <div className="space-y-4">
                            {!id && (
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Biaya Pemasangan</label>
                                    <input 
                                        type="number"
                                        {...register('installation_fee')}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border-0 ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-indigo-500 rounded-sm px-4 py-3 text-slate-800 dark:text-white placeholder:text-slate-400 transition-all outline-none"
                                        placeholder="Contoh: 500000"
                                    />
                                    {errors.installation_fee && <p className="text-xs text-red-500">{errors.installation_fee.message}</p>}
                                </div>
                            )}
                            <div>
                                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Paket Bulanan</label>
                                <select 
                                    {...register('monthly_package_id')}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border-0 ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-indigo-500 rounded-sm px-4 py-3 text-slate-800 dark:text-white transition-all outline-none"
                                >
                                    <option value="">Pilih Paket</option>
                                    {packages.map(pkg => (
                                        <option key={pkg.id} value={pkg.id}>{pkg.name} - Rp {Number(pkg.price).toLocaleString()}</option>
                                    ))}
                                </select>
                                {errors.monthly_package_id && <p className="text-xs text-red-500">{errors.monthly_package_id.message}</p>}
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Status</label>
                                <select 
                                    {...register('status')}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border-0 ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-indigo-500 rounded-sm px-4 py-3 text-slate-800 dark:text-white transition-all outline-none"
                                >
                                    <option value="active">Aktif</option>
                                    <option value="isolir">Isolir</option>
                                    <option value="non-active">Non-Aktif</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                            <MapPicker lat={lat} lng={lng} onChange={handleLocationChange} />
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CustomerForm;
