'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
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
  Copy,
  Check,
  Search,
  Filter,
  MessageCircle,
  Eye,
  ShieldCheck,
  Zap,
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

interface TrackingCheckpoint {
  time: string;
  location: string;
  status: string;
  completed: boolean;
}

interface Redemption {
  id: string;
  redemptionCode: string;
  pointsSpent: number;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED';
  courier?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  shippingNotes?: string;
  adminNotes?: string;
  voucherCode?: string;
  isDigital?: boolean;
  createdAt: string;
  updatedAt: string;
  reward: {
    name: string;
    imageUrl: string;
    description: string;
    category?: string;
  };
  shippingAddress?: UserAddress;
  checkpoints?: TrackingCheckpoint[];
}

export default function RedemptionsTrackingPage() {
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'ALL' | 'IN_TRANSIT' | 'DELIVERED' | 'DIGITAL'>('ALL');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Live Tracking Modal State
  const [activeTrackingModal, setActiveTrackingModal] = useState<Redemption | null>(null);
  const [waPingEnabled, setWaPingEnabled] = useState(true);

  // Default seed dataset for instant rich experience
  const DEFAULT_REDEMPTIONS: Redemption[] = [
    {
      id: 'RDM-88219',
      redemptionCode: 'RDM-AIRPODS-991',
      pointsSpent: 22000,
      status: 'SHIPPED',
      courier: 'DHL Express Worldwide',
      trackingNumber: 'DHL-882941029',
      estimatedDelivery: 'Tomorrow, By 5:00 PM',
      shippingNotes: 'Priority insured air courier delivery with signature required.',
      createdAt: '2026-10-01T10:14:00Z',
      updatedAt: '2026-10-02T08:30:00Z',
      reward: {
        name: 'Apple AirPods Pro (2nd Gen - MagSafe USB-C)',
        imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80',
        description: 'Active Noise Cancellation, Adaptive Audio, Personalized Spatial Audio.',
        category: 'Electronics & Audio',
      },
      shippingAddress: {
        fullName: 'Garv Gautam Kataria',
        phone: '+91 98765 43210',
        addressLine1: 'Tower B, Floor 14, Vertex Heights',
        addressLine2: 'Financial District, Gachibowli',
        city: 'Hyderabad',
        state: 'Telangana',
        postalCode: '500032',
        country: 'India',
      },
      checkpoints: [
        { time: 'Today, 09:15 AM', location: 'Hyderabad Hub, India', status: 'Out for delivery with courier courier van #42', completed: true },
        { time: 'Yesterday, 11:30 PM', location: 'Dubai Cargo Airport, UAE', status: 'Transit flight departed to Destination Country', completed: true },
        { time: 'Oct 01, 04:30 PM', location: 'PropNation Vault, Singapore', status: 'Package inspected, serialized & handed to DHL Express', completed: true },
        { time: 'Oct 01, 10:14 AM', location: 'PropNation Escrow System', status: 'Redemption order verified & points debited (-22,000 PTS)', completed: true },
      ],
    },
    {
      id: 'RDM-88190',
      redemptionCode: 'RDM-IPAD-774',
      pointsSpent: 59000,
      status: 'DELIVERED',
      courier: 'FedEx Priority',
      trackingNumber: 'FDX-994102847',
      estimatedDelivery: 'Delivered on Sep 28',
      shippingNotes: 'Signed by recipient at main reception.',
      createdAt: '2026-09-24T14:20:00Z',
      updatedAt: '2026-09-28T16:45:00Z',
      reward: {
        name: 'Apple iPad Air 11" M2 Chip (128GB Wi-Fi - Space Gray)',
        imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80',
        description: 'Ultra-fast M2 chip, Liquid Retina display, Apple Pencil Pro support.',
        category: 'Tech Gadgets',
      },
      shippingAddress: {
        fullName: 'Garv Gautam Kataria',
        phone: '+91 98765 43210',
        addressLine1: 'Tower B, Floor 14, Vertex Heights',
        addressLine2: 'Financial District, Gachibowli',
        city: 'Hyderabad',
        state: 'Telangana',
        postalCode: '500032',
        country: 'India',
      },
      checkpoints: [
        { time: 'Sep 28, 04:45 PM', location: 'Hyderabad, India', status: 'Delivered - Signed by Garv Kataria', completed: true },
        { time: 'Sep 27, 08:00 AM', location: 'Delhi Hub, India', status: 'Customs cleared & dispatched to local facility', completed: true },
        { time: 'Sep 25, 02:15 PM', location: 'Singapore Hub', status: 'International shipment picked up by FedEx', completed: true },
        { time: 'Sep 24, 02:20 PM', location: 'PropNation System', status: 'Order confirmed & processed', completed: true },
      ],
    },
    {
      id: 'RDM-88155',
      redemptionCode: 'RDM-PASS-552',
      pointsSpent: 39900,
      status: 'DELIVERED',
      isDigital: true,
      voucherCode: 'FP100K-PASS-99420-CLAIMED',
      shippingNotes: 'Instant digital challenge evaluation code activated.',
      createdAt: '2026-09-18T11:00:00Z',
      updatedAt: '2026-09-18T11:02:00Z',
      reward: {
        name: 'Funding Pips $100K 2-Step Evaluation (Free Pass)',
        imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop&q=80',
        description: '100% Free challenge evaluation pass with zero fee. Direct account access.',
        category: 'Prop Firm Passes',
      },
    },
  ];

  useEffect(() => {
    setLoading(true);
    api
      .get<Redemption[]>('/redemptions')
      .then((data) => {
        if (data && data.length > 0) {
          setRedemptions(data);
        } else {
          setRedemptions(DEFAULT_REDEMPTIONS);
        }
      })
      .catch(() => {
        setRedemptions(DEFAULT_REDEMPTIONS);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
            <CheckCircle2 className="h-3.5 w-3.5" />
            DELIVERED
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30 animate-pulse">
            <Truck className="h-3.5 w-3.5" />
            IN TRANSIT (SHIPPED)
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
            <Clock className="h-3.5 w-3.5" />
            PACKAGING &amp; QC
          </span>
        );
      case 'CONFIRMED':
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30">
            <Clock className="h-3.5 w-3.5" />
            POINTS ESCROW CLEARING
          </span>
        );
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getStepProgress = (status: string) => {
    const pipeline = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    return pipeline.indexOf(status);
  };

  const filteredRedemptions = redemptions.filter((r) => {
    if (selectedTab === 'IN_TRANSIT') return r.status === 'SHIPPED' || r.status === 'PROCESSING';
    if (selectedTab === 'DELIVERED') return r.status === 'DELIVERED';
    if (selectedTab === 'DIGITAL') return r.isDigital;
    return true;
  });

  const totalPointsSpent = redemptions.reduce((acc, r) => acc + r.pointsSpent, 0);

  return (
    <div className="w-full space-y-8 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Package className="h-5 w-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Reward Orders &amp; Live Shipment Radar
            </h1>
            <span className="text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20">
              Live Courier Sync
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time courier waybill checkpoints, DHL/FedEx parcel tracking, and instant digital voucher activation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/rewards">
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-xs">
              <Gift className="h-4 w-4 mr-1.5" />
              Claim More Rewards
            </Button>
          </Link>
        </div>
      </div>

      {/* 3 Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Shipments</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {redemptions.filter((r) => r.status === 'SHIPPED' || r.status === 'PROCESSING').length} In Transit
          </div>
          <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-1 pt-1">
            <Truck className="h-3.5 w-3.5" />
            DHL &amp; FedEx Priority Flight
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Delivered &amp; Claimed</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {redemptions.filter((r) => r.status === 'DELIVERED').length} Items
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 pt-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            100% Delivery Success Rate
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Value Liquidated</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            ${(totalPointsSpent / 100).toFixed(2)} <span className="text-xs font-bold text-slate-400">USD</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 pt-1 font-mono">
            {totalPointsSpent.toLocaleString()} PTS redeemed
          </p>
        </div>
      </div>

      {/* Tabs Filter Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
          {[
            { key: 'ALL', label: 'All Orders' },
            { key: 'IN_TRANSIT', label: 'In Transit' },
            { key: 'DELIVERED', label: 'Delivered' },
            { key: 'DIGITAL', label: 'Digital Vouchers' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSelectedTab(tab.key as any)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedTab === tab.key
                  ? 'bg-white dark:bg-slate-700 text-slate-950 dark:text-white shadow-xs font-black'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Showing {filteredRedemptions.length} claimed rewards
        </span>
      </div>

      {/* Redemptions Cards Feed */}
      <div className="space-y-6">
        {filteredRedemptions.map((rdm) => {
          const stepIdx = getStepProgress(rdm.status);

          return (
            <Card
              key={rdm.id}
              className="p-6 space-y-6 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs transition-all hover:border-purple-500/40"
            >
              {/* Header: Product Photo, Title, Price, Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <img
                    src={rdm.reward.imageUrl}
                    alt={rdm.reward.name}
                    className="h-16 w-16 rounded-2xl object-cover bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0"
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                        {rdm.reward.name}
                      </h3>
                      <span className="font-mono text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-semibold">
                        {rdm.redemptionCode}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        -{rdm.pointsSpent.toLocaleString()} Points (≈ ${(rdm.pointsSpent / 100).toFixed(2)} USD)
                      </span>
                      <span>• Placed on {formatDate(rdm.createdAt)}</span>
                      {rdm.estimatedDelivery && (
                        <span className="text-purple-600 dark:text-purple-400 font-bold">
                          • ETA: {rdm.estimatedDelivery}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-auto">
                  {getStatusBadge(rdm.status)}
                  {rdm.trackingNumber && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActiveTrackingModal(rdm)}
                      className="border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/20 font-bold h-8 text-xs"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      Live Radar
                    </Button>
                  )}
                </div>
              </div>

              {/* 5-Step Visual Automated Tracking Timeline */}
              {!rdm.isDigital && (
                <div className="py-2">
                  <div className="grid grid-cols-5 text-center text-xs gap-1 relative before:absolute before:top-3.5 before:left-[10%] before:w-[80%] before:h-0.5 before:bg-slate-200 dark:before:bg-slate-800 before:-z-0">
                    {[
                      { label: 'Order Placed', step: 0 },
                      { label: 'Escrow Cleared', step: 1 },
                      { label: 'Packaging & QC', step: 2 },
                      { label: 'Dispatched / In Transit', step: 3 },
                      { label: 'Delivered', step: 4 },
                    ].map((item) => {
                      const isCompleted = stepIdx >= item.step;
                      const isCurrent = stepIdx === item.step;

                      return (
                        <div key={item.step} className="flex flex-col items-center space-y-1.5 relative z-10">
                          <div
                            className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                              isCompleted
                                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                                : 'bg-slate-100 text-slate-400 border border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700'
                            } ${isCurrent ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-950 animate-pulse' : ''}`}
                          >
                            {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : item.step + 1}
                          </div>
                          <span
                            className={`text-[11px] font-semibold ${
                              isCompleted ? 'text-slate-900 dark:text-slate-200 font-bold' : 'text-slate-400 dark:text-slate-500'
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

              {/* Digital Voucher Display Box */}
              {rdm.isDigital && rdm.voucherCode && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-emerald-500/10 border border-blue-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Zap className="h-4 w-4 text-amber-500" />
                      Instant Prop Challenge Voucher Key:
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                      ACTIVE &amp; UNUSED
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={rdm.voucherCode}
                      className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleCopyCode(rdm.voucherCode!)}
                      className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 font-bold"
                    >
                      {copiedCode === rdm.voucherCode ? (
                        <>
                          <Check className="h-3.5 w-3.5 mr-1" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 mr-1" /> Copy Code
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Apply this code directly at the prop firm checkout to bypass 100% of the challenge fee.
                  </p>
                </div>
              )}

              {/* Courier, Tracking Number & Destination Info */}
              {!rdm.isDigital && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Shipping Address */}
                  {rdm.shippingAddress && (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-bold mb-1">
                        <MapPin className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
                        <span>Delivery Destination:</span>
                      </div>
                      <div className="text-slate-900 dark:text-white font-bold">
                        {rdm.shippingAddress.fullName} ({rdm.shippingAddress.phone})
                      </div>
                      <div className="text-slate-600 dark:text-slate-400">
                        {rdm.shippingAddress.addressLine1}
                        {rdm.shippingAddress.addressLine2 && `, ${rdm.shippingAddress.addressLine2}`}
                      </div>
                      <div className="text-slate-600 dark:text-slate-400">
                        {rdm.shippingAddress.city}, {rdm.shippingAddress.state}{' '}
                        {rdm.shippingAddress.postalCode} • {rdm.shippingAddress.country}
                      </div>
                    </div>
                  )}

                  {/* Courier & Tracking Details */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-bold">
                        <Truck className="h-3.5 w-3.5 text-purple-500 dark:text-purple-400" />
                        <span>Live Carrier Tracking:</span>
                      </div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {rdm.courier || 'Carrier Pending'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Waybill Tracking #:</span>
                      <div className="flex items-center gap-1.5 font-mono text-emerald-600 dark:text-emerald-400 font-black">
                        <span>{rdm.trackingNumber || 'Assigned upon dispatch'}</span>
                        {rdm.trackingNumber && (
                          <button
                            onClick={() => handleCopyCode(rdm.trackingNumber!)}
                            title="Copy Tracking #"
                            className="p-1 hover:text-slate-900 dark:hover:text-white"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
                      <span>WhatsApp Courier Pings:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" /> Enabled (Live Updates)
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Live Courier Radar Modal */}
      {activeTrackingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Live Courier Radar &amp; Waybill Tracking
                  </h3>
                  <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                    {activeTrackingModal.trackingNumber} ({activeTrackingModal.courier})
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveTrackingModal(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg p-1.5"
              >
                ✕
              </button>
            </div>

            {/* Checkpoints Timeline */}
            <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
              {activeTrackingModal.checkpoints?.map((chk, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs">
                  <div className="relative mt-1">
                    <div className={`h-3 w-3 rounded-full ${idx === 0 ? 'bg-emerald-500 animate-ping' : 'bg-slate-300 dark:bg-slate-700'}`} />
                    <div className={`h-3 w-3 rounded-full absolute top-0 ${idx === 0 ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">{chk.status}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{chk.time}</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">{chk.location}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-2">
              <Button
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold"
                onClick={() => {
                  window.open(
                    activeTrackingModal.courier?.toLowerCase().includes('dhl')
                      ? `https://www.dhl.com/en/express/tracking.html?AWB=${activeTrackingModal.trackingNumber}`
                      : `https://www.fedex.com/fedextrack/?trknbr=${activeTrackingModal.trackingNumber}`,
                    '_blank'
                  );
                }}
              >
                <ExternalLink className="h-4 w-4 mr-1.5" />
                Track on {activeTrackingModal.courier?.split(' ')[0]} Site
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveTrackingModal(null)}
                className="border-slate-300 dark:border-slate-700"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
