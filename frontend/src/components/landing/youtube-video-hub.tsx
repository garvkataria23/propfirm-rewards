'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  ExternalLink,
  Sparkles,
  Clock,
  CheckCircle2,
  Film,
} from 'lucide-react';
import { Reveal, TradingVisualBackground } from './motion-primitives';

function Youtube({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export interface PropFirmVideo {
  id: string;
  youtubeId: string;
  title: string;
  channel: string;
  durationLabel: string;
  durationSeconds: number;
  category: 'howto' | 'firms' | 'strategy' | 'futures';
  categoryBadge: string;
  description: string;
  takeaways: string[];
}

export const PROP_FIRM_VIDEOS: PropFirmVideo[] = [
  {
    id: 'vid-1',
    youtubeId: '1O4_6u5hZ_I',
    title: 'Prop Firms EXPLAINED in 5 Minutes — How Funded Trading Works',
    channel: 'Trade With Jem',
    durationLabel: '05:14',
    durationSeconds: 314,
    category: 'howto',
    categoryBadge: 'How Prop Firms Work',
    description:
      'Complete breakdown of how proprietary trading firms work, how evaluation challenges are structured, and how to use PROP NATION partner links to earn cashback & reward points on every challenge.',
    takeaways: [
      '1-Step vs 2-Step evaluation challenges explained',
      'How profit splits (80%–90%) and funded payouts work',
      'Use code NATION at checkout to earn reward points',
    ],
  },
  {
    id: 'vid-2',
    youtubeId: 'O1K-vQF1_W4',
    title: 'How to Purchase a Prop Firm Account Step-by-Step (Checkout Guide)',
    channel: 'Prop Trading Academy',
    durationLabel: '06:42',
    durationSeconds: 402,
    category: 'howto',
    categoryBadge: 'How to Use & Checkout',
    description:
      'Step-by-step walkthrough showing how to select your account size ($5K–$200K), apply your affiliate/discount code at checkout, and save your order invoice for instant reward verification.',
    takeaways: [
      'Selecting platform (MT5, cTrader, Match-Trader)',
      'Applying promo code at guest checkout',
      'Uploading order confirmation in PropNation Dashboard',
    ],
  },
  {
    id: 'vid-3',
    youtubeId: '9iNfy94v-v0',
    title: 'Prop Firms EXPLAINED! (Beginner’s Must-Watch Full Guide)',
    channel: 'Blue Edge Financial',
    durationLabel: '11:28',
    durationSeconds: 688,
    category: 'howto',
    categoryBadge: 'Beginner Masterclass',
    description:
      'Everything a new trader needs to know before buying their first prop firm evaluation—covering account sizing, scaling plans, and realistic monthly profit targets.',
    takeaways: [
      'Why traders use prop firms instead of small personal accounts',
      'Understanding evaluation fees vs capital allocation',
      'Common beginner pitfalls to avoid on Day 1',
    ],
  },
  {
    id: 'vid-4',
    youtubeId: '_DvBJEbYR2U',
    title: 'How to Make Money Trading Prop Firms (Full Blueprint)',
    channel: 'ImanTrading',
    durationLabel: '16:05',
    durationSeconds: 965,
    category: 'strategy',
    categoryBadge: 'Payout Blueprint',
    description:
      'A realistic, math-backed blueprint on passing evaluations, managing funded accounts across multiple prop firms, and withdrawing consistent payouts.',
    takeaways: [
      'Capital allocation across multiple partner prop firms',
      'Protecting funded accounts after your first payout',
      'Compounding payouts into larger account tiers',
    ],
  },
  {
    id: 'vid-5',
    youtubeId: 'Im1U8_oKtPc',
    title: 'FTMO Challenge Explained — Everything You Need To Know (2026)',
    channel: 'Trade With Jem',
    durationLabel: '09:45',
    durationSeconds: 585,
    category: 'firms',
    categoryBadge: 'FTMO Guide',
    description:
      'Deep dive into FTMO’s 2-Step evaluation: 10% Phase 1 target, 5% Phase 2 Verification target, 5% Max Daily Loss, and 10% Maximum Static Loss rules.',
    takeaways: [
      'Phase 1 (10%) & Phase 2 (5%) profit target breakdown',
      'How FTMO calculates Daily Loss reset at midnight CE(S)T',
      'Up to 90% profit split + full challenge fee refund',
    ],
  },
  {
    id: 'vid-6',
    youtubeId: '3XNBBePGr4U',
    title: 'FundedNext Rules & Challenge Models Explained in 5 Minutes',
    channel: 'Daniel Proestos',
    durationLabel: '05:18',
    durationSeconds: 318,
    category: 'firms',
    categoryBadge: 'FundedNext Guide',
    description:
      'Quick guide to FundedNext Stellar 1-Step and Stellar 2-Step evaluations, including the 15% profit share earned during the challenge phase itself.',
    takeaways: [
      'Stellar 1-Step vs Stellar 2-Step drawdown comparison',
      'How the 15% challenge phase profit share works',
      'Balance-based drawdown calculation explained',
    ],
  },
  {
    id: 'vid-7',
    youtubeId: 'A5TjfmOOpDg',
    title: 'Funding Pips Explained in 7 Minutes (Complete 2026 Guide)',
    channel: 'Trade With Jem',
    durationLabel: '07:12',
    durationSeconds: 432,
    category: 'firms',
    categoryBadge: 'Funding Pips Guide',
    description:
      'Full breakdown of Funding Pips evaluation tiers, 8% Phase 1 profit target, zero minimum trading day options, and fast Tuesday payout cycles.',
    takeaways: [
      'Low 8% Phase 1 + 5% Phase 2 evaluation targets',
      'Weekly / 5-day payout cycles for funded traders',
      'Zero commission & raw spread execution rules',
    ],
  },
  {
    id: 'vid-8',
    youtubeId: 'rgwkIAQz3a4',
    title: 'How I Passed $100K FundedNext & FundingPips Accounts (Full Guide)',
    channel: 'Abdullah Khan',
    durationLabel: '14:22',
    durationSeconds: 862,
    category: 'firms',
    categoryBadge: '$100K Case Study',
    description:
      'Real trade-by-trade breakdown and risk plan used to pass $100,000 evaluations on both FundedNext and Funding Pips without coming close to daily drawdown.',
    takeaways: [
      'Position sizing for $100K prop firm evaluations',
      'Risking 0.5% to 1% per setup with 1:2.5+ R:R',
      'Managing losing streaks during Phase 1 & Phase 2',
    ],
  },
  {
    id: 'vid-9',
    youtubeId: 'NZfUe30eUMs',
    title: 'The ONLY Risk Management Video for Prop Firms You Need',
    channel: 'Kimmel Trading',
    durationLabel: '12:50',
    durationSeconds: 770,
    category: 'strategy',
    categoryBadge: 'Risk Management',
    description:
      'Learn how to calculate true risk based on your drawdown buffer (not total account size) so you never accidentally breach a daily or max loss limit.',
    takeaways: [
      'Why 1% of a $100K account is actually 10% of your drawdown',
      'Dynamic risk reduction after 2 consecutive losses',
      'Setting hard daily stop-loss caps on your terminal',
    ],
  },
  {
    id: 'vid-10',
    youtubeId: 'WU6RabvFVcA',
    title: 'Prop Rules Explained: Trailing Drawdown vs Static Drawdown',
    channel: 'Plutus Trade Base',
    durationLabel: '08:15',
    durationSeconds: 495,
    category: 'strategy',
    categoryBadge: 'Drawdown Rules',
    description:
      'Visual comparison of Static Drawdown, EOD (End-of-Day) Trailing Drawdown, and Intraday High-Water-Mark Trailing Drawdown across CFD and Futures firms.',
    takeaways: [
      'Static drawdown vs Trailing high-water-mark drawdown',
      'Why unrealized floating profit moves intraday trailing stops',
      'How to lock in your drawdown floor at starting balance',
    ],
  },
  {
    id: 'vid-11',
    youtubeId: 'IsXaoLnHFTE',
    title: 'Topstep & Futures Prop Firm Rules Explained in 8 Minutes',
    channel: 'Daniel Proestos',
    durationLabel: '08:09',
    durationSeconds: 489,
    category: 'futures',
    categoryBadge: 'Futures Prop Firms',
    description:
      'Everything you need to know about Futures prop firms (Topstep, Apex Trader Funding, MyFundedFutures), CME contract scaling, and End-of-Day loss limits.',
    takeaways: [
      'Trading NQ, ES, GC & CL futures on prop firm capital',
      'Understanding the 50% consistency rule on evaluations',
      'Fast 5-winning-day express payout eligibility',
    ],
  },
  {
    id: 'vid-12',
    youtubeId: 'Q7Ryv1M7CvI',
    title: 'Learn ICT & Smart Money Concepts in 9 Minutes (Prop Firm Strategy)',
    channel: 'Casper Trading',
    durationLabel: '09:19',
    durationSeconds: 559,
    category: 'strategy',
    categoryBadge: 'SMC / ICT Strategy',
    description:
      'High-probability liquidity sweep, Fair Value Gap (FVG), and New York / London session killzone entries tailored for tight stop-losses on prop firm accounts.',
    takeaways: [
      'Identifying session liquidity sweeps (BSL / SSL)',
      'Entering on Market Structure Shift (MSS) + Fair Value Gap',
      'Tight stop-loss placement for high reward-to-risk setups',
    ],
  },
];

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

function formatSeconds(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '0:00';
  const total = Math.floor(sec);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function YouTubeVideoHub() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'howto' | 'firms' | 'strategy' | 'futures'>('all');
  const [activeVideo, setActiveVideo] = useState<PropFirmVideo>(PROP_FIRM_VIDEOS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(85);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(PROP_FIRM_VIDEOS[0].durationSeconds);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [playerReady, setPlayerReady] = useState<boolean>(false);

  const playerStageRef = useRef<HTMLDivElement>(null);
  const ytMountRef = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<any>(null);
  const activeVideoRef = useRef<PropFirmVideo>(activeVideo);
  activeVideoRef.current = activeVideo;

  const filteredVideos =
    activeCategory === 'all'
      ? PROP_FIRM_VIDEOS
      : PROP_FIRM_VIDEOS.filter((v) => v.category === activeCategory);

  // Load YouTube IFrame API & instantiate player with autoplay
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let isMounted = true;

    const createPlayer = () => {
      if (!isMounted || !ytMountRef.current || !window.YT?.Player) return;
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch {
          // ignore
        }
      }

      ytPlayerRef.current = new window.YT.Player(ytMountRef.current, {
        videoId: activeVideoRef.current.youtubeId,
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          fs: 1,
          enablejsapi: 1,
        },
        events: {
          onReady: (event: any) => {
            if (!isMounted) return;
            setPlayerReady(true);
            try {
              event.target.mute();
              event.target.playVideo();
              const d = event.target.getDuration();
              if (d && d > 0) setDuration(d);
            } catch {
              // ignore
            }
          },
          onStateChange: (event: any) => {
            if (!isMounted || !window.YT) return;
            const state = event.data;
            if (state === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              const d = event.target.getDuration?.();
              if (d && d > 0) setDuration(d);
            } else if (state === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            } else if (state === window.YT.PlayerState.ENDED) {
              // Auto-advance to next video in playlist!
              const idx = PROP_FIRM_VIDEOS.findIndex((v) => v.id === activeVideoRef.current.id);
              const nextVid = PROP_FIRM_VIDEOS[(idx + 1) % PROP_FIRM_VIDEOS.length];
              setActiveVideo(nextVid);
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      const existingScript = document.querySelector(
        'script[src="https://www.youtube.com/iframe_api"]'
      );
      if (!existingScript) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        tag.async = true;
        document.head.appendChild(tag);
      }
      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        createPlayer();
      };
    }

    return () => {
      isMounted = false;
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch {
          // ignore
        }
        ytPlayerRef.current = null;
      }
    };
  }, []);

  // Poll current time & duration while playing
  useEffect(() => {
    const interval = setInterval(() => {
      const p = ytPlayerRef.current;
      if (!p || typeof p.getCurrentTime !== 'function') return;
      try {
        const t = p.getCurrentTime();
        const d = p.getDuration();
        const muted = p.isMuted?.();
        if (typeof t === 'number' && !Number.isNaN(t)) setCurrentTime(t);
        if (typeof d === 'number' && d > 0) setDuration(d);
        if (typeof muted === 'boolean') setIsMuted(muted);
      } catch {
        // ignore
      }
    }, 250);
    return () => clearInterval(interval);
  }, []);

  // Switch video when activeVideo changes
  const selectVideo = useCallback(
    (video: PropFirmVideo, unmuteOnSelect = false) => {
      setActiveVideo(video);
      setCurrentTime(0);
      setDuration(video.durationSeconds);
      setIsPlaying(true);

      const p = ytPlayerRef.current;
      if (p && typeof p.loadVideoById === 'function') {
        try {
          p.loadVideoById({ videoId: video.youtubeId, startSeconds: 0 });
          if (unmuteOnSelect) {
            p.unMute();
            p.setVolume(volume);
            setIsMuted(false);
          }
          p.playVideo();
        } catch {
          // ignore
        }
      }
    },
    [volume]
  );

  // Listen to fullscreen changes
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const togglePlayPause = () => {
    const p = ytPlayerRef.current;
    if (!p) return;
    try {
      if (isPlaying) {
        p.pauseVideo();
        setIsPlaying(false);
      } else {
        p.playVideo();
        setIsPlaying(true);
      }
    } catch {
      // ignore
    }
  };

  const toggleMute = () => {
    const p = ytPlayerRef.current;
    if (!p) return;
    try {
      if (isMuted) {
        p.unMute();
        p.setVolume(volume || 85);
        setIsMuted(false);
      } else {
        p.mute();
        setIsMuted(true);
      }
    } catch {
      // ignore
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    const p = ytPlayerRef.current;
    if (!p) return;
    try {
      p.setVolume(val);
      if (val === 0) {
        p.mute();
        setIsMuted(true);
      } else if (isMuted) {
        p.unMute();
        setIsMuted(false);
      }
    } catch {
      // ignore
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetSec = Number(e.target.value);
    setCurrentTime(targetSec);
    const p = ytPlayerRef.current;
    if (!p || typeof p.seekTo !== 'function') return;
    try {
      p.seekTo(targetSec, true);
    } catch {
      // ignore
    }
  };

  const skipSeconds = (delta: number) => {
    const p = ytPlayerRef.current;
    if (!p || typeof p.seekTo !== 'function') return;
    try {
      const nextTime = Math.max(0, Math.min(duration, currentTime + delta));
      setCurrentTime(nextTime);
      p.seekTo(nextTime, true);
    } catch {
      // ignore
    }
  };

  const cycleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const next = speeds[(speeds.indexOf(playbackRate) + 1) % speeds.length];
    setPlaybackRate(next);
    const p = ytPlayerRef.current;
    if (p && typeof p.setPlaybackRate === 'function') {
      try {
        p.setPlaybackRate(next);
      } catch {
        // ignore
      }
    }
  };

  const toggleFullscreen = async () => {
    const el = playerStageRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // ignore
    }
  };

  const playPrevVideo = () => {
    const idx = PROP_FIRM_VIDEOS.findIndex((v) => v.id === activeVideo.id);
    const prev = PROP_FIRM_VIDEOS[(idx - 1 + PROP_FIRM_VIDEOS.length) % PROP_FIRM_VIDEOS.length];
    selectVideo(prev, !isMuted);
  };

  const playNextVideo = () => {
    const idx = PROP_FIRM_VIDEOS.findIndex((v) => v.id === activeVideo.id);
    const next = PROP_FIRM_VIDEOS[(idx + 1) % PROP_FIRM_VIDEOS.length];
    selectVideo(next, !isMuted);
  };

  const progressPct = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  return (
    <section
      id="video-academy"
      className="w-full py-20 lg:py-24 bg-[#f8fafc] dark:bg-[#05080B] border-b border-slate-200 dark:border-white/[0.08] relative overflow-hidden transition-colors duration-300"
    >
      <TradingVisualBackground variant="section" />

      {/* Subtle ambient glow */}
      <div
        className="absolute top-20 left-1/2 -translate-x-1/2 w-[760px] h-[420px] rounded-full opacity-[0.08] dark:opacity-[0.12] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, #10b981 0%, #06b6d4 45%, transparent 72%)',
          filter: 'blur(100px)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <Reveal>
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 dark:bg-red-500/15 border border-red-500/25 text-red-600 dark:text-red-400 font-mono text-xs font-bold uppercase tracking-wider">
                <Youtube className="h-4 w-4" />
                PROP NATION VIDEO ACADEMY · 12 CURATED GUIDES
              </span>
            </Reveal>
            <Reveal delay={60}>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                LEARN PROP FIRMS, TRADING &amp; HOW TO USE PROP NATION.
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed">
                Watch auto-playing step-by-step tutorials on how prop firms work, how to purchase challenges with our partner codes, drawdown rules, and proven risk management strategies.
              </p>
            </Reveal>
          </div>

          {/* Category Filter Pills */}
          <Reveal delay={150}>
            <div className="flex flex-nowrap sm:flex-wrap items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
              {[
                { key: 'all', label: `All Videos (${PROP_FIRM_VIDEOS.length})` },
                { key: 'howto', label: 'How to Use & Basics' },
                { key: 'firms', label: 'FTMO / FundedNext / Pips' },
                { key: 'strategy', label: 'Risk & Trading Strategy' },
                { key: 'futures', label: 'Futures Prop Firms' },
              ].map((tab) => {
                const active = activeCategory === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveCategory(tab.key as any)}
                    className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                      active
                        ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/30'
                        : 'bg-white dark:bg-[#0B1015] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.1] hover:border-emerald-500/40'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </Reveal>
        </div>

        {/* Main Cinema Player + Playlist Sidebar (Exact Equal Height on Desktop) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left 8 Columns: Auto-Playing Cinema Stage + Full Custom Controls */}
          <div className="lg:col-span-8 flex flex-col">
            <div
              ref={playerStageRef}
              className="h-full rounded-3xl bg-white dark:bg-[#0B1015] border border-slate-200/90 dark:border-white/[0.12] shadow-xl dark:shadow-[0_28px_70px_-15px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col justify-between"
            >
              {/* Top Cinema Bar */}
              <div className="px-4 sm:px-6 py-3 bg-slate-100/90 dark:bg-[#080D13] border-b border-slate-200 dark:border-white/[0.08] flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-mono text-[11px] font-bold shrink-0">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    {isPlaying ? 'NOW PLAYING' : 'PAUSED'}
                  </span>
                  <span className="text-xs font-mono text-slate-600 dark:text-slate-300 truncate">
                    {activeVideo.categoryBadge} · {activeVideo.channel}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isMuted && (
                    <button
                      type="button"
                      onClick={toggleMute}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-extrabold shadow-xs transition-all cursor-pointer"
                    >
                      <VolumeX className="h-3.5 w-3.5" />
                      Tap to Unmute Audio
                    </button>
                  )}
                  <a
                    href={`https://www.youtube.com/watch?v=${activeVideo.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.1] text-xs font-mono font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    <span>YouTube</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              {/* 16:9 YouTube Player Frame */}
              <div className="relative w-full aspect-video bg-black overflow-hidden">
                <div ref={ytMountRef} className="w-full h-full" />

                {/* Fallback iframe if YT API hasn't initialized yet */}
                {!playerReady && (
                  <iframe
                    src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1&mute=1&controls=1&rel=0&modestbranding=1&playsinline=1&fs=1`}
                    title={activeVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full border-0"
                  />
                )}
              </div>

              {/* Custom Synchronized Media Control Bar (Play, Pause, Seek Time, Volume, Speed, Fullscreen) */}
              <div className="p-3.5 sm:p-4 sm:px-6 bg-slate-900 dark:bg-[#060A0F] text-white border-t border-white/[0.08] space-y-3">
                {/* Timeline Scrubber + Live Current Time / Total Duration */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-emerald-400 w-11 text-right shrink-0">
                    {formatSeconds(currentTime)}
                  </span>

                  <div className="relative flex-1 flex items-center">
                    <div className="w-full h-2 rounded-full bg-slate-700/80 overflow-hidden pointer-events-none">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-[width] duration-150"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={Math.max(duration, 1)}
                      step={1}
                      value={Math.min(currentTime, duration)}
                      onChange={handleSeek}
                      aria-label="Seek video timeline"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>

                  <span className="text-xs font-mono text-slate-300 w-11 shrink-0">
                    {formatSeconds(duration)}
                  </span>
                </div>

                {/* Transport Buttons Row */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {/* Play / Pause */}
                    <button
                      type="button"
                      onClick={togglePlayPause}
                      className="h-9 px-3 sm:px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                      title={isPlaying ? 'Pause Video' : 'Play Video'}
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="h-4 w-4 fill-current" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 fill-current" />
                          <span>Play</span>
                        </>
                      )}
                    </button>

                    {/* Prev / Next Video */}
                    <button
                      type="button"
                      onClick={playPrevVideo}
                      className="h-9 w-9 rounded-xl bg-white/[0.07] hover:bg-white/[0.14] border border-white/[0.08] flex items-center justify-center text-slate-200 transition-colors cursor-pointer"
                      title="Previous Video"
                    >
                      <SkipBack className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={playNextVideo}
                      className="h-9 w-9 rounded-xl bg-white/[0.07] hover:bg-white/[0.14] border border-white/[0.08] flex items-center justify-center text-slate-200 transition-colors cursor-pointer"
                      title="Next Video"
                    >
                      <SkipForward className="h-4 w-4" />
                    </button>

                    {/* -10s / +10s Seek */}
                    <button
                      type="button"
                      onClick={() => skipSeconds(-10)}
                      className="h-9 px-2 sm:px-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] inline-flex items-center gap-1 text-xs font-mono text-slate-200 transition-colors cursor-pointer"
                      title="Rewind 10 seconds"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>-10s</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => skipSeconds(10)}
                      className="h-9 px-2 sm:px-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] inline-flex items-center gap-1 text-xs font-mono text-slate-200 transition-colors cursor-pointer"
                      title="Forward 10 seconds"
                    >
                      <RotateCw className="h-3.5 w-3.5" />
                      <span>+10s</span>
                    </button>
                  </div>

                  {/* Right Side: Volume + Speed + Fullscreen */}
                  <div className="flex items-center gap-2">
                    {/* Mute/Unmute + Slider */}
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/[0.06] border border-white/[0.08]">
                      <button
                        type="button"
                        onClick={toggleMute}
                        className="text-slate-200 hover:text-emerald-400 transition-colors cursor-pointer"
                        title={isMuted ? 'Unmute' : 'Mute'}
                      >
                        {isMuted ? (
                          <VolumeX className="h-4 w-4 text-amber-400" />
                        ) : (
                          <Volume2 className="h-4 w-4 text-emerald-400" />
                        )}
                      </button>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        aria-label="Volume"
                        className="w-16 sm:w-20 accent-emerald-400 cursor-pointer h-1.5"
                      />
                    </div>

                    {/* Speed Selector */}
                    <button
                      type="button"
                      onClick={cycleSpeed}
                      className="h-9 px-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-xs font-mono font-bold text-emerald-300 transition-colors cursor-pointer"
                      title="Playback Speed"
                    >
                      {playbackRate}x
                    </button>

                    {/* Fullscreen Toggle */}
                    <button
                      type="button"
                      onClick={toggleFullscreen}
                      className="h-9 px-3 rounded-xl bg-white/[0.08] hover:bg-emerald-500 hover:text-slate-950 border border-white/[0.1] inline-flex items-center gap-1.5 text-xs font-mono font-bold text-white transition-all cursor-pointer"
                      title="Toggle Fullscreen"
                    >
                      {isFullscreen ? (
                        <>
                          <Minimize2 className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Exit Fullscreen</span>
                        </>
                      ) : (
                        <>
                          <Maximize2 className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Full Screen</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Video Details & Key Takeaways */}
              <div className="p-4 sm:p-6 bg-white dark:bg-[#0B1015] space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        <span>{activeVideo.categoryBadge}</span>
                        <span>•</span>
                        <span>{activeVideo.channel}</span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {activeVideo.durationLabel}
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        {activeVideo.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                    {activeVideo.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                  {activeVideo.takeaways.map((point) => (
                    <div
                      key={point}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-[#101720] border border-slate-200/80 dark:border-white/[0.07] flex items-start gap-2 text-xs text-slate-700 dark:text-slate-200 font-medium"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right 4 Columns: Interactive Up-Next Queue (Matches Exact Height of Left Column on Desktop) */}
          <div className="lg:col-span-4 relative min-h-[420px] sm:min-h-[540px] lg:min-h-0">
            <div className="h-[420px] sm:h-[540px] lg:h-auto lg:absolute lg:inset-0 rounded-3xl bg-white dark:bg-[#0B1015] border border-slate-200 dark:border-white/[0.12] shadow-xl dark:shadow-[0_28px_70px_-15px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col">
              <div className="p-4 sm:px-5 bg-slate-100/80 dark:bg-[#080D13] border-b border-slate-200 dark:border-white/[0.08] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Film className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                    VIDEO PLAYLIST ({filteredVideos.length} VIDEOS)
                  </span>
                </div>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  Click to Play
                </span>
              </div>

              <div className="divide-y divide-slate-200/70 dark:divide-white/[0.06] flex-1 min-h-0 overflow-y-auto">
                {filteredVideos.map((vid, idx) => {
                  const isSelected = vid.id === activeVideo.id;
                  return (
                    <button
                      key={vid.id}
                      type="button"
                      onClick={() => selectVideo(vid, true)}
                      className={`w-full p-3.5 text-left flex items-start gap-3.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500/10 dark:bg-emerald-500/15 border-l-4 border-l-emerald-500'
                          : 'hover:bg-slate-50 dark:hover:bg-white/[0.04]'
                      }`}
                    >
                      {/* Thumbnail */}
                      <div className="relative w-28 aspect-video rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-200/60 dark:border-white/[0.1]">
                        <img
                          src={`https://i.ytimg.com/vi/${vid.youtubeId}/mqdefault.jpg`}
                          alt={vid.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <div
                            className={`h-7 w-7 rounded-full flex items-center justify-center ${
                              isSelected
                                ? 'bg-emerald-500 text-slate-950'
                                : 'bg-black/70 text-white'
                            }`}
                          >
                            {isSelected && isPlaying ? (
                              <Pause className="h-3.5 w-3.5 fill-current" />
                            ) : (
                              <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                            )}
                          </div>
                        </div>
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 font-mono text-[10px] font-bold text-white">
                          {vid.durationLabel}
                        </span>
                      </div>

                      {/* Meta */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                            #{idx + 1} · {vid.categoryBadge}
                          </span>
                        </div>
                        <h4
                          className={`text-xs sm:text-sm font-bold line-clamp-2 leading-snug ${
                            isSelected
                              ? 'text-emerald-700 dark:text-emerald-300'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {vid.title}
                        </h4>
                        <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                          {vid.channel}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* All 12 Videos Quick-Select Grid Below Player */}
        <div className="pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-mono font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-500" />
              ALL {PROP_FIRM_VIDEOS.length} PROP FIRM &amp; TRADING TUTORIALS — INSTANT SELECT
            </h3>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              Click any card to play in main theater
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {PROP_FIRM_VIDEOS.map((vid, idx) => {
              const isSelected = vid.id === activeVideo.id;
              return (
                <button
                  key={vid.id}
                  type="button"
                  onClick={() => {
                    selectVideo(vid, true);
                    playerStageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  className={`group text-left rounded-2xl overflow-hidden border transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500/10 dark:bg-[#0D1A18] border-emerald-500 shadow-md'
                      : 'bg-white dark:bg-[#0B1015] border-slate-200 dark:border-white/[0.09] hover:border-emerald-500/50 hover:-translate-y-0.5 shadow-xs'
                  }`}
                >
                  <div>
                    <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                      <img
                        src={`https://i.ytimg.com/vi/${vid.youtubeId}/hqdefault.jpg`}
                        alt={vid.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex items-center justify-center">
                        <div
                          className={`h-11 w-11 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${
                            isSelected
                              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/40'
                              : 'bg-black/75 text-white border border-white/20'
                          }`}
                        >
                          {isSelected && isPlaying ? (
                            <Pause className="h-5 w-5 fill-current" />
                          ) : (
                            <Play className="h-5 w-5 fill-current ml-0.5" />
                          )}
                        </div>
                      </div>
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-xs font-mono text-[10px] font-bold text-emerald-400">
                        {vid.categoryBadge}
                      </span>
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 font-mono text-[11px] font-bold text-white">
                        {vid.durationLabel}
                      </span>
                    </div>

                    <div className="p-3.5 space-y-1.5">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {idx + 1}. {vid.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {vid.description}
                      </p>
                    </div>
                  </div>

                  <div className="px-3.5 pb-3 pt-1 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-white/[0.05]">
                    <span className="truncate">{vid.channel}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                      {isSelected ? '● Playing' : 'Watch →'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
