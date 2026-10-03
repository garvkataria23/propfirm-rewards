'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { CursorSpotlight, ScrollProgressBar } from '@/components/landing/motion-primitives';
import { Hero } from '@/components/landing/hero';
import { TrustStrip } from '@/components/landing/trust-strip';
import { HowItWorks } from '@/components/landing/how-it-works';
import { PropFirms, DEFAULT_PARTICIPATING_FIRMS } from '@/components/landing/prop-firms';
import { PropFirmItem } from '@/components/landing/prop-firm-card';
import { PointsWallet } from '@/components/landing/points-wallet';
import { RewardsVault } from '@/components/landing/rewards-vault';
import { RewardProgress } from '@/components/landing/reward-progress';
import { TraderFeatures } from '@/components/landing/trader-features';
import { DashboardShowcase } from '@/components/landing/dashboard-showcase';
import { RewardTracking } from '@/components/landing/reward-tracking';
import { PropFirmCalculator } from '@/components/calculator/prop-firm-calculator';
import { LiveActivityTicker } from '@/components/social-proof/live-activity-ticker';
import { FAQ } from '@/components/landing/faq';
import { FinalCTA } from '@/components/landing/final-cta';
import { YouTubeVideoHub } from '@/components/landing/youtube-video-hub';

export default function HomePage() {
  const [propFirms, setPropFirms] = useState<PropFirmItem[]>(DEFAULT_PARTICIPATING_FIRMS);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get<any>('/prop-firms');
        const data = Array.isArray(res) ? res : res?.data;
        if (mounted && Array.isArray(data) && data.length > 0) {
          setPropFirms(data);
        }
      } catch {
        // Retain default participating firms when backend is offline
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="relative flex flex-col min-h-screen bg-slate-50 dark:bg-[#030506] text-slate-900 dark:text-white selection:bg-emerald-500 selection:text-slate-950 font-sans overflow-x-hidden transition-colors duration-300">
      {/* #43: Thin 2px green scroll progress indicator at the top of the page */}
      <ScrollProgressBar />

      {/* #44: Desktop-only subtle cursor spotlight */}
      <CursorSpotlight />

      {/* 1. HERO — Light & Dark atmospheric trading environment */}
      <Hero />

      {/* Subtle Activity Bar */}
      <LiveActivityTicker />

      {/* 2. TRUST — Clean premium cards */}
      <TrustStrip />

      {/* 3. HOW IT WORKS — Animated trading/reward journey */}
      <HowItWorks />

      {/* 3B. YOUTUBE VIDEO ACADEMY — 12 Prop Firm & Trading Tutorials (Auto-Played + Full Controls) */}
      <YouTubeVideoHub />

      {/* 4. PROP FIRMS — Trading offer cards */}
      <PropFirms firms={propFirms} />

      {/* 5. POINTS WALLET — Fintech wallet + REWARD POINTS chart */}
      <PointsWallet />

      {/* 6. REWARD VAULT — Premium product showroom */}
      <RewardsVault />

      {/* 7. REWARD UNLOCK / CHALLENGE TO GEAR — Points -> reward animation */}
      <RewardProgress />

      {/* 8. BUILT FOR TRADERS — Strong trading environment */}
      <TraderFeatures />

      {/* 9. DASHBOARD — Floating premium application */}
      <DashboardShowcase />

      {/* 10. REWARD TRACKING — Delivery timeline */}
      <RewardTracking />

      {/* Drawdown Calculator */}
      <section
        id="calculator"
        className="w-full bg-white dark:bg-[#07100F] text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/[0.07] transition-colors duration-300"
      >
        <PropFirmCalculator />
      </section>

      {/* 11. FAQ — Calm readable section */}
      <FAQ />

      {/* 12. FINAL CTA — Cinematic trading atmosphere */}
      <FinalCTA />
    </div>
  );
}
