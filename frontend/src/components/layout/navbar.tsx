'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
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
    { label: 'How It Works', href: '/how-it-works', icon: Compass },
    { label: 'Prop Firms', href: '/prop-firms', icon: Layers },
    { label: 'Rewards Store', href: '/rewards', icon: Gift },
    { label: 'FAQ', href: '/faq', icon: HelpCircle },
    { label: 'Contact', href: '/contact', icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/90 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo - FundingPips Classy Style */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0c182a] text-white shadow-xs group-hover:scale-105 transition-transform">
            <span className="font-black text-sm tracking-tighter text-sky-400">P<span className="text-white">N</span></span>
          </div>
          <div className="flex items-center">
            <span className="text-lg font-black tracking-tight text-[#0c182a] dark:text-white">
              PropNation<span className="text-xs font-normal text-slate-400 align-super ml-0.5">®</span>
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  active
                    ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA / User Status / Theme Switcher */}
        <div className="hidden md:flex items-center gap-3">
          {/* Light / Dark Mode Toggle */}
          <ThemeToggle />

          {user ? (
            <div className="flex items-center gap-3">
              {/* Points Badge */}
              <Link
                href="/dashboard/points"
                className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/30 hover:border-emerald-400 text-emerald-800 dark:text-emerald-300 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs"
              >
                <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
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
                <Button className="bg-[#0c182a] hover:bg-[#162742] text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs tracking-tight">
                  Buy Challenge
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger & Theme Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />

          {user && (
            <Link
              href="/dashboard/points"
              className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 px-2.5 py-1 rounded-full text-xs font-bold"
            >
              <Sparkles className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              <span>{(user.points?.available || 0).toLocaleString()}</span>
            </Link>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 px-4 pt-3 pb-6 space-y-3 backdrop-blur-2xl transition-colors">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold rounded-lg ${
                    active
                      ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex flex-col gap-2">
            {user ? (
              <>
                <div className="px-3 py-1 text-xs text-slate-500">Signed in as {user.name}</div>
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" className="w-full justify-start">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Trader Dashboard
                  </Button>
                </Link>
                {user.role === 'ADMIN' && (
                  <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="secondary" className="w-full justify-start text-purple-700 border-purple-200 dark:text-purple-300 dark:border-purple-500/30">
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      Admin Portal
                    </Button>
                  </Link>
                )}
                <Button
                  variant="danger"
                  className="w-full justify-start"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full">
                    Start Earning
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
