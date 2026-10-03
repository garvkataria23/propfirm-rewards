'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { GoogleTranslate } from '@/components/ui/google-translate';
import {
  Coins,
  ShieldCheck,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  ArrowRight,
} from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 18);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isPortal = pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin');
  if (isPortal) return null;

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href.startsWith('/#')) return false;
    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  const navLinks = [
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Videos', href: '/#video-academy' },
    { label: 'Prop Firms', href: '/prop-firms' },
    { label: 'Compare & Rules', href: '/compare' },
    { label: 'Rewards', href: '/rewards' },
    { label: 'FAQ', href: '/#faq' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-white/92 dark:bg-[#05080d]/90 backdrop-blur-xl border-b border-slate-200 dark:border-white/[0.08] shadow-sm dark:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.65)]'
          : 'bg-white/80 dark:bg-[#05080d]/65 backdrop-blur-md border-b border-slate-200/70 dark:border-white/[0.04]'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Logo */}
        <Link
          href={user ? '/dashboard' : '/'}
          className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xl"
        >
          <div className="relative h-9 w-9 shrink-0 rounded-xl bg-[#090d14] border border-slate-200 dark:border-white/10 shadow-sm flex items-center justify-center p-0.5 overflow-hidden group-hover:border-emerald-500/50 group-hover:scale-105 transition-all duration-200">
            <img
              src="/pn-logo-hd.png?v=3"
              alt="PROP NATION Logo"
              className="h-full w-full object-contain rounded-lg select-none"
            />
          </div>
          <span className="text-base sm:text-lg font-extrabold tracking-tight leading-none flex items-center text-slate-900 dark:text-white">
            <span>PROP</span>
            <span className="text-emerald-600 dark:text-emerald-400 ml-1.5">NATION</span>
          </span>
        </Link>

        {/* Center: Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-7" aria-label="Main Navigation">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors duration-200 relative py-1 ${
                  active
                    ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {link.label}
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />

          {user ? (
            <div className="flex items-center gap-2.5">
              {/* Points Badge */}
              <Link
                href="/dashboard/points"
                className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all hover:bg-emerald-500/15 hover:border-emerald-500/40"
              >
                <Coins className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{(user.points?.available || 0).toLocaleString()} PTS</span>
              </Link>

              {user.role === 'ADMIN' && (
                <Link href="/admin">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 mr-1 text-emerald-600 dark:text-emerald-400" />
                    Admin
                  </Button>
                </Link>
              )}

              <Link href="/dashboard">
                <Button
                  size="sm"
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs h-9 px-4 rounded-xl transition-all hover:-translate-y-0.5"
                >
                  <LayoutDashboard className="h-3.5 w-3.5 mr-1.5" />
                  Dashboard
                </Button>
              </Link>

              <button
                onClick={logout}
                title="Sign out"
                aria-label="Sign out"
                className="rounded-lg p-2 text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                href="/login"
                className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="group inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm h-9 px-4 rounded-xl shadow-[0_0_20px_-5px_rgba(16,185,129,0.45)] transition-all duration-200 hover:-translate-y-0.5"
              >
                <span>Get Started</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Header Controls */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          {user && (
            <Link
              href="/dashboard/points"
              className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold"
            >
              <Coins className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              <span>{(user.points?.available || 0).toLocaleString()}</span>
            </Link>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/[0.03] text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/40 transition-all cursor-pointer"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Full-Width Drawer */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${
          mobileMenuOpen ? 'max-h-[560px] opacity-100 border-b border-slate-200 dark:border-white/10' : 'max-h-0 opacity-0'
        } bg-white/98 dark:bg-[#06090f]/98 backdrop-blur-2xl`}
      >
        <div className="px-4 pt-3 pb-6 space-y-4">
          <nav className="flex flex-col space-y-1" aria-label="Mobile Navigation">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-3 text-sm font-semibold rounded-xl transition-colors ${
                    active
                      ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>{link.label}</span>
                  <ArrowRight className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-slate-200 dark:border-white/[0.08] space-y-2.5">
            {!user ? (
              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center h-11 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/[0.03] text-slate-900 dark:text-white font-semibold text-sm hover:bg-slate-200 dark:hover:bg-white/[0.06] transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 h-11 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-sm transition-colors"
                >
                  <span>Get Started</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 h-11 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/purchases/new"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center h-11 rounded-xl border border-white/10 bg-white/[0.04] text-white font-semibold text-sm"
                >
                  Submit Proof
                </Link>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-400">Theme &amp; Language</span>
              <ThemeToggle />
            </div>
            <GoogleTranslate id="google_translate_drawer" compact />
          </div>

          {user && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="w-full py-2.5 rounded-xl text-rose-400 hover:bg-rose-950/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out ({user.name})
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
