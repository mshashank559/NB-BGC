'use client';

import React, { useState } from 'react';
import {
  CandidateRecord,
  UserRole,
} from '../types';
import {
  Eye,
  CreditCard,
  CheckCircle2,
  Clock,
  Edit3,
  Trash2,
  Paperclip,
} from 'lucide-react';
import { DeleteCandidateModal } from './DeleteCandidateModal';

interface PaymentLedgerProps {
  candidates: CandidateRecord[];
  userRole: UserRole;
  currentUserId: string;
  onOpenCandidateDetail: (cand: CandidateRecord) => void;
  onOpenNewPoModal: () => void;
  onEditDraft?: (cand: CandidateRecord) => void;
  onDeleteCandidate?: (id: string) => void;
  onCollectPayment?: (cand: CandidateRecord) => void;
  onViewProof?: (url: string, name: string) => void;
  searchQuery: string;
}

export const PaymentLedger: React.FC<PaymentLedgerProps> = ({
  candidates,
  userRole,
  currentUserId,
  onOpenCandidateDetail,
  onOpenNewPoModal,
  onEditDraft,
  onDeleteCandidate,
  onCollectPayment,
  onViewProof,
  searchQuery,
}) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DRAFT' | 'SUBMITTED' | 'CLOSED' | 'OVERDUE'>('ALL');
  const [candidateToDelete, setCandidateToDelete] = useState<CandidateRecord | null>(null);

  const scopedCandidates = candidates.filter((cand) => {
    if (userRole === 'ACCOUNT_MANAGER') {
      // Mandatory Gate: Candidate is handed off to Accountant when BGC is CLEARED/PAID or payment installments have started!
      const isBgcCleared =
        cand.bgcOfferStatus === 'CLEARED' ||
        cand.bgcPaymentStatus === 'PAID' ||
        (cand.paymentPlan?.installments || []).some((i) => i.status === 'PAID');
      return isBgcCleared && (cand.status === 'SUBMITTED' || cand.status === 'CLOSED');
    }
    if (userRole === 'COMPLIANCE_MANAGER') {
      // Compliance Desk sees all candidates in the compliance & onboarding pipeline
      return true;
    }
    return true; // Admin sees all candidates across all stages
  });

  const filteredCandidates = scopedCandidates.filter((cand) => {
    if (statusFilter === 'OVERDUE') {
      const hasOverdue = (cand.paymentPlan?.installments || []).some((i) => i.status === 'OVERDUE');
      if (!hasOverdue) return false;
    } else if (statusFilter !== 'ALL') {
      if (cand.status !== statusFilter) return false;
    }

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (cand.candidateName || '').toLowerCase().includes(q);
      const matchClient = (cand.endClient || cand.clientEmployerName || '').toLowerCase().includes(q);
      const matchSales = (cand.salesPerson || '').toLowerCase().includes(q);
      const matchRole = (cand.jobRole || '').toLowerCase().includes(q);
      return matchName || matchClient || matchSales || matchRole;
    }

    return true;
  });

  return (
    <div className="glass-card rounded-[26px] p-6 ambient-blue">
      {/* Table Header & Filter Capsules */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>
              {userRole === 'COMPLIANCE_MANAGER'
                ? 'Candidate BGC & Compliance Ledger'
                : 'Candidate Compliance & Payment Ledger'}
            </span>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700">
              {filteredCandidates.length} Records
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            {userRole === 'ACCOUNT_MANAGER'
              ? 'Collection view (Sensitive marketing & income details excluded as per privacy matrix)'
              : userRole === 'COMPLIANCE_MANAGER'
                ? 'Compliance View (Exact 20 BGC Record Fields + Verification Status)'
                : 'Master System Ledger (All roles and lifecycle stages)'}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 glass-pill p-1 rounded-full text-xs">
          {(['ALL', 'SUBMITTED', 'DRAFT', 'CLOSED', 'OVERDUE'] as const).map((filter) => {
            if (userRole === 'ACCOUNT_MANAGER' && filter === 'DRAFT') return null;
            if (userRole === 'COMPLIANCE_MANAGER' && filter === 'OVERDUE') return null;

            return (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${statusFilter === filter
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
                  }`}
              >
                {filter === 'OVERDUE' ? '⚠️ Overdue' : filter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-x-auto shadow-2xs">
        <table className="w-full text-left text-xs whitespace-nowrap min-w-full">
          {userRole === 'COMPLIANCE_MANAGER' ? (
            /* COMPLIANCE VIEW TABLE HEAD: Exact 20 BGC Form Fields from Excel Sheet */
            <thead className="bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-700 dark:text-slate-300 text-[11px] font-bold border-b border-slate-200/80 dark:border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 sticky left-0 z-20 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md shadow-[4px_0_10px_rgba(0,0,0,0.06)]">
                  Candidate Name
                </th>
                <th className="py-3 px-3.5">Team Leader</th>
                <th className="py-3 px-3.5">PO Type</th>
                <th className="py-3 px-3.5">Sales Person</th>
                <th className="py-3 px-3.5">Email</th>
                <th className="py-3 px-3.5">Mobile</th>
                <th className="py-3 px-3.5">Joining Date</th>
                <th className="py-3 px-3.5">Upfront amount</th>
                <th className="py-3 px-3.5">BGC/OFFER Amount</th>
                <th className="py-3 px-3.5">On offer payment date</th>
                <th className="py-3 px-3.5">Total Slot Amount</th>
                <th className="py-3 px-3.5">Total Slot number</th>
                <th className="py-3 px-3.5">BGC Done By</th>
                <th className="py-3 px-3.5">Client/employer name</th>
                <th className="py-3 px-3.5">BGC company name</th>
                <th className="py-3 px-3.5">BGC start date</th>
                <th className="py-3 px-3.5">Email refrence given</th>
                <th className="py-3 px-3.5">Phone refrence</th>
                <th className="py-3 px-3.5">BGC End date</th>
                <th className="py-3 px-3.5">BGC status</th>
                <th className="py-3 px-4 text-right sticky right-0 z-20 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md shadow-[-4px_0_10px_rgba(0,0,0,0.06)]">
                  Action
                </th>
              </tr>
            </thead>
          ) : userRole === 'ACCOUNT_MANAGER' ? (
            /* ACCOUNTANT VIEW TABLE HEAD: BGC Fields, BGC Clearance & Slots */
            <thead className="bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-700 dark:text-slate-300 text-[11px] font-bold border-b border-slate-200/80 dark:border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Candidate Name</th>
                <th className="py-3 px-3.5">Team Leader</th>
                <th className="py-3 px-3.5">PO Type</th>
                <th className="py-3 px-3.5">Sales Person</th>
                <th className="py-3 px-3.5">Client / Employer</th>
                <th className="py-3 px-3.5">Joining Date</th>
                <th className="py-3 px-3.5">BGC / Offer Amt</th>
                <th className="py-3 px-3.5">BGC Clearance</th>
                <th className="py-3 px-3.5">Payment Structure</th>
                <th className="py-3 px-3.5">Installments (Slots)</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
          ) : (
            /* ADMIN VIEW TABLE HEAD: COMBINED COMPLIANCE + ACCOUNTANT SUPERPOWER VIEW */
            <thead className="bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-700 dark:text-slate-300 text-[11px] font-bold border-b border-slate-200/80 dark:border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Candidate Name</th>
                <th className="py-3 px-3.5">Team Leader</th>
                <th className="py-3 px-3.5">PO Type</th>
                <th className="py-3 px-3.5">Sales Person</th>
                <th className="py-3 px-3.5">Client / Employer</th>
                <th className="py-3 px-3.5">Joining Date</th>
                <th className="py-3 px-3.5">Upfront Amt</th>
                <th className="py-3 px-3.5">BGC / Offer Amt</th>
                <th className="py-3 px-3.5">BGC Clearance</th>
                <th className="py-3 px-3.5">Payment Structure</th>
                <th className="py-3 px-3.5">Installments (Slots)</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
          )}

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredCandidates.length === 0 ? (
              <tr>
                <td colSpan={userRole === 'COMPLIANCE_MANAGER' ? 21 : 11} className="py-12 text-center text-slate-400 font-medium">
                  No candidate records found in your current scope.
                </td>
              </tr>
            ) : (
              filteredCandidates.map((cand) => {
                const installments = cand.paymentPlan?.installments || [];

                if (userRole === 'COMPLIANCE_MANAGER') {
                  /* COMPLIANCE VIEW ROW: EXACT 20 BGC FORM FIELDS */
                  return (
                    <tr key={cand.id} className="hover:bg-blue-50/40 dark:hover:bg-blue-900/20 transition-colors group">
                      {/* 1. Candidate Name (Sticky Left) */}
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors sticky left-0 z-10 bg-white/95 dark:bg-slate-900/95 shadow-[4px_0_10px_rgba(0,0,0,0.06)]">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold">{cand.candidateName}</span>
                          {cand.status === 'DRAFT' && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-md font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                              Draft
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 2. Team Leader */}
                      <td className="py-3.5 px-3.5">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${(cand.teamLead === 'Rudra')
                          ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                          }`}>
                          {cand.teamLead || 'Rudra'}
                        </span>
                      </td>

                      {/* 3. PO Type */}
                      <td className="py-3.5 px-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold border border-slate-200 dark:border-slate-700">
                          {cand.poType || '1 st'}
                        </span>
                      </td>

                      {/* 4. Sales Person */}
                      <td className="py-3.5 px-3.5 font-medium text-slate-800 dark:text-slate-200">
                        {cand.salesPerson || '—'}
                      </td>

                      {/* 5. Email */}
                      <td className="py-3.5 px-3.5 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        {cand.personalEmail || '—'}
                      </td>

                      {/* 6. Mobile */}
                      <td className="py-3.5 px-3.5 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        {cand.personalPhone || '—'}
                      </td>

                      {/* 7. Joining Date */}
                      <td className="py-3.5 px-3.5 font-mono text-slate-800 dark:text-slate-200">
                        {cand.joiningDateEndClient || '—'}
                      </td>

                      {/* 8. Upfront amount */}
                      <td className="py-3.5 px-3.5 font-extrabold text-blue-700 dark:text-cyan-400 font-tabular">
                        ${(cand.upfrontAmount ?? 2000).toLocaleString()}
                      </td>

                      {/* 9. BGC/OFFER Amount */}
                      <td className="py-3.5 px-3.5 font-bold text-slate-900 dark:text-slate-100 font-tabular">
                        ${(cand.bgcOfferAmount ?? 2500).toLocaleString()}
                        {cand.bgcOfferSplits && cand.bgcOfferSplits.length > 1 && (
                          <span className="block text-[9px] text-indigo-600 dark:text-indigo-400 font-semibold font-sans">
                            ({cand.bgcOfferSplits.length} splits)
                          </span>
                        )}
                      </td>

                      {/* 10. On offer payment date */}
                      <td className="py-3.5 px-3.5 font-mono text-slate-700 dark:text-slate-300">
                        {cand.onOfferPaymentDate || '—'}
                      </td>

                      {/* 11. Total Slot Amount */}
                      <td className="py-3.5 px-3.5 font-extrabold text-emerald-700 dark:text-emerald-400 font-tabular">
                        ${(cand.totalSlotAmount ?? (cand.paymentPlan?.totalPayable ?? 0)).toLocaleString()}
                      </td>

                      {/* 12. Total Slot number */}
                      <td className="py-3.5 px-3.5 text-center font-bold text-slate-800 dark:text-slate-200">
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-cyan-400 border border-blue-200 dark:border-blue-800 font-bold">
                          {cand.totalSlotNumber ?? (cand.paymentPlan?.installments?.length ?? (cand.numberOfInstallments || 0))}
                        </span>
                      </td>

                      {/* 13. BGC Done By */}
                      <td className="py-3.5 px-3.5">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${(cand.bgcDoneBy === 'Imran')
                          ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                          }`}>
                          {cand.bgcDoneBy || 'Imran'}
                        </span>
                      </td>

                      {/* 14. Client/employer name */}
                      <td className="py-3.5 px-3.5 font-semibold text-slate-900 dark:text-white">
                        {cand.clientEmployerName || cand.endClient || '—'}
                      </td>

                      {/* 15. BGC company name */}
                      <td className="py-3.5 px-3.5 text-slate-700 dark:text-slate-300">
                        {cand.bgcCompanyName && cand.bgcCompanyName !== 'NetBounce Corp' && cand.bgcCompanyName !== 'NetBounce Verification Corp'
                          ? cand.bgcCompanyName
                          : '—'}
                      </td>

                      {/* 16. BGC start date */}
                      <td className="py-3.5 px-3.5 font-mono text-slate-700 dark:text-slate-300">
                        {cand.bgcStartDate || '—'}
                      </td>

                      {/* 17. Email refrence given */}
                      <td className="py-3.5 px-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${cand.emailReferenceGiven === 'No'
                          ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                          }`}>
                          {cand.emailReferenceGiven || 'Yes'}
                        </span>
                      </td>

                      {/* 18. Phone refrence */}
                      <td className="py-3.5 px-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${cand.phoneReferenceGiven === 'No'
                          ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                          }`}>
                          {cand.phoneReferenceGiven || 'Yes'}
                        </span>
                      </td>

                      {/* 19. BGC End date */}
                      <td className="py-3.5 px-3.5 font-mono text-slate-700 dark:text-slate-300">
                        {cand.bgcEndDate || '—'}
                      </td>

                      {/* 20. BGC status */}
                      <td className="py-3.5 px-3.5">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${cand.bgcOfferStatus === 'CLEARED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                            : cand.bgcOfferStatus === 'IN_PROGRESS'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-cyan-400 dark:border-blue-800'
                              : cand.bgcOfferStatus === 'FLAGGED'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800'
                                : 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                            }`}>
                            {cand.bgcOfferStatus || 'INITIATED'}
                          </span>

                          {/* Attachment Badge / Link */}
                          {cand.bgcPaymentProofDataUrl ? (
                            <button
                              type="button"
                              onClick={() => onViewProof && onViewProof(cand.bgcPaymentProofDataUrl!, cand.bgcPaymentProofName || 'BGC Verification Proof')}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 dark:text-cyan-300 border border-blue-200 dark:border-blue-800 transition-all cursor-pointer shadow-2xs"
                              title="View Uploaded Attachment / Verification Document"
                            >
                              <Paperclip className="w-3 h-3 text-blue-600 dark:text-cyan-400" />
                              <span className="truncate max-w-[90px]">{cand.bgcPaymentProofName || 'Attached Proof'}</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onCollectPayment ? onCollectPayment(cand) : onOpenCandidateDetail(cand)}
                              className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 font-medium transition-colors cursor-pointer"
                              title="Upload Proof & Clear BGC"
                            >
                              <Paperclip className="w-2.5 h-2.5" />
                              Attach Proof
                            </button>
                          )}
                        </div>
                      </td>

                      {/* 21. Action (Sticky Right) */}
                      <td className="py-3.5 px-4 text-right sticky right-0 z-10 bg-white/95 dark:bg-slate-900/95 shadow-[-4px_0_10px_rgba(0,0,0,0.06)]">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View */}
                          <button
                            onClick={() => onOpenCandidateDetail(cand)}
                            title="View Details"
                            className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-cyan-400 border border-blue-200/80 dark:border-blue-800 transition-all cursor-pointer shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => (onEditDraft ? onEditDraft(cand) : onOpenNewPoModal())}
                            title="Edit Record"
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-2xs"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Collect */}
                          <button
                            onClick={() => (onCollectPayment ? onCollectPayment(cand) : onOpenCandidateDetail(cand))}
                            title={cand.bgcPaymentStatus === 'PAID' ? "BGC Payment Already Cleared & Verified" : "Collect / Mark BGC Payment"}
                            className={`px-2.5 py-1.5 rounded-lg text-white font-bold text-[10px] shadow-xs transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${cand.bgcPaymentStatus === 'PAID'
                              ? 'bg-emerald-600 hover:bg-emerald-700'
                              : 'bg-blue-600 hover:bg-blue-700'
                              }`}
                          >
                            {cand.bgcPaymentStatus === 'PAID' ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" />
                                Cleared
                              </>
                            ) : (
                              <>
                                <CreditCard className="w-3 h-3" />
                                Collect
                              </>
                            )}
                          </button>

                          {/* Delete */}
                          {onDeleteCandidate && (
                            <button
                              onClick={() => setCandidateToDelete(cand)}
                              title="Delete Record"
                              className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800 transition-all cursor-pointer shadow-2xs"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                }

                if (userRole === 'ACCOUNT_MANAGER') {
                  /* ACCOUNTANT VIEW ROW: BGC Fields, Clearance Status & Custom Slots */
                  return (
                    <tr key={cand.id} className="hover:bg-blue-50/40 dark:hover:bg-blue-900/20 transition-colors group">
                      {/* 1. Candidate Name */}
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                        {cand.candidateName}
                      </td>

                      {/* 2. Team Leader */}
                      <td className="py-3.5 px-3.5">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${cand.teamLead === 'Rudra'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400'
                          }`}>
                          {cand.teamLead || 'Rudra'}
                        </span>
                      </td>

                      {/* 3. PO Type */}
                      <td className="py-3.5 px-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold border border-slate-200 dark:border-slate-700">
                          {cand.poType || '1 st'}
                        </span>
                      </td>

                      {/* 4. Sales Person */}
                      <td className="py-3.5 px-3.5 font-medium text-slate-800 dark:text-slate-200">
                        {cand.salesPerson || '—'}
                      </td>

                      {/* 5. Client / Employer */}
                      <td className="py-3.5 px-3.5 font-semibold text-slate-900 dark:text-white">
                        {cand.clientEmployerName || cand.endClient || '—'}
                      </td>

                      {/* 6. Joining Date */}
                      <td className="py-3.5 px-3.5 font-mono text-slate-800 dark:text-slate-200">
                        {cand.joiningDateEndClient}
                      </td>

                      {/* 7. BGC / Offer Amount */}
                      <td className="py-3.5 px-3.5 font-bold text-slate-900 dark:text-slate-100 font-tabular">
                        ${(cand.bgcOfferAmount ?? 2500).toLocaleString()}
                      </td>

                      {/* 8. BGC Clearance */}
                      <td className="py-3.5 px-3.5">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${cand.bgcPaymentStatus === 'PAID'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                            : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
                            }`}>
                            {cand.bgcPaymentStatus === 'PAID' ? '✅ Cleared' : '⏳ Pending'}
                          </span>

                          {cand.bgcPaymentProofDataUrl ? (
                            <button
                              type="button"
                              onClick={() => onViewProof && onViewProof(cand.bgcPaymentProofDataUrl!, cand.bgcPaymentProofName || 'BGC Payment Proof')}
                              className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-800 dark:text-cyan-400 dark:hover:text-cyan-300 font-bold underline cursor-pointer"
                              title="View Compliance Verification Document / Proof"
                            >
                              <Paperclip className="w-2.5 h-2.5" />
                              <span className="truncate max-w-[85px]">{cand.bgcPaymentProofName || 'View Proof'}</span>
                            </button>
                          ) : (
                            <span className="text-[9px] text-slate-400 italic">No attachment</span>
                          )}
                        </div>
                      </td>

                      {/* 9. Payment Structure (One-Shot vs Custom Slots) */}
                      <td className="py-3.5 px-3.5">
                        {cand.isOneShotPayment || cand.paymentPlan?.isOneShot ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-cyan-400 border border-blue-200 dark:border-blue-800">
                            ⚡ One-Shot
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold border border-slate-200 dark:border-slate-700">
                            {cand.totalSlotNumber || installments.length || 4} Slots
                          </span>
                        )}
                      </td>

                      {/* 10. Installment Slots Schedule Chips */}
                      <td className="py-3.5 px-3.5">
                        {cand.isOneShotPayment || cand.paymentPlan?.isOneShot ? (
                          <span className="text-[11px] font-mono text-blue-700 dark:text-cyan-400 font-bold">
                            ${(cand.paymentPlan?.totalPayable ?? (cand.totalSlotAmount ?? 0)).toLocaleString()} (Full)
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            {installments.map((inst) => (
                              <span
                                key={inst.id}
                                title={`Slot #${inst.number}: $${inst.amount} - ${inst.status} (Due: ${inst.dueDate})`}
                                className={`h-5 w-5 rounded-md flex items-center justify-center text-[9px] font-black cursor-pointer transition-transform hover:scale-125 ${inst.status === 'PAID'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : inst.status === 'OVERDUE'
                                    ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                                  }`}
                              >
                                {inst.number}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* 11. Status */}
                      <td className="py-3.5 px-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${cand.status === 'CLOSED'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                          {cand.status}
                        </span>
                      </td>

                      {/* 12. Action */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenCandidateDetail(cand)}
                            title="View Details"
                            className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-cyan-400 border border-blue-200/80 dark:border-blue-800 transition-all cursor-pointer shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => (onCollectPayment ? onCollectPayment(cand) : onOpenCandidateDetail(cand))}
                            title="Collect / Mark Payment"
                            className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] shadow-xs transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                          >
                            <CreditCard className="w-3 h-3" />
                            Collect
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                /* COMBINED ROW FOR ADMIN (COMPLIANCE + ACCOUNTANT VIEW) */
                return (
                  <tr key={cand.id} className="hover:bg-blue-50/40 dark:hover:bg-blue-900/20 transition-colors group">
                    {/* Candidate Name */}
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                      <div>{cand.candidateName}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{cand.personalEmail}</div>
                    </td>

                    {/* Team Leader */}
                    <td className="py-3.5 px-3.5 font-semibold text-slate-800 dark:text-slate-200">
                      {cand.teamLead || 'Rudra'}
                    </td>

                    {/* PO Type */}
                    <td className="py-3.5 px-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-cyan-400 font-bold text-[10px] border border-blue-200 dark:border-blue-800">
                        {cand.poType || '1 st'}
                      </span>
                    </td>

                    {/* Sales Person */}
                    <td className="py-3.5 px-3.5 font-medium text-slate-800 dark:text-slate-200">
                      {cand.salesPerson || '—'}
                    </td>

                    {/* Client / Employer */}
                    <td className="py-3.5 px-3.5">
                      <div className="font-bold text-slate-900 dark:text-white text-xs">{cand.clientEmployerName || cand.endClient}</div>
                      <div className="text-[10px] text-slate-500 font-medium">{cand.jobRole}</div>
                    </td>

                    {/* Joining Date */}
                    <td className="py-3.5 px-3.5 font-mono text-slate-800 dark:text-slate-200 font-medium text-[11px]">
                      {cand.joiningDateEndClient || '—'}
                    </td>

                    {/* Upfront Amount */}
                    <td className="py-3.5 px-3.5 font-extrabold text-blue-700 dark:text-cyan-400 font-tabular text-xs">
                      ${cand.upfrontAmount.toLocaleString()}
                    </td>

                    {/* BGC / Offer Amount */}
                    <td className="py-3.5 px-3.5 font-extrabold text-slate-900 dark:text-white font-tabular text-xs">
                      ${(cand.bgcOfferAmount ?? 2500).toLocaleString()}
                    </td>

                    {/* BGC Clearance Status */}
                    <td className="py-3.5 px-3.5">
                      <div className="flex flex-col gap-1 items-start">
                        {cand.bgcPaymentStatus === 'PAID' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Cleared
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Pending
                          </span>
                        )}

                        {cand.bgcPaymentProofDataUrl && (
                          <button
                            type="button"
                            onClick={() => onViewProof && onViewProof(cand.bgcPaymentProofDataUrl!, cand.bgcPaymentProofName || 'BGC Payment Proof')}
                            className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-800 dark:text-cyan-400 font-bold underline cursor-pointer"
                            title="View Attached Proof Document"
                          >
                            <Paperclip className="w-2.5 h-2.5" />
                            <span className="truncate max-w-[85px]">{cand.bgcPaymentProofName || 'Proof'}</span>
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Payment Structure */}
                    <td className="py-3.5 px-3.5">
                      {cand.isOneShotPayment ? (
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 font-extrabold text-[10px] border border-amber-200">
                          ⚡ One-Shot
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300 font-extrabold text-[10px] border border-purple-200">
                          {installments.length || cand.totalSlotNumber || 4} Slots
                        </span>
                      )}
                    </td>

                    {/* Installment Schedule Chips */}
                    <td className="py-3.5 px-3.5">
                      {cand.status === 'DRAFT' ? (
                        <span className="text-[10px] text-slate-400 italic">No schedule (Draft)</span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          {installments.map((inst) => (
                            <span
                              key={inst.id}
                              title={`Slot #${inst.number}: $${inst.amount} - ${inst.status} (Due: ${inst.dueDate})`}
                              className={`h-5 w-5 rounded-md flex items-center justify-center text-[9px] font-black cursor-pointer transition-transform hover:scale-125 ${inst.status === 'PAID'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : inst.status === 'OVERDUE'
                                  ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                                  : 'bg-amber-100 text-amber-800 border border-amber-300'
                                }`}
                            >
                              {inst.number}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Lifecycle Status */}
                    <td className="py-3.5 px-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${cand.status === 'CLOSED'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : cand.status === 'SUBMITTED'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                      >
                        {cand.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* 1. View Button */}
                        <button
                          onClick={() => onOpenCandidateDetail(cand)}
                          title="View Details"
                          className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-cyan-400 border border-blue-200/80 dark:border-blue-800 transition-all cursor-pointer shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* 2. Edit Button */}
                        <button
                          onClick={() => (onEditDraft ? onEditDraft(cand) : onOpenNewPoModal())}
                          title="Edit Record"
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-2xs"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* 3. Collect Button */}
                        <button
                          onClick={() => (onCollectPayment ? onCollectPayment(cand) : onOpenCandidateDetail(cand))}
                          title="Collect / Mark Payment"
                          className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] shadow-xs transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                        >
                          <CreditCard className="w-3 h-3" />
                          Collect
                        </button>

                        {/* 4. Delete Button */}
                        {onDeleteCandidate && (
                          <button
                            onClick={() => setCandidateToDelete(cand)}
                            title="Delete Record"
                            className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800 transition-all cursor-pointer shadow-2xs"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modern High-End Delete Confirmation Modal */}
      <DeleteCandidateModal
        isOpen={candidateToDelete !== null}
        candidate={candidateToDelete}
        onClose={() => setCandidateToDelete(null)}
        onConfirmDelete={(id) => {
          if (onDeleteCandidate) {
            onDeleteCandidate(id);
          }
        }}
      />
    </div>
  );
};
