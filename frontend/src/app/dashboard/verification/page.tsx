'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import { userDataStore } from '@/lib/userDataStore';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Upload,
  ArrowRight,
  FileText,
  Search,
  ExternalLink,
  HelpCircle,
} from 'lucide-react';

interface PurchaseSubmission {
  id: string;
  submissionCode: string;
  accountType: string;
  orderId: string;
  accountId?: string;
  purchaseDate: string;
  purchaseAmountUsd: number;
  status: string;
  fraudStatus: string;
  rejectionReason?: string;
  infoRequestedMessage?: string;
  pointsAwarded?: number;
  createdAt: string;
  propFirm?: {
    name: string;
    logoUrl?: string;
  };
}

export default function VerificationPage() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<PurchaseSubmission[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userEmail =
      user?.email ||
      (typeof window !== 'undefined' ? localStorage.getItem('propfirm_saved_email') : null) ||
      'anonymous';
    const localPurchases = userDataStore.getUserPurchases(userEmail);
    setSubmissions(localPurchases as any);
    setLoading(false);

    api
      .get<PurchaseSubmission[]>('/purchases')
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setSubmissions(data);
        }
      })
      .catch(() => {});
  }, [user]);

  const safeSubmissions = Array.isArray(submissions) ? submissions : [];
  const pendingCount = safeSubmissions.filter(
    (s) => s.status === 'PENDING' || s.status === 'UNDER_REVIEW'
  ).length;
  const approvedCount = safeSubmissions.filter((s) => s.status === 'APPROVED').length;
  const actionRequiredCount = safeSubmissions.filter(
    (s) => s.status === 'MORE_INFO_REQUIRED'
  ).length;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="purple">Desk Status: ONLINE</Badge>
            <span className="text-xs text-slate-500 dark:text-slate-400">Avg. verification time: ~45 mins</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1 flex items-center gap-2.5">
            <ShieldCheck className="h-7 w-7 text-blue-500" />
            Purchase Verification Hub
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track real-time audit progress of your submitted prop firm challenges and point approvals.
          </p>
        </div>

        <Link href="/dashboard/purchases/new">
          <Button className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30">
            <Upload className="h-4 w-4 mr-1.5" />
            Submit New Purchase
          </Button>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 bg-white dark:bg-[#070e20] border-slate-200/90 dark:border-[#14234b]/60 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center shrink-0">
            <Clock className="h-6 w-6 text-amber-500 dark:text-amber-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Under Audit / Pending
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{pendingCount}</div>
          </div>
        </Card>

        <Card className="p-5 bg-white dark:bg-[#070e20] border-slate-200/90 dark:border-[#14234b]/60 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Approved & Credited
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{approvedCount}</div>
          </div>
        </Card>

        <Card className="p-5 bg-white dark:bg-[#070e20] border-slate-200/90 dark:border-[#14234b]/60 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-6 w-6 text-rose-500 dark:text-rose-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Action Required
            </div>
            <div className="text-2xl font-black text-rose-500 dark:text-rose-400 mt-0.5">{actionRequiredCount}</div>
          </div>
        </Card>
      </div>

      {/* How Verification Works 4-Step Visual Flow */}
      <Card className="p-6 bg-slate-50 dark:bg-[#08122c] border border-slate-200 dark:border-[#14234b] space-y-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-blue-500 dark:text-blue-400" />
          Verification Pipeline
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-white dark:bg-[#060b18] border border-slate-200/90 dark:border-[#14234b]/60 space-y-1.5 shadow-xs">
            <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase">Step 01</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">Purchase & Proof</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              User buys via our referral link/code and uploads order screenshot or PDF invoice.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-[#060b18] border border-slate-200/90 dark:border-[#14234b]/60 space-y-1.5 shadow-xs">
            <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase">Step 02</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">Anti-Fraud Scan</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              System checks for duplicate order IDs, matching timestamps, and verified buyer email.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-[#060b18] border border-slate-200/90 dark:border-[#14234b]/60 space-y-1.5 shadow-xs">
            <div className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase">Step 03</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">Partner Audit</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Affiliate desk confirms the commission tag with the prop firm&apos;s backoffice.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-[#060b18] border border-slate-200/90 dark:border-[#14234b]/60 space-y-1.5 shadow-xs">
            <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Step 04</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">Points Credited</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Approved points instantly write to your Ledger and reflect in your Rewards balance.
            </p>
          </div>
        </div>
      </Card>

      {/* Submissions in Queue */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Your Submissions Status</h3>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-slate-100 dark:bg-slate-900/60 animate-pulse border border-slate-200 dark:border-slate-800" />
            ))}
          </div>
        ) : submissions.length === 0 ? (
          <Card className="p-12 text-center space-y-4 bg-white dark:bg-[#070e20] border-slate-200/90 dark:border-[#14234b]/60 shadow-sm">
            <FileText className="h-12 w-12 text-slate-400 dark:text-slate-600 mx-auto" />
            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-900 dark:text-white">No submissions yet</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Once you purchase a prop firm challenge using our referral code, submit your order confirmation to start earning.
              </p>
            </div>
            <Link href="/dashboard/purchases/new">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white">
                Submit Your First Purchase
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {submissions.map((sub) => (
              <Card
                key={sub.id}
                className="p-5 sm:p-6 bg-white dark:bg-[#070e20] border-slate-200/90 dark:border-[#14234b]/60 space-y-4 hover:border-blue-500/30 transition-all shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-[#14234b]/40">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-500/30 px-2.5 py-1 rounded-lg">
                      {sub.submissionCode}
                    </span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      {sub.propFirm?.name || 'Prop Firm'}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">• {sub.accountType}</span>
                  </div>

                  <div>
                    {sub.status === 'APPROVED' && (
                      <Badge variant="success">✓ Verified & Credited</Badge>
                    )}
                    {sub.status === 'PENDING' && (
                      <Badge variant="warning">⏳ In Queue</Badge>
                    )}
                    {sub.status === 'UNDER_REVIEW' && (
                      <Badge variant="info">🔍 Auditor Reviewing</Badge>
                    )}
                    {sub.status === 'MORE_INFO_REQUIRED' && (
                      <Badge variant="danger">⚠️ Action Required</Badge>
                    )}
                    {sub.status === 'REJECTED' && (
                      <Badge variant="danger">✕ Rejected</Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 uppercase tracking-wider font-semibold block">Order ID</span>
                    <span className="font-mono text-slate-900 dark:text-white font-bold">{sub.orderId}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase tracking-wider font-semibold block">Amount Paid</span>
                    <span className="text-slate-900 dark:text-white font-bold">${sub.purchaseAmountUsd}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase tracking-wider font-semibold block">Submitted Date</span>
                    <span className="text-slate-700 dark:text-slate-300">
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase tracking-wider font-semibold block">Points Awarded</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {sub.pointsAwarded ? `+${sub.pointsAwarded.toLocaleString()} PTS` : 'Pending calculation'}
                    </span>
                  </div>
                </div>

                {/* More info banner if requested */}
                {sub.status === 'MORE_INFO_REQUIRED' && (
                  <div className="rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-500/30 p-3.5 space-y-2">
                    <div className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4" />
                      Verification Request from Admin:
                    </div>
                    <p className="text-xs text-rose-800 dark:text-rose-200">
                      {sub.infoRequestedMessage || 'Please provide clear invoice showing the order timestamp and billing email.'}
                    </p>
                    <Link href={`/dashboard/purchases`}>
                      <Button size="sm" variant="danger" className="text-xs mt-1">
                        Update Information
                      </Button>
                    </Link>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
