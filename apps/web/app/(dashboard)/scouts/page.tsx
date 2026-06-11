'use client';

import { useState } from 'react';
import { useScouts } from '@/lib/api/scouts';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { SkeletonTable } from '@/components/shared/SkeletonTable';
import { EmptyState } from '@/components/shared/EmptyState';
import { ScoutDTO } from '@scouts/shared';
import { formatDate, formatBloodGroup } from '@/lib/utils/format';
import { Users, Plus, Search, Eye } from 'lucide-react';
import Link from 'next/link';
import {
  useReactTable, getCoreRowModel, flexRender,
  createColumnHelper, getSortedRowModel, SortingState,
} from '@tanstack/react-table';

const helper = createColumnHelper<ScoutDTO>();

const COLUMNS = [
  helper.accessor('registrationNumber', { header: 'Reg. No.', cell: (i) => <span className="font-mono text-xs">{i.getValue()}</span> }),
  helper.accessor('fullName', { header: 'Full Name' }),
  helper.accessor('contactNumber', { header: 'Contact' }),
  helper.accessor('city', { header: 'City' }),
  helper.accessor('unitName', { header: 'Unit' }),
  helper.accessor('bloodGroup', { header: 'Blood Group', cell: (i) => formatBloodGroup(i.getValue()) }),
  helper.accessor('registeredAt', { header: 'Registered', cell: (i) => formatDate(i.getValue()) }),
  helper.display({
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <Link href={`/scouts/${row.original.id}`} className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
        <Eye className="w-3.5 h-3.5" /> View
      </Link>
    ),
  }),
];

export default function ScoutsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([]);
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useScouts({ page, limit: 20, search: debouncedSearch });

  const table = useReactTable({
    data: data?.data ?? [],
    columns: COLUMNS,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: data?.meta ? Math.ceil(data.meta.total / data.meta.limit) : 0,
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Scouts</h1>
        <Link href="/scouts/new" className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition">
          <Plus className="w-4 h-4" /> Register Scout
        </Link>
      </div>

      <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-3 py-2 w-full max-w-md">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by name, reg#, contact, CNIC..."
          className="flex-1 text-sm focus:outline-none"
        />
      </div>

      {isLoading ? (
        <SkeletonTable rows={8} cols={7} />
      ) : (data?.data ?? []).length === 0 ? (
        <EmptyState icon={Users} title="No scouts found" description="Register your first scout to get started" action={{ label: 'Register Scout', href: '/scouts/new' }} />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => (
                    <th key={header.id} className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide cursor-pointer select-none" onClick={header.column.getToggleSortingHandler()}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row, i) => (
                <tr key={row.id} className={`border-b border-slate-100 hover:bg-slate-50 transition ${i % 2 === 0 ? '' : 'bg-slate-50/50'}`}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-slate-700">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="px-4 py-3 flex items-center justify-between border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Showing {((page - 1) * 20) + 1}–{Math.min(page * 20, data?.meta?.total ?? 0)} of {data?.meta?.total ?? 0} scouts
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50">Previous</button>
              <button onClick={() => setPage((p) => p + 1)} disabled={page >= (data?.meta?.totalPages ?? 1)} className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50">Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
