'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/axios';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

interface Config { key: string; value: string; updatedAt: string | null }

const EDITABLE_KEYS = [
  { key: 'FINE_PERCENTAGE', label: 'Fine Percentage (%)', type: 'number' },
  { key: 'PROGRAM_NAME', label: 'Program Name', type: 'text' },
  { key: 'PROGRAM_START_DATE', label: 'Program Start Date', type: 'date' },
  { key: 'PROGRAM_END_DATE', label: 'Program End Date', type: 'date' },
  { key: 'GUARANTOR_THRESHOLD', label: 'Guarantor Threshold (PKR)', type: 'number' },
];

export default function SettingsPage() {
  const qc = useQueryClient();
  const [values, setValues] = useState<Record<string, string>>({});

  const { data: configs } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => (await apiClient.get('/settings')).data.data as Config[],
  });

  useEffect(() => {
    if (configs) {
      const map: Record<string, string> = {};
      configs.forEach((c) => { map[c.key] = c.value; });
      setValues(map);
    }
  }, [configs]);

  const save = useMutation({
    mutationFn: () => apiClient.put('/settings/bulk', { entries: Object.entries(values).map(([key, value]) => ({ key, value })) }),
    onSuccess: () => { toast.success('Settings saved'); qc.invalidateQueries({ queryKey: ['settings'] }); },
    onError: () => toast.error('Failed to save settings'),
  });

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <h2 className="font-semibold text-slate-900">Program Configuration</h2>
        {EDITABLE_KEYS.map(({ key, label, type }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
            <input
              type={type}
              value={values[key] ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        ))}

        <button
          onClick={() => save.mutate()}
          disabled={save.isPending}
          className="inline-flex items-center gap-2 bg-primary-500 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-600 transition disabled:opacity-60"
        >
          {save.isPending ? <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
          Save Settings
        </button>
      </div>
    </div>
  );
}
