'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Coins, ShieldCheck, Mail, Headphones, LifeBuoy } from 'lucide-react';

export function Footer() {
  const pathname = usePathname();
  const isPortal = pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin');

  if (isPortal) {
    return null;
  }

  return (
    <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800/80">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-slate-950 font-bold">
                <Coins className="h-4 w-4" />
              </div>
              <span className="text-base font-black text-white tracking-tight">
                PROP<span className="text-emerald-400">REWARDS</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              The premier loyalty rewards and cashback ecosystem for proprietary traders. Purchase eligible challenges using our referral codes, verify your purchase, accumulate points, and redeem for free challenges, crypto payouts, and tech gear.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Verified Partner Network</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Headphones className="h-4 w-4 text-blue-400" />
                <span>24/7 Priority Support</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/prop-firms" className="hover:text-emerald-400 transition-colors">
                  Eligible Prop Firms
                </Link>
              </li>
              <li>
                <Link href="/rewards" className="hover:text-emerald-400 transition-colors">
                  Rewards Marketplace
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-emerald-400 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                  <span>Contact & Support</span>
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 font-semibold px-1 rounded">24/7</span>
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-emerald-400 transition-colors">
                  FAQ & Rules
                </Link>
              </li>
            </ul>
          </div>

          {/* Portals */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Portals</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">
                  Trader Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard/wallet" className="hover:text-emerald-400 transition-colors">
                  Trader Wallet
                </Link>
              </li>
              <li>
                <Link href="/dashboard/purchases/new" className="hover:text-emerald-400 transition-colors">
                  Submit Purchase Proof
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-emerald-400 transition-colors">
                  Sign In / Register
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                  Admin Control Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Regulatory & Affiliate Disclaimer */}
        <div className="pt-8 space-y-4 text-xs text-slate-500 leading-relaxed">
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80">
            <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Affiliate Compliance & Legal Disclosure
            </span>
            <p>
              PropFirm Rewards is an independent promotional affiliate and rewards platform. <strong>We are NOT a proprietary trading firm, registered broker, financial institution, or custodian of client funds.</strong> We do not provide trading capital, financial advice, or investment management. All proprietary trading challenges and accounts referenced on this site are hosted, funded, and operated exclusively by the respective independent prop firms under their specific terms of service. Participation in challenge evaluations is subject to high risk. Rewards points are issued strictly upon successful affiliate verification in accordance with partner terms.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <p>© {new Date().getFullYear()} PropFirm Rewards. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Built for disciplined traders worldwide
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
