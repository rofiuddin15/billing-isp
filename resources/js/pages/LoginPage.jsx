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
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
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
            toast.success('Welcome to MinISP!');
            navigate('/');
        } catch (error) {
            toast.error(error.message || 'Login failed');
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
                            Back to dashboard
                        </Link>
                    </div>

                    <div>
                        <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                            Sign In
                        </h2>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            Enter your email and password to sign in!
                        </p>
                    </div>

                    <div className="mt-8">
                        <div className="grid grid-cols-2 gap-4">
                            <button className="flex w-full items-center justify-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-900 px-3 py-3 text-sm font-semibold text-slate-900 dark:text-white border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-5 w-5" alt="Google" />
                                <span className="hidden sm:inline">Sign in with Google</span>
                                <span className="sm:hidden">Google</span>
                            </button>
                            <button className="flex w-full items-center justify-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-900 px-3 py-3 text-sm font-semibold text-slate-900 dark:text-white border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                                <img src="https://www.svgrepo.com/show/513008/x.svg" className="h-5 w-5 dark:invert" alt="X" />
                                <span className="hidden sm:inline">Sign in with X</span>
                                <span className="sm:hidden">X</span>
                            </button>
                        </div>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-white dark:bg-slate-950 px-2 text-slate-500 font-medium uppercase tracking-widest">Or</span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-900 dark:text-white">
                                    Email<span className="text-red-500">*</span>
                                </label>
                                <div className="mt-2">
                                    <input
                                        {...register('email')}
                                        type="email"
                                        placeholder="info@gmail.com"
                                        className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all outline-none"
                                    />
                                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-900 dark:text-white">
                                    Password<span className="text-red-500">*</span>
                                </label>
                                <div className="mt-2 relative">
                                    <input
                                        {...register('password')}
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter your password"
                                        className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all outline-none"
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </button>
                                    {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm font-medium text-slate-700 dark:text-slate-400">
                                        Keep me logged in
                                    </label>
                                </div>

                                <div className="text-sm">
                                    <a href="#" className="font-bold text-indigo-600 hover:text-indigo-500">
                                        Forgot password?
                                    </a>
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex w-full justify-center rounded-xl bg-indigo-600 px-4 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all active:scale-[0.98] disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Signing in...' : 'Sign In'}
                                </button>
                            </div>
                        </form>

                        <p className="mt-8 text-center text-sm text-slate-500">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-500">
                                Sign Up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side: Branding */}
            <div className="relative hidden w-0 flex-1 lg:block bg-indigo-950 overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" 
                     style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}>
                </div>
                
                <div className="flex h-full flex-col items-center justify-center p-12 text-white relative z-10">
                    <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-indigo-600 mb-8 shadow-2xl animate-bounce-slow">
                        <Package className="h-14 w-14 text-white" />
                    </div>
                    <h1 className="text-6xl font-black tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-indigo-300">MinISP</h1>
                    <p className="text-center text-indigo-100 text-lg max-w-md leading-relaxed font-medium">
                        Smart & Professional Management System for your RT-RW Net Business.
                    </p>
                </div>
                
                {/* Decorative blobs */}
                <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-indigo-600/20 blur-3xl"></div>
                <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-indigo-400/10 blur-3xl"></div>
            </div>
        </div>
    );
};

export default LoginPage;
