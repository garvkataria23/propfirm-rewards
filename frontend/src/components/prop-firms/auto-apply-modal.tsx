'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Coins,
  ArrowRight,
  X,
  FileCheck2,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  buildAutoApplyUrl,
  activateReferralIntent,
  generateTrackingId,
} from '@/lib/referral-system';

export interface AutoApplyFirmData {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  affiliateCode?: string;
  affiliateUrl?: string;
  websiteUrl?: string;
  tierName?: string;
  tierPrice?: number;
}

interface AutoApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  firm: AutoApplyFirmData | null;
}

export function AutoApplyModal({ isOpen, onClose, firm }: AutoApplyModalProps) {
  const [trackingId, setTrackingId] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [hasLaunched, setHasLaunched] = useState(false);

  useEffect(() => {
    if (isOpen && firm) {
      const trk = generateTrackingId();
      setTrackingId(trk);
      setHasLaunched(false);
      const codeToCopy = (firm.affiliateCode || 'NATION').trim().toUpperCase();
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(codeToCopy).then(() => {
          setCopied(true);
        }).catch(() => {});
      }
    }
  }, [isOpen, firm]);

  if (!isOpen || !firm) return null;

  const code = (firm.affiliateCode || 'NATION').trim().toUpperCase();
  const destinationBase = firm.affiliateUrl || firm.websiteUrl || firm.slug || firm.name;
  const checkoutUrl = buildAutoApplyUrl(destinationBase, code, { trackingId });
  const cleanPortalDisplay = checkoutUrl.split('?')[0];

  const handleOpenDirectCheckout = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(code);
        setCopied(true);
      }
    } catch {
      // Ignore
    }

    await activateReferralIntent(
      {
        id: firm.id,
        name: firm.name,
        slug: firm.slug,
        affiliateCode: code,
        affiliateUrl: firm.affiliateUrl,
        websiteUrl: firm.websiteUrl,
      },
      { trackingId }
    );

    if (typeof window !== 'undefined') {
      window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
    }
    setHasLaunched(true);
  };

  const handleManualCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#0a0e14] border border-slate-200 dark:border-emerald-500/40 p-6 sm:p-7 text-slate-900 dark:text-white shadow-2xl overflow-hidden my-auto transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient decorations */}
        <div className="absolute -top-20 -right-20 h-44 w-44 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 h-44 w-44 rounded-full bg-teal-500/10 dark:bg-teal-500/15 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative z-10 space-y-5 text-left">
          {/* Header Badge */}
          <div className="flex items-center justify-between gap-2 pr-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-400 text-xs font-bold tracking-wide">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Direct Account &amp; Checkout Portal</span>
            </div>
            <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
              ID: <strong className="text-emerald-600 dark:text-emerald-400">{trackingId}</strong>
            </span>
          </div>

          {/* Firm Summary Banner */}
          <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-[#06090e] border border-slate-200 dark:border-emerald-950/80">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="h-13 w-13 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-emerald-500/30 overflow-hidden p-1 flex items-center justify-center shrink-0">
                {firm.logoUrl ? (
                  <img src={firm.logoUrl} alt={firm.name} className="h-full w-full object-cover rounded-lg" />
                ) : (
                  <span className="text-xl font-black text-emerald-500">{firm.name[0]}</span>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white truncate">{firm.name}</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-500/30 shrink-0">
                    VERIFIED
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
                  <Globe className="h-3 w-3 text-emerald-500 shrink-0" />
                  <span className="font-mono text-[11px] truncate">{cleanPortalDisplay}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Coupon Code Auto-Copied Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 dark:from-emerald-950/40 via-teal-50/50 dark:via-[#0c1a17] to-slate-50 dark:to-slate-900 border border-emerald-200 dark:border-emerald-500/40 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Official Partner Promo Code
                </div>
                <div className="font-mono text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-widest mt-0.5">
                  {code}
                </div>
              </div>
              <button
                onClick={handleManualCopy}
                className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-500/40 text-xs font-bold text-slate-900 dark:text-white hover:bg-emerald-50 dark:hover:bg-slate-700 flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">Code Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 text-emerald-500" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            <div className="pt-2.5 border-t border-emerald-200/70 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200">
                <Coins className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Guaranteed Cashback Rate:
              </span>
              <span className="font-mono font-black text-emerald-700 dark:text-emerald-400">
                10 PTS per $1 Spent (10% Back)
              </span>
            </div>
          </div>

          {/* Direct Action Buttons */}
          <div className="space-y-2.5 pt-1">
            <Button
              onClick={handleOpenDirectCheckout}
              className="w-full h-13 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <span>Open {firm.name} Direct Checkout</span>
              <ExternalLink className="h-4 w-4" />
            </Button>

            <Link
              href={`/dashboard/purchases/new?propFirmId=${firm.id}&trackingId=${trackingId}`}
              onClick={onClose}
              className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <FileCheck2 className="h-4 w-4 text-emerald-500" />
              <span>Already Purchased? Submit Receipt to Claim Points</span>
            </Link>

            {hasLaunched && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 text-center font-semibold pt-1 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Direct checkout opened in new tab &amp; code {code} copied!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
