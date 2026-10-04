'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useNotifications, FALLBACK_NOTIFICATIONS } from '@/hooks/use-notifications';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Bell,
  CheckCheck,
  Coins,
  ShieldCheck,
  Gift,
  Info,
  ExternalLink,
} from 'lucide-react';

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    loading,
    markAllRead,
    markSingleRead,
    markSingleUnread,
  } = useNotifications();
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'POINTS' | 'PURCHASE'>('ALL');

  const safeNotifications = Array.isArray(notifications) ? notifications : FALLBACK_NOTIFICATIONS;

  const filteredNotifications = safeNotifications.filter((n) => {
    if (filter === 'UNREAD') return !n.isRead;
    if (filter === 'POINTS') return n.type === 'POINTS';
    if (filter === 'PURCHASE') return n.type === 'PURCHASE';
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="purple">Alerts Hub</Badge>
            {unreadCount > 0 ? (
              <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 font-bold px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-500/30">
                {unreadCount} Unread
              </span>
            ) : (
              <span className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/30">
                All Caught Up
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1 flex items-center gap-2.5">
            <Bell className="h-7 w-7 text-blue-600 dark:text-blue-500" />
            Notifications
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Real-time updates regarding your submissions, approvals, points credits, and rewards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllRead}>
              <CheckCheck className="h-4 w-4 mr-1.5 text-blue-600 dark:text-blue-400" />
              Mark all as read ({unreadCount})
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-[#14234b]/60 pb-3">
        {(['ALL', 'UNREAD', 'POINTS', 'PURCHASE'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === tab
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/40'
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
              <div
                key={i}
                className="h-20 rounded-2xl bg-slate-200/60 dark:bg-slate-900/60 animate-pulse border border-slate-200 dark:border-slate-800"
              />
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <Card className="p-12 text-center space-y-3 bg-white dark:bg-[#070e20] border-slate-200 dark:border-[#14234b]/60 shadow-xs">
            <Bell className="h-10 w-10 text-slate-400 dark:text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No notifications</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              You are all caught up! No alerts in this category.
            </p>
          </Card>
        ) : (
          filteredNotifications.map((item) => {
            let Icon = Info;
            let iconColor =
              'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-500/30';
            if (item.type === 'POINTS') {
              Icon = Coins;
              iconColor =
                'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-500/30';
            } else if (item.type === 'PURCHASE') {
              Icon = ShieldCheck;
              iconColor =
                'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-500/30';
            } else if (item.type === 'REDEMPTION') {
              Icon = Gift;
              iconColor =
                'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-500/30';
            }

            return (
              <Card
                key={item.id}
                onClick={() => {
                  if (!item.isRead) markSingleRead(item.id);
                }}
                className={`p-4 sm:p-5 transition-all flex items-start justify-between gap-4 ${
                  item.isRead
                    ? 'bg-slate-50/70 border-slate-200/80 text-slate-700 dark:bg-[#070e20]/60 dark:border-[#14234b]/40 dark:text-slate-300 opacity-90'
                    : 'bg-white border-blue-200 shadow-sm dark:bg-[#0a142e] dark:border-blue-500/30 dark:shadow-md dark:shadow-blue-950/30 cursor-pointer'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`h-10 w-10 rounded-xl border flex items-center justify-center shrink-0 ${iconColor}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </h4>
                      {!item.isRead && (
                        <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                      {item.message}
                    </p>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 pt-1">
                      {new Date(item.createdAt).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </div>
                  </div>
                </div>

                <div
                  className="flex flex-col items-end gap-2 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  {item.linkUrl && (
                    <Link
                      href={item.linkUrl}
                      onClick={() => {
                        if (!item.isRead) markSingleRead(item.id);
                      }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                      >
                        View
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  )}
                  {!item.isRead ? (
                    <button
                      onClick={() => markSingleRead(item.id)}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer"
                    >
                      Mark read
                    </button>
                  ) : (
                    <button
                      onClick={() => markSingleUnread(item.id)}
                      className="text-[11px] text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 cursor-pointer"
                    >
                      Mark unread
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
