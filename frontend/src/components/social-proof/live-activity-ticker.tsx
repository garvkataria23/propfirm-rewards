'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { ShieldCheck, Gift, Trophy, Sparkles, TrendingUp, Zap } from 'lucide-react';

export interface LiveActivityItem {
  id: string;
  type: 'PURCHASE' | 'REDEMPTION' | 'TIER_UPGRADE';
  traderName: string;
  location: string;
  title: string;
  badge: string;
  points: number;
  timeAgo: string;
  propFirmOrItem: string;
}

const DEFAULT_FEED: LiveActivityItem[] = [
  {
    id: 'live-1',
    type: 'PURCHASE',
    traderName: 'Alex M.',
    location: 'London, UK',
    title: 'Verified $100K FTMO Evaluation',
    badge: 'VERIFIED',
    points: 6000,
    timeAgo: '3m ago',
    propFirmOrItem: 'FTMO',
  },
  {
    id: 'live-2',
    type: 'REDEMPTION',
    traderName: 'Dev P.',
    location: 'Mumbai, IN',
    title: 'Redeemed AirPods Max (Space Gray)',
    badge: 'REWARD UNLOCKED',
    points: 20000,
    timeAgo: '7m ago',
    propFirmOrItem: 'AirPods Max',
  },
  {
    id: 'live-3',
    type: 'PURCHASE',
    traderName: 'Marcus T.',
    location: 'Frankfurt, DE',
    title: 'Verified $200K Stellar Challenge',
    badge: 'VERIFIED',
    points: 10990,
    timeAgo: '11m ago',
    propFirmOrItem: 'FundedNext',
  },
  {
    id: 'live-4',
    type: 'TIER_UPGRADE',
    traderName: 'Lucas K.',
    location: 'Dubai, UAE',
    title: 'Unlocked VIP Prop Master (1.5x Multiplier)',
    badge: 'VIP TIER',
    points: 25000,
    timeAgo: '16m ago',
    propFirmOrItem: 'Prop Master',
  },
  {
    id: 'live-5',
    type: 'PURCHASE',
    traderName: 'Vikram S.',
    location: 'Delhi, IN',
    title: 'Verified $50K Evaluation Challenge',
    badge: 'VERIFIED',
    points: 3900,
    timeAgo: '24m ago',
    propFirmOrItem: 'FTMO',
  },
  {
    id: 'live-6',
    type: 'REDEMPTION',
    traderName: 'Sofia R.',
    location: 'Madrid, ES',
    title: 'Redeemed $100 Amazon Gift Card',
    badge: 'REWARD UNLOCKED',
    points: 10000,
    timeAgo: '32m ago',
    propFirmOrItem: 'Amazon Gift Card',
  },
];

export function LiveActivityTicker() {
  const [items, setItems] = useState<LiveActivityItem[]>(DEFAULT_FEED);

  useEffect(() => {
    let mounted = true;
    api
      .get<LiveActivityItem[]>('/notifications/live-feed')
      .then((data) => {
        if (mounted && Array.isArray(data) && data.length > 0) {
          setItems(data);
        }
      })
      .catch(() => {
        // Fallback to default curated feed
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Double items for seamless infinite horizontal scroll
  const marqueeItems = [...items, ...items];

  return (
    <div className="relative w-full overflow-hidden border-y border-emerald-500/20 bg-[#070b0e]/95 backdrop-blur-md py-2.5 z-20">
      {/* Glow lines */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 flex items-center gap-4">
        {/* Fixed Header Label */}
        <div className="flex-shrink-0 flex items-center gap-2 pr-4 border-r border-slate-800">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="text-[11px] font-mono font-bold tracking-wider text-emerald-400 uppercase">
            Live Stream
          </span>
        </div>

        {/* Scrolling Items */}
        <div className="overflow-hidden flex-1 relative [mask-image:linear-gradient(to_right,transparent,white_5%,white_95%,transparent)]">
          <div className="flex items-center gap-6 animate-marquee whitespace-nowrap will-change-transform hover:[animation-play-state:paused]">
            {marqueeItems.map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-300 shadow-sm"
              >
                {item.type === 'PURCHASE' ? (
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    {item.traderName}
                  </span>
                ) : item.type === 'REDEMPTION' ? (
                  <span className="inline-flex items-center gap-1 text-amber-400 font-semibold">
                    <Gift className="w-3.5 h-3.5 text-amber-400" />
                    {item.traderName}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-cyan-400 font-semibold">
                    <Trophy className="w-3.5 h-3.5 text-cyan-400" />
                    {item.traderName}
                  </span>
                )}

                <span className="text-slate-400 font-normal">
                  {item.title}
                </span>

                <span
                  className={`font-mono font-bold text-[11px] px-1.5 py-0.5 rounded ${
                    item.type === 'PURCHASE'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : item.type === 'REDEMPTION'
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  }`}
                >
                  +{item.points.toLocaleString()} PTS
                </span>

                <span className="text-[10px] text-slate-400 font-mono">
                  {item.timeAgo}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
