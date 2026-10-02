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
  MessageSquare,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [pendingCount, setPendingCount] = useState<number>(0);

  const STAFF_ROLES = ['ADMIN', 'SUPER_ADMIN', 'SUPPORT_LEAD', 'SUPPORT_AGENT', 'FINANCE_OFFICER'];
  const isStaff = user && STAFF_ROLES.includes(user.role);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
      } else if (!STAFF_ROLES.includes(user.role)) {
        router.push('/dashboard');
      }
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user && STAFF_ROLES.includes(user.role)) {
      api.get<{ metrics: { pendingVerification: number } }>('/admin/stats')
        .then((res) => {
          setPendingCount(res.metrics?.pendingVerification || 0);
        })
        .catch(() => {});
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center text-slate-500 dark:text-slate-400">
        Authenticating staff credentials...
      </div>
    );
  }

  if (!isStaff) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center text-center p-4">
        <div className="max-w-md space-y-4">
          <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Access Denied</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Administrative or Support Staff privileges required. Please sign in with an authorized staff account.
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
      label: 'Live Support Desk',
      href: '/admin/support',
      icon: MessageSquare,
      badge: 'Live',
    },
    {
      label: 'Purchase Verifications',
      href: '/admin/purchases',
      icon: ShoppingBag,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    { label: 'Team & Roles', href: '/admin/team', icon: ShieldCheck },
    { label: 'Trader Management', href: '/admin/users', icon: Users },
    { label: 'Prop Firms & Offers', href: '/admin/prop-firms', icon: Layers },
    { label: 'Rewards Catalog', href: '/admin/rewards', icon: Gift },
    { label: 'Redemptions Pipeline', href: '/admin/redemptions', icon: Truck },
    { label: 'Audit Trail', href: '/admin/audit-logs', icon: ScrollText },
    { label: 'System Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#070a12] dark:text-slate-100 flex flex-col md:flex-row transition-colors">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 p-4 space-y-6 shrink-0 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2 py-1">
            <Link href="/admin" className="flex items-center gap-2.5">
              <div className="relative h-9 w-10 flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="Prop Nation"
                  className="h-full w-auto object-contain drop-shadow-xs select-none"
                />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                  PropNation Admin
                </h2>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                  Staff Control Center
                </p>
              </div>
            </Link>
            <ThemeToggle />
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
                      ? 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded-full border border-amber-500/30">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Admin User info footer */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 px-2 space-y-2">
          <div className="text-xs text-slate-600 dark:text-slate-400 truncate">
            <span className="text-[10px] text-slate-500 block">Logged in as:</span>
            <strong className="text-slate-900 dark:text-white">{user.name}</strong>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-xs text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 transition-colors pt-1 cursor-pointer"
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
