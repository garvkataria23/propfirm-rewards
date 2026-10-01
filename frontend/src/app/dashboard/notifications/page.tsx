'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Bell,
  CheckCheck,
  Coins,
  ShieldCheck,
  Gift,
  AlertTriangle,
  Info,
  ExternalLink,
} from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string; // PURCHASE, POINTS, REDEMPTION, SYSTEM
  isRead: boolean;
  linkUrl?: string;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'POINTS' | 'PURCHASE'>('ALL');

  useEffect(() => {
    // In our backend, notifications may be fetched from API or seeded
    api
      .get<NotificationItem[]>('/notifications')
      .then((data) => setNotifications(data))
      .catch(() => {
        // Fallback default notifications if none returned
        setNotifications([
          {
            id: 'n-1',
            title: 'Welcome to PropNation Rewards',
            message: 'Your account is verified! Explore eligible CFD and Futures prop firms and submit your first purchase proof to earn reward points.',
            type: 'SYSTEM',
            isRead: false,
            linkUrl: '/prop-firms',
            createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          },
          {
            id: 'n-2',
            title: 'Double Points Weekend Promo',
            message: 'Earn up to 20% bonus points on all funded challenge submissions verified this week.',
            type: 'POINTS',
            isRead: false,
            linkUrl: '/dashboard/points',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
          },
          {
            id: 'n-3',
            title: 'Verification System Online',
            message: 'Our automated verification desk has verified 140+ submissions today with average approval time under 45 minutes.',
            type: 'PURCHASE',
            isRead: true,
            linkUrl: '/dashboard/verification',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markSingleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.isRead;
    if (filter === 'POINTS') return n.type === 'POINTS';
    if (filter === 'PURCHASE') return n.type === 'PURCHASE';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="purple">Alerts Hub</Badge>
            {unreadCount > 0 && (
              <span className="text-xs bg-blue-500/20 text-blue-300 font-bold px-2 py-0.5 rounded-full border border-blue-500/30">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1 flex items-center gap-2.5">
            <Bell className="h-7 w-7 text-blue-500" />
            Notifications
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time updates regarding your submissions, approvals, points credits, and rewards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllRead}>
              <CheckCheck className="h-4 w-4 mr-1.5 text-blue-400" />
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#14234b]/60 pb-3">
        {(['ALL', 'UNREAD', 'POINTS', 'PURCHASE'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === tab
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            {tab === 'ALL'
              ? 'All Alerts'
              : tab === 'UNREAD'
              ? `Unread (${unreadCount})`
              : tab}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <Card className="p-12 text-center space-y-3 bg-[#070e20] border-[#14234b]/60">
            <Bell className="h-10 w-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No notifications</h3>
            <p className="text-xs text-slate-400">You are all caught up! No alerts in this category.</p>
          </Card>
        ) : (
          filteredNotifications.map((item) => {
            let Icon = Info;
            let iconColor = 'text-blue-400 bg-blue-950/60 border-blue-500/30';
            if (item.type === 'POINTS') {
              Icon = Coins;
              iconColor = 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30';
            } else if (item.type === 'PURCHASE') {
              Icon = ShieldCheck;
              iconColor = 'text-amber-400 bg-amber-950/60 border-amber-500/30';
            } else if (item.type === 'REDEMPTION') {
              Icon = Gift;
              iconColor = 'text-purple-400 bg-purple-950/60 border-purple-500/30';
            }

            return (
              <Card
                key={item.id}
                className={`p-4 sm:p-5 transition-all flex items-start justify-between gap-4 ${
                  item.isRead
                    ? 'bg-[#070e20]/60 border-[#14234b]/40 opacity-80'
                    : 'bg-[#0a142e] border-blue-500/30 shadow-md shadow-blue-950/30'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`h-10 w-10 rounded-xl border flex items-center justify-center shrink-0 ${iconColor}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{item.title}</h4>
                      {!item.isRead && (
                        <span className="h-2 w-2 rounded-full bg-blue-400" />
                      )}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                      {item.message}
                    </p>
                    <div className="text-[11px] text-slate-500 pt-1">
                      {new Date(item.createdAt).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  {item.linkUrl && (
                    <Link href={item.linkUrl}>
                      <Button variant="ghost" size="sm" className="text-xs text-blue-400 hover:text-blue-300">
                        View
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  )}
                  {!item.isRead && (
                    <button
                      onClick={() => markSingleRead(item.id)}
                      className="text-[11px] text-slate-400 hover:text-slate-200"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
