import './bootstrap';
import '../css/app.css';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';

import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';

const container = document.getElementById('app');
const root = createRoot(container);

root.render(
    <Provider store={store}>
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<Layout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="customers" element={<div className="text-white">Customer Page (Coming Soon)</div>} />
                    <Route path="vouchers" element={<div className="text-white">Voucher Page (Coming Soon)</div>} />
                    <Route path="finance" element={<div className="text-white">Finance Page (Coming Soon)</div>} />
                </Route>
            </Routes>
        </BrowserRouter>
    </Provider>
);
