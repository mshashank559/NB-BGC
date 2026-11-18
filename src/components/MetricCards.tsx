'use client';

import React from 'react';
import { DollarSign, CheckCircle2, Clock, AlertTriangle, FileText, UserCheck, ShieldCheck } from 'lucide-react';
import { CandidateRecord, UserRole } from '../types';
import { CountUp } from './CountUp';

interface MetricCardsProps {
  totalPayable: number;
  totalCollected: number;
  pendingBalance: number;
  overdueCount: number;
  userRole?: UserRole;
  scopedCandidates?: CandidateRecord[];
  countUpTrigger?: number;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  totalPayable,
  totalCollected,
  pendingBalance,
  overdueCount,
  userRole = 'ADMIN',
  scopedCandidates = [],
  countUpTrigger = 0,
}) => {
  // If Compliance Manager, display onboarding and documentation metrics
  if (userRole === 'COMPLIANCE_MANAGER') {
    const totalMyPlacements = scopedCandidates.length;
    const pendingDrafts = scopedCandidates.filter((c) => c.status === 'DRAFT').length;
    const handedOff = scopedCandidates.filter((c) => c.status === 'SUBMITTED' || c.status === 'CLOSED').length;
    const bgcCleared = scopedCandidates.filter((c) => c.bgcOfferStatus === 'CLEARED').length;
    const bgcRate = totalMyPlacements > 0 ? Math.round((bgcCleared / totalMyPlacements) * 100) : 0;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Card 1: My Placements */}
        <div className="glass-card rounded-[26px] p-5 ambient-blue">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              My Placements
            </span>
            <div className="h-8 w-8 rounded-full bg-blue-50/80 backdrop-blur-md border border-blue-200/70 flex items-center justify-center text-blue-600 shadow-xs">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="text-[28px] font-extrabold text-slate-900 font-tabular leading-tight">
            <CountUp end={totalMyPlacements} triggerKey={countUpTrigger} /> {totalMyPlacements === 1 ? 'Candidate' : 'Candidates'}
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Total assigned to my onboarding desk</p>
        </div>

        {/* Card 2: Pending Drafts */}
        <div className="glass-card rounded-[26px] p-5 ambient-amber">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Pending Drafts
            </span>
            <div className="h-8 w-8 rounded-full bg-amber-50/80 backdrop-blur-md border border-amber-200/70 flex items-center justify-center text-amber-600 shadow-xs">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="text-[28px] font-extrabold text-amber-600 font-tabular leading-tight">
            <CountUp end={pendingDrafts} triggerKey={countUpTrigger} /> {pendingDrafts === 1 ? 'Draft' : 'Drafts'}
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Requires documentation completion</p>
        </div>

        {/* Card 3: Successfully Handed Off */}
        <div className="glass-card rounded-[26px] p-5 ambient-mint">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Handed Off (Submitted)
            </span>
            <div className="h-8 w-8 rounded-full bg-emerald-50/80 backdrop-blur-md border border-emerald-200/70 flex items-center justify-center text-emerald-600 shadow-xs">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-[28px] font-extrabold text-emerald-600 font-tabular leading-tight">
            <CountUp end={handedOff} triggerKey={countUpTrigger} /> Placements
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Schedule generated & sent to Accounts</p>
        </div>

        {/* Card 4: BGC Clearance Rate */}
        <div className="glass-card rounded-[26px] p-5 ambient-blue">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              BGC Clearance
            </span>
            <div className="h-8 w-8 rounded-full bg-blue-50/80 backdrop-blur-md border border-blue-200/70 flex items-center justify-center text-blue-600 shadow-xs">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="text-[28px] font-extrabold text-blue-600 font-tabular leading-tight">
            <CountUp end={bgcRate} suffix="%" triggerKey={countUpTrigger} /> Cleared
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">{bgcCleared} of {totalMyPlacements} background checks cleared</p>
        </div>
      </div>
    );
  }

  // Standard Admin & Accounts View
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Payable */}
      <div className="glass-card rounded-[26px] p-5 ambient-blue">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Total Payable
          </span>
          <div className="h-8 w-8 rounded-full bg-blue-50/80 backdrop-blur-md border border-blue-200/70 flex items-center justify-center text-blue-600 shadow-xs">
            <DollarSign className="h-4 w-4" />
          </div>
        </div>
        <div className="text-[28px] font-extrabold text-slate-900 font-tabular leading-tight">
          <CountUp end={totalPayable} prefix="$" triggerKey={countUpTrigger} />
        </div>
        <p className="text-[11px] text-slate-500 font-medium mt-1">Across all approved placements</p>
      </div>

      {/* Total Collected */}
      <div className="glass-card rounded-[26px] p-5 ambient-mint">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Total Collected
          </span>
          <div className="h-8 w-8 rounded-full bg-emerald-50/80 backdrop-blur-md border border-emerald-200/70 flex items-center justify-center text-emerald-600 shadow-xs">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>
        <div className="text-[28px] font-extrabold text-emerald-600 font-tabular leading-tight">
          <CountUp end={totalCollected} prefix="$" triggerKey={countUpTrigger} />
        </div>
        <p className="text-[11px] text-slate-500 font-medium mt-1">Paid installments reconciled</p>
      </div>

      {/* Pending Balance */}
      <div className="glass-card rounded-[26px] p-5 ambient-amber">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Pending Balance
          </span>
          <div className="h-8 w-8 rounded-full bg-amber-50/80 backdrop-blur-md border border-amber-200/70 flex items-center justify-center text-amber-600 shadow-xs">
            <Clock className="h-4 w-4" />
          </div>
        </div>
        <div className="text-[28px] font-extrabold text-amber-600 font-tabular leading-tight">
          <CountUp end={pendingBalance} prefix="$" triggerKey={countUpTrigger} />
        </div>
        <p className="text-[11px] text-slate-500 font-medium mt-1">Due in upcoming cycles</p>
      </div>

      {/* Overdue Alerts */}
      <div className="glass-card rounded-[26px] p-5 border border-rose-200/70 ambient-rose">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">
            Overdue Alerts
          </span>
          <div className="h-8 w-8 rounded-full bg-rose-50/80 backdrop-blur-md border border-rose-200/70 flex items-center justify-center text-rose-600 shadow-xs">
            <AlertTriangle className="h-4 w-4" />
          </div>
        </div>
        <div className="text-[28px] font-extrabold text-rose-600 font-tabular leading-tight">
          <CountUp end={overdueCount} triggerKey={countUpTrigger} /> {overdueCount === 1 ? 'Slot' : 'Slots'}
        </div>
        <p className="text-[11px] text-rose-500 font-medium mt-1">Requires Account follow-up</p>
      </div>
    </div>
  );
};
