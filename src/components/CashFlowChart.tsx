'use client';

import React, { useState } from 'react';

export const CashFlowChart: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'week' | 'month' | 'year'>('month');

  const monthlyBars = [
    { label: 'Jul', value: 35, amount: '$8.5k' },
    { label: 'Aug', value: 45, amount: '$12.0k' },
    { label: 'Sep', value: 65, amount: '$16.2k' },
    { label: 'Oct', value: 95, amount: '$24.6k', isPeak: true },
    { label: 'Nov', value: 80, amount: '$21.0k' },
    { label: 'Dec', value: 55, amount: '$14.4k' },
    { label: 'Jan', value: 40, amount: '$10.2k' },
  ];

  return (
    <div className="bg-[#111927]/60 rounded-3xl p-6 border border-white/5 shadow-spatial-card flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
            Monthly Performance
          </span>
          <h3 className="text-base font-bold text-white">Cash Flow Trajectory</h3>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-white/5">
          {(['week', 'month', 'year'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg capitalize transition-all ${
                activeFilter === filter
                  ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Bar Chart Visualizer */}
      <div className="flex items-end justify-between gap-3 h-36 pt-6 px-2">
        {monthlyBars.map((bar) => (
          <div key={bar.label} className="flex-1 flex flex-col items-center gap-2 group">
            {/* Value popover on hover */}
            <span
              className={`text-[10px] font-bold transition-all ${
                bar.isPeak
                  ? 'text-cyan-300 opacity-100 font-extrabold'
                  : 'text-slate-500 opacity-0 group-hover:opacity-100'
              }`}
            >
              {bar.amount}
            </span>

            {/* Vertical Bar */}
            <div className="w-full max-w-[28px] h-24 bg-slate-800/40 rounded-full flex items-end p-1 overflow-hidden">
              <div
                style={{ height: `${bar.value}%` }}
                className={`w-full rounded-full transition-all duration-700 ${
                  bar.isPeak
                    ? 'bg-gradient-to-t from-cyan-500 to-blue-400 shadow-[0_0_15px_rgba(0,242,254,0.4)]'
                    : 'bg-slate-700/60 group-hover:bg-slate-600'
                }`}
              />
            </div>

            {/* Label */}
            <span className={`text-[11px] font-medium ${bar.isPeak ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}>
              {bar.label}
            </span>
          </div>
        ))}
      </div>

      <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
        <span>Target Variance: <strong className="text-emerald-400">+14.2%</strong></span>
        <span>Peak Inflow: <strong className="text-cyan-400">October</strong></span>
      </div>
    </div>
  );
};

