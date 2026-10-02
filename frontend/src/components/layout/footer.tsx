'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Coins,
  ShieldCheck,
  Mail,
  Headphones,
  LifeBuoy,
  MessageSquare,
} from 'lucide-react';

export function Footer() {
  const pathname = usePathname();
  const isPortal = pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin');

  if (isPortal) {
    return null;
  }

  return (
    <footer className="w-full bg-[#020614] text-slate-400 border-t border-blue-950/60 font-sans transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-blue-950/60 text-left">
          {/* Brand Info (Left Column) */}
          <div className="lg:col-span-4 space-y-5">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0c182a] text-white shadow-xs group-hover:scale-105 transition-transform border border-sky-500/20">
                <span className="font-black text-sm tracking-tighter text-sky-400">P<span className="text-white">N</span></span>
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                PropNation<span className="text-xs font-normal text-slate-400 align-super ml-0.5">®</span>
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
              Trade with a clear path to capital, rewards, scaling, and community.
            </p>

            {/* Social Icons (Facebook, X, Instagram, YouTube) */}
            <div className="flex items-center gap-3 pt-1 text-slate-400">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:text-white hover:border-slate-700 transition-colors"
                title="Facebook"
              >
                <FacebookIcon className="h-4 w-4" />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:text-white hover:border-slate-700 transition-colors"
                title="X / Twitter"
              >
                <XIcon className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:text-white hover:border-slate-700 transition-colors"
                title="Instagram"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:text-white hover:border-slate-700 transition-colors"
                title="YouTube"
              >
                <YouTubeIcon className="h-4 w-4" />
              </a>
              <a
                href="https://discord.gg"
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:text-white hover:border-slate-700 transition-colors"
                title="Discord"
              >
                <MessageSquare className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* 4 Link Columns (FundingPips Exact Layout) */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8 text-xs">
            {/* Column 1: Products */}
            <div className="space-y-3">
              <h4 className="font-bold text-white tracking-wide">Products</h4>
              <ul className="space-y-2.5 text-slate-400">
                <li>
                  <Link href="/prop-firms" className="hover:text-white transition-colors">
                    2 Step Standard
                  </Link>
                </li>
                <li>
                  <Link href="/prop-firms" className="hover:text-white transition-colors">
                    2 Step Pro
                  </Link>
                </li>
                <li>
                  <Link href="/prop-firms" className="hover:text-white transition-colors">
                    2 Step Flex
                  </Link>
                </li>
                <li>
                  <Link href="/prop-firms" className="hover:text-white transition-colors">
                    1 Step Flex
                  </Link>
                </li>
                <li>
                  <Link href="/prop-firms" className="hover:text-white transition-colors">
                    Zero
                  </Link>
                </li>
                <li>
                  <Link href="/prop-firms" className="hover:text-white transition-colors">
                    Free Trial
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Platform */}
            <div className="space-y-3">
              <h4 className="font-bold text-white tracking-wide">Platform</h4>
              <ul className="space-y-2.5 text-slate-400">
                <li>
                  <Link href="/how-it-works" className="hover:text-white transition-colors">
                    PRIME
                  </Link>
                </li>
                <li>
                  <Link href="/rewards" className="hover:text-white transition-colors">
                    Rewards
                  </Link>
                </li>
                <li>
                  <Link href="/how-it-works" className="hover:text-white transition-colors">
                    Trading Objectives
                  </Link>
                </li>
                <li>
                  <Link href="/prop-firms" className="hover:text-white transition-colors">
                    Tradin
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Community */}
            <div className="space-y-3">
              <h4 className="font-bold text-white tracking-wide">Community</h4>
              <ul className="space-y-2.5 text-slate-400">
                <li>
                  <Link href="/announcements" className="hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <a href="https://discord.gg" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    Discord
                  </a>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-white transition-colors">
                    FAQs
                  </Link>
                </li>
                <li>
                  <Link href="/support/live" className="hover:text-white transition-colors">
                    Live Chat
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Legal */}
            <div className="space-y-3">
              <h4 className="font-bold text-white tracking-wide">Legal</h4>
              <ul className="space-y-2.5 text-slate-400">
                <li>
                  <Link href="/faq" className="hover:text-white transition-colors">
                    Terms &amp; Conditions
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-white transition-colors">
                    Terms &amp; Conditions - PRIME
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom copyright notice */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} PropNation Rewards Ltd. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Universal Partner Code: <strong className="text-sky-400 font-mono">NATION</strong></span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">1$ = 10 Reward Points</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function YouTubeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}
