'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CountrySelect } from '@/components/ui/country-select';
import { SearchableCombobox, ComboboxOption } from '@/components/ui/searchable-combobox';
import { COUNTRIES_DATA, findCountry } from '@/lib/geo-data';
import type { ConfirmationResult } from '@/lib/firebase';
import {
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  MessageCircle,
  Sparkles,
  Smartphone,
} from 'lucide-react';
import { GoogleSignInModal } from '@/components/auth/google-sign-in-modal';

export default function RegisterPage() {
  const router = useRouter();
  const { user, register, loginWithGoogle, sendPhoneOtp, verifyPhoneOtp } = useAuth();
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'email' | 'phone'>('email');

  // Auto redirect if user is already authenticated
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    country: 'United States',
  });
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneRaw, setPhoneRaw] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [otpSentMessage, setOtpSentMessage] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Dial code options with live letter/digit filtering
  const dialCodeOptions: ComboboxOption[] = COUNTRIES_DATA.map((c) => ({
    value: c.dialCode,
    label: `${c.flag} ${c.dialCode}`,
    subtitle: `${c.name} (${c.code})`,
    flag: c.flag,
  }));

  const handleCountryChange = (selectedCountry: string) => {
    const found = findCountry(selectedCountry);
    setFormData((prev) => ({ ...prev, country: selectedCountry }));
    if (found?.dialCode) {
      setCountryCode(found.dialCode);
    }
  };

  const handleDialCodeChange = (code: string) => {
    setCountryCode(code);
    const found = COUNTRIES_DATA.find((c) => c.dialCode === code);
    if (found) {
      setFormData((prev) => ({ ...prev, country: found.name }));
    }
  };

  // 1-Click Fast Fill for zero typing during testing or demo
  const handleFastFill = () => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    setFormData({
      name: 'Alex Trader',
      email: `alex.trader.${randomSuffix}@example.com`,
      password: 'TraderSecret123!',
      phone: '+1 555-019-2834',
      country: 'United States',
    });
    setCountryCode('+1');
    setPhoneRaw('555-019-2834');
    setAgreed(true);
  };

  // Simple password strength calculation
  const getPasswordStrength = () => {
    const p = formData.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };

  const strength = getPasswordStrength();

  const handleDirectGoogleSignIn = async () => {
    setError(null);
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle(undefined, rememberMe);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Google Sign-In failed. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setError('Please agree to the platform affiliate reward terms');
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const fullPhone = phoneRaw ? `${countryCode} ${phoneRaw.trim()}` : '';
      await register({
        ...formData,
        phone: fullPhone || formData.phone,
      });

      if (rememberMe) {
        localStorage.setItem('propfirm_remember_login', 'true');
        localStorage.setItem('propfirm_saved_email', formData.email);
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setError('Please agree to the platform affiliate reward terms');
      return;
    }
    if (!phoneRaw.trim()) {
      setError('Please enter your phone number.');
      return;
    }
    setError(null);
    setOtpSentMessage(null);
    setIsLoading(true);

    try {
      const fullPhone = `${countryCode}${phoneRaw.replace(/[^0-9]/g, '')}`;
      const result = await sendPhoneOtp(fullPhone, 'register-recaptcha-container');
      setConfirmationResult(result);
      setOtpSentMessage(`Verification SMS sent to ${countryCode} ${phoneRaw}`);
    } catch (err: any) {
      setError(err.message || 'Failed to send verification SMS.');
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
      await verifyPhoneOtp(
        confirmationResult,
        otpCode,
        {
          name: formData.name || undefined,
          country: formData.country || 'United States',
        },
        rememberMe
      );
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid verification code.');
    } finally {
      setIsLoading(false);
    }
  };

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
            Create Trader Account
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Start earning up to 30% points from your prop firm challenge purchases.
          </p>
        </div>

        {/* 1-Click Fast Fill Banner */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 border border-purple-200/80 dark:border-purple-800/40 text-xs">
          <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200">
            <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0" />
            <span className="font-semibold text-[11px]">Testing or exploring?</span>
          </div>
          <button
            type="button"
            onClick={handleFastFill}
            className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] shadow-sm transition-colors cursor-pointer"
          >
            ⚡ 1-Click Fast Fill
          </button>
        </div>

        {/* Security Badge Pill */}
        <div className="flex items-center justify-center gap-2 p-2 rounded-xl bg-slate-100/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
          <ShieldCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <span>Firebase Auth &amp; Firestore • Email, Google &amp; Phone SMS Ready</span>
        </div>

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

          {/* Auth Method Switcher */}
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

          <div id="register-recaptcha-container" />

          {authMode === 'email' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Morgan"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 pl-9 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-purple-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="alex.m@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 pl-9 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-purple-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Country Selector (Searchable Combobox) */}
              <div className="space-y-1.5">
                <CountrySelect
                  label="Country of Residence *"
                  value={formData.country}
                  onChange={handleCountryChange}
                />
              </div>

              {/* WhatsApp Phone Number with Live Searchable Dial Code Dropdown */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <MessageCircle className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                    <span>WhatsApp Number (For Reminders)</span>
                  </label>
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">Auto Alerts</span>
                </div>
                <div className="grid grid-cols-[118px_1fr] sm:grid-cols-[140px_1fr] gap-2">
                  <SearchableCombobox
                    options={dialCodeOptions}
                    value={countryCode}
                    onChange={handleDialCodeChange}
                    placeholder="+ Code"
                    searchPlaceholder="Type code/country..."
                  />
                  <input
                    type="tel"
                    placeholder="98765 43210"
                    value={phoneRaw}
                    onChange={(e) => setPhoneRaw(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Password with Strength Meter */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="At least 8 characters recommended"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 pl-9 pr-10 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-purple-500 focus:outline-none transition-colors"
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

                {/* Password Strength Meter */}
                {formData.password && (
                  <div className="space-y-1 pt-1">
                    <div className="flex gap-1 h-1.5 w-full">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-full flex-1 rounded-full transition-all ${
                            strength >= level
                              ? strength <= 2
                                ? 'bg-amber-500'
                                : 'bg-purple-600'
                              : 'bg-slate-200 dark:bg-slate-800'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Password Security:</span>
                      <span className={strength >= 3 ? 'text-purple-600 font-bold' : 'text-amber-500 font-bold'}>
                        {strength <= 1 ? 'Weak' : strength === 2 ? 'Fair' : strength === 3 ? 'Strong' : 'Very Strong'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="font-medium">Remember login on this device</span>
                </label>
              </div>

              <label className="flex items-start gap-2 pt-1 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-purple-600 focus:ring-purple-500"
                />
                <span>
                  I agree to the Terms of Service and understand PropFirm Rewards is an independent loyalty rewards portal.
                </span>
              </label>

              <Button
                type="submit"
                size="lg"
                className="w-full h-11 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md shadow-purple-600/20"
                isLoading={isLoading}
              >
                Complete Registration &amp; Activate Account
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </form>
          ) : !confirmationResult ? (
            <form onSubmit={handleSendPhoneOtp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Morgan"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 pl-9 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-purple-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <CountrySelect
                  label="Country of Residence *"
                  value={formData.country}
                  onChange={handleCountryChange}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                  <span>Phone Number (SMS OTP Registration) *</span>
                </label>
                <div className="grid grid-cols-[118px_1fr] sm:grid-cols-[140px_1fr] gap-2">
                  <SearchableCombobox
                    options={dialCodeOptions}
                    value={countryCode}
                    onChange={handleDialCodeChange}
                    placeholder="+ Code"
                    searchPlaceholder="Type code/country..."
                  />
                  <input
                    type="tel"
                    required
                    placeholder="555 019 2834"
                    value={phoneRaw}
                    onChange={(e) => setPhoneRaw(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <label className="flex items-start gap-2 pt-1 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-purple-600 focus:ring-purple-500"
                />
                <span>
                  I agree to the Terms of Service and understand PropFirm Rewards is an independent loyalty rewards portal.
                </span>
              </label>

              <Button
                type="submit"
                size="lg"
                className="w-full h-11 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md shadow-purple-600/20"
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
                    className="text-xs text-purple-600 dark:text-purple-400 font-semibold hover:underline cursor-pointer"
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
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2.5 text-center tracking-[0.35em] font-mono text-base font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-11 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md shadow-purple-600/20"
                isLoading={isLoading}
              >
                Verify OTP &amp; Create Account
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </form>
          )}

          <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-200 dark:border-slate-800">
            Already have an account?{' '}
            <Link href="/login" className="text-purple-600 dark:text-purple-400 font-bold hover:underline">
              Sign In
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
