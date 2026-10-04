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
import { AddressForm, AddressData } from '@/components/ui/address-form';

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
    if (!slug) return;
    const fallbackBySlug: Record<string, Reward> = {
      'apple-iphone-18-pro-max-1tb': {
        id: 'rew-1',
        name: 'Apple iPhone 18 Pro Max (1TB - Cosmic Titanium)',
        slug: 'apple-iphone-18-pro-max-1tb',
        description:
          'Next-generation flagship smartphone with A19 Bionic Neural Engine, 6.9-inch ProMotion Ultra-Retina XDR display, and 48MP periscope zoom. Perfect for real-time mobile trading.',
        specifications:
          'Color: Cosmic Titanium | Storage: 1TB | Display: 6.9" ProMotion 120Hz OLED | Battery: 34h talk time',
        imageUrl:
          'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
        pointsRequired: 15990,
        stock: 8,
        isUnlimitedStock: false,
        category: { id: 'c-1', name: 'Smartphones & Tablets', slug: 'smartphones-tablets' },
      },
      'sony-wh-1000xm5-headphones': {
        id: 'rew-27',
        name: 'Sony WH-1000XM5 Wireless Noise-Cancelling Headphones',
        slug: 'sony-wh-1000xm5-headphones',
        description:
          'Industry-leading noise cancellation engineered for high-stress trading sessions. Dual processors and 8 microphones block out all distractions.',
        specifications: 'Color: Black | Battery: 30 hours | Fast Charging (3 min = 3 hours)',
        imageUrl:
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
        pointsRequired: 3990,
        stock: 20,
        isUnlimitedStock: false,
        category: { id: 'c-6', name: 'Audio & Studio Sound', slug: 'audio-sound' },
      },
      'nike-air-jordan-1-low-white': {
        id: 'rew-16',
        name: 'Nike Air Jordan 1 Low "Triple White"',
        slug: 'nike-air-jordan-1-low-white',
        description:
          'Iconic low-top silhouette crafted with premium genuine leather upper, encapsulated Nike Air heel cushioning, and durable rubber traction.',
        specifications: 'Color: Triple White | Material: Full-Grain Leather | Sizes: US 7 to 13 available',
        imageUrl:
          'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop&q=80',
        pointsRequired: 1400,
        stock: 15,
        isUnlimitedStock: false,
        category: { id: 'c-4', name: 'Sneakers & Footwear', slug: 'sneakers-footwear' },
      },
      'apple-ipad-air-11-m2': {
        id: 'rew-5',
        name: 'Apple iPad Air 11" M2 (128GB - Starlight)',
        slug: 'apple-ipad-air-11-m2',
        description:
          'Versatile liquid retina display with M2 performance, Apple Pencil Pro support, and lightweight mobility for desk and travel trading.',
        specifications: 'Display: 11-inch Liquid Retina | Chip: Apple M2 | Storage: 128GB Wi-Fi',
        imageUrl:
          'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&auto=format&fit=crop&q=80',
        pointsRequired: 5990,
        stock: 10,
        isUnlimitedStock: false,
        category: { id: 'c-1', name: 'Smartphones & Tablets', slug: 'smartphones-tablets' },
      },
      'dell-ultrasharp-38-curved-monitor': {
        id: 'rew-22',
        name: 'Dell UltraSharp 38" Curved WQHD+ Trading Monitor',
        slug: 'dell-ultrasharp-38-curved-monitor',
        description:
          'Massive panoramic workspace for multi-timeframe analysis. IPS Black technology with 2000:1 contrast ratio and built-in KVM switch.',
        specifications: 'Resolution: 3840 x 1600 WQHD+ | Curved 2300R | 90W USB-C Power Delivery',
        imageUrl:
          'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
        pointsRequired: 9500,
        stock: 5,
        isUnlimitedStock: false,
        category: { id: 'c-5', name: 'Trading Displays & Hardware', slug: 'trading-hardware' },
      },
      'amazon-100-gift-card': {
        id: 'rew-35',
        name: 'Amazon $100 Digital Gift Card',
        slug: 'amazon-100-gift-card',
        description:
          'Instant digital code delivery. Perfect for trading books, accessories, or everyday purchases on Amazon.',
        specifications: 'Value: $100.00 USD | Delivery: Instant Digital Code | Expiry: None',
        imageUrl:
          'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80',
        pointsRequired: 1000,
        stock: 999,
        isUnlimitedStock: true,
        category: { id: 'c-8', name: 'Gift Cards & Vouchers', slug: 'gift-cards' },
      },
      'logitech-mx-master-3s': {
        id: 'rew-24',
        name: 'Logitech MX Master 3S Wireless Performance Mouse',
        slug: 'logitech-mx-master-3s',
        description:
          'The trader gold standard. Quiet clicks, 8,000 DPI track-on-glass sensor, and hyper-fast MagSpeed electromagnetic scrolling.',
        specifications: 'Color: Graphite | Connectivity: Bluetooth & Logi Bolt | Multi-device switching up to 3 PCs',
        imageUrl:
          'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80',
        pointsRequired: 1000,
        stock: 45,
        isUnlimitedStock: false,
        category: { id: 'c-5', name: 'Trading Displays & Hardware', slug: 'trading-hardware' },
      },
      'apple-airpods-pro-2-usbc': {
        id: 'rew-29',
        name: 'Apple AirPods Pro (2nd Generation with USB-C)',
        slug: 'apple-airpods-pro-2-usbc',
        description:
          'Up to 2x more Active Noise Cancellation, Adaptive Audio, and Personalized Spatial Audio for seamless trading mobility.',
        specifications: 'MagSafe Case (USB-C) with speaker and lanyard loop | IP54 dust, sweat, and water resistance',
        imageUrl:
          'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80',
        pointsRequired: 2490,
        stock: 30,
        isUnlimitedStock: false,
        category: { id: 'c-6', name: 'Audio & Studio Sound', slug: 'audio-sound' },
      },
      'nike-dunk-low-panda': {
        id: 'rew-17',
        name: 'Nike Dunk Low Retro "Panda" (Black/White)',
        slug: 'nike-dunk-low-panda',
        description:
          'Timeless two-tone black and white leather construction, padded low-cut collar, and classic court style designed for all-day comfort.',
        specifications: 'Color: White/Black | Material: Leather | Sizes: US 7 to 13 available',
        imageUrl:
          'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80',
        pointsRequired: 1500,
        stock: 20,
        isUnlimitedStock: false,
        category: { id: 'c-4', name: 'Sneakers & Footwear', slug: 'sneakers-footwear' },
      },
      'keychron-q1-pro-wireless': {
        id: 'rew-25',
        name: 'Keychron Q1 Pro Wireless Custom Mechanical Keyboard',
        slug: 'keychron-q1-pro-wireless',
        description:
          'Fully customizable 75% CNC aluminum body keyboard with hot-swappable switches, double-gasket design, and wireless Bluetooth 5.1 connection.',
        specifications: 'Layout: 75% | Frame: Full CNC Aluminum | Switches: Gateron Jupiter Red | RGB Backlit',
        imageUrl:
          'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
        pointsRequired: 2100,
        stock: 16,
        isUnlimitedStock: false,
        category: { id: 'c-5', name: 'Trading Displays & Hardware', slug: 'trading-hardware' },
      },
    };

    if (fallbackBySlug[slug]) {
      setReward(fallbackBySlug[slug]);
      setLoading(false);
    }

    api
      .get<Reward>(`/rewards/${slug}`)
      .then((data) => {
        if (data && data.id) setReward(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
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
                {reward.pointsRequired.toLocaleString('en-US')}
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">Points</span>
            </div>

            {user && (
              <div className="text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                <span>Your Balance:</span>
                <span className={canAfford ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-rose-600 dark:text-rose-400 font-bold'}>
                  {userBalance.toLocaleString('en-US')} PTS ({canAfford ? 'Eligible' : 'Insufficient Points'})
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
                  ? `Need ${(reward.pointsRequired - userBalance).toLocaleString('en-US')} More Points`
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
                Remaining points balance: {redemptionSuccess.remainingBalance.toLocaleString('en-US')} PTS
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

            <div className="max-h-[62vh] overflow-y-auto pr-1">
              <AddressForm
                value={address}
                onChange={(newAddr) => setAddress(newAddr)}
                showPresets={true}
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
                Confirm ({reward.pointsRequired.toLocaleString('en-US')} PTS)
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
