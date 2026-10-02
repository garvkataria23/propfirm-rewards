'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { FileText, AlertTriangle, ArrowLeft, CheckCircle2, Coins, ShieldAlert } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#070b14] text-slate-300 py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Back navigation */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>

        {/* Page Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider">
            <FileText className="h-4 w-4" />
            <span>Platform Agreement &amp; Disclosures</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Terms of Service &amp; Affiliate Disclosure
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Last Updated: October 2, 2026 • Effective Date: October 2, 2026
          </p>
        </div>

        {/* FTC Disclosure Notice Box */}
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-400 text-sm">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>FTC &amp; Global Affiliate Disclosure</span>
          </div>
          <p className="leading-relaxed">
            Prop Nation operates as an independent affiliate partner with various proprietary trading evaluation firms (&quot;Prop Firms&quot;). When you click our partner links or use our coupon codes to purchase an evaluation account, we may receive a commission from the respective firm. In return, we share this value with our users in the form of platform reward points redeemable for physical tech gear, monitors, headphones, and vouchers.
          </p>
        </div>

        {/* Content Card */}
        <Card className="p-6 sm:p-10 bg-slate-900/60 border-slate-800 space-y-8 text-xs sm:text-sm leading-relaxed text-slate-300">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-purple-500" />
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing, browsing, or creating an account on <strong>Prop Nation</strong>, you agree to be bound by these Terms of Service. If you do not agree to all provisions contained herein, you must refrain from using the platform.
            </p>
            <p>
              You must be at least 18 years of age or the age of legal majority in your jurisdiction to participate in our rewards program and purchase prop firm evaluations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-purple-500" />
              2. Rewards Program &amp; Points System
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-400">
              <li>
                <strong className="text-slate-200">Point Allocation:</strong> Points are awarded only for verified challenge purchases made using our designated affiliate codes or referral links. Point multipliers (e.g. 10x challenge purchase cost) are subject to active campaign terms.
              </li>
              <li>
                <strong className="text-slate-200">No Fiat Cash Value:</strong> Platform points are virtual loyalty tokens with no intrinsic monetary value, cannot be withdrawn as cash, and are not bank deposits.
              </li>
              <li>
                <strong className="text-slate-200">Redemption Fulfillment:</strong> Physical electronics and hardware rewards are subject to stock availability and supplier delivery capabilities. Digital vouchers and gift cards are delivered electronically via encrypted account drawers.
              </li>
              <li>
                <strong className="text-slate-200">Customs, Duties &amp; Taxes:</strong> Recipients of physical shipments outside standard free-trade zones may be responsible for local import duties or taxes levied by destination customs authorities.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-purple-500" />
              3. Verification &amp; Anti-Fraud Policy
            </h2>
            <p>
              To maintain the integrity of our platform and partner relationships, all purchase submissions undergo automated and manual compliance review:
            </p>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-start gap-2 text-rose-300">
                <ShieldAlert className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                <div>
                  <strong>Strict Fraud Prohibition:</strong> Submitting altered invoices, duplicate order receipts, forged payment confirmations, or submitting accounts purchased through non-affiliated channels will result in immediate termination of the trader&apos;s account and forfeiture of all points.
                </div>
              </div>
            </div>
            <p>
              If a prop-firm purchase is refunded, charged back, or cancelled by the payment provider, any points credited for that transaction will be debited accordingly.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-purple-500" />
              4. Trading &amp; Financial Risk Disclaimer
            </h2>
            <p className="text-slate-400">
              Prop Nation is not a broker-dealer, financial advisor, investment manager, or proprietary trading firm. We do not provide financial advice, trading signals, or manage client funds.
            </p>
            <p className="text-slate-400">
              Trading futures, foreign exchange (Forex), and contracts for difference (CFDs) carries substantial risk of loss and is not suitable for every investor. Evaluation accounts offered by prop firms operate in simulated trading environments. Past performance in simulated or live accounts is not indicative of future results.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-purple-500" />
              5. Limitation of Liability
            </h2>
            <p>
              In no event shall Prop Nation, its directors, employees, or partners be liable for any indirect, incidental, punitive, or consequential damages resulting from third-party prop firm operational failures, challenge rule breaches, platform downtime, or shipping courier delays.
            </p>
          </section>

          <section className="space-y-3 border-t border-slate-800 pt-6">
            <h2 className="text-lg font-bold text-white">6. Governing Law &amp; Contact</h2>
            <p className="text-slate-400">
              These Terms shall be governed by and construed in accordance with the laws of Delaware, USA, without regard to conflict of law principles. For legal inquiries or questions regarding these terms, contact{' '}
              <span className="text-white font-mono font-bold">legal@propfirmrewards.com</span>.
            </p>
          </section>
        </Card>
      </div>
    </div>
  );
}
