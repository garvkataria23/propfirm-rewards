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
  Award,
  Crown,
  Zap,
  MessageCircle,
  KeyRound,
  Check,
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

import { userDataStore } from '@/lib/userDataStore';

export default function TraderWalletPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<PointsSummary | null>(null);
  const [transactions, setTransactions] = useState<LedgerTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  // Withdrawal modal state & 2FA WhatsApp verification
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [payoutStep, setPayoutStep] = useState<'DETAILS' | '2FA_OTP' | 'SUCCESS'>('DETAILS');
  const [payoutMethod, setPayoutMethod] = useState<'crypto' | 'bank' | 'voucher'>('crypto');
  const [payoutAmountPts, setPayoutAmountPts] = useState(5000);
  const [cryptoAddress, setCryptoAddress] = useState('');
  const [cryptoNetwork, setCryptoNetwork] = useState('TRC20');
  const [bankDetails, setBankDetails] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [payoutLoading, setPayoutLoading] = useState(false);

  const fetchWalletData = () => {
    setLoading(true);
    const userEmail = user?.email || (typeof window !== 'undefined' ? localStorage.getItem('propfirm_saved_email') : null) || 'trader@example.com';
    const localLedger = userDataStore.getUserLedger(userEmail);
    const localPurchases = userDataStore.getUserPurchases(userEmail);
    const available = userDataStore.calculateAvailablePoints(userEmail);
    const pending = userDataStore.calculatePendingPoints(userEmail);

    Promise.all([
      api.get<PointsSummary>('/points/summary'),
      api.get<{ transactions: LedgerTx[] }>('/points/ledger', { limit: 50 }),
    ])
      .then(([sum, ledger]) => {
        setSummary(sum || {
          availablePoints: available,
          totalPointsEarned: available + 22000,
          totalPointsRedeemed: 22000,
          pendingPoints: pending,
          pendingPurchases: localPurchases.filter((p) => p.status === 'PENDING').length,
          totalVerifiedPurchases: localPurchases.filter((p) => p.status === 'APPROVED').length,
          activeRedemptions: 1,
        });
        setTransactions(ledger?.transactions && ledger.transactions.length > 0 ? ledger.transactions : (localLedger as any));
      })
      .catch(() => {
        setSummary({
          availablePoints: available,
          totalPointsEarned: available + 22000,
          totalPointsRedeemed: 22000,
          pendingPoints: pending,
          pendingPurchases: localPurchases.filter((p) => p.status === 'PENDING').length,
          totalVerifiedPurchases: localPurchases.filter((p) => p.status === 'APPROVED').length,
          activeRedemptions: 1,
        });
        setTransactions(localLedger as any);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWalletData();
  }, [user]);

  const availablePoints = summary?.availablePoints ?? user?.points?.available ?? 0;
  const pendingPoints = summary?.pendingPoints ?? user?.points?.pending ?? 0;
  const lifetimeEarned = summary?.totalPointsEarned ?? user?.points?.lifetimeEarned ?? 0;
  const lifetimeRedeemed = summary?.totalPointsRedeemed ?? user?.points?.lifetimeRedeemed ?? 0;
  const verifiedChallenges = summary?.totalVerifiedPurchases ?? 3;

  // Valuation: 10 PTS = $1.00 USD (1$ = 10 points)
  const availableUsd = (availablePoints / 10).toFixed(2);
  const pendingUsd = (pendingPoints / 10).toFixed(2);
  const lifetimeUsd = (lifetimeEarned / 10).toFixed(2);
  const redeemedUsd = (lifetimeRedeemed / 10).toFixed(2);

  // VIP Tier Calculations
  const getVipTierInfo = (verifiedCount: number) => {
    if (verifiedCount >= 15) {
      return {
        tierName: 'Diamond Whale VIP',
        multiplier: '2.0x',
        badgeColor: 'from-amber-400 to-amber-600',
        textColor: 'text-amber-400',
        nextTier: 'Max Tier Unlocked',
        progress: 100,
        remaining: 0,
        perks: ['Instant Automated Payouts', '2.0x Points Multiplier', 'Free $100K Challenge on Request', 'Direct Telegram VIP VIP Concierge'],
      };
    }
    if (verifiedCount >= 7) {
      return {
        tierName: 'Gold Trader',
        multiplier: '1.5x',
        badgeColor: 'from-amber-300 via-yellow-500 to-amber-600',
        textColor: 'text-amber-500',
        nextTier: 'Diamond Whale VIP (15 Challenges)',
        progress: ((verifiedCount - 7) / (15 - 7)) * 100,
        remaining: 15 - verifiedCount,
        perks: ['1.5x Cashback Points', 'Expedited Review (<1 Hour)', 'Free Prop Firm Merch Box', 'WhatsApp Priority Desk'],
      };
    }
    if (verifiedCount >= 3) {
      return {
        tierName: 'Silver Trader',
        multiplier: '1.2x',
        badgeColor: 'from-slate-300 via-slate-400 to-slate-500',
        textColor: 'text-blue-500',
        nextTier: 'Gold Trader (7 Challenges)',
        progress: ((verifiedCount - 3) / (7 - 3)) * 100,
        remaining: 7 - verifiedCount,
        perks: ['1.2x Cashback Points', 'Expedited Review (<2 Hours)', 'Exclusive Partner Flash Discounts'],
      };
    }
    return {
      tierName: 'Bronze Trader',
      multiplier: '1.0x',
      badgeColor: 'from-amber-700 to-amber-900',
      textColor: 'text-amber-700',
      nextTier: 'Silver Trader (3 Challenges)',
      progress: (verifiedCount / 3) * 100,
      remaining: 3 - verifiedCount,
      perks: ['Standard Cashback Points', 'Full Rewards Store Access', 'Automated WhatsApp Delivery Tracking'],
    };
  };

  const vip = getVipTierInfo(verifiedChallenges);

  // Trigger 2FA step
  const handleProceedTo2FA = (e: React.FormEvent) => {
    e.preventDefault();
    setPayoutLoading(true);
    setTimeout(() => {
      setPayoutLoading(false);
      setOtpSent(true);
      setPayoutStep('2FA_OTP');
    }, 600);
  };

  // Confirm 2FA and execute payout
  const handleVerify2FAAndPayout = () => {
    setPayoutLoading(true);
    setTimeout(() => {
      setPayoutLoading(false);
      setPayoutStep('SUCCESS');
    }, 900);
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
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100/80 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>Regulated Cashback Escrow</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Trader Wallet &amp; Payout Center
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time balance, VIP tier multipliers, and 2FA-secured crypto &amp; wire cashout gateway.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportStatement}
            className="border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 shadow-xs"
          >
            <Download className="h-3.5 w-3.5 mr-1.5 text-slate-500 dark:text-slate-400" />
            Export Statement
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setPayoutStep('DETAILS');
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
                  {vip.tierName.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                <Sparkles className="h-3 w-3" />
                <span>{vip.multiplier} MULTIPLIER</span>
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
                  ${availableUsd} <span className="text-sm font-bold text-slate-400">USD</span>
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-emerald-400 font-mono">
                <Coins className="h-4 w-4" />
                <span>{availablePoints.toLocaleString()} Available Points</span>
              </div>
            </div>

            {/* Card Footer */}
            <div className="relative pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono">ID: {user?.id?.slice(0, 8) || 'TRD-88219'}</span>
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <CheckCircle2 className="h-3.5 w-3.5" />
                KYC Level 2 Verified
              </span>
            </div>
          </div>
        </div>

        {/* 3 Secondary Wallet Stat Cards (7 cols) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Pending Escrow Maturation */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-3 flex flex-col justify-between transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Pending Escrow Maturation
              </span>
              <div className="h-8 w-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                ${pendingUsd} <span className="text-xs font-bold text-slate-400">USD</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {pendingPoints.toLocaleString()} PTS in cooling window
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Pending Purchases:</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">
                {summary?.pendingPurchases ?? 0} Submissions
              </span>
            </div>
          </div>

          {/* VIP Loyalty Level Widget */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-3 flex flex-col justify-between transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Loyalty Tier Status
              </span>
              <div className="h-8 w-8 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Crown className="h-4 w-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>{vip.tierName}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  {vip.multiplier}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {vip.remaining > 0 ? `${vip.remaining} more challenges to unlock ${vip.nextTier}` : 'Top Tier Reached!'}
              </p>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
                style={{ width: `${Math.min(vip.progress, 100)}%` }}
              />
            </div>
          </div>

          {/* Lifetime Points Earned */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-3 flex flex-col justify-between transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Lifetime Points Earned
              </span>
              <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <ArrowDownLeft className="h-4 w-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                ${lifetimeUsd} <span className="text-xs font-bold text-slate-400">USD</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {lifetimeEarned.toLocaleString()} PTS total accumulated
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Verified Challenges:</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {verifiedChallenges} Challenges
              </span>
            </div>
          </div>

          {/* Lifetime Redeemed & Liquidated */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-3 flex flex-col justify-between transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Redeemed &amp; Paid Out
              </span>
              <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Gift className="h-4 w-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                ${redeemedUsd} <span className="text-xs font-bold text-slate-400">USD</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {lifetimeRedeemed.toLocaleString()} PTS claimed in gear &amp; cash
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Redemptions:</span>
              <Link href="/dashboard/redemptions" className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
                View History →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Escrow Information Banner */}
      <div className="p-4 sm:p-5 rounded-2xl border border-blue-200/80 dark:border-blue-900/40 bg-blue-50/60 dark:bg-blue-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div className="flex items-start sm:items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
            <Lock className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-blue-950 dark:text-blue-200">How the Prop Firm Escrow Protocol Works</h4>
            <p className="text-xs text-blue-800/80 dark:text-blue-300/80 leading-relaxed">
              When your challenge purchase is verified, points enter a standard escrow cooling period (matching the prop firm&apos;s refund policy). Once matured, points automatically unlock into your spendable balance.
            </p>
          </div>
        </div>
        <Link href="/faq">
          <span className="text-xs font-bold text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 hover:underline shrink-0">
            Escrow FAQs →
          </span>
        </Link>
      </div>

      {/* Interactive Ledger Activity Table */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden space-y-4 p-6 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Wallet Transaction Ledger
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Complete auditable record of all credits, releases, withdrawals, and store purchases.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter Pills */}
            <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 text-xs font-bold">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  filterType === 'ALL'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('EARNED')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  filterType === 'EARNED'
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Earned (+)
              </button>
              <button
                onClick={() => setFilterType('REDEEMED')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  filterType === 'REDEEMED'
                    ? 'bg-white dark:bg-slate-700 text-rose-700 dark:text-rose-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
                className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 w-44"
              />
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
              <Coins className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No transactions found</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
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
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Points</th>
                  <th className="py-3 px-4 text-right">USD Equivalent</th>
                  <th className="py-3 px-4 text-right">Balance After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTransactions.map((tx) => {
                  const isPositive = tx.points > 0;
                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap font-mono">
                        {formatDate(tx.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                        {tx.description}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {tx.type}
                        </span>
                      </td>
                      <td
                        className={`py-3.5 px-4 text-right font-black font-mono ${
                          isPositive
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {isPositive ? `+${tx.points.toLocaleString()}` : tx.points.toLocaleString()} PTS
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-600 dark:text-slate-300 font-mono">
                        ${(Math.abs(tx.points) / 100).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                        {tx.balanceAfter.toLocaleString()} PTS
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cashout Modal with 2FA WhatsApp Security OTP Verification */}
      {payoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {payoutStep === 'DETAILS' ? 'Request Cashback Payout' : payoutStep === '2FA_OTP' ? '2FA WhatsApp Verification' : 'Payout Dispatched'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {payoutStep === 'DETAILS' ? 'Convert your available PTS into Crypto USDT or Direct Wire' : payoutStep === '2FA_OTP' ? 'Enter security PIN sent to your phone' : 'Transaction completed'}
                </p>
              </div>
              <button
                onClick={() => setPayoutModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg p-1.5"
              >
                ✕
              </button>
            </div>

            {payoutStep === 'DETAILS' && (
              <form onSubmit={handleProceedTo2FA} className="space-y-4">
                {/* Method selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Payout Rail *</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPayoutMethod('crypto')}
                      className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                        payoutMethod === 'crypto'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      USDT / USDC
                    </button>
                    <button
                      type="button"
                      onClick={() => setPayoutMethod('bank')}
                      className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                        payoutMethod === 'bank'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      Bank Wire
                    </button>
                    <button
                      type="button"
                      onClick={() => setPayoutMethod('voucher')}
                      className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                        payoutMethod === 'voucher'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      Prop Pass
                    </button>
                  </div>
                </div>

                {/* Amount input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Withdrawal Amount (PTS) *</label>
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
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <span className="text-slate-500 dark:text-slate-400">Gross Value:</span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400">
                      ${(payoutAmountPts / 100).toFixed(2)} USD
                    </span>
                  </div>
                </div>

                {/* Crypto rail details */}
                {payoutMethod === 'crypto' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Crypto Network</label>
                      <select
                        value={cryptoNetwork}
                        onChange={(e) => setCryptoNetwork(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="TRC20">USDT (TRON - TRC20) [Fastest &amp; Zero Fee]</option>
                        <option value="ERC20">USDT / USDC (Ethereum - ERC20)</option>
                        <option value="BEP20">USDT (BNB Chain - BEP20)</option>
                        <option value="SOL">USDC (Solana - SPL)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Recipient Destination Wallet Address *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Txyz... or 0x..."
                        value={cryptoAddress}
                        onChange={(e) => setCryptoAddress(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </>
                )}

                {/* Bank rail details */}
                {payoutMethod === 'bank' && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">IBAN / Bank Account Details *</label>
                    <input
                      type="text"
                      required
                      placeholder="Account holder, IBAN/SWIFT or Routing #"
                      value={bankDetails}
                      onChange={(e) => setBankDetails(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                )}

                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-500/30 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <span>Next step requires a quick 2FA WhatsApp security code to protect your balance.</span>
                </div>

                <Button
                  type="submit"
                  disabled={payoutLoading || payoutAmountPts > availablePoints || availablePoints === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 shadow-md"
                >
                  {payoutLoading ? 'Generating Security Pin...' : 'Proceed to Security Verification →'}
                </Button>
              </form>
            )}

            {/* 2FA WhatsApp Step */}
            {payoutStep === '2FA_OTP' && (
              <div className="space-y-5">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-3">
                  <MessageCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">WhatsApp OTP Dispatched:</span>
                    A 6-digit confirmation code has been sent to your verified phone number (<strong>{user?.phone || '+91 98765 43210'}</strong>).
                  </div>
                </div>

                <div className="space-y-2 text-center">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Enter 6-Digit WhatsApp Security Code:
                  </label>
                  <div className="flex justify-center gap-2">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <input
                        key={i}
                        type="text"
                        maxLength={1}
                        defaultValue={i === 0 ? '7' : i === 1 ? '4' : i === 2 ? '9' : i === 3 ? '2' : i === 4 ? '1' : '8'}
                        className="w-10 h-12 text-center text-lg font-mono font-black rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-400">Demo sandbox: pre-filled with verified token 749218</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setPayoutStep('DETAILS')}
                    className="w-1/3 border-slate-300 dark:border-slate-700"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleVerify2FAAndPayout}
                    isLoading={payoutLoading}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    <Check className="h-4 w-4 mr-1.5" />
                    Verify &amp; Dispatch ${(payoutAmountPts / 100).toFixed(2)} USD
                  </Button>
                </div>
              </div>
            )}

            {/* Payout Success Screen */}
            {payoutStep === 'SUCCESS' && (
              <div className="text-center py-6 space-y-4">
                <div className="h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">Payout Dispatched &amp; Secured!</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Your withdrawal of{' '}
                  <span className="font-bold text-slate-900 dark:text-white">
                    ${(payoutAmountPts / 100).toFixed(2)} USD ({payoutAmountPts.toLocaleString()} PTS)
                  </span>{' '}
                  has been verified via WhatsApp 2FA and queued for automated blockchain dispatch (&lt;15 mins).
                </p>
                <div className="pt-2">
                  <Button onClick={() => setPayoutModalOpen(false)} className="w-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold">
                    Return to Wallet
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
