import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Ticket, X, Clock, Calendar } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVoucherPackages, deleteVoucherPackage } from '../../store/slices/voucherPackageSlice';
import apiFetch from '../../utils/api';
import { toast } from 'react-toastify';

import DataTable from '../../components/DataTable';

const VoucherPackageList = () => {
    const dispatch = useDispatch();
    const { items: packages, loading } = useSelector(state => state.voucherPackages);
    const [showModal, setShowModal] = useState(false);
    const [editingPkg, setEditingPkg] = useState(null);
    const [formData, setFormData] = useState({ 
        name: '', 
        price: '', 
        duration_minutes: '', 
        active_period_days: '' 
    });

    useEffect(() => {
        dispatch(fetchVoucherPackages());
    }, [dispatch]);

    const handleOpenModal = (pkg = null) => {
        if (pkg) {
            setEditingPkg(pkg);
            setFormData({ 
                name: pkg.name, 
                price: pkg.price, 
                duration_minutes: pkg.duration_minutes, 
                active_period_days: pkg.active_period_days 
            });
        } else {
            setEditingPkg(null);
            setFormData({ 
                name: '', 
                price: '', 
                duration_minutes: '', 
                active_period_days: '' 
            });
        }
        setShowModal(true);
    };

    const handleImport = async (data) => {
        toast.info(`Importing ${data.length} packages...`);
        console.log('Importing voucher packages:', data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingPkg) {
                await apiFetch(`/api/voucher-packages/${editingPkg.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(formData)
                });
                toast.success('Voucher package updated successfully');
            } else {
                await apiFetch('/api/voucher-packages', {
                    method: 'POST',
                    body: JSON.stringify(formData)
                });
                toast.success('Voucher package created successfully');
            }
            setShowModal(false);
            dispatch(fetchVoucherPackages());
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Failed to save voucher package');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this voucher package?')) {
            try {
                await dispatch(deleteVoucherPackage(id)).unwrap();
                toast.success('Voucher package deleted successfully');
            } catch (error) {
                toast.error(error.message || 'Failed to delete voucher package');
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
                        <Ticket className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span className="text-sm font-bold text-slate-800 dark:text-white">{info.getValue()}</span>
                </div>
            )
        },
        {
            header: 'Harga',
            accessorKey: 'price',
            cell: info => <span className="font-bold text-emerald-600">Rp {Number(info.getValue()).toLocaleString()}</span>
        },
        {
            header: 'Durasi',
            accessorKey: 'duration_minutes',
            cell: info => (
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    {info.getValue()} Menit
                </div>
            )
        },
        {
            header: 'Masa Aktif',
            accessorKey: 'active_period_days',
            cell: info => (
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    {info.getValue()} Hari
                </div>
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
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Paket Voucher</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Kelola rencana voucher berbasis waktu untuk hotspot.</p>
                </div>
            </div>

            <DataTable 
                columns={columns} 
                data={packages} 
                loading={loading}
                onImport={handleImport}
                exportFileName="paket-voucher"
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
                            <h3 className="font-bold text-slate-800 dark:text-white">{editingPkg ? 'Edit Paket Voucher' : 'Paket Voucher Baru'}</h3>
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
                                    placeholder="Contoh: 2 Jam / 2.000"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Durasi (Menit)</label>
                                    <input 
                                        type="number"
                                        required
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-sm px-4 py-2.5 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={formData.duration_minutes}
                                        onChange={e => setFormData({...formData, duration_minutes: e.target.value})}
                                        placeholder="120"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Aktif (Hari)</label>
                                    <input 
                                        type="number"
                                        required
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-sm px-4 py-2.5 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={formData.active_period_days}
                                        onChange={e => setFormData({...formData, active_period_days: e.target.value})}
                                        placeholder="1"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Harga (Rp)</label>
                                <input 
                                    type="number"
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-sm px-4 py-2.5 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={formData.price}
                                    onChange={e => setFormData({...formData, price: e.target.value})}
                                    placeholder="2000"
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

export default VoucherPackageList;
