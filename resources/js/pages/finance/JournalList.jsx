import React, { useEffect, useState } from 'react';
import apiFetch from '../../utils/api';
import { FileText, ChevronDown, ChevronRight } from 'lucide-react';
import Badge from '../../components/Badge';
import DataTable from '../../components/DataTable';

const JournalList = () => {
    const [journals, setJournals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState({
        currentPage: 1,
        lastPage: 1,
        pageSize: 10,
        total: 0
    });

    const fetchJournals = async (page = 1, perPage = 10, querySearch = '') => {
        setLoading(true);
        try {
            const res = await apiFetch(`/api/journals?page=${page}&per_page=${perPage}&search=${querySearch}`);
            setJournals(res.data || []);
            setPagination({
                currentPage: res.current_page || 1,
                lastPage: res.last_page || 1,
                pageSize: Number(res.per_page || perPage),
                total: res.total || 0
            });
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchJournals(1, pagination.pageSize, search);
    }, [search]);

    const columns = [
        {
            id: 'expander',
            header: () => null,
            cell: ({ row }) => (
                <button
                    onClick={row.getToggleExpandedHandler()}
                    className="text-slate-400 hover:text-indigo-600 transition-colors"
                >
                    {row.getIsExpanded() ? (
                        <ChevronDown className="w-5 h-5" />
                    ) : (
                        <ChevronRight className="w-5 h-5" />
                    )}
                </button>
            ),
        },
        {
            header: 'Journal Entry',
            accessorKey: 'description',
            cell: ({ row, getValue }) => (
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <FileText className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-800 dark:text-white">{getValue()}</span>
                            <Badge variant="primary">{row.original.reference_type?.split('\\').pop()}</Badge>
                        </div>
                        <span className="text-xs text-slate-500">{new Date(row.original.date).toLocaleDateString()}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Date',
            accessorKey: 'date',
            cell: ({ getValue }) => (
                <span className="text-sm text-slate-600 dark:text-slate-400">
                    {new Date(getValue()).toLocaleDateString()}
                </span>
            )
        },
        {
            header: 'Total Amount',
            accessorFn: row => row.entries.reduce((sum, e) => sum + Number(e.debit), 0),
            cell: ({ getValue }) => (
                <span className="text-sm font-bold text-slate-800 dark:text-white">
                    Rp {Number(getValue()).toLocaleString()}
                </span>
            )
        }
    ];

    const renderSubComponent = ({ row }) => (
        <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 p-4">
            <table className="w-full text-left">
                <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <th className="px-6 py-3">Account</th>
                        <th className="px-6 py-3 text-right">Debit</th>
                        <th className="px-6 py-3 text-right">Credit</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {row.original.entries.map(entry => (
                        <tr key={entry.id}>
                            <td className="px-6 py-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono text-slate-500">{entry.account.code}</span>
                                    <span className="text-sm text-slate-700 dark:text-slate-300">{entry.account.name}</span>
                                </div>
                            </td>
                            <td className="px-6 py-3 text-right">
                                {Number(entry.debit) > 0 ? (
                                    <span className="text-sm font-bold text-emerald-600">Rp {Number(entry.debit).toLocaleString()}</span>
                                ) : '-'}
                            </td>
                            <td className="px-6 py-3 text-right">
                                {Number(entry.credit) > 0 ? (
                                    <span className="text-sm font-bold text-indigo-600">Rp {Number(entry.credit).toLocaleString()}</span>
                                ) : '-'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">General Ledger</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">View all accounting journal entries.</p>
            </div>

            <DataTable 
                columns={columns}
                data={journals}
                loading={loading}
                renderSubComponent={renderSubComponent}
                searchPlaceholder="Search journals..."
                exportFileName="general-ledger"
                manualPagination={true}
                pageCount={pagination.lastPage}
                paginationState={{
                    pageIndex: pagination.currentPage - 1,
                    pageSize: pagination.pageSize
                }}
                onPaginationChange={(updater) => {
                    const next = typeof updater === 'function' ? updater({ pageIndex: pagination.currentPage - 1, pageSize: pagination.pageSize }) : updater;
                    fetchJournals(next.pageIndex + 1, next.pageSize, search);
                }}
                onSearchChange={(val) => setSearch(val)}
            />
        </div>
    );
};

export default JournalList;
