'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
        setRecentPurchases(purchases.slice(0, 4));
        setRecentTransactions(ledger.transactions || []);
        setRecentRedemptions(redemptions.slice(0, 3));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge variant="success">APPROVED</Badge>;
      case 'PENDING':
        return <Badge variant="warning">PENDING</Badge>;
      case 'UNDER_REVIEW':
        return <Badge variant="info">UNDER REVIEW</Badge>;
      case 'MORE_INFO_REQUIRED':
        return <Badge variant="purple">ACTION NEEDED</Badge>;
      case 'REJECTED':
        return <Badge variant="danger">REJECTED</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getRedemptionStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <Badge variant="success">DELIVERED</Badge>;
      case 'SHIPPED':
        return <Badge variant="purple">SHIPPED</Badge>;
      case 'PROCESSING':
        return <Badge variant="info">PROCESSING</Badge>;
      case 'CONFIRMED':
        return <Badge variant="info">CONFIRMED</Badge>;
      case 'PENDING':
        return <Badge variant="warning">PENDING</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Quick Action Bar (Section 9) */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl border border-slate-800 bg-slate-900/40">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2">
          Quick Actions:
        </span>
        <Link href="/prop-firms">
          <Button variant="outline" size="sm">
            <Layers className="h-4 w-4 mr-1.5 text-emerald-400" />
            Earn Points (Prop Firms)
          </Button>
        </Link>
        <Link href="/dashboard/purchases/new">
          <Button variant="primary" size="sm">
            <PlusCircle className="h-4 w-4 mr-1.5" />
            Submit Purchase Proof
          </Button>
        </Link>
        <Link href="/rewards">
          <Button variant="secondary" size="sm">
            <Gift className="h-4 w-4 mr-1.5 text-emerald-400" />
            Rewards Store
          </Button>
        </Link>
      </div>

      {/* 4 Primary Points Stat Cards (Section 9) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Points */}
        <Card className="border-emerald-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 p-5 space-y-3 card-hover-glow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Available Points
            </span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white tracking-tight">
            {summary?.availablePoints.toLocaleString() || '0'}
          </div>
          <p className="text-xs text-slate-400">Ready to redeem in rewards store</p>
        </Card>

        {/* Total Earned */}
        <Card className="p-5 space-y-3 card-hover-glow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Earned
            </span>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white tracking-tight">
            {summary?.totalPointsEarned.toLocaleString() || '0'}
          </div>
          <p className="text-xs text-slate-400">All-time accumulated points</p>
        </Card>

        {/* Redeemed */}
        <Card className="p-5 space-y-3 card-hover-glow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Redeemed
            </span>
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Gift className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white tracking-tight">
            {summary?.totalPointsRedeemed.toLocaleString() || '0'}
          </div>
          <p className="text-xs text-slate-400">Points spent on gadgets & gear</p>
        </Card>

        {/* Pending Points */}
        <Card className="p-5 space-y-3 card-hover-glow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Pending
            </span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white tracking-tight">
            {summary?.pendingPoints.toLocaleString() || '0'}
          </div>
          <p className="text-xs text-slate-400">Under verification review</p>
        </Card>
      </div>

      {/* Secondary Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/50 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">Pending Purchases</div>
            <div className="text-xl font-bold text-white mt-0.5">
              {summary?.pendingPurchases || 0}
            </div>
          </div>
          <Link href="/dashboard/purchases">
            <span className="text-xs text-emerald-400 hover:underline">View</span>
          </Link>
        </div>

        <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/50 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">Verified Purchases</div>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">
              {summary?.totalVerifiedPurchases || 0}
            </div>
          </div>
          <CheckCircle2 className="h-5 w-5 text-emerald-500/50" />
        </div>

        <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/50 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">Active Redemptions</div>
            <div className="text-xl font-bold text-white mt-0.5">
              {summary?.activeRedemptions || 0}
            </div>
          </div>
          <Link href="/dashboard/redemptions">
            <span className="text-xs text-emerald-400 hover:underline">Track</span>
          </Link>
        </div>
      </div>

      {/* Split Grid: Recent Purchases & Recent Point Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Purchases */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-emerald-400" />
              <h3 className="font-bold text-white text-base">Recent Purchase Submissions</h3>
            </div>
            <Link href="/dashboard/purchases">
              <Button variant="ghost" size="sm" className="text-xs">
                View All
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>

          {recentPurchases.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <p className="text-sm text-slate-400">No purchases yet.</p>
              <p className="text-xs text-slate-500">
                Your verified purchases will appear here.
              </p>
              <Link href="/dashboard/purchases/new" className="inline-block pt-2">
                <Button size="sm">Submit Your First Purchase</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/70">
              {recentPurchases.map((sub) => (
                <div key={sub.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{sub.propFirm.name}</span>
                      <span className="text-xs text-slate-400 font-mono">
                        ({sub.orderId})
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">
                      {sub.accountType} • ${sub.purchaseAmountUsd} • {formatDate(sub.createdAt)}
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <div>{getStatusBadge(sub.status)}</div>
                    <div className="text-xs font-bold text-emerald-400">
                      +{sub.pointsAwarded.toLocaleString()} PTS
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Points Transactions */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-emerald-400" />
              <h3 className="font-bold text-white text-base">Points Ledger Activity</h3>
            </div>
            <Link href="/dashboard/points">
              <Button variant="ghost" size="sm" className="text-xs">
                Full Ledger
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <p className="text-sm text-slate-400">No points yet.</p>
              <p className="text-xs text-slate-500">
                Purchase an eligible prop-firm account to start earning.
              </p>
              <Link href="/prop-firms" className="inline-block pt-2">
                <Button size="sm" variant="outline">Browse Prop Firms</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/70">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-200 line-clamp-1">
                      {tx.description}
                    </p>
                    <div className="text-[11px] text-slate-500">{formatDate(tx.createdAt)}</div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-sm font-black ${
                        tx.points > 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {tx.points > 0 ? `+${tx.points.toLocaleString()}` : tx.points.toLocaleString()} PTS
                    </span>
                    <div className="text-[10px] text-slate-500">
                      Bal: {tx.balanceAfter.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Active Redemptions Widget */}
      {recentRedemptions.length > 0 && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-purple-400" />
              <h3 className="font-bold text-white text-base">Active Redemptions & Deliveries</h3>
            </div>
            <Link href="/dashboard/redemptions">
              <Button variant="ghost" size="sm" className="text-xs">
                View All
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {recentRedemptions.map((rdm) => (
              <div
                key={rdm.id}
                className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={rdm.reward.imageUrl}
                    alt={rdm.reward.name}
                    className="h-12 w-12 rounded-lg object-cover bg-slate-800 shrink-0"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white truncate max-w-[160px]">
                      {rdm.reward.name}
                    </h4>
                    <span className="font-mono text-[10px] text-slate-500">
                      {rdm.redemptionCode}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                  <span>Status:</span>
                  {getRedemptionStatusBadge(rdm.status)}
                </div>

                {rdm.trackingNumber && (
                  <div className="text-[11px] text-slate-400 bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-slate-500">Tracking: </span>
                    <span className="font-mono text-emerald-400">{rdm.trackingNumber}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
