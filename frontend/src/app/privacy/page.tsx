'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { ShieldCheck, Lock, Eye, FileText, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function PrivacyPolicyPage() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4" />
            <span>Legal &amp; Compliance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Last Updated: October 2, 2026 • Effective Date: October 2, 2026
          </p>
        </div>

        {/* Content Card */}
        <Card className="p-6 sm:p-10 bg-slate-900/60 border-slate-800 space-y-8 text-xs sm:text-sm leading-relaxed text-slate-300">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              1. Overview &amp; Scope
            </h2>
            <p>
              Welcome to <strong>Prop Nation</strong> (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). We respect your privacy and are committed to protecting the personal data you share with us when navigating our website, submitting prop-firm purchase proofs, and redeeming rewards.
            </p>
            <p>
              This Privacy Policy explains how we collect, process, store, and safeguard your personal information in compliance with the General Data Protection Regulation (GDPR), California Consumer Privacy Act (CCPA), and global data protection standards.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              2. Information We Collect
            </h2>
            <p>We collect information you provide directly to us when using our platform:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li>
                <strong className="text-slate-200">Account Credentials:</strong> Full name, email address, contact phone number, encrypted password hash, and country of residence.
              </li>
              <li>
                <strong className="text-slate-200">Purchase Verification Data:</strong> Prop firm challenge order IDs, billing invoices, receipts, screenshots, MT4/MT5/cTrader login IDs, purchase timestamps, and transaction amounts.
              </li>
              <li>
                <strong className="text-slate-200">Fulfillment &amp; Shipping Information:</strong> Physical delivery address, postal code, recipient phone number for couriers (DHL, FedEx, UPS), and customs clearance documentation.
              </li>
              <li>
                <strong className="text-slate-200">Technical &amp; Telemetry Data:</strong> IP address, browser type, device identifiers, referral URLs, and cookie preferences.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              3. How We Use Your Information
            </h2>
            <p>We process your personal information strictly for legitimate business purposes:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-400 block text-xs">Affiliate Verification</span>
                <span className="text-[11px] text-slate-400">Reconciling your purchase with partner prop firms to validate affiliate commissions and credit points.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-400 block text-xs">Reward Fulfillment</span>
                <span className="text-[11px] text-slate-400">Transmitting shipping details to logistics carriers and generating digital voucher delivery codes.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-400 block text-xs">Anti-Fraud &amp; Security</span>
                <span className="text-[11px] text-slate-400">Detecting duplicate invoices, unauthorized account takeovers, and fraudulent chargeback attempts.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-400 block text-xs">Automated Alerts</span>
                <span className="text-[11px] text-slate-400">Dispatching real-time email and WhatsApp updates on verification approvals and tracking codes.</span>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              4. Data Retention &amp; Security
            </h2>
            <p>
              We implement enterprise AES-256 encryption in transit (TLS 1.3) and at rest. Passwords are salted and hashed using standard bcrypt algorithms. Payment proofs uploaded to our servers are stored in access-restricted Cloudflare R2 / S3 buckets and accessed only by verified compliance officers.
            </p>
            <p>
              We retain account data for as long as your profile remains active. You may request account deletion and data scrubbing at any time via your trader dashboard or by emailing{' '}
              <a href="mailto:privacy@propfirmrewards.com" className="text-emerald-400 underline font-mono">
                privacy@propfirmrewards.com
              </a>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              5. Your Legal Rights (GDPR &amp; CCPA)
            </h2>
            <p>Depending on your location, you have the right to:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>Request access to the personal data we hold about you.</li>
              <li>Request correction of inaccurate or incomplete information.</li>
              <li>Request complete erasure of your personal data (&quot;Right to be Forgotten&quot;).</li>
              <li>Object to or restrict the processing of your data for marketing.</li>
              <li>Data portability to transfer your records to another platform.</li>
            </ul>
          </section>

          <section className="space-y-3 border-t border-slate-800 pt-6">
            <h2 className="text-lg font-bold text-white">6. Contact Data Protection Officer (DPO)</h2>
            <p className="text-slate-400">
              If you have any questions or wish to exercise your data protection rights, please contact our Data Protection Team at{' '}
              <span className="text-white font-mono font-bold">dpo@propfirmrewards.com</span> or via the Live Support Desk in your trader portal.
            </p>
          </section>
        </Card>
      </div>
    </div>
  );
}
