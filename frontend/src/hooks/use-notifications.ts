'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string; // PURCHASE, POINTS, REDEMPTION, SYSTEM
  isRead: boolean;
  linkUrl?: string;
  createdAt: string;
}

const READ_IDS_STORAGE_KEY = 'propnation_read_notification_ids_v1';
const NOTIFICATIONS_EVENT = 'propnation-notifications-updated';

export const FALLBACK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n-shipping',
    title: '📦 Reward Order Shipped: Apple AirPods Pro 2',
    message:
      'Your parcel is in transit via DHL Express (Tracking #DHL-882941029). Estimated delivery: Tomorrow, By 5:00 PM.',
    type: 'REDEMPTION',
    isRead: false,
    linkUrl: '/dashboard/redemptions',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 'n-cashback',
    title: '✅ Cashback Points Credited: +4,500 PTS',
    message:
      'Your invoice proof for Funding Pips $100K 2-Step (Order #FP-98214) has been approved! Points are ready in your wallet.',
    type: 'POINTS',
    isRead: false,
    linkUrl: '/dashboard/wallet',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'n-vip',
    title: '👑 VIP Level Up: Silver Trader Unlocked!',
    message:
      'You have verified 3+ challenges! You now earn 1.2x points multiplier on all future evaluations plus <2h review SLA.',
    type: 'POINTS',
    isRead: false,
    linkUrl: '/dashboard/wallet',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: 'n-1',
    title: 'Welcome to PropNation Rewards',
    message:
      'Your account is verified! Explore eligible CFD and Futures prop firms and submit your first purchase proof to earn reward points.',
    type: 'SYSTEM',
    isRead: true,
    linkUrl: '/dashboard/prop-firms',
    createdAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
  },
];

function getStoredReadMap(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(READ_IDS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStoredReadMap(map: Record<string, boolean>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(READ_IDS_STORAGE_KEY, JSON.stringify(map));
    window.dispatchEvent(new CustomEvent(NOTIFICATIONS_EVENT));
  } catch {
    // ignore storage errors
  }
}

function applyReadMap(list: NotificationItem[]): NotificationItem[] {
  const readMap = getStoredReadMap();
  return list.map((item) => ({
    ...item,
    isRead: typeof readMap[item.id] === 'boolean' ? readMap[item.id] : item.isRead,
  }));
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    applyReadMap(FALLBACK_NOTIFICATIONS)
  );
  const [loading, setLoading] = useState(false);

  const syncFromStorage = useCallback(() => {
    setNotifications((prev) => applyReadMap(prev));
  }, []);

  useEffect(() => {
    setNotifications(applyReadMap(FALLBACK_NOTIFICATIONS));

    api
      .get<NotificationItem[] | { notifications?: NotificationItem[]; unreadCount?: number }>(
        '/notifications'
      )
      .then((data) => {
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.notifications)
          ? data.notifications
          : [];
        if (list.length > 0) {
          setNotifications(applyReadMap(list));
        } else {
          setNotifications(applyReadMap(FALLBACK_NOTIFICATIONS));
        }
      })
      .catch(() => {
        setNotifications(applyReadMap(FALLBACK_NOTIFICATIONS));
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleUpdate = () => syncFromStorage();
    window.addEventListener(NOTIFICATIONS_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(NOTIFICATIONS_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [syncFromStorage]);

  const markAllRead = useCallback(() => {
    const readMap = getStoredReadMap();
    setNotifications((prev) => {
      const next = prev.map((n) => {
        readMap[n.id] = true;
        return { ...n, isRead: true };
      });
      saveStoredReadMap(readMap);
      return next;
    });
    api.patch('/notifications/read-all', {}).catch(() => {});
  }, []);

  const markSingleRead = useCallback((id: string) => {
    const readMap = getStoredReadMap();
    readMap[id] = true;
    saveStoredReadMap(readMap);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    api.patch(`/notifications/${id}/read`, {}).catch(() => {});
  }, []);

  const markSingleUnread = useCallback((id: string) => {
    const readMap = getStoredReadMap();
    readMap[id] = false;
    saveStoredReadMap(readMap);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: false } : n)));
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return {
    notifications,
    unreadCount,
    loading,
    markAllRead,
    markSingleRead,
    markSingleUnread,
  };
}
