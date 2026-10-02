'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Box,
  Gift,
  Truck,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  PackageCheck,
  Sparkles,
} from 'lucide-react';

interface Redemption {
  id: string;
  redemptionCode: string;
  pointsSpent: number;
  status: string;
  courier?: string;
  trackingNumber?: string;
  shippingNotes?: string;
  createdAt: string;
  reward?: {
    name: string;
    imageUrl: string;
    category?: {
      name: string;
    };
  };
  shippingAddress?: {
    fullName: string;
    city: string;
    state: string;
    country: string;
  };
}

export default function MyRewardsPage() {
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Redemption[]>('/redemptions/my')
      .then((data) => setRedemptions(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 1;
      case 'CONFIRMED':
        return 2;
      case 'PROCESSING':
        return 3;
      case 'SHIPPED':
        return 4;
      case 'DELIVERED':
        return 5;
      default:
        return 1;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="purple">Traders Vault</Badge>
            <span className="text-xs text-slate-500 dark:text-slate-400">Claimed prizes & fulfillment tracking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1 flex items-center gap-2.5">
            <Box className="h-7 w-7 text-blue-500" />
            My Claimed Rewards
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track courier deliveries, dispatch status, and digital vouchers redeemed with your points.
          </p>
        </div>

        <Link href="/rewards">
          <Button className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30">
            <Gift className="h-4 w-4 mr-1.5" />
            Browse Rewards Store
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-slate-100 dark:bg-slate-900/60 animate-pulse border border-slate-200 dark:border-slate-800" />
          ))}
        </div>
      ) : redemptions.length === 0 ? (
        <Card className="p-12 text-center space-y-4 bg-white dark:bg-[#070e20] border-slate-200/90 dark:border-[#14234b]/60 shadow-sm">
          <Box className="h-16 w-16 text-slate-400 dark:text-slate-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No rewards claimed yet</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Accumulate points from your verified prop firm purchases and redeem top-tier tech gear, monitors, and gift cards.
            </p>
          </div>
          <Link href="/rewards">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white">
              Explore Rewards Store
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-6">
          {redemptions.map((red) => {
            const step = getStatusStep(red.status);

            return (
              <Card
                key={red.id}
                className="p-6 bg-white dark:bg-[#070e20] border-slate-200/90 dark:border-[#14234b]/60 space-y-6 hover:border-blue-500/40 transition-all shadow-sm dark:shadow-xl"
              >
                {/* Reward Top Details */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-[#14234b]/60">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-slate-50 dark:bg-[#0a142e] border border-slate-200 dark:border-blue-500/20 overflow-hidden flex items-center justify-center shrink-0">
                      {red.reward?.imageUrl ? (
                        <img
                          src={red.reward.imageUrl}
                          alt={red.reward?.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Gift className="h-8 w-8 text-blue-500 dark:text-blue-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                          {red.redemptionCode}
                        </span>
                        <Badge variant="purple">{red.pointsSpent.toLocaleString()} PTS</Badge>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                        {red.reward?.name || 'Exclusive Reward Item'}
                      </h3>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Claimed on {new Date(red.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div>
                    {red.status === 'DELIVERED' && (
                      <Badge variant="success">✓ Delivered</Badge>
                    )}
                    {red.status === 'SHIPPED' && (
                      <Badge variant="info">🚚 In Transit</Badge>
                    )}
                    {(red.status === 'PROCESSING' || red.status === 'CONFIRMED') && (
                      <Badge variant="purple">⚙️ Preparing Dispatch</Badge>
                    )}
                    {red.status === 'PENDING' && (
                      <Badge variant="warning">⏳ Order Placed</Badge>
                    )}
                  </div>
                </div>

                {/* Visual Stepper Tracker */}
                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Fulfillment Progress
                  </div>
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {[
                      { num: 1, label: 'Order Placed' },
                      { num: 2, label: 'Processing' },
                      { num: 3, label: 'Shipped' },
                      { num: 4, label: 'Delivered' },
                    ].map((s) => {
                      const isComplete = step >= s.num;
                      return (
                        <div key={s.num} className="space-y-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-colors ${
                              isComplete ? 'bg-blue-500 shadow-sm shadow-blue-500/50' : 'bg-slate-200 dark:bg-[#14234b]'
                            }`}
                          />
                          <span
                            className={`text-[11px] block truncate font-medium ${
                              isComplete ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-400 dark:text-slate-500'
                            }`}
                          >
                            {s.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Delivery Information Info Box */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl bg-slate-50 dark:bg-[#091126] border border-slate-200/80 dark:border-[#14234b]/60 p-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-600 dark:text-slate-400 font-semibold block flex items-center gap-1">
                      <Truck className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
                      Courier Tracking
                    </span>
                    {red.trackingNumber ? (
                      <div className="space-y-0.5">
                        <span className="text-slate-900 dark:text-white font-bold">{red.courier || 'Express Courier'}</span>
                        <div className="font-mono text-blue-600 dark:text-blue-400 font-semibold">{red.trackingNumber}</div>
                      </div>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500">Tracking code will be assigned upon dispatch.</span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-600 dark:text-slate-400 font-semibold block flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
                      Delivery Destination
                    </span>
                    {red.shippingAddress ? (
                      <span className="text-slate-700 dark:text-slate-300 block">
                        {red.shippingAddress.fullName} • {red.shippingAddress.city}, {red.shippingAddress.state} ({red.shippingAddress.country})
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500">Default profile shipping address.</span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
