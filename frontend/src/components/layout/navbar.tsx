'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isPortal = pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin');
  if (isPortal) return null;

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href.startsWith('/#')) return false;
    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  const navLinks = [
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Prop Firms', href: '/prop-firms' },
    { label: 'Rewards', href: '/rewards' },
    { label: 'FAQ', href: '/#faq' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Logo */}
        <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-3 group">
          <div className="relative h-10 w-10 shrink-0 rounded-xl bg-[#06090e] border border-slate-700/80 dark:border-slate-800 shadow-md shadow-black/10 flex items-center justify-center p-1 overflow-hidden group-hover:border-emerald-500/60 group-hover:scale-105 transition-all">
            <img
              src="/logo.png"
              alt="Prop Nation PN Logo"
              className="h-full w-full object-contain select-none"
            />
          </div>
          <span className="text-lg font-[900] tracking-tight text-slate-900 dark:text-white leading-tight flex items-center">
            PROP NATION<span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 align-super ml-0.5">®</span>
          </span>
        </Link>

        {/* Center: Clean Minimalist Nav Links */}
        <nav className="hidden md:flex items-center gap-8 lg:gap-10">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-semibold transition-colors ${
                  active
                    ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                    : 'text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {link.label}
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
                className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/80 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300 px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:bg-emerald-100/60 shadow-2xs"
              >
                <Coins className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{(user.points?.available || 0).toLocaleString()} PTS</span>
              </Link>

              {user.role === 'ADMIN' && (
                <Link href="/admin">
                  <Button variant="ghost" size="sm" className="text-xs font-semibold text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
                    <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                    Admin
                  </Button>
                </Link>
              )}

              <Link href="/dashboard">
                <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 font-bold text-xs h-9 px-4 rounded-xl shadow-xs">
                  <LayoutDashboard className="h-3.5 w-3.5 mr-1.5" />
                  Dashboard
                </Button>
              </Link>

              <button
                onClick={logout}
                title="Sign out"
                className="rounded-lg p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-xs font-bold text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white px-3.5">
                  Log In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-sm shadow-emerald-600/15">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Header Buttons */}
        <div className="flex md:hidden items-center gap-2">
          {user && (
            <Link
              href="/dashboard/points"
              className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300 px-2 py-1 rounded-xl text-[11px] font-bold"
            >
              <Coins className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              <span>{(user.points?.available || 0).toLocaleString()}</span>
            </Link>
          )}

          <ThemeToggle />

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 hover:text-emerald-600 transition-all cursor-pointer"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Clean Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white/98 dark:bg-slate-950/98 px-5 pt-3 pb-6 space-y-4 backdrop-blur-2xl transition-all animate-in slide-in-from-top-2 duration-200 shadow-xl">
          {/* Navigation Links */}
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                    active
                      ? 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10 font-bold'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900'
                  }`}
                >
                  <span>{link.label}</span>
                  {active && <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />}
                </Link>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
            {!user ? (
              <div className="grid grid-cols-2 gap-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full">
                  <Button variant="secondary" className="w-full h-11 rounded-xl font-bold text-xs bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                    Log In
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="w-full">
                  <Button className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="w-full">
                  <Button className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm">
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
          </div>

          {/* Language Selector */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Language:</span>
            <GoogleTranslate id="google_translate_drawer" compact />
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
