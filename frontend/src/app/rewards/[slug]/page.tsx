'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import confetti from 'canvas-confetti';
import {
  Gift,
  Coins,
  ArrowLeft,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Package,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Reward {
  id: string;
  name: string;
  slug: string;
  description: string;
  specifications?: string;
  imageUrl: string;
  pointsRequired: number;
  stock: number;
  isUnlimitedStock: boolean;
  category: Category;
}

export default function RewardDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { user, refreshUser } = useAuth();

  const [reward, setReward] = useState<Reward | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redemptionSuccess, setRedemptionSuccess] = useState<any>(null);
  const [redemptionError, setRedemptionError] = useState<string | null>(null);

  const [address, setAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    addressLine1: '',
    city: '',
    state: '',
    postalCode: '',
    country: user?.country || 'United States',
  });

  useEffect(() => {
    if (slug) {
      api
        .get<Reward>(`/rewards/${slug}`)
        .then((data) => setReward(data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [slug]);

  const userBalance = user?.points?.available || 0;
  const isOutOfStock = reward ? !reward.isUnlimitedStock && reward.stock <= 0 : false;
  const canAfford = reward ? userBalance >= reward.pointsRequired : false;

  const handleConfirmRedeem = async () => {
    if (!reward) return;
    setIsRedeeming(true);
    setRedemptionError(null);

    try {
      if (!address.fullName || !address.addressLine1 || !address.city) {
        throw new Error('Please fill in required shipping address fields');
      }

      const res = await api.post(`/rewards/${reward.id}/redeem`, address);
      setRedemptionSuccess(res);
      await refreshUser();

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      setRedemptionError(err.message || 'Redemption failed');
    } finally {
      setIsRedeeming(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center text-slate-400">
        Loading reward details...
      </div>
    );
  }

  if (!reward) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Reward Not Found</h2>
        <Link href="/rewards">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Rewards Store
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 space-y-12">
      <div>
        <Link
          href="/rewards"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Rewards Marketplace</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        {/* Product Image */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm overflow-hidden space-y-4 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="aspect-square w-full rounded-2xl bg-slate-100 overflow-hidden relative dark:bg-slate-950">
            <img src={reward.imageUrl} alt={reward.name} className="h-full w-full object-cover" />
            <div className="absolute top-3 left-3">
              <Badge variant="default" className="bg-slate-900/80 text-white backdrop-blur-md dark:bg-slate-950/80">
                {reward.category?.name}
              </Badge>
            </div>
          </div>
        </div>

        {/* Product Info & Action */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Badge variant="purple">{reward.category?.name}</Badge>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{reward.name}</h1>
          </div>

          {/* Points Box */}
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/20 p-5 space-y-2">
            <span className="text-xs uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400">
              Required Points
            </span>
            <div className="flex items-center gap-2">
              <Coins className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {reward.pointsRequired.toLocaleString()}
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">Points</span>
            </div>

            {user && (
              <div className="text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                <span>Your Balance:</span>
                <span className={canAfford ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-rose-600 dark:text-rose-400 font-bold'}>
                  {userBalance.toLocaleString()} PTS ({canAfford ? 'Eligible' : 'Insufficient Points'})
                </span>
              </div>
            )}
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{reward.description}</p>

          {reward.specifications && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs dark:border-slate-800 dark:bg-slate-900/40">
              <strong className="text-slate-700 dark:text-slate-200 block uppercase tracking-wider">
                Specifications
              </strong>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{reward.specifications}</p>
            </div>
          )}

          <div className="space-y-3 pt-2">
            {user ? (
              <Button
                size="lg"
                variant={canAfford && !isOutOfStock ? 'primary' : 'secondary'}
                disabled={!canAfford || isOutOfStock}
                onClick={() => setIsModalOpen(true)}
                className="w-full shadow-lg shadow-emerald-500/20"
              >
                {isOutOfStock
                  ? 'Out of Stock'
                  : !canAfford
                  ? `Need ${(reward.pointsRequired - userBalance).toLocaleString()} More Points`
                  : 'Redeem This Reward Now'}
              </Button>
            ) : (
              <Link href="/login" className="block">
                <Button size="lg" className="w-full">
                  Sign In to Redeem
                </Button>
              </Link>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs text-slate-500 dark:text-slate-400 pt-2">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Express Worldwide Courier</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>100% Brand New Genuine</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Redemption Checkout Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setRedemptionSuccess(null);
        }}
        title={redemptionSuccess ? 'Redemption Placed!' : 'Confirm Redemption Order'}
        description="Provide your delivery details to complete checkout."
      >
        {redemptionSuccess ? (
          <div className="space-y-6 text-center py-4">
            <div className="h-16 w-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Order {redemptionSuccess.redemption.redemptionCode} Placed!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Remaining points balance: {redemptionSuccess.remainingBalance.toLocaleString()} PTS
              </p>
            </div>
            <Link href="/dashboard/redemptions">
              <Button size="sm">
                View My Redemptions
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {redemptionError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs">
                {redemptionError}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Recipient Name</label>
              <input
                type="text"
                value={address.fullName}
                onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Street Address</label>
              <input
                type="text"
                value={address.addressLine1}
                onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="City"
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <input
                type="text"
                placeholder="Postal Code"
                value={address.postalCode}
                onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={isRedeeming}
                onClick={handleConfirmRedeem}
              >
                Confirm ({reward.pointsRequired.toLocaleString()} PTS)
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
