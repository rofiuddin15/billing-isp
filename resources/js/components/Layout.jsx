import React, { useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { setSidebarOpen } from '../store/slices/uiSlice';

const Layout = () => {
    const dispatch = useDispatch();
    const { isAuthenticated } = useSelector(state => state.auth);
    const { darkMode } = useSelector(state => state.ui);

    useEffect(() => {
        // Auto mini sidebar on mobile
        if (window.innerWidth < 1024) {
            dispatch(setSidebarOpen(false));
        }

        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode, dispatch]);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            {/* Sidebar */}
            <Sidebar />

            {/* Content Area */}
            <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
                {/* Header */}
                <Header />

                {/* Main Content */}
                <main>
                    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
