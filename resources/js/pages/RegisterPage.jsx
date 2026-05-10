import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Eye, ArrowLeft } from 'lucide-react';
import apiFetch from '../utils/api';
import { toast } from 'react-toastify';

const schema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    password_confirmation: z.string(),
}).refine((data) => data.password === data.password_confirmation, {
    message: "Passwords don't match",
    path: ["password_confirmation"],
});

const RegisterPage = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = React.useState(false);
    
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data) => {
        try {
            await apiFetch('/api/auth/register', {
                method: 'POST',
                body: JSON.stringify(data),
            });
            toast.success('Registration successful! Welcome to MinISP.');
            navigate('/login');
        } catch (error) {
            toast.error(error.message || 'Registration failed');
        }
    };

    return (
        <div className="flex min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
            {/* Left Side: Form */}
            <div className="flex flex-1 flex-col justify-center px-8 py-12 sm:px-12 lg:px-20 xl:px-32 bg-white dark:bg-slate-950">
                <div className="mx-auto w-full max-w-md">
                    <div className="mb-10">
                        <Link to="/login" className="flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to login
                        </Link>
                    </div>

                    <div>
                        <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                            Sign Up
                        </h2>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            Create an account to start managing your ISP!
                        </p>
                    </div>

                    <div className="mt-8">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-900 dark:text-white">
                                    Full Name<span className="text-red-500">*</span>
                                </label>
                                <div className="mt-2">
                                    <input
                                        {...register('name')}
                                        type="text"
                                        placeholder="John Doe"
                                        className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all outline-none"
                                    />
                                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                                </div>
                            </div>

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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-900 dark:text-white">
                                        Password<span className="text-red-500">*</span>
                                    </label>
                                    <div className="mt-2 relative">
                                        <input
                                            {...register('password')}
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all outline-none"
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                    </div>
                                    {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-900 dark:text-white">
                                        Confirm<span className="text-red-500">*</span>
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            {...register('password_confirmation')}
                                            type="password"
                                            placeholder="••••••••"
                                            className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all outline-none"
                                        />
                                    </div>
                                    {errors.password_confirmation && <p className="mt-1 text-xs text-red-500">{errors.password_confirmation.message}</p>}
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex w-full justify-center rounded-xl bg-indigo-600 px-4 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all active:scale-[0.98] disabled:opacity-50 mt-6"
                                >
                                    {isSubmitting ? 'Creating account...' : 'Create Account'}
                                </button>
                            </div>
                        </form>

                        <p className="mt-8 text-center text-sm text-slate-500">
                            Already have an account?{' '}
                            <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-500">
                                Sign In
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
            </div>
        </div>
    );
};

export default RegisterPage;
