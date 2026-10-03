'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useSidebarMode } from '@/hooks/use-sidebar-mode';
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
  Pin,
  PinOff,
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
  const { isPinned, togglePinned } = useSidebarMode();
  const [isHovered, setIsHovered] = useState(false);

  // Keep track of collapsed groups
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  // On mobile drawers, always stay full width
  const isMobileDrawer = className.includes('w-full');
  const isExpanded = isMobileDrawer || isPinned || isHovered;

  // Determine active item without multi-highlight collisions
  const isItemActive = (href: string) => {
    if (!pathname) return false;
    const [baseHref, query] = href.split('?');

    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }

    if (query) {
      if (pathname !== baseHref) return false;
      if (typeof window !== 'undefined') {
        return window.location.search.includes(query);
      }
      return false;
    }

    if (pathname === baseHref) {
      return true;
    }

    if (pathname.startsWith(`${baseHref}/`)) {
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
      onMouseEnter={() => {
        if (!isPinned && !isMobileDrawer) {
          setIsHovered(true);
        }
      }}
      onMouseLeave={() => {
        if (!isPinned && !isMobileDrawer) {
          setIsHovered(false);
        }
      }}
      className={`bg-white text-slate-800 border-r border-slate-200 dark:bg-[#070e20] dark:text-slate-200 dark:border-[#14234b]/60 flex flex-col h-full select-none transition-all duration-300 ease-in-out ${
        isMobileDrawer
          ? 'w-full'
          : isPinned
          ? 'w-64'
          : isHovered
          ? 'w-64 absolute left-0 top-0 h-screen z-50 shadow-2xl border-r border-slate-300 dark:border-slate-700'
          : 'w-[68px]'
      } ${className}`}
    >
      {/* Brand Header */}
      <div
        className={`h-16 flex items-center border-b border-slate-200 dark:border-[#14234b]/50 shrink-0 px-3.5 transition-all ${
          isExpanded ? 'justify-between' : 'justify-center'
        }`}
      >
        <Link
          href="/dashboard"
          onClick={onClose}
          className="flex items-center gap-2.5 group cursor-pointer overflow-hidden"
          title="Prop Nation Trader Portal"
        >
          <div className="relative h-10 w-10 shrink-0 rounded-xl bg-[#06090e] border border-slate-700/80 dark:border-slate-800 shadow-md flex items-center justify-center p-0.5 overflow-hidden group-hover:border-emerald-500/60 group-hover:scale-105 transition-all">
            <img
              src="/pn-logo-hd.png?v=3"
              alt="Prop Nation PN Logo"
              className="h-full w-full object-contain rounded-lg select-none"
            />
          </div>
          {isExpanded && (
            <span className="text-base font-black tracking-tight leading-tight flex items-center whitespace-nowrap">
              <span className="text-slate-900 dark:text-white">PROP</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-300 ml-1.5">NATION</span>
              <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 align-super ml-0.5">®</span>
            </span>
          )}
        </Link>

        {/* Pin Sidebar Button on Desktop */}
        {isExpanded && !isMobileDrawer && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              togglePinned();
            }}
            title={isPinned ? 'Unpin sidebar (auto-collapse to hover mode)' : 'Pin sidebar (keep full time open)'}
            className={`hidden lg:flex items-center justify-center h-8 w-8 rounded-lg transition-colors cursor-pointer shrink-0 ${
              isPinned
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            {isPinned ? <Pin className="h-4 w-4 fill-current" /> : <PinOff className="h-4 w-4" />}
          </button>
        )}
      </div>

      {/* Nav List */}
      <div
        className={`flex-1 overflow-y-auto py-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-[#172a59] scrollbar-track-transparent ${
          isExpanded ? 'px-3' : 'px-2'
        }`}
      >
        {SIDEBAR_GROUPS.map((group) => {
          const isCollapsed = collapsedGroups[group.id];

          return (
            <div key={group.id} className="space-y-1">
              {/* Group Header (only when expanded) */}
              {isExpanded ? (
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center justify-between px-2.5 py-1 text-[11px] font-bold tracking-wider text-slate-500 dark:text-[#5f75a6] uppercase hover:text-slate-900 dark:hover:text-slate-200 transition-colors group cursor-pointer"
                >
                  <span className="truncate">{group.label}</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 text-slate-400 group-hover:text-slate-700 dark:text-[#5f75a6] dark:group-hover:text-slate-200 ${
                      isCollapsed ? '-rotate-90' : 'rotate-0'
                    }`}
                  />
                </button>
              ) : (
                <div className="h-px bg-slate-200/80 dark:bg-[#14234b]/60 my-2 mx-1" />
              )}

              {/* Group Items */}
              {(!isCollapsed || !isExpanded) && (
                <div className="space-y-0.5">
                  {group.items.map((item, idx) => {
                    const Icon = item.icon;
                    const active = isItemActive(item.href);

                    return (
                      <Link
                        key={`${item.href}-${idx}`}
                        href={item.href}
                        onClick={onClose}
                        title={!isExpanded ? item.label : undefined}
                        className={`flex items-center rounded-xl transition-all relative group ${
                          isExpanded
                            ? `justify-between px-3 py-2 text-sm font-medium ${
                                active
                                  ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200/60 shadow-xs dark:bg-[#12224d] dark:text-blue-400 dark:border-transparent dark:shadow-inner'
                                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-[#0c1938]/70'
                              }`
                            : `justify-center h-10 w-10 mx-auto ${
                                active
                                  ? 'bg-blue-600 text-white shadow-sm dark:bg-blue-600 dark:text-white'
                                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-white'
                              }`
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            className={`h-[18px] w-[18px] shrink-0 ${
                              active
                                ? isExpanded
                                  ? 'text-blue-600 dark:text-blue-400'
                                  : 'text-white'
                                : 'text-slate-400 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200'
                            }`}
                          />
                          {isExpanded && <span className="whitespace-nowrap truncate">{item.label}</span>}
                        </div>

                        {/* Badge */}
                        {item.badge && (
                          isExpanded ? (
                            <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 px-2 py-0.5 rounded-full font-bold shrink-0">
                              {item.badge}
                            </span>
                          ) : (
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-white dark:ring-[#070e20]" />
                          )
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
      <div
        className={`border-t border-slate-200 bg-slate-50/80 dark:border-[#14234b]/60 dark:bg-[#060c1d] shrink-0 transition-colors ${
          isExpanded ? 'p-3.5' : 'p-2'
        }`}
      >
        {isExpanded ? (
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/dashboard/profile"
              onClick={onClose}
              className="flex items-center gap-2.5 overflow-hidden flex-1 group"
            >
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-500 text-white font-bold flex items-center justify-center shrink-0 shadow-sm">
                <span className="text-xs font-black">{initial}</span>
              </div>

              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                  {displayName}
                </span>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                  <span>{displayPoints.toLocaleString()} PTS</span>
                  <span className="text-slate-300 dark:text-slate-600">·</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold inline-flex items-center gap-0.5">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                    Verified
                  </span>
                </div>
              </div>
            </Link>

            {user && (
              <button
                onClick={() => logout()}
                title="Sign Out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-200/60 dark:hover:text-rose-400 dark:hover:bg-slate-800/60 transition-colors cursor-pointer shrink-0"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        ) : (
          <Link
            href="/dashboard/profile"
            onClick={onClose}
            title={`${displayName} (${displayPoints.toLocaleString()} PTS)`}
            className="flex items-center justify-center relative group py-1"
          >
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-500 text-white font-bold flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <span className="text-xs font-black">{initial}</span>
            </div>
            <span className="absolute bottom-1 right-2 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#060c1d]" />
          </Link>
        )}
      </div>
    </aside>
  );
}
