'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useSidebarMode } from '@/hooks/use-sidebar-mode';
import { api } from '@/lib/api';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { GoogleTranslate } from '@/components/ui/google-translate';
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
  LogOut,
  AlertTriangle,
  MessageSquare,
  MessageCircle,
  ArrowLeft,
  Menu,
  X,
  Pin,
  PinOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const ROLE_STYLES: Record<string, string> = {
  SUPER_ADMIN: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30',
  ADMIN: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/15 dark:text-orange-300 dark:border-orange-500/30',
  SUPPORT_LEAD: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/30',
  SUPPORT_AGENT: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30',
  FINANCE_OFFICER: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isPinned, togglePinned, isHovered, setHovered, isExpanded } = useSidebarMode();

  const STAFF_ROLES = ['ADMIN', 'SUPER_ADMIN', 'SUPPORT_LEAD', 'SUPPORT_AGENT', 'FINANCE_OFFICER'];
  const isStaff = user && STAFF_ROLES.includes(user.role);

  useEffect(() => {
    if (!isLoading) {
      if (!user) router.push('/login');
      else if (!STAFF_ROLES.includes(user.role)) router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user && STAFF_ROLES.includes(user.role)) {
      api
        .get<{ metrics: { pendingVerification: number } }>('/admin/stats', { days: 30 })
        .then((res) => setPendingCount(res?.metrics?.pendingVerification || 0))
        .catch(() => {});
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-[#060b18]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Loading Staff Control Center...
          </span>
        </div>
      </div>
    );
  }

  if (!isStaff) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-[#060b18] p-4">
        <div className="max-w-sm text-center space-y-5 bg-white dark:bg-[#0d1424] p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg">
          <div className="h-14 w-14 rounded-2xl bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/30 flex items-center justify-center mx-auto">
            <AlertTriangle className="h-7 w-7 text-rose-600 dark:text-rose-400" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Access Denied</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Admin or Support Staff privileges required. Please sign in with an authorized staff account.
          </p>
          <Link href="/login">
            <Button size="sm" variant="primary" className="w-full">
              Go to Login
            </Button>
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
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
    },
    {
      label: 'Purchase Verifications',
      href: '/admin/purchases',
      icon: ShoppingBag,
      badge: pendingCount > 0 ? pendingCount : undefined,
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
    },
    { label: 'Team & Roles', href: '/admin/team', icon: ShieldCheck },
    { label: 'Trader Management', href: '/admin/users', icon: Users },
    { label: 'Prop Firms & Offers', href: '/admin/prop-firms', icon: Layers },
    { label: 'Rewards Catalog', href: '/admin/rewards', icon: Gift },
    { label: 'Redemptions Pipeline', href: '/admin/redemptions', icon: Truck },
    {
      label: 'WhatsApp Automation',
      href: '/admin/whatsapp',
      icon: MessageCircle,
      badge: 'Live',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
    },
    { label: 'Audit Trail', href: '/admin/audit-logs', icon: ScrollText },
    { label: 'System Settings', href: '/admin/settings', icon: Settings },
  ];

  const roleStyle = ROLE_STYLES[user?.role] || 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';

  const renderSidebar = (isMobile = false) => {
    const expanded = isMobile || isPinned || isHovered;

    return (
      <div
        onMouseEnter={() => {
          if (!isMobile) setHovered(true);
        }}
        onMouseLeave={() => {
          if (!isMobile) setHovered(false);
        }}
        className={`flex flex-col h-full bg-white dark:bg-[#070e20] text-slate-800 dark:text-slate-200 select-none overflow-y-auto transition-[width] duration-300 ease-in-out ${
          isMobile ? 'w-full' : expanded ? 'w-[220px]' : 'w-[60px]'
        }`}
      >
        {/* Brand Header */}
        <div
          className={`h-14 flex items-center border-b border-slate-200 dark:border-[#14234b]/60 shrink-0 ${
            expanded ? 'justify-between px-3.5' : 'justify-center px-2'
          }`}
        >
          <Link
            href="/admin"
            className="flex items-center gap-2.5 group min-w-0"
            onClick={() => {
              setSidebarOpen(false);
              if (typeof window !== 'undefined') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          >
            <div className="relative h-8 w-8 shrink-0 rounded-xl bg-[#06090e] border border-slate-700/80 dark:border-slate-800 shadow-sm flex items-center justify-center p-0.5 overflow-hidden group-hover:border-emerald-500/60 transition-all">
              <img
                src="/pn-logo-hd.png?v=3"
                alt="Prop Nation"
                className="h-full w-full object-contain rounded-lg"
              />
            </div>
            {expanded && (
              <div className="min-w-0">
                <div className="text-sm font-black tracking-tight leading-tight flex items-center whitespace-nowrap">
                  <span className="text-slate-900 dark:text-white">PROP</span>
                  <span className="text-emerald-600 dark:text-emerald-400 ml-1">ADMIN</span>
                </div>
                <div className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                  Staff Control Center
                </div>
              </div>
            )}
          </Link>

          {/* Pin / Auto-Collapse Toggle Button (replaces Night Mode icon) */}
          {expanded && !isMobile && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.currentTarget.blur();
                togglePinned();
              }}
              title={isPinned ? 'Unpin sidebar (auto-collapse to hover mode)' : 'Pin sidebar (keep full time open)'}
              className={`hidden lg:flex items-center justify-center h-7 w-7 rounded-lg transition-colors cursor-pointer shrink-0 outline-none focus:outline-none focus-visible:outline-none ${
                isPinned
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {isPinned ? <Pin className="h-3.5 w-3.5 fill-current" /> : <PinOff className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>

        {/* Navigation + Profile directly underneath */}
        <div className={`py-2.5 space-y-2.5 flex-1 flex flex-col justify-between ${expanded ? 'px-2.5' : 'px-1.5'}`}>
          <nav className="space-y-0.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  title={!expanded ? link.label : undefined}
                  onClick={(e) => {
                    e.currentTarget.blur();
                    setSidebarOpen(false);
                  }}
                  className={`flex items-center rounded-xl transition-colors relative group outline-none focus:outline-none focus-visible:outline-none border-0 ring-0 focus:ring-0 ${
                    expanded
                      ? `justify-between px-2.5 py-2 text-xs font-semibold ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 font-bold'
                            : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-[#0c1938]/70'
                        }`
                      : `justify-center h-9 w-9 mx-auto ${
                          isActive
                            ? 'bg-emerald-600 text-white dark:bg-emerald-600 dark:text-white'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-white'
                        }`
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        isActive
                          ? expanded
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-white'
                          : 'text-slate-400 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200'
                      }`}
                    />
                    {expanded && <span className="truncate">{link.label}</span>}
                  </div>
                  {link.badge && (
                    expanded ? (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                          link.badgeClass ?? 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {link.badge}
                      </span>
                    ) : (
                      <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#070e20]" />
                    )
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Profile & Actions Card */}
          <div className="pt-2.5 border-t border-slate-200 dark:border-[#14234b]/60">
            {expanded ? (
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0b152e] border border-slate-200/80 dark:border-slate-800/90 space-y-2">
                <div className="flex items-center gap-2.5">
                  <div
                    translate="no"
                    className="notranslate h-8 w-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs"
                  >
                    <span translate="no" className="notranslate leading-none select-none">
                      {user?.name?.trim()?.[0]?.toUpperCase() ?? 'A'}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 leading-none">
                      Logged in as:
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5">
                      {user?.name || 'Platform Admin'}
                    </div>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border inline-block mt-1 ${roleStyle}`}>
                      {user?.role}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-200/70 dark:border-slate-800/80">
                  <Link
                    href="/dashboard"
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-[11px] font-bold transition-colors"
                  >
                    <ArrowLeft className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Trader View</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border border-rose-200 dark:border-rose-500/30 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    <LogOut className="h-3 w-3 shrink-0" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-1">
                <div
                  translate="no"
                  title={`${user?.name || 'Admin'} (${user?.role})`}
                  className="notranslate h-8 w-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-xs flex items-center justify-center shadow-xs"
                >
                  <span translate="no" className="notranslate leading-none select-none">
                    {user?.name?.trim()?.[0]?.toUpperCase() ?? 'A'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 dark:bg-[#060b18] dark:text-slate-100 flex flex-col lg:flex-row antialiased transition-colors">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 border-r border-slate-200 dark:border-[#14234b]/60 sticky top-0 h-screen overflow-hidden transition-[width] duration-300 ease-in-out ${
          isExpanded ? 'w-[220px]' : 'w-[60px]'
        }`}
      >
        {renderSidebar(false)}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative z-10 w-64 max-w-xs h-full overflow-y-auto shadow-2xl">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg z-20"
            >
              <X className="h-5 w-5" />
            </button>
            {renderSidebar(true)}
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc] dark:bg-[#060b18] transition-colors">
        {/* Top Desktop Header */}
        <header className="hidden lg:flex items-center justify-between px-8 py-3.5 border-b border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#070e20] shrink-0 shadow-2xs transition-colors">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-wider font-extrabold text-emerald-600 dark:text-emerald-400">
              Admin Control Center
            </span>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Logged in as <strong className="text-slate-900 dark:text-white">{user?.name}</strong> ({user?.role})
            </span>
          </div>

          <div className="flex items-center gap-3">
            {pendingCount > 0 && (
              <Link href="/admin/purchases">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                  {pendingCount} Pending Reviews
                </span>
              </Link>
            )}
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(
                    new CustomEvent('propnation-open-live-chat', { detail: { mode: 'ADMIN' } })
                  );
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 hover:bg-purple-100 dark:bg-purple-500/15 dark:hover:bg-purple-500/25 border border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-bold transition-all cursor-pointer"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Floating Live Chat</span>
            </button>
            <GoogleTranslate id="google_translate_admin_header" />
            <ThemeToggle />
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                Trader View
              </Button>
            </Link>
          </div>
        </header>

        {/* Mobile Top Header */}
        <div className="flex lg:hidden items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070e20] sticky top-0 z-40">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-black text-slate-900 dark:text-white">PropNation Admin</span>
          <div className="flex items-center gap-2">
            <GoogleTranslate id="google_translate_admin_mobile" compact />
            <ThemeToggle />
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
