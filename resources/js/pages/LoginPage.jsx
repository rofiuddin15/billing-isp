import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/slices/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Eye, ArrowLeft } from 'lucide-react';
import apiFetch from '../utils/api';
import { toast } from 'react-toastify';

const schema = z.object({
    email: z.string().email('Masukkan alamat email yang valid'),
    password: z.string().min(6, 'Password minimal harus 6 karakter'),
});

const LoginPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = React.useState(false);
    
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data) => {
        try {
            const response = await apiFetch('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify(data),
            });
            dispatch(setCredentials(response));
            toast.success('Selamat Datang di MinISP!');
            navigate('/');
        } catch (error) {
            console.error('Login error:', error);
            const message = error.message === 'Unauthorized' 
                ? 'Email atau password yang Anda masukkan salah.' 
                : (error.message || 'Gagal masuk ke sistem. Silakan coba lagi.');
            toast.error(message);
        }
    };

    return (
        <div className="flex min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
            {/* Left Side: Form */}
            <div className="flex flex-1 flex-col justify-center px-8 py-12 sm:px-12 lg:px-20 xl:px-32 bg-white dark:bg-slate-950">
                <div className="mx-auto w-full max-w-md">
                    <div className="mb-10">
                        <Link to="/" className="flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali ke Dashboard
                        </Link>
                    </div>

                    <div>
                        <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                            Masuk
                        </h2>
                        <h3 className="text-xl font-bold text-indigo-600 mt-1 italic">MinISP System</h3>
                        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                            Masukkan email dan password Anda untuk masuk ke sistem manajemen RT-RW Net.
                        </p>
                    </div>

                    <div className="mt-8">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                                    Alamat Email<span className="text-red-500">*</span>
                                </label>
                                <div className="mt-2">
                                    <input
                                        {...register('email')}
                                        type="email"
                                        placeholder="admin@minisp.com"
                                        className="block w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-4 py-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 sm:text-sm transition-all outline-none shadow-inner"
                                    />
                                    {errors.email && <p className="mt-2 text-xs font-bold text-rose-500 ml-1">{errors.email.message}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                                    Password<span className="text-red-500">*</span>
                                </label>
                                <div className="mt-2 relative">
                                    <input
                                        {...register('password')}
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Masukkan password Anda"
                                        className="block w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-4 py-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 sm:text-sm transition-all outline-none shadow-inner"
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 dark:hover:text-slate-200 transition-colors"
                                    >
                                        <Eye className="h-5 w-5" />
                                    </button>
                                    {errors.password && <p className="mt-2 text-xs font-bold text-rose-500 ml-1">{errors.password.message}</p>}
                                </div>
                            </div>

                            <div className="flex items-center justify-between px-1">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        className="h-4 w-4 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-xs font-bold text-slate-500 dark:text-slate-400 cursor-pointer uppercase tracking-wider">
                                        Ingat saya
                                    </label>
                                </div>

                                <div className="text-xs">
                                    <a href="#" className="font-black text-indigo-600 hover:text-indigo-500 uppercase tracking-wider">
                                        Lupa Password?
                                    </a>
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex w-full justify-center rounded-2xl bg-indigo-600 px-4 py-4 text-sm font-black text-white uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all active:scale-[0.98] disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Memproses...' : 'Masuk Sekarang'}
                                </button>
                            </div>
                        </form>

                        <p className="mt-10 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Belum punya akun?{' '}
                            <Link to="/register" className="font-black text-indigo-600 hover:text-indigo-500 ml-1">
                                Daftar Gratis
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side: Branding */}
            <div className="relative hidden w-0 flex-1 lg:block bg-slate-950 overflow-hidden">
                {/* Visual Decorative elements */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px]"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px]"></div>
                </div>
                
                <div className="flex h-full flex-col items-center justify-center p-12 text-white relative z-10">
                    <div className="flex h-28 w-28 items-center justify-center rounded-[2rem] bg-gradient-to-br from-indigo-500 to-indigo-700 mb-10 shadow-2xl shadow-indigo-500/40 transform rotate-6 hover:rotate-0 transition-transform duration-500">
                        <Package className="h-14 w-14 text-white" />
                    </div>
                    <h1 className="text-7xl font-black tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500">MinISP</h1>
                    <div className="h-1 w-20 bg-indigo-600 rounded-full mb-8"></div>
                    <p className="text-center text-slate-400 text-lg max-w-md leading-relaxed font-medium">
                        Solusi <span className="text-white font-bold">Cerdas & Profesional</span> untuk manajemen bisnis RT-RW Net Anda.
                    </p>
                    
                    <div className="mt-16 grid grid-cols-2 gap-8 w-full max-w-sm">
                        <div className="text-center p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                            <p className="text-3xl font-black text-white">100%</p>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Automated</p>
                        </div>
                        <div className="text-center p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                            <p className="text-3xl font-black text-white">Secure</p>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Cloud Data</p>
                        </div>
                    </div>
                </div>
                
                {/* Decorative Pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                     style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
