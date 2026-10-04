'use client';

import React from 'react';
import { ShieldCheck, Coins, PackageCheck, Layers } from 'lucide-react';
import { Reveal } from './motion-primitives';
import { FloatingCandlesticks } from '@/components/trading/floating-candlesticks';

/**
 * §11 · TRUST SECTION
 * Clean #101614 icon cards with high readability:
 * - Secure Verification
 * - Transparent Points
 * - Tracked Redemptions
 * - Multiple Prop-Firm Offers
 */
export function TrustStrip() {
  const pillars = [
    {
      icon: <ShieldCheck className="h-5 w-5 text-emerald-400" />,
      title: 'Secure Verification',
      description: 'Every eligible purchase submission is reviewed and verified against partner referral records.',
    },
    {
      icon: <Coins className="h-5 w-5 text-emerald-400" />,
      title: 'Transparent Points',
      description: 'Clear point allocations shown upfront for every participating challenge account size.',
    },
    {
      icon: <PackageCheck className="h-5 w-5 text-emerald-400" />,
      title: 'Tracked Redemptions',
      description: 'Follow your reward status from redemption confirmation through processing and delivery.',
    },
    {
      icon: <Layers className="h-5 w-5 text-emerald-400" />,
      title: 'Multiple Prop-Firm Offers',
      description: 'Compare participating prop-firm evaluations and earn points across multiple account tiers.',
    },
  ];

  return (
    <section className="relative overflow-hidden w-full py-14 sm:py-16 bg-[#f8fafc] dark:bg-[#070a09] border-b border-slate-200 dark:border-white/[0.08] transition-colors duration-300">
      <FloatingCandlesticks />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {pillars.map((item, idx) => (
            <Reveal key={item.title} delay={idx * 70}>
              <div className="h-full p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#101614] border border-slate-200 dark:border-white/[0.09] hover:border-emerald-500/40 shadow-xs transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between gap-3.5">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/12 border border-emerald-500/25 flex items-center justify-center">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-200 mt-1.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
