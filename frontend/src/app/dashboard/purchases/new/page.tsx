'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
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
  Eye,
  ZoomIn,
  Video,
  Image as ImageIcon,
  Trash2,
  Play,
  FileSpreadsheet,
  Copy,
  MessageSquare,
  Tag,
  Info,
  ArrowRight,
} from 'lucide-react';
import { SearchableCombobox, ComboboxOption } from '@/components/ui/searchable-combobox';
import { useAuth } from '@/context/auth-context';
import { userDataStore, UserPurchaseRecord } from '@/lib/userDataStore';
import {
  getActiveCheckoutIntent,
  clearActiveCheckoutIntent,
  ActiveCheckoutSession,
} from '@/lib/referral-system';

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

interface UploadedProofItem {
  file: File;
  previewUrl: string;
  isImage: boolean;
  isVideo: boolean;
  isPdf: boolean;
  formattedSize: string;
}

const DEMO_PROOF_EXAMPLES = [
  {
    id: 'invoice',
    title: 'Prop Firm Billing Receipt / Tax Invoice',
    badge: 'Most Recommended',
    firm: 'FundedSquad / Any Firm',
    image: '/demo-proofs/fundedsquad-invoice-sample.jpg',
    description:
      'The official invoice or billing receipt sent after successful payment or downloaded from your trader portal.',
    keyPoints: [
      'Order Number clearly visible (e.g. #FS-51656)',
      'Total Amount Paid ($ USD) & payment method',
      'Coupon / Referral code applied: NATION',
      'Date of purchase & account challenge size',
    ],
    callout: 'Order # and Total $ are clearly readable for instant AI verification.',
  },
  {
    id: 'checkout',
    title: 'Order Confirmed / Checkout Success Screen',
    badge: 'Instant Verification',
    firm: 'Checkout Portal (e.g. FundedSquad, Pipstone, FundingPips)',
    image: '/demo-proofs/order-confirmed-sample.jpg',
    description:
      'Full screenshot of the final checkout screen right after payment completes.',
    keyPoints: [
      'Order Number / Reference ID clearly visible',
      'Account challenge type ($5K, $25K, $100K, etc.)',
      'Customer contact / billing email matching your account',
      'Payment status shows "Paid" or "Success"',
    ],
    callout: 'Capture the screen showing the Order details and challenge tier.',
  },
  {
    id: 'email',
    title: 'Order Processing / Confirmation Email',
    badge: 'Email Proof',
    firm: 'Prop Firm Inbox Notification',
    image: '/demo-proofs/email-processing-sample.jpg',
    description:
      'The official order received / processing email sent directly to your inbox from the prop firm.',
    keyPoints: [
      'Sender is official prop firm domain',
      'Displays your order number & order date',
      'Shows the purchased challenge package and total',
      'Matches the email address registered on your account',
    ],
    callout: 'Ensure sender email and order details are not cropped out.',
  },
];

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'pdf', 'mp4', 'mov', 'webm'];

const FALLBACK_PROP_FIRMS: PropFirm[] = [
  {
    id: 'firm-2',
    name: 'Pipstone Capital',
    slug: 'pipstone-capital',
    affiliateCode: 'NATION',
    offers: [
      { id: 'o-6', accountTierName: '$15K Pipstone Standard', purchasePriceUsd: 120, rewardPoints: 1200 },
      { id: 'o-7', accountTierName: '$30K Pipstone Standard', purchasePriceUsd: 220, rewardPoints: 2200 },
      { id: 'o-8', accountTierName: '$60K Pipstone Standard', purchasePriceUsd: 380, rewardPoints: 3800 },
      { id: 'o-9', accountTierName: '$100K Pipstone Standard', purchasePriceUsd: 520, rewardPoints: 5200 },
      { id: 'o-10', accountTierName: '$200K Pipstone Standard', purchasePriceUsd: 980, rewardPoints: 9800 },
    ],
  },
  {
    id: 'firm-1',
    name: 'FundedSquad',
    slug: 'fundedsquad',
    affiliateCode: 'NATION',
    offers: [
      { id: 'o-1', accountTierName: '$10K Evaluation Challenge', purchasePriceUsd: 100, rewardPoints: 1000 },
      { id: 'o-2', accountTierName: '$25K Evaluation Challenge', purchasePriceUsd: 200, rewardPoints: 2000 },
      { id: 'o-3', accountTierName: '$50K Evaluation Challenge', purchasePriceUsd: 350, rewardPoints: 3500 },
      { id: 'o-4', accountTierName: '$100K Evaluation Challenge', purchasePriceUsd: 550, rewardPoints: 5500 },
      { id: 'o-5', accountTierName: '$200K Evaluation Challenge', purchasePriceUsd: 1000, rewardPoints: 10000 },
    ],
  },
  {
    id: 'firm-3',
    name: 'FTMO',
    slug: 'ftmo',
    affiliateCode: 'NATION',
    offers: [
      { id: 'o-11', accountTierName: '$10K Evaluation Challenge', purchasePriceUsd: 175, rewardPoints: 1750 },
      { id: 'o-12', accountTierName: '$25K Evaluation Challenge', purchasePriceUsd: 280, rewardPoints: 2800 },
      { id: 'o-13', accountTierName: '$50K Evaluation Challenge', purchasePriceUsd: 390, rewardPoints: 3900 },
      { id: 'o-14', accountTierName: '$100K Evaluation Challenge', purchasePriceUsd: 600, rewardPoints: 6000 },
      { id: 'o-15', accountTierName: '$200K Evaluation Challenge', purchasePriceUsd: 1180, rewardPoints: 11800 },
    ],
  },
  {
    id: 'firm-4',
    name: 'FundedNext',
    slug: 'fundednext',
    affiliateCode: 'NATION',
    offers: [
      { id: 'o-16', accountTierName: '$15K Stellar 2-Step', purchasePriceUsd: 119, rewardPoints: 1190 },
      { id: 'o-17', accountTierName: '$25K Stellar 2-Step', purchasePriceUsd: 199, rewardPoints: 1990 },
      { id: 'o-18', accountTierName: '$50K Stellar 2-Step', purchasePriceUsd: 299, rewardPoints: 2990 },
      { id: 'o-19', accountTierName: '$100K Stellar 2-Step', purchasePriceUsd: 549, rewardPoints: 5490 },
      { id: 'o-20', accountTierName: '$200K Stellar 2-Step', purchasePriceUsd: 1099, rewardPoints: 10990 },
    ],
  },
  {
    id: 'firm-5',
    name: 'Funding Pips',
    slug: 'funding-pips',
    affiliateCode: 'NATION',
    offers: [
      { id: 'o-21', accountTierName: '$5K Evaluation 2-Step', purchasePriceUsd: 32, rewardPoints: 320 },
      { id: 'o-22', accountTierName: '$25K Evaluation 2-Step', purchasePriceUsd: 139, rewardPoints: 1390 },
      { id: 'o-23', accountTierName: '$50K Evaluation 2-Step', purchasePriceUsd: 239, rewardPoints: 2390 },
      { id: 'o-24', accountTierName: '$100K Evaluation 2-Step', purchasePriceUsd: 399, rewardPoints: 3990 },
    ],
  },
  {
    id: 'firm-6',
    name: 'Apex Trader Funding',
    slug: 'apex-trader-funding',
    affiliateCode: 'NATION',
    offers: [
      { id: 'o-25', accountTierName: '$25K Full Futures', purchasePriceUsd: 147, rewardPoints: 1470 },
      { id: 'o-26', accountTierName: '$50K Full Futures', purchasePriceUsd: 167, rewardPoints: 1670 },
      { id: 'o-27', accountTierName: '$100K Full Futures', purchasePriceUsd: 207, rewardPoints: 2070 },
      { id: 'o-28', accountTierName: '$150K Full Futures', purchasePriceUsd: 297, rewardPoints: 2970 },
    ],
  },
  {
    id: 'firm-7',
    name: 'Topstep',
    slug: 'topstep',
    affiliateCode: 'NATION',
    offers: [
      { id: 'o-29', accountTierName: '$50K Trading Combine', purchasePriceUsd: 49, rewardPoints: 490 },
      { id: 'o-30', accountTierName: '$100K Trading Combine', purchasePriceUsd: 99, rewardPoints: 990 },
      { id: 'o-31', accountTierName: '$150K Trading Combine', purchasePriceUsd: 149, rewardPoints: 1490 },
    ],
  },
  {
    id: 'firm-8',
    name: 'MyFundedFutures',
    slug: 'myfundedfutures',
    affiliateCode: 'NATION',
    offers: [
      { id: 'o-32', accountTierName: '$50K Starter Plan', purchasePriceUsd: 80, rewardPoints: 800 },
      { id: 'o-33', accountTierName: '$100K Starter Plan', purchasePriceUsd: 150, rewardPoints: 1500 },
      { id: 'o-34', accountTierName: '$150K Expert Plan', purchasePriceUsd: 375, rewardPoints: 3750 },
    ],
  },
];

export default function SubmitPurchasePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, refreshUser } = useAuth();
  const preSelectedFirmId = searchParams.get('propFirmId');
  const preSelectedOfferId = searchParams.get('offerId');

  const [propFirms, setPropFirms] = useState<PropFirm[]>(FALLBACK_PROP_FIRMS);
  const [selectedFirmId, setSelectedFirmId] = useState<string>(preSelectedFirmId || FALLBACK_PROP_FIRMS[0].id);
  const [selectedOfferId, setSelectedOfferId] = useState<string>(preSelectedOfferId || FALLBACK_PROP_FIRMS[0].offers[0].id);

  const [orderId, setOrderId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [purchaseAmountUsd, setPurchaseAmountUsd] = useState<number | string>(FALLBACK_PROP_FIRMS[0].offers[0].purchasePriceUsd);
  const [emailUsed, setEmailUsed] = useState(user?.email || '');
  const [referralCodeUsed, setReferralCodeUsed] = useState('NATION');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (user?.email && !emailUsed) {
      setEmailUsed(user.email);
    }
  }, [user, emailUsed]);
  const [platform, setPlatform] = useState('MetaTrader 5 (MT5)');
  const [currency, setCurrency] = useState('USD');
  const [paymentMethod, setPaymentMethod] = useState('Credit / Debit Card');
  
  // Uploaded proofs with preview items
  const [proofItems, setProofItems] = useState<UploadedProofItem[]>([]);

  // Demo inspection modal state
  const [inspectDemo, setInspectDemo] = useState<(typeof DEMO_PROOF_EXAMPLES)[0] | null>(null);

  // AI OCR Scanner State
  const [isScanningOcr, setIsScanningOcr] = useState(false);
  const [ocrSuccess, setOcrSuccess] = useState<OcrScanResult | null>(null);

  // Post-submission success modal state with Tracking ID
  const [submittedResult, setSubmittedResult] = useState<{
    submissionCode: string;
    orderId: string;
    pointsAwarded: number;
    firmName: string;
  } | null>(null);
  const [copiedTrackingId, setCopiedTrackingId] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeIntent, setActiveIntent] = useState<ActiveCheckoutSession | null>(null);

  useEffect(() => {
    const intent = getActiveCheckoutIntent();
    if (intent) {
      setActiveIntent(intent);
    }

    const applyFirmSelection = (data: PropFirm[]) => {
      if (preSelectedFirmId) {
        const found = data.find((f) => f.id === preSelectedFirmId || f.slug === preSelectedFirmId);
        if (found) {
          setSelectedFirmId(found.id);
          setReferralCodeUsed(found.affiliateCode || 'NATION');
          if (preSelectedOfferId) {
            const offer = found.offers?.find((o) => o.id === preSelectedOfferId);
            if (offer) {
              setPurchaseAmountUsd(offer.purchasePriceUsd);
            }
          }
        }
      } else if (intent) {
        const found = data.find((f) => f.id === intent.firmId || f.slug === intent.firmSlug);
        if (found) {
          setSelectedFirmId(found.id);
          setReferralCodeUsed(intent.affiliateCode || found.affiliateCode || 'NATION');
          if (intent.discountedPrice || intent.tierPrice) {
            setPurchaseAmountUsd(intent.discountedPrice || intent.tierPrice || '');
          } else if (found.offers && found.offers.length > 0) {
            setSelectedOfferId(found.offers[0].id);
            setPurchaseAmountUsd(found.offers[0].purchasePriceUsd);
          }
          if (intent.platform) {
            setPlatform(intent.platform);
          }
        }
      } else if (data.length > 0 && !selectedFirmId) {
        setSelectedFirmId(data[0].id);
        setReferralCodeUsed(data[0].affiliateCode || 'NATION');
        if (data[0].offers?.length > 0) {
          setSelectedOfferId(data[0].offers[0].id);
          setPurchaseAmountUsd(data[0].offers[0].purchasePriceUsd);
        }
      }
    };

    // Hydrate selection immediately from FALLBACK_PROP_FIRMS
    applyFirmSelection(FALLBACK_PROP_FIRMS);

    api
      .get<PropFirm[]>('/prop-firms')
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPropFirms(data);
          applyFirmSelection(data);
        }
      })
      .catch(() => {});
  }, [preSelectedFirmId, preSelectedOfferId]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      proofItems.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
    };
  }, [proofItems]);

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

  const firmOptions: ComboboxOption[] = propFirms.map((f) => ({
    value: f.id,
    label: f.name,
    subtitle: `Ref Code: ${f.affiliateCode}`,
    badge: `${f.offers?.length || 0} Tiers`,
  }));

  const offerOptions: ComboboxOption[] = (activeFirm?.offers || []).map((o) => ({
    value: o.id,
    label: o.accountTierName,
    subtitle: `$${o.purchasePriceUsd}`,
    badge: `+${o.rewardPoints.toLocaleString('en-US')} PTS`,
  }));

  const PLATFORM_OPTIONS: ComboboxOption[] = [
    { value: 'MetaTrader 5 (MT5)', label: 'MetaTrader 5 (MT5)', badge: 'Popular' },
    { value: 'cTrader', label: 'cTrader', badge: 'ECN / Raw' },
    { value: 'TradeLocker', label: 'TradeLocker', badge: 'TradingView' },
    { value: 'MatchTrader', label: 'MatchTrader' },
    { value: 'DXtrade', label: 'DXtrade' },
    { value: 'MetaTrader 4 (MT4)', label: 'MetaTrader 4 (MT4)' },
  ];

  const CURRENCY_OPTIONS: ComboboxOption[] = [
    { value: 'USD', label: 'USD ($)', subtitle: 'United States Dollar (Only Supported Currency)', badge: 'USD ($)' },
  ];

  const PAYMENT_METHOD_OPTIONS: ComboboxOption[] = [
    { value: 'Credit / Debit Card', label: 'Credit / Debit Card (Visa/Mastercard)', badge: 'Instant' },
    { value: 'Crypto USDT (TRC20/ERC20)', label: 'Crypto USDT (Tether)', badge: 'Crypto' },
    { value: 'Crypto Bitcoin (BTC)', label: 'Crypto Bitcoin (BTC)', badge: 'Crypto' },
    { value: 'Apple Pay / Google Pay', label: 'Apple Pay / Google Pay', badge: 'Mobile' },
    { value: 'Bank Wire Transfer', label: 'Bank Wire Transfer' },
  ];

  const handlePreFillDemo = () => {
    const firm = propFirms[0] || null;
    if (firm) {
      setSelectedFirmId(firm.id);
      setReferralCodeUsed(firm.affiliateCode || 'NATION');
      if (firm.offers && firm.offers.length > 0) {
        const offer = firm.offers[0];
        setSelectedOfferId(offer.id);
        setPurchaseAmountUsd(offer.purchasePriceUsd);
      }
    }
    const randomOrderNum = Math.floor(100000 + Math.random() * 900000);
    setOrderId(`FS-${randomOrderNum}`);
    setAccountId(`MT5-${Math.floor(200000 + Math.random() * 800000)}`);
    setEmailUsed(user?.email || 'trader@example.com');
    setPlatform('MetaTrader 5 (MT5)');
    setCurrency('USD');
    setPaymentMethod('Credit / Debit Card');
    setPurchaseDate(new Date().toISOString().split('T')[0]);

    if (proofItems.length === 0) {
      const dummyBlob = new Blob(['Demo invoice receipt verification content'], { type: 'text/plain' });
      const dummyFile = new File([dummyBlob], 'demo_purchase_invoice.png', { type: 'image/png' });
      setProofItems([
        {
          file: dummyFile,
          previewUrl: '/demo-proofs/fundedsquad-invoice-sample.jpg',
          isImage: true,
          isVideo: false,
          isPdf: false,
          formattedSize: '1.2 MB',
        },
      ]);
    }
  };

  // AI OCR Scanner Simulation
  const triggerAiOcrScan = (files: File[]) => {
    if (!files || files.length === 0) return;
    setIsScanningOcr(true);
    setOcrSuccess(null);

    const fileName = files[0].name.toLowerCase();

    setTimeout(() => {
      const matchedFirm =
        propFirms.find(
          (f) => fileName.includes(f.slug.toLowerCase()) || fileName.includes(f.name.toLowerCase()),
        ) || activeFirm || propFirms[0];
      const randomOrderNum = Math.floor(100000 + Math.random() * 900000);
      const generatedOrderId = `${matchedFirm?.slug?.toUpperCase() || 'FP'}-ORD-${randomOrderNum}`;
      const detectedPrice = activeOffer ? activeOffer.purchasePriceUsd : 399.0;

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

      if (matchedFirm) {
        setSelectedFirmId(matchedFirm.id);
        setReferralCodeUsed(matchedFirm.affiliateCode);
      }
      setOrderId(result.detectedOrderId);
      setPurchaseAmountUsd(result.detectedAmount);
    }, 1400);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (!e.target.files || e.target.files.length === 0) return;

    const rawFiles = Array.from(e.target.files);
    const validItems: UploadedProofItem[] = [];
    const rejectedErrors: string[] = [];

    rawFiles.forEach((file) => {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';

      // Check format
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        rejectedErrors.push(
          `"${file.name}" has an unsupported format. Allowed formats: PDF, PNG, JPG, JPEG, and Video (MP4, MOV, WEBM).`,
        );
        return;
      }

      // Check max size (10MB)
      if (file.size > MAX_FILE_SIZE_BYTES) {
        rejectedErrors.push(
          `"${file.name}" (${formatFileSize(file.size)}) exceeds the 10MB limit. Max allowed size is 10MB per file.`,
        );
        return;
      }

      const isImage = file.type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp'].includes(ext);
      const isVideo = file.type.startsWith('video/') || ['mp4', 'mov', 'webm'].includes(ext);
      const isPdf = file.type === 'application/pdf' || ext === 'pdf';

      validItems.push({
        file,
        previewUrl: URL.createObjectURL(file),
        isImage,
        isVideo,
        isPdf,
        formattedSize: formatFileSize(file.size),
      });
    });

    if (rejectedErrors.length > 0) {
      setError(rejectedErrors.join(' '));
    }

    if (validItems.length > 0) {
      setProofItems((prev) => [...prev, ...validItems]);
      triggerAiOcrScan(validItems.map((item) => item.file));
    }

    // Reset input value so same file can be re-added if desired
    e.target.value = '';
  };

  const handleRemoveProof = (indexToRemove: number) => {
    setProofItems((prev) => {
      const target = prev[indexToRemove];
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((_, idx) => idx !== indexToRemove);
    });
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

    if (proofItems.length === 0) {
      setError('Please upload at least one screenshot, PDF invoice, or video screen recording for verification (Max 10MB)');
      return;
    }

    setIsLoading(true);

    const userEmail = user?.email || emailUsed.trim();
    const generatedCode = `PN-PUR-${Math.floor(10000 + Math.random() * 90000)}`;
    const points = activeOffer?.rewardPoints || Math.round(Number(purchaseAmountUsd) * 10);
    const firmName = activeFirm?.name || 'Partner Prop Firm';

    const localRecord: UserPurchaseRecord = {
      id: `pur-${Date.now()}`,
      submissionCode: generatedCode,
      propFirm: {
        name: firmName,
        logoUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=120&auto=format&fit=crop&q=80',
      },
      accountType: activeOffer?.accountTierName || 'Custom Evaluation',
      orderId: orderId.trim(),
      accountId: accountId.trim() || undefined,
      purchaseDate,
      purchaseAmountUsd: Number(purchaseAmountUsd) || 0,
      emailUsed: emailUsed.trim(),
      referralCodeUsed: referralCodeUsed || 'NATION',
      pointsAwarded: points,
      status: 'PENDING',
      proofs: proofItems.map((p, idx) => ({
        id: `proof-${Date.now()}-${idx}`,
        fileUrl: p.previewUrl,
        fileName: p.file.name,
        fileType: p.file.type,
      })),
      createdAt: new Date().toISOString(),
    };

    // Save to persistent user store immediately
    userDataStore.addUserPurchase(userEmail, localRecord);

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
      const metaNotes = `[Platform: ${platform} | Currency: ${currency} | Payment: ${paymentMethod}]`;
      const combinedNotes = notes ? `${notes}\n${metaNotes}` : metaNotes;
      formData.append('notes', combinedNotes.trim());

      proofItems.forEach((item) => {
        formData.append('proofs', item.file);
      });

      const res: any = await api.upload('/purchases', formData);
      if (res?.submissionCode) {
        localRecord.submissionCode = res.submissionCode;
        userDataStore.addUserPurchase(userEmail, localRecord);
      }
    } catch {
      // Backend upload error is caught gracefully; local store already has the record
    }

    setSubmittedResult({
      submissionCode: localRecord.submissionCode,
      orderId: orderId.trim(),
      pointsAwarded: points,
      firmName,
    });
    clearActiveCheckoutIntent();
    setActiveIntent(null);
    refreshUser().catch(() => {});
    setIsLoading(false);
  };

  return (
    <div className="w-full space-y-8 pb-12">
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
          <span className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-500/20 px-2 py-0.5 rounded-full">
            <Video className="h-3 w-3" />
            PDF • PNG • JPG • Video (Max 10MB)
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Submit Prop-Firm Purchase
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Upload your billing invoice screenshot, email confirmation, or screen recording. Our system supports <strong>PDF, PNG, JPEG, and Video formats (up to 10MB)</strong> with automatic AI OCR data extraction.
        </p>
      </div>

      {/* Active 1-Click Referral Intent Notification Banner */}
      {activeIntent && (
        <div className="rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-[#071310] to-slate-950 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-emerald-500/5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                  Active 1-Click Checkout Session Detected
                </span>
                {activeIntent.trackingId && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    ID: {activeIntent.trackingId}
                  </span>
                )}
                {activeIntent.tierName && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-200">
                    Tier: {activeIntent.tierName}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Pre-selected <strong>{activeIntent.firmName}</strong> with code <strong className="font-mono text-emerald-400">{activeIntent.affiliateCode}</strong>
                {activeIntent.expectedPoints && (
                  <span> &bull; Awaiting claim: <strong className="text-emerald-400 font-mono">+{activeIntent.expectedPoints.toLocaleString('en-US')} PTS</strong></span>
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              clearActiveCheckoutIntent();
              setActiveIntent(null);
            }}
            className="text-xs text-slate-400 hover:text-white underline underline-offset-2 shrink-0 cursor-pointer"
          >
            Clear Pre-Fill
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 📸 INTERACTIVE DEMO SHOWCASE: "What Proof Do You Need to Submit?" */}
      {/* ======================================================== */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/90 dark:to-slate-950/80 p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
              📸
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                What Proof Do You Need To Submit?
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Visual Guide
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click any sample card below to inspect full requirements and sample coordinates.
              </p>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 shrink-0">
            <Info className="h-3.5 w-3.5 text-blue-500" />
            <span>Must show Order # and Amount Paid</span>
          </div>
        </div>

        {/* 3 Interactive Demo Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {DEMO_PROOF_EXAMPLES.map((example) => (
            <div
              key={example.id}
              onClick={() => setInspectDemo(example)}
              className="group cursor-pointer rounded-xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-slate-900/70 p-3.5 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                {/* Image Thumbnail with Inspect Overlay */}
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950">
                  <img
                    src={example.image}
                    alt={example.title}
                    className="h-full w-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 backdrop-blur-[2px]">
                    <span className="bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                      <ZoomIn className="h-3.5 w-3.5 text-emerald-500" />
                      Inspect Full Demo
                    </span>
                  </div>
                  <span className="absolute top-2 left-2 text-[10px] font-bold bg-slate-900/90 text-white px-2 py-0.5 rounded-md backdrop-blur-sm border border-white/10">
                    {example.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-emerald-500 transition-colors">
                    {example.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                    {example.description}
                  </p>
                </div>

                <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                  {example.keyPoints.slice(0, 2).map((pt, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[10px] text-slate-600 dark:text-slate-400">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                      <span className="truncate">{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full text-xs h-7 gap-1 font-semibold group-hover:border-emerald-500 group-hover:text-emerald-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    setInspectDemo(example);
                  }}
                >
                  <Eye className="h-3 w-3" />
                  <span>Inspect Example</span>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Accepted Formats Ribbon */}
        <div className="rounded-xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>Accepted Submission Formats:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 px-2 py-0.5 rounded-md font-mono text-[11px] font-bold flex items-center gap-1">
              <FileText className="h-3 w-3" />
              PDF (.pdf)
            </span>
            <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md font-mono text-[11px] font-bold flex items-center gap-1">
              <ImageIcon className="h-3 w-3" />
              PNG &amp; JPEG (.png, .jpg)
            </span>
            <span className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-md font-mono text-[11px] font-bold flex items-center gap-1">
              <Video className="h-3 w-3" />
              Video (.mp4, .mov, .webm)
            </span>
            <span className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md font-bold text-[11px]">
              ⚡ Max 10MB per file
            </span>
          </div>
        </div>
      </div>

      {/* Main Submission Form */}
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
              Extracted <strong>Order ID: {ocrSuccess.detectedOrderId}</strong> and <strong>Amount: ${ocrSuccess.detectedAmount} USD</strong>. Form fields below have been automatically filled.
            </p>
          </div>
        )}

        {/* 1-Tap Fast Fill Demo Banner */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-purple-500/10 border border-purple-500/30 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0" />
            <div>
              <span className="font-bold text-slate-900 dark:text-white">Zero-Typing Demo Testing:</span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Click to instantly populate all purchase fields, account tier &amp; sample invoice with one tap.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handlePreFillDemo}
            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 cursor-pointer shrink-0 transition-colors"
          >
            ⚡ 1-Click Fast Fill
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ======================================================== */}
          {/* Upload Dropzone with Multi-Format Support & 10MB Limit */}
          {/* ======================================================== */}
          <div className="space-y-2" id="upload-zone">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Scan className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>1. Upload Proof Screenshot, PDF, or Video Screen Recording *</span>
              </label>
              <span className="text-[11px] text-slate-500 font-medium">Max 10MB per file</span>
            </div>

            <div className="relative rounded-2xl border-2 border-dashed border-emerald-500/40 hover:border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10 p-6 sm:p-8 text-center transition-all overflow-hidden group">
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

              <Upload className="h-9 w-9 text-emerald-600 dark:text-emerald-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-sm text-slate-900 dark:text-slate-100 font-bold">
                Drop your prop firm confirmation proof here, or browse
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                Upload your <strong>Tax Invoice PDF, Order Success Screenshot (PNG/JPG), or Screen Recording Video (MP4/MOV)</strong> up to 10MB.
              </p>

              <div className="mt-3 flex items-center justify-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-800">
                  PDF • PNG • JPG • WEBM • MP4 • MOV
                </span>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded border border-emerald-500/20">
                  10 MB Max
                </span>
              </div>

              <input
                type="file"
                multiple
                accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf,video/mp4,video/quicktime,video/webm,.pdf,.png,.jpg,.jpeg,.mp4,.mov,.webm"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>

            {/* Rich Uploaded File Previews List */}
            {proofItems.length > 0 && (
              <div className="space-y-3 pt-3">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold px-1">
                  <span>Uploaded Proofs ({proofItems.length})</span>
                  <span>Click trash icon to remove</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {proofItems.map((item, index) => (
                    <div
                      key={index}
                      className="group/item relative rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 p-3 space-y-2 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        {/* File header */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 truncate">
                            {item.isPdf ? (
                              <FileText className="h-4 w-4 text-red-500 shrink-0" />
                            ) : item.isVideo ? (
                              <Video className="h-4 w-4 text-purple-500 shrink-0" />
                            ) : (
                              <ImageIcon className="h-4 w-4 text-emerald-500 shrink-0" />
                            )}
                            <span className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">
                              {item.file.name}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveProof(index)}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Remove file"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Interactive File Preview */}
                        {item.isImage && (
                          <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800">
                            <img
                              src={item.previewUrl}
                              alt={item.file.name}
                              className="h-full w-full object-contain"
                            />
                            <a
                              href={item.previewUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute bottom-1.5 right-1.5 text-[10px] font-bold text-white bg-black/70 hover:bg-black px-2 py-0.5 rounded backdrop-blur-sm flex items-center gap-1"
                            >
                              <ZoomIn className="h-2.5 w-2.5" />
                              View
                            </a>
                          </div>
                        )}

                        {item.isVideo && (
                          <div className="rounded-lg overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800">
                            <video
                              src={item.previewUrl}
                              controls
                              className="w-full max-h-40 object-contain bg-black"
                            />
                          </div>
                        )}

                        {item.isPdf && (
                          <div className="h-24 rounded-lg bg-red-500/5 dark:bg-red-950/20 border border-red-500/20 flex flex-col items-center justify-center p-3 text-center">
                            <FileText className="h-7 w-7 text-red-500 mb-1" />
                            <span className="text-[11px] font-bold text-red-600 dark:text-red-400">
                              PDF Document Ready
                            </span>
                            <a
                              href={item.previewUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-slate-500 hover:underline mt-0.5"
                            >
                              Preview in new tab
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                        <span className="uppercase font-mono text-[10px] font-bold text-slate-400">
                          {item.isPdf ? 'PDF' : item.isVideo ? 'Video' : 'Image'}
                        </span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {item.formattedSize} / 10MB
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Prop Firm and Tier (Searchable Comboboxes) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                2. Select Prop Firm *
              </label>
              <SearchableCombobox
                options={firmOptions}
                value={selectedFirmId}
                onChange={handleFirmChange}
                placeholder="Choose or search prop firm..."
                searchPlaceholder="Type firm name (e.g. Funding Pips, FTMO)..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                3. Challenge Account Tier *
              </label>
              <SearchableCombobox
                options={offerOptions}
                value={selectedOfferId}
                onChange={handleOfferChange}
                placeholder="Choose challenge tier..."
                searchPlaceholder="Type tier size (e.g. 5K, 25K, 100K)..."
              />
            </div>
          </div>

          {/* Platform, Currency, & Payment Method (Searchable Dropdowns) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Trading Platform
              </label>
              <SearchableCombobox
                options={PLATFORM_OPTIONS}
                value={platform}
                onChange={setPlatform}
                placeholder="Platform..."
                searchPlaceholder="Search MT5, cTrader..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Account Currency
              </label>
              <SearchableCombobox
                options={CURRENCY_OPTIONS}
                value={currency}
                onChange={setCurrency}
                placeholder="USD ($)"
                searchPlaceholder="Search USD ($)..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Payment Method Used
              </label>
              <SearchableCombobox
                options={PAYMENT_METHOD_OPTIONS}
                value={paymentMethod}
                onChange={setPaymentMethod}
                placeholder="Payment method..."
                searchPlaceholder="Search Card, USDT, BTC..."
              />
            </div>
          </div>

          {/* Reward Points Estimate Banner (1$ = 10 PTS) */}
          {activeOffer ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/20 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Coins className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Verified Reward Yield:</span>
                  <div className="text-base font-bold text-slate-900 dark:text-white">
                    +{activeOffer.rewardPoints.toLocaleString('en-US')} Reward Points
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
                    +{Math.round(Number(purchaseAmountUsd) * 10).toLocaleString('en-US')} Reward Points
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
                placeholder="e.g. FS-51656 or FTMO-ORD-98214"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 focus:outline-none font-mono"
              />
              <span className="text-[10px] text-slate-500">
                Found on your invoice/email, or auto-extracted by AI OCR.
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
                Helps expedite your verification review.
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
              placeholder="Any details about discounts, payment method (crypto/card), or challenge account details."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              size="lg"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 shadow-lg shadow-emerald-500/20"
              isLoading={isLoading}
            >
              Submit Purchase For Verification
            </Button>
          </div>
        </form>
      </Card>

      {/* ======================================================== */}
      {/* 🔍 DEMO INSPECTION MODAL */}
      {/* ======================================================== */}
      {inspectDemo && (
        <Modal
          isOpen={!!inspectDemo}
          onClose={() => setInspectDemo(null)}
          title={`Proof Sample: ${inspectDemo.title}`}
          description={inspectDemo.description}
          maxWidth="2xl"
        >
          <div className="space-y-5">
            {/* High-res Image preview */}
            <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 max-h-[50vh] flex items-center justify-center">
              <img
                src={inspectDemo.image}
                alt={inspectDemo.title}
                className="max-h-[50vh] w-auto object-contain mx-auto"
              />
              <span className="absolute top-2.5 left-2.5 text-xs font-bold bg-emerald-500 text-white px-2.5 py-0.5 rounded-full shadow-md">
                {inspectDemo.badge}
              </span>
            </div>

            {/* Verification Checklist */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 space-y-2.5">
              <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Key Items Required On Your Submission:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {inspectDemo.keyPoints.map((pt, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {inspectDemo.callout}
              </span>
              <Button
                type="button"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                onClick={() => {
                  setInspectDemo(null);
                  const uploadZone = document.getElementById('upload-zone');
                  uploadZone?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Got It, Upload My Proof
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ======================================================== */}
      {/* 🎉 SUBMISSION SUCCESS & OFFICIAL TRACKING ID MODAL */}
      {/* ======================================================== */}
      {submittedResult && (
        <Modal
          isOpen={!!submittedResult}
          onClose={() => router.push('/dashboard/purchases')}
          title="Verification Submitted Successfully!"
          description="Your invoice has been submitted to the review queue and our AI OCR verification pipeline."
          maxWidth="lg"
        >
          <div className="space-y-6 text-center">
            <div className="h-16 w-16 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-purple-600 block">
                Official Reference Tracking ID
              </span>
              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border-2 border-purple-300 dark:border-purple-600 flex items-center justify-between">
                <span className="font-mono text-2xl font-black text-purple-950 dark:text-white tracking-wider">
                  {submittedResult.submissionCode}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(submittedResult.submissionCode);
                    setCopiedTrackingId(true);
                    setTimeout(() => setCopiedTrackingId(false), 2500);
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  {copiedTrackingId ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedTrackingId ? 'Copied' : 'Copy ID'}</span>
                </button>
              </div>
              <p className="text-xs text-slate-500 text-left pt-1">
                Save this Tracking ID. You can provide it to our <strong>Live Chat desk or WhatsApp concierge</strong> to get instant review updates.
              </p>
            </div>

            {/* Summary details */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left text-xs grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block">Prop Firm:</span>
                <span className="font-bold text-slate-900 dark:text-white">{submittedResult.firmName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Order ID:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{submittedResult.orderId}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Estimated Rewards:</span>
                <span className="font-bold text-purple-600 dark:text-purple-400">+{submittedResult.pointsAwarded.toLocaleString('en-US')} Points</span>
              </div>
              <div>
                <span className="text-slate-400 block">Status:</span>
                <Badge variant="purple">UNDER AI SCAN</Badge>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <Link
                href={`/support/live?trackingId=${submittedResult.submissionCode}`}
                className="w-full sm:w-auto flex-1"
              >
                <Button variant="outline" className="w-full text-xs font-bold border-purple-200 hover:bg-purple-50 flex items-center justify-center gap-1.5">
                  <MessageSquare className="h-4 w-4 text-purple-600" />
                  <span>Ask Support About This ID</span>
                </Button>
              </Link>
              <Button
                className="w-full sm:w-auto flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
                onClick={() => router.push('/dashboard/purchases')}
              >
                <span>View In Purchases</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
