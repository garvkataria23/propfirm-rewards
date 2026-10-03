'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Gift, Trophy, X, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface ToastItem {
  id: string;
  type: 'PURCHASE' | 'REDEMPTION' | 'TIER';
  trader: string;
  location: string;
  item: string;
  points: number;
  timeAgo: string;
}

const TOAST_EVENTS: ToastItem[] = [
  {
    id: 't-1',
    type: 'PURCHASE',
    trader: 'Alex M.',
    location: 'London, UK',
    item: '$100K FTMO Evaluation Challenge',
    points: 6000,
    timeAgo: 'Just now',
  },
  {
    id: 't-2',
    type: 'REDEMPTION',
    trader: 'Dev P.',
    location: 'Mumbai, India',
    item: 'Apple AirPods Max (Space Gray)',
    points: 20000,
    timeAgo: '4 mins ago',
  },
  {
    id: 't-3',
    type: 'PURCHASE',
    trader: 'Vikram S.',
    location: 'Delhi, India',
    item: '$200K FundedNext Stellar 2-Step',
    points: 10990,
    timeAgo: '8 mins ago',
  },
  {
    id: 't-4',
    type: 'TIER',
    trader: 'Lucas K.',
    location: 'Dubai, UAE',
    item: 'Unlocked VIP Prop Master (1.5x Multiplier)',
    points: 25000,
    timeAgo: '14 mins ago',
  },
];

export function LiveRewardToast() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (isDismissed) return;

    // Show initial toast after 4 seconds
    const initialTimer = setTimeout(() => {
      setIsVisible(true);
    }, 4000);

    // Loop through notifications every 16 seconds
    const loopInterval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIdx((prev) => (prev + 1) % TOAST_EVENTS.length);
        setIsVisible(true);
      }, 1000);
    }, 16000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(loopInterval);
    };
  }, [isDismissed]);

  // Hide for 5 seconds after 5 seconds of visibility
  useEffect(() => {
    if (!isVisible) return;
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 6000);
    return () => clearTimeout(hideTimer);
  }, [isVisible, currentIdx]);

  if (isDismissed) return null;

  const current = TOAST_EVENTS[currentIdx];

  return (
    <div
      className={`fixed bottom-6 left-6 z-40 max-w-sm transition-all duration-500 transform ${
        isVisible
          ? 'translate-y-0 opacity-100 scale-100'
          : 'translate-y-8 opacity-0 scale-95 pointer-events-none'
      }`}
    >
      <div className="relative rounded-2xl bg-[#090e13]/95 border border-emerald-500/30 p-3.5 shadow-2xl shadow-black/80 backdrop-blur-xl">
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${
              current.type === 'PURCHASE'
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                : current.type === 'REDEMPTION'
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                : 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400'
            }`}
          >
            {current.type === 'PURCHASE' && <ShieldCheck className="w-5 h-5" />}
            {current.type === 'REDEMPTION' && <Gift className="w-5 h-5" />}
            {current.type === 'TIER' && <Trophy className="w-5 h-5" />}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
              <span className="font-semibold text-slate-200">{current.trader}</span>
              <span>•</span>
              <span>{current.location}</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">{current.timeAgo}</span>
            </div>

            <p className="text-xs font-medium text-slate-200 truncate mt-0.5">
              {current.item}
            </p>

            <div className="flex items-center gap-2 mt-1.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                +{current.points.toLocaleString()} PTS
              </span>
              <Link
                href="/rewards"
                className="text-[11px] text-slate-400 hover:text-emerald-300 transition-colors flex items-center gap-0.5 underline underline-offset-2"
              >
                View Vault
              </Link>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={() => setIsDismissed(true)}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1 -mt-1 -mr-1"
            title="Dismiss notifications"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
