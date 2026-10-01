'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { api } from '@/lib/api';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Layers,
  Gift,
  Truck,
  ScrollText,
  Settings,
  ShieldCheck,
  ChevronRight,
  LogOut,
  AlertTriangle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'ADMIN') {
        router.push('/dashboard');
      }
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      api.get<{ metrics: { pendingVerification: number } }>('/admin/stats')
        .then((res) => {
          setPendingCount(res.metrics?.pendingVerification || 0);
        })
        .catch(() => {});
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center text-slate-400">
        Authenticating admin credentials...
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center text-center p-4">
        <div className="max-w-md space-y-4">
          <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-white">Access Denied</h2>
          <p className="text-xs text-slate-400">
            Administrative privileges required. Please sign in with an authorized admin account.
          </p>
          <Link href="/login">
            <Button size="sm">Go to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  const navLinks = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    {
      label: 'Purchase Verifications',
      href: '/admin/purchases',
      icon: ShoppingBag,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    { label: 'Trader Management', href: '/admin/users', icon: Users },
    { label: 'Prop Firms & Offers', href: '/admin/prop-firms', icon: Layers },
    { label: 'Rewards Catalog', href: '/admin/rewards', icon: Gift },
    { label: 'Redemptions Pipeline', href: '/admin/redemptions', icon: Truck },
    { label: 'Audit Trail', href: '/admin/audit-logs', icon: ScrollText },
    { label: 'System Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 border-r border-slate-800/80 bg-slate-950 p-4 space-y-6 shrink-0">
        <div className="flex items-center gap-2.5 px-2 py-1">
          <div className="h-9 w-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white tracking-tight flex items-center gap-1.5">
              Admin Portal
            </h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              Superadmin Control
            </p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-full border border-amber-500/30">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Admin User info footer */}
        <div className="pt-4 border-t border-slate-800/80 px-2 space-y-2">
          <div className="text-xs text-slate-400 truncate">
            <span className="text-[10px] text-slate-500 block">Logged in as:</span>
            <strong className="text-white">{user.name}</strong>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-xs text-rose-400 hover:text-rose-300 transition-colors pt-1"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Area */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
