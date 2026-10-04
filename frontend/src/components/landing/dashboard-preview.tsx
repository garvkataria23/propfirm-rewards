'use client';

import React from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Coins,
  Gift,
  ArrowUpRight,
  ShieldCheck,
  Wallet,
  PlusCircle,
} from 'lucide-react';

interface DashboardPreviewProps {
  mode?: 'hero' | 'full';
  active?: boolean;
}

/**
 * REAL PROP NATION DASHBOARD PHOTO PREVIEW (`/dashboard-preview.png`)
 * Uses the actual high-resolution screenshot of our Trader Portal (`/dashboard`)
 * inside a sleek browser frame in both `mode="hero"` and `mode="full"` so the
 * layout, typography, and metallic KPI cards are 100% proportional and never squished.
 */
export function DashboardPreview({ mode = 'full' }: DashboardPreviewProps) {
  // ============================================================================
  // 1. HERO MODE (`mode="hero"`) — Real Dashboard Screenshot + Floating Badges
  // ============================================================================
  if (mode === 'hero') {
    return (
      <div className="relative w-full">
        {/* Main Browser Frame with Real Dashboard Screenshot */}
        <div className="relative rounded-2xl bg-[#060b18] border border-white/[0.14] shadow-[0_32px_80px_-15px_rgba(0,0,0,0.92),0_0_1px_1px_rgba(16,185,129,0.18)] overflow-hidden group">
          {/* Top Specular Edge */}
          <div
            className="h-[1px] w-full bg-gradient-to-r from-transparent via-emerald-400/60 to-cyan-400/40"
            aria-hidden="true"
          />

          {/* Browser Header Bar */}
          <div className="px-4 py-2.5 bg-[#050914] border-b border-slate-800/90 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500/85" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500/85" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/85" />
              </div>
              <div className="ml-2 px-3 py-0.5 rounded-lg bg-[#070e20] border border-slate-800 font-mono text-[11px] text-slate-200 truncate flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>propnation.app/dashboard</span>
              </div>
            </div>

            <Link
              href="/dashboard"
              className="px-2.5 py-1 rounded-md bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/35 font-mono text-[10px] font-bold text-emerald-300 transition-colors shrink-0 flex items-center gap-1"
            >
              <span>LIVE PORTAL</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Actual High-Resolution Dashboard Screenshot */}
          <Link href="/dashboard" className="block relative overflow-hidden bg-[#060b18]">
            <img
              src="/dashboard-preview.png"
              alt="Prop Nation Actual Trader Dashboard"
              className="w-full h-auto object-cover block transition-transform duration-700 group-hover:scale-[1.015]"
            />
            {/* Subtle bottom vignette blend */}
            <div
              className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#060b18]/60 to-transparent pointer-events-none"
              aria-hidden="true"
            />
          </Link>
        </div>

        {/* Floating Top-Right Verification Pill */}
        <div className="hidden sm:flex absolute -top-3.5 right-4 z-20 items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#07111e]/95 border border-emerald-500/45 shadow-[0_12px_30px_rgba(0,0,0,0.65),0_0_20px_rgba(16,185,129,0.22)] backdrop-blur-md">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <span className="font-mono text-[11px] font-bold text-emerald-300">
            ✓ Purchase Verified · +4,500 PTS Credited
          </span>
        </div>

        {/* Floating Bottom-Right Real Product Reward Badge */}
        <Link
          href="/rewards"
          className="hidden sm:flex absolute -bottom-4 right-4 z-20 items-center gap-3 p-2.5 pr-4 rounded-2xl bg-[#07111e]/95 border border-emerald-500/40 shadow-[0_16px_40px_rgba(0,0,0,0.8),0_0_25px_rgba(16,185,129,0.2)] backdrop-blur-md hover:border-emerald-400 transition-all group"
        >
          <div className="h-11 w-11 rounded-xl overflow-hidden border border-emerald-500/35 bg-[#05080f] shrink-0">
            <img
              src="/iphone-16-pro-real.jpg"
              alt="iPhone 16 Pro Max"
              className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
              TARGET REWARD · 75% UNLOCKED
            </div>
            <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
              <span>iPhone 16 Pro Max</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
            </div>
          </div>
        </Link>
      </div>
    );
  }

  // ============================================================================
  // 2. FULL SHOWCASE MODE (`mode="full"`) — Full High-Res Actual Dashboard Photo
  // ============================================================================
  return (
    <div className="space-y-6">
      <div className="relative rounded-3xl bg-[#060b18] border border-white/[0.14] shadow-[0_36px_90px_-20px_rgba(0,0,0,0.92),0_0_1px_1px_rgba(16,185,129,0.16)] overflow-hidden group">
        {/* Top Specular Edge */}
        <div
          className="h-[1px] w-full bg-gradient-to-r from-transparent via-emerald-400/55 to-cyan-400/40"
          aria-hidden="true"
        />

        {/* Decorative Browser Frame */}
        <div className="px-4 sm:px-6 py-3.5 bg-[#050914] border-b border-slate-800/90 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <span className="h-3 w-3 rounded-full bg-rose-500/85 shrink-0" />
            <span className="h-3 w-3 rounded-full bg-amber-500/85 shrink-0" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/85 shrink-0" />
            <div className="ml-2 sm:ml-3 px-3.5 py-1 rounded-lg bg-[#070e20] border border-slate-800 font-mono text-xs text-slate-200 flex items-center gap-2 truncate">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="text-emerald-400">https://</span>
              <span className="truncate">propnation.app/dashboard</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <div className="hidden md:inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono bg-emerald-500/15 border border-emerald-500/40 text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>100% Real Prop Nation Trader Portal</span>
            </div>

            <Link
              href="/dashboard"
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-extrabold transition-all flex items-center gap-1"
            >
              <span>OPEN DASHBOARD</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Actual Full-Resolution Trader Portal Screenshot */}
        <Link href="/dashboard" className="block relative bg-[#060b18] overflow-hidden">
          <img
            src="/dashboard-preview.png"
            alt="Prop Nation Trader Dashboard Overview"
            className="w-full h-auto object-cover block transition-transform duration-700 group-hover:scale-[1.008]"
          />
        </Link>

        {/* Bottom Quick Action Bar */}
        <div className="px-4 sm:px-6 py-3.5 bg-[#050914] border-t border-slate-800/90 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 font-medium">
            <span className="inline-flex items-center gap-1.5">
              <Coins className="h-3.5 w-3.5 text-emerald-400" />
              <span>Real-Time Points Ledger</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
              <span>24h Challenge Verification</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Gift className="h-3.5 w-3.5 text-purple-400" />
              <span>Instant Tech &amp; USDT Redemptions</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/purchases/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Submit Purchase Proof</span>
            </Link>
            <Link
              href="/dashboard/wallet"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition-colors"
            >
              <Wallet className="h-3.5 w-3.5 text-emerald-400" />
              <span>Trader Wallet</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
