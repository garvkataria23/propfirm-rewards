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
  Clock,
  X,
  Zap,
  Sliders,
  Monitor,
  Layers,
  FileCheck2,
  Mail,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  buildAutoApplyUrl,
  activateReferralIntent,
  generateTrackingId,
  ChallengeConfigParams,
} from '@/lib/referral-system';
import { useAuth } from '@/context/auth-context';

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

interface AccountTierOption {
  label: string;
  size: string;
  price: number;
  popular?: boolean;
}

const DEFAULT_TIERS: AccountTierOption[] = [
  { label: '$10K Account', size: '10K', price: 99 },
  { label: '$25K Account', size: '25K', price: 189 },
  { label: '$50K Account', size: '50K', price: 299 },
  { label: '$100K Account', size: '100K', price: 499, popular: true },
  { label: '$200K Account', size: '200K', price: 979 },
];

const PLATFORMS = ['MetaTrader 5 (MT5)', 'cTrader', 'TradeLocker', 'DXtrade'];
const CHALLENGE_TYPES = ['2-Step Standard', '1-Step Express', 'Instant Funding'];

export function AutoApplyModal({ isOpen, onClose, firm }: AutoApplyModalProps) {
  const { user } = useAuth();

  // Configurator state
  const [selectedTier, setSelectedTier] = useState<AccountTierOption>(DEFAULT_TIERS[3]); // $100K default
  const [selectedPlatform, setSelectedPlatform] = useState<string>('MetaTrader 5 (MT5)');
  const [selectedType, setSelectedType] = useState<string>('2-Step Standard');
  const [userEmail, setUserEmail] = useState<string>('');
  const [trackingId, setTrackingId] = useState<string>('');

  // UI state
  const [copied, setCopied] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [hasLaunched, setHasLaunched] = useState(false);
  const [launchStep, setLaunchStep] = useState(0);

  // Initialize tracking ID and pre-fill email
  useEffect(() => {
    if (isOpen && firm) {
      setTrackingId(generateTrackingId());
      setHasLaunched(false);
      setIsLaunching(false);
      setLaunchStep(0);
      setCopied(false);
      if (user?.email) {
        setUserEmail(user.email);
      }
    }
  }, [isOpen, firm, user]);

  if (!isOpen || !firm) return null;

  const code = (firm.affiliateCode || 'NATION').trim().toUpperCase();

  // Pricing calculations
  const originalPrice = selectedTier.price;
  const discountAmount = Math.round(originalPrice * 0.1); // 10% discount with NATION
  const finalPrice = originalPrice - discountAmount;
  const rewardPoints = Math.round(finalPrice * 10); // 10 Points per $1 USD

  // Construct config parameters
  const configParams: ChallengeConfigParams = {
    tier: selectedTier.size,
    price: originalPrice,
    discountedPrice: finalPrice,
    expectedPoints: rewardPoints,
    platform: selectedPlatform,
    accountType: selectedType,
    trackingId,
    email: userEmail || undefined,
  };

  const destinationBase = firm.affiliateUrl || firm.websiteUrl || `https://${firm.slug}.com`;
  const checkoutUrl = buildAutoApplyUrl(destinationBase, code, configParams);

  const handleProceedToCheckout = async () => {
    setIsLaunching(true);
    setLaunchStep(1);

    // 1. Copy referral code to clipboard
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(code);
        setCopied(true);
      }
    } catch {
      // Ignore
    }

    // 2. Save active intent in localStorage
    await activateReferralIntent(
      {
        id: firm.id,
        name: firm.name,
        slug: firm.slug,
        affiliateCode: code,
        affiliateUrl: firm.affiliateUrl,
        websiteUrl: firm.websiteUrl,
      },
      configParams
    );

    // Step 2 of animation: Attaching tracking ID
    setTimeout(() => {
      setLaunchStep(2);
    }, 400);

    // Step 3 of animation: Pre-filling cart & launching
    setTimeout(() => {
      setLaunchStep(3);
      if (typeof window !== 'undefined') {
        window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
      }
      setIsLaunching(false);
      setHasLaunched(true);
    }, 900);
  };

  const handleManualCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div
        className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-[#0a0e14] border border-slate-200 dark:border-emerald-500/40 p-5 sm:p-7 text-slate-900 dark:text-white shadow-2xl shadow-emerald-500/10 overflow-hidden my-auto transition-colors"
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
          {/* Header Badge & Title */}
          <div className="flex items-center justify-between gap-2 pr-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-400 text-xs font-bold tracking-wide">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 animate-spin" />
              <span>1-Click Challenge Configurator &amp; Auto-Apply</span>
            </div>
            <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
              ID: <strong className="text-emerald-600 dark:text-emerald-400">{trackingId}</strong>
            </span>
          </div>

          {/* Firm Summary Banner */}
          <div className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#06090e] border border-slate-200 dark:border-emerald-950/80">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-emerald-500/30 overflow-hidden p-1 flex items-center justify-center shrink-0">
                {firm.logoUrl ? (
                  <img src={firm.logoUrl} alt={firm.name} className="h-full w-full object-cover rounded-lg" />
                ) : (
                  <span className="text-xl font-black text-emerald-500">{firm.name[0]}</span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">{firm.name}</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-500/30">
                    VERIFIED PARTNER
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Pre-fills evaluation cart with affiliate code <strong className="text-emerald-600 dark:text-emerald-400">{code}</strong>
                </p>
              </div>
            </div>

            <button
              onClick={handleManualCopy}
              className="text-xs font-mono font-bold px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5 cursor-pointer shrink-0"
              title="Copy Referral Code"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>{code}</span>
                </>
              )}
            </button>
          </div>

          {!hasLaunched ? (
            <>
              {/* Step 1: Account Size Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center justify-between">
                  <span>1. Choose Account Size</span>
                  <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    +10 Points per $1 USD
                  </span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {DEFAULT_TIERS.map((tier) => (
                    <button
                      key={tier.size}
                      type="button"
                      onClick={() => setSelectedTier(tier)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer relative ${
                        selectedTier.size === tier.size
                          ? 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-500 text-slate-900 dark:text-white shadow-sm ring-1 ring-emerald-500'
                          : 'bg-slate-50 dark:bg-[#0c1313] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      {tier.popular && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[8px] font-mono font-black uppercase px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950">
                          HOT
                        </span>
                      )}
                      <div className="font-mono text-xs font-bold">{tier.size}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">${tier.price}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Trading Platform & Challenge Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <Monitor className="h-3.5 w-3.5 text-emerald-500" />
                    <span>2. Trading Platform</span>
                  </label>
                  <select
                    value={selectedPlatform}
                    onChange={(e) => setSelectedPlatform(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-[#0c1313] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    {PLATFORMS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-emerald-500" />
                    <span>3. Challenge Model</span>
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-[#0c1313] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    {CHALLENGE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Optional Email Field for Pre-Filling */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-emerald-500" />
                    <span>4. Your Email (Optional Pre-fill)</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Pre-populates checkout form</span>
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="trader@example.com"
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-[#0c1313] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden placeholder:text-slate-400"
                />
              </div>

              {/* Live Calculation & Attribution Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 dark:from-emerald-950/40 via-teal-50/50 dark:via-[#0c1a17] to-slate-50 dark:to-slate-900 border border-emerald-200 dark:border-emerald-500/40 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 font-sans font-bold">
                    Configuration Summary:
                  </span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                    {selectedTier.label} &bull; {selectedPlatform.split(' ')[0]}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                  <span>Regular Evaluation Price:</span>
                  <span className="line-through">${originalPrice}.00 USD</span>
                </div>

                <div className="flex justify-between items-center text-emerald-700 dark:text-emerald-400 font-bold">
                  <span>Partner Code {code} Discount (10% OFF):</span>
                  <span>-${discountAmount}.00 USD</span>
                </div>

                <div className="flex justify-between items-center text-slate-900 dark:text-white font-extrabold text-sm pt-1 border-t border-slate-200 dark:border-slate-800">
                  <span>Final Checkout Price:</span>
                  <span className="text-slate-900 dark:text-white">${finalPrice}.00 USD</span>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-100/80 dark:bg-emerald-500/15 border border-emerald-300 dark:border-emerald-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-900 dark:text-emerald-300 font-sans font-bold">
                    <Coins className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Reward Points Cashback:</span>
                  </div>
                  <span className="font-mono font-black text-sm text-emerald-700 dark:text-emerald-400">
                    +{rewardPoints.toLocaleString()} PTS (${(rewardPoints * 0.01).toFixed(2)})
                  </span>
                </div>
              </div>

              {/* Launch / Proceed CTA */}
              <div className="pt-1 space-y-2">
                <Button
                  onClick={handleProceedToCheckout}
                  disabled={isLaunching}
                  className="w-full h-13 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  {isLaunching ? (
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 animate-spin text-slate-950" />
                      {launchStep === 1 && 'Attaching partner code NATION...'}
                      {launchStep === 2 && `Locking Session #${trackingId}...`}
                      {launchStep === 3 && `Launching ${firm.name} Checkout...`}
                    </span>
                  ) : (
                    <>
                      <span>Proceed to {firm.name} Checkout</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center leading-relaxed">
                  🔒 <strong>Attribution Guarantee:</strong> Code <strong>{code}</strong> and SubID <strong>{trackingId}</strong> are pre-attached in URL parameters and copied to your clipboard.
                </p>
              </div>
            </>
          ) : (
            /* Post-Launch "Order in Progress / Return to Claim" View */
            <div className="py-4 space-y-5 text-center">
              <div className="h-16 w-16 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <ExternalLink className="h-8 w-8 animate-pulse" />
              </div>

              <div className="space-y-1.5">
                <h4 className="text-xl font-black text-slate-900 dark:text-white">
                  Checkout Launched in New Tab!
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  We opened the official {firm.name} checkout page with code <strong className="text-emerald-600 dark:text-emerald-400">{code}</strong> and tier <strong>{selectedTier.label}</strong> pre-applied.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#06090e] border border-slate-200 dark:border-emerald-950/80 max-w-md mx-auto font-mono text-xs space-y-2 text-left">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Tracking Session ID:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{trackingId}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Configured Tier:</span>
                  <span className="text-slate-900 dark:text-white font-bold">{selectedTier.label}</span>
                </div>
                <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-bold">
                  <span>Points Awaiting Claim:</span>
                  <span>+{rewardPoints.toLocaleString()} PTS</span>
                </div>
              </div>

              <div className="space-y-3 pt-2 max-w-md mx-auto">
                <Link
                  href={`/dashboard/purchases/new?propFirmId=${firm.id}&tier=${encodeURIComponent(selectedTier.label)}&trackingId=${trackingId}`}
                  className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all"
                >
                  <FileCheck2 className="h-4 w-4" />
                  <span>I Completed My Purchase — Submit Receipt Proof</span>
                </Link>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
                      }
                    }}
                    className="flex-1 h-10 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-bold"
                  >
                    Re-open Checkout
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={onClose}
                    className="h-10 rounded-xl text-slate-500 dark:text-slate-400 text-xs font-bold"
                  >
                    Done for Now
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
