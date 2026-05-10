import React, { useState, useRef, useEffect } from 'react';
import { 
    Search, 
    Bell, 
    Moon, 
    Sun, 
    PanelLeftClose, 
    PanelLeft, 
    ChevronDown, 
    User, 
    LogOut,
    Settings as SettingsIcon,
    UserCircle
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleDarkMode, toggleSidebar } from '../store/slices/uiSlice';
import { logout } from '../store/slices/authSlice';
import { useNavigate, Link } from 'react-router-dom';

const Header = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { darkMode, sidebarOpen } = useSelector(state => state.ui);
    const { user } = useSelector(state => state.auth);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="sticky top-0 z-40 flex w-full bg-white drop-shadow-1 dark:bg-slate-900 dark:drop-shadow-none border-b border-slate-200 dark:border-slate-800">
            <div className="flex flex-grow items-center justify-between pl-3 pr-4 py-4 shadow-2 md:pl-4 md:pr-6 2xl:pr-11">
                <div className="flex items-center gap-2">
                    {/* Sidebar Toggle */}
                    <button
                        onClick={() => dispatch(toggleSidebar())}
                        className="z-50 flex items-center justify-center p-1 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-white transition-all active:scale-90"
                    >
                        {sidebarOpen ? (
                            <PanelLeftClose className="w-6 h-6" />
                        ) : (
                            <PanelLeft className="w-6 h-6" />
                        )}
                    </button>
                </div>

                {/* Search Bar */}
                <div className="hidden sm:block">
                    <form action="#" method="POST">
                        <div className="relative">
                            <button className="absolute left-0 top-1/2 -translate-y-1/2">
                                <Search className="w-5 h-5 text-slate-400" />
                            </button>
                            <input
                                type="text"
                                placeholder="Type to search..."
                                className="w-full bg-transparent pl-9 pr-4 font-medium focus:outline-none text-slate-800 dark:text-white"
                            />
                        </div>
                    </form>
                </div>

                <div className="flex items-center gap-3 2xsm:gap-7">
                    <ul className="flex items-center gap-2 2xsm:gap-4">
                        {/* Dark Mode Toggle */}
                        <li>
                            <button
                                onClick={() => dispatch(toggleDarkMode())}
                                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:text-indigo-400 transition-all shadow-sm active:scale-95"
                            >
                                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>
                        </li>

                        {/* Notification Menu Area */}
                        <li>
                            <button className="relative flex h-10 w-10 items-center justify-center rounded-full border-[0.5px] border-slate-200 bg-slate-50 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:text-indigo-400 transition-colors">
                                <span className="absolute -top-0.5 right-0 z-10 h-2 w-2 rounded-full bg-red-500">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
                                </span>
                                <Bell className="w-5 h-5" />
                            </button>
                        </li>
                    </ul>

                    {/* User Area Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button 
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 p-1.5 rounded-2xl transition-all"
                        >
                            <div className="hidden text-right lg:block">
                                <p className="text-sm font-black text-slate-800 dark:text-white leading-tight">{user?.name || 'Musharof'}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    {typeof user?.roles?.[0] === 'object' ? user?.roles?.[0]?.name : (user?.roles?.[0] || 'Administrator')}
                                </p>
                            </div>

                            <div className="h-10 w-10 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-inner relative">
                                <User className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                            </div>
                            
                            <ChevronDown className={`hidden h-4 w-4 text-slate-400 sm:block transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">
                                <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Akun Saya</p>
                                    <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{user?.email}</p>
                                </div>
                                <div className="p-2">
                                    <Link 
                                        to="/settings" 
                                        onClick={() => setDropdownOpen(false)}
                                        className="flex items-center gap-3 w-full px-3 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-all"
                                    >
                                        <UserCircle className="w-4 h-4" /> Profil
                                    </Link>
                                    <Link 
                                        to="/settings" 
                                        onClick={() => setDropdownOpen(false)}
                                        className="flex items-center gap-3 w-full px-3 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-all"
                                    >
                                        <SettingsIcon className="w-4 h-4" /> Pengaturan
                                    </Link>
                                </div>
                                <div className="p-2 border-t border-slate-100 dark:border-slate-800">
                                    <button 
                                        onClick={handleLogout}
                                        className="flex items-center gap-3 w-full px-3 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all group"
                                    >
                                        <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /> Keluar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
