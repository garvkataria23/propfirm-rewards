'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Upload,
  ShieldCheck,
  Coins,
  Gift,
  CheckCircle2,
  ArrowRight,
  FileImage,
  Wallet,
  Headphones,
  Loader2,
  Clock,
  Truck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Reveal, TradingVisualBackground, useInView, useAnimatedNumber } from './motion-primitives';

/**
 * #18 & #19 · STEP 01 (BUY): Actual Prop Firm Offer Card UI
 * Shows Prop Firm, $100 Challenge, 2,500 Points, Eligible Purchase badge, and View Offer -> Submit connection.
 */
export function PurchaseAnimation({ isDone }: { isDone: boolean }) {
  return (
    <div className="relative space-y-3.5">
      {/* Subtle Background Grid */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none rounded-xl"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(16, 185, 129, 0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(16, 185, 129, 0.35) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
        <span className="text-[11px] sm:text-xs font-mono font-bold text-slate-300 uppercase truncate">
          propnation.app/prop-firms · Offer Selection
        </span>
        <Badge variant="success">Eligible Purchase</Badge>
      </div>

      {/* Actual Application Prop Firm Offer Card */}
      <div
        className={`relative z-10 p-3.5 sm:p-4 rounded-2xl bg-[#080f1e] border transition-all duration-500 space-y-3 ${
          isDone
            ? '-translate-y-0.5 border-emerald-500/45 shadow-[0_14px_30px_-10px_rgba(16,185,129,0.28)]'
            : 'border-slate-800'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          <div>
            <div className="text-[10px] sm:text-[11px] font-mono text-slate-400">PARTICIPATING PROP FIRM</div>
            <div className="text-base sm:text-lg font-black text-white">Eligible Partner Offer</div>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-[10px] sm:text-[11px] font-mono text-slate-400">REFERRAL CODE</div>
            <span className="inline-block px-2.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/35 font-mono text-xs font-bold text-emerald-300">
              Partner Code Applied
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#060b18] border border-slate-800 flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] sm:text-[11px] font-mono text-slate-400">Account / Challenge</div>
            <div className="text-sm sm:text-base font-extrabold text-white">$100 Challenge</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] sm:text-[11px] font-mono text-slate-400">Reward Value</div>
            <div className="text-sm sm:text-base font-mono font-black text-emerald-400">2,500 Points</div>
          </div>
        </div>
      </div>

      {/* Animated Green Line Connecting to SUBMIT */}
      <div className="relative z-10 flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 rounded-xl bg-[#080f1e] border border-emerald-500/30 text-[11px] sm:text-xs font-mono">
        <span className="text-white font-semibold shrink-0">View Offer → Checkout</span>
        <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden min-w-[24px]">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-700"
            style={{ width: isDone ? '100%' : '30%' }}
          />
        </div>
        <span className="text-emerald-400 font-bold shrink-0">SUBMIT PROOF →</span>
      </div>
    </div>
  );
}

/**
 * #21 · STEP 03 (VERIFY): Actual Verification Status Pipeline UI
 * SUBMITTED -> UNDER REVIEW -> VERIFIED -> POINTS CREDITED
 */
export function VerificationAnimation({ isDone }: { isDone: boolean }) {
  const stages = [
    { label: 'SUBMITTED', badge: 'PENDING', done: true },
    { label: 'UNDER REVIEW', badge: 'UNDER REVIEW', done: true },
    { label: 'VERIFIED', badge: 'APPROVED', done: isDone },
    { label: 'POINTS CREDITED', badge: '+2,500 PTS', done: isDone },
  ];

  return (
    <div className="space-y-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
        <span className="text-[11px] sm:text-xs font-mono font-bold text-slate-300 uppercase truncate">
          propnation.app/dashboard/verification
        </span>
        {isDone ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="h-3 w-3" /> APPROVED
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-950/60 text-blue-400 border border-blue-500/30">
            <ShieldCheck className="h-3 w-3" /> UNDER REVIEW
          </span>
        )}
      </div>

      <div
        className={`relative overflow-hidden p-3.5 sm:p-4 rounded-2xl border space-y-3 transition-all duration-500 ${
          isDone
            ? 'bg-[#08151f] border-emerald-500/45 shadow-[0_0_28px_-8px_rgba(16,185,129,0.28)]'
            : 'bg-[#080f1e] border-slate-800'
        }`}
      >
        {/* Subtle Scanning Line while verifying */}
        {!isDone && (
          <div
            className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-transparent via-emerald-400/20 to-transparent pointer-events-none"
            style={{ animation: 'verifyScanLine 1.6s ease-in-out infinite' }}
            aria-hidden="true"
          />
        )}

        {/* 4-Stage Real Verification Pipeline (#21) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {stages.map((st, idx) => (
            <div
              key={st.label}
              className={`p-2.5 rounded-xl border text-center space-y-1 transition-all duration-500 ${
                st.done
                  ? 'bg-emerald-500/12 border-emerald-500/35 text-white'
                  : 'bg-[#060b18] border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-center">
                {st.done ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : idx === 2 ? (
                  <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
                ) : (
                  <Clock className="h-4 w-4 text-slate-500" />
                )}
              </div>
              <div className="text-[10px] font-mono font-black tracking-wider">{st.label}</div>
              <div className="text-[10px] font-mono text-emerald-400 font-semibold">{st.badge}</div>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-slate-800/80 flex flex-col xs:flex-row sm:flex-row xs:items-center justify-between gap-1 text-[11px] sm:text-xs font-mono">
          <span className="text-slate-300">Order #ORD-84920 · $100 Challenge</span>
          <span className="text-emerald-400 font-bold">
            {isDone ? '✓ Verified · +2,500 Points Credited' : 'Verifying Invoice Proof...'}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * #22 · STEP 04 (EARN): Actual Points Transaction & Available Points Card UI
 * Shows Purchase Verified +2,500 Points, then Available Points 10,000 -> 12,500.
 */
export function PointsAnimation({ isDone }: { isDone: boolean }) {
  const walletBalance = useAnimatedNumber(10000, isDone ? 12500 : 10000, 950, isDone);

  return (
    <div className="space-y-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
        <span className="text-[11px] sm:text-xs font-mono font-bold text-slate-300 uppercase truncate">
          propnation.app/dashboard/points · Ledger Credit
        </span>
        <span className="font-mono text-xs text-emerald-400 font-bold">10,000 → 12,500 PTS</span>
      </div>

      {/* Actual Points Ledger Transaction Row */}
      <div className="p-3.5 rounded-xl bg-[#080f1e] border border-emerald-500/35 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-bold text-white truncate">Purchase Verified</div>
            <div className="text-[11px] font-mono text-slate-400 truncate">
              Eligible Challenge Account · System Credit
            </div>
          </div>
        </div>
        <span className="px-2.5 sm:px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/35 font-mono text-xs sm:text-sm font-black text-emerald-400 shrink-0">
          +2,500 Points
        </span>
      </div>

      {/* Actual Available Points Balance Card Updating 10,000 -> 12,500 */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-[#08151f] to-[#031d17] border border-emerald-500/35 flex items-center justify-between gap-3 sm:gap-4 relative overflow-hidden">
        <div>
          <div className="text-[11px] font-mono font-black uppercase tracking-wider text-emerald-400">
            AVAILABLE POINTS
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-black text-white mt-0.5">
            {walletBalance.toLocaleString('en-US')}{' '}
            <span className="text-xs font-bold text-emerald-400">POINTS</span>
          </div>
          <div className="text-[11px] font-mono text-emerald-300/90 mt-0.5">
            ≈ ${(walletBalance / 100).toFixed(2)} USD Reward Value
          </div>
        </div>

        <div className="text-right font-mono text-[11px] sm:text-xs space-y-1 shrink-0">
          <div className="text-slate-400">Previous: 10,000</div>
          <div className="text-emerald-400 font-bold">Updated: 12,500</div>
        </div>
      </div>
    </div>
  );
}

/**
 * #19–#23 · HOW IT WORKS (Real Product Purchase, Submission, Verification, Credit & Redemption UI)
 */
export function HowItWorks() {
  const { ref, inView } = useInView(0.2);
  const [activeStep, setActiveStep] = useState(0);
  const [uploadPct, setUploadPct] = useState(0);
  const [subState, setSubState] = useState<'initial' | 'done'>('initial');

  useEffect(() => {
    if (!inView) return;
    const stepTimer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 5);
    }, 4800);
    return () => clearInterval(stepTimer);
  }, [inView]);

  useEffect(() => {
    setSubState('initial');
    setUploadPct(0);
    const t0 = setTimeout(() => setUploadPct(50), 450);
    const t1 = setTimeout(() => {
      setUploadPct(100);
      setSubState('done');
    }, 1150);
    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
    };
  }, [activeStep]);

  const steps = [
    {
      num: '01',
      id: 'BUY',
      title: 'BUY',
      subtitle: 'Purchase Using Referral Code',
      desc: 'Browse participating prop firms and purchase an eligible challenge using the referral code displayed on the offer.',
      icon: <ShoppingBag className="h-5 w-5" />,
      ctaLabel: 'Browse Prop Firms',
      ctaHref: '/prop-firms',
    },
    {
      num: '02',
      id: 'SUBMIT',
      title: 'SUBMIT',
      subtitle: 'Submit Purchase Proof',
      desc: 'Complete the actual Submit Purchase form in your dashboard with your Prop Firm, Account/Order ID, Purchase Date, and proof screenshot.',
      icon: <Upload className="h-5 w-5" />,
      ctaLabel: 'Open Submit Purchase Form',
      ctaHref: '/dashboard/purchases/new',
    },
    {
      num: '03',
      id: 'VERIFY',
      title: 'VERIFY',
      subtitle: 'Verification Status Pipeline',
      desc: 'Track your submission live through SUBMITTED → UNDER REVIEW → VERIFIED → POINTS CREDITED.',
      icon: <ShieldCheck className="h-5 w-5" />,
      ctaLabel: 'View Verification Flow',
      ctaHref: '/dashboard/verification',
    },
    {
      num: '04',
      id: 'EARN',
      title: 'EARN',
      subtitle: 'Points Credited to Balance',
      desc: 'Once verified, +2,500 Points are recorded in your Points Ledger and added directly to your Available Points balance.',
      icon: <Coins className="h-5 w-5" />,
      ctaLabel: 'Open Points Ledger',
      ctaHref: '/dashboard/points',
    },
    {
      num: '05',
      id: 'REDEEM',
      title: 'REDEEM',
      subtitle: 'Confirm Redemption & Track Delivery',
      desc: 'Select your reward in the Rewards Store, confirm redemption, and track status from Confirmed and Processing to Shipped and Delivered.',
      icon: <Gift className="h-5 w-5" />,
      ctaLabel: 'Open Rewards Store',
      ctaHref: '/rewards',
    },
  ];

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="w-full py-20 lg:py-24 bg-[#f8fafc] dark:bg-[#081118] border-b border-slate-200 dark:border-white/[0.08] relative overflow-hidden transition-colors duration-300"
    >
      <TradingVisualBackground variant="section" />

      {/* Subtle Atmospheric Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[380px] rounded-full opacity-[0.07] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, #10b981 0%, transparent 70%)',
          filter: 'blur(100px)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Reveal>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/12 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-mono text-xs font-bold uppercase tracking-wider">
              REAL PRODUCT WORKFLOW
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              FROM PURCHASE TO REWARD IN 5 SIMPLE STEPS
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <p className="text-base text-slate-600 dark:text-slate-200 font-mono">
              BUY → SUBMIT → VERIFY → EARN → REDEEM
            </p>
          </Reveal>
        </div>

        {/* Connected 5-Step Journey Bar with Glowing Nodes */}
        <div className="relative">
          <div
            className="hidden lg:block absolute top-1/2 left-8 right-8 -translate-y-1/2 h-[2px] bg-slate-200 dark:bg-white/[0.09] z-0"
            aria-hidden="true"
          >
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-cyan-400 shadow-[0_0_12px_rgba(16,185,129,0.55)] transition-all duration-500"
              style={{ width: `${(activeStep / 4) * 100}%` }}
            />
          </div>

          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {steps.map((step, idx) => {
              const isActive = activeStep === idx;
              const isCompleted = idx < activeStep;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setActiveStep(idx)}
                  className={`p-3.5 sm:p-4 rounded-2xl text-left border transition-all duration-200 cursor-pointer relative overflow-hidden ${
                    idx === 4 ? 'col-span-2 sm:col-span-1' : ''
                  } ${
                    isActive
                      ? 'bg-emerald-50/70 dark:bg-[#0F1922] border-emerald-500/60 shadow-[0_14px_34px_-12px_rgba(16,185,129,0.28)] -translate-y-1'
                      : isCompleted
                      ? 'bg-slate-50 dark:bg-[#0B1218] border-emerald-500/30 hover:border-emerald-500/45'
                      : 'bg-slate-50 dark:bg-[#0B1218] border-slate-200 dark:border-white/[0.09] hover:border-slate-300 dark:hover:border-white/[0.18]'
                  }`}
                >
                  {isActive && (
                    <div
                      className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-emerald-400 to-cyan-400"
                      style={{ animation: 'stepProgress 4.8s linear infinite' }}
                    />
                  )}

                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`inline-flex items-center gap-1.5 font-mono text-xs font-bold ${
                        isActive || isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-300'
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full transition-all ${
                          isActive
                            ? 'bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_8px_#10b981]'
                            : isCompleted
                            ? 'bg-emerald-500'
                            : 'bg-slate-400 dark:bg-slate-600'
                        }`}
                      />
                      STEP {step.num}
                    </span>
                    <div
                      className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${
                        isActive
                          ? 'bg-emerald-500 text-slate-950 shadow-[0_0_14px_rgba(16,185,129,0.4)]'
                          : isCompleted
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : 'bg-slate-200/70 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {step.icon}
                    </div>
                  </div>

                  <div className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {step.title}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-200 mt-0.5 truncate">{step.subtitle}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Step Real Product UI Panel */}
        <div className="rounded-2xl bg-slate-50 dark:bg-[#0B1218] border border-slate-200 dark:border-white/[0.11] p-4 sm:p-9 shadow-xl dark:shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/12 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-mono text-xs font-bold">
                <span className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_8px_#10b981]" />
                <span>
                  STEP {steps[activeStep].num} · {steps[activeStep].title}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {steps[activeStep].subtitle}
              </h3>

              <p className="text-slate-600 dark:text-slate-200 text-base leading-relaxed">
                {steps[activeStep].desc}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href={steps[activeStep].ctaHref}
                  className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all hover:-translate-y-0.5"
                >
                  <span>{steps[activeStep].ctaLabel}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <button
                  type="button"
                  onClick={() => setActiveStep((activeStep + 1) % 5)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/[0.12] bg-white dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] text-xs font-mono font-semibold text-slate-800 dark:text-white transition-colors cursor-pointer"
                >
                  Next Stage →
                </button>
              </div>
            </div>

            {/* Right Interactive Real Product UI (#19–#23) */}
            <div className="lg:col-span-7">
              <div className="p-3.5 sm:p-6 rounded-2xl bg-[#060b18] border border-slate-800/90 min-h-[260px] flex flex-col justify-center">
                {/* STEP 01: BUY */}
                {activeStep === 0 && <PurchaseAnimation isDone={subState === 'done'} />}

                {/* STEP 02: SUBMIT (#20: Actual Purchase Submission Form Fields) */}
                {activeStep === 1 && (
                  <div className="space-y-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                      <span className="text-[11px] sm:text-xs font-mono font-bold text-slate-300 uppercase truncate">
                        propnation.app/dashboard/purchases/new
                      </span>
                      <span className="font-mono text-xs text-emerald-400 font-bold">
                        {uploadPct < 100 ? `Uploading Proof ${uploadPct}%` : '✓ READY TO SUBMIT'}
                      </span>
                    </div>

                    {/* Actual Submission Form Fields (#20: Prop Firm, Account/Order ID, Purchase Date, Referral Code, Upload Proof, Submit Purchase) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="p-2.5 rounded-xl bg-[#080f1e] border border-slate-800">
                        <div className="text-[10px] font-mono text-slate-400 uppercase">Prop Firm</div>
                        <div className="text-xs font-bold text-white mt-0.5">
                          Eligible Partner Prop Firm ($100 Challenge)
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#080f1e] border border-slate-800">
                        <div className="text-[10px] font-mono text-slate-400 uppercase">
                          Account / Order ID
                        </div>
                        <div className="text-xs font-mono font-bold text-white mt-0.5">
                          #ORD-84920
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#080f1e] border border-slate-800">
                        <div className="text-[10px] font-mono text-slate-400 uppercase">
                          Purchase Date
                        </div>
                        <div className="text-xs font-mono font-bold text-white mt-0.5">
                          2026-10-03
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#080f1e] border border-slate-800">
                        <div className="text-[10px] font-mono text-slate-400 uppercase">
                          Referral Code
                        </div>
                        <div className="text-xs font-mono font-bold text-emerald-400 mt-0.5">
                          Partner Code Applied ✓
                        </div>
                      </div>
                    </div>

                    {/* Upload Proof Field + Progress Bar */}
                    <div className="p-3 rounded-xl bg-[#080f1e] border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="flex items-center gap-2 font-mono font-bold text-white truncate">
                          <FileImage className="h-4 w-4 text-emerald-400 shrink-0" />
                          <span className="truncate">Upload Proof: purchase-proof.png</span>
                        </span>
                        <span className="font-mono text-emerald-400 font-bold shrink-0">{uploadPct}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500"
                          style={{ width: `${uploadPct}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <span className="text-[11px] font-mono text-slate-400">
                        Estimated Reward: <strong className="text-emerald-400">+2,500 PTS</strong>
                      </span>
                      <Link href="/dashboard/purchases/new">
                        <Button size="sm" variant="primary" className="text-xs">
                          Submit Purchase →
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}

                {/* STEP 03: VERIFY (#21) */}
                {activeStep === 2 && <VerificationAnimation isDone={subState === 'done'} />}

                {/* STEP 04: EARN (#22) */}
                {activeStep === 3 && <PointsAnimation isDone={subState === 'done'} />}

                {/* STEP 05: REDEEM (#23: Actual Reward Redemption Flow) */}
                {activeStep === 4 && (
                  <div className="space-y-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                      <span className="text-[11px] sm:text-xs font-mono font-bold text-slate-300 uppercase truncate">
                        propnation.app/rewards · Confirm Redemption
                      </span>
                      <Badge variant="success">
                        {subState === 'done' ? 'Redemption Created' : 'Ready to Redeem'}
                      </Badge>
                    </div>

                    <div className="p-3.5 sm:p-4 rounded-2xl bg-[#080f1e] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="h-12 w-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                          <Headphones className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="text-base font-black text-white">Premium Headphones</div>
                          <div className="text-xs font-mono text-emerald-400 font-bold">
                            20,000 Points · Instant / Insured Delivery
                          </div>
                        </div>
                      </div>

                      <Link href="/rewards" className="w-full sm:w-auto">
                        <Button size="sm" variant="primary" className="w-full sm:w-auto text-xs">
                          Confirm Redemption
                        </Button>
                      </Link>
                    </div>

                    {/* Actual Redemption Status Flow (#23) */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono text-[10px]">
                      {[
                        { label: '✓ Points Deducted', active: true },
                        { label: '✓ Processing', active: true },
                        { label: '✓ Shipped', active: subState === 'done' },
                        { label: '○ Delivered', active: false },
                      ].map((stage) => (
                        <div
                          key={stage.label}
                          className={`p-2 rounded-xl border ${
                            stage.active
                              ? 'bg-emerald-500/12 border-emerald-500/35 text-emerald-300 font-bold'
                              : 'bg-[#080f1e] border-slate-800 text-slate-400'
                          }`}
                        >
                          {stage.label}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
