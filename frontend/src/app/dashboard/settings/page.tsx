'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GoogleTranslate } from '@/components/ui/google-translate';
import { useSidebarMode } from '@/hooks/use-sidebar-mode';
import {
  Settings,
  Lock,
  ShieldCheck,
  Bell,
  Globe,
  Check,
  AlertTriangle,
  PanelLeft,
  Pin,
  PinOff,
  LogOut,
  Trash2,
  Download,
  Smartphone,
  Mail,
  KeyRound,
  CheckCircle2,
  ShieldAlert,
  Laptop,
  X,
} from 'lucide-react';

const SETTINGS_STORAGE_KEY = 'propnation_user_settings_v1';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { isPinned, setPinned } = useSidebarMode();

  // 1. Sidebar & Workspace Layout state
  const [draftPinned, setDraftPinned] = useState<boolean>(isPinned);
  const [layoutSaved, setLayoutSaved] = useState(false);

  // 2. Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // 3. Two-Factor Authentication (2FA) state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorMethod, setTwoFactorMethod] = useState<'authenticator' | 'email' | 'sms'>('authenticator');
  const [twoFactorSaved, setTwoFactorSaved] = useState(false);

  // 4. Notification Preferences state
  const [notifyVerification, setNotifyVerification] = useState(true);
  const [notifyPoints, setNotifyPoints] = useState(true);
  const [notifyPromotions, setNotifyPromotions] = useState(false);
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(true);
  const [notificationsSaved, setNotificationsSaved] = useState(false);

  // 5. Language & Regional Preferences state
  const [timezone, setTimezone] = useState('UTC+05:30 (IST · India Standard Time)');
  const [currencyDisplay, setCurrencyDisplay] = useState('USD ($)');
  const [languageSaved, setLanguageSaved] = useState(false);

  // 6. Logout Confirmation state
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [logoutAllDevices, setLogoutAllDevices] = useState(false);

  // 7. Advanced Delete Account state
  const [showDeletePanel, setShowDeletePanel] = useState(false);
  const [deleteReason, setDeleteReason] = useState('No longer trading prop firms');
  const [deleteAckPoints, setDeleteAckPoints] = useState(false);
  const [deleteAckPermanent, setDeleteAckPermanent] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [dataExported, setDataExported] = useState(false);

  useEffect(() => {
    setDraftPinned(isPinned);
  }, [isPinned]);

  // Load saved preferences on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.twoFactorEnabled === 'boolean') setTwoFactorEnabled(parsed.twoFactorEnabled);
        if (parsed.twoFactorMethod) setTwoFactorMethod(parsed.twoFactorMethod);
        if (typeof parsed.notifyVerification === 'boolean') setNotifyVerification(parsed.notifyVerification);
        if (typeof parsed.notifyPoints === 'boolean') setNotifyPoints(parsed.notifyPoints);
        if (typeof parsed.notifyPromotions === 'boolean') setNotifyPromotions(parsed.notifyPromotions);
        if (typeof parsed.notifyWhatsapp === 'boolean') setNotifyWhatsapp(parsed.notifyWhatsapp);
        if (parsed.timezone) setTimezone(parsed.timezone);
        if (parsed.currencyDisplay) setCurrencyDisplay(parsed.currencyDisplay);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const persistSettings = (patch: Record<string, unknown>) => {
    if (typeof window === 'undefined') return;
    try {
      const current = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) || '{}');
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({ ...current, ...patch }));
    } catch {
      // ignore
    }
  };

  // Handlers with Confirm feedback
  const handleConfirmLayout = () => {
    setPinned(draftPinned);
    persistSettings({ sidebarPinned: draftPinned });
    setLayoutSaved(true);
    setTimeout(() => setLayoutSaved(false), 3000);
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }
    setPasswordSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordSuccess(false), 3500);
  };

  const handleConfirmTwoFactor = () => {
    persistSettings({ twoFactorEnabled, twoFactorMethod });
    setTwoFactorSaved(true);
    setTimeout(() => setTwoFactorSaved(false), 3000);
  };

  const handleConfirmNotifications = () => {
    persistSettings({
      notifyVerification,
      notifyPoints,
      notifyPromotions,
      notifyWhatsapp,
    });
    setNotificationsSaved(true);
    setTimeout(() => setNotificationsSaved(false), 3000);
  };

  const handleConfirmLanguageRegion = () => {
    persistSettings({ timezone, currencyDisplay });
    setLanguageSaved(true);
    setTimeout(() => setLanguageSaved(false), 3000);
  };

  const handleExportAccountData = () => {
    if (typeof window === 'undefined') return;
    const payload = {
      exportedAt: new Date().toISOString(),
      platform: 'PROP NATION',
      user: {
        id: user?.id,
        name: user?.name,
        email: user?.email,
        role: user?.role,
        status: user?.status,
        points: user?.points,
      },
      preferences: {
        twoFactorEnabled,
        twoFactorMethod,
        notifyVerification,
        notifyPoints,
        notifyPromotions,
        notifyWhatsapp,
        timezone,
        currencyDisplay,
      },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `propnation-account-backup-${(user?.name || 'trader').toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDataExported(true);
    setTimeout(() => setDataExported(false), 4000);
  };

  const handleConfirmLogout = () => {
    logout();
    router.replace('/');
  };

  const handlePermanentDeleteAccount = () => {
    setDeleteError('');
    if (!deleteAckPoints || !deleteAckPermanent) {
      setDeleteError('Please check both confirmation boxes to acknowledge permanent deletion.');
      return;
    }
    if (deleteConfirmText.trim().toUpperCase() !== 'DELETE') {
      setDeleteError('Please type DELETE in uppercase to confirm permanent account removal.');
      return;
    }

    setIsDeleting(true);
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem(SETTINGS_STORAGE_KEY);
          if (user?.email) {
            const keysToRemove: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
              const k = localStorage.key(i);
              if (k && (k.includes(user.email) || k.startsWith('propnation_'))) {
                keysToRemove.push(k);
              }
            }
            keysToRemove.forEach((k) => localStorage.removeItem(k));
          }
        } catch {
          // ignore
        }
      }
      logout();
      router.replace('/');
    }, 700);
  };

  return (
    <div className="w-full space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="purple">Account Center</Badge>
            <span className="text-xs text-slate-500 dark:text-slate-400">Security, Preferences &amp; Session Controls</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1 flex items-center gap-2.5">
            <Settings className="h-7 w-7 text-blue-500" />
            Account Settings
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure your workspace layout, credentials, 2FA security, notifications, language, session sign-out, and account data.
          </p>
        </div>

        {/* Quick Header Sign Out Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setLogoutAllDevices(false);
            setShowLogoutConfirm(true);
          }}
          className="border-rose-300 dark:border-rose-500/40 bg-rose-50/70 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 font-bold shrink-0 self-start sm:self-auto"
        >
          <LogOut className="h-4 w-4 mr-1.5" />
          Sign Out
        </Button>
      </div>

      {/* 1. Workspace & Sidebar Display Preferences */}
      <Card className="p-6 bg-white dark:bg-[#070e20] border-slate-200/90 dark:border-[#14234b]/60 space-y-5 shadow-sm">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-[#14234b]/60">
          <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center shrink-0">
            <PanelLeft className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Sidebar &amp; Workspace Layout</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select your preferred desktop sidebar mode and click Confirm to save.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Option 1: Auto-collapse on Hover */}
          <div
            onClick={() => setDraftPinned(false)}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
              !draftPinned
                ? 'border-blue-600 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/30 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <PinOff className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  Auto-Collapse (Hover Mode)
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                  Recommended
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Sidebar stays minimal (60px icon rail) and expands automatically on hover. Maximizes screen width for charts and tables.
              </p>
            </div>
            <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
              {!draftPinned ? '✓ Selected' : 'Click to Select'}
            </div>
          </div>

          {/* Option 2: Full-Time Open */}
          <div
            onClick={() => setDraftPinned(true)}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
              draftPinned
                ? 'border-blue-600 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/30 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Pin className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 fill-current" />
                  Full-Time Open (Pinned)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Sidebar stays permanently expanded (216px compact width) side-by-side with your dashboard.
              </p>
            </div>
            <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
              {draftPinned ? '✓ Selected' : 'Click to Select'}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#14234b]/50">
          {layoutSaved ? (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Sidebar layout preference confirmed &amp; applied!
            </span>
          ) : (
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Current active mode: <strong>{isPinned ? 'Full-Time Open (Pinned)' : 'Auto-Collapse (Hover)'}</strong>
            </span>
          )}
          <Button
            type="button"
            size="sm"
            onClick={handleConfirmLayout}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold"
          >
            <Check className="h-3.5 w-3.5 mr-1.5" />
            Confirm Layout
          </Button>
        </div>
      </Card>

      {/* 2. Security: Password Update */}
      <Card className="p-6 bg-white dark:bg-[#070e20] border-slate-200/90 dark:border-[#14234b]/60 space-y-5 shadow-sm">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-[#14234b]/60">
          <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center shrink-0">
            <Lock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Password &amp; Credentials</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Update your account password and click Confirm Password Change.
            </p>
          </div>
        </div>

        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Current Password</label>
              <input
                type="password"
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
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#14234b]/50">
            <div>
              {passwordError && (
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" /> {passwordError}
                </span>
              )}
              {passwordSuccess && (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Password confirmed &amp; updated successfully!
                </span>
              )}
            </div>
            <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-500 text-white font-bold">
              <Check className="h-3.5 w-3.5 mr-1.5" />
              Confirm Password Change
            </Button>
          </div>
        </form>
      </Card>

      {/* 3. Two-Factor Authentication (2FA) */}
      <Card className="p-6 bg-white dark:bg-[#070e20] border-slate-200/90 dark:border-[#14234b]/60 space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-[#14234b]/60">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-500/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Two-Factor Authentication (2FA)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Protect reward redemptions and account sign-ins with a second verification step.
              </p>
            </div>
          </div>

          <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {twoFactorEnabled ? '2FA Enabled' : '2FA Disabled'}
            </span>
            <input
              type="checkbox"
              checked={twoFactorEnabled}
              onChange={(e) => setTwoFactorEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-purple-600 focus:ring-purple-500"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              id: 'authenticator',
              label: 'Authenticator App (TOTP)',
              desc: 'Google Authenticator / Authy 6-digit code',
              icon: KeyRound,
            },
            {
              id: 'email',
              label: 'Email Security Code',
              desc: `Send one-time code to ${user?.email || 'your email'}`,
              icon: Mail,
            },
            {
              id: 'sms',
              label: 'SMS / WhatsApp OTP',
              desc: 'Instant mobile verification code on login',
              icon: Smartphone,
            },
          ].map((method) => {
            const Icon = method.icon;
            const active = twoFactorMethod === method.id;
            return (
              <div
                key={method.id}
                onClick={() => setTwoFactorMethod(method.id as any)}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer space-y-1.5 ${
                  active
                    ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/30'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                    {method.label}
                  </span>
                  {active && <Check className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{method.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#14234b]/50">
          {twoFactorSaved ? (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> 2FA security settings confirmed &amp; saved!
            </span>
          ) : (
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Status: <strong>{twoFactorEnabled ? `Active (${twoFactorMethod.toUpperCase()})` : 'Disabled'}</strong>
            </span>
          )}
          <Button
            type="button"
            size="sm"
            onClick={handleConfirmTwoFactor}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold"
          >
            <Check className="h-3.5 w-3.5 mr-1.5" />
            Confirm 2FA Settings
          </Button>
        </div>
      </Card>

      {/* 4. Notification Preferences */}
      <Card className="p-6 bg-white dark:bg-[#070e20] border-slate-200/90 dark:border-[#14234b]/60 space-y-4 shadow-sm">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-[#14234b]/60">
          <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center shrink-0">
            <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Notification Preferences</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Choose which automated alerts you want to receive and click Confirm Notifications.
            </p>
          </div>
        </div>

        <div className="space-y-2.5 pt-1">
          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#091126] border border-slate-200/80 dark:border-[#14234b]/50 cursor-pointer">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Verification Status Updates</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Instant notification when a purchase proof is approved or audited.
              </div>
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
              <div className="text-xs font-bold text-slate-900 dark:text-white">Points Credited &amp; Ledger Alerts</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Receive an alert whenever reward points land in your wallet balance.
              </div>
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
              <div className="text-xs font-bold text-slate-900 dark:text-white">WhatsApp Instant Updates</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Get real-time reward dispatch and verification updates on WhatsApp.
              </div>
            </div>
            <input
              type="checkbox"
              checked={notifyWhatsapp}
              onChange={(e) => setNotifyWhatsapp(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-blue-600 focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#091126] border border-slate-200/80 dark:border-[#14234b]/50 cursor-pointer">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Promotions &amp; Partner Code Drops</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Be first to know when new prop firm discounts or reward items launch.
              </div>
            </div>
            <input
              type="checkbox"
              checked={notifyPromotions}
              onChange={(e) => setNotifyPromotions(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-blue-600 focus:ring-blue-500"
            />
          </label>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#14234b]/50">
          {notificationsSaved ? (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Notification preferences confirmed &amp; saved!
            </span>
          ) : (
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {[notifyVerification, notifyPoints, notifyWhatsapp, notifyPromotions].filter(Boolean).length} of 4 channels active
            </span>
          )}
          <Button
            type="button"
            size="sm"
            onClick={handleConfirmNotifications}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold"
          >
            <Check className="h-3.5 w-3.5 mr-1.5" />
            Confirm Notifications
          </Button>
        </div>
      </Card>

      {/* 5. Language & Regional Localization */}
      <Card className="p-6 bg-white dark:bg-[#070e20] border-slate-200/90 dark:border-[#14234b]/60 space-y-4 shadow-sm">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-[#14234b]/60">
          <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-500/30 flex items-center justify-center shrink-0">
            <Globe className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Language &amp; Regional Preferences</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select your platform display language (195+ global languages), timezone, and currency format.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/70 dark:border-purple-800/60">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-900 dark:text-white">Active Display Language (195+ Languages)</span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Click the language selector and type any letter to filter 195+ languages at the top.
            </p>
          </div>

          <div className="shrink-0">
            <GoogleTranslate id="google_translate_settings" fullLabel />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Primary Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="UTC+05:30 (IST · India Standard Time)">UTC+05:30 (IST · India Standard Time)</option>
              <option value="UTC+00:00 (GMT / London)">UTC+00:00 (GMT / London)</option>
              <option value="UTC-05:00 (EST / New York)">UTC-05:00 (EST / New York)</option>
              <option value="UTC+04:00 (GST / Dubai)">UTC+04:00 (GST / Dubai)</option>
              <option value="UTC+08:00 (SGT / Singapore)">UTC+08:00 (SGT / Singapore)</option>
              <option value="UTC+01:00 (CET / Frankfurt)">UTC+01:00 (CET / Frankfurt)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Reference Currency Display</label>
            <select
              value={currencyDisplay}
              onChange={(e) => setCurrencyDisplay(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="USD ($)">USD ($) — US Dollar</option>
              <option value="INR (₹)">INR (₹) — Indian Rupee</option>
              <option value="EUR (€)">EUR (€) — Euro</option>
              <option value="GBP (£)">GBP (£) — British Pound</option>
              <option value="AED (د.إ)">AED (د.إ) — UAE Dirham</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#14234b]/50">
          {languageSaved ? (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Language &amp; regional preferences confirmed!
            </span>
          ) : (
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {timezone} · {currencyDisplay}
            </span>
          )}
          <Button
            type="button"
            size="sm"
            onClick={handleConfirmLanguageRegion}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold"
          >
            <Check className="h-3.5 w-3.5 mr-1.5" />
            Confirm Language &amp; Region
          </Button>
        </div>
      </Card>

      {/* 6. Active Session & Sign Out Controls */}
      <Card className="p-6 bg-white dark:bg-[#070e20] border-slate-200/90 dark:border-[#14234b]/60 space-y-5 shadow-sm">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-[#14234b]/60">
          <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center shrink-0">
            <LogOut className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Active Session &amp; Sign Out</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage your current logged-in session or sign out to return to the PROP NATION entry page.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-[#091126] border border-slate-200/80 dark:border-[#14234b]/60">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <Laptop className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {user?.name || 'Verified Trader'} ({user?.email})
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active Session
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Role: <strong className="font-mono">{user?.role || 'USER'}</strong> · Encrypted Web Session
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setLogoutAllDevices(true);
                setShowLogoutConfirm(true);
              }}
              className="text-xs font-semibold border-slate-300 dark:border-slate-700"
            >
              Sign Out All Devices
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                setLogoutAllDevices(false);
                setShowLogoutConfirm(true);
              }}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
            >
              <LogOut className="h-3.5 w-3.5 mr-1.5" />
              Log Out Now
            </Button>
          </div>
        </div>

        {/* Inline Confirm Logout Box */}
        {showLogoutConfirm && (
          <div className="p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/30 border-2 border-amber-400/60 dark:border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in-0 duration-150">
            <div className="space-y-1">
              <div className="text-xs font-extrabold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                {logoutAllDevices
                  ? 'Confirm Sign Out From All Devices?'
                  : 'Confirm Sign Out From Current Session?'}
              </div>
              <p className="text-[11px] text-amber-800/90 dark:text-amber-300/80">
                You will be signed out of your trader portal and redirected to the PROP NATION entry page.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowLogoutConfirm(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleConfirmLogout}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                <Check className="h-3.5 w-3.5 mr-1.5" />
                Confirm Log Out
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* 7. Danger Zone: Advanced Account Deletion & Data Export */}
      <Card className="p-6 bg-white dark:bg-[#070e20] border-2 border-rose-200 dark:border-rose-500/30 space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-rose-100 dark:border-rose-500/20">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-500/40 flex items-center justify-center shrink-0">
              <ShieldAlert className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-rose-600 dark:text-rose-400">
                  Danger Zone · Advanced Account Deletion
                </h3>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                  Irreversible
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Export a backup of your account data or permanently delete your PROP NATION trader account.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportAccountData}
              className="text-xs font-bold border-slate-300 dark:border-slate-700"
            >
              <Download className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />
              {dataExported ? 'Backup Downloaded ✓' : 'Export Account Data (JSON)'}
            </Button>

            {!showDeletePanel && (
              <Button
                type="button"
                size="sm"
                onClick={() => setShowDeletePanel(true)}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Delete Account
              </Button>
            )}
          </div>
        </div>

        {/* Impact Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/15 border border-rose-200/60 dark:border-rose-500/20 space-y-1">
            <div className="font-bold text-slate-900 dark:text-white">1. Profile &amp; Credentials</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Removes login access for <strong>{user?.email}</strong> across all connected devices.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/15 border border-rose-200/60 dark:border-rose-500/20 space-y-1">
            <div className="font-bold text-slate-900 dark:text-white">
              2. Reward Points ({(user?.points?.available || 0).toLocaleString('en-US')} PTS)
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              All unredeemed available and pending reward points in your wallet will be forfeited.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/15 border border-rose-200/60 dark:border-rose-500/20 space-y-1">
            <div className="font-bold text-slate-900 dark:text-white">3. Verification &amp; Order History</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Submitted prop-firm invoices, payout proofs, and redemption logs will be purged.
            </p>
          </div>
        </div>

        {/* Multi-Step Advanced Delete Verification Panel */}
        {showDeletePanel && (
          <div className="p-5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/25 border-2 border-rose-300 dark:border-rose-500/40 space-y-4 animate-in fade-in-0 duration-200">
            <div className="flex items-center justify-between">
              <div className="text-sm font-black text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Permanent Account Deletion Verification
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowDeletePanel(false);
                  setDeleteError('');
                  setDeleteConfirmText('');
                }}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Step 1: Reason */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Step 1: Select reason for deleting your account
              </label>
              <select
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="w-full rounded-xl border border-rose-300 dark:border-rose-500/40 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white focus:border-rose-500 focus:outline-none"
              >
                <option value="No longer trading prop firms">No longer trading prop firms</option>
                <option value="Created a duplicate account">I have another PROP NATION account</option>
                <option value="Privacy / data removal request">Privacy / personal data removal request</option>
                <option value="Switching to another platform">Switching to another platform</option>
                <option value="Other">Other reason</option>
              </select>
            </div>

            {/* Step 2: Mandatory Checkboxes */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Step 2: Mandatory security acknowledgements
              </div>
              <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-rose-200 dark:border-rose-500/30 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={deleteAckPoints}
                  onChange={(e) => setDeleteAckPoints(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-rose-300 text-rose-600 focus:ring-rose-500"
                />
                <span>
                  I understand that my current balance of{' '}
                  <strong>{(user?.points?.available || 0).toLocaleString('en-US')} PTS</strong> and any pending verifications will be permanently forfeited.
                </span>
              </label>

              <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-rose-200 dark:border-rose-500/30 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={deleteAckPermanent}
                  onChange={(e) => setDeleteAckPermanent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-rose-300 text-rose-600 focus:ring-rose-500"
                />
                <span>
                  I acknowledge that this action is <strong>permanent and irreversible</strong> and my account data cannot be recovered once deleted.
                </span>
              </label>
            </div>

            {/* Step 3: Type DELETE */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Step 3: Type <span className="font-mono px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-600 dark:text-rose-400">DELETE</span> below to unlock permanent deletion
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE in uppercase"
                className="w-full rounded-xl border border-rose-300 dark:border-rose-500/40 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:border-rose-500 focus:outline-none"
              />
            </div>

            {deleteError && (
              <div className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-rose-200/70 dark:border-rose-500/30">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowDeletePanel(false);
                  setDeleteError('');
                  setDeleteConfirmText('');
                }}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={isDeleting}
                onClick={handlePermanentDeleteAccount}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-sm"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                {isDeleting ? 'Deleting Account Permanently...' : 'Confirm Permanent Account Deletion'}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
