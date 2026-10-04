'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { PropNationSidebar } from '@/components/layout/propnation-sidebar';
import { useSidebarMode } from '@/hooks/use-sidebar-mode';
import { useNotifications } from '@/hooks/use-notifications';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { GoogleTranslate } from '@/components/ui/google-translate';
import {
  Menu,
  X,
  Coins,
  PlusCircle,
  Gift,
  ShieldCheck,
  Bell,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { isExpanded } = useSidebarMode();
  const { unreadCount } = useNotifications();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#060b18] flex items-center justify-center text-slate-500">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Loading Trader Portal...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 dark:bg-[#060b18] dark:text-slate-100 flex flex-col lg:flex-row antialiased transition-colors">
      {/* Desktop Left Sidebar: Dynamic Width Spacer (shifts right-side layout on both hover & pin, zero overlap) */}
      <div
        className={`hidden lg:block shrink-0 h-screen sticky top-0 z-30 transition-[width] duration-300 ease-in-out ${
          isExpanded ? 'w-[216px]' : 'w-[60px]'
        }`}
      >
        <PropNationSidebar />
      </div>

      {/* Mobile Top Header */}
      <div className="lg:hidden sticky top-0 z-40 bg-white/95 dark:bg-[#070e20]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-2.5 sm:px-3.5 py-2.5 flex items-center justify-between shadow-xs transition-colors">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer shrink-0"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link href="/dashboard" className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <div className="relative h-7 w-7 flex items-center justify-center shrink-0">
              <img src="/logo.png" alt="Prop Nation" className="h-full w-auto object-contain select-none" />
            </div>
            <span className="text-sm xs:text-base sm:text-base font-black tracking-tight text-slate-900 dark:text-white flex items-center truncate">
              PROP NATION<span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 align-super ml-0.5">®</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <GoogleTranslate id="google_translate_dashboard_mobile" compact />
          <ThemeToggle />

          <Link
            href="/dashboard/wallet"
            className="flex items-center gap-1 sm:gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 px-2 sm:px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-bold shrink-0"
          >
            <Coins className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{(user.points?.available || 0).toLocaleString('en-US')} PTS</span>
          </Link>
        </div>
      </div>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-[#070e20] z-50 shadow-2xl transition-colors">
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 z-10 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <PropNationSidebar onClose={() => setMobileSidebarOpen(false)} className="w-full" />
          </div>
        </div>
      )}

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc] dark:bg-[#060b18] transition-colors">
        {/* Top Desktop Appbar */}
        <header className="hidden lg:flex relative z-50 items-center justify-between px-8 py-3.5 border-b border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#070e20] shrink-0 shadow-xs transition-colors">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
              Trader Portal
            </span>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              Account Status:
              <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-500/30 px-2 py-0.5 rounded-md font-bold text-xs">
                {user.status}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Google Translate (100+ Languages) */}
            <GoogleTranslate id="google_translate_dashboard" />

            {/* Theme Toggle (Light / Dark) */}
            <ThemeToggle />

            {['ADMIN', 'SUPER_ADMIN', 'SUPPORT_LEAD', 'SUPPORT_AGENT', 'FINANCE_OFFICER'].includes(user.role) && (
              <Link href="/admin">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-purple-300 dark:border-purple-500/40 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-bold"
                >
                  <ShieldCheck className="h-3.5 w-3.5 mr-1.5 text-purple-600 dark:text-purple-400" />
                  Admin Panel
                </Button>
              </Link>
            )}

            <Link
              href="/dashboard/notifications"
              title={unreadCount > 0 ? `${unreadCount} unread notifications` : 'All notifications read'}
              className="relative p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center leading-none shadow-xs ring-2 ring-white dark:ring-[#070e20]">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>

            {/* Trader Wallet & Points Quick Pills */}
            <Link href="/dashboard/wallet">
              <div className="flex items-center gap-2 bg-blue-50/80 hover:bg-blue-100/80 dark:bg-[#0c1938] border border-blue-200/80 dark:border-blue-500/30 hover:border-blue-300 px-3.5 py-1.5 rounded-full text-xs font-bold text-blue-700 dark:text-blue-300 transition-all cursor-pointer shadow-xs">
                <Wallet className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>Wallet: ${((user.points?.available || 0) / 100).toFixed(2)}</span>
              </div>
            </Link>

            <Link href="/dashboard/points">
              <div className="flex items-center gap-2 bg-emerald-50/80 hover:bg-emerald-100/80 dark:bg-[#0c2422] border border-emerald-200/80 dark:border-emerald-500/30 hover:border-emerald-300 px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-700 dark:text-emerald-300 transition-all cursor-pointer shadow-xs">
                <Coins className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{(user.points?.available || 0).toLocaleString('en-US')} PTS</span>
              </div>
            </Link>

            <Link href="/dashboard/purchases/new">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-semibold">
                <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
                Submit Proof
              </Button>
            </Link>

            <Link href="/rewards">
              <Button variant="outline" size="sm" className="border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 shadow-xs font-medium">
                <Gift className="h-3.5 w-3.5 mr-1.5 text-blue-600 dark:text-blue-400" />
                Store
              </Button>
            </Link>
          </div>
        </header>

        {/* Child Pages Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full space-y-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
