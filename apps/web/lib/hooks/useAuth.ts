'use client';

import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { clearCredentials, setCredentials } from '../store/slices/authSlice';
import { apiClient, rawClient } from '../api/axios';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // ignore
    }
    dispatch(clearCredentials());
    router.push('/login');
    toast.success('Logged out successfully');
  };

  const restoreSession = async () => {
    try {
      // Use rawClient so a 401 here never triggers the interceptor's refresh loop
      const res = await rawClient.post('/auth/refresh');
      const { accessToken } = res.data.data as { accessToken: string };
      const meRes = await rawClient.get('/auth/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      dispatch(setCredentials({ user: meRes.data.data, accessToken }));
    } catch {
      // No refresh cookie — user is not logged in, stay on login page
      dispatch(clearCredentials());
    }
  };

  return { ...auth, logout, restoreSession };
}
