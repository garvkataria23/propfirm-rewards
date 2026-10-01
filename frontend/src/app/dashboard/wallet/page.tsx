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
  Wallet,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  ShieldCheck,
  Download,
  CreditCard,
  Gift,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Search,
  Filter,
  RefreshCw,
  Send,
  Lock,
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

interface LedgerTx {
  id: string;
  type: string;
  points: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}

export default function TraderWalletPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<PointsSummary | null>(null);
  const [transactions, setTransactions] = useState<LedgerTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  // Withdrawal modal state
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState<'crypto' | 'bank' | 'voucher'>('crypto');
  const [payoutAmountPts, setPayoutAmountPts] = useState(5000);
  const [cryptoAddress, setCryptoAddress] = useState('');
  const [cryptoNetwork, setCryptoNetwork] = useState('TRC20');
  const [payoutSuccess, setPayoutSuccess] = useState(false);
  const [payoutLoading, setPayoutLoading] = useState(false);

  const fetchWalletData = () => {
    setLoading(true);
    Promise.all([
      api.get<PointsSummary>('/points/summary'),
      api.get<{ transactions: LedgerTx[] }>('/points/ledger', { limit: 50 }),
    ])
      .then(([sum, ledger]) => {
        setSummary(sum);
        setTransactions(ledger.transactions || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const availablePoints = summary?.availablePoints ?? user?.points?.available ?? 0;
  const pendingPoints = summary?.pendingPoints ?? user?.points?.pending ?? 0;
  const lifetimeEarned = summary?.totalPointsEarned ?? user?.points?.lifetimeEarned ?? 0;
  const lifetimeRedeemed = summary?.totalPointsRedeemed ?? user?.points?.lifetimeRedeemed ?? 0;

  // Valuation: 100 PTS = $1.00 USD
  const availableUsd = (availablePoints / 100).toFixed(2);
  const pendingUsd = (pendingPoints / 100).toFixed(2);
  const lifetimeUsd = (lifetimeEarned / 100).toFixed(2);
  const redeemedUsd = (lifetimeRedeemed / 100).toFixed(2);

  const handleRequestPayout = (e: React.FormEvent) => {
    e.preventDefault();
    setPayoutLoading(true);

    setTimeout(() => {
      setPayoutLoading(false);
      setPayoutSuccess(true);
    }, 800);
  };

  const handleExportStatement = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Date,Description,Type,Points,Balance After']
        .concat(
          transactions.map(
            (t) =>
              `"${new Date(t.createdAt).toISOString()}","${t.description}","${t.type}",${t.points},${t.balanceAfter}`,
          ),
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PropNation_Wallet_Statement_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered ledger transactions
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.type.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'EARNED') return tx.points > 0;
    if (filterType === 'REDEEMED') return tx.points < 0;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100/80 text-blue-800 text-xs font-bold uppercase tracking-wider mb-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
            <span>Regulated Cashback Escrow</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Trader Wallet & Payout Center
          </h1>
          <p className="text-sm text-slate-500">
            Real-time balance, escrow maturation timeline, and instant cashout gateway.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportStatement}
            className="border-slate-300 bg-white text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <Download className="h-3.5 w-3.5 mr-1.5 text-slate-500" />
            Export Statement
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setPayoutSuccess(false);
              setPayoutModalOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-xs font-bold"
          >
            <ArrowUpRight className="h-4 w-4 mr-1.5" />
            Request Cashout
          </Button>
        </div>
      </div>

      {/* Main Wallet Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Virtual Trader Black Titanium Card Visual (5 cols) */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="relative flex-1 rounded-3xl bg-gradient-to-br from-slate-950 via-[#0a1226] to-[#040814] p-7 text-white shadow-2xl border border-slate-800 flex flex-col justify-between overflow-hidden min-h-[260px]">
            {/* Card Hologram Accents */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white">
                  PROP<span className="text-blue-400">NATION</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded border border-white/10 text-slate-300">
                  BLACK PASS
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                <Sparkles className="h-3 w-3" />
                <span>100 PTS = $1.00 USD</span>
              </div>
            </div>

            {/* Chip & Contactless Visual */}
            <div className="relative flex items-center gap-3 pt-4">
              <div className="h-8 w-11 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 shadow-md border border-amber-300 flex items-center justify-center">
                <div className="w-8 h-5 border border-amber-800/40 rounded-sm" />
              </div>
              <CreditCard className="h-5 w-5 text-slate-400/80" />
            </div>

            {/* Balances Display */}
            <div className="relative pt-6">
              <div className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Total Available Value
              </div>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  ${availableUsd}
                </span>
                <span className="text-sm font-bold text-emerald-400">
                  ({availablePoints.toLocaleString()} PTS)
                </span>
              </div>
            </div>

            {/* Cardholder info */}
            <div className="relative flex items-center justify-between pt-6 border-t border-white/10 text-xs">
              <div>
                <span className="text-[10px] uppercase text-slate-400 block font-medium">Cardholder</span>
                <span className="font-bold text-slate-200 tracking-wider">
                  {user?.name || 'VERIFIED TRADER'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase text-slate-400 block font-medium">Trader ID</span>
                <span className="font-mono text-slate-300 font-bold">
                  {user?.id ? `PN-${user.id.slice(0, 6).toUpperCase()}` : 'PN-884210'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Secondary Wallet Stat Cards (7 cols) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Spendable Cash Balance */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Spendable Balance
              </span>
              <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Coins className="h-4 w-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                ${availableUsd} <span className="text-xs font-bold text-slate-400">USD</span>
              </div>
              <p className="text-xs text-emerald-600 font-semibold mt-1">
                {availablePoints.toLocaleString()} PTS ready to withdraw or redeem
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">Instant Cashout SLA:</span>
              <span className="font-bold text-slate-700">&lt; 15 mins (Crypto)</span>
            </div>
          </div>

          {/* Escrow Clearance Pool */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Escrow / Pending Pool
              </span>
              <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                ${pendingUsd} <span className="text-xs font-bold text-slate-400">USD</span>
              </div>
              <p className="text-xs text-amber-700 font-semibold mt-1">
                {pendingPoints.toLocaleString()} PTS in 7-14 day clearance
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">Protection:</span>
              <span className="font-bold text-slate-700">Prop Firm Refund Window</span>
            </div>
          </div>

          {/* Lifetime Cashback Earned */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Lifetime Points Earned
              </span>
              <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <ArrowDownLeft className="h-4 w-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                ${lifetimeUsd} <span className="text-xs font-bold text-slate-400">USD</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {lifetimeEarned.toLocaleString()} PTS total accumulated
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">Verified Proofs:</span>
              <span className="font-bold text-slate-700">
                {summary?.totalVerifiedPurchases ?? 0} Challenges
              </span>
            </div>
          </div>

          {/* Lifetime Redeemed & Liquidated */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Redeemed & Paid Out
              </span>
              <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Gift className="h-4 w-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                ${redeemedUsd} <span className="text-xs font-bold text-slate-400">USD</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {lifetimeRedeemed.toLocaleString()} PTS claimed in gear & cash
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">Redemptions:</span>
              <Link href="/dashboard/redemptions" className="font-bold text-blue-600 hover:underline">
                View History →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Escrow Information Banner */}
      <div className="p-4 sm:p-5 rounded-2xl border border-blue-200/80 bg-blue-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
            <Lock className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-blue-950">How the Prop Firm Escrow Protocol Works</h4>
            <p className="text-xs text-blue-800/80 leading-relaxed">
              When your challenge purchase is verified, points enter a standard escrow cooling period (matching the prop firm&apos;s refund policy). Once matured, points automatically unlock into your spendable balance.
            </p>
          </div>
        </div>
        <Link href="/faq">
          <span className="text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline shrink-0">
            Escrow FAQs →
          </span>
        </Link>
      </div>

      {/* Interactive Ledger Activity Table */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              Wallet Transaction Ledger
            </h3>
            <p className="text-xs text-slate-500">
              Complete auditable record of all credits, releases, withdrawals, and store purchases.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter Pills */}
            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  filterType === 'ALL'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('EARNED')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  filterType === 'EARNED'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Earned (+)
              </button>
              <button
                onClick={() => setFilterType('REDEEMED')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  filterType === 'REDEEMED'
                    ? 'bg-white text-rose-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Redeemed (-)
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search ledger..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 w-44"
              />
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Coins className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">No transactions found</p>
            <p className="text-xs text-slate-400">
              When you purchase an eligible prop firm challenge or redeem points, transactions will appear here.
            </p>
            <Link href="/prop-firms" className="inline-block pt-2">
              <Button size="sm">Browse Eligible Prop Firms</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Transaction Details</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Points</th>
                  <th className="py-3 px-4 text-right">USD Equivalent</th>
                  <th className="py-3 px-4 text-right">Balance After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-xs truncate">
                      {tx.description}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{formatDate(tx.createdAt)}</td>
                    <td
                      className={`py-3.5 px-4 text-right font-black ${
                        tx.points > 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {tx.points > 0 ? `+${tx.points.toLocaleString()}` : tx.points.toLocaleString()} PTS
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-slate-700">
                      {tx.points > 0 ? `+$${(tx.points / 100).toFixed(2)}` : `-$${Math.abs(tx.points / 100).toFixed(2)}`}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800">
                      {tx.balanceAfter.toLocaleString()} PTS
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Request Payout / Cashout Modal */}
      {payoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Request Cashout</h3>
                <p className="text-xs text-slate-500">
                  Convert your available PTS into Crypto USDT/USDC or Direct Wire
                </p>
              </div>
              <button
                onClick={() => setPayoutModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1.5"
              >
                ✕
              </button>
            </div>

            {payoutSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h4 className="text-xl font-bold text-slate-900">Payout Request Submitted!</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Your withdrawal of{' '}
                  <span className="font-bold text-slate-900">
                    ${(payoutAmountPts / 100).toFixed(2)} USD ({payoutAmountPts.toLocaleString()} PTS)
                  </span>{' '}
                  has been placed in the payout queue. Crypto payouts are dispatched in &lt;15 minutes.
                </p>
                <div className="pt-2">
                  <Button onClick={() => setPayoutModalOpen(false)} className="w-full">
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRequestPayout} className="space-y-4">
                {/* Method selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Payout Rail *</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPayoutMethod('crypto')}
                      className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                        payoutMethod === 'crypto'
                          ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      USDT / USDC
                    </button>
                    <button
                      type="button"
                      onClick={() => setPayoutMethod('bank')}
                      className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                        payoutMethod === 'bank'
                          ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Bank Wire
                    </button>
                    <button
                      type="button"
                      onClick={() => setPayoutMethod('voucher')}
                      className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                        payoutMethod === 'voucher'
                          ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Prop Voucher
                    </button>
                  </div>
                </div>

                {/* Amount input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-slate-700">Withdrawal Amount (PTS) *</label>
                    <span className="text-slate-400">
                      Available: {availablePoints.toLocaleString()} PTS (${availableUsd})
                    </span>
                  </div>
                  <input
                    type="number"
                    min="1000"
                    max={availablePoints || 100000}
                    step="500"
                    value={payoutAmountPts}
                    onChange={(e) => setPayoutAmountPts(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <span className="text-slate-500">Gross Payout Value:</span>
                    <span className="font-black text-emerald-600">
                      ${(payoutAmountPts / 100).toFixed(2)} USD
                    </span>
                  </div>
                </div>

                {/* Crypto rail details */}
                {payoutMethod === 'crypto' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Crypto Network</label>
                      <select
                        value={cryptoNetwork}
                        onChange={(e) => setCryptoNetwork(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                      >
                        <option value="TRC20">USDT (TRON - TRC20) [Fastest & Zero Fee]</option>
                        <option value="ERC20">USDT / USDC (Ethereum - ERC20)</option>
                        <option value="BEP20">USDT (BNB Chain - BEP20)</option>
                        <option value="SOL">USDC (Solana - SPL)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Recipient Destination Wallet Address *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Txyz... or 0x..."
                        value={cryptoAddress}
                        onChange={(e) => setCryptoAddress(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </>
                )}

                {/* Bank rail details */}
                {payoutMethod === 'bank' && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">IBAN / Bank Account Details *</label>
                    <input
                      type="text"
                      required
                      placeholder="Account holder, IBAN/SWIFT or Routing/Account #"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                )}

                {/* Security PIN warning */}
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Withdrawal requests are processed securely with anti-fraud duplicate checks. Please double check your destination address.
                  </span>
                </div>

                <Button
                  type="submit"
                  disabled={payoutLoading || payoutAmountPts > availablePoints || availablePoints === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 shadow-md"
                >
                  {payoutLoading ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Dispatching Payout...
                    </span>
                  ) : (
                    <span>
                      Confirm &amp; Cash Out ${(payoutAmountPts / 100).toFixed(2)} USD
                    </span>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
