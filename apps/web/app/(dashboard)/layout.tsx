'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Sidebar } from '@/components/shared/Sidebar';
import { Header } from '@/components/shared/Header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);
  const sidebarOpen = useSelector((state: RootState) => state.ui.sidebarOpen);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only redirect once the session check is complete and we know the user is not authenticated
    if (!isLoading && !isAuthenticated && !pathname.startsWith('/login')) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // Still checking session — render nothing to avoid flash
  if (isLoading) return null;

  // Session resolved: not authenticated — render nothing, redirect is in flight
  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <Header />
      <main
        className="pt-16 min-h-screen transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? '256px' : '64px' }}
      >
        <div className="max-w-7xl mx-auto px-6 py-6">{children}</div>
      </main>
    </div>
  );
}
