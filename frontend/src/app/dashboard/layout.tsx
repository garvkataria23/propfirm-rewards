'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { PropNationSidebar } from '@/components/layout/propnation-sidebar';
import {
  Menu,
  X,
  Coins,
  PlusCircle,
  Gift,
  ShieldCheck,
  Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070e20] flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          <span className="text-sm font-medium">Loading PropNation portal...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#060b18] text-slate-100 flex flex-col lg:flex-row">
      {/* Desktop Persistent Left Sidebar */}
      <div className="hidden lg:block shrink-0 h-screen sticky top-0 z-30">
        <PropNationSidebar />
      </div>

      {/* Mobile Top Header */}
      <div className="lg:hidden sticky top-0 z-40 bg-[#070e20]/95 backdrop-blur-md border-b border-[#14234b]/60 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link href="/dashboard" className="flex items-center">
          <span className="text-lg font-black tracking-tight text-white flex items-center">
            <span className="text-blue-500 font-extrabold">Prop</span>
            <span>Nation</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/points"
            className="flex items-center gap-1.5 bg-blue-950/60 border border-blue-500/30 text-blue-300 px-2.5 py-1 rounded-full text-xs font-bold"
          >
            <Coins className="h-3.5 w-3.5 text-blue-400" />
            <span>{(user.points?.available || 0).toLocaleString()}</span>
          </Link>
        </div>
      </div>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#070e20] z-50 shadow-2xl">
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 z-10"
            >
              <X className="h-5 w-5" />
            </button>
            <PropNationSidebar onClose={() => setMobileSidebarOpen(false)} className="w-full" />
          </div>
        </div>
      )}

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Desktop Appbar */}
        <header className="hidden lg:flex items-center justify-between px-8 py-3.5 border-b border-[#14234b]/40 bg-[#070e20]/60 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-wider font-bold text-[#5f75a6]">
              Trader Portal
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-xs font-semibold text-slate-300">
              Account Status:{' '}
              <span className="text-emerald-400 font-bold">{user.status}</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {user.role === 'ADMIN' && (
              <Link href="/admin">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-purple-500/30 text-purple-300 hover:bg-purple-950/40"
                >
                  <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                  Admin Panel
                </Button>
              </Link>
            )}

            <Link href="/dashboard/notifications" className="relative p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/50 transition-colors">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-500" />
            </Link>

            <Link href="/dashboard/points">
              <div className="flex items-center gap-2 bg-[#0c1938] border border-blue-500/20 hover:border-blue-500/40 px-3.5 py-1.5 rounded-full text-xs font-bold text-blue-300 transition-all cursor-pointer">
                <Coins className="h-3.5 w-3.5 text-blue-400" />
                <span>{(user.points?.available || 0).toLocaleString()} Points</span>
              </div>
            </Link>

            <Link href="/dashboard/purchases/new">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/25">
                <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
                Submit Purchase
              </Button>
            </Link>

            <Link href="/rewards">
              <Button variant="outline" size="sm" className="border-slate-700 text-slate-200">
                <Gift className="h-3.5 w-3.5 mr-1.5 text-blue-400" />
                Store
              </Button>
            </Link>
          </div>
        </header>

        {/* Child Pages Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
