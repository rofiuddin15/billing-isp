import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Users, 
    Ticket, 
    Wallet, 
    Settings, 
    LogOut,
    Menu,
    X
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector(state => state.auth);

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Users, label: 'Customers', path: '/customers' },
        { icon: Ticket, label: 'Vouchers', path: '/vouchers' },
        { icon: Wallet, label: 'Finance', path: '/finance' },
    ];

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transition-transform lg:translate-x-0">
            <div className="flex flex-col h-full">
                <div className="flex items-center h-16 px-6 border-b border-slate-800">
                    <span className="text-xl font-bold text-white tracking-tight">MinISP <span className="text-indigo-500">Core</span></span>
                </div>
                
                <nav className="flex-1 px-4 py-6 space-y-2">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                                flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all
                                ${isActive 
                                    ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' 
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}
                            `}
                        >
                            <item.icon className="w-5 h-5 mr-3" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center px-4 py-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                        <div className="ml-3 overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">{user?.name || 'Admin'}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.email || 'admin@minisp.com'}</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-sm font-medium text-slate-400 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-all"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        Logout
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
