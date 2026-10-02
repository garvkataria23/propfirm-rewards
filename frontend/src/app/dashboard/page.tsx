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
  Layers,
  Sparkles,
  ShoppingBag,
  AlertCircle,
  Truck,
  ExternalLink,
  Wallet,
  ArrowUpRight,
  ShieldCheck,
  Crown,
  Zap,
  Flame,
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
  propFirm: { name: string; logoUrl: string };
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userEmail = user?.email || (typeof window !== 'undefined' ? localStorage.getItem('propfirm_saved_email') : null) || 'trader@example.com';
    const localPurchases = userDataStore.getUserPurchases(userEmail);
    const localLedger = userDataStore.getUserLedger(userEmail);
    const localRedemptions = userDataStore.getUserRedemptions(userEmail);
    const available = userDataStore.calculateAvailablePoints(userEmail);
    const pending = userDataStore.calculatePendingPoints(userEmail);

    Promise.all([
      api.get<PointsSummary>('/points/summary'),
      api.get<PurchaseSubmission[]>('/purchases'),
      api.get<{ transactions: PointsTransaction[] }>('/points/ledger', { limit: 5 }),
      api.get<Redemption[]>('/redemptions'),
    ])
      .then(([sum, purchases, ledger, redemptions]) => {
        setSummary(sum || {
          availablePoints: available,
          totalPointsEarned: available + 22000,
          totalPointsRedeemed: 22000,
          pendingPoints: pending,
          pendingPurchases: localPurchases.filter((p) => p.status === 'PENDING').length,
          totalVerifiedPurchases: localPurchases.filter((p) => p.status === 'APPROVED').length,
          activeRedemptions: localRedemptions.filter((r) => r.status === 'SHIPPED').length,
        });
        setRecentPurchases(purchases && purchases.length > 0 ? purchases.slice(0, 5) : (localPurchases.slice(0, 5) as any));
        setRecentTransactions(ledger?.transactions && ledger.transactions.length > 0 ? ledger.transactions : (localLedger.slice(0, 5) as any));
        setRecentRedemptions(redemptions && redemptions.length > 0 ? redemptions.slice(0, 3) : (localRedemptions.slice(0, 3) as any));
      })
      .catch(() => {
        setSummary({
          availablePoints: available,
          totalPointsEarned: available + 22000,
          totalPointsRedeemed: 22000,
          pendingPoints: pending,
          pendingPurchases: localPurchases.filter((p) => p.status === 'PENDING').length,
          totalVerifiedPurchases: localPurchases.filter((p) => p.status === 'APPROVED').length,
          activeRedemptions: localRedemptions.filter((r) => r.status === 'SHIPPED').length,
        });
        setRecentPurchases(localPurchases.slice(0, 5) as any);
        setRecentTransactions(localLedger.slice(0, 5) as any);
        setRecentRedemptions(localRedemptions.slice(0, 3) as any);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-500/30">
            APPROVED
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-500/30">
            PENDING
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-500/30">
            UNDER REVIEW
          </span>
        );
      case 'MORE_INFO_REQUIRED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/60 dark:text-purple-400 dark:border-purple-500/30">
            ACTION NEEDED
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-500/30">
            REJECTED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
            {status}
          </span>
        );
    }
  };

  const getRedemptionStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-500/30">
            DELIVERED
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/60 dark:text-purple-400 dark:border-purple-500/30">
            SHIPPED
          </span>
        );
      case 'PROCESSING':
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-500/30">
            {status}
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-500/30">
            PENDING
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300">
            {status}
          </span>
        );
    }
  };

  const availablePoints = summary?.availablePoints ?? user?.points?.available ?? 0;
  const totalEarned = summary?.totalPointsEarned ?? user?.points?.lifetimeEarned ?? 0;
  const totalRedeemed = summary?.totalPointsRedeemed ?? user?.points?.lifetimeRedeemed ?? 0;
  const pendingPoints = summary?.pendingPoints ?? user?.points?.pending ?? 0;

  return (
    <div className="space-y-6">
      {/* Live Community Activity Ribbon */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 px-3.5 rounded-xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
        <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
          <Flame className="h-3.5 w-3.5 fill-emerald-500 text-emerald-500 animate-pulse" />
          Live Community Feed:
        </span>
        <div className="flex items-center gap-4 shrink-0 font-medium">
          <span>🎉 <strong>@Marco_FX</strong> verified Funding Pips $100K (+4,500 PTS)</span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span>⚡ <strong>@Lucas_R</strong> redeemed Apple AirPods Pro 2</span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span>💰 <strong>@Vikram_T</strong> withdrew $250.00 USDT</span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span>🚀 <strong>14 challenges</strong> verified in past 24 hrs</span>
        </div>
      </div>

      {/* Welcome & Fast Overview Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs transition-colors">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Welcome back, {user?.name || 'Trader'} 👋
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">
              PRO TRADER
            </span>
            <Link href="/dashboard/wallet" className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30 hover:scale-105 transition-transform">
              <Crown className="h-3 w-3 text-amber-500" />
              <span>Silver Tier (1.2x PTS)</span>
            </Link>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track your verified prop firm challenges, points maturation, and redeem gear.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/dashboard/purchases/new">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs">
              <PlusCircle className="h-4 w-4 mr-1.5" />
              Submit Purchase Proof
            </Button>
          </Link>
          <Link href="/dashboard/wallet">
            <Button variant="outline" size="sm" className="border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 shadow-xs font-medium">
              <Wallet className="h-4 w-4 mr-1.5 text-blue-600 dark:text-blue-400" />
              Trader Wallet
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Primary Points Stat Cards (Light & Dark Compatible) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Points */}
        <div className="rounded-2xl border border-emerald-200/80 dark:border-emerald-500/30 bg-gradient-to-br from-white to-emerald-50/40 dark:from-slate-900 dark:to-emerald-950/20 p-5 space-y-3 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Available Spendable Points
            </span>
            <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {availablePoints.toLocaleString()}
            </div>
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              ≈ ${(availablePoints / 100).toFixed(2)} USD Cash Value
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-emerald-100/60 dark:border-emerald-900/30">
            Ready to redeem in rewards store or cash out
          </p>
        </div>

        {/* Escrow / Pending Clearance */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Escrow / Pending Review
            </span>
            <div className="h-8 w-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {pendingPoints.toLocaleString()}
            </div>
            <div className="text-xs font-bold text-amber-700 dark:text-amber-400 mt-1">
              ≈ ${(pendingPoints / 100).toFixed(2)} USD In Clearance
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
            Under 7-14 day prop firm verification window
          </p>
        </div>

        {/* Total Earned */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Points Earned
            </span>
            <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {totalEarned.toLocaleString()}
            </div>
            <div className="text-xs font-bold text-blue-700 dark:text-blue-400 mt-1">
              ≈ ${(totalEarned / 100).toFixed(2)} USD Lifetime
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
            All-time accumulated points across purchases
          </p>
        </div>

        {/* Total Redeemed */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Redeemed & Paid Out
            </span>
            <div className="h-8 w-8 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Gift className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {totalRedeemed.toLocaleString()}
            </div>
            <div className="text-xs font-bold text-purple-700 dark:text-purple-400 mt-1">
              ≈ ${(totalRedeemed / 100).toFixed(2)} USD Liquidated
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
            Points spent on tech gear, crypto, or gift cards
          </p>
        </div>
      </div>

      {/* Secondary Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Pending Purchases</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {summary?.pendingPurchases || 0} Submissions
            </div>
          </div>
          <Link href="/dashboard/purchases">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">View All →</span>
          </Link>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Verified Purchases</div>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {summary?.totalVerifiedPurchases || 0} Approved
            </div>
          </div>
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        </div>

        <div className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Active Redemptions</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {summary?.activeRedemptions || 0} Orders
            </div>
          </div>
          <Link href="/dashboard/redemptions">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">Track Delivery →</span>
          </Link>
        </div>
      </div>

      {/* Split Grid: Recent Purchases & Recent Point Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Purchases */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs p-6 space-y-4 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Recent Purchase Submissions</h3>
            </div>
            <Link href="/dashboard/purchases">
              <Button variant="ghost" size="sm" className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700">
                View All
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>

          {recentPurchases.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No purchase proof submitted yet.</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Purchase an eligible prop firm account to start earning points.
              </p>
              <Link href="/dashboard/purchases/new" className="inline-block pt-2">
                <Button size="sm">Submit Your First Purchase Proof</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentPurchases.map((sub) => (
                <div key={sub.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{sub.propFirm.name}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        ({sub.orderId})
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {sub.accountType} • ${sub.purchaseAmountUsd} • {formatDate(sub.createdAt)}
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <div>{getStatusBadge(sub.status)}</div>
                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      +{sub.pointsAwarded.toLocaleString()} PTS
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Points Transactions */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs p-6 space-y-4 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Points Ledger Activity</h3>
            </div>
            <Link href="/dashboard/wallet">
              <Button variant="ghost" size="sm" className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700">
                Full Ledger
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No ledger records yet.</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Purchase an eligible prop-firm account to begin accumulating points.
              </p>
              <Link href="/prop-firms" className="inline-block pt-2">
                <Button size="sm" variant="outline">Browse Prop Firms</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                      {tx.description}
                    </p>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500">{formatDate(tx.createdAt)}</div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-sm font-black ${
                        tx.points > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {tx.points > 0 ? `+${tx.points.toLocaleString()}` : tx.points.toLocaleString()} PTS
                    </span>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                      Bal: {tx.balanceAfter.toLocaleString()} PTS
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Active Redemptions Widget */}
      {recentRedemptions.length > 0 && (
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs p-6 space-y-4 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Active Redemptions & Deliveries</h3>
            </div>
            <Link href="/dashboard/redemptions">
              <Button variant="ghost" size="sm" className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700">
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
