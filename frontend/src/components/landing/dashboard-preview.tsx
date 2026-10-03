'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutGrid,
  Layers,
  ShoppingBag,
  Coins,
  Gift,
  History,
  User,
  CheckCircle2,
  TrendingUp,
  Smartphone,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Wallet,
  PlusCircle,
  Clock,
  ShieldCheck,
  Truck,
  Upload,
  FileImage,
  Crown,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAnimatedNumber } from './motion-primitives';

export type DashboardPreviewTab =
  | 'Dashboard'
  | 'Prop Firms'
  | 'My Purchases'
  | 'Points'
  | 'Rewards'
  | 'Redemptions'
  | 'Profile';

interface DashboardPreviewProps {
  /**
   * 'hero' renders the focused, compact real dashboard region for the Hero (#7-#8).
   * 'full' renders the complete interactive application workspace (#2-#6, #10-#13, #35-#36).
   */
  mode?: 'hero' | 'full';
  /**
   * Controls whether the animation loop runs (e.g. when in viewport).
   */
  active?: boolean;
}

/**
 * #2–#13, #31, #33–#36 · REUSABLE REAL PRODUCT DASHBOARD PREVIEW
 * Single source of truth connecting the landing page showcase and hero to the actual
 * Prop Nation Trader Portal UI, navigation, status badges, and component hierarchy.
 * Uses strictly controlled demo/preview data clearly labeled as Product Preview.
 */
export function DashboardPreview({ mode = 'full', active = true }: DashboardPreviewProps) {
  const [phase, setPhase] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<DashboardPreviewTab>('Dashboard');

  useEffect(() => {
    if (!active) return;
    let timers: NodeJS.Timeout[] = [];

    const runSequence = (initialDelay = 1200) => {
      setPhase(1); // Initial state: 10,000 POINTS · iPhone 60%
      timers.push(setTimeout(() => setPhase(2), initialDelay)); // Notification: ✓ Purchase Verified · +2,500 Points Credited
      timers.push(setTimeout(() => setPhase(3), initialDelay + 450)); // Balance: 10,000 -> 12,500
      timers.push(setTimeout(() => setPhase(4), initialDelay + 950)); // Reward Progress: 60% -> 75%
    };

    runSequence(1200);

    const loop = setInterval(() => {
      timers.forEach(clearTimeout);
      timers = [];
      runSequence(700);
    }, 9000);

    return () => {
      clearInterval(loop);
      timers.forEach(clearTimeout);
    };
  }, [active]);

  // #4, #7, #8, #11: Initial 10,000 -> 12,500 Points
  const targetPoints = phase >= 3 ? 12500 : 10000;
  const displayedPoints = useAnimatedNumber(10000, targetPoints, 950, phase >= 3);
  // #4, #7, #8, #12: Initial 60% -> 75% Reward Progress
  const rewardProgress = phase >= 4 ? 75 : 60;

  // #10: Actual application navigation items
  const navItems: {
    id: DashboardPreviewTab;
    label: string;
    group: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[] = [
    { id: 'Dashboard', label: 'Dashboard', group: 'DASHBOARD', icon: LayoutGrid },
    { id: 'Prop Firms', label: 'Prop Firms', group: 'PROPFIRMS', icon: Layers },
    { id: 'My Purchases', label: 'My Purchases', group: 'PURCHASES', icon: ShoppingBag, badge: 'VERIFIED' },
    { id: 'Points', label: 'Points', group: 'REWARDS', icon: Coins, badge: 'PTS' },
    { id: 'Rewards', label: 'Rewards', group: 'REWARDS', icon: Gift },
    { id: 'Redemptions', label: 'Redemptions', group: 'REWARDS', icon: History },
    { id: 'Profile', label: 'Profile', group: 'ACCOUNT', icon: User },
  ];

  // Shared actual Points Card (#11)
  const renderPointsCard = (compact = false) => (
    <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-[#08151f] to-[#031d17] p-4 sm:p-5 space-y-3 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-black font-mono uppercase tracking-wider text-emerald-400">
          AVAILABLE POINTS
        </span>
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 font-mono text-[11px] font-bold transition-all duration-500 ${
            phase >= 2 ? 'opacity-100 scale-100' : 'opacity-80 scale-95'
          }`}
        >
          <TrendingUp className="h-3 w-3" />
          +2,500 this week
        </span>
      </div>

      <div>
        <div className="flex items-baseline gap-2.5">
          <span
            className={`${
              compact ? 'text-3xl sm:text-4xl' : 'text-3xl sm:text-4xl'
            } font-[900] font-mono text-white tracking-tight`}
          >
            {displayedPoints.toLocaleString()}
          </span>
          <span className="text-xs font-mono font-bold text-emerald-400">POINTS</span>
        </div>
        <div className="text-xs font-bold text-emerald-400/90 mt-1 flex items-center gap-1 font-mono">
          <span>≈ ${(displayedPoints / 100).toFixed(2)} USD Reward Value</span>
          <ArrowUpRight className="h-3 w-3" />
        </div>
      </div>

      <div className="pt-2.5 border-t border-emerald-950/80 flex items-center justify-between text-[11px] text-slate-300">
        <span>Verified Trader Balance</span>
        <span className="font-mono text-emerald-400 font-bold">10,000 → 12,500</span>
      </div>
    </div>
  );

  // Shared actual Reward Progress Card (#12)
  const renderRewardProgressCard = (compact = false) => (
    <div
      className={`rounded-2xl border p-4 sm:p-5 space-y-3.5 transition-all duration-500 flex flex-col justify-between ${
        phase >= 4
          ? 'bg-[#0b1c1a] border-emerald-500/45 shadow-[0_0_30px_-10px_rgba(16,185,129,0.28)]'
          : 'bg-[#08121c] border-slate-800/90'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-black font-mono uppercase tracking-wider text-slate-300">
          REWARD PROGRESS
        </span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 font-mono text-xs font-extrabold text-emerald-400">
          {rewardProgress}%
        </span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-emerald-500/12 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=160&auto=format&fit=crop&q=80"
              alt="iPhone"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <div className="text-[11px] font-mono text-slate-300">Target Reward</div>
            <div className={`${compact ? 'text-base' : 'text-lg'} font-extrabold text-white`}>
              iPhone
            </div>
          </div>
        </div>
        <div className="text-right font-mono">
          <div className="text-xs font-bold text-emerald-400">{rewardProgress}% Unlocked</div>
          <div className="text-[11px] text-slate-400">60% → 75%</div>
        </div>
      </div>

      {/* Actual Dashboard Progress Bar */}
      <div className="space-y-1.5">
        <div className="h-2.5 w-full bg-slate-900 border border-slate-800 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${rewardProgress}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] font-mono text-slate-300">
          <span>Reward: iPhone</span>
          <span className="text-emerald-400 font-bold">Progress: {rewardProgress}%</span>
        </div>
      </div>
    </div>
  );

  // Shared actual Recent Activity Ledger (#13)
  const renderRecentActivityList = (compact = false) => (
    <div className="rounded-2xl border border-slate-800/90 bg-[#080f1e] p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Coins className="h-3.5 w-3.5" />
          </div>
          <h4 className="font-[900] text-white text-xs sm:text-sm uppercase tracking-wider font-mono">
            RECENT ACTIVITY
          </h4>
        </div>
        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
          Points Ledger · Demo
        </span>
      </div>

      <div className="divide-y divide-slate-800/70">
        {/* Row 1: Purchase Verified +2,500 */}
        <div
          className={`py-2.5 px-2.5 rounded-xl flex items-center justify-between gap-3 transition-colors duration-500 ${
            phase >= 2 ? 'bg-emerald-500/[0.09]' : ''
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shrink-0">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </span>
            <div>
              <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <span>Purchase Verified</span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                  APPROVED
                </span>
              </div>
              {!compact && (
                <div className="text-[11px] text-slate-400 font-mono">
                  $100 Challenge Evaluation · Points Credited
                </div>
              )}
            </div>
          </div>
          <div className="text-right font-mono">
            <span className="text-xs sm:text-sm font-black text-emerald-400">+2,500</span>
            {!compact && <div className="text-[10px] text-slate-400">Bal: 12,500 PTS</div>}
          </div>
        </div>

        {/* Row 2: Bonus +1,000 */}
        <div className="py-2.5 px-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shrink-0">
              <Coins className="h-3.5 w-3.5" />
            </span>
            <div>
              <div className="text-xs sm:text-sm font-bold text-slate-200">Bonus</div>
              {!compact && (
                <div className="text-[11px] text-slate-400 font-mono">
                  Tier Multiplier Credit
                </div>
              )}
            </div>
          </div>
          <div className="text-right font-mono">
            <span className="text-xs sm:text-sm font-black text-emerald-400">+1,000</span>
            {!compact && <div className="text-[10px] text-slate-400">Bal: 10,000 PTS</div>}
          </div>
        </div>

        {/* Row 3: Reward Redeemed -5,000 */}
        <div className="py-2.5 px-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-400 shrink-0">
              <Gift className="h-3.5 w-3.5" />
            </span>
            <div>
              <div className="text-xs sm:text-sm font-bold text-slate-200">Reward Redeemed</div>
              {!compact && (
                <div className="text-[11px] text-slate-400 font-mono">
                  Rewards Store Order · Fulfilled
                </div>
              )}
            </div>
          </div>
          <div className="text-right font-mono">
            <span className="text-xs sm:text-sm font-black text-rose-400">-5,000</span>
            {!compact && <div className="text-[10px] text-slate-400">Bal: 9,000 PTS</div>}
          </div>
        </div>
      </div>
    </div>
  );

  // COMPACT HERO MODE (#7 & #8)
  if (mode === 'hero') {
    return (
      <div className="relative rounded-2xl bg-[#060b18]/95 border border-white/[0.13] shadow-[0_32px_80px_-15px_rgba(0,0,0,0.92),0_0_1px_1px_rgba(16,185,129,0.14)] overflow-hidden backdrop-blur-md">
        {/* Top Specular Reflection Line */}
        <div
          className="h-[1px] w-full bg-gradient-to-r from-transparent via-emerald-400/55 to-cyan-400/40"
          aria-hidden="true"
        />

        {/* #9: Decorative Browser Bar */}
        <div className="px-4 py-3 bg-[#070e20] border-b border-slate-800/90 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
            </div>
            <div className="ml-2 px-2.5 py-1 rounded-lg bg-[#060b18] border border-slate-800 font-mono text-[11px] text-slate-200 truncate">
              propnation.app/dashboard
            </div>
          </div>

          <span className="px-2 py-0.5 rounded bg-emerald-500/12 border border-emerald-500/30 font-mono text-[10px] font-bold text-emerald-300 shrink-0">
            PRODUCT PREVIEW
          </span>
        </div>

        {/* Actual Dashboard Top Appbar (Cropped for Hero #7) */}
        <div className="px-4 py-2.5 bg-[#070e20]/80 border-b border-slate-800/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-[#06090e] border border-slate-700 p-0.5 flex items-center justify-center shrink-0">
              <img src="/pn-logo-hd.png?v=3" alt="PN" className="h-full w-full object-contain rounded" />
            </div>
            <span className="text-xs font-black text-white tracking-tight">TRADER PORTAL</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
              ACTIVE
            </span>
          </div>

          {/* #8: Real-looking notification state */}
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold transition-all duration-500 ${
              phase >= 2
                ? 'bg-emerald-500/20 border border-emerald-500/45 text-emerald-300 shadow-[0_0_18px_rgba(16,185,129,0.25)]'
                : 'bg-slate-900 border border-slate-800 text-slate-300'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">
              {phase >= 2 ? '✓ Purchase Verified · +2,500 Points' : 'Demo Preview Mode'}
            </span>
          </div>
        </div>

        {/* Cropped Real Dashboard Workspace: Mini Sidebar Rail + Main Cards */}
        <div className="grid grid-cols-12">
          {/* Mini Actual Sidebar Rail */}
          <div className="hidden sm:flex sm:col-span-2 bg-[#070e20] border-r border-slate-800/80 py-4 flex-col items-center gap-2.5">
            {navItems.slice(0, 6).map((item, idx) => {
              const Icon = item.icon;
              const isActive = idx === 0;
              return (
                <div
                  key={item.id}
                  title={item.label}
                  className={`h-8 w-8 rounded-xl flex items-center justify-center transition-colors ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/35'
                      : 'text-slate-400 bg-slate-900/50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
              );
            })}
          </div>

          {/* Main Focused Region (#7: AVAILABLE POINTS 10,000->12,500, REWARD PROGRESS iPhone 60%->75%, RECENT ACTIVITY) */}
          <div className="col-span-12 sm:col-span-10 p-4 sm:p-5 space-y-3.5 bg-[#060b18]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {renderPointsCard(true)}
              {renderRewardProgressCard(true)}
            </div>
            {renderRecentActivityList(true)}
          </div>
        </div>
      </div>
    );
  }

  // FULL INTERACTIVE DASHBOARD SHOWCASE MODE (#2–#6, #9–#13, #35–#36)
  return (
    <div className="space-y-6">
      {/* Desktop & Tablet Full Browser Frame + Real Application Workspace (#35) */}
      <div className="hidden md:block relative rounded-3xl bg-[#060b18] border border-white/[0.12] shadow-[0_36px_90px_-20px_rgba(0,0,0,0.92),0_0_1px_1px_rgba(16,185,129,0.14)] overflow-hidden">
        {/* Top Specular Edge */}
        <div
          className="h-[1px] w-full bg-gradient-to-r from-transparent via-emerald-400/50 to-cyan-400/40"
          aria-hidden="true"
        />

        {/* #3 & #9: Decorative Browser Frame */}
        <div className="px-5 py-3 bg-[#050914] border-b border-slate-800/90 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-500/80" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
            <span className="ml-3 px-3.5 py-1 rounded-lg bg-[#070e20] border border-slate-800 font-mono text-xs text-slate-200 flex items-center gap-2">
              <span className="text-emerald-400">https://</span>
              <span>propnation.app/dashboard</span>
              {activeTab !== 'Dashboard' && (
                <span className="text-slate-400">
                  /{activeTab.toLowerCase().replace(/\s+/g, '-')}
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Live Notification Toast inside Browser Bar */}
            <div
              className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono transition-all duration-500 ${
                phase >= 2
                  ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                  : 'bg-[#070e20] border border-slate-800 text-slate-300'
              }`}
            >
              <Bell className="h-3.5 w-3.5 text-emerald-400" />
              <span>
                {phase >= 2
                  ? '✓ Purchase Verified · +2,500 Points Credited'
                  : 'Product Preview · Controlled Demo Data'}
              </span>
            </div>

            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 font-mono text-[10px] font-bold text-slate-300 uppercase">
              DEMO DATA
            </span>
          </div>
        </div>

        {/* Actual Dashboard Layout (`src/app/dashboard/layout.tsx`): Sidebar + Top Appbar + Main Content */}
        <div className="grid grid-cols-12 min-h-[580px]">
          {/* #10: Actual PropNationSidebar Component Structure */}
          <aside className="col-span-3 bg-[#070e20] border-r border-[#14234b]/60 flex flex-col justify-between p-4 select-none">
            <div className="space-y-5">
              {/* Brand Header from PropNationSidebar */}
              <div className="flex items-center justify-between pb-3.5 border-b border-[#14234b]/50 px-1.5">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-[#06090e] border border-slate-800 p-0.5 flex items-center justify-center shrink-0">
                    <img
                      src="/pn-logo-hd.png?v=3"
                      alt="Prop Nation PN Logo"
                      className="h-full w-full object-contain rounded-lg"
                    />
                  </div>
                  <span className="text-sm font-black tracking-tight flex items-center">
                    <span className="text-white">PROP</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 ml-1">
                      NATION
                    </span>
                    <span className="text-[9px] font-semibold text-emerald-400 align-super ml-0.5">
                      ®
                    </span>
                  </span>
                </div>
              </div>

              {/* Navigation Items (#10: Dashboard, Prop Firms, My Purchases, Points, Rewards, Redemptions, Profile) */}
              <div className="space-y-1">
                <div className="px-2.5 pb-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  TRADER PORTAL NAVIGATION
                </div>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/35 shadow-2xs'
                          : 'text-slate-300 hover:text-white hover:bg-white/[0.04] border border-transparent'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon
                          className={`h-4 w-4 ${
                            isActive ? 'text-emerald-400' : 'text-slate-400'
                          }`}
                        />
                        <span>{item.label}</span>
                      </span>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-900 border border-slate-700 text-emerald-400">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Demo Trader Profile Box (Sanitized per #33) */}
            <div className="p-3 rounded-xl bg-[#060b18] border border-[#14234b]/60 flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-black text-xs text-emerald-300 shrink-0">
                  PT
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">Pro Trader (Demo)</div>
                  <div className="text-[10px] font-mono text-emerald-400">
                    {displayedPoints.toLocaleString()} PTS
                  </div>
                </div>
              </div>
              <Badge variant="success" className="text-[9px] px-1.5 py-0.5">
                ACTIVE
              </Badge>
            </div>
          </aside>

          {/* Main Application Pane (`src/app/dashboard/layout.tsx` + `src/app/dashboard/page.tsx`) */}
          <div className="col-span-9 flex flex-col bg-[#060b18]">
            {/* Actual Top Desktop Appbar */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-[#070e20]">
              <div className="flex items-center gap-2.5">
                <span className="text-xs uppercase tracking-wider font-bold text-slate-400">
                  Trader Portal
                </span>
                <span className="text-slate-600">/</span>
                <span className="text-xs font-bold text-white">{activeTab}</span>
                <span className="ml-2 bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-md font-bold text-[10px]">
                  ACTIVE · DEMO
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-[#0c1938] border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold text-blue-300">
                  <Wallet className="h-3.5 w-3.5 text-blue-400" />
                  <span>Wallet: ${(displayedPoints / 100).toFixed(2)}</span>
                </div>

                <div className="flex items-center gap-1.5 bg-[#0c2422] border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold text-emerald-300">
                  <Coins className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{displayedPoints.toLocaleString()} PTS</span>
                </div>

                <Link href="/dashboard/purchases/new">
                  <Button
                    size="sm"
                    className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                  >
                    <PlusCircle className="h-3.5 w-3.5 mr-1" />
                    Submit Proof
                  </Button>
                </Link>
              </div>
            </div>

            {/* Active Workspace Content */}
            <div className="p-6 space-y-5 flex-1">
              {activeTab === 'Dashboard' && (
                <>
                  {/* Welcome Banner from src/app/dashboard/page.tsx */}
                  <div className="rounded-2xl border border-[#14234b]/80 bg-gradient-to-br from-[#080f24] via-[#060b1c] to-[#041a18] p-4 sm:p-5 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-[900] text-white tracking-tight">
                          Welcome back, Trader
                        </h3>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-950/60 text-blue-300 border border-blue-500/30">
                          PRO TRADER
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/40 text-amber-300 border border-amber-500/30">
                          <Crown className="h-3 w-3 text-amber-400" />
                          Silver Tier (1.2x Multiplier)
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">
                        Track your prop-firm challenge verifications, points balance, and reward redemptions in one workspace.
                      </p>
                    </div>

                    <Link href="/dashboard/purchases/new" className="shrink-0">
                      <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-9 px-4 rounded-xl text-xs">
                        <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
                        Submit Purchase Proof
                      </Button>
                    </Link>
                  </div>

                  {/* Row 1: Actual Points Card (#11) + Actual Reward Progress (#12) */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {renderPointsCard(false)}
                    {renderRewardProgressCard(false)}
                  </div>

                  {/* Row 2: Recent Purchase Submissions + Actual Recent Activity (#13) */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Left: Recent Purchase Submissions from src/app/dashboard/page.tsx */}
                    <div className="rounded-2xl border border-slate-800/90 bg-[#080f1e] p-4 sm:p-5 space-y-3">
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                            <ShoppingBag className="h-3.5 w-3.5" />
                          </div>
                          <h4 className="font-[900] text-white text-xs sm:text-sm uppercase tracking-wider font-mono">
                            PURCHASE VERIFICATION
                          </h4>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold">
                          2 Verified
                        </span>
                      </div>

                      <div className="divide-y divide-slate-800/70">
                        <div className="py-2.5 flex items-center justify-between gap-3">
                          <div>
                            <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                              <span>$100 Challenge Account</span>
                              <span className="text-[10px] font-mono text-slate-400">#ORD-8492</span>
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Partner Referral Applied • $100 USD
                            </div>
                          </div>
                          <div className="text-right space-y-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="h-3 w-3" /> APPROVED
                            </span>
                            <div className="text-xs font-mono font-bold text-emerald-400">
                              +2,500 PTS
                            </div>
                          </div>
                        </div>

                        <div className="py-2.5 flex items-center justify-between gap-3">
                          <div>
                            <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                              <span>$200 Evaluation Account</span>
                              <span className="text-[10px] font-mono text-slate-400">#ORD-8510</span>
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Invoice Proof Uploaded • $200 USD
                            </div>
                          </div>
                          <div className="text-right space-y-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-950/60 text-blue-400 border border-blue-500/30">
                              <ShieldCheck className="h-3 w-3" /> UNDER REVIEW
                            </span>
                            <div className="text-xs font-mono font-bold text-amber-400">
                              +5,000 PTS
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actual Recent Activity (#13) */}
                    {renderRecentActivityList(false)}
                  </div>
                </>
              )}

              {activeTab === 'Prop Firms' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-black text-white">Participating Prop Firms</h3>
                      <p className="text-xs text-slate-300">
                        Purchase an eligible challenge using our partner referral code to earn points.
                      </p>
                    </div>
                    <Link href="/prop-firms">
                      <Button size="sm" variant="outline" className="text-xs">
                        Full Directory →
                      </Button>
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { title: 'Prop Firm Offer 01', tier: '$100 Challenge', pts: '2,500 Points' },
                      { title: 'Prop Firm Offer 02', tier: '$200 Challenge', pts: '5,000 Points' },
                    ].map((offer) => (
                      <div
                        key={offer.title}
                        className="p-4 rounded-2xl bg-[#080f1e] border border-slate-800 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-sm">{offer.title}</span>
                          <Badge variant="success">Eligible Purchase</Badge>
                        </div>
                        <div className="p-3 rounded-xl bg-[#060b18] border border-slate-800 flex items-center justify-between">
                          <span className="text-xs text-slate-300 font-semibold">{offer.tier}</span>
                          <span className="text-sm font-mono font-extrabold text-emerald-400">
                            {offer.pts}
                          </span>
                        </div>
                        <Link
                          href="/prop-firms"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:underline"
                        >
                          <span>View Offer →</span>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'My Purchases' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-black text-white">Submit Purchase for Verification</h3>
                      <p className="text-xs text-slate-300">
                        Upload your checkout invoice or order confirmation to credit reward points.
                      </p>
                    </div>
                    <Badge variant="info">Verification Queue</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-[#080f1e] border border-slate-800">
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-slate-400">Prop Firm</label>
                      <div className="px-3 py-2 rounded-xl bg-[#060b18] border border-slate-800 text-xs font-semibold text-white">
                        Eligible Partner Prop Firm
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-slate-400">Account / Order ID</label>
                      <div className="px-3 py-2 rounded-xl bg-[#060b18] border border-slate-800 text-xs font-mono text-white">
                        #ORD-84920
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-slate-400">Purchase Date</label>
                      <div className="px-3 py-2 rounded-xl bg-[#060b18] border border-slate-800 text-xs font-mono text-white">
                        2026-10-03
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-slate-400">Upload Proof</label>
                      <div className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-300 flex items-center gap-2">
                        <FileImage className="h-3.5 w-3.5" />
                        <span>invoice-proof.png (Verified)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'Points' && (
                <div className="space-y-4">
                  {renderPointsCard(false)}
                  {renderRecentActivityList(false)}
                </div>
              )}

              {activeTab === 'Rewards' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-white">Rewards Store Catalog</h3>
                    <Link href="/rewards">
                      <Button size="sm" variant="primary" className="text-xs">
                        Open Full Store →
                      </Button>
                    </Link>
                  </div>
                  <div className="grid grid-cols-3 gap-3.5">
                    {[
                      {
                        name: 'iPhone',
                        pts: '100,000 Points',
                        stock: '8 in stock',
                        img: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&auto=format&fit=crop&q=80',
                      },
                      {
                        name: 'Headphones',
                        pts: '20,000 Points',
                        stock: '20 in stock',
                        img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80',
                      },
                      {
                        name: 'Sneakers',
                        pts: '15,000 Points',
                        stock: '15 in stock',
                        img: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=400&auto=format&fit=crop&q=80',
                      },
                    ].map((item) => (
                      <div
                        key={item.name}
                        className="rounded-xl bg-[#080f1e] border border-slate-800 overflow-hidden p-3 space-y-2.5"
                      >
                        <img
                          src={item.img}
                          alt={item.name}
                          className="h-24 w-full object-cover rounded-lg"
                        />
                        <div className="text-xs font-bold text-white">{item.name}</div>
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-emerald-400 font-bold">{item.pts}</span>
                          <span className="text-slate-400">{item.stock}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'Redemptions' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#080f1e] border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-mono text-emerald-400 font-bold">
                          Redemption Order · Demo Preview
                        </div>
                        <div className="text-base font-black text-white">
                          Premium Headphones · 20,000 Points
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-950/60 text-purple-300 border border-purple-500/30">
                        <Truck className="h-3.5 w-3.5" /> SHIPPED
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center font-mono text-xs">
                      <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold">
                        ✓ Confirmed
                      </div>
                      <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold">
                        ✓ Processing
                      </div>
                      <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/45 text-white font-bold">
                        ✓ Shipped
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#060b18] border border-slate-800 text-slate-400">
                        ○ Delivered
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'Profile' && (
                <div className="p-5 rounded-2xl bg-[#080f1e] border border-slate-800 space-y-3">
                  <div className="text-sm font-black text-white">Trader Profile &amp; Delivery Settings</div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-[#060b18] border border-slate-800">
                      <div className="text-slate-400 font-mono text-[10px]">ACCOUNT TIER</div>
                      <div className="font-bold text-white mt-0.5">Pro Trader · Silver (1.2x)</div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#060b18] border border-slate-800">
                      <div className="text-slate-400 font-mono text-[10px]">VERIFICATION STATUS</div>
                      <div className="font-bold text-emerald-400 mt-0.5">Active &amp; Eligible</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* #35 & #36: Mobile Responsive Product Showcase (Selected real components without tiny unreadable text) */}
      <div className="md:hidden rounded-2xl bg-[#060b18] border border-white/[0.12] overflow-hidden shadow-2xl">
        {/* Browser Header */}
        <div className="px-4 py-3 bg-[#050914] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
            <span className="ml-2 font-mono text-xs text-slate-200">propnation.app/dashboard</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 font-mono text-[10px] font-bold text-emerald-300">
            PREVIEW
          </span>
        </div>

        {/* Selected Real Components on Mobile (#35, #36): Points Balance + Reward Progress + Recent Activity */}
        <div className="p-4 space-y-4">
          {renderPointsCard(true)}
          {renderRewardProgressCard(true)}
          {renderRecentActivityList(true)}

          <Link
            href="/dashboard"
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm transition-all"
          >
            <span>EXPLORE DASHBOARD</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
