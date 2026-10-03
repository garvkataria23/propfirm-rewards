'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { Reveal, TradingVisualBackground } from './motion-primitives';

interface FaqItem {
  q: string;
  a: string;
}

/**
 * #36 · FAQ BACKGROUND
 * Calm readable section: clean dark #0B1015 surface, subtle radial gradient, very faint grid, zero floating candles.
 */
const FAQ_ITEMS: FaqItem[] = [
  {
    q: 'What is a prop firm?',
    a: 'A proprietary trading firm (prop firm) offers simulated trading challenges and evaluations where traders demonstrate disciplined risk management and trading skill. PROP NATION is an independent affiliate and rewards platform — not a prop firm or broker.',
  },
  {
    q: 'How do I earn points?',
    a: 'Browse participating prop firms on PROP NATION, purchase an eligible challenge account using the partner referral link or code shown on that offer, and submit your purchase proof in your dashboard. Once verified, points are credited to your wallet.',
  },
  {
    q: 'How do I use the referral code?',
    a: 'Click any participating offer on PROP NATION or copy the partner referral code displayed on that prop firm’s offer card and apply it in the promo/affiliate field at checkout before completing your purchase.',
  },
  {
    q: 'Which purchases are eligible?',
    a: 'Challenge purchases made through our official partner links or using our active referral code with participating prop firms are eligible for reward points, as listed on each prop firm’s offer card.',
  },
  {
    q: 'How long does verification take?',
    a: 'Most purchase submissions are reviewed and verified within 24 to 48 hours after we reconcile your order confirmation with the participating prop firm’s affiliate records.',
  },
  {
    q: 'What proof do I need?',
    a: 'You will need your order confirmation screenshot or invoice showing the prop firm name, account tier purchased, order date, and confirmation that our referral code or link was used.',
  },
  {
    q: 'When will my points be credited?',
    a: 'Your reward points are credited directly to your PROP NATION points wallet immediately upon purchase verification approval.',
  },
  {
    q: 'What rewards can I redeem?',
    a: 'You can redeem your accumulated points in the Reward Vault for consumer electronics (such as iPhones, iPads, and AirPods), sneakers, gaming hardware, trading desk accessories, and digital gift cards.',
  },
  {
    q: 'Can I redeem points for cash?',
    a: 'Reward redemption options depend on the active catalog and eligible digital vouchers or payout methods listed inside the Rewards Portal. Always check the current Reward Terms inside your dashboard for eligible redemption types.',
  },
  {
    q: 'What happens if my purchase is rejected?',
    a: 'If a submission is missing information or cannot be matched, our team will notify you in your dashboard with the reason so you can provide the updated invoice or contact support for assistance.',
  },
  {
    q: 'How are physical rewards delivered?',
    a: 'Physical rewards are ordered and shipped directly to your verified delivery address via tracked courier services once your redemption request is processed.',
  },
  {
    q: 'Can I track my reward?',
    a: 'Yes. Every redemption has a dedicated tracking timeline inside your dashboard showing Redemption Confirmed, Processing, Shipped, and Delivered statuses along with courier tracking details.',
  },
];

export function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="w-full py-20 lg:py-24 bg-slate-50 dark:bg-[#0B1015] text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/[0.07] relative overflow-hidden transition-colors duration-300"
    >
      <TradingVisualBackground variant="calm" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Heading */}
        <div className="text-center space-y-3">
          <Reveal>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
              <HelpCircle className="h-3.5 w-3.5" />
              FREQUENTLY ASKED QUESTIONS
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              GOT QUESTIONS?
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <p className="text-slate-600 dark:text-slate-200 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              Everything you need to know about earning points from eligible prop-firm purchases and redeeming rewards.
            </p>
          </Reveal>
        </div>

        {/* 12 Accordion Items */}
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <Reveal key={item.q} delay={Math.min(idx * 35, 250)}>
                <div
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? 'bg-white dark:bg-[#101614] border-emerald-500/50 shadow-md dark:shadow-[0_12px_30px_-10px_rgba(0,0,0,0.65)]'
                      : 'bg-white/90 dark:bg-[#101614]/85 border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.18]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    className="w-full px-5 sm:px-6 py-4.5 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      {item.q}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-out ${
                      isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 sm:px-6 pb-5 text-base text-slate-600 dark:text-slate-200 leading-relaxed border-t border-slate-200 dark:border-white/[0.07] pt-3.5">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
