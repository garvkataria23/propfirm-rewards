'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { GoogleTranslate } from '@/components/ui/google-translate';
import {
  Sparkles,
  Coins,
  ShieldCheck,
  Gift,
  Compass,
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  Layers,
  HelpCircle,
} from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isPortal = pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin');
  if (isPortal) return null;

  const isActive = (href: string) => pathname === href || pathname?.startsWith(`${href}/`);

  const navLinks = [
    { label: 'How It Works', href: user ? '/dashboard/help-center' : '/how-it-works', icon: Compass },
    { label: 'Prop Firms', href: user ? '/dashboard/prop-firms' : '/prop-firms', icon: Layers },
    { label: 'Rewards Store', href: user ? '/dashboard/rewards' : '/rewards', icon: Gift },
    { label: 'FAQ', href: user ? '/dashboard/faq' : '/faq', icon: HelpCircle },
    { label: 'Contact', href: user ? '/dashboard/support' : '/contact', icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/90 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo - Official PropNation PN Emblem */}
        <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
          <div className="relative h-9 w-10 sm:h-10 sm:w-11 flex items-center justify-center group-hover:scale-105 transition-transform">
            <img
              src="/logo.png"
              alt="Prop Nation"
              className="h-full w-auto object-contain drop-shadow-xs select-none"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-[900] tracking-tight text-slate-900 dark:text-white leading-tight flex items-center">
              PROP NATION<span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 align-super ml-0.5">®</span>
            </span>
            <span className="text-[9px] font-bold tracking-widest text-slate-500 uppercase -mt-0.5">
              Trade • Earn • Get Rewarded
            </span>
          </div>
        </Link>

        {/* Universal Referral Code: NATION Front & Center */}
        <div className="hidden lg:flex items-center gap-2 bg-gradient-to-r from-purple-50 via-violet-50 to-indigo-50 dark:from-purple-950/50 dark:via-violet-950/40 dark:to-indigo-950/50 border border-purple-200/80 dark:border-purple-800/80 px-3 py-1 rounded-full text-xs shadow-xs">
          <span className="text-[11px] text-purple-700 dark:text-purple-300 font-semibold">Referral Code:</span>
          <span className="font-mono font-black text-purple-900 dark:text-purple-100 tracking-wider bg-white dark:bg-purple-900/80 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-700">
            NATION
          </span>
          <span className="text-[10px] text-purple-700 dark:text-purple-300 font-bold">1$ = 100 PTS</span>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  active
                    ? 'text-purple-700 bg-purple-50 dark:text-purple-300 dark:bg-purple-950/50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA / User Status / Theme Switcher / Language */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Google Translate (100+ Languages) */}
          <GoogleTranslate id="google_translate_desktop" />

          {/* Light / Dark Mode Toggle */}
          <ThemeToggle />

          {user ? (
            <div className="flex items-center gap-3">
              {/* Points Badge */}
              <Link
                href="/dashboard/points"
                className="flex items-center gap-1.5 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-500/30 hover:border-purple-400 text-purple-900 dark:text-purple-200 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs"
              >
                <Sparkles className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 animate-pulse" />
                <span>{(user.points?.available || 0).toLocaleString()} PTS</span>
              </Link>

              {/* Dashboard / Admin links */}
              {user.role === 'ADMIN' && (
                <Link href="/admin">
                  <Button variant="secondary" size="sm" className="border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-500/30 dark:bg-slate-900 dark:text-purple-300">
                    <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                    Admin
                  </Button>
                </Link>
              )}

              <Link href="/dashboard">
                <Button variant="secondary" size="sm" className="bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800">
                  <LayoutDashboard className="h-3.5 w-3.5 mr-1" />
                  Dashboard
                </Button>
              </Link>

              {/* Logout */}
              <button
                onClick={logout}
                title="Sign out"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-rose-400 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white">
                  Sign In
                </Button>
              </Link>
              <Link href="/prop-firms">
                <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md shadow-purple-500/20 tracking-tight">
                  Buy Challenge
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Ultra-Clean Modern Mobile Actions */}
        <div className="flex md:hidden items-center gap-2">
          {/* User Points Badge if logged in */}
          {user && (
            <Link
              href="/dashboard/points"
              className="flex items-center gap-1 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-500/30 text-purple-800 dark:text-purple-300 px-2 py-1 rounded-xl text-[11px] font-bold shadow-2xs"
            >
              <Sparkles className="h-3 w-3 text-purple-600 dark:text-purple-400 shrink-0" />
              <span>{(user.points?.available || 0).toLocaleString()}</span>
            </Link>
          )}

          {/* Compact 2-letter Language Pill (Opens Smooth Mobile Bottom Sheet) */}
          <GoogleTranslate id="google_translate_mobile" compact pill />

          {/* Modern Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 hover:text-purple-600 hover:border-purple-300 dark:hover:text-purple-400 transition-all shadow-2xs active:scale-95 cursor-pointer"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Modern High-Conversion Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200/90 dark:border-slate-800/90 bg-white/98 dark:bg-slate-950/98 px-4 pt-3 pb-6 space-y-3.5 backdrop-blur-2xl transition-all animate-in slide-in-from-top-2 duration-200 shadow-2xl">
          {/* Universal Referral Code Card */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-purple-50 via-violet-50 to-indigo-50 dark:from-purple-950/40 dark:via-violet-950/30 dark:to-indigo-950/40 border border-purple-200/80 dark:border-purple-800/80">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold tracking-wider text-purple-600 dark:text-purple-400">
                Official Universal Code
              </span>
              <span className="text-sm font-black font-mono text-purple-950 dark:text-purple-100 tracking-wider">
                NATION
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-white dark:bg-purple-900/60 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-700">
                10% OFF
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText('NATION');
                }}
                className="text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 active:scale-95 px-2.5 py-1 rounded-lg transition-all shadow-xs cursor-pointer"
              >
                Copy
              </button>
            </div>
          </div>

          {/* Quick Primary Actions */}
          {!user ? (
            <div className="grid grid-cols-2 gap-2">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full">
                <Button variant="secondary" className="w-full h-11 rounded-xl font-bold text-xs bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                  Sign In
                </Button>
              </Link>
              <Link href="/prop-firms" onClick={() => setMobileMenuOpen(false)} className="w-full">
                <Button className="w-full h-11 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-xs shadow-md shadow-purple-500/20">
                  Buy Challenge
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="w-full">
                <Button className="w-full h-11 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-xs shadow-md shadow-purple-500/20">
                  <LayoutDashboard className="h-4 w-4 mr-1.5" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/dashboard/purchases/new" onClick={() => setMobileMenuOpen(false)} className="w-full">
                <Button variant="secondary" className="w-full h-11 rounded-xl font-bold text-xs bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                  Submit Proof
                </Button>
              </Link>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 pt-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                    active
                      ? 'text-purple-700 bg-purple-50 dark:text-purple-300 dark:bg-purple-950/60 font-bold border border-purple-200 dark:border-purple-800'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4.5 w-4.5 ${active ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'}`} />
                    <span>{link.label}</span>
                  </div>
                  {active && <span className="h-2 w-2 rounded-full bg-purple-600" />}
                </Link>
              );
            })}
          </nav>

          {/* Preferences Row (Theme + Language) */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Theme:</span>
              <ThemeToggle />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Language:</span>
              <GoogleTranslate id="google_translate_drawer" compact />
            </div>
          </div>

          {/* User Signout */}
          {user && (
            <div className="pt-1">
              <Button
                variant="ghost"
                className="w-full justify-center text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 text-xs font-bold"
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
              >
                <LogOut className="h-3.5 w-3.5 mr-1.5" />
                Sign Out ({user.name})
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
