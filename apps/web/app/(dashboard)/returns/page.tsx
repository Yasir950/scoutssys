'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/axios';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils/format';
import { RotateCcw, Search } from 'lucide-react';

const CONDITIONS = ['GOOD', 'DAMAGED', 'LOST'] as const;

interface IssuedItem {
  id: string;
  inventoryItem: { tagNumber: string; name: string; originalPrice: number };
  issuedAt: string;
  returnedAt: string | null;
}

interface ItemReturn { issuedItemId: string; condition: typeof CONDITIONS[number]; notes?: string }

export default function ReturnsPage() {
  const [scoutId, setScoutId] = useState('');
  const [items, setItems] = useState<IssuedItem[]>([]);
  const [returnData, setReturnData] = useState<Record<string, ItemReturn>>({});
  const qc = useQueryClient();

  const loadItems = async () => {
    if (!scoutId.trim()) return;
    try {
      const res = await apiClient.get(`/returns/${scoutId}`);
      const allItems = (res.data.data as IssuedItem[]).filter((i) => !i.returnedAt);
      setItems(allItems);
      const initial: Record<string, ItemReturn> = {};
      allItems.forEach((i) => { initial[i.id] = { issuedItemId: i.id, condition: 'GOOD' }; });
      setReturnData(initial);
    } catch {
      toast.error('Scout not found or no issued items');
    }
  };

  const processReturn = useMutation({
    mutationFn: () => apiClient.post('/returns', { scoutId, items: Object.values(returnData) }),
    onSuccess: () => {
      toast.success('Returns processed successfully');
      setItems([]);
      setReturnData({});
      setScoutId('');
      qc.invalidateQueries({ queryKey: ['inventory'] });
    },
    onError: (err: { response?: { data?: { error?: { message?: string } } } }) => {
      toast.error(err.response?.data?.error?.message ?? 'Failed to process returns');
    },
  });

  const estimatedFines = Object.values(returnData).reduce((sum, rd) => {
    if (rd.condition === 'GOOD') return sum;
    const item = items.find((i) => i.id === rd.issuedItemId);
    if (!item) return sum;
    return sum + Number(item.inventoryItem.originalPrice) * 1.05;
  }, 0);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Process Returns</h1>

      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h2 className="font-semibold text-slate-900">Find Scout</h2>
        <div className="flex gap-3">
          <input value={scoutId} onChange={(e) => setScoutId(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && loadItems()} placeholder="Enter Scout ID (cuid)..." className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          <button onClick={loadItems} className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition">
            <Search className="w-4 h-4" /> Load Items
          </button>
        </div>
      </div>

      {items.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h2 className="font-semibold text-slate-900">Active Issued Items ({items.length})</h2>
          <div className="space-y-3">
            {items.map((item) => {
              const rd = returnData[item.id];
              const isDamagedOrLost = rd?.condition !== 'GOOD';
              const fine = isDamagedOrLost ? Number(item.inventoryItem.originalPrice) * 1.05 : 0;

              return (
                <div key={item.id} className="border border-slate-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-semibold text-primary-600">{item.inventoryItem.tagNumber}</span>
                    <span className="font-medium text-slate-900">{item.inventoryItem.name}</span>
                    <span className="ml-auto text-sm text-slate-500">{formatCurrency(item.inventoryItem.originalPrice)}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="text-xs text-slate-500 mb-1 block">Return Condition</label>
                      <select
                        value={rd?.condition ?? 'GOOD'}
                        onChange={(e) => setReturnData((d) => ({ ...d, [item.id]: { ...d[item.id]!, condition: e.target.value as typeof CONDITIONS[number] } }))}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    {isDamagedOrLost && (
                      <div className="text-right">
                        <span className="text-xs text-red-500 block">Estimated Fine</span>
                        <span className="font-semibold text-red-600">{formatCurrency(fine)}</span>
                      </div>
                    )}
                  </div>
                  <input
                    value={rd?.notes ?? ''}
                    onChange={(e) => setReturnData((d) => ({ ...d, [item.id]: { ...d[item.id]!, notes: e.target.value } }))}
                    placeholder="Notes (optional)"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none"
                  />
                </div>
              );
            })}
          </div>

          {estimatedFines > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center justify-between">
              <span className="text-sm text-red-700 font-medium">Total Estimated Fines:</span>
              <span className="font-bold text-red-700">{formatCurrency(estimatedFines)}</span>
            </div>
          )}

          <button
            onClick={() => processReturn.mutate()}
            disabled={processReturn.isPending}
            className="w-full inline-flex items-center justify-center gap-2 bg-amber-600 text-white py-3 rounded-xl font-semibold hover:bg-amber-700 transition disabled:opacity-60"
          >
            {processReturn.isPending ? <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <RotateCcw className="w-5 h-5" />}
            Process {items.length} Return{items.length !== 1 ? 's' : ''}
          </button>
        </div>
      )}
    </div>
  );
}
