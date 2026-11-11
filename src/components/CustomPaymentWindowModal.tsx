'use client';

import React, { useState } from 'react';
import { X, Sliders, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import { CandidateRecord } from '../types';
import { generateCustomSplitInstallments } from '../lib/paymentEngine';

interface CustomPaymentWindowModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: CandidateRecord | null;
  onApplyCustomPlan: (
    candidateId: string,
    onOfferCount: number,
    remainingCount: number,
    remark: string
  ) => void;
}

export const CustomPaymentWindowModal: React.FC<CustomPaymentWindowModalProps> = ({
  isOpen,
  onClose,
  candidate,
  onApplyCustomPlan,
}) => {
  const [onOfferCount, setOnOfferCount] = useState<number>(2); // 2 or 3
  const [remainingCount, setRemainingCount] = useState<number>(5); // 5 or 6
  const [remark, setRemark] = useState<string>('');
  const [error, setError] = useState<string>('');

  if (!isOpen || !candidate) return null;

  const totalPayable = candidate.paymentPlan?.totalPayable || candidate.upfrontAmount || 8400;
  const upfrontAmount = candidate.upfrontAmount || 2000;

  // Preview generated installments dynamically
  const previewInstallments = generateCustomSplitInstallments(
    totalPayable,
    upfrontAmount,
    onOfferCount,
    remainingCount,
    candidate.joiningDateEndClient,
    candidate.paymentPlan?.cycleGapDays || 30
  );

  const handleSave = () => {
    if (!remark.trim() || remark.trim().length < 5) {
      setError('A mandatory remark with at least 5 characters is required for plan customization.');
      return;
    }
    setError('');
    onApplyCustomPlan(candidate.id, onOfferCount, remainingCount, remark.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0d1424] border border-cyan-500/30 rounded-3xl shadow-[0_25px_80px_rgba(0,242,254,0.15)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Special Payment Window (Custom Schedule)</h2>
              <p className="text-[11px] text-cyan-400 font-medium">Candidate: {candidate.candidateName}</p>
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
        <div className="p-6 space-y-6 text-xs overflow-y-auto max-h-[75vh]">
          {/* Instructions Banner */}
          <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-slate-300">
            <p className="font-semibold text-cyan-300 text-[11px] mb-1">
              Candidate Flexibility Customization
            </p>
            <p className="text-[11px] text-slate-400">
              Customize the schedule to split the On-Offer amount into 2–3 installments, and the remaining balance into 5–6 installments instead of the standard 4-part flat split.
            </p>
          </div>

          {/* Split Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tier 1: On-Offer Installments */}
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Tier 1: On-Offer Amount</span>
              <p className="text-lg font-bold text-white mt-1">${upfrontAmount.toLocaleString()}</p>
              <div className="mt-3">
                <label className="block text-[11px] text-slate-400 mb-1.5">Number of On-Offer Installments</label>
                <div className="flex gap-2">
                  {[2, 3].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setOnOfferCount(count)}
                      className={`flex-1 py-2 rounded-xl font-bold text-xs transition-all ${
                        onOfferCount === count
                          ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-[0_0_15px_rgba(0,242,254,0.3)]'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {count} Installments
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tier 2: Remaining Balance */}
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Tier 2: Remaining Balance</span>
              <p className="text-lg font-bold text-white mt-1">
                ${Math.max(0, totalPayable - upfrontAmount).toLocaleString()}
              </p>
              <div className="mt-3">
                <label className="block text-[11px] text-slate-400 mb-1.5">Number of Remaining Installments</label>
                <div className="flex gap-2">
                  {[5, 6].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setRemainingCount(count)}
                      className={`flex-1 py-2 rounded-xl font-bold text-xs transition-all ${
                        remainingCount === count
                          ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-[0_0_15px_rgba(0,242,254,0.3)]'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {count} Installments
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Live Schedule Preview */}
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Generated Plan Preview ({previewInstallments.length} Slots Total)
              </span>
              <span className="text-cyan-400 font-bold">${totalPayable.toLocaleString()}</span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {previewInstallments.map((inst) => (
                <div
                  key={inst.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-white/5"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full bg-slate-800 text-slate-300 text-[10px] flex items-center justify-center font-bold">
                      {inst.number}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                        inst.tier === 'UPFRONT'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}
                    >
                      {inst.tier === 'UPFRONT' ? 'On-Offer Part' : 'Monthly Cycle'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-slate-400 text-[11px] flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {inst.dueDate}
                    </span>
                    <span className="font-bold text-white text-xs">${inst.amount.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mandatory Remark Input */}
          <div>
            <label className="block text-[11px] font-bold text-amber-400 mb-1">
              Mandatory Remark (Minimum 5 characters required for audit trail) *
            </label>
            <textarea
              rows={2}
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="e.g. Approved 2 upfront + 5 remaining installments as per special candidate agreement."
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
            />
            {error && (
              <p className="mt-1.5 text-[11px] text-rose-400 flex items-center gap-1 font-medium">
                <AlertCircle className="h-3.5 w-3.5" />
                {error}
              </p>
            )}
          </div>
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
            Apply Custom Schedule
          </button>
        </div>
      </div>
    </div>
  );
};

