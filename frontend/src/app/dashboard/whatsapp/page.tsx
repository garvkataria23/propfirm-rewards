'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowLeft, ShieldCheck, Lock } from 'lucide-react';

const STAFF_ROLES = ['ADMIN', 'SUPER_ADMIN', 'SUPPORT_LEAD', 'SUPPORT_AGENT', 'FINANCE_OFFICER'];

export default function DashboardWhatsAppRedirect() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user && STAFF_ROLES.includes(user.role)) {
        // Staff/Admin accessing WhatsApp page gets redirected to the Admin WhatsApp Control Center
        router.replace('/admin/whatsapp');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-500">
        Checking access permissions...
      </div>
    );
  }

  // If user is Staff, show redirecting status
  if (user && STAFF_ROLES.includes(user.role)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3 text-center p-4">
        <div className="h-10 w-10 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Redirecting to Admin WhatsApp Control Center...
        </p>
      </div>
    );
  }

  // For normal users, restrict access: graphs & settings are strictly for Admin & Admin panel
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
          <Lock className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Administrative Access Only
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            WhatsApp delivery graphs, Meta Cloud SLA metrics, and dispatch configurations are restricted to platform administrators in the Admin Panel.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 text-left flex items-start gap-2.5">
          <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
          <span>
            Traders receive automated WhatsApp delivery updates for verified purchases and rewards automatically once their mobile number is verified in their Profile.
          </span>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard" className="w-full">
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Return to Trader Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
