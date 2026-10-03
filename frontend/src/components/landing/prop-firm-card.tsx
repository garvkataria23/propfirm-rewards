'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export interface PropFirmOfferItem {
  id: string;
  accountTierName: string;
  purchasePriceUsd?: number;
  rewardPoints: number;
}

export interface PropFirmItem {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  description?: string;
  websiteUrl?: string;
  affiliateCode?: string;
  affiliateUrl?: string;
  statusBadge?: string;
  offers?: PropFirmOfferItem[];
}

const DEFAULT_CHALLENGE_OPTIONS: PropFirmOfferItem[] = [
  { id: 'def-1', accountTierName: '$50 Account', purchasePriceUsd: 50, rewardPoints: 1000 },
  { id: 'def-2', accountTierName: '$100 Account', purchasePriceUsd: 100, rewardPoints: 2500 },
  { id: 'def-3', accountTierName: '$200 Account', purchasePriceUsd: 200, rewardPoints: 5000 },
];

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

/**
 * #9 · PROP FIRM CARDS & #10 · PROP FIRM DATA SAFETY
 * Prioritizes:
 * 1. Logo
 * 2. Prop firm name
 * 3. Account option ($50 / $100 / $200 Account)
 * 4. Points (1,000 / 2,500 / 5,000 Points)
 * 5. CTA ([ VIEW OFFER → ])
 *
 * Data Safety (#10):
 * - Does NOT display "ACTIVE", "PARTNER", or "VERIFIED" unless `firm.statusBadge` is explicitly provided by backend data.
 * - Avoids excessive text and unsupported claims.
 */
export function PropFirmCard({
  firm,
}: {
  firm: PropFirmItem;
  copiedCode?: string | null;
  onCopyCode?: (code: string) => void;
  onSelectOffer?: (firm: PropFirmItem) => void;
}) {
  const offers =
    firm.offers && firm.offers.length > 0
      ? firm.offers.slice(0, 3)
      : DEFAULT_CHALLENGE_OPTIONS;

  return (
    <div className="relative h-full rounded-2xl bg-slate-50 dark:bg-[#0B1015] border border-slate-200 dark:border-white/[0.1] p-6 flex flex-col justify-between gap-5 transition-all duration-250 hover:-translate-y-1 hover:border-emerald-500/45 shadow-xs hover:shadow-[0_22px_45px_-14px_rgba(16,185,129,0.24)] group overflow-hidden">
      {/* #24: Soft green light behind card on hover */}
      <div
        className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-56 h-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: 'radial-gradient(circle, rgba(16,185,129,0.16) 0%, transparent 70%)',
          filter: 'blur(24px)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 space-y-4">
        {/* 1. Logo + Optional Backend Status Badge */}
        <div className="flex items-center justify-between">
          <div className="h-11 w-11 rounded-xl bg-white dark:bg-[#111920] border border-slate-200 dark:border-white/12 flex items-center justify-center font-mono text-sm font-extrabold text-emerald-600 dark:text-emerald-400 transition-transform duration-200 group-hover:scale-[1.02] overflow-hidden shadow-2xs">
            {firm.logoUrl ? (
              <img
                src={firm.logoUrl}
                alt={firm.name}
                className="h-full w-full object-contain p-1.5"
              />
            ) : (
              getInitials(firm.name)
            )}
          </div>

          {firm.statusBadge && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/12 border border-emerald-500/30 font-mono text-[11px] font-bold tracking-wider text-emerald-700 dark:text-emerald-300 uppercase">
              {firm.statusBadge}
            </span>
          )}
        </div>

        {/* 2. Prop Firm Name */}
        <div>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
            {firm.name}
          </h3>
        </div>

        {/* 3 & 4. Challenge Options & Points */}
        <div className="pt-3 border-t border-slate-200 dark:border-white/[0.08] space-y-2.5">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Challenge Options
          </div>

          <div className="space-y-2">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#0a0f0d] border border-slate-200/80 dark:border-white/[0.07] group-hover:border-emerald-500/25 dark:group-hover:border-white/[0.12] transition-colors text-xs sm:text-sm font-mono"
              >
                <span className="text-slate-800 dark:text-slate-100 font-semibold">{offer.accountTierName}</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                  {offer.rewardPoints.toLocaleString()} Points
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. CTA: [ VIEW OFFER → ] */}
      <div className="pt-1">
        <Link
          href={firm.slug ? `/prop-firms/${firm.slug}` : '/prop-firms'}
          className="w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 transition-all group/btn shadow-sm"
        >
          <span>VIEW OFFER</span>
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
