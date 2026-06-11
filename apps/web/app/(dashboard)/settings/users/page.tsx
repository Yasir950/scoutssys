'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/axios';
import { SkeletonTable } from '@/components/shared/SkeletonTable';
import { formatDate } from '@/lib/utils/format';
import { toast } from 'sonner';
import { useState } from 'react';
import { Plus, UserCheck, UserX } from 'lucide-react';

const ROLES = ['ADMIN', 'OPERATOR_REGISTRATION', 'OPERATOR_INVENTORY', 'VIEWER'] as const;

export default function UsersPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'OPERATOR_REGISTRATION' as typeof ROLES[number] });
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => (await apiClient.get('/users')).data.data as Array<{ id: string; name: string; email: string; role: string; isActive: boolean; lastLoginAt: string | null; createdAt: string }>,
  });

  const addUser = useMutation({
    mutationFn: () => apiClient.post('/users', newUser),
    onSuccess: () => { toast.success('User created'); qc.invalidateQueries({ queryKey: ['users'] }); setShowAdd(false); setNewUser({ name: '', email: '', password: '', role: 'OPERATOR_REGISTRATION' }); },
    onError: (err: { response?: { data?: { error?: { message?: string } } } }) => toast.error(err.response?.data?.error?.message ?? 'Failed to create user'),
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => apiClient.put(`/users/${id}`, { isActive }),
    onSuccess: () => { toast.success('User updated'); qc.invalidateQueries({ queryKey: ['users'] }); },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
        <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition">
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      {isLoading ? <SkeletonTable rows={4} cols={5} /> : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Name', 'Email', 'Role', 'Status', 'Last Login', 'Created', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((user, i) => (
                <tr key={user.id} className={`border-b border-slate-100 hover:bg-slate-50 ${i % 2 ? 'bg-slate-50/50' : ''}`}>
                  <td className="px-4 py-3 font-medium">{user.name}</td>
                  <td className="px-4 py-3 text-slate-500">{user.email}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">{user.role}</span></td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}</td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive.mutate({ id: user.id, isActive: !user.isActive })} className={`inline-flex items-center gap-1 text-xs ${user.isActive ? 'text-red-500 hover:text-red-700' : 'text-green-500 hover:text-green-700'}`}>
                      {user.isActive ? <><UserX className="w-3.5 h-3.5" /> Deactivate</> : <><UserCheck className="w-3.5 h-3.5" /> Activate</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Create New User</h2>
            {[
              { label: 'Full Name *', key: 'name', type: 'text', placeholder: 'Muhammad Ahmed' },
              { label: 'Email *', key: 'email', type: 'email', placeholder: 'user@scouts.pk' },
              { label: 'Password *', key: 'password', type: 'password', placeholder: 'Min 8 characters' },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                <input type={type} value={newUser[key as keyof typeof newUser]} onChange={(e) => setNewUser((u) => ({ ...u, [key]: e.target.value }))} placeholder={placeholder} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Role *</label>
              <select value={newUser.role} onChange={(e) => setNewUser((u) => ({ ...u, role: e.target.value as typeof ROLES[number] }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none">
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2 border border-slate-300 rounded-lg text-sm text-slate-600">Cancel</button>
              <button onClick={() => addUser.mutate()} disabled={addUser.isPending || !newUser.name || !newUser.email || !newUser.password} className="flex-1 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                {addUser.isPending ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
