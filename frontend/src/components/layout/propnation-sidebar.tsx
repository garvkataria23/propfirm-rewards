'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import {
  LayoutGrid,
  Activity,
  Bell,
  Upload,
  ShoppingBag,
  ShieldCheck,
  Gift,
  Box,
  History,
  Coins,
  Landmark,
  TrendingUp,
  Users,
  Star,
  Megaphone,
  MessageSquare,
  LifeBuoy,
  HelpCircle,
  User,
  Settings,
  ChevronDown,
  Check,
  LogOut,
  Wallet,
  MessageCircle,
} from 'lucide-react';

interface SidebarGroup {
  id: string;
  label: string;
  items: {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}

const SIDEBAR_GROUPS: SidebarGroup[] = [
  {
    id: 'dashboard',
    label: 'DASHBOARD',
    items: [
      { label: 'Overview', href: '/dashboard', icon: LayoutGrid },
      { label: 'Trader Wallet', href: '/dashboard/wallet', icon: Wallet, badge: 'USD' },
      { label: 'WhatsApp Alerts', href: '/dashboard/whatsapp', icon: MessageCircle, badge: 'AUTO' },
      { label: 'Activity', href: '/dashboard/activity', icon: Activity },
      { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
    ],
  },
  {
    id: 'purchases',
    label: 'PURCHASES',
    items: [
      { label: 'Submit Purchase', href: '/dashboard/purchases/new', icon: Upload },
      { label: 'My Purchases', href: '/dashboard/purchases', icon: ShoppingBag },
      { label: 'Verification', href: '/dashboard/verification', icon: ShieldCheck },
    ],
  },
  {
    id: 'rewards',
    label: 'REWARDS',
    items: [
      { label: 'Rewards Store', href: '/dashboard/rewards', icon: Gift },
      { label: 'My Rewards', href: '/dashboard/my-rewards', icon: Box },
      { label: 'Redemption History', href: '/dashboard/redemptions', icon: History },
      { label: 'My Points', href: '/dashboard/points', icon: Coins },
    ],
  },
  {
    id: 'propfirms',
    label: 'PROPFIRMS',
    items: [
      { label: 'CFD', href: '/dashboard/prop-firms?type=cfd', icon: Landmark },
      { label: 'FUTURE', href: '/dashboard/prop-firms?type=futures', icon: TrendingUp },
    ],
  },
  {
    id: 'community',
    label: 'COMMUNITY',
    items: [
      { label: 'Community', href: '/dashboard/community', icon: Users },
      { label: 'Reviews', href: '/dashboard/reviews', icon: Star },
      { label: 'Announcements', href: '/dashboard/announcements', icon: Megaphone },
    ],
  },
  {
    id: 'support',
    label: 'SUPPORT',
    items: [
      { label: 'Live Support', href: '/dashboard/support', icon: MessageSquare },
      { label: 'Help Center', href: '/dashboard/help-center', icon: LifeBuoy },
      { label: 'FAQ', href: '/dashboard/faq', icon: HelpCircle },
    ],
  },
  {
    id: 'account',
    label: 'ACCOUNT',
    items: [
      { label: 'Profile', href: '/dashboard/profile', icon: User },
      { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
      { label: 'Settings', href: '/dashboard/settings', icon: Settings },
    ],
  },
];

interface PropNationSidebarProps {
  onClose?: () => void;
  className?: string;
}

export function PropNationSidebar({ onClose, className = '' }: PropNationSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Keep track of collapsed groups
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  // Determine active item without multi-highlight collisions
  const isItemActive = (href: string) => {
    if (!pathname) return false;
    const [baseHref, query] = href.split('?');

    // Dashboard root
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }

    // Query-specific matches (e.g. ?type=cfd)
    if (query) {
      if (pathname !== baseHref) return false;
      if (typeof window !== 'undefined') {
        return window.location.search.includes(query);
      }
      return false;
    }

    // Exact match
    if (pathname === baseHref) {
      return true;
    }

    // If pathname is a subpath of baseHref (e.g. /dashboard/purchases/123)
    if (pathname.startsWith(`${baseHref}/`)) {
      // Prevent parent highlight if a more specific sidebar item exists (e.g. /dashboard/purchases/new)
      const allItemHrefs = SIDEBAR_GROUPS.flatMap((g) => g.items.map((i) => i.href.split('?')[0]));
      const hasMoreSpecificItem = allItemHrefs.some(
        (otherHref) =>
          otherHref !== baseHref &&
          otherHref.startsWith(`${baseHref}/`) &&
          (pathname === otherHref || pathname.startsWith(`${otherHref}/`))
      );
      return !hasMoreSpecificItem;
    }

    return false;
  };

  // User details fallback for display
  const displayName = user?.name || 'Garv Gautam Kataria';
  const displayPoints = user?.points?.available ?? 0;
  const initial = displayName.charAt(0).toUpperCase() || 'G';

  return (
    <aside
      className={`w-64 sm:w-72 bg-white text-slate-800 border-r border-slate-200 dark:bg-[#070e20] dark:text-slate-200 dark:border-[#14234b]/60 flex flex-col h-full select-none transition-colors ${className}`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200 dark:border-[#14234b]/50 shrink-0">
        <Link
          href="/dashboard"
          onClick={onClose}
          className="flex items-center gap-2.5 group cursor-pointer"
        >
          <div className="relative h-9 w-10 flex items-center justify-center group-hover:scale-105 transition-transform">
            <img
              src="/logo.png"
              alt="Prop Nation"
              className="h-full w-auto object-contain select-none"
            />
          </div>
          <span className="text-base font-black tracking-tight text-slate-900 dark:text-white flex items-center">
            PROP NATION
          </span>
        </Link>
      </div>

      {/* Nav List with Collapsible Groups */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-[#172a59] scrollbar-track-transparent">
        {SIDEBAR_GROUPS.map((group) => {
          const isCollapsed = collapsedGroups[group.id];

          return (
            <div key={group.id} className="space-y-1.5">
              {/* Group Header */}
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                className="w-full flex items-center justify-between px-2.5 py-1 text-[11px] font-bold tracking-wider text-slate-500 dark:text-[#5f75a6] uppercase hover:text-slate-900 dark:hover:text-slate-200 transition-colors group cursor-pointer"
              >
                <span>{group.label}</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 text-slate-400 group-hover:text-slate-700 dark:text-[#5f75a6] dark:group-hover:text-slate-200 ${
                    isCollapsed ? '-rotate-90' : 'rotate-0'
                  }`}
                />
              </button>

              {/* Group Items */}
              {!isCollapsed && (
                <div className="space-y-0.5">
                  {group.items.map((item, idx) => {
                    const Icon = item.icon;
                    const active = isItemActive(item.href);

                    return (
                      <Link
                        key={`${item.href}-${idx}`}
                        href={item.href}
                        onClick={onClose}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                          active
                            ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200/60 shadow-xs dark:bg-[#12224d] dark:text-blue-400 dark:border-transparent dark:shadow-inner'
                            : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-[#0c1938]/70'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            className={`h-[18px] w-[18px] shrink-0 ${
                              active
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-slate-400 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200'
                            }`}
                          />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 px-2 py-0.5 rounded-full font-bold">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/80 dark:border-[#14234b]/60 dark:bg-[#060c1d] shrink-0 transition-colors">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/dashboard/profile"
            onClick={onClose}
            className="flex items-center gap-3 overflow-hidden flex-1 group"
          >
            {/* Avatar Circle */}
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-500 text-white font-bold flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
              <span className="text-sm font-black">{initial}</span>
            </div>

            {/* Name and Verified Subtitle */}
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                {displayName}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span>{displayPoints.toLocaleString()} Points</span>
                <span className="text-slate-300 dark:text-slate-600">·</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold inline-flex items-center gap-0.5">
                  <Check className="h-3 w-3 stroke-[3]" />
                  Verified
                </span>
              </div>
            </div>
          </Link>

          {/* Quick Sign Out Action */}
          {user && (
            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-200/60 dark:hover:text-rose-400 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
