'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Coins,
  ArrowRight,
  Clock,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { buildAutoApplyUrl, activateReferralIntent } from '@/lib/referral-system';

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
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState<number>(3);
  const [autoApplyUrl, setAutoApplyUrl] = useState<string>('');

  useEffect(() => {
    if (!isOpen || !firm) {
      setCountdown(3);
      setCopied(false);
      return;
    }

    // Build the URL & activate intent in background
    let url = '';
    const code = (firm.affiliateCode || 'NATION').trim().toUpperCase();
    const destinationBase = firm.affiliateUrl || firm.websiteUrl || `https://${firm.slug}.com`;
    url = buildAutoApplyUrl(destinationBase, code);
    setAutoApplyUrl(url);

    // Auto copy and set localStorage session
    activateReferralIntent({
      id: firm.id,
      name: firm.name,
      slug: firm.slug,
      affiliateCode: code,
      affiliateUrl: firm.affiliateUrl,
      websiteUrl: firm.websiteUrl,
    });
    setCopied(true);

    // 3-second auto-redirect countdown
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Trigger redirect
          if (url && typeof window !== 'undefined') {
            window.open(url, '_blank', 'noopener,noreferrer');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, firm]);

  if (!isOpen || !firm) return null;

  const code = (firm.affiliateCode || 'NATION').trim().toUpperCase();

  const handleManualOpen = () => {
    if (autoApplyUrl && typeof window !== 'undefined') {
      window.open(autoApplyUrl, '_blank', 'noopener,noreferrer');
    }
    onClose();
  };

  const handleManualCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg rounded-3xl bg-[#0a0e14] border border-emerald-500/40 p-6 sm:p-8 text-white shadow-2xl shadow-emerald-500/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient decorations */}
        <div className="absolute -top-20 -right-20 h-44 w-44 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 h-44 w-44 rounded-full bg-teal-500/15 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative z-10 space-y-6 text-left">
          {/* Header Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold tracking-wide">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-spin" />
            <span>1-Click Referral Code Auto-Activation</span>
          </div>

          {/* Firm + Code Summary */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#06090e] border border-emerald-950/80">
            <div className="h-14 w-14 rounded-xl bg-slate-900 border border-emerald-500/30 overflow-hidden flex items-center justify-center shrink-0">
              {firm.logoUrl ? (
                <img src={firm.logoUrl} alt={firm.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-2xl font-black text-emerald-400">{firm.name[0]}</span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white truncate">{firm.name}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                  VERIFIED
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Connecting to official checkout with pre-applied cashback
              </p>
            </div>
          </div>

          {/* Code Highlight Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-[#0c1a17] to-slate-900 border-2 border-emerald-500/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Applied Referral &amp; Coupon Code
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Pre-filled in URL &amp; Clipboard</span>
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 bg-black/60 p-3 rounded-xl border border-emerald-500/30">
              <span className="font-mono text-2xl sm:text-3xl font-black tracking-widest text-emerald-400">
                {code}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualCopy}
                className="border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20 text-xs font-bold shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 mr-1 text-emerald-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 mr-1" />
                    Copy Code
                  </>
                )}
              </Button>
            </div>

            <div className="text-[11px] text-slate-300 flex items-center gap-2">
              <Coins className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>
                Earns <strong>10 Points per $1 USD</strong> spent on any account challenge.
              </span>
            </div>
          </div>

          {/* Auto-redirect progress bar & countdown */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                <span>
                  {countdown > 0
                    ? `Opening ${firm.name} in ${countdown}s...`
                    : 'Opening official checkout...'}
                </span>
              </span>
              <span className="font-mono text-emerald-400 font-bold">{Math.max(0, countdown)}s</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${((3 - countdown) / 3) * 100}%` }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleManualOpen}
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout with Code {code}</span>
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="h-12 rounded-xl border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold"
            >
              Cancel
            </Button>
          </div>

          {/* Fail-safe Tip */}
          <p className="text-[11px] text-slate-400 text-center leading-relaxed">
            💡 <strong>Trader Note:</strong> The discount &amp; affiliate parameters are pre-stacked into the URL. If the prop firm checkout has a promo code box, code <strong>{code}</strong> is already copied to your clipboard — simply press Paste (Ctrl+V / ⌘V).
          </p>
        </div>
      </div>
    </div>
  );
}
