'use client';

import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { Installment, CandidateRecord } from '../types';

interface MarkPaidModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: CandidateRecord | null;
  installment: Installment | null;
  onConfirmPaid: (candidateId: string, installmentId: string, paidDate: string) => void;
}

export const MarkPaidModal: React.FC<MarkPaidModalProps> = ({
  isOpen,
  onClose,
  candidate,
  installment,
  onConfirmPaid,
}) => {
  const today = new Date().toISOString().split('T')[0];
  const [paidDate, setPaidDate] = useState<string>(today);
  const [error, setError] = useState<string>('');

  if (!isOpen || !candidate || !installment) return null;

  const handleConfirm = () => {
    if (!paidDate) {
      setError('Please select a valid paid date.');
      return;
    }
    if (paidDate > today) {
      setError('Paid date cannot be in the future.');
      return;
    }

    setError('');
    onConfirmPaid(candidate.id, installment.id, paidDate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#0d1424] border border-emerald-500/30 rounded-3xl shadow-[0_25px_80px_rgba(16,185,129,0.15)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Record Payment Collection</h2>
              <p className="text-[11px] text-emerald-400">Installment #{installment.number}</p>
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
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Candidate:</span>
              <span className="font-semibold text-white">{candidate.candidateName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Amount Due:</span>
              <span className="font-bold text-emerald-400 text-sm">${installment.amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Scheduled Due Date:</span>
              <span className="text-slate-300 font-mono">{installment.dueDate}</span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-emerald-400" />
              Actual Payment Received Date *
            </label>
            <input
              type="date"
              max={today}
              value={paidDate}
              onChange={(e) => setPaidDate(e.target.value)}
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 text-xs font-mono"
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
            onClick={handleConfirm}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 text-xs font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all"
          >
            <CheckCircle className="h-4 w-4" />
            Confirm Payment Received
          </button>
        </div>
      </div>
    </div>
  );
};

