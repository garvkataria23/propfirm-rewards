'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';

export function Footer() {
  const pathname = usePathname();
  const isPortal = pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin');

  if (isPortal) {
    return null;
  }

  return (
    <footer className="relative w-full bg-white dark:bg-[#030506] text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-white/[0.07] font-sans overflow-hidden transition-colors duration-300">
      {/* #38: Very subtle top emerald line */}
      <div
        className="h-[1px] w-full bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent"
        aria-hidden="true"
      />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:py-16 sm:px-6 lg:px-8 space-y-12">
        {/* Top Grid: Brand + 3 Navigation Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-5 space-y-4">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="relative h-10 w-10 shrink-0 rounded-xl bg-[#090d14] border border-slate-200 dark:border-white/10 shadow-md flex items-center justify-center p-0.5 overflow-hidden group-hover:border-emerald-500/50 transition-all">
                <img
                  src="/pn-logo-hd.png?v=3"
                  alt="PROP NATION Logo"
                  className="h-full w-full object-contain rounded-lg select-none"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white leading-none flex items-center">
                  <span>PROP</span>
                  <span className="text-emerald-600 dark:text-emerald-400 ml-1.5">NATION</span>
                </span>
                <span className="text-[10px] font-mono font-semibold tracking-[0.18em] text-slate-500 dark:text-slate-400 uppercase mt-1">
                  TRADE · EARN · GET REWARDED
                </span>
              </div>
            </Link>

            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
              Turn eligible prop-firm purchases into rewards. Purchase eligible prop-firm accounts using our referral codes, submit your purchase for verification, earn reward points, and redeem them for real-world rewards.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-600 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                Verified Purchases
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                Transparent Points
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
                <Lock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                Tracked Redemptions
              </span>
            </div>
          </div>

          {/* Columns: PRODUCT, SUPPORT, LEGAL */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
            {/* PRODUCT */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Product
              </h4>
              <ul className="space-y-2.5 text-slate-600 dark:text-slate-400">
                <li>
                  <Link href="/#how-it-works" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="/#video-academy" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                    Video Academy
                  </Link>
                </li>
                <li>
                  <Link href="/prop-firms" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                    Prop Firms
                  </Link>
                </li>
                <li>
                  <Link href="/rewards" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                    Rewards
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            {/* SUPPORT */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Support
              </h4>
              <ul className="space-y-2.5 text-slate-600 dark:text-slate-400">
                <li>
                  <Link href="/#faq" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/support/live" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/help-center" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                    Help Center
                  </Link>
                </li>
              </ul>
            </div>

            {/* LEGAL */}
            <div className="space-y-3.5 col-span-2 sm:col-span-1">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Legal
              </h4>
              <ul className="space-y-2.5 text-slate-600 dark:text-slate-400">
                <li>
                  <Link href="/terms" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms#reward-terms" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                    Reward Terms
                  </Link>
                </li>
                <li>
                  <Link href="/terms#affiliate-disclosure" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                    Affiliate Disclosure
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Compliance & Affiliate Disclosure Block */}
        <div className="pt-8 border-t border-slate-200 dark:border-white/[0.07] space-y-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <p className="text-slate-800 dark:text-slate-300 font-medium">
            PROP NATION is an affiliate/rewards platform and is not a prop firm, broker, investment advisor, or financial advisor.
          </p>
          <p className="text-slate-500">
            <strong>Affiliate &amp; Rewards Disclosure:</strong> When you purchase eligible prop-firm accounts using our partner referral links or codes (such as <span className="font-mono text-slate-800 dark:text-slate-300">NATION</span>), PROP NATION may earn an affiliate commission from the participating prop firm at no extra cost to you. Reward points are issued only after purchase verification and are redeemable solely according to our Reward Terms. Nothing on this website constitutes financial, investment, or trading advice, nor does PROP NATION guarantee funding, trading profits, or financial returns.
          </p>
        </div>

        {/* Bottom Copyright Row */}
        <div className="pt-4 border-t border-slate-200/70 dark:border-white/[0.05] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
          <div>© 2026 PROP NATION. All rights reserved.</div>
          <div className="flex items-center gap-5">
            <Link href="/terms" className="hover:text-slate-800 dark:hover:text-slate-300 transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-slate-800 dark:hover:text-slate-300 transition-colors">
              Privacy
            </Link>
            <Link href="/terms#affiliate-disclosure" className="hover:text-slate-800 dark:hover:text-slate-300 transition-colors">
              Affiliate Disclosure
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
