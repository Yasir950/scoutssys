'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { useAuth } from '@/lib/hooks/useAuth';
import { LogOut, User, ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';

function getBreadcrumbs(pathname: string): string[] {
  return pathname.split('/').filter(Boolean).map((seg) =>
    seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ')
  );
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrator',
  OPERATOR_REGISTRATION: 'Registration Op.',
  OPERATOR_INVENTORY: 'Inventory Op.',
  VIEWER: 'Viewer',
};

export function Header() {
  const sidebarOpen = useSelector((state: RootState) => state.ui.sidebarOpen);
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <header className={`fixed top-0 right-0 h-16 bg-white border-b border-slate-200 z-30 flex items-center justify-between px-6 transition-all duration-300 ${sidebarOpen ? 'left-64' : 'left-16'}`}>
      <nav className="flex items-center gap-1 text-sm text-slate-500">
        {breadcrumbs.map((seg, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="w-3 h-3" />}
            <span className={i === breadcrumbs.length - 1 ? 'text-slate-900 font-medium' : ''}>{seg}</span>
          </span>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
          <div className="w-7 h-7 bg-primary-500 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-medium text-slate-900 leading-none">{user?.name ?? 'Loading...'}</p>
            <p className="text-xs text-slate-500 leading-none mt-0.5">{user?.role ? ROLE_LABELS[user.role] ?? user.role : ''}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
