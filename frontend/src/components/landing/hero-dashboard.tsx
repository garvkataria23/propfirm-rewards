'use client';

import React from 'react';
import { useMouseParallax } from './motion-primitives';
import { DashboardPreview } from './dashboard-preview';

/**
 * #7–#9, #26–#29 · HERO DASHBOARD (Real Product UI in Compact Browser Frame)
 * Reuses the actual Prop Nation DashboardPreview component in 'hero' mode:
 * - AVAILABLE POINTS: 10,000 -> 12,500
 * - REWARD PROGRESS: iPhone 60% -> 75%
 * - RECENT ACTIVITY: Purchase Verified +2,500 / Bonus +1,000 / Reward Redeemed -5,000
 * - Surrounded by soft emerald & cyan atmospheric halo + subtle desktop mouse parallax (±2.5px)
 */
export function HeroDashboard() {
  const parallax = useMouseParallax();

  return (
    <div
      className="relative w-full max-w-[880px] mx-auto transition-transform duration-200 ease-out"
      style={{
        transform: `translate3d(${parallax.x * -2.5}px, ${parallax.y * -2.5}px, 0)`,
      }}
    >
      {/* #26, #28: Soft Emerald Halo Behind Real Dashboard */}
      <div
        className="absolute -inset-6 rounded-[32px] opacity-35 pointer-events-none blur-3xl"
        style={{
          background:
            'radial-gradient(circle at 45% 35%, rgba(16, 185, 129, 0.35), rgba(6, 182, 212, 0.14) 55%, transparent 78%)',
        }}
        aria-hidden="true"
      />

      {/* #26: Soft Cyan/Blue Edge Lighting */}
      <div
        className="absolute -bottom-4 -right-4 w-64 h-48 rounded-full opacity-25 pointer-events-none blur-2xl"
        style={{
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.38), transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* Actual Prop Nation Dashboard Component (Hero Crop) */}
      <DashboardPreview mode="hero" active />
    </div>
  );
}
