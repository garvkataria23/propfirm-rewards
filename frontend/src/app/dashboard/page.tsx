'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import {
  Coins,
  TrendingUp,
  Clock,
  CheckCircle2,
  Gift,
  ArrowRight,
  PlusCircle,
  Sparkles,
  ShoppingBag,
  Truck,
  Wallet,
  ShieldCheck,
  Crown,
  Flame,
  ArrowUpRight,
  Copy,
  Check,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface PointsSummary {
  availablePoints: number;
  totalPointsEarned: number;
  totalPointsRedeemed: number;
  pendingPoints: number;
  pendingPurchases: number;
  totalVerifiedPurchases: number;
  activeRedemptions: number;
}

interface PurchaseSubmission {
  id: string;
  submissionCode: string;
  propFirm: { name: string; logoUrl?: string };
  accountType: string;
  orderId: string;
  purchaseAmountUsd: number;
  pointsAwarded: number;
  status: string;
  createdAt: string;
}

interface PointsTransaction {
  id: string;
  type: string;
  points: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}

interface Redemption {
  id: string;
  redemptionCode: string;
  status: string;
  reward: { name: string; imageUrl: string };
  pointsSpent: number;
  createdAt: string;
  trackingNumber?: string;
  courier?: string;
}

import { userDataStore } from '@/lib/userDataStore';

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<PointsSummary | null>(null);
  const [recentPurchases, setRecentPurchases] = useState<PurchaseSubmission[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<PointsTransaction[]>([]);
  const [recentRedemptions, setRecentRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  useEffect(() => {
    const userEmail =
      user?.email ||
      (typeof window !== 'undefined' ? localStorage.getItem('propfirm_saved_email') : null) ||
      'anonymous';
    const localPurchases = userDataStore.getUserPurchases(userEmail);
    const localLedger = userDataStore.getUserLedger(userEmail);
    const localRedemptions = userDataStore.getUserRedemptions(userEmail);
    const available = userDataStore.calculateAvailablePoints(userEmail);
    const pending = userDataStore.calculatePendingPoints(userEmail);
    const totalEarned = userDataStore.calculateTotalEarnedPoints(userEmail);
    const totalRedeemed = userDataStore.calculateTotalRedeemedPoints(userEmail);

    const fallbackSummary: PointsSummary = {
      availablePoints: available,
      totalPointsEarned: totalEarned,
      totalPointsRedeemed: totalRedeemed,
      pendingPoints: pending,
      pendingPurchases: localPurchases.filter((p) => p.status === 'PENDING' || p.status === 'UNDER_REVIEW').length,
      totalVerifiedPurchases: localPurchases.filter((p) => p.status === 'APPROVED').length,
      activeRedemptions: localRedemptions.filter((r) => r.status === 'SHIPPED' || r.status === 'PROCESSING' || r.status === 'CONFIRMED').length,
    };

    // Hydrate immediately from current user's clean store
    setSummary(fallbackSummary);
    setRecentPurchases(localPurchases.slice(0, 5) as any);
    setRecentTransactions(localLedger.slice(0, 5) as any);
    setRecentRedemptions(localRedemptions.slice(0, 3) as any);
    setLoading(false);

    Promise.all([
      api.get<PointsSummary>('/points/summary').catch(() => null),
      api.get<PurchaseSubmission[]>('/purchases').catch(() => null),
      api.get<{ transactions: PointsTransaction[] }>('/points/ledger', { limit: 5 }).catch(() => null),
      api.get<Redemption[]>('/redemptions').catch(() => null),
    ]).then(([sum, purchases, ledger, redemptions]) => {
      if (sum) setSummary(sum);
      if (Array.isArray(purchases) && purchases.length > 0) {
        setRecentPurchases(purchases.slice(0, 5));
      }
      if (ledger?.transactions && ledger.transactions.length > 0) {
        setRecentTransactions(ledger.transactions);
      }
      if (Array.isArray(redemptions) && redemptions.length > 0) {
        setRecentRedemptions(redemptions.slice(0, 3));
      }
    });
  }, [user]);

  const copyUniversalCode = () => {
    navigator.clipboard.writeText('NATION');
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-500/30">
            <CheckCircle2 className="h-3 w-3" /> APPROVED
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-500/30">
            <Clock className="h-3 w-3" /> PENDING
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-500/30">
            <ShieldCheck className="h-3 w-3" /> UNDER REVIEW
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-500/30">
            REJECTED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300">
            {status}
          </span>
        );
    }
  };

  const getRedemptionStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400">
            ✓ DELIVERED
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/60 dark:text-purple-400">
            <Truck className="h-3 w-3" /> SHIPPED
          </span>
        );
      case 'PROCESSING':
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-400">
            <Clock className="h-3 w-3" /> {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  const availablePoints = summary?.availablePoints ?? user?.points?.available ?? 0;
  const totalEarned = summary?.totalPointsEarned ?? user?.points?.lifetimeEarned ?? 0;
  const totalRedeemed = summary?.totalPointsRedeemed ?? user?.points?.lifetimeRedeemed ?? 0;
  const pendingPoints = summary?.pendingPoints ?? user?.points?.pending ?? 0;

  // Gamification Tier Progress
  const nextTierTarget = 25000;
  const tierProgress = Math.min(100, Math.round((availablePoints / nextTierTarget) * 100));
  const pointsToGold = Math.max(0, nextTierTarget - availablePoints);

  return (
    <div className="space-y-6">
      {/* 1. Live Community Activity Ticker */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-slate-100/80 to-purple-500/10 dark:from-emerald-950/30 dark:via-slate-900/80 dark:to-purple-950/30 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 shadow-2xs backdrop-blur-sm">
        <span className="flex items-center gap-1.5 font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 shrink-0 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md text-[10px]">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
          Live Stream
        </span>
        <div className="flex items-center gap-4 shrink-0 font-medium text-xs">
          <span>🎉 <strong className="text-slate-900 dark:text-white">@Marco_FX</strong> verified Funding Pips $100K <span className="text-emerald-600 font-bold">(+4,500 PTS)</span></span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span>⚡ <strong className="text-slate-900 dark:text-white">@Lucas_R</strong> redeemed Apple AirPods Pro 2</span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span>💰 <strong className="text-slate-900 dark:text-white">@Vikram_T</strong> withdrew $250.00 USDT</span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span>🚀 <strong className="text-emerald-600 dark:text-emerald-400">14 challenges</strong> verified past 24 hrs</span>
        </div>
      </div>

      {/* 2. Luxury Trader Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 dark:border-[#14234b]/80 bg-gradient-to-br from-white via-slate-50/60 to-emerald-50/30 dark:from-[#080f24] dark:via-[#060b1c] dark:to-[#041a18] p-6 sm:p-7 shadow-sm transition-colors">
        {/* Subtle Decorative Ambient Radial */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 rounded-full bg-emerald-400/10 dark:bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-[900] text-slate-900 dark:text-white tracking-tight">
                Welcome back, {user?.name || 'Trader'} 👋
              </h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-500/30">
                PRO TRADER
              </span>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 shadow-2xs">
                <Crown className="h-3.5 w-3.5 text-amber-500" />
                <span>Silver Tier (1.2x Points Multiplier)</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Track your prop-firm challenge verifications, points maturation, and physical tech redemptions in real time.
            </p>

            {/* Gamification Progress Bar to Gold Tier */}
            <div className="pt-1 space-y-1.5 max-w-md">
              <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                <span>Gold Tier Progress ({tierProgress}%)</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{pointsToGold.toLocaleString('en-US')} PTS to 1.5x Multiplier</span>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
                  style={{ width: `${tierProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Action CTAs */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <button
              onClick={copyUniversalCode}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-purple-200 dark:border-purple-800/80 bg-purple-50/80 hover:bg-purple-100/80 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 text-xs font-bold transition-all shadow-2xs cursor-pointer group"
              title="Click to copy official referral code"
            >
              <span>Code:</span>
              <span className="font-mono bg-white dark:bg-purple-900/80 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-700 text-purple-900 dark:text-purple-100 font-black">
                NATION
              </span>
              {codeCopied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-purple-600 group-hover:scale-110 transition-transform" />}
            </button>

            <Link href="/dashboard/purchases/new">
              <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-11 px-5 rounded-xl shadow-md shadow-emerald-600/20 text-xs tracking-tight">
                <PlusCircle className="h-4 w-4 mr-1.5" />
                Submit Purchase Proof
              </Button>
            </Link>

            <Link href="/dashboard/wallet">
              <Button variant="outline" className="h-11 px-4 rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-bold text-xs shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800">
                <Wallet className="h-4 w-4 mr-1.5 text-emerald-600 dark:text-emerald-400" />
                Trader Wallet
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. The 4 Primary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Available Points */}
        <div className="rounded-2xl border border-emerald-200/90 dark:border-emerald-500/30 bg-gradient-to-br from-white via-white to-emerald-50/50 dark:from-[#08151f] dark:to-[#031d17] p-5 space-y-3.5 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Available Spendable Points
            </span>
            <div className="h-9 w-9 rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-500/20 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <Coins className="h-4.5 w-4.5" />
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-[900] font-mono text-slate-900 dark:text-white tracking-tight">
              {availablePoints.toLocaleString('en-US')}
            </div>
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
              <span>≈ ${(availablePoints / 100).toFixed(2)} USD Cash Value</span>
              <ArrowUpRight className="h-3 w-3" />
            </div>
          </div>
          <div className="pt-2 border-t border-emerald-100 dark:border-emerald-950/60 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between font-medium">
            <span>Ready to redeem or cash out</span>
            <Link href="/rewards" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center">
              Claim <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Card 2: Escrow / Pending Review */}
        <div className="rounded-2xl border border-amber-200/90 dark:border-amber-500/30 bg-gradient-to-br from-white via-white to-amber-50/40 dark:from-[#14120a] dark:to-[#171004] p-5 space-y-3.5 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Escrow / Pending Review
            </span>
            <div className="h-9 w-9 rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/20 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <Clock className="h-4.5 w-4.5" />
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-[900] font-mono text-slate-900 dark:text-white tracking-tight">
              {pendingPoints.toLocaleString('en-US')}
            </div>
            <div className="text-xs font-bold text-amber-700 dark:text-amber-400 mt-1 flex items-center gap-1">
              <span>≈ ${(pendingPoints / 100).toFixed(2)} USD In Clearance</span>
            </div>
          </div>
          <div className="pt-2 border-t border-amber-100 dark:border-amber-950/60 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between font-medium">
            <span>7-14 day prop firm window</span>
            <Link href="/dashboard/verification" className="text-amber-700 dark:text-amber-400 font-bold hover:underline flex items-center">
              Status <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Card 3: Total Points Earned */}
        <div className="rounded-2xl border border-sky-200/90 dark:border-sky-500/30 bg-gradient-to-br from-white via-white to-sky-50/40 dark:from-[#091526] dark:to-[#041221] p-5 space-y-3.5 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-sky-700 dark:text-sky-400">
              Total Points Earned
            </span>
            <div className="h-9 w-9 rounded-xl bg-sky-500 text-white shadow-md shadow-sky-500/20 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <TrendingUp className="h-4.5 w-4.5" />
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-[900] font-mono text-slate-900 dark:text-white tracking-tight">
              {totalEarned.toLocaleString('en-US')}
            </div>
            <div className="text-xs font-bold text-sky-700 dark:text-sky-400 mt-1 flex items-center gap-1">
              <span>≈ ${(totalEarned / 100).toFixed(2)} USD Lifetime Value</span>
            </div>
          </div>
          <div className="pt-2 border-t border-sky-100 dark:border-sky-950/60 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between font-medium">
            <span>All-time purchase rewards</span>
            <Link href="/dashboard/wallet" className="text-sky-600 dark:text-sky-400 font-bold hover:underline flex items-center">
              Ledger <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Card 4: Redeemed & Paid Out */}
        <div className="rounded-2xl border border-purple-200/90 dark:border-purple-500/30 bg-gradient-to-br from-white via-white to-purple-50/40 dark:from-[#150a24] dark:to-[#170529] p-5 space-y-3.5 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-400">
              Redeemed &amp; Paid Out
            </span>
            <div className="h-9 w-9 rounded-xl bg-purple-500 text-white shadow-md shadow-purple-500/20 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <Gift className="h-4.5 w-4.5" />
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-[900] font-mono text-slate-900 dark:text-white tracking-tight">
              {totalRedeemed.toLocaleString('en-US')}
            </div>
            <div className="text-xs font-bold text-purple-700 dark:text-purple-400 mt-1 flex items-center gap-1">
              <span>≈ ${(totalRedeemed / 100).toFixed(2)} USD Liquidated</span>
            </div>
          </div>
          <div className="pt-2 border-t border-purple-100 dark:border-purple-950/60 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between font-medium">
            <span>Tech gear, crypto, vouchers</span>
            <Link href="/dashboard/redemptions" className="text-purple-600 dark:text-purple-400 font-bold hover:underline flex items-center">
              History <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Secondary Quick Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-2xs flex items-center justify-between transition-colors">
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending Purchases</div>
            <div className="text-xl font-[900] text-slate-900 dark:text-white mt-0.5">
              {summary?.pendingPurchases || 0} Submissions
            </div>
          </div>
          <Link href="/dashboard/purchases">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">View All →</span>
          </Link>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-2xs flex items-center justify-between transition-colors">
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Verified Purchases</div>
            <div className="text-xl font-[900] text-emerald-600 dark:text-emerald-400 mt-0.5">
              {summary?.totalVerifiedPurchases || 2} Approved
            </div>
          </div>
          <div className="h-8 w-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-2xs flex items-center justify-between transition-colors">
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Redemptions</div>
            <div className="text-xl font-[900] text-slate-900 dark:text-white mt-0.5">
              {summary?.activeRedemptions || 0} Orders
            </div>
          </div>
          <Link href="/dashboard/redemptions">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">Track Delivery →</span>
          </Link>
        </div>
      </div>

      {/* 5. Split Grid: Institutional Purchase Ledger & Points Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Recent Purchases */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 space-y-4 transition-colors">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <h3 className="font-[900] text-slate-900 dark:text-white text-base">Recent Purchase Submissions</h3>
            </div>
            <Link href="/dashboard/purchases">
              <Button variant="ghost" size="sm" className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:text-blue-700">
                View All
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>

          {recentPurchases.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No purchase proof submitted yet.</p>
              <Link href="/dashboard/purchases/new" className="inline-block">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs">Submit Purchase Proof</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {recentPurchases.map((sub) => (
                <div key={sub.id} className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 px-2 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300 shrink-0">
                      {sub.propFirm.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{sub.propFirm.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">#{sub.orderId}</span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {sub.accountType} • ${sub.purchaseAmountUsd} • {formatDate(sub.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <div>{getStatusBadge(sub.status)}</div>
                    <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      +{sub.pointsAwarded.toLocaleString('en-US')} PTS
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Points Ledger Activity */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 space-y-4 transition-colors">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Coins className="h-4 w-4" />
              </div>
              <h3 className="font-[900] text-slate-900 dark:text-white text-base">Points Ledger Activity</h3>
            </div>
            <Link href="/dashboard/wallet">
              <Button variant="ghost" size="sm" className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:text-blue-700">
                Full Ledger
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No ledger records yet.</p>
              <Link href="/prop-firms" className="inline-block">
                <Button size="sm" variant="outline">Browse Prop Firms</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 px-2 rounded-xl transition-colors">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                      {tx.description}
                    </p>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">{formatDate(tx.createdAt)}</div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-sm font-black font-mono ${
                        tx.points > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {tx.points > 0 ? `+${tx.points.toLocaleString('en-US')}` : tx.points.toLocaleString('en-US')} PTS
                    </span>
                    <div className="text-[10px] text-slate-400 font-mono font-medium">
                      Bal: {tx.balanceAfter.toLocaleString('en-US')} PTS
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 6. Active Redemptions Widget */}
      {recentRedemptions.length > 0 && (
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 space-y-4 transition-colors">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Truck className="h-4 w-4" />
              </div>
              <h3 className="font-[900] text-slate-900 dark:text-white text-base">Active Redemptions &amp; Deliveries</h3>
            </div>
            <Link href="/dashboard/redemptions">
              <Button variant="ghost" size="sm" className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:text-blue-700">
                View All
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {recentRedemptions.map((rdm) => (
              <div
                key={rdm.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={rdm.reward.imageUrl}
                    alt={rdm.reward.name}
                    className="h-12 w-12 rounded-lg object-cover bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[160px]">
                      {rdm.reward.name}
                    </h4>
                    <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                      {rdm.redemptionCode}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Status:</span>
                  {getRedemptionStatusBadge(rdm.status)}
                </div>

                {rdm.trackingNumber && (
                  <div className="text-[11px] text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400">Tracking: </span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{rdm.trackingNumber}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
