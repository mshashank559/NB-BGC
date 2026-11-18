'use client';

import React, { useState } from 'react';
import { X, Sliders, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { CandidateRecord } from '../types';

interface CustomPaymentWindowModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: CandidateRecord | null;
  onApplyCustomPlan?: (
    candidateId: string,
    onOfferCount: number,
    remainingCount: number,
    remark: string
  ) => void;
  onApplyCustomSplit?: (
    candidateId: string,
    upfrontAmount: number,
    upfrontParts: number,
    remainingParts: number,
    joiningDate: string,
    remark: string
  ) => void;
}

export const CustomPaymentWindowModal: React.FC<CustomPaymentWindowModalProps> = ({
  isOpen,
  onClose,
  candidate,
  onApplyCustomPlan,
  onApplyCustomSplit,
}) => {
  if (!isOpen || !candidate) return null;

  const totalPayable = candidate.paymentPlan?.totalPayable || candidate.upfrontAmount || 8400;

  const [upfrontAmount, setUpfrontAmount] = useState<number>(
    candidate.upfrontAmount > 0 ? candidate.upfrontAmount : Math.round(totalPayable * 0.3)
  );
  const [upfrontParts, setUpfrontParts] = useState<number>(2); // 2 or 3
  const [remainingParts, setRemainingParts] = useState<number>(5); // 5 or 6
  const [joiningDate, setJoiningDate] = useState<string>(
    candidate.joiningDateEndClient || new Date().toISOString().split('T')[0]
  );
  const [remark, setRemark] = useState<string>('');
  const [error, setError] = useState<string>('');

  const remainingBalance = Math.max(0, totalPayable - upfrontAmount);
  const upfrontPerPart = upfrontParts > 0 ? Math.round((upfrontAmount / upfrontParts) * 100) / 100 : 0;
  const remainingPerPart = remainingParts > 0 ? Math.round((remainingBalance / remainingParts) * 100) / 100 : 0;

  const handleApply = () => {
    if (upfrontAmount <= 0) {
      setError('Upfront amount must be greater than $0.');
      return;
    }
    if (upfrontAmount >= totalPayable) {
      setError('Upfront amount must be less than total payable ($' + totalPayable.toLocaleString() + ').');
      return;
    }
    if (!joiningDate) {
      setError('Please provide a valid joining date.');
      return;
    }
    if (!remark || remark.trim().length < 5) {
      setError('Mandatory audit compliance rule: A reason of at least 5 characters is required.');
      return;
    }

    setError('');
    if (onApplyCustomPlan) {
      onApplyCustomPlan(candidate.id, upfrontParts, remainingParts, remark.trim());
    } else if (onApplyCustomSplit) {
      onApplyCustomSplit(
        candidate.id,
        upfrontAmount,
        upfrontParts,
        remainingParts,
        joiningDate,
        remark.trim()
      );
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-white/95 backdrop-blur-2xl border border-white/80 rounded-[32px] shadow-[0_25px_60px_rgba(15,23,42,0.15)] overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-slate-900">
        {/* Header */}
        <div className="px-6 py-5 border-b border-black/[0.06] flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-blue-50 border border-blue-200/70 flex items-center justify-center text-blue-600 shadow-xs">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">Custom Payment Window</h2>
              <p className="text-[11px] text-slate-500 font-medium">2–3 Upfront Installments + 5–6 Remaining Monthly Split</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200/80 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Candidate Overview Card */}
          <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 flex justify-between items-center shadow-xs">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Candidate</span>
              <p className="font-bold text-slate-900 text-sm">{candidate.candidateName}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Agreed</span>
              <p className="font-extrabold text-blue-600 text-base">${totalPayable.toLocaleString()}</p>
            </div>
          </div>

          {/* Upfront Configuration */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-blue-200/70 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span className="font-bold text-slate-900 text-xs">Tier 1: Upfront / On-Offer Split</span>
              </div>
              <span className="text-[11px] font-mono text-blue-600 font-bold">
                ${upfrontAmount.toLocaleString()} ({Math.round((upfrontAmount / totalPayable) * 100)}%)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Upfront Total Amount ($)
                </label>
                <input
                  type="number"
                  min="100"
                  max={totalPayable - 100}
                  step="100"
                  value={upfrontAmount === 0 ? '' : upfrontAmount}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/^0+(?=\d)/, '');
                    setUpfrontAmount(clean === '' ? 0 : parseFloat(clean));
                  }}
                  className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Split into Parts (2 or 3)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setUpfrontParts(2)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      upfrontParts === 2
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    2 Parts
                  </button>
                  <button
                    type="button"
                    onClick={() => setUpfrontParts(3)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      upfrontParts === 3
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    3 Parts
                  </button>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200/60 font-mono flex items-center justify-between">
              <span>{upfrontParts} slots @ ${upfrontPerPart.toLocaleString()} each</span>
              <span className="text-slate-400 text-[10px]">Due before / around joining date</span>
            </div>
          </div>

          {/* Remaining Balance Configuration */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-indigo-200/70 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs">Tier 2: Remaining Balance Monthly Split</span>
              <span className="text-[11px] font-mono text-indigo-600 font-bold">
                ${remainingBalance.toLocaleString()} ({Math.round((remainingBalance / totalPayable) * 100)}%)
              </span>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Split into Months (5 or 6)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRemainingParts(5)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    remainingParts === 5
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  5 Months
                </button>
                <button
                  type="button"
                  onClick={() => setRemainingParts(6)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    remainingParts === 6
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  6 Months
                </button>
              </div>
            </div>

            <div className="text-[11px] text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200/60 font-mono flex items-center justify-between">
              <span>{remainingParts} monthly slots @ ${remainingPerPart.toLocaleString()} each</span>
              <span className="text-slate-400 text-[10px]">30-day recurring cycles</span>
            </div>
          </div>

          {/* Summary Metric */}
          <div className="bg-blue-50/80 border border-blue-200/70 p-3 rounded-2xl flex items-center justify-between text-xs text-blue-700 shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              <span className="font-semibold">Total Slots to be Created:</span>
            </div>
            <strong className="text-slate-900 font-mono text-sm">{upfrontParts + remainingParts} Installment Slots</strong>
          </div>

          {/* Mandatory Reason */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Reason for Custom Schedule <span className="text-rose-500">*</span>
              </label>
              <span
                className={`text-[10px] font-mono font-bold ${
                  remark.trim().length >= 5 ? 'text-emerald-600' : 'text-slate-400'
                }`}
              >
                {remark.trim().length}/5 chars min
              </span>
            </div>
            <input
              type="text"
              placeholder="e.g. Candidate agreed to 2 upfront and 5 monthly post-joining payments."
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-xs"
            />
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
            onClick={handleApply}
            disabled={remark.trim().length < 5}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold transition-all text-xs flex items-center gap-1.5 shadow-[0_4px_16px_rgba(37,99,235,0.25)]"
          >
            Apply Custom Schedule
          </button>
        </div>
      </div>
    </div>
  );
};
