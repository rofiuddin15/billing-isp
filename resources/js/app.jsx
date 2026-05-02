import './bootstrap';
import '../css/app.css';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';

const container = document.getElementById('app');
const root = createRoot(container);

const App = () => {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-indigo-500/30">
            <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                <div className="relative isolate overflow-hidden bg-slate-900 px-6 py-24 shadow-2xl rounded-3xl sm:px-24 xl:py-32 border border-slate-800">
                    <h2 className="mx-auto max-w-2xl text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        MinISP RT-RW Net
                    </h2>
                    <p className="mx-auto mt-2 max-w-xl text-center text-lg leading-8 text-slate-300">
                        Professional Management System for ISP scale RT-RW Net.
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-x-6">
                        <button className="rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 transition-all">
                            Get started
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

root.render(
    <Provider store={store}>
        <BrowserRouter>
            <Routes>
                <Route path="*" element={<App />} />
            </Routes>
        </BrowserRouter>
    </Provider>
);
