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
import RegisterPage from './pages/RegisterPage';
import CustomerList from './pages/customers/CustomerList';
import CustomerForm from './pages/customers/CustomerForm';
import CustomerDetail from './pages/customers/CustomerDetail';
import MonthlyPackageList from './pages/packages/MonthlyPackageList';
import VoucherInventory from './pages/vouchers/VoucherInventory';
import CashFlowList from './pages/finance/CashFlowList';
import TransactionCategoryList from './pages/finance/TransactionCategoryList';
import COAList from './pages/finance/COAList';
import JournalList from './pages/finance/JournalList';
import UserList from './pages/users/UserList';
import RoleManagement from './pages/users/RoleManagement';
import VoucherPackageList from './pages/packages/VoucherPackageList';
import Settings from './pages/Settings';
import AuditTrail from './pages/system/AuditTrail';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const container = document.getElementById('app');
const root = createRoot(container);

root.render(
    <Provider store={store}>
        <BrowserRouter>
            <ToastContainer theme="colored" position="top-right" autoClose={3000} />
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/" element={<Layout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="customers" element={<CustomerList />} />
                    <Route path="customers/create" element={<CustomerForm />} />
                    <Route path="customers/:id" element={<CustomerDetail />} />
                    <Route path="customers/:id/edit" element={<CustomerForm />} />
                    <Route path="packages" element={<MonthlyPackageList />} />
                    <Route path="vouchers" element={<VoucherInventory />} />
                    <Route path="finance" element={<CashFlowList />} />
                    <Route path="finance/coa" element={<COAList />} />
                    <Route path="finance/ledger" element={<JournalList />} />
                    <Route path="master/users" element={<UserList />} />
                    <Route path="master/roles" element={<RoleManagement />} />
                    <Route path="master/voucher-packages" element={<VoucherPackageList />} />
                    <Route path="master/transaction-categories" element={<TransactionCategoryList />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="system/logs" element={<AuditTrail />} />
                </Route>
            </Routes>
        </BrowserRouter>
    </Provider>
);
