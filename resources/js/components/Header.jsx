import React from 'react';
import { 
    Search, 
    Bell, 
    Moon, 
    Sun, 
    PanelLeftClose,
    PanelLeft,
    ChevronDown,
    User
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleDarkMode, toggleSidebar } from '../store/slices/uiSlice';

const Header = () => {
    const dispatch = useDispatch();
    const { darkMode, sidebarOpen } = useSelector(state => state.ui);
    const { user } = useSelector(state => state.auth);

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

                    {/* User Area */}
                    <div className="relative flex items-center gap-4">
                        <span className="hidden text-right lg:block">
                            <span className="block text-sm font-medium text-slate-800 dark:text-white">{user?.name || 'Musharof'}</span>
                            <span className="block text-xs font-medium text-slate-500 dark:text-slate-400">Admin</span>
                        </span>

                        <span className="h-12 w-12 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <User className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                        </span>

                        <ChevronDown className="hidden h-4 w-4 text-slate-500 dark:text-slate-400 sm:block" />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
