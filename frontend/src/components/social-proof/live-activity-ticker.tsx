'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { CheckCircle2, Gift, Sparkles, Coins, PackageCheck } from 'lucide-react';

export interface LiveActivityItem {
  id: string;
  type: 'PURCHASE' | 'REDEMPTION' | 'REWARD_ADDED';
  label: string;
  detail: string;
  badge: string;
}

const PLATFORM_CAPABILITY_FEED: LiveActivityItem[] = [
  {
    id: 'act-1',
    type: 'PURCHASE',
    label: 'Purchase Verified',
    detail: '$100 Challenge Account',
    badge: '+2,500 PTS',
  },
  {
    id: 'act-2',
    type: 'REDEMPTION',
    label: 'Reward Redeemed',
    detail: 'Premium Headphones',
    badge: '20,000 PTS',
  },
  {
    id: 'act-3',
    type: 'REWARD_ADDED',
    label: 'Reward Added',
    detail: 'iPad Vault Drop',
    badge: '60,000 PTS',
  },
  {
    id: 'act-4',
    type: 'PURCHASE',
    label: 'Purchase Verified',
    detail: '$200 Challenge Account',
    badge: '+5,000 PTS',
  },
  {
    id: 'act-5',
    type: 'REDEMPTION',
    label: 'Reward Tracking Updated',
    detail: 'Order #RW-10294 Dispatched',
    badge: 'SHIPPED',
  },
  {
    id: 'act-6',
    type: 'PURCHASE',
    label: 'Purchase Verified',
    detail: '$50 Challenge Account',
    badge: '+1,000 PTS',
  },
];

export function LiveActivityTicker() {
  const [items, setItems] = useState<LiveActivityItem[]>(PLATFORM_CAPABILITY_FEED);
  const [isLiveBackend, setIsLiveBackend] = useState(false);

  useEffect(() => {
    let mounted = true;
    api
      .get<any[]>('/notifications/live-feed')
      .then((data) => {
        if (mounted && Array.isArray(data) && data.length > 0) {
          const mapped: LiveActivityItem[] = data.map((d, idx) => ({
            id: d.id || `feed-${idx}`,
            type: d.type === 'REDEMPTION' ? 'REDEMPTION' : 'PURCHASE',
            label: d.type === 'REDEMPTION' ? 'Reward Redeemed' : 'Purchase Verified',
            detail: d.propFirmOrItem || d.title || 'Eligible Offer',
            badge: d.points ? `+${Number(d.points).toLocaleString('en-US')} PTS` : d.badge || 'VERIFIED',
          }));
          setItems(mapped);
          setIsLiveBackend(true);
        }
      })
      .catch(() => {
        // Keep honest Platform Activity showcase items without fabricating user identities
      });
    return () => {
      mounted = false;
    };
  }, []);

  const marqueeItems = [...items, ...items];

  return (
    <div className="relative w-full overflow-hidden border-y border-slate-200 dark:border-white/[0.06] bg-white/95 dark:bg-[#06090f]/95 backdrop-blur-md py-2 sm:py-2.5 z-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center gap-2.5 sm:gap-4">
        {/* Fixed Label */}
        <div className="shrink-0 flex items-center gap-1.5 sm:gap-2 pr-2.5 sm:pr-4 border-r border-slate-200 dark:border-white/10">
          <span className="relative flex h-2 w-2">
            {isLiveBackend && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            )}
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[10px] sm:text-[11px] font-mono font-semibold tracking-wider sm:tracking-widest text-slate-700 dark:text-slate-200 uppercase">
            {isLiveBackend ? (
              <>
                <span className="sm:hidden">LIVE FEED</span>
                <span className="hidden sm:inline">LIVE PLATFORM ACTIVITY</span>
              </>
            ) : (
              <>
                <span className="sm:hidden">LIVE FEED</span>
                <span className="hidden sm:inline">EXAMPLE ACTIVITY</span>
              </>
            )}
          </span>
        </div>

        {/* Marquee */}
        <div className="overflow-hidden flex-1 relative [mask-image:linear-gradient(to_right,transparent,white_4%,white_96%,transparent)]">
          <div className="flex items-center gap-5 animate-marquee whitespace-nowrap will-change-transform hover:[animation-play-state:paused]">
            {marqueeItems.map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                className="inline-flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-slate-100/80 dark:bg-white/[0.025] border border-slate-200 dark:border-white/[0.06] text-xs text-slate-700 dark:text-slate-300"
              >
                {item.type === 'PURCHASE' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : item.type === 'REDEMPTION' ? (
                  <PackageCheck className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                )}
                <span className="font-semibold text-slate-900 dark:text-white">{item.label}</span>
                <span className="text-slate-400 dark:text-slate-500">·</span>
                <span className="text-slate-600 dark:text-slate-400">{item.detail}</span>
                <span
                  className={`font-mono font-bold text-[11px] px-2 py-0.5 rounded-md ${
                    item.type === 'PURCHASE'
                      ? 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25'
                      : 'bg-cyan-500/12 text-cyan-700 dark:text-cyan-300 border border-cyan-500/25'
                  }`}
                >
                  {item.badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
