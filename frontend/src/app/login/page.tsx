'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Coins,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { user, login, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRedirecting, setAutoRedirecting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const loggedUser = await login(email, password, rememberMe);
      if (loggedUser.role === 'ADMIN') {
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

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

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
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 mb-1">
            <Coins className="h-6 w-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Sign In to PropRewards
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Access your points balance, track verification, and claim rewards.
          </p>
        </div>

        {/* Security Badge Pill */}
        <div className="flex items-center justify-center gap-2 p-2 rounded-xl bg-slate-100/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>256-Bit SSL Encrypted • Rate-Limit &amp; Brute-Force Protected</span>
        </div>

        {/* Demo Fast-Fill Box */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-3.5 space-y-2.5 shadow-xs">
          <div className="text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Instant Demo Quick-Fill</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Pre-seeded accounts</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('trader@example.com', 'Trader@123456')}
              className="text-left p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all text-xs cursor-pointer"
            >
              <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                Demo Trader
              </div>
              <div className="text-[10px] text-slate-500 truncate">trader@example.com</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('admin@propfirmrewards.com', 'Admin@123456')}
              className="text-left p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-purple-500/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all text-xs cursor-pointer"
            >
              <div className="font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-1">
                <KeyRound className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                Platform Admin
              </div>
              <div className="text-[10px] text-slate-500 truncate">admin@propfirmrewards.com</div>
            </button>
          </div>
        </div>

        {/* Login Form Card */}
        <Card className="p-6 sm:p-7 space-y-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

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

          <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-200 dark:border-slate-800">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
              Create Free Account
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
