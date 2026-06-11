'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/axios';
import { Users, Package, RotateCcw, AlertCircle, UserPlus, ArrowUpFromLine } from 'lucide-react';
import { SkeletonTable } from '@/components/shared/SkeletonTable';
import Link from 'next/link';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { formatDate, formatCurrency } from '@/lib/utils/format';

interface DashboardStats {
  totalScouts: number;
  itemsIssued: number;
  pendingReturns: number;
  totalFines: number;
  recentRegistrations: Array<{ date: string; count: number }>;
  issuedByDepartment: Array<{ department: string; count: number }>;
  recentActivity: Array<{ type: string; description: string; time: string }>;
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const res = await apiClient.get('/reports/dashboard');
      return res.data.data as DashboardStats;
    },
    staleTime: 60_000,
  });

  const statCards = [
    { label: 'Total Scouts', value: stats?.totalScouts ?? 0, icon: Users, color: 'bg-blue-500', href: '/scouts' },
    { label: 'Items Issued', value: stats?.itemsIssued ?? 0, icon: Package, color: 'bg-green-500', href: '/issue' },
    { label: 'Pending Returns', value: stats?.pendingReturns ?? 0, icon: RotateCcw, color: 'bg-amber-500', href: '/returns' },
    { label: 'Total Fines (PKR)', value: stats?.totalFines ? formatCurrency(stats.totalFines) : 'Rs. 0', icon: AlertCircle, color: 'bg-red-500', href: '/fines' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-xl border border-slate-200 p-5 h-28" />
          ))}
        </div>
        <SkeletonTable rows={5} cols={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/scouts/new" className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition">
            <UserPlus className="w-4 h-4" /> Register Scout
          </Link>
          <Link href="/issue" className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition">
            <ArrowUpFromLine className="w-4 h-4" /> Issue Item
          </Link>
          <Link href="/returns" className="inline-flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-700 transition">
            <RotateCcw className="w-4 h-4" /> Process Return
          </Link>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} href={href} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
              </div>
              <div className={`${color} p-3 rounded-xl group-hover:scale-110 transition`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Registrations Over Time</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={stats?.recentRegistrations ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#1E3A5F" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Items Issued by Department</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats?.issuedByDepartment ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="department" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {(stats?.recentActivity ?? []).length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">No recent activity</p>
          ) : (
            (stats?.recentActivity ?? []).map((activity, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-slate-700">{activity.description}</p>
                  <p className="text-xs text-slate-400">{activity.time}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
