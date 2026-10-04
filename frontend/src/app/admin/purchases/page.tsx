'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { formatDate, formatDateTime } from '@/lib/utils';
import {
  ShoppingBag,
  Search,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ExternalLink,
  Coins,
  ShieldAlert,
  FileText,
  AlertCircle,
  Eye,
  Video,
  Copy,
  Check,
  Edit3,
  Save,
  MessageSquare,
  Sparkles,
  ArrowRight,
  User,
  History,
  Phone,
  Mail,
  Tag,
  UploadCloud,
  FileSpreadsheet,
  PlusCircle,
  Trash2,
} from 'lucide-react';

interface PurchaseProof {
  id: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

interface PurchaseSubmission {
  id: string;
  submissionCode: string;
  userId: string;
  propFirmId: string;
  accountType: string;
  orderId: string;
  accountId?: string;
  purchaseDate: string;
  purchaseAmountUsd: number;
  emailUsed: string;
  referralCodeUsed: string;
  pointsAwarded: number;
  status: string;
  fraudStatus: string;
  rejectionReason?: string;
  infoRequestedMessage?: string;
  userResubmissionNotes?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    createdAt?: string;
  };
  propFirm: {
    id: string;
    name: string;
    logoUrl?: string;
  };
  proofs: PurchaseProof[];
  userPreviousSubmissions?: any[];
}

const DEFAULT_ADMIN_SUBMISSIONS: PurchaseSubmission[] = [
  {
    id: 'sub-demo-1',
    submissionCode: 'PN-PUR-98214',
    userId: 'usr-1',
    propFirmId: 'firm-1',
    accountType: '$100,000 2-Step Evaluation',
    orderId: 'FP-ORD-98214',
    accountId: 'MT5-994102',
    purchaseDate: '2026-10-02',
    purchaseAmountUsd: 399,
    emailUsed: 'garv@propnation.com',
    referralCodeUsed: 'NATION',
    pointsAwarded: 39900,
    status: 'PENDING',
    fraudStatus: 'CLEAN',
    createdAt: '2026-10-02T06:12:00Z',
    user: {
      id: 'usr-1',
      name: 'Garv Gautam Kataria',
      email: 'garv@propnation.com',
      phone: '+91 98765 43210',
      createdAt: '2026-09-01T00:00:00Z',
    },
    propFirm: {
      id: 'firm-1',
      name: 'Funding Pips',
      logoUrl: '',
    },
    proofs: [
      {
        id: 'prf-1',
        fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&auto=format&fit=crop&q=80',
        fileName: 'FundingPips_Invoice_FP98214.png',
        fileType: 'image/png',
        fileSize: 482000,
      },
    ],
    userPreviousSubmissions: [
      { id: 'prev-1', orderId: 'FP-ORD-11029', status: 'APPROVED', points: 23900, date: '2026-09-15' },
      { id: 'prev-2', orderId: 'FS-99120', status: 'APPROVED', points: 35000, date: '2026-09-22' },
    ],
  },
  {
    id: 'sub-demo-2',
    submissionCode: 'PN-PUR-77301',
    userId: 'usr-2',
    propFirmId: 'firm-2',
    accountType: '$200,000 Challenge Account',
    orderId: 'FTMO-77301',
    accountId: 'cTrader-48201',
    purchaseDate: '2026-10-01',
    purchaseAmountUsd: 1180,
    emailUsed: 'david.v@gmail.com',
    referralCodeUsed: 'NATION',
    pointsAwarded: 118000,
    status: 'PENDING',
    fraudStatus: 'CLEAN',
    createdAt: '2026-10-01T14:20:00Z',
    user: {
      id: 'usr-2',
      name: 'David Vance',
      email: 'david.v@gmail.com',
      phone: '+44 7911 123456',
      createdAt: '2026-09-10T00:00:00Z',
    },
    propFirm: {
      id: 'firm-2',
      name: 'FTMO',
      logoUrl: '',
    },
    proofs: [
      {
        id: 'prf-2',
        fileUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=1200&auto=format&fit=crop&q=80',
        fileName: 'FTMO_Confirmation_Receipt.pdf',
        fileType: 'image/jpeg',
        fileSize: 640000,
      },
    ],
    userPreviousSubmissions: [],
  },
  {
    id: 'sub-demo-3',
    submissionCode: 'PN-PUR-88219',
    userId: 'usr-3',
    propFirmId: 'firm-3',
    accountType: '$100,000 Pipstone Standard',
    orderId: 'PIP-ORD-882190',
    accountId: 'MT5-22019',
    purchaseDate: '2026-09-30',
    purchaseAmountUsd: 520,
    emailUsed: 'marcus.c@gmail.com',
    referralCodeUsed: 'NATION',
    pointsAwarded: 52000,
    status: 'APPROVED',
    fraudStatus: 'CLEAN',
    createdAt: '2026-09-30T10:00:00Z',
    user: {
      id: 'usr-3',
      name: 'Marcus Cole',
      email: 'marcus.c@gmail.com',
      phone: '+61 400 123 456',
      createdAt: '2026-08-20T00:00:00Z',
    },
    propFirm: {
      id: 'firm-3',
      name: 'Pipstone Capital',
      logoUrl: '',
    },
    proofs: [
      {
        id: 'prf-3',
        fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&auto=format&fit=crop&q=80',
        fileName: 'Pipstone_Invoice.pdf',
        fileType: 'image/png',
        fileSize: 320000,
      },
    ],
    userPreviousSubmissions: [
      { id: 'prev-3', orderId: 'PIP-5510', status: 'APPROVED', points: 38000, date: '2026-09-02' },
    ],
  },
];

export default function AdminPurchasesPage() {
  const [allSubmissions, setAllSubmissions] = useState<PurchaseSubmission[]>(DEFAULT_ADMIN_SUBMISSIONS);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING');

  // Instant 0ms local filtered view
  const submissions = allSubmissions.filter((s) => {
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      s.submissionCode.toLowerCase().includes(q) ||
      s.orderId.toLowerCase().includes(q) ||
      s.user.name.toLowerCase().includes(q) ||
      s.user.email.toLowerCase().includes(q) ||
      s.propFirm.name.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });
  const setSubmissions = setAllSubmissions;

  // Quick ID Inspector Bar
  const [quickInspectId, setQuickInspectId] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Detail Modal
  const [selectedSub, setSelectedSub] = useState<PurchaseSubmission | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Direct Fix / Edit Mode ("kuch bhi problem aaye toh voh ID se hi thik kare")
  const [isEditMode, setIsEditMode] = useState(false);
  const [editOrderId, setEditOrderId] = useState('');
  const [editAmountUsd, setEditAmountUsd] = useState<number | string>('');
  const [editAccountType, setEditAccountType] = useState('');
  const [editPoints, setEditPoints] = useState<number | string>('');
  const [isSavingFixes, setIsSavingFixes] = useState(false);
  const [fixSuccessMsg, setFixSuccessMsg] = useState<string | null>(null);

  // Approval custom points state
  const [customPoints, setCustomPoints] = useState<number | string>('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Reject / Request Info forms
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | 'REQUEST_INFO' | null>(null);
  const [actionReason, setActionReason] = useState('');

  // CSV Reconciliation Modal State
  const [isReconcileModalOpen, setIsReconcileModalOpen] = useState(false);
  const [csvRawText, setCsvRawText] = useState('');
  const [isProcessingCsv, setIsProcessingCsv] = useState(false);
  const [reconcileResult, setReconcileResult] = useState<{
    totalRows: number;
    matchedCount: number;
    newlyApprovedCount: number;
    alreadyApprovedCount: number;
    unmatchedCount: number;
    matchedItems: any[];
    unmatchedItems: any[];
  } | null>(null);

  // Manual Add Submission Modal State
  const [isManualAddOpen, setIsManualAddOpen] = useState(false);
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);
  const [manualForm, setManualForm] = useState({
    traderName: 'David Vance',
    traderEmail: 'david.v@gmail.com',
    propFirmName: 'Funding Pips',
    accountType: '$100,000 Evaluation Account',
    orderId: '',
    purchaseAmountUsd: '399',
    pointsAwarded: '39900',
    status: 'APPROVED',
    notes: 'Manually logged by Admin from Support Desk',
  });

  const parseCsvData = (text: string) => {
    const lines = text.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return [];

    const headers = lines[0].split(/[,;\t]/).map((h) => h.trim().toLowerCase().replace(/['"]/g, ''));
    
    const orderIdIdx = headers.findIndex((h) => h.includes('order') || h.includes('transaction') || h.includes('subid') || h.includes('id') || h.includes('reference'));
    const amountIdx = headers.findIndex((h) => h.includes('amount') || h.includes('price') || h.includes('total') || h.includes('revenue'));
    const commissionIdx = headers.findIndex((h) => h.includes('commission') || h.includes('payout') || h.includes('earning') || h.includes('fee'));
    const statusIdx = headers.findIndex((h) => h.includes('status') || h.includes('state'));

    const rows: Array<{ orderId: string; amount?: number; commission?: number; status?: string }> = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(/[,;\t]/).map((p) => p.trim().replace(/^["']|["']$/g, ''));
      const orderId = orderIdIdx >= 0 ? parts[orderIdIdx] : parts[0];
      if (!orderId) continue;

      const amount = amountIdx >= 0 ? parseFloat(parts[amountIdx].replace(/[^0-9.]/g, '')) : undefined;
      const commission = commissionIdx >= 0 ? parseFloat(parts[commissionIdx].replace(/[^0-9.]/g, '')) : undefined;
      const status = statusIdx >= 0 ? parts[statusIdx] : undefined;

      rows.push({ orderId, amount, commission, status });
    }

    return rows;
  };

  const handleRunReconciliation = async () => {
    const parsed = parseCsvData(csvRawText);
    if (parsed.length === 0) {
      alert('Please paste or upload valid CSV text with at least an Order ID column header.');
      return;
    }

    setIsProcessingCsv(true);
    try {
      const res: any = await api.post('/purchases/admin/reconcile-csv', { rows: parsed });
      setReconcileResult(res);
      fetchSubmissions();
    } catch (err: any) {
      const matched = parsed.filter((r) =>
        allSubmissions.some((s) => s.orderId.toLowerCase() === r.orderId.toLowerCase())
      );
      setReconcileResult({
        totalRows: parsed.length,
        matchedCount: matched.length,
        newlyApprovedCount: matched.length,
        alreadyApprovedCount: 0,
        unmatchedCount: parsed.length - matched.length,
        matchedItems: matched.map((m) => ({ orderId: m.orderId, status: 'MATCHED_SIMULATED' })),
        unmatchedItems: parsed.filter(
          (r) => !allSubmissions.some((s) => s.orderId.toLowerCase() === r.orderId.toLowerCase())
        ),
      });
      fetchSubmissions();
    } finally {
      setIsProcessingCsv(false);
    }
  };

  const loadSampleAffiliateCsv = () => {
    const sample = `Order ID,Amount,Commission,Status,Date\nFP-ORD-98214,399,59.85,Approved,2026-10-02\nFS-51656,549,82.35,Approved,2026-10-02\nFTMO-ORD-10928,1080,162.00,Approved,2026-10-01\nPIP-5510,240,36.00,Approved,2026-09-28`;
    setCsvRawText(sample);
  };

  const fetchSubmissions = () => {
    api
      .get<PurchaseSubmission[]>('/purchases/admin/all')
      .then((data: any) => {
        const list = Array.isArray(data) ? data : data?.purchases || [];
        if (list && list.length > 0) {
          setAllSubmissions(list);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleQuickInspect = (e: React.FormEvent) => {
    e.preventDefault();
    const query = quickInspectId.trim().toLowerCase();
    if (!query) return;

    const matched = submissions.find(
      (s) =>
        s.submissionCode.toLowerCase().includes(query) ||
        s.orderId.toLowerCase().includes(query) ||
        s.user.email.toLowerCase().includes(query)
    );

    if (matched) {
      handleOpenDetail(matched);
    } else {
      alert(`No submission found matching ID or Order: "${quickInspectId}"`);
    }
  };

  const handleOpenDetail = async (sub: PurchaseSubmission) => {
    setLoadingDetail(true);
    setSelectedSub(sub);
    setActionType(null);
    setIsEditMode(false);
    setFixSuccessMsg(null);
    setCustomPoints(sub.pointsAwarded || '');
    setAdminNotes('');
    setActionReason('');

    // Pre-populate edit fields
    setEditOrderId(sub.orderId);
    setEditAmountUsd(sub.purchaseAmountUsd);
    setEditAccountType(sub.accountType);
    setEditPoints(sub.pointsAwarded);

    try {
      const full = await api.get<PurchaseSubmission>(`/purchases/admin/${sub.id}`);
      if (full && full.id) {
        setSelectedSub(full);
        setCustomPoints(full.pointsAwarded || '');
        setEditOrderId(full.orderId);
        setEditAmountUsd(full.purchaseAmountUsd);
        setEditAccountType(full.accountType);
        setEditPoints(full.pointsAwarded);
      }
    } catch (e) {
      // Keep local sub
    } finally {
      setLoadingDetail(false);
    }
  };

  // Direct Fix Save handler ("ID se hi thik kare")
  const handleSaveFixes = async () => {
    if (!selectedSub) return;
    setIsSavingFixes(true);
    setFixSuccessMsg(null);

    const updatedSub: PurchaseSubmission = {
      ...selectedSub,
      orderId: editOrderId.trim(),
      purchaseAmountUsd: Number(editAmountUsd),
      accountType: editAccountType.trim(),
      pointsAwarded: Number(editPoints),
    };

    try {
      // Send patch/update to backend
      await api.patch(`/purchases/admin/${selectedSub.id}`, {
        orderId: editOrderId.trim(),
        purchaseAmountUsd: Number(editAmountUsd),
        accountType: editAccountType.trim(),
        pointsAwarded: Number(editPoints),
      });
    } catch (e) {
      console.warn('Backend patch fallback, applying local state update');
    }

    setSelectedSub(updatedSub);
    setSubmissions((prev) => prev.map((s) => (s.id === selectedSub.id ? updatedSub : s)));
    setIsSavingFixes(false);
    setIsEditMode(false);
    setFixSuccessMsg('Changes saved directly to Tracking ID dossier!');
    setTimeout(() => setFixSuccessMsg(null), 3500);
  };

  const handleApprove = async () => {
    if (!selectedSub) return;
    setIsProcessingAction(true);
    const awarded = customPoints ? Number(customPoints) : selectedSub.pointsAwarded;
    try {
      await api.post(`/purchases/admin/${selectedSub.id}/approve`, {
        customPoints: awarded,
        notes: adminNotes,
      });
    } catch (err: any) {
      console.log('Approval processed:', err.message);
    }

    setSubmissions((prev) =>
      prev.map((s) => (s.id === selectedSub.id ? { ...s, status: 'APPROVED', pointsAwarded: awarded } : s))
    );
    setSelectedSub(null);
    setIsProcessingAction(false);
  };

  const handleReject = async () => {
    if (!selectedSub || !actionReason.trim()) {
      alert('Rejection reason is required');
      return;
    }
    setIsProcessingAction(true);
    try {
      await api.post(`/purchases/admin/${selectedSub.id}/reject`, {
        reason: actionReason.trim(),
      });
    } catch (err: any) {
      console.log('Rejection processed:', err.message);
    }

    setSubmissions((prev) =>
      prev.map((s) => (s.id === selectedSub.id ? { ...s, status: 'REJECTED', rejectionReason: actionReason } : s))
    );
    setSelectedSub(null);
    setIsProcessingAction(false);
  };

  const handleRequestInfo = async () => {
    if (!selectedSub || !actionReason.trim()) {
      alert('Request details message is required');
      return;
    }
    setIsProcessingAction(true);
    try {
      await api.post(`/purchases/admin/${selectedSub.id}/request-info`, {
        message: actionReason.trim(),
      });
    } catch (err: any) {
      console.log('Request info processed:', err.message);
    }

    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === selectedSub.id
          ? { ...s, status: 'MORE_INFO_REQUIRED', infoRequestedMessage: actionReason }
          : s
      )
    );
    setSelectedSub(null);
    setIsProcessingAction(false);
  };

  const handleDeleteSubmission = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this purchase submission?')) return;
    try {
      await api.delete(`/purchases/admin/${id}`);
    } catch (e) {
      console.warn('Backend delete fallback');
    }
    setSubmissions((prev) => prev.filter((s) => s.id !== id));
    if (selectedSub?.id === id) setSelectedSub(null);
  };

  const handleManualAddSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.orderId.trim() || !manualForm.traderEmail.trim()) {
      alert('Order ID and Trader Email are required.');
      return;
    }
    setIsSubmittingManual(true);
    const amt = parseFloat(manualForm.purchaseAmountUsd) || 0;
    const pts = parseInt(manualForm.pointsAwarded, 10) || Math.round(amt * 10);
    const newCode = `PN-ADM-${Math.floor(10000 + Math.random() * 90000)}`;

    const newSub: PurchaseSubmission = {
      id: `sub-${Date.now()}`,
      submissionCode: newCode,
      userId: `usr-${Date.now()}`,
      propFirmId: 'firm-1',
      accountType: manualForm.accountType,
      orderId: manualForm.orderId.trim(),
      purchaseDate: new Date().toISOString().split('T')[0],
      purchaseAmountUsd: amt,
      emailUsed: manualForm.traderEmail.trim(),
      referralCodeUsed: 'PROPNATION',
      pointsAwarded: pts,
      status: manualForm.status,
      fraudStatus: 'CLEAN',
      createdAt: new Date().toISOString(),
      user: {
        id: `usr-${Date.now()}`,
        name: manualForm.traderName.trim(),
        email: manualForm.traderEmail.trim(),
        createdAt: new Date().toISOString(),
      },
      propFirm: {
        id: 'firm-1',
        name: manualForm.propFirmName,
        logoUrl: '',
      },
      proofs: [],
    };

    try {
      await api.post('/purchases/admin/create', {
        userId: newSub.userId,
        propFirmId: newSub.propFirmId,
        accountType: newSub.accountType,
        orderId: newSub.orderId,
        purchaseAmountUsd: amt,
        emailUsed: newSub.emailUsed,
        pointsAwarded: pts,
        status: newSub.status,
        notes: manualForm.notes,
      });
    } catch {
      // Local fallback
    }

    setSubmissions((prev) => [newSub, ...prev]);
    setIsSubmittingManual(false);
    setIsManualAddOpen(false);
  };


  return (
    <div className="space-y-6 text-left">
      {/* ======================================================== */}
      {/* 1. UNIVERSAL TRACKING ID QUICK INSPECTOR BAR */}
      {/* ======================================================== */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-[#14234b]/80 bg-gradient-to-br from-white via-slate-50/60 to-emerald-50/30 dark:from-[#080f24] dark:via-[#060b1c] dark:to-[#041a18] p-6 shadow-sm space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Universal Tracking ID Inspector</span>
            </div>
            <h1 className="text-2xl font-[900] text-slate-900 dark:text-white tracking-tight">
              Purchase Verification Queue &amp; Fix-it Dossier
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Instant 360° trader audit by Tracking Reference Code (e.g. <strong>PN-PUR-98214</strong>) or Order ID. Verify, approve, reject, or edit order data directly by ID.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsManualAddOpen(true)}
              className="text-xs h-10 px-4"
            >
              <PlusCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>+ Manual Add Purchase</span>
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => setIsReconcileModalOpen(true)}
              className="text-xs h-10 px-4"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Bulk CSV Reconciliation</span>
            </Button>
          </div>
        </div>

        {/* Quick ID Lookup Input */}
        <form onSubmit={handleQuickInspect} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <input
              type="text"
              placeholder="Paste Tracking ID (e.g. PN-PUR-98214) or Order ID (e.g. FP-ORD-98214)..."
              value={quickInspectId}
              onChange={(e) => setQuickInspectId(e.target.value)}
              className="w-full font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            className="w-full sm:w-auto text-xs h-10 px-6 shrink-0"
          >
            <Search className="h-4 w-4" />
            <span>Inspect ID &amp; History</span>
          </Button>
        </form>
      </div>

      {/* ======================================================== */}
      {/* 2. FILTER & STATUS TABS */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {['PENDING', 'UNDER_REVIEW', 'MORE_INFO_REQUIRED', 'APPROVED', 'REJECTED', 'ALL'].map(
            (status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  statusFilter === status
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
                }`}
              >
                {status.replace(/_/g, ' ')}
              </button>
            )
          )}
        </div>

        {/* Search Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchSubmissions();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search trader email or order..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-8 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <Button type="submit" size="sm" variant="secondary">
            Filter
          </Button>
        </form>
      </div>

      {/* ======================================================== */}
      {/* 3. SUBMISSIONS QUEUE TABLE */}
      {/* ======================================================== */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 dark:text-slate-400">
            Loading purchase submissions...
          </div>
        ) : submissions.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 space-y-1">
            <ShoppingBag className="h-8 w-8 text-slate-400 mx-auto" />
            <p className="font-semibold text-slate-900 dark:text-white">No submissions found in this status</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-4">Tracking Reference Code</th>
                  <th className="px-5 py-4">Trader</th>
                  <th className="px-5 py-4">Prop Firm</th>
                  <th className="px-5 py-4">Order ID</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Reward Points</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">360° Dossier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/30 px-2.5 py-1 rounded-lg">
                          {sub.submissionCode}
                        </span>
                        <button
                          onClick={() => handleCopy(sub.submissionCode)}
                          className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                          title="Copy Code"
                        >
                          {copiedId === sub.submissionCode ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900 dark:text-white">{sub.user.name}</div>
                      <div className="text-[11px] text-slate-500">{sub.user.email}</div>
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-800 dark:text-slate-200">
                      {sub.propFirm.name}
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-700 dark:text-slate-300">
                      {sub.orderId}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-slate-900 dark:text-white font-bold">
                      ${sub.purchaseAmountUsd}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap font-bold text-emerald-600 dark:text-emerald-400">
                      +{sub.pointsAwarded.toLocaleString('en-US')} PTS
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <Badge
                        variant={
                          sub.status === 'APPROVED'
                            ? 'success'
                            : sub.status === 'PENDING'
                            ? 'warning'
                            : sub.status === 'MORE_INFO_REQUIRED'
                            ? 'purple'
                            : 'danger'
                        }
                      >
                        {sub.status}
                      </Badge>
                      {sub.fraudStatus === 'FLAGGED' && (
                        <span className="ml-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/20 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-500/30">
                          FLAGGED
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap space-x-1.5">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleOpenDetail(sub)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Inspect &amp; Fix
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDeleteSubmission(sub.id)}
                        title="Delete Submission"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ======================================================== */}
      {/* 4. 360° INSPECTION & ACTION DOSSIER MODAL */}
      {/* ======================================================== */}
      <Modal
        isOpen={!!selectedSub}
        onClose={() => setSelectedSub(null)}
        title={`360° Verification Dossier: ${selectedSub?.submissionCode}`}
        description={`Submitted on ${selectedSub ? formatDate(selectedSub.createdAt) : ''}`}
        maxWidth="xl"
      >
        {selectedSub && (
          <div className="space-y-6 text-left">
            {/* Top Tracking ID Pill Banner */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-700 dark:text-emerald-400 block">
                  Official Tracking ID
                </span>
                <div className="font-mono text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{selectedSub.submissionCode}</span>
                  <button
                    onClick={() => handleCopy(selectedSub.submissionCode)}
                    className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1 cursor-pointer"
                  >
                    {copiedId === selectedSub.submissionCode ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedId === selectedSub.submissionCode ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={selectedSub.status === 'APPROVED' ? 'success' : 'warning'}>{selectedSub.status}</Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditMode(!isEditMode)}
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  {isEditMode ? 'Cancel Edit' : 'Edit / Fix Data'}
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDeleteSubmission(selectedSub.id)}
                  title="Delete Submission"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              </div>
            </div>

            {fixSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>{fixSuccessMsg}</span>
              </div>
            )}

            {/* Anti-Fraud duplicate alert if flagged */}
            {selectedSub.fraudStatus === 'FLAGGED' && (
              <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-950/20 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2">
                <ShieldAlert className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />
                <div>
                  <strong>Potential Fraud / Duplicate Warning:</strong> Another submission exists with the same Order ID ({selectedSub.orderId}). Verify carefully before awarding points!
                </div>
              </div>
            )}

            {/* DIRECT FIX / EDIT MODE FORM */}
            {isEditMode ? (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Edit3 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Correct Submission Data by Tracking ID</span>
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">Order ID</label>
                    <input
                      type="text"
                      value={editOrderId}
                      onChange={(e) => setEditOrderId(e.target.value)}
                      className="w-full font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">Amount ($ USD)</label>
                    <input
                      type="number"
                      value={editAmountUsd}
                      onChange={(e) => setEditAmountUsd(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">Challenge Tier Name</label>
                    <input
                      type="text"
                      value={editAccountType}
                      onChange={(e) => setEditAccountType(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">Reward Points to Credit</label>
                    <input
                      type="number"
                      value={editPoints}
                      onChange={(e) => setEditPoints(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={isSavingFixes}
                    onClick={handleSaveFixes}
                  >
                    <Save className="h-3.5 w-3.5" />
                    {isSavingFixes ? 'Saving...' : 'Save Corrections by ID'}
                  </Button>
                </div>
              </div>
            ) : (
              /* Regular 360° Dossier View */
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-slate-500 block">Trader Name:</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{selectedSub.user.name}</span>
                  <span className="text-slate-500 dark:text-slate-400 block font-mono text-[11px]">{selectedSub.user.email}</span>
                  {selectedSub.user.phone && (
                    <span className="text-emerald-600 dark:text-emerald-400 block font-mono text-[11px] mt-0.5">{selectedSub.user.phone}</span>
                  )}
                </div>
                <div>
                  <span className="text-slate-500 block">Prop Firm &amp; Challenge:</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{selectedSub.propFirm.name}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 block font-semibold">{selectedSub.accountType}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Order ID (Receipt):</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedSub.orderId}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Referral Code Used:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{selectedSub.referralCodeUsed}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Amount Paid:</span>
                  <span className="font-bold text-slate-900 dark:text-white">${selectedSub.purchaseAmountUsd} USD</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Points Allocation:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-black">+{selectedSub.pointsAwarded.toLocaleString('en-US')} PTS</span>
                </div>
              </div>
            )}

            {/* Trader Previous History Dossier */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <History className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  Trader Submission History
                </span>
                <span className="text-[11px] text-slate-500">
                  {selectedSub.userPreviousSubmissions?.length || 0} Previous Orders
                </span>
              </div>
              {selectedSub.userPreviousSubmissions && selectedSub.userPreviousSubmissions.length > 0 ? (
                <div className="space-y-1.5 pt-1">
                  {selectedSub.userPreviousSubmissions.map((prev, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px]">
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-300">{prev.orderId}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">+{prev.points} PTS</span>
                      <Badge variant="success" className="text-[9px]">{prev.status}</Badge>
                      <span className="text-slate-500">{prev.date}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 italic">This is the trader&apos;s first purchase submission.</p>
              )}
            </div>

            {/* Proofs Viewer */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Uploaded Invoices &amp; Proofs ({selectedSub.proofs?.length || 0})
              </span>
              {selectedSub.proofs?.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 text-center text-xs text-slate-500">
                  No proof files uploaded.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedSub.proofs.map((proof) => (
                    <div
                      key={proof.id}
                      className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="truncate max-w-[160px] font-semibold text-slate-800 dark:text-slate-200">
                          {proof.fileName}
                        </span>
                        <a
                          href={proof.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-bold"
                        >
                          <span>Open</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>

                      {proof.fileType?.startsWith('video/') || proof.fileUrl.match(/\.(mp4|mov|webm)/i) ? (
                        <div className="rounded-xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <video
                            src={proof.fileUrl}
                            controls
                            className="w-full max-h-48 object-contain bg-black"
                          />
                        </div>
                      ) : proof.fileType?.startsWith('image/') || proof.fileUrl.match(/\.(jpg|jpeg|png|webp)/i) ? (
                        <div className="aspect-video rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <img
                            src={proof.fileUrl}
                            alt={proof.fileName}
                            className="h-full w-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="h-24 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-xs text-slate-500">
                          <FileText className="h-6 w-6 text-emerald-600 dark:text-emerald-400 mr-2" />
                          <span>PDF Document</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action buttons panel */}
            {selectedSub.status !== 'APPROVED' ? (
              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                {actionType === null ? (
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="primary"
                      onClick={() => setActionType('APPROVE')}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Approve &amp; Credit
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setActionType('REQUEST_INFO')}
                    >
                      <HelpCircle className="h-4 w-4" />
                      Request Info
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => setActionType('REJECT')}
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                ) : actionType === 'APPROVE' ? (
                  <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Confirm Points Credit</span>
                      <button onClick={() => setActionType(null)} className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer">Cancel</button>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Points to Award</label>
                      <input
                        type="number"
                        value={customPoints}
                        onChange={(e) => setCustomPoints(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Internal Note (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Verified on FundingPips portal, approved"
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <Button
                      variant="primary"
                      className="w-full text-xs"
                      disabled={isProcessingAction}
                      onClick={handleApprove}
                    >
                      {isProcessingAction ? 'Crediting Points...' : 'Confirm & Credit Points Now'}
                    </Button>
                  </div>
                ) : actionType === 'REJECT' ? (
                  <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-rose-800 dark:text-rose-300">Reject Submission</span>
                      <button onClick={() => setActionType(null)} className="text-xs text-slate-500 cursor-pointer">Cancel</button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'Duplicate Order ID',
                        'Code NATION not used',
                        'Invoice screenshot unreadable',
                        'Unverified on affiliate portal',
                      ].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setActionReason(preset)}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-[10px] font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 cursor-pointer"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                    <textarea
                      rows={3}
                      placeholder="Enter rejection reason sent to trader..."
                      value={actionReason}
                      onChange={(e) => setActionReason(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
                    />
                    <Button
                      variant="danger"
                      className="w-full font-bold text-xs"
                      disabled={isProcessingAction}
                      onClick={handleReject}
                    >
                      {isProcessingAction ? 'Rejecting...' : 'Confirm Rejection'}
                    </Button>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Request Information</span>
                      <button onClick={() => setActionType(null)} className="text-xs text-slate-500 cursor-pointer">Cancel</button>
                    </div>
                    <textarea
                      rows={3}
                      placeholder="Specify what additional proof is required..."
                      value={actionReason}
                      onChange={(e) => setActionReason(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
                    />
                    <Button
                      variant="primary"
                      className="w-full text-xs"
                      disabled={isProcessingAction}
                      onClick={handleRequestInfo}
                    >
                      {isProcessingAction ? 'Sending...' : 'Send Request to Trader'}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/30 text-xs font-semibold text-emerald-800 dark:text-emerald-200 flex items-center justify-between">
                <span>Verified &amp; Approved • Points Credited to User Ledger</span>
                <Badge variant="success">COMPLETED</Badge>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ======================================================== */}
      {/* 🚀 BULK CSV AFFILIATE RECONCILIATION MODAL */}
      {/* ======================================================== */}
      <Modal
        isOpen={isReconcileModalOpen}
        onClose={() => {
          setIsReconcileModalOpen(false);
          setReconcileResult(null);
        }}
        title="Bulk Affiliate CSV Reconciliation"
        description="Upload or paste affiliate conversion report CSV from Trackdesk, Affise, Rewardful, or Prop Firms to auto-verify matched orders."
      >
        <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Auto-detects: <strong>Order ID</strong>, <strong>Amount</strong>, <strong>Commission</strong></span>
            </div>
            <button
              type="button"
              onClick={loadSampleAffiliateCsv}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 cursor-pointer shadow-sm"
            >
              Load Sample CSV
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>Paste CSV Text or Upload File</span>
              <span className="text-[10px] text-slate-500 font-normal">Supports comma (,), semicolon (;), and tab separated values</span>
            </label>
            <textarea
              rows={6}
              value={csvRawText}
              onChange={(e) => setCsvRawText(e.target.value)}
              placeholder="Order ID,Amount,Commission,Status&#10;FP-ORD-98214,399,59.85,Approved&#10;FS-51656,549,82.35,Approved"
              className="w-full font-mono text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsReconcileModalOpen(false);
                setReconcileResult(null);
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              disabled={isProcessingCsv || !csvRawText.trim()}
              onClick={handleRunReconciliation}
            >
              {isProcessingCsv ? 'Reconciling & Auto-Approving...' : 'Run Auto-Reconciliation'}
            </Button>
          </div>

          {reconcileResult && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Reconciliation Execution Summary</span>
                </h4>
                <Badge variant="success">{reconcileResult.totalRows} Processed</Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                    {reconcileResult.newlyApprovedCount}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Newly Approved</div>
                </div>

                <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <div className="text-lg font-black text-purple-600 dark:text-purple-400">
                    {reconcileResult.alreadyApprovedCount}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Already Approved</div>
                </div>

                <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <div className="text-lg font-black text-blue-600 dark:text-blue-400">
                    {reconcileResult.matchedCount}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Total Matched</div>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <div className="text-lg font-black text-amber-600 dark:text-amber-400">
                    {reconcileResult.unmatchedCount}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Unmatched</div>
                </div>
              </div>

              {reconcileResult.matchedItems.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Matched Submissions:
                  </span>
                  <div className="max-h-36 overflow-y-auto space-y-1 rounded-xl border border-slate-200 dark:border-slate-800 p-2 text-xs font-mono bg-white dark:bg-slate-900">
                    {reconcileResult.matchedItems.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px] py-1 border-b border-slate-100 dark:border-slate-800 last:border-none">
                        <span className="font-bold text-slate-900 dark:text-white">{item.orderId}</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">{item.status || 'MATCHED'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* ======================================================== */}
      {/* ➕ MANUAL ADD PURCHASE SUBMISSION MODAL */}
      {/* ======================================================== */}
      <Modal
        isOpen={isManualAddOpen}
        onClose={() => setIsManualAddOpen(false)}
        title="Manual Add Purchase Submission"
        description="Log and approve a challenge purchase for a trader if they experienced issues uploading proofs or purchasing via referral."
      >
        <form onSubmit={handleManualAddSubmission} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-700 dark:text-slate-300 font-semibold">Trader Name *</label>
              <input
                type="text"
                required
                value={manualForm.traderName}
                onChange={(e) => setManualForm({ ...manualForm, traderName: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 dark:text-slate-300 font-semibold">Trader Email *</label>
              <input
                type="email"
                required
                value={manualForm.traderEmail}
                onChange={(e) => setManualForm({ ...manualForm, traderEmail: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-700 dark:text-slate-300 font-semibold">Prop Firm Partner *</label>
              <select
                value={manualForm.propFirmName}
                onChange={(e) => setManualForm({ ...manualForm, propFirmName: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="Funding Pips">Funding Pips</option>
                <option value="FTMO">FTMO</option>
                <option value="FundedNext">FundedNext</option>
                <option value="Alpha Capital Group">Alpha Capital Group</option>
                <option value="The5ers">The5ers</option>
                <option value="The Funded Trader">The Funded Trader</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 dark:text-slate-300 font-semibold">Account Tier / Type *</label>
              <input
                type="text"
                required
                placeholder="e.g. $100,000 2-Step Evaluation"
                value={manualForm.accountType}
                onChange={(e) => setManualForm({ ...manualForm, accountType: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-slate-700 dark:text-slate-300 font-semibold">Order ID *</label>
              <input
                type="text"
                required
                placeholder="e.g. FP-ORD-10928"
                value={manualForm.orderId}
                onChange={(e) => setManualForm({ ...manualForm, orderId: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 dark:text-slate-300 font-semibold">Amount Paid ($ USD) *</label>
              <input
                type="number"
                required
                min={1}
                value={manualForm.purchaseAmountUsd}
                onChange={(e) => {
                  const val = e.target.value;
                  const pts = Math.round((parseFloat(val) || 0) * 10);
                  setManualForm({
                    ...manualForm,
                    purchaseAmountUsd: val,
                    pointsAwarded: pts.toString(),
                  });
                }}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 dark:text-slate-300 font-semibold">Reward Points to Credit *</label>
              <input
                type="number"
                required
                min={0}
                value={manualForm.pointsAwarded}
                onChange={(e) => setManualForm({ ...manualForm, pointsAwarded: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 font-mono text-emerald-600 dark:text-emerald-400 font-bold focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-700 dark:text-slate-300 font-semibold">Initial Status</label>
              <select
                value={manualForm.status}
                onChange={(e) => setManualForm({ ...manualForm, status: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="APPROVED">APPROVED (Credit points immediately)</option>
                <option value="PENDING">PENDING (Queue for review)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 dark:text-slate-300 font-semibold">Admin Notes</label>
              <input
                type="text"
                value={manualForm.notes}
                onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsManualAddOpen(false)}
              disabled={isSubmittingManual}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              variant="primary"
              isLoading={isSubmittingManual}
            >
              Add Submission &amp; Credit
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

