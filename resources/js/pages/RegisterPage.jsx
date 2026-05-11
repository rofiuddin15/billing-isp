import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { 
    Package, Eye, ArrowLeft, MapPin, Phone, Mail, User, 
    ShieldCheck, CheckCircle2, Download, ReceiptText, Map as MapIcon,
    ArrowRight, ChevronLeft, ChevronRight, Search
} from 'lucide-react';
import apiFetch from '../utils/api';
import { toast } from 'react-toastify';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const schema = z.object({
    name: z.string().min(3, 'Nama minimal 3 karakter'),
    email: z.string().email('Email tidak valid'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
    password_confirmation: z.string(),
    phone: z.string().min(10, 'Nomor HP minimal 10 digit'),
    address: z.string().min(5, 'Alamat minimal 5 karakter'),
    latitude: z.string().min(1, 'Pilih lokasi di peta'),
    longitude: z.string().min(1, 'Pilih lokasi di peta'),
    monthly_package_id: z.string().min(1, 'Pilih paket layanan'),
}).refine((data) => data.password === data.password_confirmation, {
    message: "Password tidak cocok",
    path: ["password_confirmation"],
});

const RegisterPage = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = React.useState(1);
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmModal, setShowConfirmModal] = React.useState(false);
    const [packages, setPackages] = React.useState([]);
    const [registeredData, setRegisteredData] = React.useState(null);
    const [isLoadingPackages, setIsLoadingPackages] = React.useState(true);
    
    const mapContainer = useRef(null);
    const map = useRef(null);
    const marker = useRef(null);

    const { register, handleSubmit, setValue, watch, trigger, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            latitude: '',
            longitude: ''
        }
    });

    const formData = watch();

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const data = await apiFetch('/api/packages/public');
                setPackages(data);
            } catch (error) {
                console.error('Error fetching packages:', error);
                toast.error('Gagal mengambil data paket');
            } finally {
                setIsLoadingPackages(false);
            }
        };
        fetchPackages();
    }, []);

    // Initialize map when reaching step 2
    useEffect(() => {
        if (currentStep === 2 && mapContainer.current && !map.current) {
            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/streets-v12',
                center: [113.4208, -7.0330], // Palengaan Daja, Pamekasan
                zoom: 14
            });

            map.current.addControl(new mapboxgl.NavigationControl());

            map.current.on('click', (e) => {
                const { lng, lat } = e.lngLat;
                updateMarker(lng, lat);
            });
        }
    }, [currentStep]);

    const updateMarker = (lng, lat) => {
        if (marker.current) {
            marker.current.setLngLat([lng, lat]);
        } else {
            marker.current = new mapboxgl.Marker({ color: '#4f46e5' })
                .setLngLat([lng, lat])
                .addTo(map.current);
        }
        setValue('latitude', lat.toString());
        setValue('longitude', lng.toString());
    };

    const nextStep = async () => {
        const fieldsToValidate = currentStep === 1 
            ? ['name', 'email', 'phone', 'password', 'password_confirmation']
            : ['address', 'monthly_package_id', 'latitude', 'longitude'];
        
        const isValid = await trigger(fieldsToValidate);
        if (isValid) {
            if (currentStep === 2) {
                setShowConfirmModal(true);
            } else {
                setCurrentStep(currentStep + 1);
            }
        }
    };

    const prevStep = () => setCurrentStep(currentStep - 1);

    const onConfirmSubmit = async () => {
        setShowConfirmModal(false);
        const data = watch();
        try {
            const response = await apiFetch('/api/auth/register', {
                method: 'POST',
                body: JSON.stringify(data),
            });
            toast.success('Pendaftaran berhasil!');
            setRegisteredData(response);
        } catch (error) {
            toast.error(error.message || 'Pendaftaran gagal');
        }
    };

    if (registeredData) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                    <div className="bg-white dark:bg-slate-900 rounded shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                        <div className="bg-indigo-600 p-8 text-white text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <ReceiptText size={120} />
                            </div>
                            <div className="relative z-10">
                                <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                                    <CheckCircle2 className="w-10 h-10" />
                                </div>
                                <h2 className="text-2xl font-black uppercase tracking-tight">Pendaftaran Berhasil</h2>
                                <p className="text-indigo-100 text-sm mt-1">Selamat datang di MinISP System</p>
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="space-y-6">
                                <div className="text-center mb-6">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Kode Pelanggan</p>
                                    <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                                        {registeredData.customer.customer_code}
                                    </p>
                                </div>

                                <div className="border-t border-dashed border-slate-200 dark:border-slate-800 pt-6 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nama</span>
                                        <span className="text-xs font-black text-slate-900 dark:text-white">{registeredData.customer.name}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Paket</span>
                                        <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">{registeredData.package.name}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-400">
                                        <span className="text-[10px] font-medium uppercase">Biaya Paket</span>
                                        <span className="text-[10px] font-bold">Rp {new Intl.NumberFormat('id-ID').format(registeredData.billing.package_price)}</span>
                                    </div>
                                    {registeredData.billing.installation_fee > 0 && (
                                        <div className="flex justify-between items-center text-slate-400">
                                            <span className="text-[10px] font-medium uppercase">Pasang Baru</span>
                                            <span className="text-[10px] font-bold">Rp {new Intl.NumberFormat('id-ID').format(registeredData.billing.installation_fee)}</span>
                                        </div>
                                    )}
                                    {registeredData.billing.admin_fee > 0 && (
                                        <div className="flex justify-between items-center text-slate-400">
                                            <span className="text-[10px] font-medium uppercase">Biaya Admin</span>
                                            <span className="text-[10px] font-bold">Rp {new Intl.NumberFormat('id-ID').format(registeredData.billing.admin_fee)}</span>
                                        </div>
                                    )}
                                    {registeredData.billing.tax_amount > 0 && (
                                        <div className="flex justify-between items-center text-slate-400">
                                            <span className="text-[10px] font-medium uppercase">PPN ({registeredData.billing.tax_rate}%)</span>
                                            <span className="text-[10px] font-bold">Rp {new Intl.NumberFormat('id-ID').format(registeredData.billing.tax_amount)}</span>
                                        </div>
                                    )}
                                    {registeredData.billing.discount > 0 && (
                                        <div className="flex justify-between items-center text-rose-500">
                                            <span className="text-[10px] font-medium uppercase">Diskon</span>
                                            <span className="text-[10px] font-bold">-Rp {new Intl.NumberFormat('id-ID').format(registeredData.billing.discount)}</span>
                                        </div>
                                    )}
                                    <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between items-center">
                                        <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Total Bayar</span>
                                        <span className="text-lg font-black text-indigo-600">
                                            Rp {new Intl.NumberFormat('id-ID').format(registeredData.billing.total)}
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded p-4 border border-slate-100 dark:border-slate-800 mt-6">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed text-center">
                                        Silakan gunakan email atau nomor HP untuk masuk ke sistem. Hubungi teknisi kami untuk aktivasi perangkat.
                                    </p>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button 
                                        onClick={() => window.print()}
                                        className="flex-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 py-4 rounded font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
                                    >
                                        <Download size={16} /> Cetak Struk
                                    </button>
                                    <Link 
                                        to="/login"
                                        className="flex-1 bg-indigo-600 text-white py-4 rounded font-black text-xs uppercase tracking-widest flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20"
                                    >
                                        Masuk Sekarang
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
            {/* Modal Konfirmasi */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 rounded shadow-2xl max-w-sm w-full p-8 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300">
                        <div className="text-center">
                            <div className="bg-indigo-100 dark:bg-indigo-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ShieldCheck className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Konfirmasi Data</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                                Apakah data yang Anda masukkan sudah benar? Pastikan titik lokasi di peta sudah sesuai dengan alamat pemasangan.
                            </p>
                        </div>

                        <div className="mt-8 space-y-3">
                            <button
                                onClick={onConfirmSubmit}
                                className="w-full bg-indigo-600 text-white py-4 rounded font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
                            >
                                Ya, Sudah Benar
                            </button>
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="w-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 py-4 rounded font-black text-xs uppercase tracking-widest border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-all"
                            >
                                Periksa Kembali
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Left Side: Form */}
            <div className="flex flex-1 flex-col justify-center px-8 py-12 sm:px-12 lg:px-20 xl:px-32 bg-white dark:bg-slate-950">
                <div className="mx-auto w-full max-w-md">
                    <div className="mb-8 flex items-center justify-between">
                        <Link to="/login" className="flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Batal
                        </Link>
                        <div className="flex gap-2">
                            <div className={`h-1.5 w-8 rounded-full transition-all ${currentStep >= 1 ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-800'}`}></div>
                            <div className={`h-1.5 w-8 rounded-full transition-all ${currentStep >= 2 ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-800'}`}></div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                            {currentStep === 1 ? 'Data Diri' : 'Lokasi & Paket'}
                        </h2>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
                            {currentStep === 1 ? 'Lengkapi informasi kontak Anda.' : 'Pilih paket layanan dan titik lokasi Anda.'}
                        </p>
                    </div>

                    <div className="mt-8">
                        <form onSubmit={handleSubmit((d) => setShowConfirmModal(true))} className="space-y-4">
                            {currentStep === 1 && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Nama Lengkap</label>
                                            <input
                                                {...register('name')}
                                                type="text"
                                                placeholder="Contoh: Budi Santoso"
                                                className="block w-full rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-4 py-3.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 sm:text-xs transition-all outline-none"
                                            />
                                            {errors.name && <p className="mt-1 text-[10px] font-bold text-rose-500 ml-1">{errors.name.message}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Nomor HP</label>
                                            <input
                                                {...register('phone')}
                                                type="text"
                                                placeholder="08123456789"
                                                className="block w-full rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-4 py-3.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 sm:text-xs transition-all outline-none"
                                            />
                                            {errors.phone && <p className="mt-1 text-[10px] font-bold text-rose-500 ml-1">{errors.phone.message}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Alamat Email</label>
                                        <input
                                            {...register('email')}
                                            type="email"
                                            placeholder="email@example.com"
                                            className="block w-full rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-4 py-3.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 sm:text-xs transition-all outline-none"
                                        />
                                        {errors.email && <p className="mt-1 text-[10px] font-bold text-rose-500 ml-1">{errors.email.message}</p>}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="relative">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Password</label>
                                            <input
                                                {...register('password')}
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                className="block w-full rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-4 py-3.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 sm:text-xs transition-all outline-none"
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-[38px] text-slate-400 hover:text-indigo-600 transition-colors"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            {errors.password && <p className="mt-1 text-[10px] font-bold text-rose-500 ml-1">{errors.password.message}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Konfirmasi</label>
                                            <input
                                                {...register('password_confirmation')}
                                                type="password"
                                                placeholder="••••••••"
                                                className="block w-full rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-4 py-3.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 sm:text-xs transition-all outline-none"
                                            />
                                            {errors.password_confirmation && <p className="mt-1 text-[10px] font-bold text-rose-500 ml-1">{errors.password_confirmation.message}</p>}
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            type="button"
                                            onClick={nextStep}
                                            className="flex w-full items-center justify-center gap-2 rounded bg-indigo-600 px-4 py-4 text-xs font-black text-white uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-[0.98]"
                                        >
                                            Lanjutkan <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Alamat Pemasangan</label>
                                        <textarea
                                            {...register('address')}
                                            placeholder="Tulis alamat lengkap pemasangan..."
                                            rows={2}
                                            className="block w-full rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-4 py-3.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 sm:text-xs transition-all outline-none resize-none"
                                        />
                                        {errors.address && <p className="mt-1 text-[10px] font-bold text-rose-500 ml-1">{errors.address.message}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Pilih Paket Layanan</label>
                                        <select
                                            {...register('monthly_package_id')}
                                            className="block w-full rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-4 py-3.5 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 sm:text-xs transition-all outline-none appearance-none"
                                            disabled={isLoadingPackages}
                                        >
                                            <option value="">-- Pilih Paket Internet --</option>
                                            {packages.map((pkg) => (
                                                <option key={pkg.id} value={pkg.id}>
                                                    {pkg.name} - Rp {new Intl.NumberFormat('id-ID').format(pkg.price)}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.monthly_package_id && <p className="mt-1 text-[10px] font-bold text-rose-500 ml-1">{errors.monthly_package_id.message}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Titik Lokasi (Klik di Peta)</label>
                                        <div className="relative">
                                            <div ref={mapContainer} className="h-48 w-full rounded border border-slate-200 dark:border-slate-800 overflow-hidden shadow-inner" />
                                            <div className="absolute top-2 right-2 flex flex-col gap-1">
                                                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur px-2 py-1 rounded text-[8px] font-black border border-slate-200 dark:border-slate-700 shadow-sm">
                                                    LAT: {watch('latitude') || '-'}
                                                </div>
                                                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur px-2 py-1 rounded text-[8px] font-black border border-slate-200 dark:border-slate-700 shadow-sm">
                                                    LNG: {watch('longitude') || '-'}
                                                </div>
                                            </div>
                                        </div>
                                        {(errors.latitude || errors.longitude) && <p className="mt-1 text-[10px] font-bold text-rose-500 ml-1">Silakan klik lokasi Anda di peta</p>}
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <button
                                            type="button"
                                            onClick={prevStep}
                                            className="flex items-center justify-center gap-2 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4 text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-all"
                                        >
                                            <ChevronLeft size={16} /> Kembali
                                        </button>
                                        <button
                                            type="button"
                                            onClick={nextStep}
                                            disabled={isSubmitting}
                                            className="flex-1 flex items-center justify-center gap-2 rounded bg-indigo-600 px-4 py-4 text-xs font-black text-white uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50"
                                        >
                                            {isSubmitting ? 'Mendaftarkan...' : 'Daftar Sekarang'} <CheckCircle2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>

            {/* Right Side: Branding */}
            <div className="relative hidden w-0 flex-1 lg:block bg-indigo-950 overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none" 
                     style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}>
                </div>
                
                <div className="flex h-full flex-col items-center justify-center p-12 text-white relative z-10">
                    <div className="flex h-24 w-24 items-center justify-center rounded bg-indigo-600 mb-8 shadow-2xl animate-bounce-slow">
                        <Package className="h-14 w-14 text-white" />
                    </div>
                    <h1 className="text-6xl font-black tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-indigo-300">MinISP</h1>
                    <p className="text-center text-indigo-100 text-lg max-w-md leading-relaxed font-medium">
                        Satu akun untuk semua layanan internet Anda. Cepat, Handal, dan Terjangkau.
                    </p>

                    <div className="mt-12 space-y-6 w-full max-w-xs">
                        <div className="flex items-center gap-4 bg-white/5 p-4 rounded border border-white/10 backdrop-blur-sm">
                            <ShieldCheck className="text-indigo-400 w-8 h-8" />
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest">Keamanan Data</p>
                                <p className="text-[10px] text-indigo-200">Data pribadi Anda aman bersama kami.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-white/5 p-4 rounded border border-white/10 backdrop-blur-sm">
                            <MapIcon className="text-indigo-400 w-8 h-8" />
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest">Cakupan Luas</p>
                                <p className="text-[10px] text-indigo-200">Menjangkau pelosok untuk konektivitas tanpa batas.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
