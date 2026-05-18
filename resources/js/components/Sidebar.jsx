import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Users, 
    Ticket, 
    Wallet, 
    Package,
    Settings, 
    Megaphone,
    Tag,
    Landmark,
    FileText,
    ShieldCheck,
    ChevronDown,
    UserCircle
} from 'lucide-react';
import { useSelector } from 'react-redux';

const SidebarItem = ({ icon: Icon, label, path, badge, subItems, collapsed }) => {
    return (
        <li>
            <NavLink
                to={path}
                title={collapsed ? label : ''}
                className={({ isActive }) => `
                    group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-slate-600 duration-300 ease-in-out hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800
                    ${isActive ? 'bg-slate-50 text-indigo-600 dark:bg-slate-800 dark:text-white' : ''}
                    ${collapsed ? 'justify-center px-2' : ''}
                `}
            >
                {({ isActive }) => (
                    <>
                        <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-indigo-600 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                        {!collapsed && (
                            <>
                                <span className="truncate">{label}</span>
                                {badge && (
                                    <span className="absolute right-4 block rounded bg-indigo-600 px-1.5 py-0.5 text-xs font-medium text-white">
                                        {badge}
                                    </span>
                                )}
                                {subItems && <ChevronDown className="ml-auto w-4 h-4" />}
                            </>
                        )}
                    </>
                )}
            </NavLink>
        </li>
    );
};
const Sidebar = () => {
    const { sidebarOpen } = useSelector(state => state.ui);
    const { permissions = [] } = useSelector(state => state.auth);
    const collapsed = !sidebarOpen;

    const hasPermission = (perm) => {
        if (!perm) return true;
        return permissions.includes(perm);
    };

    const menuGroups = [
        {
            title: 'MENU UTAMA',
            items: [
                { icon: LayoutDashboard, label: 'Dasbor', path: '/', permission: 'menu.dashboard' },
                { icon: Users, label: 'Pelanggan', path: '/customers', permission: 'menu.customers' },
                { icon: Package, label: 'Paket Bulanan', path: '/packages', permission: 'menu.packages' },
                { icon: Ticket, label: 'Voucher', path: '/vouchers', badge: 'BARU', permission: 'menu.vouchers' },
                { icon: Wallet, label: 'Arus Kas', path: '/finance', permission: 'menu.finance' },
                { icon: Landmark, label: 'Bagan Akun', path: '/finance/coa', permission: 'menu.coa' },
                { icon: FileText, label: 'Buku Besar', path: '/finance/ledger', permission: 'menu.ledger' },
                { icon: FileText, label: 'Laporan Keuangan', path: '/finance/reports', permission: 'menu.ledger' },
                { icon: Wallet, label: 'Pengaturan Biaya', path: '/finance/settings', permission: 'menu.finance_settings' },
            ]
        },
        {
            title: 'DATA MASTER',
            items: [
                { icon: Ticket, label: 'Paket Voucher', path: '/master/voucher-packages', permission: 'menu.master_vouchers' },
                { icon: Tag, label: 'Kategori Transaksi', path: '/master/transaction-categories', permission: 'menu.master_categories' },
            ]
        },
        {
            title: 'DUKUNGAN',
            items: [
                { icon: Megaphone, label: 'Aduan', path: '/complaints', permission: 'menu.complaints' },
                { icon: UserCircle, label: 'Manajemen Staff', path: '/master/users', permission: 'menu.users' },
                { icon: ShieldCheck, label: 'Akses & Role', path: '/master/roles', permission: 'menu.roles' },
                { icon: FileText, label: 'Log Aktivitas', path: '/system/logs', permission: 'menu.logs' },
                { icon: Settings, label: 'Pengaturan', path: '/settings', permission: 'menu.settings' },
            ]
        }
    ];

    return (
        <aside className={`sticky left-0 top-0 z-50 flex h-screen flex-col overflow-y-hidden bg-white duration-300 ease-in-out dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 ${sidebarOpen ? 'w-72.5' : 'w-20'}`}>
            {/* Sidebar Header */}
            <div className={`flex items-center gap-2 px-6 py-5.5 lg:py-6.5 ${collapsed ? 'justify-center px-0' : 'justify-between'}`}>
                <NavLink to="/" className="flex items-center gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-600 shadow-lg shadow-indigo-500/20">
                        <Package className="text-white w-6 h-6" />
                    </div>
                    {!collapsed && (
                        <span className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">MinISP</span>
                    )}
                </NavLink>
            </div>

            <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
                <nav className={`mt-5 px-4 py-4 lg:mt-9 ${collapsed ? 'px-2' : 'lg:px-6'}`}>
                    {menuGroups.map((group, groupIndex) => {
                        const visibleItems = group.items.filter(item => hasPermission(item.permission));
                        if (visibleItems.length === 0) return null;

                        return (
                            <div key={groupIndex}>
                                {!collapsed && (
                                    <h3 className="mb-4 ml-4 text-sm font-semibold text-slate-400 uppercase tracking-widest">
                                        {group.title}
                                    </h3>
                                )}
                                <ul className="mb-6 flex flex-col gap-1.5">
                                    {visibleItems.map((item, itemIndex) => (
                                        <SidebarItem 
                                            key={itemIndex}
                                            icon={item.icon} 
                                            label={item.label} 
                                            path={item.path} 
                                            badge={item.badge}
                                            collapsed={collapsed} 
                                        />
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </nav>
            </div>
        </aside>
    );
};

export default Sidebar;
