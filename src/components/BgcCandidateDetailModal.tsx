'use client';

import React from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Clock,
  User,
  Phone,
  Mail,
  Building,
  Calendar,
  DollarSign,
  FileCheck,
  Edit3,
  ExternalLink,
  CreditCard,
  FileText,
  AlertCircle
} from 'lucide-react';
import { CandidateRecord } from '../types';

interface BgcCandidateDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: CandidateRecord | null;
  onOpenEdit: (cand: CandidateRecord) => void;
  onOpenMarkPaid: (cand: CandidateRecord) => void;
  onViewProof?: (url: string, name: string) => void;
  onOpenLedgerDetail?: (cand: CandidateRecord) => void;
}

export const BgcCandidateDetailModal: React.FC<BgcCandidateDetailModalProps> = ({
  isOpen,
  onClose,
  candidate,
  onOpenEdit,
  onOpenMarkPaid,
  onViewProof,
  onOpenLedgerDetail,
}) => {
  if (!isOpen || !candidate) return null;

  const isBgcPaid = candidate.bgcPaymentStatus === 'PAID';
  const bgcAmount = candidate.bgcOfferAmount ?? 2500;
  const upfrontAmount = candidate.upfrontAmount ?? 2000;
  const totalSlots = candidate.totalSlotNumber ?? 4;
  const totalSlotAmt = candidate.totalSlotAmount ?? (candidate.paymentPlan?.totalPayable || 8400);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden text-slate-900 dark:text-white">
        {/* Header */}
        <div className="px-7 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/50">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-cyan-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-extrabold tracking-tight">{candidate.candidateName}</h2>
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    candidate.bgcOfferStatus === 'CLEARED'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-400'
                      : candidate.bgcOfferStatus === 'IN_PROGRESS'
                      ? 'bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-950/60 dark:text-cyan-400'
                      : candidate.bgcOfferStatus === 'FLAGGED'
                      ? 'bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950/60 dark:text-rose-400'
                      : 'bg-slate-100 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  BGC: {candidate.bgcOfferStatus || 'INITIATED'}
                </span>
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    isBgcPaid
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400'
                      : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-400'
                  }`}
                >
                  {isBgcPaid ? '✅ Payment Settled' : '⏳ Payment Pending'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Client: <strong className="text-slate-800 dark:text-slate-200">{candidate.clientEmployerName || candidate.endClient || '—'}</strong> • PO Type: <strong className="text-blue-600 dark:text-cyan-400">{candidate.poType || '1 st'}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenLedgerDetail && (
              <button
                onClick={() => onOpenLedgerDetail(candidate)}
                title="View Full Payment Ledger & Joining Date Drawer"
                className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-xs font-bold text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5" />
                Ledger & Slots
              </button>
            )}
            <button
              onClick={() => onOpenEdit(candidate)}
              title="Edit BGC Form"
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Form
            </button>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* Hero Section: BGC Payment Settlement Card */}
          <div className={`p-5 rounded-3xl border transition-all ${
            isBgcPaid
              ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 shadow-[0_4px_20px_rgba(16,185,129,0.08)]'
              : 'bg-gradient-to-r from-blue-50/60 via-indigo-50/40 to-slate-50/60 dark:from-blue-950/30 dark:via-slate-900 dark:to-slate-900 border-blue-200 dark:border-blue-900/60 shadow-md'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Compliance Payment Clearance
                </span>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-3xl font-black text-slate-900 dark:text-white font-tabular">
                    ${bgcAmount.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-cyan-400 border border-blue-200 dark:border-blue-800">
                    BGC / Offer Amount
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  On-Offer Payment Date: <strong className="text-slate-800 dark:text-slate-200 font-mono">{candidate.onOfferPaymentDate || 'Not specified'}</strong>
                </p>

                {candidate.bgcOfferSplits && candidate.bgcOfferSplits.length > 1 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 block mb-1">
                      ✂️ BGC / Offer Split Schedule ({candidate.bgcOfferSplits.length} parts):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {candidate.bgcOfferSplits.map((split) => (
                        <div key={split.number} className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-[11px]">
                          <span className="font-bold text-slate-900 dark:text-white mr-1.5">Split #{split.number}: ${split.amount.toLocaleString()}</span>
                          {split.dueDate && <span className="text-[10px] text-slate-500 font-mono">({split.dueDate})</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button or Clearance Status */}
              <div>
                {isBgcPaid ? (
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-extrabold text-xs shadow-md">
                      <CheckCircle2 className="w-4 h-4" />
                      Paid & Cleared on {candidate.bgcPaymentPaidDate || 'Today'}
                    </span>
                    {candidate.bgcPaymentProofDataUrl && (
                      <button
                        onClick={() => onViewProof && onViewProof(candidate.bgcPaymentProofDataUrl!, candidate.bgcPaymentProofName || 'Payment Proof')}
                        className="text-xs text-blue-600 dark:text-cyan-400 hover:underline font-bold flex items-center gap-1 cursor-pointer mt-1"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        View Attached Proof ({candidate.bgcPaymentProofName || 'Document'})
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => onOpenMarkPaid(candidate)}
                    className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Mark BGC as Paid (With Proof)
                  </button>
                )}
              </div>
            </div>

            {/* Proof & Remarks Details if settled */}
            {isBgcPaid && candidate.bgcPaymentRemarks && (
              <div className="mt-4 pt-3 border-t border-emerald-200/80 dark:border-emerald-800/40 text-xs">
                <span className="font-bold text-slate-500 dark:text-slate-400 block text-[10px] uppercase tracking-wider">Compliance Officer Remarks</span>
                <p className="text-slate-800 dark:text-slate-200 italic mt-0.5 font-medium">&ldquo;{candidate.bgcPaymentRemarks}&rdquo;</p>
              </div>
            )}
          </div>

          {/* ALL 20 BGC FIELDS (A to Z BENTO CARDS) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Box 1: Candidate & Contact Details */}
            <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                1. Candidate & Contact Info
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-400">Candidate Name</span>
                  <span className="font-bold text-slate-900 dark:text-white">{candidate.candidateName}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-400">Email Address</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{candidate.personalEmail || '—'}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Mobile Phone</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{candidate.personalPhone || '—'}</span>
                </div>
              </div>
            </div>

            {/* Box 2: Team Leader, Sales & BGC Officers */}
            <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                2. Hierarchy & Sales Assignment
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-400">Team Leader</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    candidate.teamLead === 'Rudra'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400'
                  }`}>
                    {candidate.teamLead || 'Rudra'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-400">PO Type</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 font-bold text-[10px]">
                    {candidate.poType || '1 st'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-400">Sales Person</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{candidate.salesPerson || '—'}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">BGC Done By</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    candidate.bgcDoneBy === 'Imran'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400'
                  }`}>
                    {candidate.bgcDoneBy || 'Imran'}
                  </span>
                </div>
              </div>
            </div>

            {/* Box 3: Client, Employer & BGC Agency */}
            <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                3. Employer & Verification Agency
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-400">Client / Employer Name</span>
                  <span className="font-bold text-slate-900 dark:text-white">{candidate.clientEmployerName || candidate.endClient || '—'}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-400">BGC Company Name</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{candidate.bgcCompanyName || 'NetBounce Corp'}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Current Job Role</span>
                  <span className="font-medium text-blue-600 dark:text-cyan-400">{candidate.jobRole || 'Consultant'}</span>
                </div>
              </div>
            </div>

            {/* Box 4: Financial Summary & Slot Numbers */}
            <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                4. Financial & Slot Breakdown
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-400">Upfront Amount</span>
                  <span className="font-extrabold text-blue-600 dark:text-cyan-400 font-tabular">${upfrontAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-400">Total Slot Amount</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400 font-tabular">${totalSlotAmt.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Total Slot Number</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{totalSlots} Installment Slots</span>
                </div>
              </div>
            </div>

            {/* Box 5: Milestone Dates */}
            <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                5. Key Dates & Timeline
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-400">Joining Date</span>
                  <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{candidate.joiningDateEndClient || '—'}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-400">BGC Start Date</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{candidate.bgcStartDate || '—'}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">BGC End Date</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{candidate.bgcEndDate || '—'}</span>
                </div>
              </div>
            </div>

            {/* Box 6: Reference Checks */}
            <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                6. Verification References
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-400">Email Reference Given</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    candidate.emailReferenceGiven === 'No'
                      ? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400'
                  }`}>
                    {candidate.emailReferenceGiven || 'Yes'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-400">Phone Reference Given</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    candidate.phoneReferenceGiven === 'No'
                      ? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400'
                  }`}>
                    {candidate.phoneReferenceGiven || 'Yes'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Overall Verification</span>
                  <span className="font-bold text-blue-600 dark:text-cyan-400">{candidate.bgcOfferStatus || 'INITIATED'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between text-xs text-slate-500">
          <span>
            Candidate ID: <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{candidate.id}</span>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold transition-all border border-slate-300 dark:border-slate-700 cursor-pointer"
          >
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
};
