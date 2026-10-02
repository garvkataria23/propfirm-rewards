'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Settings,
  Lock,
  ShieldCheck,
  Bell,
  Globe,
  Check,
  AlertTriangle,
} from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Notification toggles
  const [notifyVerification, setNotifyVerification] = useState(true);
  const [notifyPoints, setNotifyPoints] = useState(true);
  const [notifyPromotions, setNotifyPromotions] = useState(false);

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      alert('Passwords do not match or are empty');
      return;
    }
    setPasswordSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Badge variant="purple">Account Center</Badge>
          <span className="text-xs text-slate-500 dark:text-slate-400">Security & Preferences</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1 flex items-center gap-2.5">
          <Settings className="h-7 w-7 text-blue-500" />
          Account Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your login credentials, two-factor authentication, and platform communication preferences.
        </p>
      </div>

      {/* Security: Password Update */}
      <Card className="p-6 bg-white dark:bg-[#070e20] border-slate-200/90 dark:border-[#14234b]/60 space-y-6 shadow-sm">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-[#14234b]/60">
          <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center shrink-0">
            <Lock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Password & Credentials</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Ensure your account uses a secure 8+ character password.</p>
          </div>
        </div>

        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 characters"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {passwordSuccess ? (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Check className="h-4 w-4" /> Password updated successfully!
              </span>
            ) : <span />}
            <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-500 text-white">
              Save Password
            </Button>
          </div>
        </form>
      </Card>

      {/* Two-Factor Authentication */}
      <Card className="p-6 bg-white dark:bg-[#070e20] border-slate-200/90 dark:border-[#14234b]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-500/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Two-Factor Authentication (2FA)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Add an additional security layer using Google Authenticator or SMS OTP.
            </p>
          </div>
        </div>

        <Button
          variant={twoFactorEnabled ? 'outline' : 'secondary'}
          size="sm"
          onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
          className={twoFactorEnabled ? 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400' : ''}
        >
          {twoFactorEnabled ? '2FA Enabled ✓' : 'Enable 2FA'}
        </Button>
      </Card>

      {/* Notification Preferences */}
      <Card className="p-6 bg-white dark:bg-[#070e20] border-slate-200/90 dark:border-[#14234b]/60 space-y-4 shadow-sm">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-[#14234b]/60">
          <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center shrink-0">
            <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Notification Preferences</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Select which automated updates you wish to receive.</p>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#091126] border border-slate-200/80 dark:border-[#14234b]/50 cursor-pointer">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Verification Status Updates</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Instant notification when a submission is approved or audited.</div>
            </div>
            <input
              type="checkbox"
              checked={notifyVerification}
              onChange={(e) => setNotifyVerification(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-blue-600 focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#091126] border border-slate-200/80 dark:border-[#14234b]/50 cursor-pointer">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Points Credited & Ledger Alerts</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Receive alert when reward points land in your balance.</div>
            </div>
            <input
              type="checkbox"
              checked={notifyPoints}
              onChange={(e) => setNotifyPoints(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-blue-600 focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#091126] border border-slate-200/80 dark:border-[#14234b]/50 cursor-pointer">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Promotions & Partner Code Drops</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Be first to know when new prop firms or reward tech launches.</div>
            </div>
            <input
              type="checkbox"
              checked={notifyPromotions}
              onChange={(e) => setNotifyPromotions(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-blue-600 focus:ring-blue-500"
            />
          </label>
        </div>
      </Card>
    </div>
  );
}
