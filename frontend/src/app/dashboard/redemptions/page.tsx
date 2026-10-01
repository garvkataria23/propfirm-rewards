'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatDateTime } from '@/lib/utils';
import {
  Gift,
  Truck,
  CheckCircle2,
  Clock,
  Package,
  MapPin,
  ExternalLink,
  Coins,
  ArrowRight,
} from 'lucide-react';

interface UserAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface Redemption {
  id: string;
  redemptionCode: string;
  pointsSpent: number;
  status: string;
  courier?: string;
  trackingNumber?: string;
  shippingNotes?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  reward: {
    name: string;
    imageUrl: string;
    description: string;
  };
  shippingAddress?: UserAddress;
}

export default function RedemptionsTrackingPage() {
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Redemption[]>('/redemptions')
      .then((data) => setRedemptions(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <Badge variant="success">DELIVERED</Badge>;
      case 'SHIPPED':
        return <Badge variant="purple">SHIPPED</Badge>;
      case 'PROCESSING':
        return <Badge variant="info">PROCESSING</Badge>;
      case 'CONFIRMED':
        return <Badge variant="info">CONFIRMED</Badge>;
      case 'PENDING':
        return <Badge variant="warning">PENDING</Badge>;
      case 'CANCELLED':
        return <Badge variant="danger">CANCELLED</Badge>;
      case 'REJECTED':
        return <Badge variant="danger">REJECTED</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getStepProgress = (status: string) => {
    const pipeline = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    return pipeline.indexOf(status);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Reward Redemptions & Tracking</h2>
          <p className="text-xs text-slate-400">
            Real-time status, tracking numbers, and delivery confirmation for all your claimed items.
          </p>
        </div>

        <Link href="/rewards">
          <Button size="sm">
            <Gift className="h-4 w-4 mr-1.5" />
            Explore More Rewards
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-slate-900/50 animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : redemptions.length === 0 ? (
        <Card className="text-center py-16 space-y-3">
          <Gift className="h-10 w-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No redemptions yet</h3>
          <p className="text-xs text-slate-400">
            Redeem your first reward when you have accumulated enough points.
          </p>
          <Link href="/rewards" className="inline-block pt-2">
            <Button size="sm">Visit Rewards Store</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-6">
          {redemptions.map((rdm) => {
            const stepIdx = getStepProgress(rdm.status);
            const isCancelled = rdm.status === 'CANCELLED' || rdm.status === 'REJECTED';

            return (
              <Card
                key={rdm.id}
                className="p-6 card-hover-glow space-y-6 border-slate-800 bg-slate-900/60"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                  <div className="flex items-center gap-4">
                    <img
                      src={rdm.reward.imageUrl}
                      alt={rdm.reward.name}
                      className="h-16 w-16 rounded-xl object-cover bg-slate-800 border border-slate-700 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-base">{rdm.reward.name}</h3>
                        <span className="font-mono text-xs text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          {rdm.redemptionCode}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                        <span className="text-emerald-400 font-semibold">
                          -{rdm.pointsSpent.toLocaleString()} Points Spent
                        </span>
                        <span>• Placed on {formatDate(rdm.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="self-end sm:self-auto">{getStatusBadge(rdm.status)}</div>
                </div>

                {/* Visual Tracking Pipeline Steps (Section 15) */}
                {!isCancelled && (
                  <div className="py-2">
                    <div className="grid grid-cols-5 text-center text-xs gap-1 relative before:absolute before:top-3.5 before:left-[10%] before:w-[80%] before:h-0.5 before:bg-slate-800 before:-z-0">
                      {[
                        { label: 'Pending', step: 0 },
                        { label: 'Confirmed', step: 1 },
                        { label: 'Processing', step: 2 },
                        { label: 'Shipped', step: 3 },
                        { label: 'Delivered', step: 4 },
                      ].map((item) => {
                        const isCompleted = stepIdx >= item.step;
                        const isCurrent = stepIdx === item.step;

                        return (
                          <div key={item.step} className="flex flex-col items-center space-y-1.5 relative z-10">
                            <div
                              className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                isCompleted
                                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                                  : 'bg-slate-800 text-slate-500 border border-slate-700'
                              } ${isCurrent ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-950' : ''}`}
                            >
                              {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : item.step + 1}
                            </div>
                            <span
                              className={`text-[11px] font-semibold ${
                                isCompleted ? 'text-slate-200' : 'text-slate-500'
                              }`}
                            >
                              {item.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Courier, Tracking Number & Destination Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
                  {/* Shipping Address */}
                  {rdm.shippingAddress && (
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-400 font-semibold mb-1">
                        <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Delivery Destination:</span>
                      </div>
                      <div className="text-white font-semibold">
                        {rdm.shippingAddress.fullName} ({rdm.shippingAddress.phone})
                      </div>
                      <div className="text-slate-400">
                        {rdm.shippingAddress.addressLine1}
                        {rdm.shippingAddress.addressLine2 && `, ${rdm.shippingAddress.addressLine2}`}
                      </div>
                      <div className="text-slate-400">
                        {rdm.shippingAddress.city}, {rdm.shippingAddress.state}{' '}
                        {rdm.shippingAddress.postalCode} • {rdm.shippingAddress.country}
                      </div>
                    </div>
                  )}

                  {/* Courier & Tracking Details */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-slate-400 font-semibold mb-1">
                      <Truck className="h-3.5 w-3.5 text-purple-400" />
                      <span>Shipment Details:</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">Carrier:</span>
                      <span className="text-slate-200 font-semibold">
                        {rdm.courier || 'Pending Carrier Assignment'}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">Tracking Code:</span>
                      <span className="font-mono text-emerald-400 font-bold">
                        {rdm.trackingNumber || 'Available Once Dispatched'}
                      </span>
                    </div>

                    {rdm.adminNotes && (
                      <div className="pt-1 text-[11px] text-slate-400 italic">
                        Note: {rdm.adminNotes}
                      </div>
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
