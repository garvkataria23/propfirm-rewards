'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { formatDate } from '@/lib/utils';
import {
  ShoppingBag,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  ExternalLink,
  Coins,
  RefreshCw,
  Upload,
} from 'lucide-react';

interface PurchaseProof {
  id: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
}

interface PurchaseSubmission {
  id: string;
  submissionCode: string;
  propFirm: { name: string; logoUrl: string };
  accountType: string;
  orderId: string;
  accountId?: string;
  purchaseDate: string;
  purchaseAmountUsd: number;
  emailUsed: string;
  referralCodeUsed: string;
  pointsAwarded: number;
  status: string;
  rejectionReason?: string;
  infoRequestedMessage?: string;
  userResubmissionNotes?: string;
  proofs: PurchaseProof[];
  createdAt: string;
}

export default function PurchasesListPage() {
  const [purchases, setPurchases] = useState<PurchaseSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Resubmit Modal state (Section 10)
  const [resubmittingPurchase, setResubmittingPurchase] = useState<PurchaseSubmission | null>(null);
  const [resubmitNotes, setResubmitNotes] = useState('');
  const [resubmitFiles, setResubmitFiles] = useState<File[]>([]);
  const [isSubmittingResubmit, setIsSubmittingResubmit] = useState(false);
  const [resubmitError, setResubmitError] = useState<string | null>(null);

  const fetchPurchases = () => {
    setLoading(true);
    api
      .get<PurchaseSubmission[]>('/purchases')
      .then((data) => setPurchases(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge variant="success">APPROVED</Badge>;
      case 'PENDING':
        return <Badge variant="warning">PENDING</Badge>;
      case 'UNDER_REVIEW':
        return <Badge variant="info">UNDER REVIEW</Badge>;
      case 'MORE_INFO_REQUIRED':
        return <Badge variant="purple">ACTION NEEDED</Badge>;
      case 'REJECTED':
        return <Badge variant="danger">REJECTED</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const handleOpenResubmitModal = (purchase: PurchaseSubmission) => {
    setResubmittingPurchase(purchase);
    setResubmitNotes('');
    setResubmitFiles([]);
    setResubmitError(null);
  };

  const handleResubmit = async () => {
    if (!resubmittingPurchase) return;
    if (!resubmitNotes.trim()) {
      setResubmitError('Please provide details responding to the review team request.');
      return;
    }

    setIsSubmittingResubmit(true);
    setResubmitError(null);

    try {
      const formData = new FormData();
      formData.append('userResubmissionNotes', resubmitNotes);
      resubmitFiles.forEach((file) => {
        formData.append('proofs', file);
      });

      await api.patch(`/purchases/${resubmittingPurchase.id}/resubmit`, formData);
      setResubmittingPurchase(null);
      fetchPurchases();
    } catch (err: any) {
      setResubmitError(err.message || 'Resubmission failed');
    } finally {
      setIsSubmittingResubmit(false);
    }
  };

  const filteredPurchases = purchases.filter((p) => {
    if (statusFilter === 'ALL') return true;
    return p.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Purchase Submissions</h2>
          <p className="text-xs text-slate-400">
            Track verification status, upload additional information, or review approved points.
          </p>
        </div>

        <Link href="/dashboard/purchases/new">
          <Button size="sm">
            <PlusCircle className="h-4 w-4 mr-1.5" />
            Submit New Purchase
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {['ALL', 'PENDING', 'UNDER_REVIEW', 'MORE_INFO_REQUIRED', 'APPROVED', 'REJECTED'].map(
          (status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                statusFilter === status
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {status.replace(/_/g, ' ')}
            </button>
          ),
        )}
      </div>

      {/* Submissions List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-slate-900/50 animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : filteredPurchases.length === 0 ? (
        <Card className="text-center py-16 space-y-3">
          <ShoppingBag className="h-10 w-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No purchase submissions found</h3>
          <p className="text-xs text-slate-400">
            Submit your eligible prop firm challenge purchase proof to start earning points.
          </p>
          <Link href="/dashboard/purchases/new" className="inline-block pt-2">
            <Button size="sm">Submit Purchase Proof</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPurchases.map((purchase) => (
            <Card
              key={purchase.id}
              className="p-5 sm:p-6 card-hover-glow space-y-4 border-slate-800/80 bg-slate-900/60"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                    {purchase.propFirm.logoUrl ? (
                      <img src={purchase.propFirm.logoUrl} alt={purchase.propFirm.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="font-bold text-white">{purchase.propFirm.name[0]}</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-base">{purchase.propFirm.name}</h3>
                      <span className="font-mono text-xs text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {purchase.submissionCode}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {purchase.accountType} • ${purchase.purchaseAmountUsd}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Reward Yield:</div>
                    <div className="text-sm font-black text-emerald-400">
                      +{purchase.pointsAwarded.toLocaleString()} PTS
                    </div>
                  </div>
                  <div>{getStatusBadge(purchase.status)}</div>
                </div>
              </div>

              {/* Order Metadata Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block">Order ID:</span>
                  <span className="font-mono font-semibold text-slate-200">{purchase.orderId}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Referral Code Used:</span>
                  <span className="font-mono font-semibold text-emerald-400">
                    {purchase.referralCodeUsed}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Purchase Date:</span>
                  <span className="text-slate-200">{formatDate(purchase.purchaseDate)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Submitted On:</span>
                  <span className="text-slate-200">{formatDate(purchase.createdAt)}</span>
                </div>
              </div>

              {/* Uploaded Proofs Links */}
              {purchase.proofs && purchase.proofs.length > 0 && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-slate-500">Proof Documents:</span>
                  <div className="flex flex-wrap gap-2">
                    {purchase.proofs.map((proof) => (
                      <a
                        key={proof.id}
                        href={proof.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/20 hover:bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-500/20 transition-colors"
                      >
                        <FileText className="h-3 w-3" />
                        <span className="truncate max-w-[140px]">{proof.fileName}</span>
                        <ExternalLink className="h-3 w-3 opacity-60" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Needed: More Information Required Box (Section 10) */}
              {purchase.status === 'MORE_INFO_REQUIRED' && (
                <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-950/20 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300">
                        Additional Information Requested by Review Team:
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        &quot;{purchase.infoRequestedMessage}&quot;
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleOpenResubmitModal(purchase)}
                    >
                      Resubmit Requested Information
                    </Button>
                  </div>
                </div>
              )}

              {/* Rejection Reason (Section 10) */}
              {purchase.status === 'REJECTED' && purchase.rejectionReason && (
                <div className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-950/20 text-xs text-rose-300 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
                  <div>
                    <strong>Rejection Reason:</strong> {purchase.rejectionReason}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Resubmission Modal (Section 10) */}
      <Modal
        isOpen={!!resubmittingPurchase}
        onClose={() => setResubmittingPurchase(null)}
        title="Resubmit Purchase Information"
        description={`Provide requested information for ${resubmittingPurchase?.propFirm.name} (${resubmittingPurchase?.submissionCode})`}
      >
        <div className="space-y-4">
          {resubmitError && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              {resubmitError}
            </div>
          )}

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
            <span className="font-bold text-purple-400">Team Request:</span>
            <p className="italic text-slate-300">
              &quot;{resubmittingPurchase?.infoRequestedMessage}&quot;
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Your Response / Updated Details *
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Attached the official billing PDF downloaded from my client portal showing coupon ALPHAREWARDS."
              value={resubmitNotes}
              onChange={(e) => setResubmitNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Upload Additional Screenshots / Invoices
            </label>
            <input
              type="file"
              multiple
              accept="image/*,application/pdf"
              onChange={(e) => {
                if (e.target.files) setResubmitFiles(Array.from(e.target.files));
              }}
              className="w-full text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setResubmittingPurchase(null)}
              disabled={isSubmittingResubmit}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isSubmittingResubmit}
              onClick={handleResubmit}
            >
              Submit Updated Information
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
