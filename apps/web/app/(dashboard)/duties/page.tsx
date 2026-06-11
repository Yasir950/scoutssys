'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/axios';
import { SkeletonTable } from '@/components/shared/SkeletonTable';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatDate, formatShift } from '@/lib/utils/format';
import { Shield, Plus } from 'lucide-react';
import Link from 'next/link';

export default function DutiesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['duties'],
    queryFn: async () => {
      const res = await apiClient.get('/duties');
      return res.data.data as Array<{
        id: string;
        scout: { fullName: string; registrationNumber: string };
        department: { name: string };
        gateName: string;
        shift: string;
        reportingTime: string;
        inchargeName: string;
        assignedAt: string;
      }>;
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Duty Assignments</h1>
        <Link href="/duties/assign" className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition">
          <Plus className="w-4 h-4" /> Assign Duty
        </Link>
      </div>

      {isLoading ? <SkeletonTable rows={8} cols={6} /> : (data ?? []).length === 0 ? (
        <EmptyState icon={Shield} title="No duty assignments" description="Assign scouts to duty stations" action={{ label: 'Assign Duty', href: '/duties/assign' }} />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Scout', 'Reg. No.', 'Department', 'Gate', 'Shift', 'Reporting Time', 'Incharge', 'Date'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((d, i) => (
                <tr key={d.id} className={`border-b border-slate-100 hover:bg-slate-50 ${i % 2 ? 'bg-slate-50/50' : ''}`}>
                  <td className="px-4 py-3 font-medium">{d.scout?.fullName}</td>
                  <td className="px-4 py-3 font-mono text-xs">{d.scout?.registrationNumber}</td>
                  <td className="px-4 py-3">{d.department?.name}</td>
                  <td className="px-4 py-3">{d.gateName}</td>
                  <td className="px-4 py-3">{formatShift(d.shift)}</td>
                  <td className="px-4 py-3">{d.reportingTime}</td>
                  <td className="px-4 py-3">{d.inchargeName}</td>
                  <td className="px-4 py-3">{formatDate(d.assignedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
