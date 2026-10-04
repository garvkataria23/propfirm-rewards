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
  MessageSquare,
} from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeHash, setActiveHash] = useState('');

  useEffect(() => {
    const syncHash = () => {
      if (typeof window !== 'undefined') {
        setActiveHash(window.location.hash || '');
      }
    };
    syncHash();
    window.addEventListener('hashchange', syncHash);
    window.addEventListener('popstate', syncHash);
    return () => {
      window.removeEventListener('hashchange', syncHash);
      window.removeEventListener('popstate', syncHash);
    };
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 18);

      if (pathname === '/') {
        const howEl = document.getElementById('how-it-works');
        const vidEl = document.getElementById('video-academy');
        const scrollPos = window.scrollY + 180;

        if (vidEl && scrollPos >= vidEl.offsetTop && scrollPos < vidEl.offsetTop + vidEl.offsetHeight) {
          setActiveHash('#video-academy');
        } else if (howEl && scrollPos >= howEl.offsetTop && scrollPos < howEl.offsetTop + howEl.offsetHeight) {
          setActiveHash('#how-it-works');
        } else if (window.scrollY < 300 && !window.location.hash) {
          setActiveHash('');
        }
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  const isPortal = pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin');
  if (isPortal) return null;

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/' && !activeHash;
    if (href === '/#how-it-works') {
      return pathname === '/how-it-works' || (pathname === '/' && activeHash === '#how-it-works');
    }
    if (href === '/#video-academy') {
      return pathname === '/videos' || (pathname === '/' && activeHash === '#video-academy');
    }
    if (href.startsWith('/#')) {
      const targetHash = href.slice(1);
      return pathname === '/' && activeHash === targetHash;
    }
    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  const navLinks = [
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Videos', href: '/#video-academy' },
    { label: 'Prop Firms', href: '/prop-firms' },
    { label: 'Compare & Rules', href: '/compare' },
    { label: 'Rewards', href: '/rewards' },
    { label: 'Live Support', href: '/support/live' },
  ];

  const handleNavClick = (href: string) => {
    if (href.startsWith('/#')) {
      setActiveHash(href.slice(1));
    } else {
      setActiveHash('');
    }
  };

  const openFloatingLiveChat = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('propnation-open-live-chat'));
    }
  };

  const handleBrandClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setActiveHash('');
    setMobileMenuOpen(false);
    if (typeof window !== 'undefined') {
      if (pathname === '/') {
        e.preventDefault();
        if (window.location.hash) {
          window.history.pushState(null, '', '/');
        }
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-white/92 dark:bg-[#05080d]/90 backdrop-blur-xl border-b border-slate-200 dark:border-white/[0.08] shadow-sm dark:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.65)]'
          : 'bg-white/80 dark:bg-[#05080d]/65 backdrop-blur-md border-b border-slate-200/70 dark:border-white/[0.04]'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Logo */}
        <Link
          href="/"
          scroll={true}
          onClick={handleBrandClick}
          className="flex items-center gap-2.5 shrink-0 whitespace-nowrap group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xl cursor-pointer"
        >
          <div className="relative h-9 w-9 shrink-0 rounded-xl bg-[#090d14] border border-slate-200 dark:border-white/10 shadow-sm flex items-center justify-center p-0.5 overflow-hidden group-hover:border-emerald-500/50 group-hover:scale-105 transition-all duration-200">
            <img
              src="/pn-logo-hd.png?v=3"
              alt="PROP NATION Logo"
              className="h-full w-full object-contain rounded-lg select-none"
            />
          </div>
          <span className="text-base sm:text-lg font-extrabold tracking-tight leading-none flex items-center whitespace-nowrap text-slate-900 dark:text-white">
            <span>PROP</span>
            <span className="text-emerald-600 dark:text-emerald-400 ml-1.5">NATION</span>
          </span>
        </Link>

        {/* Center: Clean Single-Line Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-7 shrink-0" aria-label="Main Navigation">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => handleNavClick(link.href)}
                className={`group text-sm font-medium whitespace-nowrap transition-colors duration-200 relative py-1 ${
                  active
                    ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400'
                }`}
              >
                {link.label}
                <span
                  className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-emerald-500 dark:bg-emerald-400 transition-transform duration-200 origin-left ${
                    active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* Right: Clean Uncluttered Actions (LN · Theme · Log In · Get Started) */}
        <div className="hidden lg:flex items-center gap-2.5 shrink-0 whitespace-nowrap">
          <GoogleTranslate id="google_translate_navbar" compact />

          <ThemeToggle />

          <Link
            href="/login"
            className="text-sm font-semibold whitespace-nowrap text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors"
          >
            Log In
          </Link>
          <Link
            href="/register"
            className="group inline-flex items-center gap-1.5 whitespace-nowrap bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm h-9 px-4 rounded-xl shadow-[0_0_20px_-5px_rgba(16,185,129,0.45)] transition-all duration-200 hover:-translate-y-0.5"
          >
            <span>Get Started</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Mobile / Tablet Header Controls */}
        <div className="flex lg:hidden items-center gap-2 shrink-0">
          <GoogleTranslate id="google_translate_navbar_mobile" compact />
          <ThemeToggle />

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/[0.03] text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/40 transition-all cursor-pointer"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Full-Width Drawer */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-out ${
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
                  onClick={() => {
                    handleNavClick(link.href);
                    setMobileMenuOpen(false);
                  }}
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
          </div>
        </div>
      </div>
    </header>
  );
}
