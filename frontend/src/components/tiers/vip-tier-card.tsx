'use client';

import React, { useState } from 'react';
import { Trophy, Zap, ShieldCheck, Crown, Sparkles, ChevronRight, CheckCircle2, Info } from 'lucide-react';

export interface VipTierInfo {
  tier: 'ROOKIE' | 'FUNDED' | 'MASTER';
  tierName: string;
  multiplier: number;
  nextTier: 'FUNDED' | 'MASTER' | null;
  nextTierName: string | null;
  pointsToNextTier: number;
  tierProgress: number;
  perks: string[];
}

interface VipTierCardProps {
  vip?: VipTierInfo;
  totalPointsEarned?: number;
}

export function VipTierCard({ vip, totalPointsEarned = 0 }: VipTierCardProps) {
  const [showPerksModal, setShowPerksModal] = useState(false);

  const tier = vip?.tier || (totalPointsEarned >= 20000 ? 'MASTER' : totalPointsEarned >= 5000 ? 'FUNDED' : 'ROOKIE');
  const multiplier = vip?.multiplier || (tier === 'MASTER' ? 1.5 : tier === 'FUNDED' ? 1.25 : 1.0);
  const tierName = vip?.tierName || (tier === 'MASTER' ? 'Prop Master' : tier === 'FUNDED' ? 'Funded Trader' : 'Rookie Trader');
  const pointsToNext = vip?.pointsToNextTier ?? Math.max(0, (tier === 'ROOKIE' ? 5000 : 20000) - totalPointsEarned);
  const progress = vip?.tierProgress ?? Math.min(100, Math.round((totalPointsEarned / (tier === 'ROOKIE' ? 5000 : 20000)) * 100));

  const isMaster = tier === 'MASTER';
  const isFunded = tier === 'FUNDED';

  return (
    <div
      className={`rounded-2xl border p-5 relative overflow-hidden backdrop-blur-xl transition-all shadow-xl ${
        isMaster
          ? 'bg-gradient-to-br from-[#120f06] via-[#0d0b04] to-[#080702] border-amber-500/40 shadow-amber-500/10'
          : isFunded
          ? 'bg-gradient-to-br from-[#07130f] via-[#050e0b] to-[#030806] border-emerald-500/40 shadow-emerald-500/10'
          : 'bg-[#090e13]/90 border-slate-800'
      }`}
    >
      {/* Glow highlight */}
      <div
        className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl pointer-events-none ${
          isMaster ? 'bg-amber-500/20' : isFunded ? 'bg-emerald-500/20' : 'bg-slate-700/10'
        }`}
      />

      <div className="flex items-center justify-between gap-4 mb-4">
        {/* Tier Name & Badge */}
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-lg ${
              isMaster
                ? 'bg-gradient-to-br from-amber-400 to-amber-600 border-amber-300 text-slate-950'
                : isFunded
                ? 'bg-gradient-to-br from-emerald-400 to-teal-500 border-emerald-300 text-slate-950'
                : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            {isMaster ? <Crown className="w-6 h-6" /> : isFunded ? <Trophy className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Trader VIP Tier</span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  isMaster
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                    : isFunded
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {multiplier}x Points Multiplier
              </span>
            </div>
            <h4 className="text-xl font-extrabold text-white mt-0.5">{tierName}</h4>
          </div>
        </div>

        {/* Perks Button */}
        <button
          onClick={() => setShowPerksModal(true)}
          className="text-xs font-semibold text-slate-400 hover:text-white transition-colors flex items-center gap-1 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800"
        >
          <Info className="w-3.5 h-3.5" />
          View Perks
        </button>
      </div>

      {/* Progress to next tier */}
      {!isMaster ? (
        <div className="mt-3 pt-3 border-t border-slate-800/60">
          <div className="flex items-center justify-between text-xs font-mono mb-1.5">
            <span className="text-slate-400">
              Next Tier: <span className="text-white font-semibold">{isFunded ? 'Prop Master (1.5x)' : 'Funded Trader (1.25x)'}</span>
            </span>
            <span className="text-emerald-400 font-bold">{progress}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden relative">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isFunded
                  ? 'bg-gradient-to-r from-emerald-500 to-amber-400'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-400'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-400 mt-2 font-mono">
            Earn <span className="text-emerald-300 font-bold">+{pointsToNext.toLocaleString('en-US')} more points</span> to upgrade and unlock a{' '}
            <span className="text-emerald-400 font-bold">{isFunded ? '1.50x' : '1.25x'}</span> reward multiplier!
          </p>
        </div>
      ) : (
        <div className="mt-3 pt-3 border-t border-amber-500/20 text-xs text-amber-200/90 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>You have reached the highest tier! Enjoy maximum 1.50x points boost and direct VIP access.</span>
        </div>
      )}

      {/* Perks Modal */}
      {showPerksModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0b1015] border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                PropNation VIP Trader Tiers
              </h3>
              <button
                onClick={() => setShowPerksModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 my-4">
              {/* Tier 1 */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white text-sm">🥉 Rookie Trader</span>
                  <span className="text-xs font-mono text-slate-400">0 – 4,999 PTS • 1.0x</span>
                </div>
                <p className="text-xs text-slate-400">Standard 1x reward points on all prop firm challenges.</p>
              </div>

              {/* Tier 2 */}
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-emerald-400 text-sm">🥈 Funded Trader</span>
                  <span className="text-xs font-mono text-emerald-300 font-bold">5,000+ PTS • 1.25x</span>
                </div>
                <p className="text-xs text-slate-300">
                  +25% bonus points on every challenge, priority verification queue (&lt;4 hrs), and verified role in Discord.
                </p>
              </div>

              {/* Tier 3 */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-amber-400 text-sm">👑 Prop Master</span>
                  <span className="text-xs font-mono text-amber-300 font-bold">20,000+ PTS • 1.50x</span>
                </div>
                <p className="text-xs text-slate-300">
                  Maximum 1.50x boost (+50% bonus points), VIP Private Lounge, free PropNation metal card & swag box, and 1-on-1 direct support.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowPerksModal(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
