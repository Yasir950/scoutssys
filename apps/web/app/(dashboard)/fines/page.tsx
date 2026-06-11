'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/axios';
import { SkeletonTable } from '@/components/shared/SkeletonTable';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatDate, formatCurrency } from '@/lib/utils/format';
import { AlertCircle, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-red-100 text-red-700',
  PAID: 'bg-green-100 text-green-700',
  WAIVED: 'bg-slate-100 text-slate-600',
};

export default function FinesPage() {
  const [status, setStatus] = useState('');
  const [payingFineId, setPayingFineId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['fines', status],
    queryFn: async () => {
      const res = await apiClient.get('/fines', { params: status ? { status } : {} });
      return res.data.data as Array<{
        id: string;
        scout: { fullName: string; registrationNumber: string };
        issuedItem: { inventoryItem: { tagNumber: string; name: string } };
        originalPrice: number;
        fineAmount: number;
        status: string;
        createdAt: string;
        paidAt: string | null;
      }>;
    },
  });

  const payFine = useMutation({
    mutationFn: (id: string) => apiClient.post(`/fines/${id}/pay`, { paymentMethod }),
    onSuccess: () => {
      toast.success('Fine marked as paid');
      qc.invalidateQueries({ queryKey: ['fines'] });
      setPayingFineId(null);
    },
    onError: () => toast.error('Failed to process payment'),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Fines</h1>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none">
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
          <option value="WAIVED">Waived</option>
        </select>
      </div>

      {isLoading ? <SkeletonTable rows={6} cols={6} /> : (data ?? []).length === 0 ? (
        <EmptyState icon={AlertCircle} title="No fines found" description="Fines are created automatically when items are returned damaged or lost" />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Scout', 'Tag #', 'Item', 'Original Price', 'Fine Amount', 'Status', 'Date', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((fine, i) => (
                <tr key={fine.id} className={`border-b border-slate-100 hover:bg-slate-50 ${i % 2 ? 'bg-slate-50/50' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="font-medium">{fine.scout?.fullName}</div>
                    <div className="text-xs font-mono text-slate-400">{fine.scout?.registrationNumber}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{fine.issuedItem?.inventoryItem?.tagNumber}</td>
                  <td className="px-4 py-3">{fine.issuedItem?.inventoryItem?.name}</td>
                  <td className="px-4 py-3">{formatCurrency(fine.originalPrice)}</td>
                  <td className="px-4 py-3 font-semibold text-red-600">{formatCurrency(fine.fineAmount)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[fine.status] ?? ''}`}>{fine.status}</span>
                  </td>
                  <td className="px-4 py-3">{formatDate(fine.createdAt)}</td>
                  <td className="px-4 py-3">
                    {fine.status === 'PENDING' && (
                      <button onClick={() => setPayingFineId(fine.id)} className="inline-flex items-center gap-1 text-sm text-green-600 hover:text-green-800 font-medium">
                        <DollarSign className="w-3.5 h-3.5" /> Pay
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {payingFineId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Process Payment</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none">
                {['CASH', 'UBL', 'JAZZCASH', 'EASYPAISA'].map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setPayingFineId(null)} className="flex-1 py-2 border border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={() => payFine.mutate(payingFineId)} disabled={payFine.isPending} className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                {payFine.isPending ? 'Processing...' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
