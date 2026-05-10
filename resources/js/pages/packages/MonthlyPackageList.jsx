import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Package, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPackages, deletePackage } from '../../store/slices/packageSlice';
import apiFetch from '../../utils/api';
import { toast } from 'react-toastify';

import DataTable from '../../components/DataTable';

const MonthlyPackageList = () => {
    const dispatch = useDispatch();
    const { items: packages, loading } = useSelector(state => state.packages);
    const [showModal, setShowModal] = useState(false);
    const [editingPkg, setEditingPkg] = useState(null);
    const [formData, setFormData] = useState({ name: '', price: '', description: '' });

    useEffect(() => {
        dispatch(fetchPackages());
    }, [dispatch]);

    const handleOpenModal = (pkg = null) => {
        if (pkg) {
            setEditingPkg(pkg);
            setFormData({ name: pkg.name, price: pkg.price, description: pkg.description || '' });
        } else {
            setEditingPkg(null);
            setFormData({ name: '', price: '', description: '' });
        }
        setShowModal(true);
    };

    const handleImport = (data) => {
        toast.info(`Importing ${data.length} packages...`);
        console.log('Import data:', data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingPkg) {
                await apiFetch(`/api/monthly-packages/${editingPkg.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(formData)
                });
                toast.success('Package updated successfully');
            } else {
                await apiFetch('/api/monthly-packages', {
                    method: 'POST',
                    body: JSON.stringify(formData)
                });
                toast.success('Package created successfully');
            }
            setShowModal(false);
            dispatch(fetchPackages());
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Failed to save package');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this package?')) {
            try {
                await dispatch(deletePackage(id)).unwrap();
                toast.success('Package deleted successfully');
            } catch (error) {
                toast.error(error.message || 'Failed to delete package');
            }
        }
    };

    const columns = React.useMemo(() => [
        {
            header: 'Nama Paket',
            accessorKey: 'name',
            cell: info => (
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/10 rounded">
                        <Package className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-slate-800 dark:text-white">{info.getValue()}</div>
                        <div className="text-[10px] text-slate-400 font-medium truncate max-w-[200px]">{info.row.original.description || 'Tidak ada deskripsi'}</div>
                    </div>
                </div>
            )
        },
        {
            header: 'Harga Bulanan',
            accessorKey: 'price',
            cell: info => (
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    Rp {Number(info.getValue()).toLocaleString()}
                </span>
            )
        },
        {
            header: 'Aksi',
            id: 'actions',
            cell: info => (
                <div className="flex justify-end gap-2">
                    <button 
                        onClick={() => handleOpenModal(info.row.original)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => handleDelete(info.row.original.id)}
                        className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ], []);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Paket Bulanan</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Kelola rencana langganan untuk pelanggan Anda.</p>
                </div>
            </div>

            <DataTable 
                columns={columns}
                data={packages}
                loading={loading}
                onImport={handleImport}
                exportFileName="paket-bulanan"
                actions={
                    <button 
                        onClick={() => handleOpenModal()}
                        className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-sm text-sm font-semibold transition-all shadow-sm"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Paket
                    </button>
                }
            />

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-sm shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="font-bold text-slate-800 dark:text-white">{editingPkg ? 'Edit Paket' : 'Paket Baru'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Paket</label>
                                <input 
                                    type="text"
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-sm px-4 py-2.5 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    placeholder="Contoh: Home Basic 10Mbps"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Harga (Rp)</label>
                                <input 
                                    type="number"
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-sm px-4 py-2.5 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={formData.price}
                                    onChange={e => setFormData({...formData, price: e.target.value})}
                                    placeholder="150000"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Deskripsi</label>
                                <textarea 
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-sm px-4 py-2.5 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={formData.description}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                    rows={3}
                                    placeholder="Detail tentang paket ini..."
                                />
                            </div>
                            <div className="pt-4">
                                <button 
                                    type="submit"
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-sm shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                                >
                                    {editingPkg ? 'Perbarui Paket' : 'Buat Paket'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MonthlyPackageList;
