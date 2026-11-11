'use client';

import React, { useState } from 'react';
import {
  CandidateRecord,
  UserRole,
  InstallmentStatus,
} from '../types';
import {
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Lock,
  Plus,
} from 'lucide-react';

interface PaymentLedgerProps {
  candidates: CandidateRecord[];
  userRole: UserRole;
  currentUserId: string;
  onOpenCandidateDetail: (cand: CandidateRecord) => void;
  onOpenNewPoModal: () => void;
  searchQuery: string;
}

export const PaymentLedger: React.FC<PaymentLedgerProps> = ({
  candidates,
  userRole,
  currentUserId,
  onOpenCandidateDetail,
  onOpenNewPoModal,
  searchQuery,
}) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DRAFT' | 'SUBMITTED' | 'CLOSED' | 'OVERDUE'>('ALL');

  // Filter candidates based on Role Scopes as per PRD Section 5:
  // - Admin: All candidates
  // - Compliance Manager: createdBy = currentUserId only
  // - Account Manager: SUBMITTED and CLOSED only (DRAFT hidden completely)
  const scopedCandidates = candidates.filter((cand) => {
    if (userRole === 'COMPLIANCE_MANAGER') {
      return cand.createdBy === currentUserId;
    }
    if (userRole === 'ACCOUNT_MANAGER') {
      return cand.status === 'SUBMITTED' || cand.status === 'CLOSED';
    }
    return true; // Admin
  });

  // Apply Status & Search filters
  const filteredCandidates = scopedCandidates.filter((cand) => {
    // Status filter
    if (statusFilter === 'OVERDUE') {
      const hasOverdue = (cand.paymentPlan?.installments || []).some((i) => i.status === 'OVERDUE');
      if (!hasOverdue) return false;
    } else if (statusFilter !== 'ALL') {
      if (cand.status !== statusFilter) return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = cand.candidateName.toLowerCase().includes(q);
      const matchClient = cand.endClient.toLowerCase().includes(q);
      const matchSales = cand.salesPerson.toLowerCase().includes(q);
      const matchRole = cand.jobRole.toLowerCase().includes(q);
      return matchName || matchClient || matchSales || matchRole;
    }

    return true;
  });

  return (
    <div className="bg-[#111927]/60 rounded-3xl p-6 border border-white/5 shadow-spatial-card">
      {/* Table Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Candidate Compliance & Payment Ledger</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-normal">
              {filteredCandidates.length} Records
            </span>
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {userRole === 'ACCOUNT_MANAGER'
              ? 'Collection view (Sensitive marketing & income details excluded as per privacy matrix)'
              : userRole === 'COMPLIANCE_MANAGER'
              ? 'My Created Forms (Scoped to your account)'
              : 'Master System Ledger (All roles and lifecycle stages)'}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/80 p-1 rounded-2xl border border-white/5 text-xs">
          {(['ALL', 'SUBMITTED', 'DRAFT', 'CLOSED', 'OVERDUE'] as const).map((filter) => {
            // Hide DRAFT filter for Account Manager as per PRD
            if (userRole === 'ACCOUNT_MANAGER' && filter === 'DRAFT') return null;

            return (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1 rounded-xl text-[11px] font-semibold transition-all ${
                  statusFilter === filter
                    ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,242,254,0.15)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {filter === 'OVERDUE' ? '⚠️ Overdue Only' : filter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="rounded-2xl border border-white/5 overflow-x-auto">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="bg-slate-900/90 text-slate-400 text-[11px] font-semibold border-b border-white/5">
            <tr>
              <th className="py-3.5 px-4">Candidate Name</th>
              <th className="py-3.5 px-4">Contact (Personal)</th>
              <th className="py-3.5 px-4">Sales / Lead</th>
              {userRole !== 'ACCOUNT_MANAGER' && <th className="py-3.5 px-4">End Client & Role</th>}
              <th className="py-3.5 px-4">PO Month</th>
              <th className="py-3.5 px-4">Joining Date</th>
              <th className="py-3.5 px-4">Upfront Amount</th>
              <th className="py-3.5 px-4">BGC Offer</th>
              <th className="py-3.5 px-4">Installment Schedule</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-slate-950/40">
            {filteredCandidates.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-12 text-center text-slate-500">
                  No candidate records found in your current scope.
                </td>
              </tr>
            ) : (
              filteredCandidates.map((cand) => {
                const installments = cand.paymentPlan?.installments || [];
                const totalPaid = installments
                  .filter((i) => i.status === 'PAID')
                  .reduce((s, i) => s + i.amount, 0);
                const totalPayable = cand.paymentPlan?.totalPayable || cand.upfrontAmount;

                return (
                  <tr key={cand.id} className="hover:bg-white/5 transition-colors group">
                    {/* Candidate Name */}
                    <td className="py-3.5 px-4 font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {cand.candidateName}
                    </td>

                    {/* Personal Email & Phone */}
                    <td className="py-3.5 px-4">
                      <div className="text-[11px] text-slate-300 font-mono">{cand.personalEmail}</div>
                      <div className="text-[10px] text-slate-500">{cand.personalPhone}</div>
                    </td>

                    {/* Sales / Team Lead */}
                    <td className="py-3.5 px-4">
                      <div className="text-slate-300">{cand.salesPerson}</div>
                      <div className="text-[10px] text-slate-500">Lead: {cand.teamLead}</div>
                    </td>

                    {/* End Client & Role (Hidden from Account Manager) */}
                    {userRole !== 'ACCOUNT_MANAGER' && (
                      <td className="py-3.5 px-4">
                        <div className="text-slate-200 font-medium">{cand.endClient}</div>
                        <div className="text-[10px] text-cyan-400/80">{cand.jobRole}</div>
                      </td>
                    )}

                    {/* PO Month */}
                    <td className="py-3.5 px-4 text-slate-400">{cand.poMonth}</td>

                    {/* Joining Date */}
                    <td className="py-3.5 px-4 font-mono text-slate-300">{cand.joiningDateEndClient}</td>

                    {/* Upfront Amount */}
                    <td className="py-3.5 px-4 font-extrabold text-cyan-400">
                      ${cand.upfrontAmount.toLocaleString()}
                    </td>

                    {/* BGC Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          cand.bgcOfferStatus === 'CLEARED'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : cand.bgcOfferStatus === 'IN_PROGRESS'
                            ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                            : cand.bgcOfferStatus === 'FLAGGED'
                            ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {cand.bgcOfferStatus}
                      </span>
                    </td>

                    {/* Installment Schedule Chips */}
                    <td className="py-3.5 px-4">
                      {cand.status === 'DRAFT' ? (
                        <span className="text-[10px] text-slate-500 italic">No schedule (Draft)</span>
                      ) : (
                        <div className="flex items-center gap-1">
                          {installments.map((inst) => (
                            <span
                              key={inst.id}
                              title={`Slot #${inst.number}: $${inst.amount} - ${inst.status} (Due: ${inst.dueDate})`}
                              className={`h-5 w-5 rounded-md flex items-center justify-center text-[9px] font-extrabold cursor-pointer transition-transform hover:scale-125 ${
                                inst.status === 'PAID'
                                  ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                                  : inst.status === 'OVERDUE'
                                  ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40 animate-pulse'
                                  : 'bg-amber-500/25 text-amber-300 border border-amber-500/40'
                              }`}
                            >
                              {inst.number}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Lifecycle Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          cand.status === 'CLOSED'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : cand.status === 'SUBMITTED'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : 'bg-slate-700/40 text-slate-300 border border-white/5'
                        }`}
                      >
                        {cand.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      {cand.status === 'DRAFT' ? (
                        <button
                          onClick={onOpenNewPoModal}
                          className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-[11px] border border-white/5 transition-all"
                        >
                          Edit Draft
                        </button>
                      ) : (
                        <button
                          onClick={() => onOpenCandidateDetail(cand)}
                          className="px-3 py-1 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/10 hover:from-cyan-500/30 hover:to-blue-500/20 text-cyan-300 font-semibold text-[11px] border border-cyan-500/30 transition-all flex items-center gap-1 ml-auto"
                        >
                          <Eye className="h-3 w-3" />
                          View Schedule
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

