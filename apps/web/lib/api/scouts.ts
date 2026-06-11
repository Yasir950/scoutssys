import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './axios';
import { ScoutDTO, ApiSuccess, PaginationMeta } from '@scouts/shared';
import { toast } from 'sonner';

export const scoutKeys = {
  all: ['scouts'] as const,
  list: (params: Record<string, unknown>) => [...scoutKeys.all, 'list', params] as const,
  detail: (id: string) => [...scoutKeys.all, 'detail', id] as const,
};

export function useScouts(params: { page?: number; limit?: number; search?: string; city?: string; unitName?: string } = {}) {
  return useQuery({
    queryKey: scoutKeys.list(params),
    queryFn: async () => {
      const res = await apiClient.get('/scouts', { params });
      return res.data as ApiSuccess<ScoutDTO[]> & { meta: PaginationMeta };
    },
  });
}

export function useScout(id: string) {
  return useQuery({
    queryKey: scoutKeys.detail(id),
    queryFn: async () => {
      const res = await apiClient.get(`/scouts/${id}`);
      return res.data.data as ScoutDTO;
    },
    enabled: !!id,
  });
}

export function useCreateScout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await apiClient.post('/scouts', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      return res.data.data as ScoutDTO;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: scoutKeys.all });
      toast.success('Scout registered successfully');
    },
    onError: (err: { response?: { data?: { error?: { message?: string } } } }) => {
      toast.error(err.response?.data?.error?.message ?? 'Failed to register scout');
    },
  });
}
