import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Tag, X, TrendingUp, TrendingDown, ArrowLeftRight, Landmark } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTransactionCategories, deleteTransactionCategory } from '../../store/slices/transactionCategorySlice';
import { fetchAllAccounts } from '../../store/slices/accountSlice';
import apiFetch from '../../utils/api';
import { toast } from 'react-toastify';
import Badge from '../../components/Badge';

import DataTable from '../../components/DataTable';

const TransactionCategoryList = () => {
    const dispatch = useDispatch();
    const { items: categories, loading } = useSelector(state => state.transactionCategories);
    const { all: accounts } = useSelector(state => state.accounts);
    const [showModal, setShowModal] = useState(false);
    const [editingCat, setEditingCat] = useState(null);
    const [formData, setFormData] = useState({ name: '', type: 'both', account_id: '' });

    useEffect(() => {
        dispatch(fetchTransactionCategories());
        dispatch(fetchAllAccounts());
    }, [dispatch]);

    const handleOpenModal = (cat = null) => {
        if (cat) {
            setEditingCat(cat);
            setFormData({ name: cat.name, type: cat.type, account_id: cat.account_id || '' });
        } else {
            setEditingCat(null);
            setFormData({ name: '', type: 'both', account_id: '' });
        }
        setShowModal(true);
    };

    const handleImport = async (data) => {
        toast.info(`Importing ${data.length} categories...`);
        // Basic import logic: just show what we would do
        console.log('Import data:', data);
        toast.success('Import completed (preview in console)');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCat) {
                await apiFetch(`/api/transaction-categories/${editingCat.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(formData)
                });
                toast.success('Category updated successfully');
            } else {
                await apiFetch('/api/transaction-categories', {
                    method: 'POST',
                    body: JSON.stringify(formData)
                });
                toast.success('Category created successfully');
            }
            setShowModal(false);
            dispatch(fetchTransactionCategories());
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Failed to save category');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await dispatch(deleteTransactionCategory(id)).unwrap();
                toast.success('Category deleted successfully');
            } catch (error) {
                toast.error(error.message || 'Failed to delete category');
            }
        }
    };

    const columns = React.useMemo(() => [
        {
            header: 'Category Name',
            accessorKey: 'name',
            cell: info => (
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded">
                        <Tag className="w-4 h-4 text-slate-500" />
                    </div>
                    <span className="text-sm font-bold text-slate-800 dark:text-white">{info.getValue()}</span>
                </div>
            )
        },
        {
            header: 'Type',
            accessorKey: 'type',
            cell: info => {
                const type = info.getValue();
                switch (type) {
                    case 'income': return (
                        <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[10px] uppercase tracking-widest bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded w-fit">
                            <TrendingUp className="w-3 h-3" />
                            Income
                        </div>
                    );
                    case 'expense': return (
                        <div className="flex items-center gap-1.5 text-rose-600 font-bold text-[10px] uppercase tracking-widest bg-rose-50 dark:bg-rose-500/10 px-2 py-1 rounded w-fit">
                            <TrendingDown className="w-3 h-3" />
                            Expense
                        </div>
                    );
                    default: return (
                        <div className="flex items-center gap-1.5 text-indigo-600 font-bold text-[10px] uppercase tracking-widest bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded w-fit">
                            <ArrowLeftRight className="w-3 h-3" />
                            Both
                        </div>
                    );
                }
            }
        },
        {
            header: 'Linked Account',
            accessorKey: 'account.name',
            cell: info => {
                const cat = info.row.original;
                return cat.account ? (
                    <div className="flex items-center gap-2">
                        <Landmark className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.5 rounded">
                            {cat.account.code}
                        </span>
                        <span className="text-sm text-slate-600 dark:text-slate-400">{cat.account.name}</span>
                    </div>
                ) : (
                    <span className="text-xs italic text-slate-400">Not linked</span>
                );
            }
        },
        {
            header: 'Actions',
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
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Transaction Categories</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Organize your finances with custom categories mapped to COA.</p>
                </div>
            </div>

            <DataTable 
                columns={columns} 
                data={categories} 
                loading={loading}
                onImport={handleImport}
                exportFileName="transaction-categories"
                actions={
                    <button 
                        onClick={() => handleOpenModal()}
                        className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-sm text-sm font-semibold transition-all shadow-sm"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Category
                    </button>
                }
            />

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-sm shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="font-bold text-slate-800 dark:text-white">{editingCat ? 'Edit Category' : 'New Category'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category Name</label>
                                <input 
                                    type="text"
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-sm px-4 py-2.5 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    placeholder="e.g. Maintenance"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Transaction Type</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['income', 'expense', 'both'].map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setFormData({...formData, type})}
                                            className={`py-2 text-xs font-bold uppercase rounded-sm border transition-all ${
                                                formData.type === type 
                                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20' 
                                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-indigo-300'
                                            }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">COA Account Mapping</label>
                                <select 
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-sm px-4 py-2.5 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={formData.account_id}
                                    onChange={e => setFormData({...formData, account_id: e.target.value})}
                                >
                                    <option value="" disabled>Select Account</option>
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>
                                    ))}
                                </select>
                                <p className="mt-1 text-[10px] text-slate-400">This account will be credited (for income) or debited (for expense).</p>
                            </div>
                            <div className="pt-4">
                                <button 
                                    type="submit"
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-sm shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                                >
                                    {editingCat ? 'Update Category' : 'Create Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionCategoryList;
