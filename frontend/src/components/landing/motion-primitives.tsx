'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FloatingCandlesticks } from '@/components/trading/floating-candlesticks';

export function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

export function useAnimatedNumber(from: number, to: number, duration = 1200, trigger = true) {
  const [value, setValue] = useState(from);

  useEffect(() => {
    if (!trigger) {
      setValue(from);
      return;
    }
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setValue(to);
      return;
    }

    const startTime = performance.now();
    let rafId: number;
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(from + (to - from) * eased));
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [from, to, duration, trigger]);

  return value;
}

/**
 * #8 & #34 · Desktop-only subtle mouse parallax hook
 * Returns normalized { x, y } in [-1, 1] range. Disabled on touch devices and prefers-reduced-motion.
 */
export function useMouseParallax() {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!finePointer || reducedMotion) return;

    let rafId: number | null = null;
    const handleMove = (e: MouseEvent) => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        const nx = (e.clientX / window.innerWidth - 0.5) * 2;
        const ny = (e.clientY / window.innerHeight - 0.5) * 2;
        setOffset({ x: nx, y: ny });
        rafId = null;
      });
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return offset;
}

export function Reveal({
  children,
  delay = 0,
  direction = 'up',
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'left' | 'right' | 'fade' | 'scale';
  className?: string;
}) {
  const { ref, inView } = useInView(0.12);
  const transforms: Record<string, string> = {
    up: 'translateY(24px)',
    left: 'translateX(-24px)',
    right: 'translateX(24px)',
    fade: 'translateY(0px)',
    scale: 'scale(0.97) translateY(14px)',
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'none' : transforms[direction],
        transition: `opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.65s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}

/**
 * #43 · SCROLL PROGRESS
 * Thin 1.5px emerald/cyan scroll progress indicator at the top of the page (0% -> 100%).
 */
export function ScrollProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let rafId: number | null = null;
    const updateScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
        setProgress(pct);
        rafId = null;
      });
    };

    window.addEventListener('scroll', updateScroll, { passive: true });
    updateScroll();
    return () => {
      window.removeEventListener('scroll', updateScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[2px] z-[60] pointer-events-none bg-transparent"
    >
      <div
        className="h-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-cyan-400 shadow-[0_0_8px_rgba(16,185,129,0.55)] transition-[width] duration-75 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export type AtmosphericVariant =
  | 'hero'
  | 'traders'
  | 'challenge'
  | 'prop-firms'
  | 'final-cta'
  | 'calm'
  | 'section'
  | 'subtle';

interface CandleDef {
  x: number;
  y: number;
  body: number;
  wick: number;
  bull: boolean;
  dur: string;
  dir: 'up' | 'down';
  opacity: number;
  mobileVisible?: boolean;
}

const HERO_CANDLES: CandleDef[] = [
  // Positioned primarily on the right / dashboard side & outer edges so hero headline text stays 100% clear (#14, #48)
  { x: 640, y: 310, body: 36, wick: 68, bull: true, dur: '6s', dir: 'up', opacity: 0.55 },
  { x: 705, y: 340, body: 22, wick: 46, bull: false, dur: '8s', dir: 'down', opacity: 0.42 },
  { x: 775, y: 275, body: 44, wick: 82, bull: true, dur: '5s', dir: 'up', opacity: 0.75, mobileVisible: true },
  { x: 845, y: 295, body: 26, wick: 52, bull: false, dur: '9s', dir: 'down', opacity: 0.45 },
  { x: 915, y: 235, body: 50, wick: 88, bull: true, dur: '7s', dir: 'up', opacity: 0.85, mobileVisible: true },
  { x: 985, y: 205, body: 38, wick: 70, bull: true, dur: '6s', dir: 'up', opacity: 0.7 },
  { x: 1055, y: 228, body: 24, wick: 48, bull: false, dur: '10s', dir: 'down', opacity: 0.42 },
  { x: 1125, y: 175, body: 54, wick: 92, bull: true, dur: '4.5s', dir: 'up', opacity: 0.9 },
  { x: 1195, y: 195, body: 28, wick: 54, bull: false, dur: '8.5s', dir: 'down', opacity: 0.45 },
  { x: 1265, y: 145, body: 48, wick: 86, bull: true, dur: '6.5s', dir: 'up', opacity: 0.8 },
  { x: 1335, y: 120, body: 40, wick: 74, bull: true, dur: '7.5s', dir: 'up', opacity: 0.65 },
];

const TRADERS_CANDLES: CandleDef[] = [
  { x: 120, y: 360, body: 34, wick: 62, bull: true, dur: '7s', dir: 'up', opacity: 0.6 },
  { x: 230, y: 380, body: 24, wick: 48, bull: false, dur: '9s', dir: 'down', opacity: 0.4 },
  { x: 340, y: 325, body: 42, wick: 76, bull: true, dur: '6s', dir: 'up', opacity: 0.7, mobileVisible: true },
  { x: 460, y: 300, body: 36, wick: 66, bull: true, dur: '8s', dir: 'up', opacity: 0.65 },
  { x: 580, y: 320, body: 26, wick: 50, bull: false, dur: '10s', dir: 'down', opacity: 0.42 },
  { x: 700, y: 265, body: 48, wick: 84, bull: true, dur: '5.5s', dir: 'up', opacity: 0.75 },
  { x: 820, y: 235, body: 38, wick: 70, bull: true, dur: '7.5s', dir: 'up', opacity: 0.7 },
  { x: 940, y: 255, body: 24, wick: 48, bull: false, dur: '8.5s', dir: 'down', opacity: 0.42 },
  { x: 1060, y: 195, body: 52, wick: 90, bull: true, dur: '6.5s', dir: 'up', opacity: 0.8, mobileVisible: true },
  { x: 1180, y: 170, body: 40, wick: 72, bull: true, dur: '7s', dir: 'up', opacity: 0.68 },
  { x: 1300, y: 145, body: 44, wick: 78, bull: true, dur: '9s', dir: 'up', opacity: 0.6 },
];

/**
 * #4–#13, #32, #37, #47, #52 · Multi-Layered Atmospheric Trading Visual System
 * Layer 1: Atmospheric radial lighting (emerald + subtle cyan)
 * Layer 2: Edge-masked trading grid (with subtle parallax)
 * Layer 3: Organic floating candlesticks (green bullish + subtle red bearish) + slow price line
 * Layer 4: Minimal floating data particles & connected nodes
 */
export function TradingVisualBackground({
  variant = 'hero',
}: {
  variant?: AtmosphericVariant;
}) {
  const parallax = useMouseParallax();

  const showCandles =
    variant === 'hero' ||
    variant === 'traders' ||
    variant === 'challenge' ||
    variant === 'prop-firms' ||
    variant === 'final-cta' ||
    variant === 'section';

  const candles = variant === 'traders' ? TRADERS_CANDLES : HERO_CANDLES;

  const svgOpacityClass =
    variant === 'hero'
      ? 'opacity-[0.13]'
      : variant === 'traders'
      ? 'opacity-[0.11]'
      : variant === 'final-cta'
      ? 'opacity-[0.09]'
      : variant === 'challenge'
      ? 'opacity-[0.085]'
      : 'opacity-[0.06]';

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none select-none"
      aria-hidden="true"
    >
      {/* Unified Trading Grid + Floating Candlesticks + Price Levels (Light & Dark Mode) */}
      <FloatingCandlesticks />

      {/* LAYER 1: Atmospheric Blurred Radial Gradients (#4, #40) */}
      {variant === 'hero' && (
        <>
          {/* Large soft emerald glow behind right-side dashboard */}
          <div
            className="absolute top-8 right-[4%] w-[640px] h-[540px] rounded-full opacity-[0.16]"
            style={{
              background: 'radial-gradient(ellipse at center, #10b981 0%, rgba(16,185,129,0.25) 45%, transparent 72%)',
              filter: 'blur(95px)',
              transform: `translate3d(${parallax.x * -4}px, ${parallax.y * -3}px, 0)`,
            }}
          />
          {/* Subtle cyan/blue secondary edge glow */}
          <div
            className="absolute bottom-4 right-[18%] w-[480px] h-[420px] rounded-full opacity-[0.09]"
            style={{
              background: 'radial-gradient(ellipse at center, #06b6d4 0%, transparent 70%)',
              filter: 'blur(105px)',
              transform: `translate3d(${parallax.x * 4}px, ${parallax.y * 3}px, 0)`,
            }}
          />
          {/* Subtle top-left ambient depth */}
          <div
            className="absolute -top-36 left-[8%] w-[500px] h-[420px] rounded-full opacity-[0.07]"
            style={{
              background: 'radial-gradient(ellipse at center, #10b981 0%, transparent 70%)',
              filter: 'blur(110px)',
            }}
          />
        </>
      )}

      {(variant === 'traders' || variant === 'challenge' || variant === 'final-cta' || variant === 'section') && (
        <>
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[780px] h-[460px] rounded-full opacity-[0.09]"
            style={{
              background: 'radial-gradient(ellipse at center, #10b981 0%, transparent 70%)',
              filter: 'blur(110px)',
            }}
          />
          <div
            className="absolute bottom-0 right-[12%] w-[460px] h-[340px] rounded-full opacity-[0.06]"
            style={{
              background: 'radial-gradient(ellipse at center, #06b6d4 0%, transparent 70%)',
              filter: 'blur(100px)',
            }}
          />
        </>
      )}

      {variant === 'calm' && (
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[680px] h-[380px] rounded-full opacity-[0.055]"
          style={{
            background: 'radial-gradient(ellipse at center, #10b981 0%, transparent 72%)',
            filter: 'blur(115px)',
          }}
        />
      )}

      {/* LAYER 2: Edge-Masked Trading Grid (#10) */}
      <div
        className={`absolute inset-0 ${
          variant === 'hero'
            ? 'opacity-[0.075]'
            : variant === 'traders'
            ? 'opacity-[0.065]'
            : 'opacity-[0.04]'
        } [mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_82%)]`}
        style={{
          backgroundImage:
            variant === 'prop-firms'
              ? 'repeating-linear-gradient(135deg, rgba(16, 185, 129, 0.22) 0px, rgba(16, 185, 129, 0.22) 1px, transparent 1px, transparent 48px), linear-gradient(to bottom, rgba(148, 163, 184, 0.22) 1px, transparent 1px)'
              : 'linear-gradient(to right, rgba(148, 163, 184, 0.38) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.38) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          transform:
            variant === 'hero'
              ? `translate3d(${parallax.x * 2.5}px, ${parallax.y * 1.5}px, 0)`
              : undefined,
        }}
      />

      {/* LAYER 3 & 4: Candlesticks + Slow Price Chart + Floating Data Particles (#5–#11) */}
      {variant !== 'calm' && (
        <svg
          className={`w-full h-full ${svgOpacityClass} transition-transform duration-200 ease-out`}
          viewBox="0 0 1440 600"
          fill="none"
          preserveAspectRatio="none"
          style={
            variant === 'hero'
              ? {
                  transform: `translate3d(${parallax.x * 8}px, ${parallax.y * 4}px, 0)`,
                }
              : undefined
          }
        >
          <defs>
            <linearGradient id="pnChartArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
              <stop offset="65%" stopColor="#06b6d4" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="pnPriceLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.18" />
              <stop offset="45%" stopColor="#10b981" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0.45" />
            </linearGradient>
          </defs>

          {/* Horizontal reference lines */}
          <line x1="0" y1="150" x2="1440" y2="150" stroke="#94a3b8" strokeOpacity="0.2" strokeDasharray="4 8" />
          <line x1="0" y1="300" x2="1440" y2="300" stroke="#94a3b8" strokeOpacity="0.18" strokeDasharray="4 8" />
          <line x1="0" y1="450" x2="1440" y2="450" stroke="#94a3b8" strokeOpacity="0.2" strokeDasharray="4 8" />

          {/* Subtle area fill under market curve (#9) */}
          <path
            d="M0 475 C 180 455, 310 410, 480 375 C 640 340, 770 305, 920 245 C 1080 180, 1240 150, 1440 105 L 1440 600 L 0 600 Z"
            fill="url(#pnChartArea)"
          />

          {/* Primary market price curve (#9) */}
          <path
            d="M0 475 C 180 455, 310 410, 480 375 C 640 340, 770 305, 920 245 C 1080 180, 1240 150, 1440 105"
            stroke="url(#pnPriceLine)"
            strokeWidth="2"
          />

          {/* Secondary cyan moving average curve */}
          <path
            d="M0 505 C 240 485, 410 440, 610 395 C 810 350, 990 295, 1185 235 C 1310 198, 1385 170, 1440 152"
            stroke="#06b6d4"
            strokeOpacity="0.42"
            strokeWidth="1.25"
            strokeDasharray="6 6"
          />

          {/* Floating Candlesticks (#5, #6, #7, #47, #48) */}
          {showCandles &&
            candles.map((c, idx) => {
              // For prop-firms variant (#23), keep candles only at the outer left/right edges
              if (variant === 'prop-firms' && c.x > 300 && c.x < 1120) {
                return null;
              }
              const fill = c.bull ? '#10b981' : '#f43f5e';
              const stroke = c.bull ? '#34d399' : '#fb7185';
              const wickTop = c.y - (c.wick - c.body) / 2;
              const wickBottom = c.y + c.body + (c.wick - c.body) / 2;
              const animName = c.dir === 'up' ? 'candleFloatUp' : 'candleFloatDown';

              return (
                <g
                  key={idx}
                  className={c.mobileVisible ? '' : 'hidden sm:block'}
                  style={{
                    opacity: c.opacity,
                    animation: `${animName} ${c.dur} ease-in-out ${idx * 0.35}s infinite`,
                    transformOrigin: `${c.x + 5}px ${c.y + c.body / 2}px`,
                  }}
                >
                  {/* Thin Wick */}
                  <line
                    x1={c.x + 5}
                    y1={wickTop}
                    x2={c.x + 5}
                    y2={wickBottom}
                    stroke={stroke}
                    strokeWidth="1.4"
                  />
                  {/* Candle Body */}
                  <rect
                    x={c.x}
                    y={c.y}
                    width="10"
                    height={c.body}
                    rx="2"
                    fill={fill}
                  />
                </g>
              );
            })}

          {/* LAYER 4: Minimal Floating Data Particles & Connected Nodes (#11) */}
          <g className="hidden sm:block" opacity="0.75">
            <line x1="780" y1="245" x2="920" y2="210" stroke="#10b981" strokeOpacity="0.28" strokeWidth="1" />
            <line x1="920" y1="210" x2="1080" y2="180" stroke="#06b6d4" strokeOpacity="0.25" strokeWidth="1" />
            <circle cx="480" cy="375" r="3" fill="#10b981" />
            <circle cx="780" cy="245" r="3" fill="#06b6d4" />
            <circle cx="920" cy="210" r="3.5" fill="#10b981" />
            <circle cx="1080" cy="180" r="3.5" fill="#10b981" />
            <circle cx="1240" cy="150" r="3" fill="#06b6d4" />
            {/* Tiny minimal data markers */}
            <rect x="755" y="195" width="14" height="2" rx="1" fill="#10b981" fillOpacity="0.45" />
            <rect x="1035" y="140" width="18" height="2" rx="1" fill="#06b6d4" fillOpacity="0.4" />
            <rect x="1205" y="220" width="12" height="2" rx="1" fill="#10b981" fillOpacity="0.4" />
          </g>
        </svg>
      )}
    </div>
  );
}

export const TradingBackground = TradingVisualBackground;

/**
 * #44 · CURSOR LIGHT
 * Desktop-only subtle green/cyan radial light following cursor.
 * Disabled on mobile, touch devices, and reduced-motion mode (#46).
 */
export function CursorSpotlight() {
  const spotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!finePointer || reducedMotion) return;

    const handleMove = (e: MouseEvent) => {
      if (!spotRef.current) return;
      spotRef.current.style.transform = `translate3d(${e.clientX - 260}px, ${e.clientY - 260}px, 0)`;
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <div
      ref={spotRef}
      aria-hidden="true"
      className="hidden lg:block fixed top-0 left-0 w-[520px] h-[520px] rounded-full pointer-events-none z-10 opacity-[0.045] transition-transform duration-150 ease-out"
      style={{
        background: 'radial-gradient(circle, rgba(16,185,129,0.85) 0%, rgba(6,182,212,0.35) 42%, transparent 70%)',
        filter: 'blur(42px)',
        willChange: 'transform',
      }}
    />
  );
}
