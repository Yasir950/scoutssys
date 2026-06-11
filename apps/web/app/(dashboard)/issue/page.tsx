'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/axios';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils/format';
import { Plus, Trash2, ArrowUpFromLine, Search } from 'lucide-react';

interface TagItem { id: string; tagNumber: string; name: string; originalPrice: number; category: { name: string }; status: string }
interface ScoutResult { id: string; fullName: string; registrationNumber: string; photoPath?: string }

export default function IssuePage() {
  const [regNumber, setRegNumber] = useState('');
  const [scoutResult, setScoutResult] = useState<ScoutResult | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [basket, setBasket] = useState<TagItem[]>([]);
  const [guarantor, setGuarantor] = useState({ fullName: '', contactNumber: '', cnicNumber: '', depositedItemDescription: '' });
  const qc = useQueryClient();

  const searchScout = async () => {
    if (!regNumber.trim()) return;
    try {
      const res = await apiClient.get('/scouts', { params: { search: regNumber, limit: 1 } });
      const scouts = res.data.data as ScoutResult[];
      if (scouts.length > 0) {
        setScoutResult(scouts[0]!);
      } else {
        toast.error('Scout not found');
      }
    } catch {
      toast.error('Failed to search scout');
    }
  };

  const addTag = async () => {
    if (!tagInput.trim()) return;
    if (basket.some((i) => i.tagNumber === tagInput)) { toast.error('Tag already in basket'); return; }
    try {
      const res = await apiClient.get(`/inventory/tag/${tagInput}`);
      const item = res.data.data as TagItem;
      if (item.status !== 'AVAILABLE') { toast.error(`Item ${tagInput} is not available`); return; }
      setBasket((b) => [...b, item]);
      setTagInput('');
    } catch {
      toast.error(`Tag ${tagInput} not found`);
    }
  };

  const totalValue = basket.reduce((s, i) => s + i.originalPrice, 0);
  const requiresGuarantor = totalValue >= 500;

  const issue = useMutation({
    mutationFn: () => apiClient.post('/issue', {
      scoutId: scoutResult?.id,
      tagNumbers: basket.map((i) => i.tagNumber),
      ...(requiresGuarantor && { guarantor }),
    }),
    onSuccess: () => {
      toast.success('Items issued successfully');
      setBasket([]);
      setScoutResult(null);
      setRegNumber('');
      qc.invalidateQueries({ queryKey: ['inventory'] });
    },
    onError: (err: { response?: { data?: { error?: { message?: string } } } }) => {
      toast.error(err.response?.data?.error?.message ?? 'Failed to issue items');
    },
  });

  const apiUrl = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Issue Equipment</h1>

      {/* Step 1: Scout */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h2 className="font-semibold text-slate-900">Step 1: Find Scout</h2>
        <div className="flex gap-3">
          <input value={regNumber} onChange={(e) => setRegNumber(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && searchScout()} placeholder="Registration number or name..." className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          <button onClick={searchScout} className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition">
            <Search className="w-4 h-4" /> Search
          </button>
        </div>
        {scoutResult && (
          <div className="flex items-center gap-4 bg-green-50 border border-green-200 rounded-lg p-3">
            {scoutResult.photoPath && <img src={`${apiUrl}${scoutResult.photoPath}`} alt="Scout" className="w-12 h-12 rounded-full object-cover" />}
            <div>
              <p className="font-semibold text-slate-900">{scoutResult.fullName}</p>
              <p className="text-xs font-mono text-slate-500">{scoutResult.registrationNumber}</p>
            </div>
            <span className="ml-auto text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full font-medium">Verified</span>
          </div>
        )}
      </div>

      {/* Step 2: Items */}
      {scoutResult && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h2 className="font-semibold text-slate-900">Step 2: Add Items by Tag Number</h2>
          <div className="flex gap-3">
            <input value={tagInput} onChange={(e) => setTagInput(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === 'Enter' && addTag()} placeholder="Enter tag number (e.g. SH-0001)" className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500" />
            <button onClick={addTag} className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>

          {basket.length > 0 && (
            <div className="space-y-2">
              {basket.map((item) => (
                <div key={item.tagNumber} className="flex items-center gap-3 bg-slate-50 rounded-lg px-3 py-2 text-sm">
                  <span className="font-mono font-semibold text-xs">{item.tagNumber}</span>
                  <span className="flex-1 text-slate-700">{item.name}</span>
                  <span className="text-slate-500">{item.category?.name}</span>
                  <span className="font-semibold">{formatCurrency(item.originalPrice)}</span>
                  <button onClick={() => setBasket((b) => b.filter((i) => i.tagNumber !== item.tagNumber))} className="text-red-400 hover:text-red-600 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <div className="flex justify-end text-sm font-semibold text-slate-900 pt-2 border-t border-slate-200">
                Total: {formatCurrency(totalValue)}
                {requiresGuarantor && <span className="ml-2 text-amber-600 font-normal text-xs">(Guarantor required)</span>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Guarantor */}
      {scoutResult && basket.length > 0 && requiresGuarantor && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h2 className="font-semibold text-slate-900">Step 3: Guarantor Details</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Guarantor Full Name *', key: 'fullName', placeholder: 'Muhammad Khan' },
              { label: 'Contact Number *', key: 'contactNumber', placeholder: '03001234567' },
              { label: 'CNIC Number *', key: 'cnicNumber', placeholder: '4220100000001' },
              { label: 'Deposited Item Description *', key: 'depositedItemDescription', placeholder: 'CNIC card / Cash Rs. 500' },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                <input value={guarantor[key as keyof typeof guarantor]} onChange={(e) => setGuarantor((g) => ({ ...g, [key]: e.target.value }))} placeholder={placeholder} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            ))}
          </div>
        </div>
      )}

      {scoutResult && basket.length > 0 && (
        <button
          onClick={() => issue.mutate()}
          disabled={issue.isPending || (requiresGuarantor && !guarantor.fullName)}
          className="w-full inline-flex items-center justify-center gap-2 bg-primary-500 text-white py-3 rounded-xl font-semibold hover:bg-primary-600 transition disabled:opacity-60"
        >
          {issue.isPending ? <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <ArrowUpFromLine className="w-5 h-5" />}
          Issue {basket.length} Item{basket.length !== 1 ? 's' : ''} ({formatCurrency(totalValue)})
        </button>
      )}
    </div>
  );
}
