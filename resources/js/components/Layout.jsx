import React from 'react';
import Sidebar from './Sidebar';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const Layout = () => {
    const { isAuthenticated } = useSelector(state => state.auth);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen bg-slate-950">
            <Sidebar />
            <main className="lg:ml-64 min-h-screen">
                <header className="h-16 flex items-center justify-between px-8 bg-slate-950/50 backdrop-blur-md sticky top-0 z-40 border-b border-slate-800/50">
                    <h1 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">
                        Management Panel
                    </h1>
                </header>
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
