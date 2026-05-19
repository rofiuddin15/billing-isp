import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, fetchRoles } from '../../store/slices/userSlice';
import { User, Plus, Edit2, Trash2, Mail, Shield, X, Key, UserCheck, ShieldCheck, Download } from 'lucide-react';
import Badge from '../../components/Badge';
import apiFetch from '../../utils/api';
import { toast } from 'react-toastify';
import DataTable from '../../components/DataTable';

const UserList = () => {
    const dispatch = useDispatch();
    const { items: users, roles, loading } = useSelector(state => state.users);
    const { permissions = [] } = useSelector(state => state.auth);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        roles: []
    });

    useEffect(() => {
        dispatch(fetchUsers());
        dispatch(fetchRoles());
    }, [dispatch]);

    const handleOpenModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                name: user.name,
                email: user.email,
                password: '',
                roles: user.roles?.map(r => r.name) || []
            });
        } else {
            setEditingUser(null);
            setFormData({
                name: '',
                email: '',
                password: '',
                roles: []
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await apiFetch(`/api/users/${editingUser.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(formData),
                });
                toast.success('Data staff berhasil diperbarui');
            } else {
                await apiFetch('/api/users', {
                    method: 'POST',
                    body: JSON.stringify(formData),
                });
                toast.success('Staff baru berhasil ditambahkan');
            }
            setShowModal(false);
            dispatch(fetchUsers());
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus staff ini?')) {
            try {
                await apiFetch(`/api/users/${id}`, { method: 'DELETE' });
                toast.success('Staff berhasil dihapus');
                dispatch(fetchUsers());
            } catch (error) {
                toast.error(error.message);
            }
        }
    };

    const columns = useMemo(() => [
        {
            accessorKey: 'name',
            header: 'Nama Staff',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <User className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-slate-800 dark:text-white leading-none mb-1">{row.original.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono tracking-tight">ID: #{row.original.id}</div>
                    </div>
                </div>
            )
        },
        {
            accessorKey: 'email',
            header: 'Email',
            cell: ({ row }) => (
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm font-medium">{row.original.email}</span>
                </div>
            )
        },
        {
            accessorKey: 'role',
            header: 'Role / Akses',
            cell: ({ row }) => {
                const userRoles = row.original.roles || [];
                return (
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {userRoles.length === 0 ? (
                            <Badge variant="slate" className="text-[10px] uppercase font-black px-3 py-1">
                                Tanpa Role
                            </Badge>
                        ) : (
                            userRoles.map(r => (
                                <Badge key={r.id} variant="indigo" className="text-[10px] uppercase font-black px-2.5 py-0.5">
                                    {r.name}
                                </Badge>
                            ))
                        )}
                    </div>
                );
            }
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }) => (
                <div className="flex items-center justify-end gap-2">
                    {permissions.includes('edit.users') && (
                        <button 
                            onClick={() => handleOpenModal(row.original)}
                            className="p-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-sm transition-all shadow-md shadow-indigo-500/10 active:scale-95"
                            title="Edit Staff"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                    )}
                    {permissions.includes('delete.users') && (
                        <button 
                            onClick={() => handleDelete(row.original.id)}
                            className="p-2 bg-rose-500 hover:bg-rose-600 text-white rounded-sm transition-all shadow-md shadow-rose-500/10 active:scale-95"
                            title="Hapus Staff"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )
        }
    ], [roles, permissions]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Manajemen Staff</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Kelola anggota tim dan hak akses mereka dalam tabel terstruktur.</p>
                </div>
            </div>

            <DataTable 
                columns={columns} 
                data={users} 
                isLoading={loading}
                searchPlaceholder="Cari staff..."
                exportFileName="daftar-staff"
                actions={
                    permissions.includes('create.users') && (
                        <div className="flex gap-2">
                            <button 
                                onClick={() => handleOpenModal()}
                                className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-sm text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                            >
                                <Plus className="w-4 h-4 sm:mr-2" />
                                <span className="hidden sm:inline">Tambah Staff</span>
                            </button>
                        </div>
                    )
                }
            />

            {/* User Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-sm shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
                            <h3 className="font-bold text-slate-800 dark:text-white">
                                {editingUser ? 'Edit Data Staff' : 'Tambah Staff Baru'}
                            </h3>
                            <button 
                                onClick={() => setShowModal(false)} 
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Lengkap</label>
                                <input 
                                    type="text"
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-sm px-4 py-2.5 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    placeholder="contoh: John Doe"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Alamat Email</label>
                                <input 
                                    type="email"
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-sm px-4 py-2.5 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                    placeholder="staff@minisp.com"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role / Hak Akses (Multi-Role)</label>
                                <div className="border border-slate-200 dark:border-slate-800 rounded-sm p-3 bg-slate-50/50 dark:bg-slate-950 max-h-36 overflow-y-auto space-y-2.5">
                                    {roles.map(role => {
                                        const isChecked = formData.roles.includes(role.name);
                                        return (
                                            <label key={role.id} className="flex items-center gap-2.5 cursor-pointer select-none">
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => {
                                                        if (isChecked) {
                                                            setFormData({
                                                                ...formData,
                                                                roles: formData.roles.filter(r => r !== role.name)
                                                            });
                                                        } else {
                                                            setFormData({
                                                                ...formData,
                                                                roles: [...formData.roles, role.name]
                                                            });
                                                        }
                                                    }}
                                                    className="rounded border-slate-300 text-indigo-650 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                                                />
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-tight">
                                                    {role.name.replace(/_/g, ' ')}
                                                </span>
                                            </label>
                                        );
                                    })}
                                    {roles.length === 0 && (
                                        <div className="text-xs text-slate-400 dark:text-slate-500 text-center py-2">Tidak ada role tersedia.</div>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    {editingUser ? 'Password Baru (Opsional)' : 'Password Akun'}
                                </label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="password"
                                        required={!editingUser}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-sm pl-10 pr-4 py-2.5 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                        value={formData.password}
                                        onChange={e => setFormData({...formData, password: e.target.value})}
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                            <div className="pt-2">
                                <button 
                                    type="submit"
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-sm shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                                >
                                    {editingUser ? 'Perbarui Staff' : 'Daftarkan Staff'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserList;
