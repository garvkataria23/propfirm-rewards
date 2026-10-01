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

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<PointsSummary | null>(null);
  const [recentPurchases, setRecentPurchases] = useState<PurchaseSubmission[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<PointsTransaction[]>([]);
  const [recentRedemptions, setRecentRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<PointsSummary>('/points/summary'),
      api.get<PurchaseSubmission[]>('/purchases'),
      api.get<{ transactions: PointsTransaction[] }>('/points/ledger', { limit: 5 }),
      api.get<Redemption[]>('/redemptions'),
    ])
      .then(([sum, purchases, ledger, redemptions]) => {
        setSummary(sum);
        setRecentPurchases(purchases.slice(0, 5));
        setRecentTransactions(ledger.transactions || []);
        setRecentRedemptions(redemptions.slice(0, 3));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            APPROVED
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            PENDING
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            UNDER REVIEW
          </span>
        );
      case 'MORE_INFO_REQUIRED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            ACTION NEEDED
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            REJECTED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  const getRedemptionStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            DELIVERED
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            SHIPPED
          </span>
        );
      case 'PROCESSING':
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            {status}
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            PENDING
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
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
    <div className="space-y-8">
      {/* Welcome & Fast Overview Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Welcome back, {user?.name || 'Trader'} 👋
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              PRO TRADER
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
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
            <Button variant="outline" size="sm" className="border-slate-300 bg-white text-slate-700 hover:bg-slate-50 shadow-xs font-medium">
              <Wallet className="h-4 w-4 mr-1.5 text-blue-600" />
              Trader Wallet
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Primary Points Stat Cards (Clean Whitish Aesthetic) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Points */}
        <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-white to-emerald-50/40 p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Available Spendable Points
            </span>
            <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {availablePoints.toLocaleString()}
            </div>
            <div className="text-xs font-bold text-emerald-600 mt-1">
              ≈ ${(availablePoints / 100).toFixed(2)} USD Cash Value
            </div>
          </div>
          <p className="text-xs text-slate-500 pt-1 border-t border-emerald-100/60">
            Ready to redeem in rewards store or cash out
          </p>
        </div>

        {/* Escrow / Pending Clearance */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Escrow / Pending Review
            </span>
            <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {pendingPoints.toLocaleString()}
            </div>
            <div className="text-xs font-bold text-amber-700 mt-1">
              ≈ ${(pendingPoints / 100).toFixed(2)} USD In Clearance
            </div>
          </div>
          <p className="text-xs text-slate-500 pt-1 border-t border-slate-100">
            Under 7-14 day prop firm verification window
          </p>
        </div>

        {/* Total Earned */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Points Earned
            </span>
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {totalEarned.toLocaleString()}
            </div>
            <div className="text-xs font-bold text-blue-700 mt-1">
              ≈ ${(totalEarned / 100).toFixed(2)} USD Lifetime
            </div>
          </div>
          <p className="text-xs text-slate-500 pt-1 border-t border-slate-100">
            All-time accumulated points across purchases
          </p>
        </div>

        {/* Total Redeemed */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Redeemed & Paid Out
            </span>
            <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Gift className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {totalRedeemed.toLocaleString()}
            </div>
            <div className="text-xs font-bold text-purple-700 mt-1">
              ≈ ${(totalRedeemed / 100).toFixed(2)} USD Liquidated
            </div>
          </div>
          <p className="text-xs text-slate-500 pt-1 border-t border-slate-100">
            Points spent on tech gear, crypto, or gift cards
          </p>
        </div>
      </div>

      {/* Secondary Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-200/90 bg-white shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500">Pending Purchases</div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">
              {summary?.pendingPurchases || 0} Submissions
            </div>
          </div>
          <Link href="/dashboard/purchases">
            <span className="text-xs font-bold text-blue-600 hover:underline">View All →</span>
          </Link>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/90 bg-white shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500">Verified Purchases</div>
            <div className="text-xl font-bold text-emerald-600 mt-0.5">
              {summary?.totalVerifiedPurchases || 0} Approved
            </div>
          </div>
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        </div>

        <div className="p-4 rounded-xl border border-slate-200/90 bg-white shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500">Active Redemptions</div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">
              {summary?.activeRedemptions || 0} Orders
            </div>
          </div>
          <Link href="/dashboard/redemptions">
            <span className="text-xs font-bold text-blue-600 hover:underline">Track Delivery →</span>
          </Link>
        </div>
      </div>

      {/* Split Grid: Recent Purchases & Recent Point Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Purchases */}
        <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-base">Recent Purchase Submissions</h3>
            </div>
            <Link href="/dashboard/purchases">
              <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-700">
                View All
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>

          {recentPurchases.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <p className="text-sm text-slate-500 font-medium">No purchase proof submitted yet.</p>
              <p className="text-xs text-slate-400">
                Purchase an eligible prop firm account to start earning points.
              </p>
              <Link href="/dashboard/purchases/new" className="inline-block pt-2">
                <Button size="sm">Submit Your First Purchase Proof</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentPurchases.map((sub) => (
                <div key={sub.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{sub.propFirm.name}</span>
                      <span className="text-xs text-slate-500 font-mono">
                        ({sub.orderId})
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      {sub.accountType} • ${sub.purchaseAmountUsd} • {formatDate(sub.createdAt)}
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <div>{getStatusBadge(sub.status)}</div>
                    <div className="text-xs font-bold text-emerald-600">
                      +{sub.pointsAwarded.toLocaleString()} PTS
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Points Transactions */}
        <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-base">Points Ledger Activity</h3>
            </div>
            <Link href="/dashboard/wallet">
              <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-700">
                Full Ledger
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <p className="text-sm text-slate-500 font-medium">No ledger records yet.</p>
              <p className="text-xs text-slate-400">
                Purchase an eligible prop-firm account to begin accumulating points.
              </p>
              <Link href="/prop-firms" className="inline-block pt-2">
                <Button size="sm" variant="outline">Browse Prop Firms</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-800 line-clamp-1">
                      {tx.description}
                    </p>
                    <div className="text-[11px] text-slate-400">{formatDate(tx.createdAt)}</div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-sm font-black ${
                        tx.points > 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {tx.points > 0 ? `+${tx.points.toLocaleString()}` : tx.points.toLocaleString()} PTS
                    </span>
                    <div className="text-[10px] text-slate-400 font-medium">
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
        <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-purple-600" />
              <h3 className="font-bold text-slate-900 text-base">Active Redemptions & Deliveries</h3>
            </div>
            <Link href="/dashboard/redemptions">
              <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-700">
                View All
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {recentRedemptions.map((rdm) => (
              <div
                key={rdm.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={rdm.reward.imageUrl}
                    alt={rdm.reward.name}
                    className="h-12 w-12 rounded-lg object-cover bg-white border border-slate-200 shrink-0"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 truncate max-w-[160px]">
                      {rdm.reward.name}
                    </h4>
                    <span className="font-mono text-[10px] text-slate-500">
                      {rdm.redemptionCode}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                  <span className="text-slate-500">Status:</span>
                  {getRedemptionStatusBadge(rdm.status)}
                </div>

                {rdm.trackingNumber && (
                  <div className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-slate-400">Tracking: </span>
                    <span className="font-mono font-bold text-emerald-600">{rdm.trackingNumber}</span>
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
