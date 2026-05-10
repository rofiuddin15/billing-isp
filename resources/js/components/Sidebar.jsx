import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Users, 
    Ticket, 
    Wallet, 
    Package,
    Settings, 
    MessageCircle,
    Tag,
    Landmark,
    FileText,
    ChevronDown
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
    const collapsed = !sidebarOpen;

    return (
        <aside className={`absolute left-0 top-0 z-50 flex h-screen flex-col overflow-y-hidden bg-white duration-300 ease-in-out dark:bg-slate-900 lg:static lg:translate-x-0 ${sidebarOpen ? 'w-72.5 translate-x-0' : 'w-20 lg:w-20 -translate-x-full lg:translate-x-0'} border-r border-slate-200 dark:border-slate-800`}>
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
                    {/* Menu Group */}
                    <div>
                        {!collapsed && (
                            <h3 className="mb-4 ml-4 text-sm font-semibold text-slate-400 uppercase tracking-widest">
                                MENU UTAMA
                            </h3>
                        )}
                        <ul className="mb-6 flex flex-col gap-1.5">
                            <SidebarItem icon={LayoutDashboard} label="Dasbor" path="/" collapsed={collapsed} />
                            <SidebarItem icon={Users} label="Pelanggan" path="/customers" collapsed={collapsed} />
                            <SidebarItem icon={Package} label="Paket Bulanan" path="/packages" collapsed={collapsed} />
                            <SidebarItem icon={Ticket} label="Voucher" path="/vouchers" badge="BARU" collapsed={collapsed} />
                            <SidebarItem icon={Wallet} label="Arus Kas" path="/finance" collapsed={collapsed} />
                            <SidebarItem icon={Landmark} label="Bagan Akun" path="/finance/coa" collapsed={collapsed} />
                            <SidebarItem icon={FileText} label="Buku Besar" path="/finance/ledger" collapsed={collapsed} />
                        </ul>
                    </div>

                    {/* Master Data Group */}
                    <div>
                        {!collapsed && (
                            <h3 className="mb-4 ml-4 text-sm font-semibold text-slate-400 uppercase tracking-widest">
                                DATA MASTER
                            </h3>
                        )}
                        <ul className="mb-6 flex flex-col gap-1.5">
                            <SidebarItem icon={Ticket} label="Paket Voucher" path="/master/voucher-packages" collapsed={collapsed} />
                            <SidebarItem icon={Tag} label="Kategori Transaksi" path="/master/transaction-categories" collapsed={collapsed} />
                        </ul>
                    </div>

                    {/* Support Group */}
                    <div>
                        {!collapsed && (
                            <h3 className="mb-4 ml-4 text-sm font-semibold text-slate-400 uppercase tracking-widest">
                                DUKUNGAN
                            </h3>
                        )}
                        <ul className="mb-6 flex flex-col gap-1.5">
                            <SidebarItem icon={MessageCircle} label="Obrolan" path="/chat" collapsed={collapsed} />
                            <SidebarItem icon={Settings} label="Pengaturan" path="/settings" collapsed={collapsed} />
                        </ul>
                    </div>
                </nav>
            </div>
        </aside>
    );
};

export default Sidebar;
