'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate, formatDateTime } from '@/lib/utils';
import {
  Coins,
  TrendingUp,
  Clock,
  Gift,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

interface PointsSummary {
  availablePoints: number;
  totalPointsEarned: number;
  totalPointsRedeemed: number;
  pendingPoints: number;
}

interface PointsTransaction {
  id: string;
  type: string;
  points: number;
  balanceAfter: number;
  description: string;
  reason?: string;
  createdAt: string;
  submission?: {
    id: string;
    submissionCode: string;
    orderId: string;
    propFirm: { name: string };
  };
  redemption?: {
    id: string;
    redemptionCode: string;
    reward: { name: string };
  };
  createdBy?: {
    name: string;
  };
}

export default function PointsLedgerPage() {
  const [summary, setSummary] = useState<PointsSummary | null>(null);
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<PointsSummary>('/points/summary'),
      api.get<{ transactions: PointsTransaction[] }>('/points/ledger', { limit: 100 }),
    ])
      .then(([sum, ledger]) => {
        setSummary(sum);
        setTransactions(ledger.transactions || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'PURCHASE_REWARD':
        return <Badge variant="success">PURCHASE REWARD</Badge>;
      case 'REDEMPTION':
        return <Badge variant="purple">REDEMPTION</Badge>;
      case 'ADMIN_CREDIT':
        return <Badge variant="info">ADMIN BONUS</Badge>;
      case 'ADMIN_DEDUCTION':
        return <Badge variant="danger">ADJUSTMENT</Badge>;
      case 'REFUND_REVERSAL':
        return <Badge variant="warning">REFUND</Badge>;
      default:
        return <Badge variant="default">{type.replace(/_/g, ' ')}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Reward Points Ledger</h2>
          <p className="text-xs text-slate-400">
            Immutable, audit-ready record of all point allocations, redemptions, and adjustments.
          </p>
        </div>

        <Link href="/rewards">
          <Button size="sm">
            <Gift className="h-4 w-4 mr-1.5" />
            Redeem Points in Store
          </Button>
        </Link>
      </div>

      {/* 4 Points Stat Cards (Section 12) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-emerald-500/30 bg-emerald-950/20 p-5 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Available Balance
          </div>
          <div className="text-3xl font-black text-white">
            {summary?.availablePoints.toLocaleString() || '0'}{' '}
            <span className="text-xs text-slate-400 font-normal">PTS</span>
          </div>
          <p className="text-[11px] text-slate-400">Ready for instant redemption</p>
        </Card>

        <Card className="p-5 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total Points Earned
          </div>
          <div className="text-3xl font-black text-white">
            {summary?.totalPointsEarned.toLocaleString() || '0'}{' '}
            <span className="text-xs text-slate-400 font-normal">PTS</span>
          </div>
          <p className="text-[11px] text-slate-400">From verified purchases & bonuses</p>
        </Card>

        <Card className="p-5 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total Points Redeemed
          </div>
          <div className="text-3xl font-black text-white">
            {summary?.totalPointsRedeemed.toLocaleString() || '0'}{' '}
            <span className="text-xs text-slate-400 font-normal">PTS</span>
          </div>
          <p className="text-[11px] text-slate-400">Spent on physical tech & gift cards</p>
        </Card>

        <Card className="p-5 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Pending Points
          </div>
          <div className="text-3xl font-black text-white">
            {summary?.pendingPoints.toLocaleString() || '0'}{' '}
            <span className="text-xs text-slate-400 font-normal">PTS</span>
          </div>
          <p className="text-[11px] text-slate-400">Currently awaiting verification</p>
        </Card>
      </div>

      {/* Ledger Table */}
      <Card className="overflow-hidden p-0 border-slate-800 bg-slate-900/60">
        <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-emerald-400" />
            <h3 className="font-bold text-white text-base">Transaction History</h3>
          </div>
          <span className="text-xs text-slate-400">
            Total Entries: {transactions.length}
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">
            Loading ledger transactions...
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Coins className="h-10 w-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-white">No transactions recorded yet</h4>
            <p className="text-xs text-slate-400">
              When purchases are verified or bonuses are applied, every entry will be recorded here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Date & Time</th>
                  <th className="px-5 py-3.5">Type</th>
                  <th className="px-5 py-3.5">Description & Reference</th>
                  <th className="px-5 py-3.5 text-right">Points (+/-)</th>
                  <th className="px-5 py-3.5 text-right">Balance After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {transactions.map((tx) => {
                  const isPositive = tx.points > 0;
                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-3.5 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                        {formatDateTime(tx.createdAt)}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {getTypeBadge(tx.type)}
                      </td>
                      <td className="px-5 py-3.5 max-w-md">
                        <div className="font-medium text-slate-100">{tx.description}</div>
                        {tx.reason && (
                          <div className="text-[11px] text-slate-500 italic mt-0.5">
                            Reason: {tx.reason}
                          </div>
                        )}
                        {tx.submission && (
                          <Link
                            href="/dashboard/purchases"
                            className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:underline mt-0.5"
                          >
                            <span>Ref: {tx.submission.submissionCode}</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                          </Link>
                        )}
                        {tx.redemption && (
                          <Link
                            href="/dashboard/redemptions"
                            className="inline-flex items-center gap-1 text-[11px] text-purple-400 hover:underline mt-0.5"
                          >
                            <span>Order: {tx.redemption.redemptionCode}</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                          </Link>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <span
                          className={`font-black text-sm ${
                            isPositive ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isPositive ? `+${tx.points.toLocaleString()}` : tx.points.toLocaleString()}{' '}
                          <span className="text-[10px] text-slate-500 font-normal">PTS</span>
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap font-mono font-bold text-slate-200">
                        {tx.balanceAfter.toLocaleString()}{' '}
                        <span className="text-[10px] text-slate-500 font-normal">PTS</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
