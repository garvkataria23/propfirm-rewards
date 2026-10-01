'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Clock,
  Sparkles,
  Gift,
  Truck,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export default function HowItWorksPage() {
  const steps = [
    {
      num: '01',
      title: 'Choose an Eligible Prop Firm',
      description:
        'Browse our verified list of industry-leading proprietary trading firms such as FTMO, Funding Pips, Alpha Capital Group, and FundedNext. Compare challenge accounts and potential reward points.',
      tips: 'Ensure the firm and challenge tier you wish to purchase are active on our platform.',
    },
    {
      num: '02',
      title: 'Apply Our Referral Code at Checkout',
      description:
        'Click our direct affiliate link or copy our exclusive discount/referral code (e.g., PROPREWARDS10) and enter it during checkout on the prop firm website.',
      tips: 'The code must be applied so the prop firm attributes the purchase to our affiliate account.',
    },
    {
      num: '03',
      title: 'Submit Order Details & Proof of Purchase',
      description:
        'Once purchased, log in to your PropFirm Rewards dashboard and submit your Order ID, prop firm name, challenge size, date, and upload a screenshot or PDF receipt.',
      tips: 'Accepted proof: Billing PDF receipt, client dashboard order page, or confirmation email screenshot.',
    },
    {
      num: '04',
      title: 'Verification by Our Team',
      description:
        'Our operations team reviews your submission against verified affiliate portal records to confirm referral code attribution and prevent duplicate entries.',
      tips: 'Average verification turn-around time is under 24 business hours.',
    },
    {
      num: '05',
      title: 'Reward Points Credited Automatically',
      description:
        'As soon as your submission is approved, points are immediately written to your personal Points Ledger. You can watch your available points balance grow in real-time.',
      tips: 'Points are permanent and do not expire.',
    },
    {
      num: '06',
      title: 'Redeem Points for Real-World Rewards',
      description:
        'Visit the Rewards Store and choose from Apple iPhone 16 Pro Max, iPad Pro, Sony Noise-Cancelling Headphones, 38" Curved Trading Monitors, or instant Amazon digital gift cards.',
      tips: 'Our double-spending protection ensures your points are safely reserved during checkout.',
    },
    {
      num: '07',
      title: 'Track Your Delivery to Your Doorstep',
      description:
        'Follow your shipment in your dashboard with live tracking numbers from FedEx, UPS, or DHL. Digital rewards like gift cards are delivered directly to your email.',
      tips: 'You will receive notifications at each status update: Confirmed → Processing → Shipped → Delivered.',
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
          <Compass className="h-3.5 w-3.5" />
          <span>Simple, Transparent, Rewarding</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          How It Works
        </h1>
        <p className="text-base text-slate-300 leading-relaxed">
          From challenge purchase to doorstep delivery: here is how we turn your prop firm purchases into premium trading setup gear.
        </p>
      </div>

      {/* Steps Timeline */}
      <div className="relative space-y-8 before:absolute before:inset-0 before:left-8 sm:before:left-1/2 before:w-0.5 before:-ml-px before:bg-slate-800 before:h-full">
        {steps.map((step, idx) => {
          const isEven = idx % 2 === 0;
          return (
            <div
              key={idx}
              className={`relative flex flex-col sm:flex-row items-start ${
                isEven ? 'sm:flex-row-reverse' : ''
              } gap-6 sm:gap-12`}
            >
              {/* Timeline Center Badge */}
              <div className="absolute left-8 sm:left-1/2 -translate-x-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 border-2 border-emerald-500 text-xs font-black text-emerald-400 shadow-lg shadow-emerald-500/20 z-10">
                {step.num}
              </div>

              {/* Content Box */}
              <div className="ml-16 sm:ml-0 sm:w-1/2">
                <Card className="card-hover-glow space-y-3">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                    Step {step.num}
                  </span>
                  <h3 className="text-xl font-bold text-white tracking-tight">{step.title}</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">{step.description}</p>
                  <div className="rounded-lg bg-slate-950/70 border border-slate-800/80 p-3 text-xs text-slate-400 flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-slate-300">Pro-Tip:</strong> {step.tips}
                    </span>
                  </div>
                </Card>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dos & Don'ts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
        <Card className="border-emerald-500/30 bg-emerald-950/10 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-lg">
            <CheckCircle2 className="h-5 w-5" />
            <span>What To Do</span>
          </div>
          <ul className="space-y-2.5 text-sm text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>Double-check that our referral code was successfully applied at checkout.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>Upload clear PDF invoices or uncropped screenshots with visible Order IDs.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>Submit within 14 days of original account purchase.</span>
            </li>
          </ul>
        </Card>

        <Card className="border-rose-500/30 bg-rose-950/10 space-y-4">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-lg">
            <AlertCircle className="h-5 w-5" />
            <span>What To Avoid</span>
          </div>
          <ul className="space-y-2.5 text-sm text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">✕</span>
              <span>Do not submit accounts purchased without our referral code or link.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">✕</span>
              <span>Do not submit the same order ID twice; duplicate detection will flag it.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">✕</span>
              <span>Do not submit blurry or altered transaction screenshots.</span>
            </li>
          </ul>
        </Card>
      </div>

      {/* CTA Bottom */}
      <div className="text-center pt-8 space-y-4">
        <h3 className="text-2xl font-black text-white">Ready to start earning points?</h3>
        <div className="flex justify-center gap-4">
          <Link href="/prop-firms">
            <Button size="lg">
              Explore Active Prop Firms
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
          <Link href="/dashboard/purchases/new">
            <Button variant="outline" size="lg">
              Submit a Purchase
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
