'use client';

import React from 'react';
import {
  X,
  CreditCard,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Receipt,
  BellRing,
  Sliders,
  Zap,
  Edit2,
  Undo2,
} from 'lucide-react';
import { CandidateRecord, Installment, UserRole } from '../types';

interface CandidateDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: CandidateRecord | null;
  userRole: UserRole;
  onMarkPaid: (candidate: CandidateRecord, inst: Installment) => void;
  onEditInst: (candidate: CandidateRecord, inst: Installment) => void;
  onOpenCustomWindow: (candidate: CandidateRecord) => void;
  onToggleOneShot: (candidate: CandidateRecord) => void;
  onGenerateInvoice: (candidate: CandidateRecord, inst?: Installment) => void;
  onUnmarkPaid?: (candidate: CandidateRecord, inst: Installment) => void;
}

export const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({
  isOpen,
  onClose,
  candidate,
  userRole,
  onMarkPaid,
  onEditInst,
  onOpenCustomWindow,
  onToggleOneShot,
  onGenerateInvoice,
  onUnmarkPaid,
}) => {
  if (!isOpen || !candidate) return null;

  const installments = candidate.paymentPlan?.installments || [];
  const totalPayable = candidate.paymentPlan?.totalPayable || candidate.upfrontAmount;
  const totalPaid = installments
    .filter((i) => i.status === 'PAID')
    .reduce((sum, i) => sum + i.amount, 0);
  const balance = Math.max(0, totalPayable - totalPaid);
  const isOneShot = candidate.paymentPlan?.isOneShot || false;
  const hasPaidInstallment = installments.some((i) => i.status === 'PAID');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#0d1424] border border-white/10 rounded-3xl shadow-[0_30px_100px_rgba(0,0,0,0.95)] max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{candidate.candidateName}</h2>
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    candidate.status === 'CLOSED'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : candidate.status === 'SUBMITTED'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                  }`}
                >
                  {candidate.status}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30">
                  BGC: {candidate.bgcOfferStatus}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Client: <strong className="text-slate-200">{candidate.endClient}</strong> • Joining:{' '}
                <strong className="text-slate-200">{candidate.joiningDateEndClient}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Financial Header Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-6 pb-2 text-xs">
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Payable</span>
            <p className="text-xl font-extrabold text-white mt-1">${totalPayable.toLocaleString()}</p>
          </div>
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Paid</span>
            <p className="text-xl font-extrabold text-emerald-400 mt-1">${totalPaid.toLocaleString()}</p>
          </div>
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Outstanding Balance</span>
            <p className="text-xl font-extrabold text-amber-400 mt-1">${balance.toLocaleString()}</p>
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            {/* Custom Payment Schedule Window (User requirement: 2-3 upfront + 5-6 remaining) */}
            {userRole !== 'COMPLIANCE_MANAGER' && candidate.status !== 'CLOSED' && (
              <button
                onClick={() => onOpenCustomWindow(candidate)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 font-bold border border-cyan-500/30 transition-all shadow-[0_0_15px_rgba(0,242,254,0.15)]"
              >
                <Sliders className="h-3.5 w-3.5" />
                Special Payment Window (Custom Split)
              </button>
            )}

            {/* One-Shot Toggle */}
            {userRole !== 'COMPLIANCE_MANAGER' && candidate.status !== 'CLOSED' && (
              <button
                disabled={hasPaidInstallment}
                onClick={() => onToggleOneShot(candidate)}
                title={hasPaidInstallment ? 'Cannot switch to one-shot after an installment is paid' : ''}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold border transition-all ${
                  hasPaidInstallment
                    ? 'opacity-40 cursor-not-allowed bg-slate-800 border-white/5 text-slate-400'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-white/10'
                }`}
              >
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                {isOneShot ? 'Revert to Multi-Installments' : 'Switch to One-Shot Payment'}
              </button>
            )}
          </div>

          {/* Trigger On-Offer Invoice */}
          <button
            onClick={() => onGenerateInvoice(candidate)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-semibold border border-white/5 transition-all"
          >
            <Receipt className="h-3.5 w-3.5 text-cyan-400" />
            Generate On-Offer Invoice (MCP)
          </button>
        </div>

        {/* Installment Table */}
        <div className="p-6 pt-2 overflow-y-auto max-h-[55vh]">
          <div className="rounded-2xl border border-white/5 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 text-[11px] font-semibold border-b border-white/5">
                <tr>
                  <th className="py-3 px-4">Slot</th>
                  <th className="py-3 px-4">Tier / Type</th>
                  <th className="py-3 px-4">Amount ($)</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Paid Date</th>
                  <th className="py-3 px-4">Slot Status</th>
                  <th className="py-3 px-4">Invoice (MCP)</th>
                  <th className="py-3 px-4">Reminders</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-slate-950/40">
                {installments.map((inst) => {
                  const isPaid = inst.status === 'PAID';
                  const isOverdue = inst.status === 'OVERDUE';

                  return (
                    <tr key={inst.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-bold text-white">#{inst.number}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                            inst.tier === 'UPFRONT'
                              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                              : inst.tier === 'REMAINING'
                              ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {inst.tier === 'UPFRONT'
                            ? 'On-Offer Split'
                            : inst.tier === 'REMAINING'
                            ? 'Monthly Split'
                            : 'Standard'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-extrabold text-white">${inst.amount.toLocaleString()}</td>
                      <td className="py-3 px-4 font-mono text-slate-300 flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-slate-500" />
                        {inst.dueDate}
                        {inst.dueDateIsManual && (
                          <span className="text-[9px] text-amber-400 font-bold ml-1">(Manual)</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">{inst.paidDate || '—'}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isPaid
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : isOverdue
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {isPaid ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : isOverdue ? (
                            <AlertTriangle className="h-3 w-3" />
                          ) : (
                            <Clock className="h-3 w-3" />
                          )}
                          {inst.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {inst.invoiceNumber ? (
                          <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
                            {inst.invoiceNumber} ({inst.invoiceStatus})
                          </span>
                        ) : (
                          <button
                            onClick={() => onGenerateInvoice(candidate, inst)}
                            className="text-[10px] text-slate-400 hover:text-cyan-300 underline"
                          >
                            + Generate Invoice
                          </button>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <BellRing className="h-3 w-3 text-slate-500" />
                          {inst.reminderStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Mark Paid (Accounts/Admin) */}
                          {!isPaid && userRole !== 'COMPLIANCE_MANAGER' && (
                            <button
                              onClick={() => onMarkPaid(candidate, inst)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold border border-emerald-500/40 text-[10px] transition-all"
                            >
                              Mark Paid
                            </button>
                          )}

                          {/* Unmark Paid (Admin Only with Remark) */}
                          {isPaid && userRole === 'ADMIN' && onUnmarkPaid && (
                            <button
                              onClick={() => onUnmarkPaid(candidate, inst)}
                              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-300 font-semibold text-[10px] border border-rose-500/30 transition-all flex items-center gap-1"
                            >
                              <Undo2 className="h-3 w-3" />
                              Unmark
                            </button>
                          )}

                          {/* Edit Date / Amount */}
                          {(!isPaid || userRole === 'ADMIN') && (
                            <button
                              onClick={() => onEditInst(candidate, inst)}
                              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                              title="Edit Date / Amount (Requires Remark)"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Agreed Condition & Latest Remark Footer */}
          <div className="mt-4 p-4 rounded-2xl bg-slate-900/50 border border-white/5 space-y-2 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Final Agreed Payment Condition:
              </span>
              <p className="text-slate-200 font-medium mt-0.5">{candidate.finalAgreedPaymentCondition}</p>
            </div>
            {candidate.remarks && (
              <div className="pt-2 border-t border-white/5">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Latest Remark:</span>
                <p className="text-slate-300 mt-0.5 italic">{candidate.remarks}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

