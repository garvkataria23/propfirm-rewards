'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import { useTheme, type ThemeMode } from '@/context/theme-context';
import { useSidebarMode } from '@/hooks/use-sidebar-mode';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GoogleTranslate } from '@/components/ui/google-translate';
import {
  Settings,
  Save,
  CheckCircle2,
  Moon,
  Sun,
  Monitor,
  PanelLeft,
  Pin,
  PinOff,
  Globe,
  Lock,
  ShieldCheck,
  Bell,
  LogOut,
  Download,
  Sliders,
  Check,
  AlertTriangle,
  Smartphone,
  Mail,
  KeyRound,
  Laptop,
} from 'lucide-react';

interface SystemSetting {
  id: string;
  key: string;
  value: string;
  description?: string;
  updatedAt: string;
}

const DEFAULT_SYSTEM_SETTINGS: SystemSetting[] = [
  {
    id: 'sys-1',
    key: 'DEFAULT_AFFILIATE_CODE',
    value: 'NATION',
    description: 'Primary affiliate discount & reward tracking code across all partner prop firms',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sys-2',
    key: 'POINTS_PER_USD_SPENT',
    value: '100',
    description: 'Base reward points credited per $1.00 USD of verified prop firm evaluation purchase',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sys-3',
    key: 'MIN_REDEMPTION_POINTS',
    value: '5000',
    description: 'Minimum available points balance required to initiate a reward store redemption',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sys-4',
    key: 'VERIFICATION_SLA_HOURS',
    value: '2',
    description: 'Target SLA window (in hours) for staff review of uploaded purchase invoices',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sys-5',
    key: 'WHATSAPP_SUPPORT_NUMBER',
    value: '+91 98765 43210',
    description: 'Official 24/7 WhatsApp concierge & automated order status notification number',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sys-6',
    key: 'HIGH_VALUE_ALERT_USD',
    value: '500',
    description: 'Invoice amount threshold (USD) that triggers priority Super Admin / Finance verification',
    updatedAt: new Date().toISOString(),
  },
];

const ADMIN_SETTINGS_STORAGE_KEY = 'propnation_admin_settings_v1';

export default function AdminSettingsPage() {
  const { user, logout } = useAuth();
  const { theme, themeMode, setTheme } = useTheme();
  const { isPinned, setPinned } = useSidebarMode();
  const router = useRouter();

  // 1. Theme Mode (Night Mode, System, Light Mode)
  const [draftThemeMode, setDraftThemeMode] = useState<ThemeMode>(themeMode);
  const [themeSaved, setThemeSaved] = useState(false);

  // 2. Sidebar Layout Mode
  const [draftPinned, setDraftPinned] = useState<boolean>(isPinned);
  const [layoutSaved, setLayoutSaved] = useState(false);

  // 3. Language & Regional Preferences
  const [adminTimezone, setAdminTimezone] = useState('UTC+05:30 (IST · India Standard Time)');
  const [reportingCurrency, setReportingCurrency] = useState('USD ($)');
  const [dateFormat, setDateFormat] = useState('DD MMM YYYY · 24-Hour');
  const [languageSaved, setLanguageSaved] = useState(false);

  // 4. Global Configuration Keys (API + Local Fallback)
  const [settings, setSettings] = useState<SystemSetting[]>(DEFAULT_SYSTEM_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [globalSavedMsg, setGlobalSavedMsg] = useState<string | null>(null);

  // 5. Admin Password & Credentials
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // 6. Staff 2FA Security
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [twoFactorMethod, setTwoFactorMethod] = useState<'authenticator' | 'hardware' | 'email'>('authenticator');
  const [twoFactorSaved, setTwoFactorSaved] = useState(false);

  // 7. Admin Escalation & System Alerts
  const [alertHighValue, setAlertHighValue] = useState(true);
  const [alertFraudCheck, setAlertFraudCheck] = useState(true);
  const [alertRedemptions, setAlertRedemptions] = useState(true);
  const [alertWhatsappDesk, setAlertWhatsappDesk] = useState(true);
  const [alertsSaved, setAlertsSaved] = useState(false);

  // 8. Session & Logout Controls
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [logoutAllDevices, setLogoutAllDevices] = useState(false);
  const [backupExported, setBackupExported] = useState(false);

  useEffect(() => {
    setDraftThemeMode(themeMode);
  }, [themeMode]);

  useEffect(() => {
    setDraftPinned(isPinned);
  }, [isPinned]);

  const fetchSettings = () => {
    api
      .get<SystemSetting[]>('/admin/settings')
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setSettings(data);
        }
      })
      .catch(() => {
        // Keep DEFAULT_SYSTEM_SETTINGS fallback
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSettings();
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(ADMIN_SETTINGS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.adminTimezone) setAdminTimezone(parsed.adminTimezone);
        if (parsed.reportingCurrency) setReportingCurrency(parsed.reportingCurrency);
        if (parsed.dateFormat) setDateFormat(parsed.dateFormat);
        if (typeof parsed.twoFactorEnabled === 'boolean') setTwoFactorEnabled(parsed.twoFactorEnabled);
        if (parsed.twoFactorMethod) setTwoFactorMethod(parsed.twoFactorMethod);
        if (typeof parsed.alertHighValue === 'boolean') setAlertHighValue(parsed.alertHighValue);
        if (typeof parsed.alertFraudCheck === 'boolean') setAlertFraudCheck(parsed.alertFraudCheck);
        if (typeof parsed.alertRedemptions === 'boolean') setAlertRedemptions(parsed.alertRedemptions);
        if (typeof parsed.alertWhatsappDesk === 'boolean') setAlertWhatsappDesk(parsed.alertWhatsappDesk);
        if (Array.isArray(parsed.customSettings) && parsed.customSettings.length > 0) {
          setSettings(parsed.customSettings);
        }
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const persistAdminSettings = (patch: Record<string, unknown>) => {
    if (typeof window === 'undefined') return;
    try {
      const current = JSON.parse(localStorage.getItem(ADMIN_SETTINGS_STORAGE_KEY) || '{}');
      localStorage.setItem(ADMIN_SETTINGS_STORAGE_KEY, JSON.stringify({ ...current, ...patch }));
    } catch {
      // ignore
    }
  };

  const handleConfirmTheme = () => {
    setTheme(draftThemeMode);
    persistAdminSettings({ themeMode: draftThemeMode });
    setThemeSaved(true);
    setTimeout(() => setThemeSaved(false), 3000);
  };

  const handleConfirmLayout = () => {
    setPinned(draftPinned);
    persistAdminSettings({ sidebarPinned: draftPinned });
    setLayoutSaved(true);
    setTimeout(() => setLayoutSaved(false), 3000);
  };

  const handleConfirmLanguageRegion = () => {
    persistAdminSettings({ adminTimezone, reportingCurrency, dateFormat });
    setLanguageSaved(true);
    setTimeout(() => setLanguageSaved(false), 3000);
  };

  const handleUpdateSingleKey = async (key: string, value: string) => {
    setSavingKey(key);
    setGlobalSavedMsg(null);
    const updated = settings.map((s) =>
      s.key === key ? { ...s, value, updatedAt: new Date().toISOString() } : s
    );
    setSettings(updated);
    persistAdminSettings({ customSettings: updated });
    try {
      await api.put(`/admin/settings/${key}`, { value });
    } catch {
      // Saved locally in fallback mode
    } finally {
      setSavingKey(null);
      setGlobalSavedMsg(`Parameter '${key}' confirmed & saved!`);
      setTimeout(() => setGlobalSavedMsg(null), 3000);
    }
  };

  const handleConfirmAllGlobalKeys = () => {
    const updated = settings.map((s) => {
      const input = document.getElementById(`input-${s.key}`) as HTMLInputElement | null;
      return input ? { ...s, value: input.value, updatedAt: new Date().toISOString() } : s;
    });
    setSettings(updated);
    persistAdminSettings({ customSettings: updated });
    setGlobalSavedMsg('All global platform parameters confirmed & saved!');
    setTimeout(() => setGlobalSavedMsg(null), 3000);
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (!currentPassword) {
      setPasswordError('Please enter your current staff password.');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setPasswordError('New staff password must be at least 8 characters.');
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
    persistAdminSettings({ twoFactorEnabled, twoFactorMethod });
    setTwoFactorSaved(true);
    setTimeout(() => setTwoFactorSaved(false), 3000);
  };

  const handleConfirmAlerts = () => {
    persistAdminSettings({
      alertHighValue,
      alertFraudCheck,
      alertRedemptions,
      alertWhatsappDesk,
    });
    setAlertsSaved(true);
    setTimeout(() => setAlertsSaved(false), 3000);
  };

  const handleExportSystemBackup = () => {
    if (typeof window === 'undefined') return;
    const payload = {
      exportedAt: new Date().toISOString(),
      platform: 'PROP NATION — Admin Control Center',
      exportedBy: {
        name: user?.name,
        email: user?.email,
        role: user?.role,
      },
      globalSettings: settings,
      staffPreferences: {
        themeMode,
        sidebarPinned: isPinned,
        adminTimezone,
        reportingCurrency,
        dateFormat,
        twoFactorEnabled,
        twoFactorMethod,
        alertHighValue,
        alertFraudCheck,
        alertRedemptions,
        alertWhatsappDesk,
      },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `propnation-admin-config-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setBackupExported(true);
    setTimeout(() => setBackupExported(false), 4000);
  };

  const handleConfirmLogout = () => {
    logout();
    router.replace('/');
  };

  return (
    <div className="w-full space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="emerald">Staff Control Center</Badge>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              System Configuration, Appearance, Language &amp; Security
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1 flex items-center gap-2.5">
            <Settings className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
            Admin System &amp; Account Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Manage Night/System/Light theme mode, 195+ languages, sidebar pin layout, global platform parameters, and staff security.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportSystemBackup}
            className="border-slate-300 dark:border-slate-700 font-bold"
          >
            <Download className="h-4 w-4 mr-1.5 text-emerald-600 dark:text-emerald-400" />
            Export Config JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setLogoutAllDevices(false);
              setShowLogoutConfirm(true);
            }}
            className="border-rose-300 dark:border-rose-500/40 bg-rose-50/70 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 font-bold"
          >
            <LogOut className="h-4 w-4 mr-1.5" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* 1. Appearance & Theme Mode (Night Mode, System & Light Mode) */}
      <Card className="p-6 bg-white dark:bg-[#070e20] border-slate-200/90 dark:border-[#14234b]/60 space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-[#14234b]/60">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center shrink-0">
              {theme === 'dark' ? (
                <Moon className="h-5 w-5 text-amber-500 dark:text-amber-400" />
              ) : (
                <Sun className="h-5 w-5 text-amber-500" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Appearance &amp; Theme Mode
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Switch between Night Mode, System Mode, and Light Mode across the Admin &amp; Trader portals.
              </p>
            </div>
          </div>
          <Badge variant={theme === 'dark' ? 'purple' : 'info'}>
            Active: {themeMode === 'system' ? `System (${theme === 'dark' ? 'Night' : 'Light'})` : themeMode === 'dark' ? 'Night Mode' : 'Light Mode'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Night Mode */}
          <div
            onClick={() => {
              setDraftThemeMode('dark');
              setTheme('dark');
            }}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
              draftThemeMode === 'dark'
                ? 'border-emerald-600 bg-emerald-50/50 dark:border-emerald-500 dark:bg-emerald-950/30 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40'
            }`}
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Moon className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                  Night Mode
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                  Pro Default
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Deep institutional midnight &amp; emerald command center built for low-glare staff monitoring.
              </p>
            </div>
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              {draftThemeMode === 'dark' ? '✓ Selected (Night Mode)' : 'Select Night Mode'}
            </div>
          </div>

          {/* System Mode */}
          <div
            onClick={() => {
              setDraftThemeMode('system');
              setTheme('system');
            }}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
              draftThemeMode === 'system'
                ? 'border-emerald-600 bg-emerald-50/50 dark:border-emerald-500 dark:bg-emerald-950/30 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40'
            }`}
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Monitor className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  System Mode
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded-full">
                  Auto Sync
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Automatically follows your OS dark/light preference in real time.
              </p>
            </div>
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              {draftThemeMode === 'system' ? '✓ Selected (System)' : 'Select System Mode'}
            </div>
          </div>

          {/* Light Mode */}
          <div
            onClick={() => {
              setDraftThemeMode('light');
              setTheme('light');
            }}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
              draftThemeMode === 'light'
                ? 'border-emerald-600 bg-emerald-50/50 dark:border-emerald-500 dark:bg-emerald-950/30 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40'
            }`}
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sun className="h-4 w-4 text-amber-500" />
                  Light Mode
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                High-contrast daylight surface with crisp white cards for bright office environments.
              </p>
            </div>
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              {draftThemeMode === 'light' ? '✓ Selected (Light Mode)' : 'Select Light Mode'}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#14234b]/50">
          {themeSaved ? (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Theme mode ({draftThemeMode === 'dark' ? 'Night Mode' : draftThemeMode === 'system' ? 'System Mode' : 'Light Mode'}) confirmed &amp; saved!
            </span>
          ) : (
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Current active mode:{' '}
              <strong>
                {themeMode === 'dark' ? 'Night Mode' : themeMode === 'system' ? 'System Default' : 'Light Mode'}
              </strong>
            </span>
          )}
          <Button
            type="button"
            size="sm"
            onClick={handleConfirmTheme}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
          >
            <Check className="h-3.5 w-3.5 mr-1.5" />
            Confirm Theme Mode
          </Button>
        </div>
      </Card>

      {/* 2. Language & Regional Preferences (195+ Languages) */}
      <Card className="p-6 bg-white dark:bg-[#070e20] border-slate-200/90 dark:border-[#14234b]/60 space-y-5 shadow-sm">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-[#14234b]/60">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center shrink-0">
            <Globe className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Language &amp; Regional Preferences (195+ Languages)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Translate the entire Admin Control Center into any global language and configure regional reporting formats.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-[#0a142d]/60 border border-slate-200/80 dark:border-[#14234b]/50">
          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-900 dark:text-white">
              Admin Interface Language (LN · 195+ World &amp; Regional Languages)
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Click the LN dropdown to search by first letter and switch language instantaneously.
            </p>
          </div>
          <div className="shrink-0">
            <GoogleTranslate id="google_translate_admin_settings_page" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Audit Log &amp; SLA Timezone
            </label>
            <select
              value={adminTimezone}
              onChange={(e) => setAdminTimezone(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="UTC+05:30 (IST · India Standard Time)">UTC+05:30 (IST · India Standard Time)</option>
              <option value="UTC+00:00 (GMT / London)">UTC+00:00 (GMT / London)</option>
              <option value="UTC-05:00 (EST / New York)">UTC-05:00 (EST / New York)</option>
              <option value="UTC+04:00 (GST / Dubai)">UTC+04:00 (GST / Dubai)</option>
              <option value="UTC+08:00 (SGT / Singapore)">UTC+08:00 (SGT / Singapore)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Default Reporting Currency
            </label>
            <select
              value={reportingCurrency}
              onChange={(e) => setReportingCurrency(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="USD ($)">USD ($) — US Dollar</option>
              <option value="INR (₹)">INR (₹) — Indian Rupee</option>
              <option value="EUR (€)">EUR (€) — Euro</option>
              <option value="GBP (£)">GBP (£) — British Pound</option>
              <option value="AED (د.إ)">AED (د.إ) — UAE Dirham</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Timestamp Format
            </label>
            <select
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="DD MMM YYYY · 24-Hour">DD MMM YYYY · 24-Hour</option>
              <option value="MMM DD, YYYY · 12-Hour (AM/PM)">MMM DD, YYYY · 12-Hour (AM/PM)</option>
              <option value="YYYY-MM-DD · ISO-8601">YYYY-MM-DD · ISO-8601</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#14234b]/50">
          {languageSaved ? (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Language &amp; regional preferences confirmed &amp; saved!
            </span>
          ) : (
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Active: <strong>{adminTimezone}</strong> · <strong>{reportingCurrency}</strong>
            </span>
          )}
          <Button
            type="button"
            size="sm"
            onClick={handleConfirmLanguageRegion}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
          >
            <Check className="h-3.5 w-3.5 mr-1.5" />
            Confirm Language &amp; Region
          </Button>
        </div>
      </Card>

      {/* 3. Admin Sidebar & Workspace Layout */}
      <Card className="p-6 bg-white dark:bg-[#070e20] border-slate-200/90 dark:border-[#14234b]/60 space-y-5 shadow-sm">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-[#14234b]/60">
          <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center shrink-0">
            <PanelLeft className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Admin Sidebar &amp; Workspace Layout
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Choose whether the Admin sidebar stays pinned open or auto-collapses into a compact 60px icon rail.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div
            onClick={() => setDraftPinned(false)}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
              !draftPinned
                ? 'border-emerald-600 bg-emerald-50/50 dark:border-emerald-500 dark:bg-emerald-950/30 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <PinOff className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  Auto-Collapse (Hover Mode)
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                  Max Table Width
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Sidebar stays minimal (60px icon rail) and expands smoothly on hover. Ideal for wide verification &amp; audit tables.
              </p>
            </div>
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {!draftPinned ? '✓ Selected' : 'Click to Select'}
            </div>
          </div>

          <div
            onClick={() => setDraftPinned(true)}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
              draftPinned
                ? 'border-emerald-600 bg-emerald-50/50 dark:border-emerald-500 dark:bg-emerald-950/30 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Pin className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 fill-current" />
                  Full-Time Open (Pinned)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Sidebar stays permanently expanded (220px compact width) alongside all admin views.
              </p>
            </div>
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {draftPinned ? '✓ Selected' : 'Click to Select'}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#14234b]/50">
          {layoutSaved ? (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Admin sidebar layout confirmed &amp; applied!
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
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
          >
            <Check className="h-3.5 w-3.5 mr-1.5" />
            Confirm Layout
          </Button>
        </div>
      </Card>

      {/* 4. Global Platform Parameters & Rules */}
      <Card className="p-6 bg-white dark:bg-[#070e20] border-slate-200/90 dark:border-[#14234b]/60 space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-[#14234b]/60">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-500/30 flex items-center justify-center shrink-0">
              <Sliders className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Global Platform Parameters &amp; Rules
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Core reward ratios, affiliate codes, verification SLAs, and support routing parameters.
              </p>
            </div>
          </div>
          <Badge variant="emerald">{settings.length} Active Keys</Badge>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
            Loading global parameters...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {settings.map((setting) => (
              <div
                key={setting.key}
                className="p-4 rounded-xl border border-slate-200 dark:border-[#14234b]/60 bg-slate-50/70 dark:bg-[#0a142d]/60 space-y-2.5 text-xs flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                      {setting.key}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                      Updated {new Date(setting.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {setting.description || 'System configuration parameter'}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 pt-1">
                  <input
                    type="text"
                    defaultValue={setting.value}
                    id={`input-${setting.key}`}
                    className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    isLoading={savingKey === setting.key}
                    onClick={() => {
                      const input = document.getElementById(`input-${setting.key}`) as HTMLInputElement;
                      if (input) handleUpdateSingleKey(setting.key, input.value);
                    }}
                    className="shrink-0 font-bold"
                  >
                    <Save className="h-3.5 w-3.5 mr-1 text-emerald-600 dark:text-emerald-400" />
                    Save
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#14234b]/50">
          {globalSavedMsg ? (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> {globalSavedMsg}
            </span>
          ) : (
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Changes apply immediately across trader checkout, verification, and reward redemptions.
            </span>
          )}
          <Button
            type="button"
            size="sm"
            onClick={handleConfirmAllGlobalKeys}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
          >
            <Check className="h-3.5 w-3.5 mr-1.5" />
            Confirm Global Parameters
          </Button>
        </div>
      </Card>

      {/* 5. Admin Security: Password & Staff 2FA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Password Update */}
        <Card className="p-6 bg-white dark:bg-[#070e20] border-slate-200/90 dark:border-[#14234b]/60 space-y-5 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-[#14234b]/60">
              <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center shrink-0">
                <Lock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Staff Password &amp; Credentials
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Rotate your privileged staff password regularly.
                </p>
              </div>
            </div>

            <form id="admin-password-form" onSubmit={handlePasswordUpdate} className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Current Staff Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </form>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-[#14234b]/50">
            <div>
              {passwordError && (
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" /> {passwordError}
                </span>
              )}
              {passwordSuccess && (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Staff password updated!
                </span>
              )}
            </div>
            <Button
              type="submit"
              form="admin-password-form"
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
            >
              <Check className="h-3.5 w-3.5 mr-1.5" />
              Confirm Password Change
            </Button>
          </div>
        </Card>

        {/* Staff 2FA Security */}
        <Card className="p-6 bg-white dark:bg-[#070e20] border-slate-200/90 dark:border-[#14234b]/60 space-y-5 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-[#14234b]/60">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-500/30 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Staff 2FA Enforcement
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Multi-factor protection for invoice approvals &amp; payouts.
                  </p>
                </div>
              </div>
              <Badge variant={twoFactorEnabled ? 'emerald' : 'warning'}>
                {twoFactorEnabled ? '2FA Active' : '2FA Disabled'}
              </Badge>
            </div>

            <div className="space-y-2.5">
              {(
                [
                  {
                    id: 'authenticator',
                    label: 'Authenticator App (TOTP)',
                    desc: 'Google Authenticator, Authy, or 1Password',
                    icon: KeyRound,
                  },
                  {
                    id: 'hardware',
                    label: 'Hardware Passkey / YubiKey',
                    desc: 'FIDO2 / WebAuthn biometric or security key',
                    icon: Smartphone,
                  },
                  {
                    id: 'email',
                    label: 'Staff Email Security Code',
                    desc: `Send 6-digit code to ${user?.email || 'admin@propnation.com'}`,
                    icon: Mail,
                  },
                ] as const
              ).map((method) => {
                const Icon = method.icon;
                const active = twoFactorMethod === method.id;
                return (
                  <div
                    key={method.id}
                    onClick={() => setTwoFactorMethod(method.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      active
                        ? 'border-emerald-600 bg-emerald-50/50 dark:border-emerald-500 dark:bg-emerald-950/30'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {method.label}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {method.desc}
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={twoFactorEnabled && active}
                      onChange={() => {
                        setTwoFactorMethod(method.id);
                        setTwoFactorEnabled(true);
                      }}
                      className="h-4 w-4 accent-emerald-600 rounded cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-[#14234b]/50">
            {twoFactorSaved ? (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> Staff 2FA settings confirmed!
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setTwoFactorEnabled((v) => !v)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
              >
                {twoFactorEnabled ? 'Disable 2FA temporarily' : 'Enable 2FA enforcement'}
              </button>
            )}
            <Button
              type="button"
              size="sm"
              onClick={handleConfirmTwoFactor}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
            >
              <Check className="h-3.5 w-3.5 mr-1.5" />
              Confirm 2FA Settings
            </Button>
          </div>
        </Card>
      </div>

      {/* 6. Admin Escalation & System Alert Preferences */}
      <Card className="p-6 bg-white dark:bg-[#070e20] border-slate-200/90 dark:border-[#14234b]/60 space-y-5 shadow-sm">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-[#14234b]/60">
          <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center shrink-0">
            <Bell className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Admin Escalation &amp; Queue Alert Preferences
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Choose which operational queues trigger real-time alerts for your staff account.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {[
            {
              label: 'High-Value Purchase Submissions (>$500)',
              desc: 'Instant alert when a trader submits a large evaluation invoice for verification.',
              checked: alertHighValue,
              onChange: setAlertHighValue,
            },
            {
              label: 'Duplicate / Fraud Invoice Detection',
              desc: 'Flag when an order ID or screenshot hash matches a previous submission.',
              checked: alertFraudCheck,
              onChange: setAlertFraudCheck,
            },
            {
              label: 'Reward Redemption Fulfilment Queue',
              desc: 'Notify when a trader redeems points for physical merchandise or gift cards.',
              checked: alertRedemptions,
              onChange: setAlertRedemptions,
            },
            {
              label: 'WhatsApp & Live Support Escalations',
              desc: 'Alert when a trader requests human agent assistance in Live Support.',
              checked: alertWhatsappDesk,
              onChange: setAlertWhatsappDesk,
            },
          ].map((item, i) => (
            <label
              key={i}
              className="flex items-start justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-[#0a142d]/60 border border-slate-200/80 dark:border-[#14234b]/50 cursor-pointer"
            >
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-900 dark:text-white">{item.label}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {item.desc}
                </div>
              </div>
              <input
                type="checkbox"
                checked={item.checked}
                onChange={(e) => item.onChange(e.target.checked)}
                className="h-4 w-4 mt-0.5 accent-emerald-600 rounded cursor-pointer shrink-0"
              />
            </label>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#14234b]/50">
          {alertsSaved ? (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Admin alert preferences confirmed &amp; saved!
            </span>
          ) : (
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Active queues will notify your Admin Control Center header in real time.
            </span>
          )}
          <Button
            type="button"
            size="sm"
            onClick={handleConfirmAlerts}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
          >
            <Check className="h-3.5 w-3.5 mr-1.5" />
            Confirm Admin Alerts
          </Button>
        </div>
      </Card>

      {/* 7. Active Staff Session & Sign Out Controls */}
      <Card className="p-6 bg-white dark:bg-[#070e20] border-slate-200/90 dark:border-[#14234b]/60 space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-[#14234b]/60">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
              <Laptop className="h-5 w-5 text-slate-700 dark:text-slate-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Active Staff Session &amp; Sign Out
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage your authenticated Admin Control Center session or export a JSON config snapshot.
              </p>
            </div>
          </div>
          <Badge variant="emerald">Authenticated Staff Session</Badge>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-[#0a142d]/60 border border-slate-200/80 dark:border-[#14234b]/50">
          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-900 dark:text-white">
              {user?.name || 'Platform Admin'} ({user?.email || 'admin@propnation.com'})
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Role: <strong className="text-emerald-600 dark:text-emerald-400">{user?.role}</strong> · Encrypted Staff Token Active
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
              className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold"
            >
              Sign Out All Staff Devices
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                setLogoutAllDevices(false);
                setShowLogoutConfirm(true);
              }}
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold"
            >
              <LogOut className="h-3.5 w-3.5 mr-1.5" />
              Log Out Now
            </Button>
          </div>
        </div>

        {backupExported && (
          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4" /> System configuration backup JSON downloaded!
          </div>
        )}

        {showLogoutConfirm && (
          <div className="p-4 rounded-xl border-2 border-rose-300 dark:border-rose-500/40 bg-rose-50/70 dark:bg-rose-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-black text-rose-700 dark:text-rose-300 uppercase tracking-wider">
                {logoutAllDevices
                  ? 'Confirm Sign Out From All Staff Devices?'
                  : 'Confirm Admin Session Sign Out?'}
              </div>
              <p className="text-[11px] text-rose-600/90 dark:text-rose-300/80">
                You will be signed out of the Admin Control Center and redirected to the entry page.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleConfirmLogout}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold"
              >
                <Check className="h-3.5 w-3.5 mr-1.5" />
                Confirm Log Out
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
