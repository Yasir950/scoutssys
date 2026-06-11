'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/axios';
import { SkeletonTable } from '@/components/shared/SkeletonTable';
import { BarChart3, Download, FileSpreadsheet } from 'lucide-react';

const REPORTS = [
  { key: 'scout-registrations', label: 'Scout Registrations' },
  { key: 'items-issued', label: 'Items Issued' },
  { key: 'pending-returns', label: 'Pending Returns' },
  { key: 'fines-pending', label: 'Pending Fines' },
  { key: 'fines-paid', label: 'Paid Fines' },
  { key: 'inventory-by-category', label: 'Inventory by Category' },
  { key: 'items-by-condition', label: 'Items by Condition' },
  { key: 'cabin-inventory', label: 'Cabin Inventory' },
  { key: 'daily-activity', label: 'Daily Activity' },
  { key: 'department-duty-summary', label: 'Department Duty Summary' },
  { key: 'guarantors', label: 'Guarantors' },
  { key: 'exchange-history', label: 'Exchange History' },
  { key: 'audit-log', label: 'Audit Log' },
];

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState(REPORTS[0]!.key);

  const { data, isLoading } = useQuery({
    queryKey: ['report', activeReport],
    queryFn: async () => {
      const res = await apiClient.get(`/reports/${activeReport}`);
      return res.data.data;
    },
    staleTime: 120_000,
  });

  const downloadExcel = () => {
    const url = `${process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001'}/api/v1/reports/${activeReport}/export`;
    window.open(url, '_blank');
  };

  const rows = Array.isArray(data) ? data as Record<string, unknown>[] : [];
  const columns = rows.length > 0 ? Object.keys(rows[0]!).slice(0, 8) : [];

  return (
    <div className="flex gap-6 h-full">
      {/* Sidebar */}
      <div className="w-56 shrink-0">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Report Types</p>
          </div>
          <nav className="py-2">
            {REPORTS.map((r) => (
              <button
                key={r.key}
                onClick={() => setActiveReport(r.key)}
                className={`w-full text-left px-4 py-2.5 text-sm transition ${activeReport === r.key ? 'bg-primary-50 text-primary-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                {r.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Report content */}
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">
            {REPORTS.find((r) => r.key === activeReport)?.label}
          </h1>
          <div className="flex gap-2">
            <button onClick={downloadExcel} className="inline-flex items-center gap-2 border border-slate-300 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition">
              <FileSpreadsheet className="w-4 h-4 text-green-600" /> Export Excel
            </button>
          </div>
        </div>

        {isLoading ? (
          <SkeletonTable rows={8} cols={5} />
        ) : rows.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <BarChart3 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No data available for this report</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {columns.map((col) => (
                    <th key={col} className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                      {col.replace(/([A-Z])/g, ' $1').trim()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 100).map((row, i) => (
                  <tr key={i} className={`border-b border-slate-100 hover:bg-slate-50 ${i % 2 ? 'bg-slate-50/50' : ''}`}>
                    {columns.map((col) => (
                      <td key={col} className="px-4 py-3 text-slate-700 max-w-xs truncate">
                        {typeof row[col] === 'object' ? JSON.stringify(row[col]).slice(0, 50) : String(row[col] ?? '—')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 100 && (
              <div className="px-4 py-2 text-xs text-slate-400 border-t border-slate-100">
                Showing first 100 of {rows.length} rows. Export to Excel for full data.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
