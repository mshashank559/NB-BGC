'use client';

import React, { useState } from 'react';
import { X, Edit3, Calendar, DollarSign, AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';
import { Installment, CandidateRecord } from '../types';

interface EditDateAmountModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: CandidateRecord | null;
  installment: Installment | null;
  onSaveEdit: (
    candidateId: string,
    installmentId: string,
    newAmount: number,
    newDueDate: string,
    remark: string
  ) => void;
}

export const EditDateAmountModal: React.FC<EditDateAmountModalProps> = ({
  isOpen,
  onClose,
  candidate,
  installment,
  onSaveEdit,
}) => {
  const [amount, setAmount] = useState<number>(installment?.amount || 0);
  const [dueDate, setDueDate] = useState<string>(installment?.dueDate || '');
  const [remark, setRemark] = useState<string>('');
  const [error, setError] = useState<string>('');

  if (!isOpen || !candidate || !installment) return null;

  const totalPayable = candidate.paymentPlan?.totalPayable || 0;
  const currentInstallments = candidate.paymentPlan?.installments || [];

  // Calculate new total if this slot amount is updated
  const otherSum = currentInstallments
    .filter((i) => i.id !== installment.id)
    .reduce((sum, i) => sum + i.amount, 0);
  const projectedTotal = otherSum + (Number(amount) || 0);
  const mismatch = Math.abs(projectedTotal - totalPayable);
  const hasMismatch = mismatch > 0.01;

  const handleSave = () => {
    if (!remark.trim() || remark.trim().length < 5) {
      setError('A mandatory remark with at least 5 characters is required for any date/amount edit.');
      return;
    }
    if (Number(amount) <= 0) {
      setError('Installment amount must be greater than $0.');
      return;
    }
    if (!dueDate) {
      setError('Please select a valid due date.');
      return;
    }
    if (hasMismatch) {
      setError(`Amount mismatch! Total of installments must equal $${totalPayable.toLocaleString()} (Current: $${projectedTotal.toLocaleString()}).`);
      return;
    }

    setError('');
    onSaveEdit(candidate.id, installment.id, Number(amount), dueDate, remark.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#0d1424] border border-cyan-500/30 rounded-3xl shadow-[0_25px_80px_rgba(0,242,254,0.15)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Edit3 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Edit Installment #{installment.number}</h2>
              <p className="text-[11px] text-cyan-400 font-medium">{candidate.candidateName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {/* Amount Input */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5 text-cyan-400" />
              Installment Amount ($) *
            </label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs font-mono"
            />
            {hasMismatch && (
              <p className="mt-1 text-[10px] text-amber-400 font-medium">
                Running Total: ${projectedTotal.toLocaleString()} (Expected: ${totalPayable.toLocaleString()})
              </p>
            )}
          </div>

          {/* Due Date Input */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-cyan-400" />
              Installment Due Date *
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs font-mono"
            />
            <p className="mt-1 text-[10px] text-slate-500">
              Note: Email reminder will automatically reschedule to 2 days prior @ 09:00 IST.
            </p>
          </div>

          {/* Mandatory Remark */}
          <div>
            <label className="block text-[11px] font-bold text-amber-400 mb-1.5">
              Mandatory Remark (Min 5 characters) *
            </label>
            <textarea
              rows={2}
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="e.g. Due date adjusted by 10 days upon candidate request."
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
            />
          </div>

          {error && (
            <p className="text-[11px] text-rose-400 flex items-center gap-1 font-medium bg-rose-500/10 p-2 rounded-xl border border-rose-500/20">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-slate-900/80 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-transparent hover:bg-white/5 text-slate-400 text-xs font-semibold transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 text-xs font-bold shadow-[0_0_20px_rgba(0,242,254,0.3)] transition-all"
          >
            <CheckCircle2 className="h-4 w-4" />
            Save Changes & Log Audit
          </button>
        </div>
      </div>
    </div>
  );
};

