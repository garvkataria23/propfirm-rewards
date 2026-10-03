'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import {
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Coins,
  Gift,
  ArrowRight,
  Sparkles,
  Wallet,
  FileCheck2,
  CheckCircle,
  Truck,
  Headphones,
  Zap,
  TrendingUp,
  Star,
  Activity,
  BarChart2,
  Trophy,
  Users,
  Globe,
  Lock,
  ChevronDown,
  Flame,
} from 'lucide-react';
import { AutoApplyModal, AutoApplyFirmData } from '@/components/prop-firms/auto-apply-modal';
import { LiveTradingChart } from '@/components/trading/live-trading-chart';
import { LiveActivityTicker } from '@/components/social-proof/live-activity-ticker';
import { PropFirmCalculator } from '@/components/calculator/prop-firm-calculator';

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface PropFirmOffer {
  id: string;
  accountTierName: string;
  purchasePriceUsd: number;
  rewardPoints: number;
}
interface PropFirm {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  description: string;
  websiteUrl: string;
  affiliateCode: string;
  affiliateUrl: string;
  offers?: PropFirmOffer[];
}
interface Reward {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  pointsRequired: number;
  stock?: number;
  isUnlimitedStock?: boolean;
  category?: { name: string; slug: string };
}

/* ─── Fallback Data ──────────────────────────────────────────────────────── */
const FALLBACK_PROP_FIRMS: PropFirm[] = [
  {
    id: 'firm-1', name: 'FundedSquad', slug: 'fundedsquad',
    logoUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=120&auto=format&fit=crop&q=80',
    description: 'Premier proprietary firm with zero-time limit evaluations, raw spreads, and fast reward verification.',
    websiteUrl: 'https://fundedsquad.com', affiliateCode: 'NATION', affiliateUrl: 'https://fundedsquad.com/?ref=nation',
    offers: [
      { id: 'o-1', accountTierName: '$50K Account', purchasePriceUsd: 299, rewardPoints: 2990 },
      { id: 'o-2', accountTierName: '$100K Account', purchasePriceUsd: 499, rewardPoints: 4990 },
      { id: 'o-3', accountTierName: '$200K Account', purchasePriceUsd: 979, rewardPoints: 9790 },
    ],
  },
  {
    id: 'firm-2', name: 'Pipstone Capital', slug: 'pipstone-capital',
    logoUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=120&auto=format&fit=crop&q=80',
    description: 'Institutional-grade simulated funding with high drawdown flexibility and weekly payouts up to 90%.',
    websiteUrl: 'https://trader.pipstonecapital.com/guest-checkout', affiliateCode: 'NATION', affiliateUrl: 'https://trader.pipstonecapital.com/guest-checkout?model=2-step&balance=100000&type=standard&coupon=NATION&affId=NATION',
    offers: [
      { id: 'o-4', accountTierName: '$15K Account', purchasePriceUsd: 120, rewardPoints: 1200 },
      { id: 'o-5', accountTierName: '$30K Account', purchasePriceUsd: 220, rewardPoints: 2200 },
      { id: 'o-6', accountTierName: '$60K Account', purchasePriceUsd: 380, rewardPoints: 3800 },
      { id: 'o-7', accountTierName: '$100K Account', purchasePriceUsd: 520, rewardPoints: 5200 },
      { id: 'o-8', accountTierName: '$200K Account', purchasePriceUsd: 980, rewardPoints: 9800 },
    ],
  },
  {
    id: 'firm-3', name: 'Apex Trader Funding', slug: 'apex-trader-funding',
    logoUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=120&auto=format&fit=crop&q=80',
    description: 'Futures contract specialist with 1-day pass evaluations, trailing drawdown, and multiple account hedging.',
    websiteUrl: 'https://apextraderfunding.com', affiliateCode: 'NATION', affiliateUrl: 'https://apextraderfunding.com/?ref=nation',
    offers: [
      { id: 'o-7', accountTierName: '$50K Futures', purchasePriceUsd: 167, rewardPoints: 1670 },
      { id: 'o-8', accountTierName: '$100K Futures', purchasePriceUsd: 299, rewardPoints: 2990 },
      { id: 'o-9', accountTierName: '$150K Futures', purchasePriceUsd: 377, rewardPoints: 3770 },
    ],
  },
  {
    id: 'firm-4', name: 'TopStep Forex', slug: 'topstep-forex',
    logoUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=120&auto=format&fit=crop&q=80',
    description: 'Chicago-regulated trading combine with real-time coaching, Discord community, and fast scaling plan.',
    websiteUrl: 'https://topstep.com', affiliateCode: 'NATION', affiliateUrl: 'https://topstep.com/?ref=nation',
    offers: [
      { id: 'o-10', accountTierName: '$50K Trading Combine', purchasePriceUsd: 165, rewardPoints: 1650 },
      { id: 'o-11', accountTierName: '$100K Trading Combine', purchasePriceUsd: 325, rewardPoints: 3250 },
      { id: 'o-12', accountTierName: '$150K Trading Combine', purchasePriceUsd: 375, rewardPoints: 3750 },
    ],
  },
];

const FALLBACK_REWARDS: Reward[] = [
  { id: 'r-1', name: 'Apple AirPods Max (Space Gray)', slug: 'apple-airpods-max', imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80', pointsRequired: 20000, category: { name: 'Audio Gear', slug: 'audio' } },
  { id: 'r-2', name: 'Nike Air Jordan 1 Retro High OG', slug: 'nike-air-jordan-1-retro', imageUrl: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop&q=80', pointsRequired: 15000, category: { name: 'Streetwear', slug: 'apparel' } },
  { id: 'r-3', name: 'Sony PlayStation 5 Pro Console', slug: 'sony-playstation-5-pro', imageUrl: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=80', pointsRequired: 70000, category: { name: 'Gaming Gear', slug: 'gaming' } },
  { id: 'r-4', name: 'Apple iPhone 16 Pro Max 256GB', slug: 'apple-iphone-16-pro-max', imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80', pointsRequired: 120000, category: { name: 'Smartphones', slug: 'smartphones' } },
  { id: 'r-5', name: 'Apple MacBook Pro 16" M3 Max', slug: 'apple-macbook-pro-m3', imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80', pointsRequired: 250000, category: { name: 'Trading Stations', slug: 'workstations' } },
  { id: 'r-6', name: 'Ledger Stax Crypto Hardware Wallet', slug: 'ledger-stax', imageUrl: 'https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=800&auto=format&fit=crop&q=80', pointsRequired: 25000, category: { name: 'Crypto Security', slug: 'crypto' } },
];

/* ─── Animated Counter Hook ─────────────────────────────────────────────── */
function useAnimatedCounter(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, start]);
  return count;
}

/* ─── Intersection Observer Hook ────────────────────────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); observer.disconnect(); }
    }, { threshold });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ─── Aurora Particle Background ────────────────────────────────────────── */
function AuroraBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {/* Deep space base */}
      <div className="absolute inset-0 bg-[#030508]" />

      {/* High-res cinematic trading workstation background */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.14] mix-blend-luminosity scale-105"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=1920&auto=format&fit=crop&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#030508]/85 via-transparent to-[#030508]" />

      {/* Aurora beam 1 - Emerald */}
      <div
        className="absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full opacity-25"
        style={{
          background: 'radial-gradient(ellipse at center, #10b981 0%, #059669 40%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'auroraFloat1 12s ease-in-out infinite',
        }}
      />
      {/* Aurora beam 2 - Teal */}
      <div
        className="absolute top-20 right-1/4 w-[500px] h-[500px] rounded-full opacity-18"
        style={{
          background: 'radial-gradient(ellipse at center, #14b8a6 0%, #0d9488 40%, transparent 70%)',
          filter: 'blur(100px)',
          animation: 'auroraFloat2 15s ease-in-out infinite',
        }}
      />
      {/* Aurora beam 3 - Deep teal */}
      <div
        className="absolute bottom-0 left-1/3 w-[700px] h-[400px] rounded-full opacity-12"
        style={{
          background: 'radial-gradient(ellipse at center, #06b6d4 0%, #0891b2 40%, transparent 70%)',
          filter: 'blur(120px)',
          animation: 'auroraFloat3 18s ease-in-out infinite',
        }}
      />

      {/* Animated grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(rgba(16,185,129,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.8) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating particles */}
      {Array.from({ length: 24 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: i % 3 === 0 ? '#10b981' : i % 3 === 1 ? '#14b8a6' : '#06b6d4',
            opacity: Math.random() * 0.5 + 0.2,
            animation: `particleFloat ${8 + Math.random() * 12}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 8}s`,
          }}
        />
      ))}

      {/* Scanline effect */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.3) 2px, rgba(255,255,255,0.3) 4px)',
        }}
      />
    </div>
  );
}

/* ─── Reusable Section Thematic Background with Glow ────────────────────── */
function SectionBackground({
  imageUrl,
  opacity = 'opacity-10',
  glowColor = '#10b981',
  glowPosition = 'center',
}: {
  imageUrl: string;
  opacity?: string;
  glowColor?: string;
  glowPosition?: 'center' | 'top-right' | 'top-left' | 'bottom';
}) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
      {/* Dark base */}
      <div className="absolute inset-0 bg-[#04070a]" />

      {/* Thematic Background Image with mix-blend-luminosity */}
      <div
        className={`absolute inset-0 bg-cover bg-center ${opacity} mix-blend-luminosity transition-all duration-700`}
        style={{ backgroundImage: `url('${imageUrl}')` }}
      />

      {/* Ambient Radial Lighting Glow */}
      <div
        className={`absolute w-[700px] h-[450px] rounded-full opacity-[0.08] ${
          glowPosition === 'top-right'
            ? '-top-32 -right-32'
            : glowPosition === 'top-left'
            ? '-top-32 -left-32'
            : glowPosition === 'bottom'
            ? '-bottom-32 left-1/2 -translate-x-1/2'
            : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
        }`}
        style={{
          background: `radial-gradient(ellipse at center, ${glowColor} 0%, transparent 70%)`,
          filter: 'blur(90px)',
        }}
      />

      {/* Fine technical grid lines */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(16,185,129,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.5) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Top & Bottom seamless blending dark vignettes */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#030508] via-transparent to-[#030508]" />
    </div>
  );
}

/* ─── 3D Tilt Card ───────────────────────────────────────────────────────── */
function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / (width / 2);
    const y = (e.clientY - top - height / 2) / (height / 2);
    cardRef.current.style.transform = `perspective(1000px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg) translateZ(10px)`;
  };
  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
  };
  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{ transition: 'transform 0.15s ease-out', willChange: 'transform' }}
    >
      {children}
    </div>
  );
}

/* ─── Animated Number ────────────────────────────────────────────────────── */
function AnimatedStat({ value, suffix = '', prefix = '', label, icon, inView }: {
  value: number; suffix?: string; prefix?: string; label: string; icon: React.ReactNode; inView: boolean;
}) {
  const count = useAnimatedCounter(value, 2200, inView);
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-emerald-400 mb-1">{icon}</div>
      <div className="text-3xl sm:text-4xl font-[900] font-mono text-white tracking-tight">
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-slate-400 font-medium text-center">{label}</div>
    </div>
  );
}

/* ─── Scroll Reveal Wrapper ──────────────────────────────────────────────── */
function Reveal({ children, delay = 0, direction = 'up' }: {
  children: React.ReactNode; delay?: number; direction?: 'up' | 'left' | 'right' | 'fade';
}) {
  const { ref, inView } = useInView(0.1);
  const transforms: Record<string, string> = {
    up: 'translateY(40px)',
    left: 'translateX(-40px)',
    right: 'translateX(40px)',
    fade: 'translateY(0px)',
  };
  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'none' : transforms[direction],
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════════════════════════════════ */
export default function HomePage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [propFirms, setPropFirms] = useState<PropFirm[]>(FALLBACK_PROP_FIRMS);
  const [rewards, setRewards] = useState<Reward[]>(FALLBACK_REWARDS);
  const [activeStep, setActiveStep] = useState(0);
  const [simulatedUnlocked, setSimulatedUnlocked] = useState(false);
  const [activeAutoApplyFirm, setActiveAutoApplyFirm] = useState<AutoApplyFirmData | null>(null);
  const [isAutoApplyModalOpen, setIsAutoApplyModalOpen] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [pointsTick, setPointsTick] = useState(12480);
  const [showVerifyToast, setShowVerifyToast] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const { ref: statsRef, inView: statsInView } = useInView(0.2);

  // Auto-step cycle for How It Works
  useEffect(() => {
    const t = setInterval(() => setActiveStep(s => (s + 1) % 4), 3500);
    return () => clearInterval(t);
  }, []);

  // Hero mount reveal
  useEffect(() => {
    const t = setTimeout(() => setHeroLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Live points ticker
  useEffect(() => {
    const t = setInterval(() => {
      setPointsTick(p => p + Math.floor(Math.random() * 50 + 10));
      if (Math.random() > 0.7) {
        setShowVerifyToast(true);
        setTimeout(() => setShowVerifyToast(false), 3000);
      }
    }, 4000);
    return () => clearInterval(t);
  }, []);

  // Hero mouse parallax
  const handleHeroMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const { clientX, clientY, currentTarget } = e;
    const { width, height } = currentTarget.getBoundingClientRect();
    setMousePos({ x: (clientX / width - 0.5) * 20, y: (clientY / height - 0.5) * 20 });
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleTriggerAutoApply = (firm: PropFirm) => {
    setActiveAutoApplyFirm({ id: firm.id, name: firm.name, slug: firm.slug, logoUrl: firm.logoUrl, affiliateCode: firm.affiliateCode || 'NATION', affiliateUrl: firm.affiliateUrl, websiteUrl: firm.websiteUrl });
    setIsAutoApplyModalOpen(true);
  };

  // Load from API
  useEffect(() => {
    (async () => {
      try {
        const r = await api.get<any>('/prop-firms');
        const d = Array.isArray(r) ? r : r?.data;
        if (Array.isArray(d) && d.length > 0) setPropFirms(d);
      } catch { /* fallback */ }
      try {
        const r = await api.get<any>('/rewards');
        const d = Array.isArray(r) ? r : r?.data;
        if (Array.isArray(d) && d.length > 0) setRewards(d);
      } catch { /* fallback */ }
    })();
  }, []);

  const HOW_IT_WORKS = [
    {
      num: '01', icon: <Sparkles className="h-6 w-6" />, title: 'BUY', label: 'Use Partner Code',
      color: 'emerald',
      desc: 'Pick a prop firm challenge. Click our affiliate link and enter code NATION at checkout. Order auto-attaches to our verified affiliate pool.',
      sim: (
        <div className="space-y-3 font-mono text-xs">
          <div className="flex justify-between text-slate-400 border-b border-slate-800 pb-2"><span>CHALLENGE CHECKOUT</span><span className="text-emerald-400 font-bold">SIMULATION</span></div>
          <div className="flex justify-between text-white"><span>Tier:</span><span className="font-bold">$100K 2-Step</span></div>
          <div className="flex justify-between text-white"><span>Amount:</span><span className="font-bold">$499.00 USD</span></div>
          <div className="flex justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold"><span>Points Yield:</span><span>+4,990 PTS</span></div>
        </div>
      ),
    },
    {
      num: '02', icon: <FileCheck2 className="h-6 w-6" />, title: 'VERIFY', label: 'Upload Receipt',
      color: 'amber',
      desc: 'Upload your order confirmation. Our automated AI audit pipeline verifies purchase hash, date, and reconciles with affiliate logs instantly.',
      sim: (
        <div className="space-y-3 font-mono text-xs">
          <div className="flex justify-between text-slate-400 border-b border-slate-800 pb-2"><span>FILE AUDIT</span><span className="text-amber-400 animate-pulse font-bold">PROCESSING…</span></div>
          <div className="p-3 rounded bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-2"><FileCheck2 className="h-4 w-4 text-emerald-400" />receipt_100k.png</span>
            <span className="text-slate-500">1.4 MB</span>
          </div>
          <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />✓ ORDER VERIFIED
          </div>
        </div>
      ),
    },
    {
      num: '03', icon: <Coins className="h-6 w-6" />, title: 'EARN', label: 'Atomic Ledger Credit',
      color: 'emerald',
      desc: 'Points are written to your immutable financial ledger. Zero expiry. Zero lockups. 100 PTS = $1 USD guaranteed floor value.',
      sim: (
        <div className="space-y-3 font-mono text-xs">
          <div className="flex justify-between text-slate-400 border-b border-slate-800 pb-2"><span>LEDGER TX</span><span className="text-emerald-400 font-bold">ACID WRITE</span></div>
          <div className="flex justify-between text-slate-400"><span>Previous:</span><span>7,510 PTS</span></div>
          <div className="flex justify-between text-emerald-400 font-bold"><span>Credited:</span><span>+4,990 PTS</span></div>
          <div className="flex justify-between text-white font-extrabold pt-2 border-t border-slate-800"><span>New Balance:</span><span className="text-emerald-400">12,500 PTS</span></div>
        </div>
      ),
    },
    {
      num: '04', icon: <Gift className="h-6 w-6" />, title: 'REDEEM', label: 'Dispatch Hardware',
      color: 'purple',
      desc: 'Browse 100+ rewards. Enter shipping address or TRC-20 wallet. Our team ships insured via FedEx, DHL, or Aramex globally.',
      sim: (
        <div className="space-y-3 font-mono text-xs">
          <div className="flex justify-between text-slate-400 border-b border-slate-800 pb-2"><span>COURIER PIPELINE</span><span className="text-purple-400 font-bold">DISPATCHED</span></div>
          <div className="flex justify-between text-white"><span>Carrier:</span><span className="font-bold">FedEx Express</span></div>
          <div className="flex justify-between text-white"><span>Tracking:</span><span className="text-emerald-400">#FX-8941-2041</span></div>
          <div className="p-2 rounded bg-purple-500/10 border border-purple-500/30 text-purple-300 font-bold text-center">STATUS: OUT FOR DELIVERY</div>
        </div>
      ),
    },
  ];

  const FAQS = [
    { q: 'How do I earn reward points?', a: 'Purchase any trading challenge from our partner prop firms using your unique affiliate link with code NATION. Once you submit your order confirmation and our team verifies it, points are credited to your wallet instantly.' },
    { q: 'What is the cash value of 1 point?', a: 'Every point has a guaranteed floor value of $0.01 USD (100 points = $1.00). This means your points are always redeemable for USDT crypto — no games, no minimum thresholds on cash.' },
    { q: 'How long does verification take?', a: 'Most receipts are verified within 24–48 hours. Our automated system checks order hashes and affiliate logs. You\'ll receive a notification the moment points hit your wallet.' },
    { q: 'How are rewards shipped?', a: 'Physical items ship via FedEx, DHL, or Aramex with full insurance and global tracking. Crypto payouts (USDT TRC-20) are processed within 24 hours of redemption request approval.' },
    { q: 'Can I redeem points for cash?', a: 'Yes! Any amount of points can be redeemed for USDT on TRC-20 network at the rate of 100 PTS = $1 USD. Minimum redemption is 1,000 points ($10 USD).' },
  ];

  return (
    <>
      {/* ════════════════════════════════════════════════════════════════════
          GLOBAL KEYFRAME INJECTOR
          ════════════════════════════════════════════════════════════════════ */}
      <style>{`
        @keyframes auroraFloat1 {
          0%,100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(40px,-30px) scale(1.1); }
          66% { transform: translate(-20px,20px) scale(0.95); }
        }
        @keyframes auroraFloat2 {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(-50px,30px) scale(1.08); }
        }
        @keyframes auroraFloat3 {
          0%,100% { transform: translate(0,0) scale(1); }
          40% { transform: translate(30px,-40px) scale(1.12); }
          80% { transform: translate(-10px,20px) scale(0.93); }
        }
        @keyframes particleFloat {
          0%,100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          25% { transform: translateY(-30px) translateX(15px); opacity: 0.7; }
          75% { transform: translateY(20px) translateX(-10px); opacity: 0.4; }
        }
        @keyframes heroReveal {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmerX {
          0% { transform: translateX(-150%) skewX(-15deg); }
          100% { transform: translateX(300%) skewX(-15deg); }
        }
        @keyframes borderGlow {
          0%,100% { box-shadow: 0 0 20px rgba(16,185,129,0.2), inset 0 0 20px rgba(16,185,129,0.05); }
          50% { box-shadow: 0 0 40px rgba(16,185,129,0.4), inset 0 0 30px rgba(16,185,129,0.1); }
        }
        @keyframes pulseRing {
          0% { transform: scale(0.9); opacity: 0.9; }
          70% { transform: scale(1.7); opacity: 0; }
          100% { transform: scale(2); opacity: 0; }
        }
        @keyframes floatCard {
          0%,100% { transform: translateY(0px) rotate(-1deg); }
          50% { transform: translateY(-14px) rotate(1deg); }
        }
        @keyframes counterTick {
          0% { transform: translateY(-100%); opacity: 0; }
          20%,80% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(100%); opacity: 0; }
        }
        @keyframes scanLine {
          0% { top: -100%; }
          100% { top: 100%; }
        }
        @keyframes stepProgress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .hero-animate-1 { animation: heroReveal 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s both; }
        .hero-animate-2 { animation: heroReveal 0.8s cubic-bezier(0.16,1,0.3,1) 0.25s both; }
        .hero-animate-3 { animation: heroReveal 0.8s cubic-bezier(0.16,1,0.3,1) 0.4s both; }
        .hero-animate-4 { animation: heroReveal 0.8s cubic-bezier(0.16,1,0.3,1) 0.55s both; }
        .hero-animate-5 { animation: heroReveal 0.8s cubic-bezier(0.16,1,0.3,1) 0.7s both; }
        .shimmer-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.35) 50%, transparent 60%);
          animation: shimmerX 3s ease-in-out infinite;
        }
        .glow-border { animation: borderGlow 3s ease-in-out infinite; }
        .float-card { animation: floatCard 6s ease-in-out infinite; }
        .pulse-ring::before {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 2px solid rgba(16,185,129,0.6);
          animation: pulseRing 2s ease-out infinite;
        }
        .gradient-text {
          background: linear-gradient(135deg, #34d399 0%, #10b981 30%, #14b8a6 60%, #06b6d4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .gradient-text-gold {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 40%, #fcd34d 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .glass-card {
          background: rgba(15, 23, 20, 0.6);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(16,185,129,0.2);
        }
        .glass-card-light {
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.06);
        }
      `}</style>

      <div className="flex flex-col min-h-screen bg-[#030508] text-white selection:bg-emerald-500 selection:text-slate-950 font-sans">

        {/* ════════════════════════════════════════════════════════════════════
            §1 · CINEMATIC HERO
            ════════════════════════════════════════════════════════════════════ */}
        <section
          onMouseMove={handleHeroMouseMove}
          className="relative w-full min-h-screen flex items-center overflow-hidden"
        >
          <AuroraBackground />

          {/* Hero content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-24 lg:py-32">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

              {/* ── Left: Text + CTAs ── */}
              <div className="lg:col-span-6 space-y-8">

                {/* Live badge */}
                <div className="hero-animate-1 inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass-card text-sm font-semibold">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                  <span className="text-emerald-300 font-mono tracking-widest text-xs">LIVE · TRADING REWARDS PLATFORM</span>
                </div>

                {/* Headline */}
                <div className="hero-animate-2 space-y-2">
                  <h1 className="text-5xl sm:text-6xl lg:text-7xl font-[900] tracking-tight leading-[1.02]">
                    <span className="text-white">TRADE.</span><br />
                    <span className="text-white">EARN.</span><br />
                    <span className="gradient-text">GET REWARDED.</span>
                  </h1>
                </div>

                {/* Subheadline */}
                <p className="hero-animate-3 text-lg text-slate-300 max-w-xl leading-relaxed">
                  The only prop firm rewards platform that turns your challenge purchases into{' '}
                  <span className="text-emerald-400 font-bold">Apple gear, Air Jordans, USDT crypto</span> — verified in 24hrs, shipped globally.
                </p>

                {/* Code copy pill */}
                <div className="hero-animate-4 flex items-center gap-3">
                  <span className="text-sm text-slate-400">Use code at checkout:</span>
                  <button
                    onClick={() => handleCopy('NATION')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl glass-card font-mono font-bold text-emerald-400 text-sm hover:border-emerald-500/50 transition-all group cursor-pointer"
                  >
                    <span>NATION</span>
                    {copiedCode === 'NATION' ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                    )}
                  </button>
                </div>

                {/* CTAs */}
                <div className="hero-animate-5 flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/prop-firms"
                    className="shimmer-btn relative overflow-hidden w-full sm:w-auto h-14 px-10 text-base font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 rounded-2xl shadow-2xl shadow-emerald-500/30 transition-all hover:scale-105 hover:shadow-emerald-500/50 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="h-5 w-5" />
                    <span>Start Earning Now</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/rewards"
                    className="w-full sm:w-auto h-14 px-8 text-base font-semibold glass-card text-white hover:border-emerald-500/40 rounded-2xl transition-all flex items-center justify-center gap-2"
                  >
                    <Gift className="h-5 w-5 text-emerald-400" />
                    <span>Explore Rewards</span>
                  </Link>
                </div>

                {/* Trust pillars */}
                <div className="hero-animate-5 grid grid-cols-4 gap-2">
                  {[
                    { icon: <ShieldCheck className="h-4 w-4" />, label: 'Verified', sub: 'Auto Receipt Audit' },
                    { icon: <Coins className="h-4 w-4" />, label: '$0.01/PT', sub: 'Guaranteed Value' },
                    { icon: <Truck className="h-4 w-4" />, label: 'Global Ship', sub: 'FedEx / DHL' },
                    { icon: <Zap className="h-4 w-4" />, label: 'USDT Pay', sub: 'TRC-20 Direct' },
                  ].map((p, i) => (
                    <div key={i} className="p-3 rounded-xl glass-card text-center">
                      <div className="text-emerald-400 flex justify-center mb-1">{p.icon}</div>
                      <div className="text-xs font-bold text-white">{p.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{p.sub}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Right: 3D Hero Card ── */}
              <div className="lg:col-span-6 flex items-center justify-center">
                <TiltCard className="w-full max-w-lg">
                  <div
                    className="rounded-3xl glass-card glow-border p-6 space-y-5 relative overflow-hidden"
                    style={{
                      transform: `perspective(1200px) rotateX(${-mousePos.y * 0.2}deg) rotateY(${mousePos.x * 0.2}deg)`,
                      transition: 'transform 0.12s ease-out',
                    }}
                  >
                    {/* Scan line animation */}
                    <div
                      className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent pointer-events-none"
                      style={{ animation: 'scanLine 4s linear infinite' }}
                    />

                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="relative h-3 w-3 pulse-ring">
                          <div className="h-3 w-3 rounded-full bg-emerald-500" />
                        </div>
                        <span className="font-mono text-xs font-bold text-emerald-400 tracking-widest">LIVE REWARDS TERMINAL</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 border border-slate-800 px-2 py-0.5 rounded">PRO TRADER</span>
                    </div>

                    {/* Balance display */}
                    <div className="py-4 border-y border-slate-800/60">
                      <div className="text-xs uppercase tracking-widest text-slate-500 font-mono mb-1">Total Reward Balance</div>
                      <div className="flex items-baseline justify-between">
                        <div className="text-4xl font-[900] font-mono text-white">
                          {pointsTick.toLocaleString()}
                          <span className="text-emerald-400 text-lg font-sans ml-2">PTS</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-mono font-bold px-2 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 animate-pulse">
                          <TrendingUp className="h-3.5 w-3.5" />
                          <span>+{Math.floor(pointsTick % 100 + 50)} ↑</span>
                        </div>
                      </div>
                      <div className="text-sm text-slate-400 mt-1">≈ ${(pointsTick * 0.01).toFixed(2)} USD instant liquidation</div>
                    </div>

                    {/* Live chart */}
                    <LiveTradingChart />

                    {/* Progress to next reward */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 flex items-center gap-1.5"><Headphones className="h-3.5 w-3.5 text-emerald-400" /> AirPods Max Target</span>
                        <span className="font-mono font-bold text-emerald-400">62%</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-slate-900 border border-slate-800 overflow-hidden p-0.5">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                          style={{ width: '62%', transition: 'width 0.8s ease-out' }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] font-mono text-slate-600">
                        <span>12,480 / 20,000 PTS</span>
                        <span>7,520 to unlock</span>
                      </div>
                    </div>

                    {/* Reward mini grid */}
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { icon: '🎧', name: 'AirPods Max', pts: '20K', color: 'emerald' },
                        { icon: '👟', name: 'Air Jordans', pts: '15K', color: 'teal' },
                        { icon: '📱', name: 'iPhone 16', pts: '120K', color: 'cyan' },
                      ].map((r, i) => (
                        <div key={i} className="p-2.5 rounded-xl glass-card-light text-center hover:border-emerald-500/30 transition-all cursor-pointer group">
                          <div className="text-xl mb-1">{r.icon}</div>
                          <div className="text-[9px] font-bold text-white group-hover:text-emerald-300 transition-colors">{r.name}</div>
                          <div className="text-[9px] font-mono text-emerald-400 mt-0.5">{r.pts}</div>
                        </div>
                      ))}
                    </div>

                    {/* Verify toast */}
                    <div
                      className={`flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 transition-all duration-500 ${showVerifyToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        <div>
                          <div className="text-xs font-bold text-white">Purchase Verified!</div>
                          <div className="text-[10px] text-emerald-300">FundedSquad $100K</div>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-emerald-400 text-sm">+4,990 PTS</span>
                    </div>
                  </div>
                </TiltCard>
              </div>
            </div>
          </div>

          {/* Scroll hint */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
            <span className="text-xs font-mono text-slate-500 tracking-widest">SCROLL</span>
            <ChevronDown className="h-5 w-5 text-slate-500 animate-bounce" />
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            §2 · LIVE TICKER
            ════════════════════════════════════════════════════════════════════ */}
        <div className="relative overflow-hidden border-y border-emerald-500/20 bg-[#05080b]">
          <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
          <LiveActivityTicker />
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            §3 · ANIMATED STATS BAR
            ════════════════════════════════════════════════════════════════════ */}
        <section className="w-full py-20 relative overflow-hidden bg-[#060a0d]">
          <SectionBackground
            imageUrl="https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1920&auto=format&fit=crop&q=80"
            opacity="opacity-12"
            glowColor="#10b981"
            glowPosition="center"
          />

          <div ref={statsRef} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Reveal><span className="font-mono text-xs text-emerald-400 tracking-widest">PLATFORM METRICS · LIVE</span></Reveal>
              <Reveal delay={100}><h2 className="text-3xl sm:text-4xl font-[900] text-white mt-2">Trusted by Thousands of Traders</h2></Reveal>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              <AnimatedStat value={12400} suffix="+" label="Active Traders" icon={<Users className="h-6 w-6" />} inView={statsInView} />
              <AnimatedStat value={2800000} prefix="" suffix=" PTS" label="Total Points Distributed" icon={<Coins className="h-6 w-6" />} inView={statsInView} />
              <AnimatedStat value={98} suffix="%" label="Verification Success Rate" icon={<ShieldCheck className="h-6 w-6" />} inView={statsInView} />
              <AnimatedStat value={50} suffix="+" label="Rewards Shipped Globally" icon={<Globe className="h-6 w-6" />} inView={statsInView} />
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            §4 · HOW IT WORKS — INTERACTIVE JOURNEY
            ════════════════════════════════════════════════════════════════════ */}
        <section id="how-it-works" className="w-full py-20 lg:py-28 relative overflow-hidden border-t border-slate-900">
          <SectionBackground
            imageUrl="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1920&auto=format&fit=crop&q=80"
            opacity="opacity-10"
            glowColor="#14b8a6"
            glowPosition="top-left"
          />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
            <div className="text-center space-y-3">
              <Reveal><Badge className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs">HOW IT WORKS</Badge></Reveal>
              <Reveal delay={100}><h2 className="text-4xl sm:text-5xl font-[900] text-white">From Challenge to Gear in 4 Steps</h2></Reveal>
              <Reveal delay={200}><p className="text-slate-400 max-w-xl mx-auto">The fastest prop firm rewards loop on the planet. Click a step to explore.</p></Reveal>
            </div>

            {/* Step selector */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
              {HOW_IT_WORKS.map((step, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`p-4 rounded-2xl text-left border transition-all cursor-pointer relative overflow-hidden group ${
                    activeStep === idx
                      ? 'bg-emerald-500/10 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {activeStep === idx && (
                    <div
                      className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500"
                      style={{ animation: 'stepProgress 3.5s linear infinite' }}
                    />
                  )}
                  <div className={`font-mono text-xs font-bold mb-1 ${activeStep === idx ? 'text-emerald-400' : 'text-slate-600'}`}>{step.num}</div>
                  <div className={`font-extrabold text-sm ${activeStep === idx ? 'text-white' : 'text-slate-400'}`}>{step.title}</div>
                  <div className="text-[11px] text-slate-600">{step.label}</div>
                </button>
              ))}
            </div>

            {/* Active step detail */}
            <div className="max-w-4xl mx-auto rounded-3xl glass-card p-8 transition-all">
              {HOW_IT_WORKS.map((step, idx) => (
                <div
                  key={idx}
                  className={`grid grid-cols-1 md:grid-cols-2 gap-10 items-center transition-all ${activeStep === idx ? 'block' : 'hidden'}`}
                >
                  <div className="space-y-5">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold font-mono ${
                      step.color === 'emerald' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' :
                      step.color === 'amber' ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400' :
                      'bg-purple-500/10 border border-purple-500/30 text-purple-400'
                    }`}>
                      {step.icon}
                      <span>STEP {step.num}: {step.title}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white">{step.title === 'BUY' ? 'Purchase with Code NATION' : step.title === 'VERIFY' ? 'Submit Receipt in Trader Portal' : step.title === 'EARN' ? 'Points Credited to Your Wallet' : 'Order Electronics or Cash Out'}</h3>
                    <p className="text-slate-400 leading-relaxed">{step.desc}</p>
                    <Link
                      href={idx === 0 ? '/prop-firms' : idx === 1 ? '/dashboard/purchases/new' : idx === 2 ? '/dashboard/points' : '/rewards'}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all hover:scale-105"
                    >
                      {idx === 0 ? 'View Partner Firms' : idx === 1 ? 'Submit Purchase Proof' : idx === 2 ? 'View Points Ledger' : 'Browse Rewards Catalog'}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                  <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                    {step.sim}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            §5 · CALCULATOR
            ════════════════════════════════════════════════════════════════════ */}
        <section id="calculator" className="w-full relative overflow-hidden border-t border-slate-900 bg-[#050808]">
          <SectionBackground
            imageUrl="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&auto=format&fit=crop&q=80"
            opacity="opacity-10"
            glowColor="#10b981"
            glowPosition="bottom"
          />
          <div className="relative z-10">
            <PropFirmCalculator />
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            §6 · PARTNER PROP FIRMS — 3D CARDS
            ════════════════════════════════════════════════════════════════════ */}
        <section id="prop-firms" className="w-full py-20 lg:py-28 relative overflow-hidden border-t border-slate-900 bg-[#04070a]">
          <SectionBackground
            imageUrl="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&auto=format&fit=crop&q=80"
            opacity="opacity-12"
            glowColor="#06b6d4"
            glowPosition="top-right"
          />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-3">
                <Reveal><Badge className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs">PARTNER PROP FIRMS</Badge></Reveal>
                <Reveal delay={100}><h2 className="text-4xl sm:text-5xl font-[900] text-white">Earn Up to <span className="gradient-text">10,000 Points</span> Per Challenge</h2></Reveal>
                <Reveal delay={200}><p className="text-slate-400">Verified affiliate partners with guaranteed point yields and direct support.</p></Reveal>
              </div>
              <Reveal direction="right">
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => handleTriggerAutoApply(propFirms[0])}
                    className="shimmer-btn relative overflow-hidden flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>1-Click Configurator</span>
                  </button>
                  <Link href="/prop-firms" className="flex items-center gap-2 px-5 py-3 rounded-xl glass-card text-white font-semibold text-sm hover:border-emerald-500/30 transition-all">
                    View All 12+ <ArrowRight className="h-4 w-4 text-emerald-400" />
                  </Link>
                </div>
              </Reveal>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {propFirms.slice(0, 4).map((firm, i) => (
                <Reveal key={firm.id} delay={i * 100}>
                  <TiltCard className="h-full">
                    <div className="h-full rounded-2xl glass-card p-5 flex flex-col justify-between space-y-5 hover:border-emerald-500/40 transition-all group">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="h-11 w-11 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden p-1">
                            <img src={firm.logoUrl || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=120&auto=format&fit=crop&q=80'} alt={firm.name} className="h-full w-full object-cover rounded-lg" />
                          </div>
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> VERIFIED
                          </span>
                        </div>
                        <div>
                          <h3 className="font-extrabold text-white group-hover:text-emerald-400 transition-colors">{firm.name}</h3>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{firm.description}</p>
                        </div>
                        <div className="space-y-1.5 pt-2 border-t border-slate-800 font-mono text-xs">
                          <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider pb-1">TIERS · REWARDS</div>
                          {(firm.offers || []).slice(0, 3).map((o) => (
                            <div key={o.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60">
                              <span className="text-slate-400">{o.accountTierName}</span>
                              <strong className="text-emerald-400">+{o.rewardPoints.toLocaleString()} PTS</strong>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-800">
                        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                          <span className="text-[11px] text-slate-500 font-mono">Code: <strong className="text-emerald-400">NATION</strong></span>
                          <button onClick={() => handleCopy(firm.affiliateCode || 'NATION')} className="text-xs text-slate-500 hover:text-white flex items-center gap-1 font-mono cursor-pointer transition-colors">
                            {copiedCode === (firm.affiliateCode || 'NATION') ? <><Check className="h-3 w-3 text-emerald-400" /><span className="text-emerald-400">Copied</span></> : <><Copy className="h-3 w-3" />Copy</>}
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleTriggerAutoApply(firm)}
                            className="py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all hover:scale-105 cursor-pointer"
                          >
                            <Sparkles className="h-3 w-3" /> Buy
                          </button>
                          <Link href={`/prop-firms/${firm.slug}`} className="py-2.5 rounded-xl glass-card text-white font-bold text-xs flex items-center justify-center gap-1 transition-all hover:border-emerald-500/30">
                            Info <ArrowRight className="h-3 w-3 text-emerald-400" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </TiltCard>
                </Reveal>
              ))}
            </div>

            <div className="text-center text-xs text-slate-600 max-w-3xl mx-auto py-4 border border-slate-900 rounded-2xl px-6">
              Disclaimer: Prop Nation is an independent affiliate rewards portal and not a broker or proprietary trading firm. All challenge purchases are made directly with the respective prop firm.
            </div>
          </div>

          <AutoApplyModal isOpen={isAutoApplyModalOpen} onClose={() => setIsAutoApplyModalOpen(false)} firm={activeAutoApplyFirm} />
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            §7 · REWARDS VAULT — FLOATING PRODUCT CARDS
            ════════════════════════════════════════════════════════════════════ */}
        <section id="rewards" className="w-full py-20 lg:py-28 border-t border-slate-900 relative overflow-hidden">
          <SectionBackground
            imageUrl="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1920&auto=format&fit=crop&q=80"
            opacity="opacity-12"
            glowColor="#10b981"
            glowPosition="top-right"
          />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-3">
                <Reveal><Badge className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs">PREMIUM REWARDS VAULT</Badge></Reveal>
                <Reveal delay={100}><h2 className="text-4xl sm:text-5xl font-[900] text-white">YOUR POINTS. <span className="gradient-text">YOUR REWARDS.</span></h2></Reveal>
                <Reveal delay={200}><p className="text-slate-400">Apple gear, trading hardware, streetwear, or USDT crypto — your call.</p></Reveal>
              </div>
              <Reveal direction="right">
                <Link href="/rewards" className="flex items-center gap-2 px-6 py-3 rounded-xl glass-card text-white font-semibold hover:border-emerald-500/30 transition-all">
                  View Full Catalog <ArrowRight className="h-4 w-4 text-emerald-400" />
                </Link>
              </Reveal>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.slice(0, 6).map((item, i) => (
                <Reveal key={item.id} delay={i * 80}>
                  <TiltCard className="h-full">
                    <div className="h-full rounded-2xl glass-card overflow-hidden flex flex-col group hover:border-emerald-500/40 transition-all">
                      {/* Product image */}
                      <div className="aspect-[4/3] relative overflow-hidden bg-slate-950">
                        <img
                          src={item.imageUrl || 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80'}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80'; }}
                        />
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                        <div className="absolute top-3 left-3 glass-card text-emerald-400 font-mono text-[10px] font-bold px-2 py-0.5 rounded-lg">
                          {item.category?.name || 'Hardware'}
                        </div>
                        {/* Stock badge */}
                        {!item.isUnlimitedStock && item.stock !== undefined && item.stock < 5 && (
                          <div className="absolute top-3 right-3 bg-rose-500/90 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-lg">
                            {item.stock} LEFT
                          </div>
                        )}
                      </div>

                      <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                        <div>
                          <h3 className="font-extrabold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">{item.name}</h3>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="font-mono text-2xl font-[900] gradient-text">{item.pointsRequired.toLocaleString()}</span>
                            <span className="text-xs font-bold text-slate-500">POINTS</span>
                            <span className="text-xs text-slate-600 font-mono">· ${(item.pointsRequired * 0.01).toFixed(0)} USD</span>
                          </div>
                        </div>
                        <Link
                          href={`/rewards/${item.slug || 'reward'}`}
                          className="w-full py-3 rounded-xl glass-card text-center text-white font-bold text-sm hover:bg-emerald-500 hover:text-slate-950 hover:border-emerald-500 transition-all flex items-center justify-center gap-2"
                        >
                          <Trophy className="h-4 w-4" />
                          Unlock With Points
                        </Link>
                      </div>
                    </div>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            §8 · REWARD PROGRESS SIMULATOR
            ════════════════════════════════════════════════════════════════════ */}
        <section className="w-full py-20 lg:py-28 border-t border-slate-900 relative overflow-hidden bg-[#04070a]">
          <SectionBackground
            imageUrl="https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1920&auto=format&fit=crop&q=80"
            opacity="opacity-10"
            glowColor="#14b8a6"
            glowPosition="center"
          />
          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
            <div>
              <Reveal><Badge className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs">REWARD SIMULATOR</Badge></Reveal>
              <Reveal delay={100}><h2 className="text-4xl font-[900] text-white mt-3">Watch How Fast You <span className="gradient-text">Unlock Real Gear</span></h2></Reveal>
              <Reveal delay={200}><p className="text-slate-400 mt-3 max-w-xl mx-auto">Simulate completing evaluations to see your points hit unlock threshold.</p></Reveal>
            </div>

            <Reveal delay={300}>
              <TiltCard>
                <div className="rounded-3xl glass-card p-8 space-y-6 text-left">
                  <div className="flex items-center gap-4 pb-5 border-b border-slate-800">
                    <div className="h-14 w-14 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=200&auto=format&fit=crop&q=80" alt="AirPods Max" className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-extrabold text-white">Apple AirPods Max (Space Gray)</h4>
                      <div className="text-sm font-mono text-emerald-400">Target: 20,000 Points</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-2xl font-[900] text-white">{simulatedUnlocked ? '20,000' : '12,500'}</div>
                      <div className="text-xs font-mono text-emerald-400">{simulatedUnlocked ? '✓ UNLOCKED' : '7,500 to go'}</div>
                    </div>
                  </div>

                  {/* Animated bar */}
                  <div className="space-y-2">
                    <div className="h-5 rounded-full bg-slate-900 border border-slate-800 overflow-hidden p-0.5">
                      <div
                        style={{ width: simulatedUnlocked ? '100%' : '62.5%' }}
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${
                          simulatedUnlocked
                            ? 'bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 shadow-lg shadow-emerald-500/50'
                            : 'bg-gradient-to-r from-emerald-600 to-teal-500'
                        }`}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] font-mono text-slate-600">
                      <span>0 PTS</span><span>10,000 PTS</span><span>20,000 PTS (GOAL)</span>
                    </div>
                  </div>

                  {/* Challenge simulator pills */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { label: '+1 $50K Challenge', pts: '+2,990 PTS', cost: '$299' },
                      { label: '+1 $100K Challenge', pts: '+4,990 PTS', cost: '$499' },
                      { label: '+1 $200K Challenge', pts: '+9,790 PTS', cost: '$979' },
                    ].map((c, i) => (
                      <button
                        key={i}
                        onClick={() => setSimulatedUnlocked(true)}
                        className="p-3 rounded-xl glass-card hover:border-emerald-500/40 transition-all cursor-pointer text-left group"
                      >
                        <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">{c.label}</div>
                        <div className="text-[10px] font-mono text-emerald-400 mt-1">{c.pts}</div>
                        <div className="text-[10px] text-slate-600 mt-0.5">Cost: {c.cost}</div>
                      </button>
                    ))}
                  </div>

                  {simulatedUnlocked ? (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-2xl">🎉</div>
                        <div>
                          <div className="font-bold text-white">Reward Unlocked!</div>
                          <div className="text-xs text-emerald-400">AirPods Max ready for redemption</div>
                        </div>
                      </div>
                      <Link href="/rewards" className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-all">
                        Redeem →
                      </Link>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-600 text-center">Click any challenge above to simulate adding points to your wallet</p>
                  )}
                </div>
              </TiltCard>
            </Reveal>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            §9 · TRADER DASHBOARD SHOWCASE: YOUR COMPLETE REWARDS HEADQUARTERS
            ════════════════════════════════════════════════════════════════════ */}
        <section id="terminal" className="w-full py-20 lg:py-28 border-t border-slate-900 relative overflow-hidden bg-[#04070a]">
          <SectionBackground
            imageUrl="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1920&auto=format&fit=crop&q=80"
            opacity="opacity-15"
            glowColor="#10b981"
            glowPosition="center"
          />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-3 max-w-3xl mx-auto">
              <Reveal>
                <Badge className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs">
                  TRADER TERMINAL SHOWCASE
                </Badge>
              </Reveal>
              <Reveal delay={100}>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-[900] tracking-tight text-white">
                  Your Complete Rewards <span className="gradient-text">Headquarters</span>
                </h2>
              </Reveal>
              <Reveal delay={200}>
                <p className="text-base sm:text-lg text-slate-400">
                  Interactive preview of your trader profile, purchase submission queue, points wallet, and delivery status.
                </p>
              </Reveal>
            </div>

            {/* Interactive Live Browser Frame with REAL Dashboard Image */}
            <Reveal delay={300}>
              <div className="rounded-2xl bg-[#0b1110] border border-emerald-500/30 shadow-2xl shadow-emerald-950/50 overflow-hidden max-w-5xl mx-auto group">
                {/* Browser Window Header */}
                <div className="px-5 py-3.5 bg-[#080d0c] border-b border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-3 w-3 rounded-full bg-rose-500/90" />
                    <div className="h-3 w-3 rounded-full bg-amber-500/90" />
                    <div className="h-3 w-3 rounded-full bg-emerald-500/90" />
                    <span className="font-mono text-xs text-slate-400 ml-2 px-3 py-1 rounded-md bg-slate-900/80 border border-slate-800">
                      propnation.app/dashboard
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="tracking-wider">LIVE TERMINAL</span>
                  </div>
                </div>

                {/* Real Dashboard Image */}
                <div className="relative overflow-hidden bg-slate-950">
                  <Link href="/dashboard" className="block relative cursor-pointer group/img">
                    <img
                      src="/dashboard-preview.png"
                      alt="Prop Nation Trader Dashboard Portal"
                      className="w-full h-auto object-cover transform transition-transform duration-500 group-hover/img:scale-[1.01]"
                    />
                    {/* Subtle Hover Overlay */}
                    <div className="absolute inset-0 bg-emerald-950/20 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[1px]">
                      <span className="px-6 py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm shadow-xl flex items-center gap-2 transform translate-y-2 group-hover/img:translate-y-0 transition-transform">
                        Launch Live Trader Portal <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                </div>

                {/* Quick Interactive Terminal Stats Bar */}
                <div className="px-6 py-4 bg-[#080d0c] border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Account Mode</span>
                    <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> PRO TRADER
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Active Partner Code</span>
                    <div className="text-xs font-bold font-mono text-white">NATION (100% Validated)</div>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Redemption Value</span>
                    <div className="text-xs font-bold text-teal-400 font-mono">$0.01 / Point Guarantee</div>
                  </div>
                  <div className="space-y-0.5 sm:text-right">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Global Payouts</span>
                    <div className="text-xs font-bold text-purple-400">USDT &amp; Apple Gear</div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            §10 · SOCIAL PROOF / TESTIMONIALS
            ════════════════════════════════════════════════════════════════════ */}
        <section className="w-full py-20 lg:py-28 border-t border-slate-900 relative overflow-hidden">
          <SectionBackground
            imageUrl="https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1920&auto=format&fit=crop&q=80"
            opacity="opacity-10"
            glowColor="#10b981"
            glowPosition="top-left"
          />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-3">
              <Reveal><Badge className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs">TRADER TESTIMONIALS</Badge></Reveal>
              <Reveal delay={100}><h2 className="text-4xl font-[900] text-white">Traders Love <span className="gradient-text">Prop Nation</span></h2></Reveal>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: 'Marcus Chen', handle: '@marcustradesFX', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80', stars: 5, text: 'Got my AirPods Max in 3 days after verification. The whole process was seamless. Prop Nation is the real deal — legit rewards for purchases I was already making.' },
                { name: 'Sarah Okafor', handle: '@sarahfundedtrader', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&auto=format&fit=crop&q=80', stars: 5, text: 'Redeemed 50K points for USDT straight to my wallet. The $0.01/pt guarantee is real — no hidden fees, no minimum BS. This is how prop firm rewards should work.' },
                { name: 'Daniel Rivera', handle: '@drivera_fx', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80', stars: 5, text: 'Using code NATION saved me time and got me rewarded at the same time. The 1-click auto-apply feature is insane — just click and the code is applied automatically.' },
              ].map((t, i) => (
                <Reveal key={i} delay={i * 120}>
                  <TiltCard className="h-full">
                    <div className="h-full rounded-2xl glass-card p-6 space-y-4 hover:border-emerald-500/30 transition-all">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: t.stars }).map((_, j) => (
                          <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                      <div className="flex items-center gap-3 pt-2 border-t border-slate-800">
                        <img src={t.avatar} alt={t.name} className="h-10 w-10 rounded-full object-cover border border-slate-700" onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80'; }} />
                        <div>
                          <div className="font-bold text-white text-sm">{t.name}</div>
                          <div className="text-xs text-slate-500 font-mono">{t.handle}</div>
                        </div>
                        <div className="ml-auto">
                          <div className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">VERIFIED TRADER</div>
                        </div>
                      </div>
                    </div>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            §10 · MEGA CTA BANNER
            ════════════════════════════════════════════════════════════════════ */}
        <section className="w-full py-24 lg:py-32 border-t border-slate-900 relative overflow-hidden">
          <SectionBackground
            imageUrl="https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=1920&auto=format&fit=crop&q=80"
            opacity="opacity-15"
            glowColor="#10b981"
            glowPosition="center"
          />

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <Reveal>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm">
                <Flame className="h-4 w-4 text-orange-400" />
                <span className="font-mono text-emerald-300 text-xs tracking-widest">LIMITED PARTNER SLOTS AVAILABLE</span>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <h2 className="text-5xl sm:text-6xl lg:text-7xl font-[900] tracking-tight leading-tight text-white">
                Ready to Turn<br />Your Trades Into<br /><span className="gradient-text">Real Rewards?</span>
              </h2>
            </Reveal>
            <Reveal delay={200}>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                Join <strong className="text-white">12,400+</strong> traders already earning Apple gear, sneakers, and USDT crypto just by buying challenges they were already buying.
              </p>
            </Reveal>
            <Reveal delay={300}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/register"
                  className="shimmer-btn relative overflow-hidden h-16 px-12 text-lg font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 rounded-2xl shadow-2xl shadow-emerald-500/30 transition-all hover:scale-105 hover:shadow-emerald-500/50 active:scale-95 flex items-center justify-center gap-3"
                >
                  <Sparkles className="h-5 w-5" />
                  Create Free Account
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/how-it-works"
                  className="h-16 px-10 text-lg font-semibold glass-card text-white hover:border-emerald-500/40 rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                  <Activity className="h-5 w-5 text-emerald-400" />
                  How It Works
                </Link>
              </div>
            </Reveal>
            <Reveal delay={400}>
              <div className="flex items-center justify-center gap-6 text-sm text-slate-500">
                <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-emerald-500" /> No credit card</span>
                <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> 100% free to join</span>
                <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-emerald-500" /> Instant setup</span>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            §11 · FAQ
            ════════════════════════════════════════════════════════════════════ */}
        <section className="w-full py-20 lg:py-28 relative overflow-hidden border-t border-slate-900 bg-[#04070a]">
          <SectionBackground
            imageUrl="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1920&auto=format&fit=crop&q=80"
            opacity="opacity-10"
            glowColor="#06b6d4"
            glowPosition="center"
          />
          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center space-y-3">
              <Reveal><Badge className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs">FREQUENTLY ASKED</Badge></Reveal>
              <Reveal delay={100}><h2 className="text-4xl font-[900] text-white">Got Questions?</h2></Reveal>
            </div>
            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <Reveal key={i} delay={i * 60}>
                  <div className={`rounded-2xl glass-card overflow-hidden transition-all ${openFaq === i ? 'border-emerald-500/30' : 'hover:border-slate-700'}`}>
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                    >
                      <span className="font-bold text-white">{faq.q}</span>
                      <ChevronDown className={`h-5 w-5 text-emerald-400 shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? 'max-h-40 pb-5' : 'max-h-0'}`}>
                      <p className="px-5 text-slate-400 text-sm leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal delay={300}>
              <div className="text-center">
                <Link href="/faq" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors flex items-center justify-center gap-2">
                  View All FAQs <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

      </div>
    </>
  );
}
