import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAccounts } from '../../store/slices/accountSlice';
import DataTable from '../../components/DataTable';
import { ChevronRight, ChevronDown, Folder, FileText, Plus } from 'lucide-react';

const COAList = () => {
    const dispatch = useDispatch();
    const { tree, loading } = useSelector(state => state.accounts);

    useEffect(() => {
        dispatch(fetchAccounts());
    }, [dispatch]);

    const getTypeColor = (type) => {
        switch (type) {
            case 'asset': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400';
            case 'liability': return 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400';
            case 'equity': return 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400';
            case 'revenue': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400';
            case 'expense': return 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const columns = [
        {
            header: 'Account Code',
            accessorKey: 'code',
            cell: ({ row, getValue }) => (
                <div 
                    className="flex items-center gap-2" 
                    style={{ paddingLeft: `${row.depth * 24}px` }}
                >
                    {row.getCanExpand() ? (
                        <button
                            onClick={row.getToggleExpandedHandler()}
                            className="text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                            {row.getIsExpanded() ? (
                                <ChevronDown className="w-4 h-4" />
                            ) : (
                                <ChevronRight className="w-4 h-4" />
                            )}
                        </button>
                    ) : (
                        <div className="w-4" />
                    )}
                    {row.getCanExpand() ? (
                        <Folder className="w-4 h-4 text-indigo-500" />
                    ) : (
                        <FileText className="w-4 h-4 text-slate-400" />
                    )}
                    <span className="text-sm font-mono font-bold text-slate-600 dark:text-slate-400">
                        {getValue()}
                    </span>
                </div>
            )
        },
        {
            header: 'Account Name',
            accessorKey: 'name',
            cell: ({ row, getValue }) => (
                <span className={`text-sm font-semibold ${row.getCanExpand() ? 'text-slate-800 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                    {getValue()}
                </span>
            )
        },
        {
            header: 'Type',
            accessorKey: 'type',
            cell: ({ getValue }) => (
                <div className="text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getTypeColor(getValue())}`}>
                        {getValue()}
                    </span>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Chart of Accounts</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Manage your financial structure and account hierarchy.</p>
                </div>
                <button className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-sm text-sm font-semibold transition-all shadow-sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Account
                </button>
            </div>

            <DataTable 
                columns={columns}
                data={tree}
                loading={loading}
                getSubRows={row => row.children}
                searchPlaceholder="Search accounts..."
            />
        </div>
    );
};

export default COAList;
