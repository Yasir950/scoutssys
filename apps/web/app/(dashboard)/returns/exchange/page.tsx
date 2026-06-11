'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/axios';
import { toast } from 'sonner';
import { Search, ArrowLeftRight, CheckCircle } from 'lucide-react';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { formatCurrency } from '@/lib/utils/format';

interface Scout {
  id: string;
  registrationNumber: string;
  fullName: string;
}

interface IssuedItem {
  id: string;
  inventoryItem: { id: string; tagNumber: string; name: string; price: number };
}

export default function ExchangePage() {
  const [scoutSearch, setScoutSearch] = useState('');
  const [selectedScout, setSelectedScout] = useState<Scout | null>(null);
  const [selectedIssuedItemId, setSelectedIssuedItemId] = useState('');
  const [newTagNumber, setNewTagNumber] = useState('');
  const [reason, setReason] = useState('DAMAGED');
  const [notes, setNotes] = useState('');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const debouncedSearch = useDebounce(scoutSearch, 300);
  const qc = useQueryClient();

  const { data: scouts } = useQuery({
    queryKey: ['scouts-search', debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch) return [];
      const res = await apiClient.get('/scouts', { params: { search: debouncedSearch, limit: 10 } });
      return res.data.data as Scout[];
    },
    enabled: !!debouncedSearch,
  });

  const { data: issuedItems } = useQuery({
    queryKey: ['scout-issued', selectedScout?.id],
    queryFn: async () => {
      const res = await apiClient.get(`/scouts/${selectedScout!.id}/issued`);
      return res.data.data as IssuedItem[];
    },
    enabled: !!selectedScout,
  });

  const { data: newItem } = useQuery({
    queryKey: ['tag-lookup', newTagNumber],
    queryFn: async () => {
      const res = await apiClient.get(`/inventory/tag/${newTagNumber}`);
      return res.data.data as { id: string; tagNumber: string; name: string; price: number; status: string };
    },
    enabled: newTagNumber.length >= 3,
  });

  const exchangeMutation = useMutation({
    mutationFn: () => apiClient.post('/exchange', {
      issuedItemId: selectedIssuedItemId,
      newInventoryItemId: newItem!.id,
      reason,
      notes: notes || undefined,
    }),
    onSuccess: () => {
      toast.success('Exchange recorded successfully');
      qc.invalidateQueries({ queryKey: ['scout-issued'] });
      setStep(3);
    },
    onError: (err: { response?: { data?: { error?: { message?: string } } } }) =>
      toast.error(err.response?.data?.error?.message ?? 'Exchange failed'),
  });

  const selectedIssued = issuedItems?.find((i) => i.id === selectedIssuedItemId);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Equipment Exchange</h1>
        <p className="text-sm text-slate-500 mt-1">Replace a damaged or lost item with a new one</p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2 text-sm">
        {(['Select Scout', 'Select Items', 'Confirm'] as const).map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === i + 1 ? 'bg-primary-500 text-white' : step > i + 1 ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
              {step > i + 1 ? '✓' : i + 1}
            </div>
            <span className={step === i + 1 ? 'font-medium text-slate-900' : 'text-slate-500'}>{label}</span>
            {i < 2 && <div className="w-8 h-0.5 bg-slate-200" />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-semibold text-slate-800">Find Scout</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={scoutSearch}
              onChange={(e) => setScoutSearch(e.target.value)}
              placeholder="Search by name, reg# or CNIC..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          {scouts && scouts.length > 0 && (
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              {scouts.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setSelectedScout(s); setScoutSearch(s.fullName); setStep(2); }}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-b-0"
                >
                  <span className="font-medium text-slate-800">{s.fullName}</span>
                  <span className="ml-2 text-sm text-slate-500">{s.registrationNumber}</span>
                </button>
              ))}
            </div>
          )}
          {debouncedSearch && scouts?.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-4">No scouts found</p>
          )}
        </div>
      )}

      {step === 2 && selectedScout && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800">{selectedScout.fullName} — {selectedScout.registrationNumber}</span>
            <button onClick={() => { setSelectedScout(null); setStep(1); }} className="text-xs text-blue-600 hover:underline">Change</button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h2 className="font-semibold text-slate-800">Item to Exchange (Old Item)</h2>
            {!issuedItems?.length ? (
              <p className="text-sm text-slate-500">No issued items found for this scout</p>
            ) : (
              <div className="space-y-2">
                {issuedItems.map((item) => (
                  <label key={item.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${selectedIssuedItemId === item.id ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <input type="radio" name="issued" value={item.id} checked={selectedIssuedItemId === item.id} onChange={() => setSelectedIssuedItemId(item.id)} className="text-primary-500" />
                    <div>
                      <div className="font-medium text-sm text-slate-800">{item.inventoryItem.name}</div>
                      <div className="text-xs text-slate-500">Tag: {item.inventoryItem.tagNumber} · {formatCurrency(item.inventoryItem.price)}</div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {selectedIssuedItemId && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
              <h2 className="font-semibold text-slate-800">Replacement Item (New Item)</h2>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New Item Tag Number</label>
                <input
                  type="text"
                  value={newTagNumber}
                  onChange={(e) => setNewTagNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. TN-0042"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {newItem && (
                  <div className={`mt-2 p-3 rounded-lg text-sm ${newItem.status === 'AVAILABLE' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                    {newItem.status === 'AVAILABLE'
                      ? `✓ ${newItem.name} · ${formatCurrency(newItem.price)} · Available`
                      : `✗ ${newItem.name} is ${newItem.status} — cannot exchange`}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Exchange Reason</label>
                <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none">
                  <option value="DAMAGED">Damaged</option>
                  <option value="DEFECTIVE">Defective</option>
                  <option value="LOST">Lost</option>
                  <option value="UPGRADE">Upgrade</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes (optional)</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none resize-none" placeholder="Additional details..." />
              </div>

              <button
                onClick={() => exchangeMutation.mutate()}
                disabled={!newItem || newItem.status !== 'AVAILABLE' || exchangeMutation.isPending}
                className="w-full py-2.5 bg-primary-500 text-white rounded-lg font-medium text-sm hover:bg-primary-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <ArrowLeftRight className="w-4 h-4" />
                {exchangeMutation.isPending ? 'Processing...' : 'Confirm Exchange'}
              </button>
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-4">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Exchange Recorded</h2>
          <p className="text-slate-500 text-sm">
            {selectedIssued?.inventoryItem.name ?? 'Item'} has been replaced.
            Old item marked as {reason.toLowerCase()}, new item issued to {selectedScout?.fullName}.
          </p>
          <button
            onClick={() => { setStep(1); setSelectedScout(null); setSelectedIssuedItemId(''); setNewTagNumber(''); setNotes(''); setScoutSearch(''); }}
            className="mt-4 px-6 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600"
          >
            New Exchange
          </button>
        </div>
      )}
    </div>
  );
}
