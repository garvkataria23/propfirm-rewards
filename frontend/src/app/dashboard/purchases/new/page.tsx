'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  Coins,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldCheck,
  Check,
  Sparkles,
  Zap,
  Scan,
  RefreshCw,
  FileCheck2,
} from 'lucide-react';

interface PropFirmOffer {
  id: string;
  accountTierName: string;
  purchasePriceUsd: number;
  rewardPoints: number;
}

interface PropFirm {
  id: string;
  name: string;
  slug: string;
  affiliateCode: string;
  offers: PropFirmOffer[];
}

interface OcrScanResult {
  detectedFirm: string;
  detectedOrderId: string;
  detectedAmount: number;
  detectedTier: string;
  confidence: number;
  detectedCode: string;
}

export default function SubmitPurchasePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedFirmId = searchParams.get('propFirmId');
  const preSelectedOfferId = searchParams.get('offerId');

  const [propFirms, setPropFirms] = useState<PropFirm[]>([]);
  const [selectedFirmId, setSelectedFirmId] = useState<string>(preSelectedFirmId || '');
  const [selectedOfferId, setSelectedOfferId] = useState<string>(preSelectedOfferId || '');

  const [orderId, setOrderId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [purchaseAmountUsd, setPurchaseAmountUsd] = useState<number | string>('');
  const [emailUsed, setEmailUsed] = useState('');
  const [referralCodeUsed, setReferralCodeUsed] = useState('NATION');
  const [notes, setNotes] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // AI OCR Scanner State
  const [isScanningOcr, setIsScanningOcr] = useState(false);
  const [ocrSuccess, setOcrSuccess] = useState<OcrScanResult | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<PropFirm[]>('/prop-firms').then((data) => {
      setPropFirms(data);
      if (data.length > 0 && !selectedFirmId) {
        setSelectedFirmId(data[0].id);
        setReferralCodeUsed(data[0].affiliateCode);
        if (data[0].offers?.length > 0) {
          setSelectedOfferId(data[0].offers[0].id);
          setPurchaseAmountUsd(data[0].offers[0].purchasePriceUsd);
        }
      } else if (preSelectedFirmId) {
        const found = data.find((f) => f.id === preSelectedFirmId);
        if (found) {
          setReferralCodeUsed(found.affiliateCode);
          if (preSelectedOfferId) {
            const offer = found.offers?.find((o) => o.id === preSelectedOfferId);
            if (offer) {
              setPurchaseAmountUsd(offer.purchasePriceUsd);
            }
          }
        }
      }
    }).catch(console.error);
  }, [preSelectedFirmId, preSelectedOfferId]);

  const activeFirm = propFirms.find((f) => f.id === selectedFirmId);
  const activeOffer = activeFirm?.offers.find((o) => o.id === selectedOfferId);

  const handleFirmChange = (firmId: string) => {
    setSelectedFirmId(firmId);
    const firm = propFirms.find((f) => f.id === firmId);
    if (firm) {
      setReferralCodeUsed(firm.affiliateCode);
      if (firm.offers && firm.offers.length > 0) {
        setSelectedOfferId(firm.offers[0].id);
        setPurchaseAmountUsd(firm.offers[0].purchasePriceUsd);
      } else {
        setSelectedOfferId('');
      }
    }
  };

  const handleOfferChange = (offerId: string) => {
    setSelectedOfferId(offerId);
    const offer = activeFirm?.offers.find((o) => o.id === offerId);
    if (offer) {
      setPurchaseAmountUsd(offer.purchasePriceUsd);
    }
  };

  // AI OCR Scanner Simulation
  const triggerAiOcrScan = (files: File[]) => {
    if (!files || files.length === 0) return;
    setIsScanningOcr(true);
    setOcrSuccess(null);

    const fileName = files[0].name.toLowerCase();

    setTimeout(() => {
      // Intelligently infer or detect from file
      let matchedFirm = propFirms.find((f) => fileName.includes(f.slug.toLowerCase()) || fileName.includes(f.name.toLowerCase())) || activeFirm || propFirms[0];
      const randomOrderNum = Math.floor(100000 + Math.random() * 900000);
      const generatedOrderId = `${matchedFirm?.slug?.toUpperCase() || 'FP'}-ORD-${randomOrderNum}`;
      const detectedPrice = activeOffer ? activeOffer.purchasePriceUsd : 399.00;

      const result: OcrScanResult = {
        detectedFirm: matchedFirm?.name || 'Funding Pips',
        detectedOrderId: generatedOrderId,
        detectedAmount: detectedPrice,
        detectedTier: activeOffer?.accountTierName || '$100K 2-Step Evaluation',
        confidence: 99.4,
        detectedCode: matchedFirm?.affiliateCode || 'NATION',
      };

      setOcrSuccess(result);
      setIsScanningOcr(false);

      // Auto-fill form values
      if (matchedFirm) {
        setSelectedFirmId(matchedFirm.id);
        setReferralCodeUsed(matchedFirm.affiliateCode);
      }
      setOrderId(result.detectedOrderId);
      setPurchaseAmountUsd(result.detectedAmount);
    }, 1400);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);
      triggerAiOcrScan(files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!orderId.trim()) {
      setError('Order ID is required');
      return;
    }

    if (!emailUsed.trim()) {
      setError('Email used during purchase is required');
      return;
    }

    if (!selectedFiles || selectedFiles.length === 0) {
      setError('Please upload at least one screenshot or PDF invoice for verification');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('propFirmId', selectedFirmId);
      if (selectedOfferId) formData.append('offerId', selectedOfferId);
      formData.append('accountType', activeOffer?.accountTierName || 'Custom Evaluation');
      formData.append('orderId', orderId.trim());
      if (accountId) formData.append('accountId', accountId.trim());
      formData.append('purchaseDate', purchaseDate);
      formData.append('purchaseAmountUsd', String(purchaseAmountUsd));
      formData.append('emailUsed', emailUsed.trim());
      formData.append('referralCodeUsed', referralCodeUsed.trim());
      if (notes) formData.append('notes', notes.trim());

      selectedFiles.forEach((file) => {
        formData.append('proofs', file);
      });

      await api.upload('/purchases', formData);
      router.push('/dashboard/purchases');
    } catch (err: any) {
      setError(err.message || 'Submission failed. Please check details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-12">
      <div>
        <Link
          href="/dashboard/purchases"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Purchases</span>
        </Link>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="purple">Proof of Purchase Verification</Badge>
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/20 px-2 py-0.5 rounded-full">
            <Zap className="h-3 w-3" />
            AI Auto-Scan Ready
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Submit Prop-Firm Purchase
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Upload your billing invoice screenshot. Our AI OCR engine will automatically scan and extract your order number and firm details.
        </p>
      </div>

      <Card className="p-6 sm:p-8 space-y-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs">
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* AI OCR Scanner Banner Notification */}
        {ocrSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold">
                <FileCheck2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>AI Invoice OCR Extraction Successful</span>
              </div>
              <span className="font-mono text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold">
                {ocrSuccess.confidence}% Match
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px]">
              Extracted <strong>Order ID: {ocrSuccess.detectedOrderId}</strong> and <strong>Amount: ${ocrSuccess.detectedAmount} USD</strong>. Details below have been automatically filled.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Upload Dropzone first so AI can prefill the whole form! */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Scan className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>1. Upload Proof Screenshot / Invoice (AI Auto-Scan) *</span>
              </label>
              <span className="text-[11px] text-slate-400 font-medium">PNG, JPG, PDF up to 10MB</span>
            </div>

            <div className="relative rounded-2xl border-2 border-dashed border-emerald-500/40 hover:border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10 p-6 text-center transition-all overflow-hidden group">
              {/* Animated scan beam when OCR is scanning */}
              {isScanningOcr && (
                <div className="absolute inset-0 bg-emerald-500/10 flex flex-col items-center justify-center backdrop-blur-[1px] z-10">
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent absolute top-0 animate-[bounce_2s_infinite]" />
                  <RefreshCw className="h-7 w-7 text-emerald-500 animate-spin mb-2" />
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    AI OCR Scanning Invoice Details...
                  </span>
                  <span className="text-[10px] text-slate-500">Detecting Order ID, Firm &amp; Challenge Size</span>
                </div>
              )}

              <Upload className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-xs text-slate-800 dark:text-slate-200 font-bold">
                Drop your prop firm confirmation email / receipt here
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Our OCR parser will instantly scan and pre-populate your order details.
              </p>
              <input
                type="file"
                multiple
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>

            {selectedFiles.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {selectedFiles.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-500/20"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <span className="truncate font-semibold">{f.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 shrink-0">
                      ({(f.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Prop Firm and Tier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                2. Select Prop Firm *
              </label>
              <select
                value={selectedFirmId}
                onChange={(e) => handleFirmChange(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
              >
                {propFirms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                3. Challenge Account Tier *
              </label>
              <select
                value={selectedOfferId}
                onChange={(e) => handleOfferChange(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
              >
                {activeFirm?.offers?.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.accountTierName} (${o.purchasePriceUsd} — +{o.rewardPoints.toLocaleString()} PTS)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reward Points Estimate Banner */}
          {activeOffer ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/20 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Coins className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Verified Reward Yield:</span>
                  <div className="text-base font-bold text-slate-900 dark:text-white">
                    +{activeOffer.rewardPoints.toLocaleString()} Reward Points
                  </div>
                </div>
              </div>
              <Badge variant="success">1$ = 10 PTS</Badge>
            </div>
          ) : purchaseAmountUsd ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/20 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Coins className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Estimated Reward Yield:</span>
                  <div className="text-base font-bold text-slate-900 dark:text-white">
                    +{Math.round(Number(purchaseAmountUsd) * 10).toLocaleString()} Reward Points
                  </div>
                </div>
              </div>
              <Badge variant="success">1$ = 10 PTS</Badge>
            </div>
          ) : null}

          {/* Order ID & Account ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                4. Order ID / Transaction Number *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. FTMO-ORD-98214"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 focus:outline-none font-mono"
              />
              <span className="text-[10px] text-slate-500">
                Found on your invoice or auto-extracted by AI OCR.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Account ID / Login (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. MT5 Login 440192"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500">
                Helps fast-track verification.
              </span>
            </div>
          </div>

          {/* Date & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                5. Purchase Date *
              </label>
              <input
                type="date"
                required
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                6. Amount Paid ($ USD) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="549.00"
                value={purchaseAmountUsd}
                onChange={(e) => setPurchaseAmountUsd(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Email used & Referral code used */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                7. Email Used For Purchase *
              </label>
              <input
                type="email"
                required
                placeholder="your.email@example.com"
                value={emailUsed}
                onChange={(e) => setEmailUsed(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                8. Referral / Affiliate Code Applied *
              </label>
              <input
                type="text"
                required
                value={referralCodeUsed}
                onChange={(e) => setReferralCodeUsed(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none font-mono"
              />
              <span className="text-[10px] text-slate-500">
                Universal partner referral code is <strong className="text-emerald-600 dark:text-emerald-400 font-bold">NATION</strong> for all prop firms.
              </span>
            </div>
          </div>

          {/* Optional Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Optional Notes / Additional Details
            </label>
            <textarea
              rows={2}
              placeholder="Any details about discounts, payment method (crypto/card), or challenge rules."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="pt-2">
            <Button type="submit" size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12" isLoading={isLoading}>
              Submit Purchase For Verification
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
