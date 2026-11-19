'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Receipt,
  Sliders,
  Zap,
  Edit2,
  Undo2,
  Mail,
  FileCheck,
  Gift,
  Tag,
  CalendarCheck,
  CalendarX,
  Users,
  Check,
  RotateCcw,
  Layers,
  History,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { CandidateRecord, Installment, UserRole, DeductionRecord } from '../types';

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
  onSendReminder?: (candidate: CandidateRecord, inst: Installment) => void;
  onViewProof?: (url: string, name: string) => void;
  onUpdateJoiningDate?: (candidateId: string, newDate: string) => void;
  onMarkJoiningDatePending?: (candidateId: string) => void;
  onOpenBgcDetail?: (candidate: CandidateRecord) => void;
  onOpenMarkPaid?: (candidate: CandidateRecord) => void;
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
  onSendReminder,
  onViewProof,
  onUpdateJoiningDate,
  onMarkJoiningDatePending,
  onOpenBgcDetail,
  onOpenMarkPaid,
}) => {
  const [joiningDateInput, setJoiningDateInput] = useState<string>('');
  const [isEditingJoiningDate, setIsEditingJoiningDate] = useState<boolean>(false);
  const [joiningDateMsg, setJoiningDateMsg] = useState<string>('');

  useEffect(() => {
    if (candidate) {
      setJoiningDateInput(candidate.joiningDateEndClient || '');
      setIsEditingJoiningDate(!candidate.joiningDateEndClient || candidate.joiningDateStatus === 'TO_BE_UPDATED');
      setJoiningDateMsg('');
    }
  }, [candidate]);

  if (!isOpen || !candidate) return null;

  const installments = candidate.paymentPlan?.installments || [];
  const totalPayable = candidate.paymentPlan?.totalPayable || candidate.upfrontAmount;
  const totalPaid = installments
    .filter((i) => i.status === 'PAID')
    .reduce((sum, i) => sum + i.amount, 0);
  const balance = Math.max(0, totalPayable - totalPaid);
  const isOneShot = candidate.paymentPlan?.isOneShot || false;
  const hasPaidInstallment = installments.some((i) => i.status === 'PAID');

  const hasJoiningDate = !!candidate.joiningDateEndClient && candidate.joiningDateStatus !== 'TO_BE_UPDATED';

  const handleSaveJoiningDate = () => {
    if (!joiningDateInput.trim()) {
      setJoiningDateMsg('Please select a valid joining date.');
      return;
    }
    if (onUpdateJoiningDate) {
      onUpdateJoiningDate(candidate.id, joiningDateInput.trim());
      setIsEditingJoiningDate(false);
      setJoiningDateMsg('Joining date successfully updated & saved. Reminder resolved.');
      setTimeout(() => setJoiningDateMsg(''), 4000);
    }
  };

  const handleSetToBeUpdated = () => {
    if (onMarkJoiningDatePending) {
      onMarkJoiningDatePending(candidate.id);
      setIsEditingJoiningDate(true);
      setJoiningDateInput('');
      setJoiningDateMsg('Marked as To Be Updated. Persistent reminder generated for dashboard.');
      setTimeout(() => setJoiningDateMsg(''), 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-hidden">
      <div className="relative w-full max-w-5xl bg-white border border-slate-200 rounded-[32px] shadow-2xl h-[90vh] max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-slate-900">
        {/* Header (Sticky / Fixed) */}
        <div className="px-7 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 flex-shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">{candidate.candidateName}</h2>
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    candidate.status === 'CLOSED'
                      ? 'bg-purple-100 text-purple-700 border border-purple-300'
                      : candidate.status === 'SUBMITTED'
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {candidate.status}
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                  BGC: {candidate.bgcOfferStatus}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Client: <strong className="text-slate-800">{candidate.endClient}</strong> • Joining:{' '}
                <strong className="text-blue-600 font-mono">{candidate.joiningDateEndClient}</strong> • Role:{' '}
                <span className="text-slate-700 font-medium">{candidate.jobRole}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Scrollable Body (Internal Smooth Scroller) */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-6 space-y-4">
          {/* Compliance BGC Clearance & Verification Handoff Banner */}
          {candidate.bgcPaymentStatus === 'PAID' ? (
            <div className="p-4 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-emerald-900 dark:text-emerald-300">
                      BGC Payment Cleared & Verified by Compliance
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                      ${(candidate.bgcOfferAmount ?? 2500).toLocaleString()} Settled
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                    Receipt Date: <strong>{candidate.bgcPaymentPaidDate || 'Recent'}</strong>
                    {candidate.bgcPaymentRemarks && (
                      <span> • Remark: &ldquo;{candidate.bgcPaymentRemarks}&rdquo;</span>
                    )}
                  </p>
                </div>
              </div>

              {candidate.bgcPaymentProofDataUrl && (
                <button
                  onClick={() => onViewProof && onViewProof(candidate.bgcPaymentProofDataUrl!, candidate.bgcPaymentProofName || 'BGC Payment Proof')}
                  className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-slate-700 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-700 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  <FileCheck className="h-4 w-4 text-emerald-600" />
                  View Compliance Proof / SS ({candidate.bgcPaymentProofName || 'Receipt'})
                </button>
              )}
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                <div>
                  <span className="font-extrabold text-amber-900 dark:text-amber-300">
                    BGC Payment Pending Compliance Clearance (${(candidate.bgcOfferAmount ?? 2500).toLocaleString()})
                  </span>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400">
                    Compliance Desk has not yet verified the BGC payment proof. Verification unlocks full scheduled installment settlements.
                  </p>
                </div>
              </div>
              {onOpenMarkPaid && (userRole === 'COMPLIANCE_MANAGER' || userRole === 'ADMIN') && (
                <button
                  onClick={() => onOpenMarkPaid(candidate)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0 active:scale-95"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Verify & Clear BGC
                </button>
              )}
            </div>
          )}

          {/* Financial Header Bento Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Payable</span>
              <p className="text-2xl font-black text-slate-900 mt-1">${totalPayable.toLocaleString()}</p>
            </div>
            <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Total Paid</span>
              <p className="text-2xl font-black text-emerald-700 mt-1">${totalPaid.toLocaleString()}</p>
            </div>
            <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200">
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Outstanding Balance</span>
              <p className="text-2xl font-black text-amber-700 mt-1">${balance.toLocaleString()}</p>
            </div>
          </div>

          {/* BGC Excel Specifications Strip */}
          <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-100 text-xs">
            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-blue-100/60">
              <span className="font-extrabold text-blue-900 tracking-tight flex items-center gap-1.5 text-[11px]">
                📋 BGC & Compliance Verification Specifications
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                PO Type: {candidate.poType || '1 st'}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px]">Team Leader</span>
                <strong className="text-slate-800">{candidate.teamLead || 'Rudra'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Sales Person</span>
                <strong className="text-slate-800">{candidate.salesPerson || '—'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">BGC Done By</span>
                <strong className="text-blue-700">{candidate.bgcDoneBy || 'Irfan'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">BGC / Offer Amt</span>
                <strong className="text-slate-800">${(candidate.bgcOfferAmount ?? 2500).toLocaleString()}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Offer Pay Date</span>
                <strong className="text-slate-800">{candidate.onOfferPaymentDate || '—'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Total Slot Amt</span>
                <strong className="text-emerald-700">${(candidate.totalSlotAmount ?? totalPayable).toLocaleString()} ({candidate.totalSlotNumber || 4} slots)</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">BGC Company</span>
                <strong className="text-slate-800">{candidate.bgcCompanyName || '—'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">BGC Start Date</span>
                <strong className="text-slate-800">{candidate.bgcStartDate || '—'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">BGC End Date</span>
                <strong className="text-slate-800">{candidate.bgcEndDate || '—'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Email Ref</span>
                <strong className="text-slate-800">{candidate.emailReferenceGiven || 'Yes'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Phone Ref</span>
                <strong className="text-slate-800">{candidate.phoneReferenceGiven || 'Yes'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Status</span>
                <strong className="text-blue-600">{candidate.bgcOfferStatus || 'INITIATED'}</strong>
              </div>
            </div>
          </div>

          {/* Action Controls Bar */}
          <div className="py-1 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              {/* Custom Payment Schedule Window */}
              {candidate.status !== 'CLOSED' && (
                <button
                  onClick={() => onOpenCustomWindow(candidate)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold border border-blue-200 transition-all shadow-sm cursor-pointer"
                >
                  <Sliders className="h-3.5 w-3.5" />
                  Special Payment Window (Custom Split)
                </button>
              )}

              {/* One-Shot Toggle */}
              {candidate.status !== 'CLOSED' && (
                <button
                  disabled={hasPaidInstallment}
                  onClick={() => onToggleOneShot(candidate)}
                  title={hasPaidInstallment ? 'Cannot switch to one-shot after an installment is paid' : ''}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                    hasPaidInstallment
                      ? 'opacity-40 cursor-not-allowed bg-slate-100 border-slate-200 text-slate-400'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                  }`}
                >
                  <Zap className="h-3.5 w-3.5 text-amber-500" />
                  {isOneShot ? 'Revert to Multi-Installments' : 'Switch to One-Shot Payment'}
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {onOpenBgcDetail && (
                <button
                  onClick={() => onOpenBgcDetail(candidate)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 transition-all shadow-sm cursor-pointer"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  BGC Details & Proofs
                </button>
              )}

              {/* Trigger On-Offer Invoice */}
              <button
                onClick={() => onGenerateInvoice(candidate)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border border-slate-200 transition-all shadow-sm cursor-pointer"
              >
                <Receipt className="h-3.5 w-3.5 text-blue-600" />
                Generate On-Offer Invoice (MCP)
                <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Installment Table */}
          <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 text-[11px] font-bold border-b border-slate-200">
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
              <tbody className="divide-y divide-slate-100">
                {installments.map((inst) => {
                  const isPaid = inst.status === 'PAID';
                  const isOverdue = inst.status === 'OVERDUE';

                  return (
                    <tr key={inst.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">#{inst.number}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-md font-bold ${
                            inst.tier === 'UPFRONT'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : inst.tier === 'REMAINING'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {inst.tier === 'UPFRONT'
                            ? 'On-Offer Split'
                            : inst.tier === 'REMAINING'
                            ? 'Monthly Split'
                            : 'Standard'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900 text-sm">${inst.amount.toLocaleString()}</div>
                        {inst.deduction && (
                          <div className="text-[10px] text-amber-700 font-bold flex items-center gap-1 mt-0.5">
                            <span>-${inst.deduction.amount.toLocaleString()}</span>
                            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] uppercase font-bold">
                              {inst.deduction.type.replace('_', ' ')}
                            </span>
                          </div>
                        )}
                        {inst.netCollectedAmount !== undefined && (
                          <div className="text-[10px] text-emerald-700 font-extrabold mt-0.5">
                            Net: ${inst.netCollectedAmount.toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-800 flex items-center gap-1.5 font-medium">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        {inst.dueDate}
                        {inst.dueDateIsManual && (
                          <span className="text-[9px] text-amber-600 font-bold ml-1">(Manual)</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500 font-medium">{inst.paidDate || '—'}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isPaid
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : isOverdue
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
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
                      <td className="py-3.5 px-4">
                        {inst.invoiceNumber ? (
                          <span className="text-[11px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-bold">
                            {inst.invoiceNumber} ({inst.invoiceStatus})
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Pending</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        {inst.reminderStatus === 'SENT' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                            <Mail className="h-2.5 w-2.5" /> Sent
                          </span>
                        ) : (inst.reminderDate || inst.reminderScheduledFor) ? (
                          <span className="text-slate-500">T-3: {inst.reminderDate || inst.reminderScheduledFor}</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isPaid && onSendReminder && (
                            <button
                              onClick={() => onSendReminder(candidate, inst)}
                              className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all text-[11px] flex items-center gap-1 shadow-sm cursor-pointer"
                              title="Send payment reminder email with custom payment link via Gmail"
                            >
                              <Mail className="h-3 w-3" />
                              Send Link
                            </button>
                          )}
                          {!isPaid && (
                            <button
                              onClick={() => onMarkPaid(candidate, inst)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all text-[11px] shadow-sm cursor-pointer"
                            >
                              Mark Paid
                            </button>
                          )}
                          {userRole === 'ADMIN' && isPaid && onUnmarkPaid && (
                            <button
                              onClick={() => onUnmarkPaid(candidate, inst)}
                              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition-all text-[10px] flex items-center gap-1 cursor-pointer"
                              title="Revert payment to pending (Requires reason)"
                            >
                              <Undo2 className="h-3 w-3" />
                              Unmark
                            </button>
                          )}
                          <button
                            onClick={() => onEditInst(candidate, inst)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition-all cursor-pointer"
                            title="Edit amount or date (Enforces min 5-character reason)"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* JOINING DATE MANAGEMENT SECTION (Below Collection Section) */}
          <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/90 text-xs shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/80">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <h4 className="font-extrabold text-slate-900 text-xs tracking-tight">Joining Date Management & Reminders</h4>
              </div>
              {hasJoiningDate ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-300">
                  <CheckCircle2 className="h-3 w-3" /> Status: Updated
                </span>
              ) : candidate.joiningDateStatus === 'TO_BE_UPDATED' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] border border-amber-300">
                  <Clock className="h-3 w-3" /> Status: To Be Updated (Pending Reminder Active)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px]">
                  Status: Pending
                </span>
              )}
            </div>

            {hasJoiningDate && !isEditingJoiningDate ? (
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-emerald-200/80">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <CalendarCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      Official Joining Date: <span className="font-mono text-emerald-700 text-sm">{candidate.joiningDateEndClient}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium">
                      Updated by: <strong>{candidate.joiningDateUpdatedByName || 'System / Onboarding'}</strong>
                      {candidate.joiningDateUpdatedAt && <span> • {new Date(candidate.joiningDateUpdatedAt).toLocaleDateString()}</span>}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditingJoiningDate(true)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all text-xs border border-slate-200 flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit2 className="h-3 w-3" /> Change Joining Date
                </button>
              </div>
            ) : (
              <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">
                    {candidate.joiningDateStatus === 'TO_BE_UPDATED'
                      ? '⚠️ Joining Date marked as Pending – Please provide the finalized joining date.'
                      : 'Joining Date is currently not finalized. Choose an option below:'}
                  </span>
                  {hasJoiningDate && (
                    <button
                      onClick={() => setIsEditingJoiningDate(false)}
                      className="text-[11px] text-slate-500 hover:text-slate-800 font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Option 1: Add Joining Date */}
                  <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-200 space-y-2.5">
                    <span className="font-extrabold text-blue-900 text-xs block">1. Add Joining Date</span>
                    <p className="text-[10px] text-slate-600 leading-tight">
                      Enter the candidate&apos;s joining date. Automatically resolves active pending reminders and logs audit history.
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={joiningDateInput}
                        onChange={(e) => setJoiningDateInput(e.target.value)}
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono font-medium focus:outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={handleSaveJoiningDate}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <Check className="h-3.5 w-3.5" /> Save
                      </button>
                    </div>
                  </div>

                  {/* Option 2: To Be Updated */}
                  <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200 space-y-2.5 flex flex-col justify-between">
                    <div>
                      <span className="font-extrabold text-amber-900 text-xs block">2. To Be Updated</span>
                      <p className="text-[10px] text-amber-800/80 leading-tight">
                        Mark date as pending. Automatically creates a persistent dashboard reminder for follow-up.
                      </p>
                    </div>
                    <button
                      onClick={handleSetToBeUpdated}
                      className="w-full py-1.5 px-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Clock className="h-3.5 w-3.5" /> Mark as To Be Updated
                    </button>
                  </div>
                </div>

                {joiningDateMsg && (
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <span>{joiningDateMsg}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* REFERRAL BONUS & PAYMENT DEDUCTION LEDGER */}
          {((candidate.deductions && candidate.deductions.length > 0) || candidate.referralBonusTotal) && (
            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 text-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-purple-200/80">
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-purple-700" />
                  <h4 className="font-extrabold text-purple-950 text-xs">Referral Bonus & Deduction Ledger</h4>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold text-[10px] border border-purple-300">
                  Total Referral: ${(candidate.referralBonusTotal || 0).toLocaleString()} • Remaining: ${(candidate.referralBonusRemaining ?? 0).toLocaleString()}
                </span>
              </div>

              <div className="space-y-2">
                {candidate.deductions?.map((ded) => (
                  <div key={ded.id} className="p-3 bg-white rounded-xl border border-purple-200/80 flex flex-wrap items-center justify-between gap-2.5 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900">${ded.amount.toLocaleString()}</span>
                        <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-bold">
                          {ded.type.replace('_', ' ')}
                        </span>
                        {ded.allocationStatus && (
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            ded.allocationStatus === 'FULLY_ALLOCATED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {ded.allocationStatus.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Salesperson: <strong>{ded.salesPerson}</strong>
                        {ded.refereeNames && ded.refereeNames.length > 0 && (
                          <span> • Referees: <strong>{ded.refereeNames.join(', ')}</strong></span>
                        )}
                        {ded.remarks && <span> • &ldquo;{ded.remarks}&rdquo;</span>}
                      </div>
                    </div>
                    <div className="text-right text-[10px] text-slate-400">
                      <div>Logged by {ded.createdByName}</div>
                      <div>{new Date(ded.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer (Sticky / Fixed at Bottom) */}
        <div className="px-7 py-4 border-t border-slate-200 bg-slate-50/90 flex items-center justify-between text-xs text-slate-500 flex-shrink-0">
          <span>
            Candidate ID: <span className="font-mono text-slate-700 font-semibold">{candidate.id}</span>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-all border border-slate-300 cursor-pointer"
          >
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
};
