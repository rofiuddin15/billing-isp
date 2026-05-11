import React, { useState, useMemo } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getExpandedRowModel,
    flexRender,
} from '@tanstack/react-table';
import { 
    Search, 
    Download, 
    Upload, 
    ChevronLeft, 
    ChevronRight, 
    ChevronsLeft, 
    ChevronsRight,
    ArrowUpDown,
    Filter,
    ChevronDown,
} from 'lucide-react';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';

const DataTable = ({ 
    columns, 
    data, 
    loading = false, 
    onImport, 
    exportFileName = 'data-export',
    searchPlaceholder = 'Search...',
    actions,
    // Server-side props
    manualPagination = false,
    pageCount = 1,
    paginationState,
    onPaginationChange,
    onSearchChange,
    renderSubComponent,
    getRowCanExpand,
    onRowClick,
    getSubRows,
}) => {
    const [globalFilter, setGlobalFilter] = useState('');
    const [sorting, setSorting] = useState([]);
    const [expanded, setExpanded] = useState({});

    const table = useReactTable({
        data,
        columns,
        state: {
            globalFilter: paginationState ? undefined : globalFilter,
            sorting,
            ...(paginationState ? { pagination: paginationState } : {}),
            expanded,
        },
        onGlobalFilterChange: setGlobalFilter,
        onSortingChange: setSorting,
        onPaginationChange: onPaginationChange,
        onExpandedChange: setExpanded,
        ...(manualPagination ? { pageCount } : {}),
        manualPagination: manualPagination,
        getSubRows: getSubRows,
        getRowCanExpand: getRowCanExpand,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: !manualPagination ? getFilteredRowModel() : undefined,
        getPaginationRowModel: !manualPagination ? getPaginationRowModel() : undefined,
        getSortedRowModel: getSortedRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
    });

    const handleExport = () => {
        // For client side, we export filtered rows. For server side, we might need a separate API call,
        // but for now let's just export current view data.
        const rows = table.getRowModel().rows;
        const exportData = rows.map(row => {
            const obj = {};
            row.getVisibleCells().forEach(cell => {
                const header = cell.column.columnDef.header;
                if (typeof header === 'string') {
                    obj[header] = cell.getValue();
                }
            });
            return obj;
        });
        const csv = Papa.unparse(exportData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `${exportFileName}-${new Date().toISOString().split('T')[0]}.csv`);
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (file && onImport) {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    onImport(results.data);
                },
                error: (error) => {
                    console.error('Import error:', error);
                    toast.error('Failed to parse CSV');
                }
            });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        value={manualPagination ? undefined : (globalFilter ?? '')}
                        onChange={e => {
                            if (manualPagination) {
                                onSearchChange?.(e.target.value);
                            } else {
                                setGlobalFilter(e.target.value);
                            }
                        }}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        placeholder={searchPlaceholder}
                    />
                </div>
                
                <div className="flex items-center gap-2">
                    {actions}
                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
                    <button
                        onClick={handleExport}
                        className="flex items-center px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-indigo-600 rounded-sm text-sm font-bold transition-all shadow-sm"
                        title="Export to CSV"
                    >
                        <Download className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Export</span>
                    </button>
                    {onImport && (
                        <label className="flex items-center px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-indigo-600 rounded-sm text-sm font-bold cursor-pointer transition-all shadow-sm">
                            <Upload className="w-4 h-4 sm:mr-2" />
                            <span className="hidden sm:inline">Import</span>
                            <input type="file" accept=".csv" className="hidden" onChange={handleImport} />
                        </label>
                    )}
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-sm border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id} className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id} className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">
                                            {header.isPlaceholder ? null : (
                                                <div
                                                    className={`flex items-center gap-2 ${header.column.getCanSort() ? 'cursor-pointer select-none group' : ''}`}
                                                    onClick={header.column.getToggleSortingHandler()}
                                                >
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                    {header.column.getCanSort() && (
                                                        <ArrowUpDown className={`w-3 h-3 transition-opacity ${header.column.getIsSorted() ? 'opacity-100 text-indigo-600' : 'opacity-20 group-hover:opacity-100'}`} />
                                                    )}
                                                </div>
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse h-16">
                                        {columns.map((_, idx) => (
                                            <td key={idx} className="px-6 py-4">
                                                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : table.getRowModel().rows.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Filter className="w-8 h-8 text-slate-200" />
                                            <p className="text-slate-500 italic text-sm">No records found matching your criteria.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                table.getRowModel().rows.map(row => (
                                    <React.Fragment key={row.id}>
                                        <tr 
                                            onClick={() => onRowClick?.(row.original)}
                                            className={`
                                                transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0 
                                                ${onRowClick ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30' : ''}
                                                ${row.getIsExpanded() ? 'bg-slate-50/50 dark:bg-slate-800/20' : ''}
                                            `}
                                        >
                                            {row.getVisibleCells().map(cell => (
                                                <td key={cell.id} className="px-6 py-4">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </td>
                                            ))}
                                        </tr>
                                        {row.getIsExpanded() && renderSubComponent && (
                                            <tr>
                                                <td colSpan={row.getVisibleCells().length} className="px-0">
                                                    {renderSubComponent({ row })}
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                        <span>Page</span>
                        <span className="text-slate-800 dark:text-white">
                            {(table.getState().pagination?.pageIndex ?? 0) + 1} of {table.getPageCount()}
                        </span>
                        <span className="mx-2 opacity-20">|</span>
                        <span>{manualPagination ? 'Server' : 'Client'} Pagination</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400 uppercase">Rows</span>
                            <select
                                value={table.getState().pagination.pageSize}
                                onChange={e => {
                                    table.setPageSize(Number(e.target.value))
                                }}
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm text-xs font-bold px-2 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-slate-200"
                            >
                                {[10, 25, 50, 100].map(pageSize => (
                                    <option key={pageSize} value={pageSize}>
                                        {pageSize}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-1">
                        <button
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                            className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 transition-all shadow-sm"
                        >
                            <ChevronsLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 transition-all shadow-sm"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <div className="px-4 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm text-sm font-bold text-indigo-600">
                            {(table.getState().pagination?.pageIndex ?? 0) + 1}
                        </div>
                        <button
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 transition-all shadow-sm"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                            className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 transition-all shadow-sm"
                        >
                            <ChevronsRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    );
};

export default DataTable;
