'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PropFirmCard, PropFirmItem } from './prop-firm-card';
import { Reveal, TradingVisualBackground } from './motion-primitives';
import { AutoApplyModal, AutoApplyFirmData } from '@/components/prop-firms/auto-apply-modal';

/**
 * #10 · PROP FIRM DATA SAFETY
 * Fallback placeholder data structured cleanly to be replaced by real `/prop-firms` backend data.
 * Does not make unauthorized third-party brand claims or display unverified partnership statuses.
 */
export const DEFAULT_PARTICIPATING_FIRMS: PropFirmItem[] = [
  {
    id: 'firm-pipstone',
    name: 'Pipstone Capital',
    slug: 'pipstone-capital',
    affiliateCode: 'NATION',
    affiliateUrl: 'https://trader.pipstonecapital.com/guest-checkout',
    websiteUrl: 'https://trader.pipstonecapital.com/guest-checkout',
    statusBadge: 'FEATURED PARTNER',
    offers: [
      { id: 'pip-5k', accountTierName: '$5,000 Challenge', purchasePriceUsd: 39, rewardPoints: 1000 },
      { id: 'pip-25k', accountTierName: '$25,000 Challenge', purchasePriceUsd: 169, rewardPoints: 4250 },
      { id: 'pip-100k', accountTierName: '$100,000 Challenge', purchasePriceUsd: 479, rewardPoints: 12000 },
    ],
  },
  {
    id: 'firm-ftmo',
    name: 'FTMO',
    slug: 'ftmo',
    affiliateCode: 'NATION',
    affiliateUrl: 'https://trader.ftmo.com/register',
    websiteUrl: 'https://trader.ftmo.com/register',
    statusBadge: 'VERIFIED PARTNER',
    offers: [
      { id: 'ftmo-10k', accountTierName: '$10,000 Challenge', purchasePriceUsd: 170, rewardPoints: 4250 },
      { id: 'ftmo-50k', accountTierName: '$50,000 Challenge', purchasePriceUsd: 380, rewardPoints: 9500 },
      { id: 'ftmo-100k', accountTierName: '$100,000 Challenge', purchasePriceUsd: 595, rewardPoints: 15000 },
    ],
  },
  {
    id: 'firm-fundednext',
    name: 'FundedNext',
    slug: 'fundednext',
    affiliateCode: 'NATION',
    affiliateUrl: 'https://app.fundednext.com/register',
    websiteUrl: 'https://app.fundednext.com/register',
    statusBadge: 'VERIFIED PARTNER',
    offers: [
      { id: 'fn-6k', accountTierName: '$6,000 Stellar', purchasePriceUsd: 59, rewardPoints: 1500 },
      { id: 'fn-25k', accountTierName: '$25,000 Stellar', purchasePriceUsd: 199, rewardPoints: 5000 },
      { id: 'fn-100k', accountTierName: '$100,000 Stellar', purchasePriceUsd: 549, rewardPoints: 13750 },
    ],
  },
  {
    id: 'firm-fundingpips',
    name: 'Funding Pips',
    slug: 'funding-pips',
    affiliateCode: 'NATION',
    affiliateUrl: 'https://app.fundingpips.com/register',
    websiteUrl: 'https://app.fundingpips.com/register',
    statusBadge: 'VERIFIED PARTNER',
    offers: [
      { id: 'fp-5k', accountTierName: '$5,000 Evaluation', purchasePriceUsd: 32, rewardPoints: 800 },
      { id: 'fp-25k', accountTierName: '$25,000 Evaluation', purchasePriceUsd: 139, rewardPoints: 3500 },
      { id: 'fp-100k', accountTierName: '$100,000 Evaluation', purchasePriceUsd: 399, rewardPoints: 10000 },
    ],
  },
];

export function PropFirms({ firms }: { firms: PropFirmItem[] }) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeAutoApplyFirm, setActiveAutoApplyFirm] = useState<AutoApplyFirmData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const displayFirms = firms && firms.length > 0 ? firms.slice(0, 4) : DEFAULT_PARTICIPATING_FIRMS;

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2200);
  };

  const handleSelectOffer = (firm: PropFirmItem) => {
    setActiveAutoApplyFirm({
      id: firm.id,
      name: firm.name,
      slug: firm.slug,
      logoUrl: firm.logoUrl,
      affiliateCode: firm.affiliateCode || '',
      affiliateUrl: firm.affiliateUrl,
      websiteUrl: firm.websiteUrl,
    });
    setIsModalOpen(true);
  };

  return (
    <section
      id="prop-firms"
      className="w-full py-20 lg:py-24 bg-white dark:bg-[#05080B] border-b border-slate-200 dark:border-white/[0.07] relative overflow-hidden transition-colors duration-300"
    >
      {/* #23: Subtle diagonal grid + faint candlestick silhouettes at outer edges */}
      <TradingVisualBackground variant="prop-firms" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <Reveal>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
                ELIGIBLE PARTNER OFFERS
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                CHOOSE YOUR PROP FIRM
              </h2>
            </Reveal>
            <Reveal delay={140}>
              <p className="text-slate-600 dark:text-slate-200 text-base sm:text-lg max-w-xl leading-relaxed">
                Explore participating prop firms and see how many points you can earn.
              </p>
            </Reveal>
          </div>

          <Reveal direction="right">
            <Link
              href="/prop-firms"
              className="group inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-100 dark:bg-[#0B1015] hover:bg-slate-200 dark:hover:bg-[#111920] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white font-semibold text-sm transition-all"
            >
              <span>View All Prop Firms</span>
              <ArrowRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>

        {/* Mobile Horizontal Carousel + Desktop 4-Col Grid */}
        <div className="relative">
          {/* #23: Small ambient green light behind cards */}
          <div
            className="hidden md:block absolute inset-x-16 top-1/2 -translate-y-1/2 h-48 rounded-full opacity-[0.08] pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, #10b981 0%, transparent 72%)',
              filter: 'blur(75px)',
            }}
            aria-hidden="true"
          />

          <div className="relative z-10 flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-5 overflow-x-auto md:overflow-visible pb-4 md:pb-0 snap-x snap-mandatory no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
            {displayFirms.map((firm, idx) => (
              <div
                key={firm.id}
                className="min-w-[290px] sm:min-w-[320px] md:min-w-0 snap-start flex-shrink-0 md:flex-shrink"
              >
                <Reveal delay={idx * 80} className="h-full">
                  <PropFirmCard
                    firm={firm}
                    copiedCode={copiedCode}
                    onCopyCode={handleCopyCode}
                    onSelectOffer={handleSelectOffer}
                  />
                </Reveal>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance Note */}
        <div className="text-center text-xs text-slate-500 dark:text-slate-300 max-w-2xl mx-auto">
          Partner referral codes (such as NATION) are automatically copied when you launch checkout on any participating prop firm.
        </div>
      </div>

      <AutoApplyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        firm={activeAutoApplyFirm}
      />
    </section>
  );
}
