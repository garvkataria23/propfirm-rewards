'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Activity as ActivityIcon,
  ShieldCheck,
  Coins,
  Gift,
  Upload,
  Clock,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface ActivityEvent {
  id: string;
  type: 'PURCHASE' | 'POINTS' | 'REDEMPTION' | 'SECURITY';
  title: string;
  description: string;
  timestamp: string;
  points?: number;
  status?: string;
  link?: string;
}

export default function ActivityPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'ALL' | 'PURCHASE' | 'POINTS' | 'REDEMPTION'>('ALL');
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch ledger and submissions to create real-time activity events
    Promise.all([
      api.get<any[]>('/points/ledger').catch(() => []),
      api.get<any[]>('/purchases/my').catch(() => []),
      api.get<any[]>('/redemptions/my').catch(() => []),
    ])
      .then(([ledger, purchases, redemptions]) => {
        const combined: ActivityEvent[] = [];

        // Add ledger transactions
        ledger.forEach((item) => {
          combined.push({
            id: `ledger-${item.id}`,
            type: 'POINTS',
            title: item.type === 'PURCHASE_REWARD' ? 'Points Credited' : item.description,
            description: `${item.points > 0 ? '+' : ''}${item.points} Points • Balance: ${item.balanceAfter} PTS`,
            timestamp: item.createdAt,
            points: item.points,
            link: '/dashboard/points',
          });
        });

        // Add purchase submissions
        purchases.forEach((p) => {
          combined.push({
            id: `purchase-${p.id}`,
            type: 'PURCHASE',
            title: `Submitted Purchase Proof: ${p.propFirm?.name || 'Prop Firm'}`,
            description: `Order #${p.orderId} • Tier: ${p.accountType} ($${p.purchaseAmountUsd})`,
            timestamp: p.createdAt,
            status: p.status,
            link: '/dashboard/purchases',
          });
        });

        // Add redemptions
        redemptions.forEach((r) => {
          combined.push({
            id: `redemption-${r.id}`,
            type: 'REDEMPTION',
            title: `Redeemed: ${r.reward?.name || 'Reward Item'}`,
            description: `Spent ${r.pointsSpent.toLocaleString()} PTS • Status: ${r.status}`,
            timestamp: r.createdAt,
            status: r.status,
            link: '/dashboard/redemptions',
          });
        });

        // If no events yet, provide welcome events
        if (combined.length === 0) {
          combined.push({
            id: 'welcome-1',
            type: 'SECURITY',
            title: 'Account Activated',
            description: 'Welcome to PropNation! Account verified and initial access granted.',
            timestamp: new Date().toISOString(),
          });
          combined.push({
            id: 'welcome-2',
            type: 'POINTS',
            title: 'Bonus Ready',
            description: 'Submit your first prop firm purchase to unlock high-tier point multipliers.',
            timestamp: new Date().toISOString(),
            link: '/dashboard/purchases/new',
          });
        }

        // Sort descending by date
        combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setEvents(combined);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredEvents = events.filter((e) => {
    if (filter === 'ALL') return true;
    return e.type === filter;
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="purple">Live Feed</Badge>
            <span className="text-xs text-slate-400">Real-time user actions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1 flex items-center gap-2.5">
            <ActivityIcon className="h-7 w-7 text-blue-500" />
            Account Activity
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Complete chronological record of your submissions, point rewards, and redemptions.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 bg-[#091126] border border-[#14234b] p-1 rounded-xl self-start sm:self-auto">
          {(['ALL', 'POINTS', 'PURCHASE', 'REDEMPTION'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === tab
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'ALL' ? 'All Activity' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Timeline List */}
      <Card className="p-6 bg-[#070e20] border-[#14234b]/60">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-slate-900/60 animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <Clock className="h-10 w-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No activity found</h3>
            <p className="text-xs text-slate-400">There are no records under the selected category.</p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#14234b]">
            {filteredEvents.map((evt) => {
              let Icon = Coins;
              let iconColor = 'text-blue-400 bg-blue-950/60 border-blue-500/30';
              if (evt.type === 'PURCHASE') {
                Icon = Upload;
                iconColor = 'text-amber-400 bg-amber-950/60 border-amber-500/30';
              } else if (evt.type === 'REDEMPTION') {
                Icon = Gift;
                iconColor = 'text-purple-400 bg-purple-950/60 border-purple-500/30';
              } else if (evt.type === 'SECURITY') {
                Icon = ShieldCheck;
                iconColor = 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30';
              }

              return (
                <div key={evt.id} className="relative flex items-start justify-between gap-4 group">
                  {/* Indicator Icon Dot */}
                  <div
                    className={`absolute -left-[30px] top-1 h-6 w-6 rounded-full border flex items-center justify-center shrink-0 ${iconColor} shadow-md`}
                  >
                    <Icon className="h-3 w-3" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{evt.title}</span>
                      {evt.status && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            evt.status === 'APPROVED' || evt.status === 'DELIVERED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : evt.status === 'PENDING'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}
                        >
                          {evt.status}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300">{evt.description}</p>
                    <div className="text-[11px] text-slate-500">
                      {new Date(evt.timestamp).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </div>
                  </div>

                  {evt.link && (
                    <Link href={evt.link}>
                      <Button variant="ghost" size="sm" className="text-xs text-blue-400 hover:text-blue-300">
                        View
                        <ArrowUpRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
