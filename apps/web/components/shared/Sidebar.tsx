'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/lib/store';
import { toggleSidebar } from '@/lib/store/slices/uiSlice';
import { cn } from '@/lib/utils/cn';
import {
  LayoutDashboard, Users, Shield, Package, ArrowUpFromLine,
  RotateCcw, AlertCircle, BarChart3, Settings, ChevronLeft, ChevronRight
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/scouts', label: 'Scouts', icon: Users },
  { href: '/duties', label: 'Duties', icon: Shield },
  { href: '/inventory', label: 'Inventory', icon: Package },
  { href: '/issue', label: 'Issue Equipment', icon: ArrowUpFromLine },
  { href: '/returns', label: 'Returns', icon: RotateCcw },
  { href: '/fines', label: 'Fines', icon: AlertCircle },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const sidebarOpen = useSelector((state: RootState) => state.ui.sidebarOpen);

  return (
    <aside className={cn(
      'fixed left-0 top-0 h-screen bg-primary-500 text-white flex flex-col transition-all duration-300 z-40',
      sidebarOpen ? 'w-64' : 'w-16'
    )}>
      <div className="flex items-center justify-between p-4 border-b border-primary-700">
        {sidebarOpen && (
          <span className="font-bold text-sm leading-tight">Scouts Duty<br />Management</span>
        )}
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="p-1.5 rounded-lg hover:bg-primary-700 transition ml-auto"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition',
                isActive
                  ? 'bg-white text-primary-500'
                  : 'text-white/80 hover:bg-primary-700 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {sidebarOpen && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
