'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import {
  Users,
  ShoppingBag,
  Coins,
  Truck,
  Gift,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface StatsResponse {
  metrics: {
    totalUsers: number;
    newUsers: number;
    totalSubmissions: number;
    pendingVerification: number;
    approvedPurchases: number;
    rejectedPurchases: number;
    moreInfoSubmissions: number;
    totalPointsIssued: number;
    totalPointsRedeemed: number;
    netPointsOutstanding: number;
    pendingRedemptions: number;
    completedRedemptions: number;
    activeRewards: number;
    lowStockRewards: number;
    propFirmsCount: number;
  };
  recentSubmissions: any[];
  recentRedemptions: any[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    setLoading(true);
    api
      .get<StatsResponse>('/admin/stats', { days })
      .then((data) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [days]);

  const m = stats?.metrics;

  return (
    <div className="space-y-8">
      {/* Top Banner with date filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Admin Overview</h1>
          <p className="text-xs text-slate-400">
            Real-time platform operations, verification backlog, and financial points liability.
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                days === d
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {d} Days
            </button>
          ))}
        </div>
      </div>

      {/* Critical Alert Bar if pending items */}
      {(m?.pendingVerification || 0) > 0 && (
        <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs text-amber-300">
            <AlertCircle className="h-5 w-5 text-amber-400 shrink-0" />
            <span>
              <strong>{m?.pendingVerification} purchase submissions</strong> require manual verification against prop-firm affiliate records.
            </span>
          </div>
          <Link href="/admin/purchases">
            <Button size="sm" variant="primary" className="bg-amber-500 hover:bg-amber-400 text-slate-950">
              Review Backlog
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      )}

      {/* Primary KPI Grid (Section 18) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <Card className="p-5 space-y-2 card-hover-glow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Users</span>
            <Users className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-3xl font-black text-white">{m?.totalUsers.toLocaleString() || '0'}</div>
          <div className="text-xs text-slate-400">
            <span className="text-emerald-400 font-semibold">+{m?.newUsers || 0} new</span> in last {days} days
          </div>
        </Card>

        {/* Pending Submissions */}
        <Card className="p-5 space-y-2 card-hover-glow border-amber-500/30 bg-slate-900/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Pending Review</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-white">{m?.pendingVerification.toLocaleString() || '0'}</div>
          <div className="text-xs text-slate-400">
            {m?.approvedPurchases || 0} approved • {m?.rejectedPurchases || 0} rejected
          </div>
        </Card>

        {/* Total Points Issued */}
        <Card className="p-5 space-y-2 card-hover-glow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Points Issued</span>
            <Coins className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white">
            {m?.totalPointsIssued.toLocaleString() || '0'}{' '}
            <span className="text-xs text-slate-400 font-normal">PTS</span>
          </div>
          <div className="text-xs text-slate-400">All-time awarded points</div>
        </Card>

        {/* Points Redeemed & Outstanding */}
        <Card className="p-5 space-y-2 card-hover-glow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Points Redeemed</span>
            <Gift className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-3xl font-black text-white">
            {m?.totalPointsRedeemed.toLocaleString() || '0'}{' '}
            <span className="text-xs text-slate-400 font-normal">PTS</span>
          </div>
          <div className="text-xs text-slate-400">
            Net Outstanding: {m?.netPointsOutstanding.toLocaleString() || '0'} PTS
          </div>
        </Card>
      </div>

      {/* Secondary Metric Strips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1">
          <span className="text-xs text-slate-400">Pending Redemptions</span>
          <div className="text-xl font-bold text-amber-400">{m?.pendingRedemptions || 0}</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1">
          <span className="text-xs text-slate-400">Completed Deliveries</span>
          <div className="text-xl font-bold text-emerald-400">{m?.completedRedemptions || 0}</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1">
          <span className="text-xs text-slate-400">Active Prop Firms</span>
          <div className="text-xl font-bold text-white">{m?.propFirmsCount || 0}</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1">
          <span className="text-xs text-slate-400">Low Stock Rewards (≤5)</span>
          <div className="text-xl font-bold text-rose-400">{m?.lowStockRewards || 0}</div>
        </div>
      </div>

      {/* Split Feeds: Recent Submissions & Recent Redemptions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Submissions */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-white text-sm">Latest Submissions To Review</h3>
            <Link href="/admin/purchases" className="text-xs text-purple-400 hover:underline">
              View All
            </Link>
          </div>

          <div className="divide-y divide-slate-800/80">
            {stats?.recentSubmissions?.map((sub) => (
              <div key={sub.id} className="py-3 flex items-center justify-between text-xs gap-3">
                <div className="space-y-0.5">
                  <div className="font-bold text-white flex items-center gap-2">
                    <span>{sub.user?.name}</span>
                    <span className="text-slate-400 font-mono text-[11px]">({sub.propFirm?.name})</span>
                  </div>
                  <div className="text-slate-500 font-mono">
                    Order: {sub.orderId} • {formatDate(sub.createdAt)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-400">+{sub.pointsAwarded} PTS</span>
                  <Badge variant={sub.status === 'APPROVED' ? 'success' : sub.status === 'PENDING' ? 'warning' : 'default'}>
                    {sub.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Redemptions */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-white text-sm">Latest Redemption Orders</h3>
            <Link href="/admin/redemptions" className="text-xs text-purple-400 hover:underline">
              View All
            </Link>
          </div>

          <div className="divide-y divide-slate-800/80">
            {stats?.recentRedemptions?.map((rdm) => (
              <div key={rdm.id} className="py-3 flex items-center justify-between text-xs gap-3">
                <div className="space-y-0.5">
                  <div className="font-bold text-white">{rdm.reward?.name}</div>
                  <div className="text-slate-500">
                    Trader: {rdm.user?.name} • Code: {rdm.redemptionCode}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-purple-400">-{rdm.pointsSpent} PTS</span>
                  <Badge variant={rdm.status === 'DELIVERED' ? 'success' : rdm.status === 'SHIPPED' ? 'purple' : 'warning'}>
                    {rdm.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
