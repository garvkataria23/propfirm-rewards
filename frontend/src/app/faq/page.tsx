'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ShieldCheck, ChevronDown, ArrowRight, HelpCircle } from 'lucide-react';

export default function FAQPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does PropFirm Rewards earn revenue to fund these rewards?',
      a: 'We operate as an official affiliate partner with proprietary trading firms. When traders sign up or purchase challenges using our designated referral links and coupon codes, the prop firm shares a marketing referral fee with us. We redistribute this revenue directly back to our active traders in the form of high-value electronics, monitors, and gift cards.',
    },
    {
      q: 'Does using your affiliate code make my challenge more expensive?',
      a: 'Never! In fact, our exclusive promo codes frequently provide a 5% to 15% discount off the prop firm\'s regular challenge price. You save money immediately at checkout and also receive reward points on our platform.',
    },
    {
      q: 'What purchase proofs are acceptable for verification?',
      a: 'We accept official PDF invoices downloaded from the prop firm, order confirmation emails with full headers and transaction numbers, or uncropped screenshots from the prop firm\'s trader billing portal showing the Order ID, purchase date, and amount paid.',
    },
    {
      q: 'Can I submit purchases made prior to creating my account here?',
      a: 'Yes, as long as the purchase was completed using our affiliate code or link within the last 14 calendar days, and the order has not been previously submitted or claimed by another account.',
    },
    {
      q: 'How are physical rewards delivered?',
      a: 'Physical goods (such as iPhones, iPads, and Dell trading monitors) are purchased brand new directly from authorized distributors and shipped via tracked international couriers (FedEx, UPS, DHL). You are provided with a live tracking number once the item leaves the dispatch warehouse.',
    },
    {
      q: 'What happens if my submission is rejected or needs more information?',
      a: 'If our review team cannot verify the order details or if the screenshot was unclear, your submission will be placed in "More Information Required" status with a specific note from the admin. You can easily upload a clearer receipt or updated invoice directly from your dashboard.',
    },
    {
      q: 'Can I redeem multiple rewards?',
      a: 'Yes! As long as you have accumulated enough verified points in your wallet, there is no limit on the number or frequency of rewards you can redeem.',
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center space-y-3">
        <Badge variant="outline">Knowledge Base & FAQ</Badge>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Clear answers about affiliate verification, point allocation, and reward redemption.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden shadow-xs transition-colors"
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full px-6 py-4.5 text-left flex items-center justify-between font-semibold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-sm sm:text-base"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`h-4 w-4 text-slate-400 dark:text-slate-500 transition-transform duration-200 shrink-0 ${
                    isOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-6 pb-5 pt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/50">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-center space-y-4 shadow-xs transition-colors">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Have a question not answered here?</h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          Our support team is available around the clock. Contact us at support@propnation.com.
        </p>
        <Link href="/prop-firms">
          <Button size="sm">
            View Active Prop Firms
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
