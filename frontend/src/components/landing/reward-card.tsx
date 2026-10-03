'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Coins } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface VaultRewardItem {
  id: string;
  name: string;
  subtitle?: string;
  slug: string;
  category: string;
  pointsRequired: number;
  availability?: string;
  imageUrl: string;
  featured?: boolean;
  tag?: string;
}

/**
 * #14–#16, #37 · REAL REWARD STORE CARD
 * Matches the actual `/rewards` store card component hierarchy:
 * - Product image with Category Badge overlay
 * - Product name & subtitle
 * - Coins icon + Points required
 * - Stock / Availability indicator ("In Stock" / "Instant Digital Delivery")
 * - [ VIEW REWARD ] CTA linking directly to the real catalog item `/rewards/[slug]`
 */
export function RewardCard({
  item,
  featured = false,
  floatVariant = 'a',
}: {
  item: VaultRewardItem;
  featured?: boolean;
  floatVariant?: 'a' | 'b' | 'c';
}) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [spotPos, setSpotPos] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setSpotPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const floatAnim =
    floatVariant === 'a'
      ? 'rewardFloatA 7s ease-in-out infinite'
      : floatVariant === 'b'
      ? 'rewardFloatB 8.5s ease-in-out infinite'
      : 'rewardFloatC 9.5s ease-in-out infinite';

  return (
    <div
      className="h-full relative"
      style={{
        animation: floatAnim,
      }}
    >
      {/* Featured Reward Soft Backlight */}
      {featured && (
        <div
          className="absolute -inset-4 rounded-3xl opacity-30 pointer-events-none blur-2xl"
          style={{
            background:
              'radial-gradient(circle at 50% 40%, rgba(16, 185, 129, 0.35), rgba(6, 182, 212, 0.14) 60%, transparent 80%)',
          }}
          aria-hidden="true"
        />
      )}

      <Link
        ref={cardRef}
        href={`/rewards/${item.slug}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`group relative rounded-2xl bg-white dark:bg-[#0B1015] border overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/55 hover:shadow-[0_24px_50px_-15px_rgba(16,185,129,0.26)] ${
          featured
            ? 'h-full p-6 sm:p-7 border-emerald-500/40 dark:border-emerald-500/30 shadow-xl dark:shadow-[0_0_1px_1px_rgba(16,185,129,0.15),0_25px_60px_-15px_rgba(0,0,0,0.85)]'
            : 'h-full p-5 border-slate-200 dark:border-slate-800/90 shadow-xs'
        }`}
      >
        {/* Top Rim Light on Featured Card */}
        {featured && (
          <div
            className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/55 to-cyan-400/40 pointer-events-none"
            aria-hidden="true"
          />
        )}

        {/* Soft Cursor-Following Showroom Spotlight */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300 z-10"
          style={{
            opacity: hovered ? 1 : 0,
            background: `radial-gradient(320px circle at ${spotPos.x}px ${spotPos.y}px, rgba(16, 185, 129, 0.13), transparent 70%)`,
          }}
          aria-hidden="true"
        />

        {/* Top Image Container matching `/rewards/page.tsx` */}
        <div>
          <div
            className={`relative z-20 w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800/80 ${
              featured
                ? 'aspect-[16/10] mb-4 shadow-[0_0_30px_-10px_rgba(16,185,129,0.25)]'
                : 'aspect-[4/3] mb-3.5'
            }`}
          >
            <img
              src={item.imageUrl}
              alt={item.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#06090C]/65 via-transparent to-transparent" />

            {/* Category Badge */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <Badge
                variant="default"
                className="bg-slate-950/85 backdrop-blur-md text-slate-200 border border-slate-800"
              >
                {item.category}
              </Badge>
            </div>

            {item.tag && (
              <div className="absolute top-3 right-3">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 backdrop-blur-md font-mono text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                  {item.tag}
                </span>
              </div>
            )}

            {/* Subtle bottom emerald reflection on featured product */}
            {featured && (
              <div
                className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-emerald-500/15 to-transparent pointer-events-none"
                aria-hidden="true"
              />
            )}
          </div>

          {/* Product Name & Catalog Description */}
          <div className="relative z-20 space-y-1">
            <h3
              className={`font-extrabold text-slate-900 dark:text-white tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors ${
                featured ? 'text-2xl sm:text-3xl' : 'text-base sm:text-lg'
              }`}
            >
              {item.name}
            </h3>
            {item.subtitle && (
              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">{item.subtitle}</p>
            )}
          </div>
        </div>

        {/* Featured Reward Progress Block */}
        {featured && (
          <div className="relative z-20 my-4 p-3.5 rounded-xl bg-slate-50 dark:bg-[#060b18] border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-700 dark:text-slate-200 font-semibold">Example Progress</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">60% → 75% Unlocked</span>
            </div>
            <div className="h-2 w-full bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" />
            </div>
          </div>
        )}

        {/* Bottom Store Footer */}
        <div className="relative z-20 pt-3.5 mt-3.5 border-t border-slate-200 dark:border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Coins className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span
                className={`font-mono font-black text-emerald-600 dark:text-emerald-400 ${
                  featured ? 'text-xl' : 'text-base'
                }`}
              >
                {item.pointsRequired.toLocaleString()}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Points</span>
            </div>

            <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300 font-medium">
              {item.availability || 'In Stock'}
            </span>
          </div>

          <div className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-white/[0.04] group-hover:bg-emerald-500 border border-slate-200 dark:border-slate-800 group-hover:border-emerald-400 text-xs font-mono font-extrabold text-slate-900 dark:text-white group-hover:text-slate-950 flex items-center justify-center gap-1.5 transition-all">
            <span>VIEW REWARD</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </Link>
    </div>
  );
}
