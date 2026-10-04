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
  Copy,
  Check,
  MessageSquare,
  Tag,
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

import { useAuth } from '@/context/auth-context';
import { userDataStore } from '@/lib/userDataStore';

export default function PurchasesListPage() {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<PurchaseSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Resubmit Modal state
  const [resubmittingPurchase, setResubmittingPurchase] = useState<PurchaseSubmission | null>(null);
  const [resubmitNotes, setResubmitNotes] = useState('');
  const [resubmitFiles, setResubmitFiles] = useState<File[]>([]);
  const [isSubmittingResubmit, setIsSubmittingResubmit] = useState(false);
  const [resubmitError, setResubmitError] = useState<string | null>(null);

  const fetchPurchases = () => {
    const userEmail =
      user?.email ||
      (typeof window !== 'undefined' ? localStorage.getItem('propfirm_saved_email') : null) ||
      'anonymous';
    const localPurchases = userDataStore.getUserPurchases(userEmail);

    // Hydrate immediately from current user's clean store
    setPurchases(localPurchases as any);
    setLoading(false);

    api
      .get<PurchaseSubmission[]>('/purchases')
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const merged = [...data];
          localPurchases.forEach((lp) => {
            if (!merged.some((m) => m.orderId === lp.orderId || m.submissionCode === lp.submissionCode)) {
              merged.push(lp as any);
            }
          });
          setPurchases(merged);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchPurchases();
  }, [user]);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(code);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge variant="purple" className="bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-300">APPROVED</Badge>;
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
    <div className="space-y-6 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-[900] text-slate-900 dark:text-white tracking-tight">Purchase Submissions</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track verification status by Tracking ID, upload additional information, or review approved points.
          </p>
        </div>

        <Link href="/dashboard/purchases/new">
          <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-10 px-4 rounded-xl shadow-sm">
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
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                statusFilter === status
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/40'
              }`}
            >
              {status.replace(/_/g, ' ')}
            </button>
          )
        )}
      </div>

      {/* Submissions List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-purple-50/40 dark:bg-slate-900/50 animate-pulse border border-purple-100 dark:border-purple-900/30" />
          ))}
        </div>
      ) : filteredPurchases.length === 0 ? (
        <Card className="text-center py-16 space-y-3 bg-white dark:bg-slate-900/60 border-purple-100 dark:border-purple-900/40 rounded-3xl shadow-sm">
          <ShoppingBag className="h-10 w-10 text-purple-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No purchase submissions found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Submit your eligible prop firm challenge purchase proof to start earning points.
          </p>
          <Link href="/dashboard/purchases/new" className="inline-block pt-2">
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white font-bold">Submit Purchase Proof</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPurchases.map((purchase) => (
            <Card
              key={purchase.id}
              className="p-5 sm:p-6 space-y-4 rounded-3xl border-purple-100 dark:border-purple-900/40 bg-white dark:bg-slate-900/60 shadow-xs hover:border-purple-300 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-purple-50 dark:border-purple-900/30">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-purple-100 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 overflow-hidden flex items-center justify-center shrink-0">
                    {purchase.propFirm.logoUrl ? (
                      <img src={purchase.propFirm.logoUrl} alt={purchase.propFirm.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="font-black text-purple-700">{purchase.propFirm.name[0]}</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-[900] text-slate-900 dark:text-white text-base">{purchase.propFirm.name}</h3>
                      {/* Tracking ID Badge with 1-click copy */}
                      <div className="flex items-center gap-1 font-mono text-xs font-black text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/80 px-2.5 py-0.5 rounded-lg border border-purple-200 dark:border-purple-800">
                        <Tag className="h-3 w-3 text-purple-500" />
                        <span>{purchase.submissionCode}</span>
                        <button
                          onClick={() => handleCopy(purchase.submissionCode)}
                          className="ml-1 text-slate-400 hover:text-purple-700 dark:hover:text-purple-300"
                          title="Copy Tracking ID"
                        >
                          {copiedId === purchase.submissionCode ? <Check className="h-3 w-3 text-purple-600" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {purchase.accountType} • ${purchase.purchaseAmountUsd} USD
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <div className="text-right">
                    <div className="text-xs text-slate-500 dark:text-slate-400">Reward Yield:</div>
                    <div className="text-sm font-black text-purple-600 dark:text-purple-400">
                      +{purchase.pointsAwarded.toLocaleString('en-US')} PTS
                    </div>
                  </div>
                  <div>{getStatusBadge(purchase.status)}</div>
                </div>
              </div>

              {/* Order Metadata Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block">Order ID:</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{purchase.orderId}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Referral Code Used:</span>
                  <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                    {purchase.referralCodeUsed}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Purchase Date:</span>
                  <span className="text-slate-800 dark:text-slate-200">{formatDate(purchase.purchaseDate)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Submitted On:</span>
                  <span className="text-slate-800 dark:text-slate-200">{formatDate(purchase.createdAt)}</span>
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
                        className="inline-flex items-center gap-1 text-[11px] text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 px-2.5 py-1 rounded-md border border-purple-200 dark:border-purple-800 transition-colors"
                      >
                        <FileText className="h-3 w-3" />
                        <span className="truncate max-w-[140px]">{proof.fileName}</span>
                        <ExternalLink className="h-3 w-3 opacity-60" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Needed: More Information Required Box */}
              {purchase.status === 'MORE_INFO_REQUIRED' && (
                <div className="p-4 rounded-2xl border border-purple-300 dark:border-purple-500/30 bg-purple-50/60 dark:bg-purple-950/20 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                        Additional Information Requested by Review Team:
                      </h4>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        &quot;{purchase.infoRequestedMessage}&quot;
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <Button
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
                      onClick={() => handleOpenResubmitModal(purchase)}
                    >
                      Resubmit Requested Information
                    </Button>
                  </div>
                </div>
              )}

              {/* Rejection Reason */}
              {purchase.status === 'REJECTED' && purchase.rejectionReason && (
                <div className="p-3.5 rounded-2xl border border-rose-500/20 bg-rose-950/20 text-xs text-rose-300 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
                  <div>
                    <strong>Rejection Reason:</strong> {purchase.rejectionReason}
                  </div>
                </div>
              )}

              {/* Direct Support Chat Link on this ID */}
              <div className="pt-2 flex items-center justify-between border-t border-purple-50 dark:border-purple-950/40 text-xs text-slate-500">
                <span>Need help with this order?</span>
                <Link
                  href={`/support/live?trackingId=${purchase.submissionCode}`}
                  className="font-bold text-purple-600 hover:text-purple-800 dark:text-purple-400 inline-flex items-center gap-1.5"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Chat Live with Support on this ID</span>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Resubmission Modal */}
      <Modal
        isOpen={!!resubmittingPurchase}
        onClose={() => setResubmittingPurchase(null)}
        title="Resubmit Purchase Information"
        description={`Provide requested information for ${resubmittingPurchase?.propFirm.name} (${resubmittingPurchase?.submissionCode})`}
      >
        <div className="space-y-4 text-left">
          {resubmitError && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              {resubmitError}
            </div>
          )}

          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-xs text-slate-700 dark:text-slate-300 space-y-1">
            <span className="font-bold text-purple-700 dark:text-purple-400">Team Request:</span>
            <p className="italic">
              &quot;{resubmittingPurchase?.infoRequestedMessage}&quot;
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Your Response / Updated Details *
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Attached the official billing invoice showing coupon NATION."
              value={resubmitNotes}
              onChange={(e) => setResubmitNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Upload Additional Screenshots / Invoices
            </label>
            <input
              type="file"
              multiple
              accept="image/*,application/pdf,video/*"
              onChange={(e) => {
                if (e.target.files) {
                  setResubmitFiles(Array.from(e.target.files));
                }
              }}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setResubmittingPurchase(null)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={isSubmittingResubmit}
              onClick={handleResubmit}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
            >
              {isSubmittingResubmit ? 'Uploading...' : 'Submit Updated Proof'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
