'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/axios';
import { SkeletonTable } from '@/components/shared/SkeletonTable';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatCurrency } from '@/lib/utils/format';
import { Package, Plus, Search } from 'lucide-react';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { toast } from 'sonner';

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: 'bg-green-100 text-green-700',
  ISSUED: 'bg-blue-100 text-blue-700',
  DAMAGED: 'bg-red-100 text-red-700',
  LOST: 'bg-slate-100 text-slate-600',
  UNDER_MAINTENANCE: 'bg-amber-100 text-amber-700',
};

export default function InventoryPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ tagNumber: '', name: '', categoryId: '', originalPrice: '', condition: 'NEW' });
  const qc = useQueryClient();
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useQuery({
    queryKey: ['inventory', page, debouncedSearch],
    queryFn: async () => {
      const res = await apiClient.get('/inventory', { params: { page, limit: 20, search: debouncedSearch } });
      return res.data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['inventory-categories'],
    queryFn: async () => (await apiClient.get('/inventory/categories')).data.data as Array<{ id: string; name: string }>,
  });

  const addItem = useMutation({
    mutationFn: (item: typeof newItem) => apiClient.post('/inventory', { ...item, originalPrice: Number(item.originalPrice) }),
    onSuccess: () => {
      toast.success('Item added to inventory');
      qc.invalidateQueries({ queryKey: ['inventory'] });
      setShowAddModal(false);
      setNewItem({ tagNumber: '', name: '', categoryId: '', originalPrice: '', condition: 'NEW' });
    },
    onError: (err: { response?: { data?: { error?: { message?: string } } } }) => {
      toast.error(err.response?.data?.error?.message ?? 'Failed to add item');
    },
  });

  const items = (data?.data ?? []) as Array<{ id: string; tagNumber: string; name: string; category: { name: string }; status: string; condition: string; originalPrice: number; cabinShelf?: { cabinNumber: string; shelfLabel: string } }>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
        <button onClick={() => setShowAddModal(true)} className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition">
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-3 py-2 w-full max-w-md">
        <Search className="w-4 h-4 text-slate-400" />
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search tag #, name..." className="flex-1 text-sm focus:outline-none" />
      </div>

      {isLoading ? <SkeletonTable rows={8} cols={6} /> : items.length === 0 ? (
        <EmptyState icon={Package} title="No inventory items" description="Add items to start tracking inventory" action={{ label: 'Add Item', href: '#' }} />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Tag #', 'Name', 'Category', 'Status', 'Condition', 'Price', 'Location'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={item.id} className={`border-b border-slate-100 hover:bg-slate-50 ${i % 2 ? 'bg-slate-50/50' : ''}`}>
                  <td className="px-4 py-3 font-mono text-xs font-semibold">{item.tagNumber}</td>
                  <td className="px-4 py-3">{item.name}</td>
                  <td className="px-4 py-3">{item.category?.name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[item.status] ?? ''}`}>{item.status}</span>
                  </td>
                  <td className="px-4 py-3">{item.condition}</td>
                  <td className="px-4 py-3">{formatCurrency(item.originalPrice)}</td>
                  <td className="px-4 py-3 text-xs">{item.cabinShelf ? `${item.cabinShelf.cabinNumber}/${item.cabinShelf.shelfLabel}` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="px-4 py-3 flex items-center justify-between border-t border-slate-100">
            <p className="text-sm text-slate-500">Total: {data?.meta?.total ?? 0} items</p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50">Previous</button>
              <button onClick={() => setPage((p) => p + 1)} disabled={page >= (data?.meta?.totalPages ?? 1)} className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50">Next</button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Add Inventory Item</h2>
            {[
              { label: 'Tag Number *', key: 'tagNumber', placeholder: 'SH-0001' },
              { label: 'Item Name *', key: 'name', placeholder: 'Scout Shirt #001' },
              { label: 'Original Price (PKR) *', key: 'originalPrice', placeholder: '800' },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                <input value={newItem[key as keyof typeof newItem]} onChange={(e) => setNewItem((p) => ({ ...p, [key]: e.target.value }))} placeholder={placeholder} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
              <select value={newItem.categoryId} onChange={(e) => setNewItem((p) => ({ ...p, categoryId: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="">Select...</option>
                {(categories ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Condition</label>
              <select value={newItem.condition} onChange={(e) => setNewItem((p) => ({ ...p, condition: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                {['NEW', 'GOOD', 'USED'].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-2 border border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
              <button
                onClick={() => addItem.mutate(newItem)}
                disabled={addItem.isPending || !newItem.tagNumber || !newItem.name || !newItem.categoryId}
                className="flex-1 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 disabled:opacity-50"
              >
                {addItem.isPending ? 'Adding...' : 'Add Item'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
