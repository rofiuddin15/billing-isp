import React, { useEffect, useState } from 'react';
import apiFetch from '../../utils/api';
import { Shield, Save, Plus, Trash2, CheckSquare, Square } from 'lucide-react';
import { toast } from 'react-toastify';
import Badge from '../../components/Badge';

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

    const togglePermission = (permName) => {
        if (rolePermissions.includes(permName)) {
            setRolePermissions(rolePermissions.filter(p => p !== permName));
        } else {
            setRolePermissions([...rolePermissions, permName]);
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
            toast.success('Hak akses berhasil diperbarui');
            fetchData();
        } catch (error) {
            toast.error('Gagal memperbarui hak akses');
        } finally {
            setSaving(false);
        }
    };

    const handleCreateRole = async (e) => {
        e.preventDefault();
        try {
            await apiFetch('/api/roles', {
                method: 'POST',
                body: JSON.stringify({ name: newRoleName })
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

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Memuat data...</div>;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                        <Shield className="w-6 h-6 text-indigo-600" />
                        Manajemen Akses & Role
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Atur visibilitas menu untuk setiap role pengguna.</p>
                </div>
                <button 
                    onClick={() => setShowNewRoleModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
                >
                    <Plus className="w-4 h-4" /> Tambah Role
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Role List */}
                <div className="lg:col-span-1 space-y-3">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Daftar Role</h3>
                    <div className="space-y-1">
                        {roles.map(role => (
                            <div 
                                key={role.id}
                                onClick={() => handleSelectRole(role)}
                                className={`
                                    group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border
                                    ${selectedRole?.id === role.id 
                                        ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-500/10 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-400' 
                                        : 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}
                                `}
                            >
                                <span className="font-bold text-sm capitalize">{role.name}</span>
                                {role.name !== 'admin' && (
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteRole(role.id);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-500 rounded-lg transition-all"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Permission Grid */}
                <div className="lg:col-span-3">
                    {selectedRole ? (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full">
                            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight capitalize">
                                            Akses Menu: {selectedRole.name}
                                        </h3>
                                        <Badge variant="indigo" className="text-[10px]">{rolePermissions.length} Menu Aktif</Badge>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Centang menu yang boleh diakses oleh role ini</p>
                                </div>
                                <button 
                                    onClick={handleSavePermissions}
                                    disabled={saving || selectedRole.name === 'admin'}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
                                >
                                    <Save className="w-4 h-4" /> {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </div>
                            
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {permissions.map(perm => (
                                    <div 
                                        key={perm.id}
                                        onClick={() => selectedRole.name !== 'admin' && togglePermission(perm.name)}
                                        className={`
                                            flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer
                                            ${rolePermissions.includes(perm.name)
                                                ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/5 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-400'
                                                : 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'}
                                            ${selectedRole.name === 'admin' ? 'cursor-default opacity-80' : ''}
                                        `}
                                    >
                                        <div className="flex-shrink-0">
                                            {rolePermissions.includes(perm.name) ? (
                                                <CheckSquare className="w-5 h-5 text-emerald-600" />
                                            ) : (
                                                <Square className="w-5 h-5 text-slate-300" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold leading-tight">{perm.name.replace('menu.', '').replace('_', ' ').toUpperCase()}</p>
                                            <p className="text-[10px] font-medium opacity-60">ID: {perm.name}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {selectedRole.name === 'admin' && (
                                <div className="mx-6 mb-6 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl">
                                    <p className="text-xs text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
                                        <strong>Catatan:</strong> Role Admin memiliki akses penuh ke semua menu secara default dan tidak dapat diubah untuk menjaga integritas sistem.
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-12 bg-slate-50/50 dark:bg-slate-800/20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                            <Shield className="w-16 h-16 text-slate-200 mb-4" />
                            <p className="text-slate-400 font-bold">Pilih role untuk mengatur hak akses menu</p>
                        </div>
                    )}
                </div>
            </div>

            {/* New Role Modal */}
            {showNewRoleModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">Tambah Role Baru</h3>
                            <p className="text-xs text-slate-500">Definisikan nama role (contoh: 'staff', 'finance')</p>
                        </div>
                        <form onSubmit={handleCreateRole} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nama Role</label>
                                <input 
                                    type="text" 
                                    required
                                    value={newRoleName}
                                    onChange={e => setNewRoleName(e.target.value)}
                                    placeholder="contoh: teknisi"
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button 
                                    type="button"
                                    onClick={() => setShowNewRoleModal(false)}
                                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-all"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
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
