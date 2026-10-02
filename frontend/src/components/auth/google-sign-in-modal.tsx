'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { User, Mail, ArrowRight, ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react';

interface GoogleSignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  rememberMe?: boolean;
}

export function GoogleSignInModal({ isOpen, onClose, rememberMe = true }: GoogleSignInModalProps) {
  const router = useRouter();
  const { loginWithGoogle } = useAuth();
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const GOOGLE_PRESETS = [
    {
      id: 'preset-1',
      name: 'Garv Gautam Kataria',
      email: 'garv@propnation.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      label: 'Main Account',
    },
    {
      id: 'preset-2',
      name: 'Demo Trader (Alex)',
      email: 'trader@example.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      label: 'Demo Account (3 Verified Purchases)',
    },
  ];

  const handleSelectGoogleAccount = async (account: { email: string; name: string; avatarUrl?: string }) => {
    setIsSubmitting(true);
    try {
      const user = await loginWithGoogle(account, rememberMe);
      onClose();
      if (user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Google login error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail) return;

    const derivedName = customName.trim() || customEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    await handleSelectGoogleAccount({
      email: customEmail.trim(),
      name: derivedName,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sign in with Google"
      description="Choose a Google account to continue to PropFirm Rewards."
      maxWidth="md"
    >
      <div className="space-y-4 text-left">
        {/* Google Security Header */}
        <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <div>
            <span className="font-bold text-slate-800 dark:text-slate-200">OAuth 2.0 Single Sign-On</span>
            <p className="text-[11px] text-slate-500">Your profile &amp; previous purchases will be loaded instantly.</p>
          </div>
        </div>

        {/* 1-Click Google Account Selector Cards */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Choose an account
          </span>
          <div className="space-y-2">
            {GOOGLE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setSelectedPreset(preset.id);
                  handleSelectGoogleAccount({
                    email: preset.email,
                    name: preset.name,
                    avatarUrl: preset.avatar,
                  });
                }}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedPreset === preset.id
                    ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/30'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-300 dark:hover:border-purple-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={preset.avatar}
                    alt={preset.name}
                    className="h-10 w-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{preset.name}</span>
                      <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold bg-purple-100 dark:bg-purple-950 px-2 py-0.5 rounded-full">
                        {preset.label}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">{preset.email}</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="relative my-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white dark:bg-slate-900 px-2 text-slate-400 text-[11px]">
              Or enter any Google account
            </span>
          </div>
        </div>

        {/* Custom Google Account Form */}
        <form onSubmit={handleCustomGoogleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Your Google Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="email"
                required
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="yourname@gmail.com"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 pl-8 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Full Name (Optional)
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 pl-8 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isSubmitting}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
            >
              Continue &rarr;
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
