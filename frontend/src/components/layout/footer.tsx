'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Globe,
  ChevronDown,
} from 'lucide-react';

export function Footer() {
  const pathname = usePathname();
  const isPortal = pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin');

  if (isPortal) {
    return null;
  }

  return (
    <footer className="w-full bg-[#050816] text-slate-400 border-t border-slate-900 font-sans transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 space-y-10">
        {/* Brand Info & 2-Column Mobile Navigation (Screenshot 1: media_1790940232221.png) */}
        <div className="space-y-8 text-left">
          {/* Brand Logo & Tagline */}
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative h-10 w-11 flex items-center justify-center group-hover:scale-105 transition-transform">
                <img
                  src="/logo.png"
                  alt="Prop Nation"
                  className="h-full w-auto object-contain drop-shadow-md select-none"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-[900] tracking-tight text-white leading-tight">
                  PROP NATION<span className="text-xs font-normal text-emerald-400 align-super ml-0.5">&reg;</span>
                </span>
                <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase -mt-0.5">
                  Trade • Earn • Get Rewarded
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed">
              Trade with a clear path to capital, rewards, scaling, and community.
            </p>

            {/* Social Media Icons (Facebook, X, Instagram, YouTube) */}
            <div className="flex items-center gap-3 pt-2 text-slate-400">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 rounded-full bg-slate-900/80 border border-slate-800 flex items-center justify-center hover:text-white hover:border-slate-700 transition-colors"
                title="Facebook"
              >
                <FacebookIcon className="h-4 w-4" />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 rounded-full bg-slate-900/80 border border-slate-800 flex items-center justify-center hover:text-white hover:border-slate-700 transition-colors"
                title="X / Twitter"
              >
                <XIcon className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 rounded-full bg-slate-900/80 border border-slate-800 flex items-center justify-center hover:text-white hover:border-slate-700 transition-colors"
                title="Instagram"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 rounded-full bg-slate-900/80 border border-slate-800 flex items-center justify-center hover:text-white hover:border-slate-700 transition-colors"
                title="YouTube"
              >
                <YouTubeIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Links Grid: 2 columns on Mobile matching Screenshot 1 exactly */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-xs pt-4">
            {/* Col 1 (Mobile: Products + Community) */}
            <div className="space-y-6">
              <div className="space-y-2.5">
                <h4 className="font-bold text-white tracking-wide">Products</h4>
                <ul className="space-y-2 text-slate-400">
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

              {/* Mobile-only Community block under Products */}
              <div className="space-y-2.5 sm:hidden">
                <h4 className="font-bold text-white tracking-wide">Community</h4>
                <ul className="space-y-2 text-slate-400">
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
                </ul>
              </div>
            </div>

            {/* Col 2 (Mobile: Platform + Legal) */}
            <div className="space-y-6">
              <div className="space-y-2.5">
                <h4 className="font-bold text-white tracking-wide">Platform</h4>
                <ul className="space-y-2 text-slate-400">
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

              {/* Mobile-only Legal block under Platform */}
              <div className="space-y-2.5 sm:hidden">
                <h4 className="font-bold text-white tracking-wide">Legal</h4>
                <ul className="space-y-2 text-slate-400">
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

            {/* Desktop Col 3: Community */}
            <div className="hidden sm:block space-y-2.5">
              <h4 className="font-bold text-white tracking-wide">Community</h4>
              <ul className="space-y-2 text-slate-400">
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
              </ul>
            </div>

            {/* Desktop Col 4: Legal */}
            <div className="hidden sm:block space-y-2.5">
              <h4 className="font-bold text-white tracking-wide">Legal</h4>
              <ul className="space-y-2 text-slate-400">
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

        {/* ======================================================== */}
        {/* Important Information & Disclaimer (Screenshots 2 & 3: media_1790940232323.png & media_1790940232326.png) */}
        {/* ======================================================== */}
        <div className="pt-8 border-t border-slate-900 space-y-6 text-left text-[11px] sm:text-xs text-slate-400 leading-relaxed">
          <h3 className="text-sm font-bold text-slate-200">
            Important Information &amp; Disclaimer
          </h3>

          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-slate-300">Simulated Trading Environment</h4>
              <p className="mt-1 text-slate-400">
                All accounts provided by PropNation are demo accounts operating exclusively in a simulated trading environment. No actual trades are executed on live financial markets. The services we offer are designed for educational and evaluation purposes only.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-300">No Investment Services</h4>
              <p className="mt-1 text-slate-400">
                The simulated trading services are provided by PropNation Corp. All content published and distributed by PropNation and its related entities (collectively, the &quot;Company&quot;) is for general informational purposes only.
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400">
                <li>The Company does not provide investment advice.</li>
                <li>The Company does not solicit or recommend the purchase or sale of any financial instruments, securities, or funds.</li>
                <li>The Company does not act as a broker, custodian, or financial intermediary.</li>
              </ul>
              <p className="mt-2 text-slate-400">
                Participation in any of our programs is entirely voluntary, and all fees paid to the Company are strictly service fees. Program fees are not deposits, do not represent client funds, and should not be considered investments under any circumstances. These fees are non-refundable once paid, except where required by applicable law, and they do not earn interest, returns, or profit sharing of any kind.
              </p>
              <p className="mt-2 text-slate-400">
                Instead, all program fees are applied toward the Company&apos;s operational and administrative expenses, including, but not limited to, staffing, technology infrastructure, platform development and maintenance, software licensing, risk management systems, customer support, and other business-related costs. Payment of program fees does not create any fiduciary duty, custodial relationship, or investment arrangement between participants and the Company. Participants should understand that such fees provide access only to simulated trading evaluations and related services in a demo environment.
              </p>
              <p className="mt-2 text-slate-400">
                Nothing on this website or in our programs constitutes an offer to buy or sell futures, options, CFDs, forex, stocks, or any other financial instruments. All results displayed are based on simulated trading performance. Past simulated performance is not necessarily indicative of future results.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-300">General Risk Warning</h4>
              <p className="mt-1 text-slate-400">
                Trading in financial markets involves a substantial risk of loss. Even in a simulated environment, strategies tested under leveraged conditions may produce results that do not reflect real-world execution. You should carefully consider your objectives, level of experience, and risk tolerance before participating.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-300">Corporate &amp; Related Entities</h4>
              <p className="mt-1 text-slate-400">
                PropNation Corp is a limited liability company incorporated under the laws of the Comoros Union with company number: HY01223081, having its registered address at Bonovo Road, Fomboni Island of Moh&eacute;li, Comoros Union. The Company holds an International Brokerage and Clearing House License, Ibc Regulation Act 2014 (License No. Bfx2024004).
              </p>
              <p className="mt-2 text-slate-400">
                Note: Although licensed, PropNation Corp does not conduct brokerage services or offer real trading accounts on this website. Its services are limited to simulated trading programs.
              </p>
              <p className="mt-2 text-slate-400">
                Restrictions: Services are not offered to residents of certain jurisdictions, including countries on the FATF and EU/UN sanctions lists, Vietnam, and UAE.
              </p>
              <p className="mt-3 text-slate-300 font-bold">
                Registered Address of PropNation:
              </p>
              <p className="text-slate-400">
                Premises NO. 19948-001, IFZA Business Park, DDP Dubai, UAE
              </p>
              <p className="mt-3 text-slate-300 font-bold">
                Related Entities (non-operational support and administrative offices):
              </p>
              <p className="text-slate-400">
                PropNation Services Ltd - Cyprus (HE 450941), 15 Dimitriou Karatasou Street, Anastasio Building, 6th Floor, Office 601, 2024 Strovolos, Nicosia, Cyprus.
              </p>
              <p className="text-slate-400">
                Bay View Tower, Business Bay, Dubai, UAE.
              </p>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* Payment Methods Row (Screenshots 4 & 5: media_1790940232224.png & media_1790940232028.png) */}
        {/* ======================================================== */}
        <div className="pt-6 pb-2 border-t border-slate-900 space-y-4">
          <div className="flex flex-wrap items-center justify-between sm:justify-center gap-6 sm:gap-10 opacity-70 grayscale hover:grayscale-0 transition-all">
            <span className="font-black text-sm tracking-wider text-slate-300">Skrill</span>
            <span className="font-bold text-sm tracking-tight text-slate-300 italic">PayPal</span>
            <div className="flex items-center -space-x-2">
              <div className="h-5 w-5 rounded-full bg-slate-400/80" />
              <div className="h-5 w-5 rounded-full bg-slate-500/80" />
            </div>
            <span className="font-black text-sm tracking-widest text-slate-300">VISA</span>
            <span className="font-black text-sm text-slate-300 flex items-center gap-1 font-mono">
              <span className="text-lg leading-none">&#8383;</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between sm:justify-center gap-6 sm:gap-10 opacity-70 grayscale hover:grayscale-0 transition-all pt-1">
            <span className="font-semibold text-xs tracking-tight text-slate-300 flex items-center gap-1">
              <span className="text-sm"></span> Pay
            </span>
            <span className="font-bold text-xs tracking-tight text-slate-300 flex items-center gap-1">
              <span>G</span> Pay
            </span>
            <span className="font-black text-xs tracking-widest text-slate-300">NETELLER</span>
            <span className="font-bold text-xs tracking-tight text-slate-300">AstroPay</span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* Bottom Language, Legal Links & Copyright (Screenshots 4 & 5) */}
        {/* ======================================================== */}
        <div className="pt-6 border-t border-slate-900 space-y-5 text-xs text-slate-500">
          {/* Language Selector */}
          <div className="flex items-center justify-start">
            <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
              <Globe className="h-3.5 w-3.5" />
              <span>English (English)</span>
              <ChevronDown className="h-3.5 w-3.5 ml-1 text-slate-500" />
            </button>
          </div>

          {/* Legal Links (stacked cleanly on mobile) */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-slate-400 text-xs">
            <Link href="/faq" className="hover:text-white transition-colors">
              Terms &amp; Conditions
            </Link>
            <Link href="/faq" className="hover:text-white transition-colors">
              Terms &amp; Conditions - PRIME
            </Link>
            <Link href="/faq" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <button className="hover:text-white transition-colors text-left sm:text-center">
              Cookie preferences
            </button>
          </div>

          {/* Regulatory Risk Disclaimer & FTC Affiliate Disclosure */}
          <div className="pt-6 border-t border-slate-900/80 text-[11px] leading-relaxed text-slate-500 space-y-2">
            <p>
              <strong>Regulatory &amp; Risk Disclaimer:</strong> PropNation is an independent loyalty rewards portal and community. PropNation is not a broker-dealer, financial advisor, investment manager, or prop firm. Trading leveraged foreign exchange, futures, commodities, and CFDs carries a high degree of financial risk and is not suitable for all investors. You may lose more than your initial investment. Any references to prop firms, evaluation rules, target percentages, or trading capital are for informational purposes based on publicly available data.
            </p>
            <p>
              <strong>Affiliate Disclosure:</strong> PropNation participates in independent affiliate partner programs. When you register or purchase challenges using referral code <strong className="text-slate-400">NATION</strong> or our partner links, we may receive a commission from the respective prop firm at no additional cost to you. Reward points and redemptions are funded independently from marketing commissions earned.
            </p>
          </div>

          {/* Copyright & Built With */}
          <div className="pt-2 text-[11px] text-slate-500 space-y-1">
            <div>
              &copy; 2026 PropNation. All rights reserved.
            </div>
            <div>
              Built with <span className="text-red-500">&hearts;</span> by Traders for Traders
            </div>
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
