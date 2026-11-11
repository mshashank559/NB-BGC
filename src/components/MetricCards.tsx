'use client';

import React from 'react';
import { DollarSign, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

interface MetricCardsProps {
  totalPayable: number;
  totalCollected: number;
  pendingBalance: number;
  overdueCount: number;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  totalPayable,
  totalCollected,
  pendingBalance,
  overdueCount,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Payable */}
      <div className="relative group bg-[#111927]/60 hover:bg-[#131d2e]/80 transition-all duration-300 rounded-3xl p-5 border border-white/5 shadow-spatial-card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
            Total Payable
          </span>
          <div className="h-8 w-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
            <DollarSign className="h-4 w-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-white tracking-tight">
          ${totalPayable.toLocaleString()}
        </div>
        <p className="text-[11px] text-slate-500 mt-1">Across all approved placements</p>
      </div>

      {/* Total Collected */}
      <div className="relative group bg-[#111927]/60 hover:bg-[#131d2e]/80 transition-all duration-300 rounded-3xl p-5 border border-white/5 shadow-spatial-card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
            Total Collected
          </span>
          <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-emerald-400 tracking-tight">
          ${totalCollected.toLocaleString()}
        </div>
        <p className="text-[11px] text-slate-500 mt-1">Paid installments reconciled</p>
      </div>

      {/* Pending Balance */}
      <div className="relative group bg-[#111927]/60 hover:bg-[#131d2e]/80 transition-all duration-300 rounded-3xl p-5 border border-white/5 shadow-spatial-card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
            Pending Balance
          </span>
          <div className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
            <Clock className="h-4 w-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-amber-400 tracking-tight">
          ${pendingBalance.toLocaleString()}
        </div>
        <p className="text-[11px] text-slate-500 mt-1">Due in upcoming cycles</p>
      </div>

      {/* Overdue Alerts */}
      <div className="relative group bg-[#111927]/60 hover:bg-[#131d2e]/80 transition-all duration-300 rounded-3xl p-5 border border-rose-500/20 shadow-spatial-card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-rose-300 tracking-wider uppercase">
            Overdue Alerts
          </span>
          <div className="h-8 w-8 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 animate-pulse">
            <AlertTriangle className="h-4 w-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-rose-400 tracking-tight">
          {overdueCount} {overdueCount === 1 ? 'Slot' : 'Slots'}
        </div>
        <p className="text-[11px] text-rose-400/80 mt-1">Requires Account follow-up</p>
      </div>
    </div>
  );
};

