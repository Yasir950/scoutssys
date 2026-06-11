'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/axios';
import { SkeletonTable } from '@/components/shared/SkeletonTable';
import { formatDateTime } from '@/lib/utils/format';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDebounce } from '@/lib/hooks/useDebounce';

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  userId: string | null;
  user: { name: string; email: string } | null;
  ipAddress: string | null;
  userAgent: string | null;
  changes: Record<string, unknown> | null;
  createdAt: string;
}

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
  LOGIN: 'bg-purple-100 text-purple-700',
  LOGOUT: 'bg-slate-100 text-slate-600',
  EXPORT: 'bg-yellow-100 text-yellow-700',
};

export default function AuditLogPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const pageSize = 25;

  const { data, isLoading } = useQuery({
    queryKey: ['audit-log', page, debouncedSearch, actionFilter],
    queryFn: async () => {
      const res = await apiClient.get('/settings/audit', {
        params: { page, limit: pageSize, search: debouncedSearch || undefined, action: actionFilter || undefined },
      });
      return res.data as { data: AuditLog[]; meta: { total: number; page: number; totalPages: number } };
    },
  });

  const logs = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Audit Log</h1>
        <p className="text-sm text-slate-500 mt-1">All system actions and changes</p>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by user or entity..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none"
        >
          <option value="">All Actions</option>
          {['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT'].map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      {isLoading ? <SkeletonTable rows={10} cols={6} /> : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Timestamp', 'User', 'Action', 'Entity', 'Entity ID', 'IP Address'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400 text-sm">No audit logs found</td></tr>
              ) : logs.map((log, i) => (
                <tr key={log.id} className={`border-b border-slate-100 hover:bg-slate-50 ${i % 2 ? 'bg-slate-50/30' : ''}`}>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{formatDateTime(log.createdAt)}</td>
                  <td className="px-4 py-3">
                    {log.user ? (
                      <div>
                        <div className="font-medium text-slate-800">{log.user.name}</div>
                        <div className="text-xs text-slate-400">{log.user.email}</div>
                      </div>
                    ) : <span className="text-slate-400 italic">System</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ACTION_COLORS[log.action] ?? 'bg-slate-100 text-slate-600'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{log.entity}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{log.entityId ? log.entityId.slice(0, 8) + '…' : '—'}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">{log.ipAddress ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, meta.total)} of {meta.total} entries</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => p - 1)} disabled={page === 1} className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-40">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 bg-slate-100 rounded font-medium">{page}</span>
            <button onClick={() => setPage((p) => p + 1)} disabled={page === meta.totalPages} className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-40">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
