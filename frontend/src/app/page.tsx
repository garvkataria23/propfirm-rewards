'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Coins,
  Gift,
  Flame,
  TrendingUp,
  Clock,
  Layers,
  ChevronDown,
  Calculator,
  ExternalLink,
  Wallet,
  Star,
  Users,
  Award,
  Zap,
  Lock,
  Headphones,
} from 'lucide-react';

interface PropFirmOffer {
  id: string;
  accountTierName: string;
  purchasePriceUsd: number;
  rewardPoints: number;
}

interface PropFirm {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  description: string;
  websiteUrl: string;
  affiliateCode: string;
  affiliateUrl: string;
  offers: PropFirmOffer[];
}

interface Reward {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  pointsRequired: number;
  stock: number;
  isUnlimitedStock: boolean;
  category: { name: string; slug: string };
}

// Simulated real-time verified trader stream
const LIVE_STREAM_ACTIVITY = [
  { trader: '@Marco_FX (UK)', action: 'Verified $100K FundedNext', pts: '+4,500 PTS', time: '2m ago' },
  { trader: '@David_T (DE)', action: 'Withdrew $250.00 USDT', pts: 'Paid Out', time: '5m ago' },
  { trader: '@S_Kapoor (IN)', action: 'Verified $50K Funding Pips', pts: '+2,400 PTS', time: '8m ago' },
  { trader: '@Lucas_R (US)', action: 'Redeemed Apple iPad Air M2', pts: 'Shipped via DHL', time: '14m ago' },
  { trader: '@Jean_P (FR)', action: 'Verified $200K FTMO Challenge', pts: '+11,200 PTS', time: '19m ago' },
  { trader: '@Mateo_C (ES)', action: 'Claimed Free $25K Challenge', pts: 'Code Issued', time: '23m ago' },
];

export default function HomePage() {
  const [propFirms, setPropFirms] = useState<PropFirm[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Calculator state
  const [calcSelectedFirmId, setCalcSelectedFirmId] = useState<string>('');
  const [calcSelectedOfferId, setCalcSelectedOfferId] = useState<string>('');

  // FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    // Load active prop firms and rewards from live backend
    api
      .get<PropFirm[]>('/prop-firms')
      .then((data) => {
        setPropFirms(data);
        if (data.length > 0) {
          setCalcSelectedFirmId(data[0].id);
          if (data[0].offers && data[0].offers.length > 0) {
            setCalcSelectedOfferId(data[0].offers[0].id);
          }
        }
      })
      .catch(console.error);

    api
      .get<Reward[]>('/rewards', { inStockOnly: true })
      .then((data) => {
        setRewards(data.slice(0, 4));
      })
      .catch(console.error);
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const selectedFirm = propFirms.find((p) => p.id === calcSelectedFirmId);
  const selectedOffer = selectedFirm?.offers.find((o) => o.id === calcSelectedOfferId);

  const steps = [
    {
      num: '01',
      title: 'Choose Prop Firm & Apply Code',
      desc: 'Pick your preferred prop firm from our directory and apply our exclusive partner referral code at checkout.',
    },
    {
      num: '02',
      title: 'Upload Invoice & Order ID',
      desc: 'Submit your purchase proof, order ID, and receipt screenshot in your clean trader dashboard portal.',
    },
    {
      num: '03',
      title: 'Automated & Manual Audit',
      desc: 'Our compliance team verifies your purchase against prop firm affiliate records within 12 to 24 hours.',
    },
    {
      num: '04',
      title: 'Points Credited To Wallet',
      desc: 'Earn up to 30% back in reward points credited immediately to your tamper-proof ledger (100 PTS = $1 USD).',
    },
    {
      num: '05',
      title: 'Redeem Gear or Cash Out',
      desc: 'Exchange points for brand new MacBook Pros, trading monitors, free evaluation passes, or instant USDT withdrawals.',
    },
    {
      num: '06',
      title: 'Express Insured Delivery',
      desc: 'Physical gadgets are dispatched brand new via express DHL/FedEx with full tracking and insurance.',
    },
  ];

  const faqs = [
    {
      q: 'How does PropFirm Rewards work?',
      a: 'We partner with leading proprietary trading firms. When you purchase an evaluation or challenge account using our affiliate links or referral discount codes, the prop firm credits us an affiliate commission. Rather than keeping it all, we share this value with you as reward points that you can redeem for tech gear, trading hardware, free evaluation accounts, or direct USDT cashouts.',
    },
    {
      q: 'Is PropFirm Rewards a prop firm or broker?',
      a: 'No, absolutely not. We do not provide trading capital, financial advice, or brokerage services. We are solely an affiliate loyalty rewards platform providing maximum cashbacks and gear to prop firm traders.',
    },
    {
      q: 'How long does purchase verification take?',
      a: 'Most purchases are verified and credited with reward points within 12 to 24 hours. Once verified, points are immediately available in your wallet.',
    },
    {
      q: 'What is the points to dollar valuation?',
      a: 'Our points have a clear, transparent valuation: 100 PTS = $1.00 USD. A 10,000 PTS balance gives you $100.00 USD worth of rewards, free challenge passes, or cashout value.',
    },
    {
      q: 'Can I withdraw my points directly to Crypto or Bank?',
      a: 'Yes! Head to your Trader Wallet section in the dashboard to request instant USDT (TRC-20/ERC-20) or Direct Bank Wire cashouts, processed in under 15 minutes for verified accounts.',
    },
    {
      q: 'How are physical tech rewards shipped?',
      a: 'Physical electronics and hardware (MacBooks, iPads, 4K monitors, Keychron keyboards) are dispatched brand-new via express couriers (FedEx, DHL, UPS) with signature confirmation and tracking.',
    },
  ];

  return (
    <div className="flex flex-col gap-24 pb-20 transition-colors">
      {/* Live Social Proof Activity Ticker */}
      <div className="w-full bg-slate-100/90 dark:bg-[#050b18] border-b border-slate-200 dark:border-slate-800/80 py-2.5 px-4 overflow-hidden transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold shrink-0">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="uppercase tracking-wider">Live Activity:</span>
          </div>

          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar whitespace-nowrap text-slate-600 dark:text-slate-400">
            {LIVE_STREAM_ACTIVITY.map((item, idx) => (
              <div key={idx} className="inline-flex items-center gap-2">
                <span className="text-slate-900 dark:text-white font-semibold">{item.trader}</span>
                <span>{item.action}</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20">
                  {item.pts}
                </span>
                <span className="text-slate-400 dark:text-slate-600 font-mono text-[10px]">{item.time}</span>
                {idx < LIVE_STREAM_ACTIVITY.length - 1 && <span className="text-slate-300 dark:text-slate-700">•</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 overflow-hidden bg-grid-pattern">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-blue-500/10 dark:bg-blue-500/15 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[450px] h-[300px] bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none" />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 text-center space-y-8">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2.5 rounded-full border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-400 shadow-xs">
            <Sparkles className="h-3.5 w-3.5" />
            <span>The #1 Cashback &amp; Rewards Club for Proprietary Traders</span>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
              <Star className="h-3 w-3 text-amber-500 fill-amber-500" /> 4.9/5 TrustScore
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            Turn Every Prop Challenge Into{' '}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-blue-600 dark:from-emerald-400 dark:via-teal-300 dark:to-blue-400 bg-clip-text text-transparent">
              Real-World Rewards.
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            Never buy a prop firm challenge at full price again. Apply our partner referral codes, verify your invoice in &lt;24 hours, and get <span className="text-slate-900 dark:text-white font-bold">up to 30% back</span> in spendable reward points, tech gear, or instant crypto cashouts.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto shadow-lg shadow-blue-600/20 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base px-8 py-6">
                Start Earning Cashback
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/prop-firms">
              <Button variant="outline" size="lg" className="w-full sm:w-auto border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white px-8 py-6 font-semibold">
                <Layers className="h-4 w-4 mr-2 text-emerald-600 dark:text-emerald-400" />
                Browse 20+ Prop Firms
              </Button>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 max-w-4xl mx-auto border-t border-slate-200 dark:border-slate-800/80">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800/80 text-center shadow-xs">
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">$450,000+</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Cashback Distributed</div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800/80 text-center shadow-xs">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">&lt; 24 Hours</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Audit &amp; Credit SLA</div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800/80 text-center shadow-xs">
              <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">14,200+</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Active Prop Traders</div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800/80 text-center shadow-xs">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">100%</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Insured Tech Delivery</div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Grid: Direct Purchase vs PropRewards */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <Badge variant="purple">Why Smart Traders Use Us</Badge>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Stop Leaving Free Capital On The Table
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Why buy prop firm challenges directly when you can earn massive loyalty dividends?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Buying Direct Card */}
          <div className="rounded-3xl border border-rose-200 dark:border-rose-500/20 bg-rose-50/50 dark:bg-rose-950/10 p-8 space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-rose-200 dark:border-rose-500/20">
                <span className="text-sm font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
                  Buying Directly From Prop Firm
                </span>
                <span className="text-xs bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 font-bold px-2.5 py-1 rounded-full">
                  0% Return
                </span>
              </div>
              <ul className="space-y-4 pt-6 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-3">
                  <span className="h-5 w-5 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xs">✕</span>
                  <span>Pay full price with zero cashback or loyalty credit</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="h-5 w-5 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xs">✕</span>
                  <span>If you fail the evaluation, 100% of your fee is permanently lost</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="h-5 w-5 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xs">✕</span>
                  <span>No second-chance challenge pass vouchers</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="h-5 w-5 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xs">✕</span>
                  <span>No tech gadgets, monitors, or crypto rewards</span>
                </li>
              </ul>
            </div>
            <div className="p-4 rounded-xl bg-rose-100/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/20 text-xs text-rose-800 dark:text-rose-300 font-medium">
              Traders lose an average of $380/year in unclaimed affiliate dividends.
            </div>
          </div>

          {/* Buying via PropRewards Card */}
          <div className="rounded-3xl border border-emerald-300 dark:border-emerald-500/40 bg-gradient-to-br from-white via-white to-emerald-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/30 p-8 space-y-6 flex flex-col justify-between shadow-xl relative">
            <div className="absolute -top-3.5 right-8">
              <span className="bg-emerald-600 text-white text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow-md">
                RECOMMENDED BY 14K+ TRADERS
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between pb-4 border-b border-emerald-200 dark:border-emerald-500/20">
                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  Buying With PropRewards Code
                </span>
                <span className="text-xs bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold px-2.5 py-1 rounded-full">
                  Up To 30% Cashback
                </span>
              </div>
              <ul className="space-y-4 pt-6 text-sm text-slate-700 dark:text-slate-200">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Get up to 30% back in points on every single account purchase</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Redeem points for 100% Free Prop Firm challenge evaluations</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Withdraw cash directly to USDT Crypto or Direct Bank Wire</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Claim MacBooks, TradingView Pro subscriptions &amp; 4K Displays</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>24/7 dedicated proof audit and dispute resolution desk</span>
                </li>
              </ul>
            </div>
            <Link href="/register">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 shadow-md shadow-emerald-600/20">
                Join Free &amp; Claim Your Points →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Visual Journey Flow Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <Badge variant="success">Simple 6-Step Journey</Badge>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            How The Rewards System Works
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            A transparent and seamless process designed to maximize value from every challenge purchase.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((s, idx) => (
            <div
              key={idx}
              className="relative p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 card-hover-glow space-y-3 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-500/20">
                  STEP {s.num}
                </span>
                <CheckCircle2 className="h-5 w-5 text-slate-400 dark:text-slate-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{s.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Points Calculator */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="relative rounded-3xl border border-emerald-200 dark:border-emerald-500/30 bg-white dark:bg-gradient-to-b dark:from-slate-900/90 dark:to-slate-950 p-8 sm:p-10 shadow-xl backdrop-blur-xl transition-colors">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-md">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                <Calculator className="h-4 w-4" />
                <span>Rewards &amp; Cashout Calculator</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Calculate Your Challenge Reward Points
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Select any partner prop firm and challenge size to see exact points and equivalent dollar cashout value.
              </p>

              {/* Form Selectors */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Select Prop Firm
                  </label>
                  <select
                    value={calcSelectedFirmId}
                    onChange={(e) => {
                      setCalcSelectedFirmId(e.target.value);
                      const firm = propFirms.find((p) => p.id === e.target.value);
                      if (firm && firm.offers && firm.offers.length > 0) {
                        setCalcSelectedOfferId(firm.offers[0].id);
                      }
                    }}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                  >
                    {propFirms.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Select Challenge Size
                  </label>
                  <select
                    value={calcSelectedOfferId}
                    onChange={(e) => setCalcSelectedOfferId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                  >
                    {selectedFirm?.offers?.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.accountTierName} (${o.purchasePriceUsd})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Result Box */}
            <div className="w-full md:w-80 rounded-2xl border border-emerald-200 dark:border-emerald-500/40 bg-emerald-50/60 dark:bg-emerald-950/30 p-6 text-center space-y-4 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                You Will Earn
              </div>
              <div className="text-4xl sm:text-5xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                {selectedOffer ? selectedOffer.rewardPoints.toLocaleString() : '0'}
              </div>
              <div className="text-xs font-bold text-slate-600 dark:text-slate-300">
                Reward Points (≈ ${selectedOffer ? (selectedOffer.rewardPoints / 100).toFixed(2) : '0.00'} USD)
              </div>

              {selectedFirm && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">Referral Code to use at checkout:</div>
                  <div className="flex items-center justify-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg shadow-xs">
                    <span className="font-mono font-bold text-sm text-emerald-700 dark:text-emerald-300">
                      {selectedFirm.affiliateCode}
                    </span>
                    <button
                      onClick={() => handleCopyCode(selectedFirm.affiliateCode)}
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
                      title="Copy Code"
                    >
                      {copiedCode === selectedFirm.affiliateCode ? (
                        <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              <Link href="/dashboard/purchases/new" className="block pt-2">
                <Button className="w-full font-bold" size="sm">
                  Submit This Purchase Proof
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Prop Firms Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <Badge variant="purple">Partner Network</Badge>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-2">
              Featured Prop Firms
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Top industry proprietary trading firms with verified point yields.
            </p>
          </div>
          <Link href="/prop-firms">
            <Button variant="outline" size="sm" className="border-slate-300 dark:border-slate-700">
              View All Firms
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {propFirms.map((firm) => {
            const maxPoints =
              firm.offers && firm.offers.length > 0
                ? Math.max(...firm.offers.map((o) => o.rewardPoints))
                : 0;
            return (
              <div
                key={firm.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-6 card-hover-glow space-y-6 shadow-xs"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 flex items-center justify-center overflow-hidden">
                      {firm.logoUrl ? (
                        <img
                          src={firm.logoUrl}
                          alt={firm.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="font-bold text-slate-800 dark:text-white text-lg">{firm.name[0]}</span>
                      )}
                    </div>
                    <Badge variant="success">Up to {maxPoints.toLocaleString()} PTS</Badge>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{firm.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {firm.description}
                    </p>
                  </div>

                  {/* Affiliate code badge */}
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3 space-y-1.5">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold block">
                      Referral Code
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-bold text-emerald-700 dark:text-emerald-400">
                        {firm.affiliateCode}
                      </span>
                      <button
                        onClick={() => handleCopyCode(firm.affiliateCode)}
                        className="rounded p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                        title="Copy code"
                      >
                        {copiedCode === firm.affiliateCode ? (
                          <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <a
                    href={firm.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button variant="secondary" size="sm" className="w-full">
                      Visit &amp; Buy
                      <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                    </Button>
                  </a>
                  <Link href={`/prop-firms/${firm.slug}`} className="block">
                    <Button variant="ghost" size="sm" className="w-full text-xs">
                      View Challenge Offers
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Rewards Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <Badge variant="info">Marketplace</Badge>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-2">
              Featured Rewards
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Redeem verified points for brand-new electronics, monitors, sneakers, and gift cards.
            </p>
          </div>
          <Link href="/rewards">
            <Button variant="outline" size="sm" className="border-slate-300 dark:border-slate-700">
              Explore Full Catalog
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {rewards.map((reward) => (
            <div
              key={reward.id}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 overflow-hidden card-hover-glow shadow-xs"
            >
              <div className="aspect-video w-full bg-slate-100 dark:bg-slate-950 overflow-hidden relative">
                <img
                  src={reward.imageUrl}
                  alt={reward.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2.5 left-2.5">
                  <Badge variant="default" className="bg-white/90 dark:bg-slate-950/80 text-slate-900 dark:text-white backdrop-blur-md border border-slate-200 dark:border-slate-800">
                    {reward.category?.name}
                  </Badge>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                    {reward.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-2">
                    <Coins className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                      {reward.pointsRequired.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Points</span>
                  </div>
                </div>

                <Link href={`/rewards/${reward.slug}`} className="block">
                  <Button variant="secondary" size="sm" className="w-full">
                    Redeem Reward
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-2">
          <Badge variant="outline">Got Questions?</Badge>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Everything you need to know about the PropFirm Rewards loyalty program.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 overflow-hidden shadow-xs"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full px-6 py-4.5 text-left flex items-center justify-between font-semibold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-sm sm:text-base"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/50">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Trust & CTA Banner */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative rounded-3xl border border-blue-200 dark:border-slate-800 bg-gradient-to-r from-blue-50 via-white to-blue-50/50 dark:from-blue-950/40 dark:via-slate-900 dark:to-slate-900/90 p-8 sm:p-14 text-center space-y-6 overflow-hidden shadow-xl transition-colors">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-blue-500/30 bg-blue-100 dark:bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-400">
            <Coins className="h-4 w-4" />
            <span>Ready To Upgrade Your Setup?</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight max-w-2xl mx-auto">
            Trade With Better Odds. Claim Your Loyalty Rewards.
          </h2>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
            Create your account in seconds, explore eligible prop firms, and claim the rewards you deserve for your trading purchases.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href="/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20">
                Create Free Trader Account
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200">
                Contact Support Desk
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
