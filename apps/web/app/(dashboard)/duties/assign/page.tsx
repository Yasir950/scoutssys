'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AssignDutySchema, AssignDutyInput } from '@scouts/shared';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/axios';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Check, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

const SHIFTS = ['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT', 'FULL_DAY'] as const;

export default function AssignDutyPage() {
  const router = useRouter();
  const qc = useQueryClient();

  const { data: departments } = useQuery({
    queryKey: ['duty-departments'],
    queryFn: async () => {
      const res = await apiClient.get('/duties/departments');
      return res.data.data as Array<{ id: string; name: string }>;
    },
  });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AssignDutyInput>({
    resolver: zodResolver(AssignDutySchema),
  });

  const assign = useMutation({
    mutationFn: (data: AssignDutyInput) => apiClient.post('/duties/assign', data),
    onSuccess: () => {
      toast.success('Duty assigned successfully');
      qc.invalidateQueries({ queryKey: ['duties'] });
      router.push('/duties');
    },
    onError: (err: { response?: { data?: { error?: { message?: string } } } }) => {
      toast.error(err.response?.data?.error?.message ?? 'Failed to assign duty');
    },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/duties" className="p-2 hover:bg-slate-100 rounded-lg transition">
          <ChevronLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Assign Duty</h1>
      </div>

      <form onSubmit={handleSubmit((d) => assign.mutate(d))} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
       <div>
  <label className="block text-sm font-medium text-slate-700 mb-1">Registration Number *</label>
  <input {...register('registrationNumber')} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="SDMS_2026_00001" />
  {errors.registrationNumber && <p className="text-xs text-red-500 mt-1">{errors.registrationNumber.message}</p>}
</div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Department *</label>
          <select {...register('departmentId')} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">Select department...</option>
            {(departments ?? []).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          {errors.departmentId && <p className="text-xs text-red-500 mt-1">{errors.departmentId.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Gate / Point *</label>
            <input {...register('gateName')} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Gate A" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Shift *</label>
            <select {...register('shift')} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">Select shift...</option>
              {SHIFTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Reporting Time *</label>
            <input {...register('reportingTime')} type="time" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Incharge Name *</label>
            <input {...register('inchargeName')} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Captain Ahmed" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
          <textarea {...register('notes')} rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>

        <button type="submit" disabled={isSubmitting || assign.isPending} className="w-full inline-flex items-center justify-center gap-2 bg-primary-500 text-white py-2.5 rounded-lg font-medium hover:bg-primary-600 transition disabled:opacity-60">
          {assign.isPending ? <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
          Assign Duty
        </button>
      </form>
    </div>
  );
}
