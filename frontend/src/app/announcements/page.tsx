'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Megaphone,
  Sparkles,
  Calendar,
  Gift,
  Coins,
  ArrowRight,
  Pin,
} from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  date: string;
  tag: string;
  pinned?: boolean;
  content: string;
  ctaText?: string;
  ctaLink?: string;
}

const ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'March Double Reward Points Blitz 🚀',
    date: 'March 28, 2026',
    tag: 'PROMOTION',
    pinned: true,
    content:
      'Starting today through Sunday midnight GMT, all verified purchases submitted for $100K and $200K evaluation challenges will receive a 20% bonus points multiplier! Accumulate points twice as fast towards iPads and Apple Watch rewards.',
    ctaText: 'View Eligible Prop Firms',
    ctaLink: '/prop-firms',
  },
  {
    id: 'ann-2',
    title: 'Brand New Rewards Dropped: Apple M3 MacBook Air & Dell UltraSharp 4K',
    date: 'March 25, 2026',
    tag: 'NEW REWARDS',
    pinned: true,
    content:
      'We have restocked the Rewards Store with the latest Apple M3 MacBook Air laptops and premium 32" Dell UltraSharp monitors. All physical rewards are shipped fully insured via DHL Express and FedEx with live tracking provided in your trader portal.',
    ctaText: 'Explore Rewards Store',
    ctaLink: '/rewards',
  },
  {
    id: 'ann-3',
    title: 'New Futures Partner Integration: Topstep & Apex Trader Funding',
    date: 'March 20, 2026',
    tag: 'PARTNER UPDATE',
    content:
      'Futures traders rejoice! You can now use PropNation referral codes when buying Tradovate and NinjaTrader evaluation accounts on Topstep and Apex Trader Funding to earn instant verified points.',
    ctaText: 'Browse Futures Firms',
    ctaLink: '/prop-firms?type=futures',
  },
  {
    id: 'ann-4',
    title: 'Verification Speed Upgrade: Average Turnaround Now Under 45 Minutes',
    date: 'March 14, 2026',
    tag: 'SYSTEM',
    content:
      'Our team has deployed automated order cross-checking. Invoices with clear transaction timestamps and matching email addresses are now processed and approved within minutes during market hours.',
  },
];

export default function AnnouncementsPage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200 dark:border-[#14234b]/60">
        <div>
          <Badge variant="purple">Official Bulletins</Badge>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-2 flex items-center gap-3">
            <Megaphone className="h-9 w-9 text-blue-500" />
            PropNation Announcements
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Stay informed with the latest platform releases, promotional point multipliers, new prop firm partnerships, and reward store drops.
          </p>
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-6">
        {ANNOUNCEMENTS.map((item) => (
          <Card
            key={item.id}
            className={`p-6 sm:p-7 bg-white dark:bg-[#070e20] transition-all space-y-4 shadow-sm ${
              item.pinned
                ? 'border-blue-500/40 shadow-blue-500/5 dark:shadow-xl dark:shadow-blue-950/30'
                : 'border-slate-200/90 dark:border-[#14234b]/60'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                {item.pinned && (
                  <span className="text-[11px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Pin className="h-3 w-3" />
                    Pinned
                  </span>
                )}
                <Badge
                  variant={
                    item.tag === 'PROMOTION'
                      ? 'success'
                      : item.tag === 'NEW REWARDS'
                      ? 'purple'
                      : 'info'
                  }
                >
                  {item.tag}
                </Badge>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Calendar className="h-3.5 w-3.5" />
                <span>{item.date}</span>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{item.title}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-2">{item.content}</p>
            </div>

            {item.ctaText && item.ctaLink && (
              <div className="pt-2">
                <Link href={item.ctaLink}>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white">
                    {item.ctaText}
                    <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
