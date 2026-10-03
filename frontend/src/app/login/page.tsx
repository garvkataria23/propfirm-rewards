'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SearchableCombobox, ComboboxOption } from '@/components/ui/searchable-combobox';
import { COUNTRIES_DATA } from '@/lib/geo-data';
import type { ConfirmationResult } from '@/lib/firebase';
import {
  Coins,
  Lock,
  Mail,
  Phone,
  ArrowRight,
  ShieldCheck,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  KeyRound,
  Smartphone,
} from 'lucide-react';

import { GoogleSignInModal } from '@/components/auth/google-sign-in-modal';

export default function LoginPage() {
  const router = useRouter();
  const { user, login, loginWithGoogle, sendPhoneOtp, verifyPhoneOtp, isLoading: authLoading } = useAuth();

  const [authMode, setAuthMode] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Phone Auth state
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneRaw, setPhoneRaw] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [otpSentMessage, setOtpSentMessage] = useState<string | null>(null);

  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [autoRedirecting, setAutoRedirecting] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  const dialCodeOptions: ComboboxOption[] = COUNTRIES_DATA.map((c) => ({
    value: c.dialCode,
    label: `${c.flag} ${c.dialCode}`,
    subtitle: `${c.name} (${c.code})`,
    flag: c.flag,
  }));

  // If user is already logged in / remembered, directly auto-redirect to dashboard!
  useEffect(() => {
    if (!authLoading && user) {
      setAutoRedirecting(true);
      const target = user.role === 'ADMIN' ? '/admin' : '/dashboard';
      router.replace(target);
    }
  }, [user, authLoading, router]);

  // Pre-fill remembered email
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('propfirm_saved_email');
      if (savedEmail) {
        setEmail(savedEmail);
      }
    }
  }, []);

  const isAdminRole = (role?: string) =>
    ['ADMIN', 'SUPER_ADMIN', 'SUPPORT_LEAD', 'SUPPORT_AGENT', 'FINANCE_OFFICER'].includes(role || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const loggedUser = await login(email, password, rememberMe);
      if (isAdminRole(loggedUser.role)) {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectGoogleSignIn = async () => {
    setError(null);
    setIsGoogleLoading(true);
    try {
      const loggedUser = await loginWithGoogle(undefined, rememberMe);
      if (isAdminRole(loggedUser.role)) {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Google Sign-In failed. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOtpSentMessage(null);

    if (!phoneRaw.trim()) {
      setError('Please enter your phone number.');
      return;
    }

    setIsLoading(true);
    try {
      const fullPhone = `${countryCode}${phoneRaw.replace(/[^0-9]/g, '')}`;
      const result = await sendPhoneOtp(fullPhone, 'recaptcha-container');
      setConfirmationResult(result);
      setOtpSentMessage(`Verification SMS sent to ${countryCode} ${phoneRaw}`);
    } catch (err: any) {
      setError(err.message || 'Failed to send SMS verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) return;
    setError(null);
    setIsLoading(true);

    try {
      const loggedUser = await verifyPhoneOtp(confirmationResult, otpCode, undefined, rememberMe);
      if (isAdminRole(loggedUser.role)) {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  const showDevQuickFill =
    process.env.NODE_ENV !== 'production' &&
    process.env.NEXT_PUBLIC_ENABLE_DEV_FAST_FILL === 'true';

  if (autoRedirecting || (user && !authLoading)) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
        <div className="text-center space-y-4 max-w-sm p-8 rounded-3xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900 shadow-xl">
          <div className="h-14 w-14 rounded-2xl bg-purple-600/10 text-purple-600 dark:text-purple-400 mx-auto flex items-center justify-center animate-pulse">
            <Coins className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Welcome back, {user?.name || 'Trader'}!
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Remembered session active. Opening your Dashboard directly...
            </p>
          </div>
          <div className="pt-2">
            <Link href="/dashboard">
              <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-10 rounded-xl">
                Open Dashboard Now &rarr;
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block">
            <div className="h-16 w-20 mx-auto flex items-center justify-center mb-2 hover:scale-105 transition-transform">
              <img
                src="/logo.png"
                alt="Prop Nation"
                className="h-full w-auto object-contain drop-shadow-md select-none"
              />
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Sign In to PropNation
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Access your points balance, track verification, and claim rewards.
          </p>
        </div>

        {/* Security Badge Pill */}
        <div className="flex items-center justify-center gap-2 p-2 rounded-xl bg-slate-100/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>Firebase Auth • Email, Google OAuth &amp; Phone OTP Protected</span>
        </div>

        {/* Development Fast-Fill Box (Excluded in Production) */}
        {showDevQuickFill && (
          <div className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-500/5 p-3.5 space-y-2.5 shadow-xs">
            <div className="text-[11px] uppercase tracking-wider font-bold text-amber-600 dark:text-amber-400 flex items-center justify-between">
              <span>Dev Quick-Fill (Local Dev Only)</span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">Development Only</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('email');
                  setEmail('trader@example.com');
                  setPassword('Trader@123456');
                  setError(null);
                }}
                className="text-left p-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all text-xs cursor-pointer"
              >
                <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  Demo Trader
                </div>
                <div className="text-[10px] text-slate-500 truncate">trader@example.com</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('email');
                  setEmail('admin@propfirmrewards.com');
                  setPassword('Admin@123456');
                  setError(null);
                }}
                className="text-left p-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-purple-500/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all text-xs cursor-pointer"
              >
                <div className="font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-1">
                  <KeyRound className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                  Platform Admin
                </div>
                <div className="text-[10px] text-slate-500 truncate">admin@propfirmrewards.com</div>
              </button>
            </div>
          </div>
        )}

        {/* Login Form Card */}
        <Card className="p-6 sm:p-7 space-y-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {otpSentMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{otpSentMessage}</span>
            </div>
          )}

          {/* Continue with Google Button */}
          <button
            type="button"
            disabled={isGoogleLoading || isLoading}
            onClick={handleDirectGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 h-11 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-bold shadow-xs hover:bg-slate-50 dark:hover:bg-slate-900 hover:border-purple-400 transition-all cursor-pointer disabled:opacity-60"
          >
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
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
            <span>{isGoogleLoading ? 'Signing in with Google...' : 'Continue with Google'}</span>
          </button>

          {/* Auth Method Switcher: Email/Password vs Phone OTP */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setAuthMode('email');
                setError(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                authMode === 'email'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <Mail className="h-3.5 w-3.5" />
              <span>Email &amp; Password</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('phone');
                setError(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                authMode === 'phone'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>Phone SMS (OTP)</span>
            </button>
          </div>

          {/* Invisible reCAPTCHA container for Firebase Phone Auth */}
          <div id="recaptcha-container" />

          {authMode === 'email' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="trader@example.com"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 pl-9 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Password</label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 pl-9 pr-10 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Remember this device</span>
                </label>
                <span className="text-[11px] text-slate-400">Secure Session</span>
              </div>

              <Button type="submit" size="lg" className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20" isLoading={isLoading}>
                Sign In to Trader Account
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </form>
          ) : !confirmationResult ? (
            <form onSubmit={handleSendPhoneOtp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Phone Number (SMS Verification)</span>
                </label>
                <div className="grid grid-cols-[135px_1fr] gap-2">
                  <SearchableCombobox
                    options={dialCodeOptions}
                    value={countryCode}
                    onChange={setCountryCode}
                    placeholder="+ Code"
                    searchPlaceholder="Type code/country..."
                  />
                  <input
                    type="tel"
                    required
                    placeholder="555 019 2834"
                    value={phoneRaw}
                    onChange={(e) => setPhoneRaw(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  We&apos;ll send a 6-digit SMS one-time passcode via Firebase Phone Authentication.
                </p>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20"
                isLoading={isLoading}
              >
                Send Verification SMS
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyPhoneOtp} className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Enter 6-Digit SMS Code
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmationResult(null);
                      setOtpCode('');
                      setOtpSentMessage(null);
                    }}
                    className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline cursor-pointer"
                  >
                    Change number
                  </button>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2.5 text-center tracking-[0.35em] font-mono text-base font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20"
                isLoading={isLoading}
              >
                Verify OTP &amp; Sign In
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </form>
          )}

          <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-200 dark:border-slate-800">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
              Create Free Account
            </Link>
          </div>
        </Card>

        {/* Google OAuth Modal */}
        <GoogleSignInModal
          isOpen={isGoogleModalOpen}
          onClose={() => setIsGoogleModalOpen(false)}
          rememberMe={rememberMe}
        />
      </div>
    </div>
  );
}
