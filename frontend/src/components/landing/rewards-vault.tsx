'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { RewardCard, VaultRewardItem } from './reward-card';
import { Reveal, TradingVisualBackground } from './motion-primitives';

const VAULT_FEATURED_IPHONE: VaultRewardItem = {
  id: 'rew-1',
  name: 'iPhone',
  subtitle: 'Apple iPhone Pro Max · ProMotion XDR Display for Mobile Trading',
  slug: 'apple-iphone-18-pro-max-1tb',
  category: 'Smartphones & Tablets',
  pointsRequired: 100000,
  availability: '8 in stock',
  imageUrl:
    'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1000&auto=format&fit=crop&q=80',
  featured: true,
  tag: 'FEATURED REWARD',
};

const VAULT_SURROUNDING_ITEMS: VaultRewardItem[] = [
  {
    id: 'rew-27',
    name: 'Headphones',
    subtitle: 'Sony WH-1000XM5 Wireless Noise-Cancelling Headphones',
    slug: 'sony-wh-1000xm5-headphones',
    category: 'Audio & Studio Sound',
    pointsRequired: 20000,
    availability: '20 in stock',
    imageUrl:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    tag: 'POPULAR',
  },
  {
    id: 'rew-16',
    name: 'Sneakers',
    subtitle: 'Nike Air Jordan 1 Low Full-Grain Leather',
    slug: 'nike-air-jordan-1-low-white',
    category: 'Sneakers & Footwear',
    pointsRequired: 15000,
    availability: '15 in stock',
    imageUrl:
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'rew-5',
    name: 'Tablet',
    subtitle: 'Apple iPad Air 11" M2 Liquid Retina Display',
    slug: 'apple-ipad-air-11-m2',
    category: 'Smartphones & Tablets',
    pointsRequired: 60000,
    availability: '10 in stock',
    imageUrl:
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'rew-22',
    name: 'Trading Display',
    subtitle: 'Dell UltraSharp 38" Curved WQHD+ Trading Monitor',
    slug: 'dell-ultrasharp-38-curved-monitor',
    category: 'Trading Displays & Hardware',
    pointsRequired: 35000,
    availability: '5 in stock',
    imageUrl:
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'rew-35',
    name: 'Gift Card',
    subtitle: 'Amazon $100 Digital Gift Card Voucher',
    slug: 'amazon-100-gift-card',
    category: 'Gift Cards & Vouchers',
    pointsRequired: 10000,
    availability: 'Instant Digital Delivery',
    imageUrl:
      'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'rew-24',
    name: 'Trading Accessory',
    subtitle: 'Logitech MX Master 3S Wireless Performance Mouse',
    slug: 'logitech-mx-master-3s',
    category: 'Trading Displays & Hardware',
    pointsRequired: 8000,
    availability: '45 in stock',
    imageUrl:
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80',
  },
];

const LATEST_REWARD_DROPS: VaultRewardItem[] = [
  {
    id: 'drop-airpods',
    name: 'AirPods Pro',
    subtitle: 'Apple AirPods Pro (2nd Generation with USB-C)',
    slug: 'apple-airpods-pro-2-usbc',
    category: 'Audio & Studio Sound',
    pointsRequired: 20000,
    availability: '30 in stock',
    imageUrl:
      'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80',
    tag: 'NEW',
  },
  {
    id: 'drop-sneakers',
    name: 'Sneakers',
    subtitle: 'Nike Dunk Low Retro "Panda" (Black/White)',
    slug: 'nike-dunk-low-panda',
    category: 'Sneakers & Footwear',
    pointsRequired: 15000,
    availability: '20 in stock',
    imageUrl:
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80',
    tag: 'NEW',
  },
  {
    id: 'drop-ipad',
    name: 'iPad Air M2',
    subtitle: 'Apple iPad Air 11" M2 (128GB Wi-Fi)',
    slug: 'apple-ipad-air-11-m2',
    category: 'Smartphones & Tablets',
    pointsRequired: 60000,
    availability: '10 in stock',
    imageUrl:
      'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&auto=format&fit=crop&q=80',
    tag: 'NEW',
  },
  {
    id: 'drop-accessory',
    name: 'Mechanical Keyboard',
    subtitle: 'Keychron Q1 Pro Wireless Custom CNC Aluminum',
    slug: 'keychron-q1-pro-wireless',
    category: 'Trading Displays & Hardware',
    pointsRequired: 8000,
    availability: '16 in stock',
    imageUrl:
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
    tag: 'NEW',
  },
];

/**
 * LATEST REWARD DROPS
 */
export function RewardDrops() {
  return (
    <div className="pt-14 border-t border-slate-200 dark:border-white/[0.08] space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>REAL REWARDS STORE CATALOG</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            LATEST REWARD DROPS
          </h3>
        </div>

        <Link
          href="/rewards"
          className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm transition-all self-start sm:self-auto"
        >
          <span>EXPLORE ALL REWARDS</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Horizontal Carousel on Mobile, 4-Col Grid on Desktop */}
      <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-5 overflow-x-auto sm:overflow-visible pb-4 sm:pb-0 snap-x snap-mandatory no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        {LATEST_REWARD_DROPS.map((drop, idx) => (
          <div
            key={drop.id}
            className="min-w-[275px] sm:min-w-0 snap-start flex-shrink-0 sm:flex-shrink"
          >
            <Reveal delay={idx * 70} className="h-full">
              <RewardCard item={drop} />
            </Reveal>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * #14–#16, #37 · REAL REWARD STORE SHOWCASE
 * Heading (#37): YOUR POINTS. YOUR REWARDS.
 * Uses actual reward catalog items, categories, availability, and links directly to `/rewards/[slug]`.
 */
export function RewardsVault() {
  return (
    <section
      id="rewards"
      className="w-full py-20 lg:py-26 bg-gradient-to-b from-[#f8fafc] via-slate-50 to-[#f8fafc] dark:from-[#081118] dark:via-[#05080B] dark:to-[#081118] border-b border-slate-200 dark:border-white/[0.08] relative overflow-hidden transition-colors duration-300"
    >
      <TradingVisualBackground variant="section" />

      {/* Premium Reward Showroom Atmospheric Spotlights */}
      <div
        className="absolute top-12 left-1/2 -translate-x-1/2 w-[820px] h-[440px] rounded-full opacity-[0.08] dark:opacity-[0.12] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, #10b981 0%, rgba(6, 182, 212, 0.28) 48%, transparent 72%)',
          filter: 'blur(105px)',
        }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-12 right-[15%] w-[520px] h-[360px] rounded-full opacity-[0.05] dark:opacity-[0.07] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, #06b6d4 0%, transparent 70%)',
          filter: 'blur(100px)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <Reveal>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/12 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-mono text-xs font-bold uppercase tracking-wider">
                  REWARDS MARKETPLACE · LIVE CATALOG
                </span>
              </Reveal>
              <Reveal delay={80}>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  YOUR POINTS. YOUR REWARDS.
                </h2>
              </Reveal>
              <Reveal delay={140}>
                <p className="text-slate-600 dark:text-slate-200 text-base max-w-xl">
                  The exact same Rewards Store you access inside your account — browse categories, check availability, and redeem your points for real-world hardware and digital vouchers.
                </p>
              </Reveal>
            </div>

            <Reveal direction="right">
              <Link
                href="/rewards"
                className="group inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-100 dark:bg-[#0B1015] hover:bg-slate-200 dark:hover:bg-[#111920] border border-slate-200 dark:border-white/[0.12] text-slate-900 dark:text-white font-bold text-sm transition-all"
              >
                <span>Open Rewards Store</span>
                <ArrowRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400 transition-transform group-hover:translate-x-1" />
              </Link>
            </Reveal>
          </div>

          {/* Desktop Vault Bento Grid: Central Featured iPhone + 6 Surrounding Real Catalog Cards */}
          <div className="hidden md:grid md:grid-cols-12 gap-5 items-stretch">
            <div className="md:col-span-3 flex flex-col gap-5">
              <Reveal delay={60} className="flex-1">
                <RewardCard item={VAULT_SURROUNDING_ITEMS[0]} floatVariant="a" />
              </Reveal>
              <Reveal delay={120} className="flex-1">
                <RewardCard item={VAULT_SURROUNDING_ITEMS[1]} floatVariant="b" />
              </Reveal>
            </div>

            <div className="md:col-span-6 flex flex-col gap-5">
              <Reveal delay={90} className="flex-1">
                <RewardCard item={VAULT_FEATURED_IPHONE} featured floatVariant="a" />
              </Reveal>
              <div className="grid grid-cols-2 gap-5">
                <Reveal delay={150}>
                  <RewardCard item={VAULT_SURROUNDING_ITEMS[4]} floatVariant="c" />
                </Reveal>
                <Reveal delay={190}>
                  <RewardCard item={VAULT_SURROUNDING_ITEMS[5]} floatVariant="b" />
                </Reveal>
              </div>
            </div>

            <div className="md:col-span-3 flex flex-col gap-5">
              <Reveal delay={80} className="flex-1">
                <RewardCard item={VAULT_SURROUNDING_ITEMS[2]} floatVariant="c" />
              </Reveal>
              <Reveal delay={140} className="flex-1">
                <RewardCard item={VAULT_SURROUNDING_ITEMS[3]} floatVariant="a" />
              </Reveal>
            </div>
          </div>

          {/* Mobile Intentional Layout: Featured Reward + Horizontal Carousel */}
          <div className="md:hidden space-y-4">
            <RewardCard item={VAULT_FEATURED_IPHONE} featured />
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory no-scrollbar -mx-4 px-4">
              {VAULT_SURROUNDING_ITEMS.map((item) => (
                <div key={item.id} className="min-w-[275px] snap-start flex-shrink-0">
                  <RewardCard item={item} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* LATEST REWARD DROPS */}
        <RewardDrops />
      </div>
    </section>
  );
}
