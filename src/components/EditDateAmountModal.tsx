'use client';

import React, { useState } from 'react';
import { X, Edit3, AlertCircle, AlertTriangle } from 'lucide-react';
import { Installment, CandidateRecord } from '../types';

interface EditDateAmountModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: CandidateRecord | null;
  installment: Installment | null;
  onConfirmEdit?: (
    candidateId: string,
    installmentId: string,
    newAmount: number,
    newDueDate: string,
    remark: string
  ) => void;
  onSaveEdit?: (
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
  onConfirmEdit,
  onSaveEdit,
}) => {
  if (!isOpen || !candidate || !installment) return null;

  const [amount, setAmount] = useState<number>(installment.amount);
  const [dueDate, setDueDate] = useState<string>(installment.dueDate);
  const [remark, setRemark] = useState<string>('');
  const [error, setError] = useState<string>('');

  const totalAgreed = candidate.paymentPlan?.totalPayable || candidate.upfrontAmount;
  const currentTotal = (candidate.paymentPlan?.installments || []).reduce(
    (sum, inst) => (inst.id === installment.id ? sum + amount : sum + inst.amount),
    0
  );
  const hasMismatch = Math.abs(currentTotal - totalAgreed) > 0.01;

  const handleSave = () => {
    if (amount <= 0) {
      setError('Installment amount must be greater than $0.');
      return;
    }
    if (!dueDate) {
      setError('Please provide a valid due date.');
      return;
    }
    if (!remark || remark.trim().length < 5) {
      setError('Mandatory audit compliance rule: A reason of at least 5 characters is required.');
      return;
    }

    setError('');
    const saveFn = onSaveEdit || onConfirmEdit;
    if (saveFn) {
      saveFn(candidate.id, installment.id, amount, dueDate, remark.trim());
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-2xl border border-white/80 rounded-[30px] shadow-[0_20px_50px_rgba(15,23,42,0.15)] overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-slate-900">
        {/* Header */}
        <div className="px-6 py-4 border-b border-black/[0.06] flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-blue-50 border border-blue-200/70 flex items-center justify-center text-blue-600 shadow-xs">
              <Edit3 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">Edit Installment Slot #{installment.number}</h2>
              <p className="text-[11px] text-slate-500 font-medium">Mandatory Audit Rule: Reason &gt;= 5 chars</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200/80 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Installment Amount ($) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={amount === 0 ? '' : amount}
                onChange={(e) => {
                  const clean = e.target.value.replace(/^0+(?=\d)/, '');
                  setAmount(clean === '' ? 0 : parseFloat(clean));
                }}
                className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono shadow-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Due Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono shadow-xs"
              />
            </div>
          </div>

          {/* Balance Mismatch Alert */}
          {hasMismatch && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px] flex items-start gap-2 shadow-xs">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-600" />
              <div>
                <strong>Balance Mismatch Alert:</strong> Total sum of installments is now{' '}
                <span className="font-mono font-bold">${currentTotal.toLocaleString()}</span>, but total payable agreed is{' '}
                <span className="font-mono font-bold">${totalAgreed.toLocaleString()}</span> (Difference: ${(
                  currentTotal - totalAgreed
                ).toLocaleString()}).
              </div>
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Mandatory Reason / Remark <span className="text-rose-500">*</span>
              </label>
              <span
                className={`text-[10px] font-mono font-bold ${
                  remark.trim().length >= 5 ? 'text-emerald-600' : 'text-slate-400'
                }`}
              >
                {remark.trim().length}/5 chars min
              </span>
            </div>
            <textarea
              rows={3}
              placeholder="e.g. Approved extension by management due to delayed client invoicing."
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="w-full bg-white border border-slate-200/80 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none shadow-xs"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              * This reason will be permanently sealed into the system&apos;s immutable audit trail with your timestamp.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-[11px]">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-black/[0.06] bg-slate-50/60 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-all border border-slate-200/80 text-xs shadow-xs"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={remark.trim().length < 5}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold transition-all text-xs flex items-center gap-1.5 shadow-[0_4px_16px_rgba(37,99,235,0.25)]"
          >
            Save Adjustment
          </button>
        </div>
      </div>
    </div>
  );
};
