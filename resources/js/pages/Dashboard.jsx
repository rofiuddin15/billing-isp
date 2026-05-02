import React from 'react';
import { Users, Ticket, TrendingUp, AlertCircle } from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, color, trend }) => (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all group">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${color} bg-opacity-10 group-hover:scale-110 transition-transform`}>
                <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
            </div>
            {trend && (
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                    {trend > 0 ? '+' : ''}{trend}%
                </span>
            )}
        </div>
        <h3 className="text-slate-400 text-sm font-medium">{label}</h3>
        <p className="text-2xl font-bold text-white mt-1">{value}</p>
    </div>
);

const Dashboard = () => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h2 className="text-2xl font-bold text-white">Overview</h2>
                <p className="text-slate-400">Welcome back, here's what's happening today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    label="Active Customers" 
                    value="1,284" 
                    icon={Users} 
                    color="bg-blue-500"
                    trend={12}
                />
                <StatCard 
                    label="Vouchers Sold" 
                    value="842" 
                    icon={Ticket} 
                    color="bg-purple-500"
                    trend={8}
                />
                <StatCard 
                    label="Monthly Revenue" 
                    value="Rp 42.5M" 
                    icon={TrendingUp} 
                    color="bg-emerald-500"
                    trend={5}
                />
                <StatCard 
                    label="Outstanding Bills" 
                    value="12" 
                    icon={AlertCircle} 
                    color="bg-amber-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 p-6">
                    <h3 className="text-lg font-bold text-white mb-6">Recent Transactions</h3>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-700">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-white">Monthly Bill - Budi Santoso</p>
                                        <p className="text-xs text-slate-500">May 2, 2026 • 10:24 AM</p>
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-emerald-400">+ Rp 150,000</span>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
                    <h3 className="text-lg font-bold text-white mb-6">Quick Actions</h3>
                    <div className="grid grid-cols-1 gap-4">
                        <button className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all active:scale-95">
                            Generate Vouchers
                        </button>
                        <button className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold transition-all active:scale-95">
                            Add New Customer
                        </button>
                        <button className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold transition-all active:scale-95">
                            Record Expense
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
