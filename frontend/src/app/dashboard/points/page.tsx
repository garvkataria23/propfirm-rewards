'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import { userDataStore } from '@/lib/userDataStore';
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
  Download,
  Search,
  Filter,
  Crown,
  Zap,
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
}

export default function PointsLedgerPage() {
  const [summary, setSummary] = useState<PointsSummary | null>(null);
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'ALL' | 'EARNED' | 'REDEEMED' | 'VIP' | 'ADMIN'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const DEFAULT_TRANSACTIONS: PointsTransaction[] = [
    {
      id: 'tx-901',
      type: 'PURCHASE_REWARD',
      points: 4500,
      balanceAfter: 15700,
      description: 'Funding Pips $100K 2-Step Evaluation verified (Order #FP-98214)',
      createdAt: '2026-10-02T06:12:00Z',
    },
    {
      id: 'tx-900',
      type: 'VIP_MULTIPLIER',
      points: 900,
      balanceAfter: 11200,
      description: 'Silver Tier 1.2x Multiplier Bonus on Order #FP-98214',
      createdAt: '2026-10-02T06:12:00Z',
    },
    {
      id: 'tx-895',
      type: 'REDEMPTION',
      points: -22000,
      balanceAfter: 10300,
      description: 'Redeemed Apple AirPods Pro (2nd Gen - MagSafe USB-C)',
      createdAt: '2026-10-01T10:14:00Z',
    },
    {
      id: 'tx-880',
      type: 'PURCHASE_REWARD',
      points: 11200,
      balanceAfter: 32300,
      description: 'FTMO $200K Challenge purchase proof verified (Order #FTMO-77301)',
      createdAt: '2026-09-24T14:20:00Z',
    },
    {
      id: 'tx-872',
      type: 'ADMIN_CREDIT',
      points: 1500,
      balanceAfter: 21100,
      description: 'Welcome Bonus: First challenge verification milestone reward',
      createdAt: '2026-09-18T11:00:00Z',
    },
  ];

  const DEFAULT_SUMMARY: PointsSummary = {
    availablePoints: 15700,
    totalPointsEarned: 37700,
    totalPointsRedeemed: 22000,
    pendingPoints: 4500,
  };

  const { user } = useAuth();

  useEffect(() => {
    const userEmail = user?.email || (typeof window !== 'undefined' ? localStorage.getItem('propfirm_saved_email') : null) || 'trader@example.com';
    const localLedger = userDataStore.getUserLedger(userEmail);
    const available = userDataStore.calculateAvailablePoints(userEmail);
    const pending = userDataStore.calculatePendingPoints(userEmail);

    const userSummary: PointsSummary = {
      availablePoints: available,
      totalPointsEarned: available + 22000,
      totalPointsRedeemed: 22000,
      pendingPoints: pending,
    };

    Promise.all([
      api.get<PointsSummary>('/points/summary'),
      api.get<{ transactions: PointsTransaction[] }>('/points/ledger', { limit: 100 }),
    ])
      .then(([sum, ledger]) => {
        setSummary(sum || userSummary);
        if (ledger.transactions && ledger.transactions.length > 0) {
          setTransactions(ledger.transactions);
        } else {
          setTransactions(localLedger as any);
        }
      })
      .catch(() => {
        setSummary(userSummary);
        setTransactions(localLedger as any);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'PURCHASE_REWARD':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
            PURCHASE CASHBACK
          </span>
        );
      case 'VIP_MULTIPLIER':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-500/20">
            <Crown className="h-3 w-3 text-amber-500" />
            VIP 1.2x BONUS
          </span>
        );
      case 'REDEMPTION':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">
            REDEMPTION
          </span>
        );
      case 'ADMIN_CREDIT':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-500/20">
            ADMIN BONUS
          </span>
        );
      default:
        return <Badge variant="default">{type.replace(/_/g, ' ')}</Badge>;
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchesFilter =
      filterType === 'ALL' ||
      (filterType === 'EARNED' && tx.points > 0) ||
      (filterType === 'REDEEMED' && tx.points < 0) ||
      (filterType === 'VIP' && tx.type === 'VIP_MULTIPLIER') ||
      (filterType === 'ADMIN' && tx.type === 'ADMIN_CREDIT');

    const matchesSearch =
      searchQuery === '' ||
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.type.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleExportCSV = () => {
    const headers = ['Transaction ID', 'Date', 'Type', 'Description', 'Points (+/-)', 'USD Value', 'Balance After'];
    const rows = filteredTransactions.map((tx) => [
      tx.id,
      new Date(tx.createdAt).toISOString(),
      tx.type,
      `"${tx.description.replace(/"/g, '""')}"`,
      tx.points,
      `$${(Math.abs(tx.points) / 10).toFixed(2)}`,
      tx.balanceAfter,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PropNation_Points_Statement_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const availablePts = summary?.availablePoints || 15700;
  const earnedPts = summary?.totalPointsEarned || 37700;
  const redeemedPts = summary?.totalPointsRedeemed || 22000;
  const pendingPts = summary?.pendingPoints || 4500;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Coins className="h-5 w-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Points Ledger &amp; Cash Value History
            </h1>
            <Badge variant="success">Audited Ledger</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Double-entry points statement, automatic valuation (10 PTS = $1.00 USD | 1$ = 10 points), and timestamped transaction ledger.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCSV}
            className="border-slate-300 dark:border-slate-700 font-semibold"
          >
            <Download className="h-4 w-4 mr-1.5 text-emerald-600 dark:text-emerald-400" />
            Export Statement
          </Button>

          <Link href="/rewards">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
              <Gift className="h-4 w-4 mr-1.5" />
              Redeem Rewards
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Balance */}
        <div className="border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-5 rounded-2xl space-y-2 shadow-xs transition-colors">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Available Spendable Balance
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {availablePts.toLocaleString()}{' '}
            <span className="text-xs text-slate-500 font-normal">PTS</span>
          </div>
          <div className="text-xs font-black text-emerald-600 dark:text-emerald-400">
            ≈ ${(availablePts / 10).toFixed(2)} USD Liquid Cashout Value
          </div>
        </div>

        {/* Total Earned */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 space-y-2 shadow-xs transition-colors">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Points Earned
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {earnedPts.toLocaleString()}{' '}
            <span className="text-xs text-slate-500 font-normal">PTS</span>
          </div>
          <div className="text-xs text-slate-500">
            ≈ ${(earnedPts / 10).toFixed(2)} USD Total Historical Yield
          </div>
        </div>

        {/* Total Redeemed */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 space-y-2 shadow-xs transition-colors">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Points Redeemed
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {redeemedPts.toLocaleString()}{' '}
            <span className="text-xs text-slate-500 font-normal">PTS</span>
          </div>
          <div className="text-xs text-purple-600 dark:text-purple-400 font-bold">
            ${(redeemedPts / 10).toFixed(2)} Claimed in tech &amp; passes
          </div>
        </div>

        {/* Pending Escrow */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 space-y-2 shadow-xs transition-colors">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Pending Escrow Clearance
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {pendingPts.toLocaleString()}{' '}
            <span className="text-xs text-slate-500 font-normal">PTS</span>
          </div>
          <div className="text-xs text-amber-600 dark:text-amber-400 font-bold">
            ≈ ${(pendingPts / 10).toFixed(2)} USD in cooling window
          </div>
        </div>
      </div>

      {/* Ledger Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden space-y-4 p-6 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
              Complete Transaction Audit Ledger
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Every balance adjustment includes an immutable ledger entry and calculated balance after.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category Filter Pills */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
              {[
                { key: 'ALL', label: 'All' },
                { key: 'EARNED', label: 'Earned (+)' },
                { key: 'REDEEMED', label: 'Redeemed (-)' },
                { key: 'VIP', label: 'VIP Multipliers' },
                { key: 'ADMIN', label: 'Admin Bonuses' },
              ].map((pill) => (
                <button
                  key={pill.key}
                  type="button"
                  onClick={() => setFilterType(pill.key as any)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    filterType === pill.key
                      ? 'bg-white dark:bg-slate-700 text-slate-950 dark:text-white shadow-xs font-black'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 w-44"
              />
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Description &amp; Reference</th>
                <th className="py-3 px-4 text-right">Points (+/-)</th>
                <th className="py-3 px-4 text-right">USD Value</th>
                <th className="py-3 px-4 text-right">Balance After</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTransactions.map((tx) => {
                const isPositive = tx.points > 0;
                return (
                  <tr key={tx.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-600 dark:text-slate-400">
                      {tx.id}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                      {formatDateTime(tx.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getTypeBadge(tx.type)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white max-w-sm truncate">
                      {tx.description}
                    </td>
                    <td
                      className={`py-3.5 px-4 text-right font-black font-mono whitespace-nowrap ${
                        isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isPositive ? `+${tx.points.toLocaleString()}` : tx.points.toLocaleString()} PTS
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-600 dark:text-slate-300 font-mono whitespace-nowrap">
                      ${(Math.abs(tx.points) / 10).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      {tx.balanceAfter.toLocaleString()} PTS
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
