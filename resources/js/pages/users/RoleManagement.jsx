import React, { useEffect, useState, useMemo } from 'react';
import apiFetch from '../../utils/api';
import { 
    Shield, 
    Save, 
    Plus, 
    Trash2, 
    CheckSquare, 
    Square, 
    Grid,
    Check,
    X,
    Lock
} from 'lucide-react';
import { toast } from 'react-toastify';
import Badge from '../../components/Badge';

const MENU_LABELS = {
    dashboard: 'Dasbor Utama',
    customers: 'Pelanggan & Tagihan',
    packages: 'Paket Bulanan',
    vouchers: 'Voucher Pelanggan',
    finance: 'Arus Kas Keuangan',
    coa: 'Bagan Akun (COA)',
    ledger: 'Buku Besar Akuntansi',
    reports: 'Laporan Keuangan',
    finance_settings: 'Pengaturan Biaya',
    master_vouchers: 'Paket Voucher (Master)',
    master_categories: 'Kategori Transaksi (Master)',
    complaints: 'Aduan Pelanggan',
    users: 'Manajemen Staff',
    roles: 'Manajemen Akses & Role',
    settings: 'Pengaturan Sistem'
};

const ACTIONS = [
    { key: 'menu', label: 'Lihat', color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30' },
    { key: 'create', label: 'Tambah', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' },
    { key: 'edit', label: 'Ubah', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30' },
    { key: 'delete', label: 'Hapus', color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/30' }
];

const RoleManagement = () => {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [selectedRole, setSelectedRole] = useState(null);
    const [rolePermissions, setRolePermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [newRoleName, setNewRoleName] = useState('');
    const [showNewRoleModal, setShowNewRoleModal] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [rolesRes, permsRes] = await Promise.all([
                apiFetch('/api/roles'),
                apiFetch('/api/permissions')
            ]);
            setRoles(rolesRes);
            setPermissions(permsRes);
            
            if (rolesRes.length > 0 && !selectedRole) {
                handleSelectRole(rolesRes[0]);
            } else if (selectedRole) {
                const updatedSelectedRole = rolesRes.find(r => r.id === selectedRole.id);
                if (updatedSelectedRole) handleSelectRole(updatedSelectedRole);
            }
        } catch (error) {
            toast.error('Gagal mengambil data role dan akses');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectRole = (role) => {
        setSelectedRole(role);
        setRolePermissions(role.permissions.map(p => p.name));
    };

    // Toggle single permission checkbox
    const handleTogglePermission = (menu, action) => {
        if (selectedRole?.name === 'admin') return; // Admin has locked permissions

        const permName = `${action}.${menu}`;
        if (rolePermissions.includes(permName)) {
            setRolePermissions(rolePermissions.filter(p => p !== permName));
        } else {
            setRolePermissions([...rolePermissions, permName]);
        }
    };

    // Toggle all CRUD actions for a single menu row
    const handleToggleRow = (menu, isAllSelected) => {
        if (selectedRole?.name === 'admin') return;

        const rowPermissions = ACTIONS.map(act => `${act.key}.${menu}`);
        if (isAllSelected) {
            // Remove all
            setRolePermissions(rolePermissions.filter(p => !rowPermissions.includes(p)));
        } else {
            // Add all missing
            const newPerms = [...rolePermissions];
            rowPermissions.forEach(p => {
                if (!newPerms.includes(p)) newPerms.push(p);
            });
            setRolePermissions(newPerms);
        }
    };

    // Toggle a column action for all menus
    const handleToggleColumn = (actionKey, isAllSelected) => {
        if (selectedRole?.name === 'admin') return;

        const colPermissions = Object.keys(MENU_LABELS).map(menu => `${actionKey}.${menu}`);
        if (isAllSelected) {
            // Remove all in this column
            setRolePermissions(rolePermissions.filter(p => !colPermissions.includes(p)));
        } else {
            // Add all in this column
            const newPerms = [...rolePermissions];
            colPermissions.forEach(p => {
                if (!newPerms.includes(p)) newPerms.push(p);
            });
            setRolePermissions(newPerms);
        }
    };

    const handleSavePermissions = async () => {
        if (!selectedRole) return;
        
        try {
            setSaving(true);
            await apiFetch(`/api/roles/${selectedRole.id}/permissions`, {
                method: 'POST',
                body: JSON.stringify({ permissions: rolePermissions })
            });
            toast.success('Matriks hak akses berhasil disimpan');
            fetchData();
        } catch (error) {
            toast.error('Gagal menyimpan hak akses');
        } finally {
            setSaving(false);
        }
    };

    const handleCreateRole = async (e) => {
        e.preventDefault();
        try {
            await apiFetch('/api/roles', {
                method: 'POST',
                body: JSON.stringify({ name: newRoleName.toLowerCase() })
            });
            toast.success('Role baru berhasil dibuat');
            setNewRoleName('');
            setShowNewRoleModal(false);
            fetchData();
        } catch (error) {
            toast.error('Gagal membuat role baru');
        }
    };

    const handleDeleteRole = async (roleId) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus role ini?')) return;
        try {
            await apiFetch(`/api/roles/${roleId}`, { method: 'DELETE' });
            toast.success('Role berhasil dihapus');
            if (selectedRole?.id === roleId) setSelectedRole(null);
            fetchData();
        } catch (error) {
            toast.error('Gagal menghapus role');
        }
    };

    // Matrix status pre-calculations
    const matrixStats = useMemo(() => {
        const stats = {};
        Object.keys(MENU_LABELS).forEach(menu => {
            const rowPerms = ACTIONS.map(act => `${act.key}.${menu}`);
            const selectedCount = rowPerms.filter(p => rolePermissions.includes(p)).length;
            stats[menu] = {
                all: selectedCount === ACTIONS.length,
                none: selectedCount === 0,
                some: selectedCount > 0 && selectedCount < ACTIONS.length
            };
        });

        // Column Stats
        const colStats = {};
        ACTIONS.forEach(act => {
            const colPerms = Object.keys(MENU_LABELS).map(menu => `${act.key}.${menu}`);
            const selectedCount = colPerms.filter(p => rolePermissions.includes(p)).length;
            colStats[act.key] = selectedCount === Object.keys(MENU_LABELS).length;
        });

        return { rows: stats, cols: colStats };
    }, [rolePermissions]);

    if (loading) {
        return (
            <div className="h-64 flex flex-col items-center justify-center space-y-4">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent" />
                <p className="text-sm font-bold text-slate-500">Memuat matriks akses...</p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-500">
            {/* Header Block */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2.5">
                        <Shield className="w-7 h-7 text-indigo-600" />
                        Matriks Manajemen Akses & Role
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Kelola hak akses pengguna pada tingkat fitur operasional CRUD (Lihat, Tambah, Ubah, Hapus) per menu.
                    </p>
                </div>
                <button 
                    onClick={() => setShowNewRoleModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider rounded-sm shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
                >
                    <Plus className="w-4 h-4" /> Tambah Role Baru
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Left Panel: Role List */}
                <div className="lg:col-span-1 space-y-3">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Daftar Hak Akses (Role)</h3>
                    <div className="space-y-1.5">
                        {roles.map(role => (
                            <div 
                                key={role.id}
                                onClick={() => handleSelectRole(role)}
                                className={`
                                    group flex items-center justify-between p-3.5 rounded-sm cursor-pointer transition-all border
                                    ${selectedRole?.id === role.id 
                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20 font-black' 
                                        : 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 font-bold'}
                                `}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono opacity-60">#</span>
                                    <span className="text-sm capitalize">{role.name}</span>
                                </div>
                                {role.name !== 'admin' ? (
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteRole(role.id);
                                        }}
                                        className={`p-1.5 rounded transition-all opacity-0 group-hover:opacity-100 ${
                                            selectedRole?.id === role.id 
                                                ? 'hover:bg-indigo-700 text-white' 
                                                : 'hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-500'
                                        }`}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                ) : (
                                    <Lock className="w-3.5 h-3.5 opacity-65" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel: Interactive Permission Matrix */}
                <div className="lg:col-span-4">
                    {selectedRole ? (
                        <div className="bg-white dark:bg-slate-900 rounded-sm border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full">
                            
                            {/* Matrix Header Controls */}
                            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/20">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight capitalize">
                                            Matriks Hak Akses: {selectedRole.name}
                                        </h3>
                                        <Badge variant="indigo" className="text-[10px]">{rolePermissions.length} Fitur Diizinkan</Badge>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                        Pilih dan atur matriks CRUD di bawah untuk membatasi fitur.
                                    </p>
                                </div>
                                
                                <button 
                                    onClick={handleSavePermissions}
                                    disabled={saving || selectedRole.name === 'admin'}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-wider rounded-sm shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
                                >
                                    <Save className="w-4 h-4" /> {saving ? 'Menyimpan...' : 'Simpan Matriks'}
                                </button>
                            </div>

                            {/* Warning For Admin */}
                            {selectedRole.name === 'admin' && (
                                <div className="m-6 mb-0 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-sm flex items-center gap-3">
                                    <Lock className="w-5 h-5 text-amber-500 flex-shrink-0" />
                                    <p className="text-xs text-amber-700 dark:text-amber-400 font-bold leading-relaxed">
                                        Role <strong>Admin</strong> dikunci secara default dengan akses penuh (60/60) ke seluruh menu & operasi untuk melindungi integritas operasional.
                                    </p>
                                </div>
                            )}

                            {/* Permission Matrix Table */}
                            <div className="overflow-x-auto p-6">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <th className="py-3 px-4">FITUR MENU</th>
                                            {ACTIONS.map(action => (
                                                <th key={action.key} className="py-3 px-4 text-center">
                                                    <button
                                                        type="button"
                                                        disabled={selectedRole.name === 'admin'}
                                                        onClick={() => handleToggleColumn(action.key, matrixStats.cols[action.key])}
                                                        className={`px-2.5 py-1 rounded-sm border hover:border-slate-300 dark:hover:border-slate-700 text-[9px] font-black transition-all ${
                                                            matrixStats.cols[action.key]
                                                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                                                                : 'bg-transparent text-slate-400'
                                                        }`}
                                                    >
                                                        {action.label.toUpperCase()}
                                                    </button>
                                                </th>
                                            ))}
                                            <th className="py-3 px-4 text-right">BARIS MENU</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                                        {Object.entries(MENU_LABELS).map(([menuName, menuLabel]) => {
                                            const isRowAllSelected = matrixStats.rows[menuName]?.all;
                                            return (
                                                <tr key={menuName} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-all">
                                                    <td className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300">
                                                        <div className="flex flex-col">
                                                            <span>{menuLabel}</span>
                                                            <span className="text-[9px] font-mono text-slate-400 lowercase font-medium">
                                                                {menuName}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    
                                                    {ACTIONS.map(action => {
                                                        const permName = `${action.key}.${menuName}`;
                                                        const isChecked = rolePermissions.includes(permName);
                                                        return (
                                                            <td key={action.key} className="py-3 px-4 text-center">
                                                                <button
                                                                    type="button"
                                                                    disabled={selectedRole.name === 'admin'}
                                                                    onClick={() => handleTogglePermission(menuName, action.key)}
                                                                    className={`
                                                                        inline-flex items-center justify-center p-1.5 rounded transition-all border
                                                                        ${isChecked 
                                                                            ? `${action.color} border-slate-200 dark:border-slate-800` 
                                                                            : 'bg-transparent border-slate-200 dark:border-slate-800 text-slate-200 dark:text-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}
                                                                        ${selectedRole.name === 'admin' ? 'cursor-default opacity-85' : 'cursor-pointer'}
                                                                    `}
                                                                >
                                                                    {isChecked ? (
                                                                        <Check className="w-4 h-4 font-black" />
                                                                    ) : (
                                                                        <X className="w-4 h-4 opacity-30" />
                                                                    )}
                                                                </button>
                                                            </td>
                                                        );
                                                    })}

                                                    <td className="py-3 px-4 text-right">
                                                        <button
                                                            type="button"
                                                            disabled={selectedRole.name === 'admin'}
                                                            onClick={() => handleToggleRow(menuName, isRowAllSelected)}
                                                            className={`px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-sm transition-all border ${
                                                                isRowAllSelected
                                                                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                                                                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900'
                                                            }`}
                                                        >
                                                            {isRowAllSelected ? 'Semua' : 'Toggle'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-12 bg-slate-50/50 dark:bg-slate-800/20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-sm">
                            <Shield className="w-16 h-16 text-slate-200 mb-4" />
                            <p className="text-slate-400 font-bold">Pilih role untuk mengatur matriks hak akses</p>
                        </div>
                    )}
                </div>
            </div>

            {/* New Role Modal */}
            {showNewRoleModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">Tambah Role Baru</h3>
                            <p className="text-xs text-slate-500">Definisikan nama role baru untuk hak akses CRUD terpadu.</p>
                        </div>
                        <form onSubmit={handleCreateRole} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nama Role</label>
                                <input 
                                    type="text" 
                                    required
                                    value={newRoleName}
                                    onChange={e => setNewRoleName(e.target.value)}
                                    placeholder="contoh: finance"
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-sm px-4 py-3 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button 
                                    type="button"
                                    onClick={() => setShowNewRoleModal(false)}
                                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-sm transition-all"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-sm shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
                                >
                                    Buat Role
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoleManagement;
