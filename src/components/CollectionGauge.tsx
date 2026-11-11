'use client';

import React from 'react';
import { Activity } from 'lucide-react';

interface CollectionGaugeProps {
  collected: number;
  total: number;
}

export const CollectionGauge: React.FC<CollectionGaugeProps> = ({ collected, total }) => {
  const percentage = total > 0 ? Math.min(100, Math.round((collected / total) * 100)) : 0;

  // Arc calculation for semi-circle
  // Radius = 80, Circumference of full circle = 2 * PI * 80 ≈ 502.65
  // Semi-circle length = 251.3
  const strokeDashoffset = 251.3 - (251.3 * percentage) / 100;

  return (
    <div className="bg-[#111927]/60 rounded-3xl p-6 border border-white/5 shadow-spatial-card flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
            Placement Pipeline
          </span>
          <h3 className="text-base font-bold text-white">Collection Gauge</h3>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px] font-semibold">
          <Activity className="h-3 w-3 animate-pulse" />
          <span>Live Sync</span>
        </div>
      </div>

      {/* SVG Semi-Circle Dial */}
      <div className="relative flex flex-col items-center justify-center my-2">
        <svg className="w-56 h-32 overflow-visible" viewBox="0 0 200 110">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00F2FE" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>
            <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Track */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Active Glowing Progress Arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray="251.3"
            strokeDashoffset={strokeDashoffset}
            filter="url(#gaugeGlow)"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Readout */}
        <div className="absolute bottom-2 flex flex-col items-center">
          <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
            Overall Collected
          </span>
          <span className="text-3xl font-extrabold text-white tracking-tight">
            {percentage}%
          </span>
        </div>
      </div>

      {/* Footer Metrics */}
      <div className="text-center pt-3 border-t border-white/5">
        <p className="text-xs font-medium text-slate-400">
          <span className="text-cyan-400 font-bold">${collected.toLocaleString()}</span>
          {' / '}
          <span>${total.toLocaleString()}</span>
        </p>
      </div>
    </div>
  );
};

