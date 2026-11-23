'use client';

import React, { useState } from 'react';
import { Trash2, X, ShieldAlert, AlertCircle } from 'lucide-react';
import { CandidateRecord } from '../types';

interface DeleteCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: CandidateRecord | null;
  onConfirmDelete: (candidateId: string) => Promise<void> | void;
}

export const DeleteCandidateModal: React.FC<DeleteCandidateModalProps> = ({
  isOpen,
  onClose,
  candidate,
  onConfirmDelete,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !candidate) return null;

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      await onConfirmDelete(candidate.id);
      setIsDeleting(false);
      onClose();
    } catch (e) {
      console.error('Delete failed:', e);
      setIsDeleting(false);
    }
  };

  const initialLetter = (candidate.candidateName || 'C').charAt(0).toUpperCase();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/45 dark:bg-slate-950/45 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white/95 dark:bg-[#0b1329]/95 backdrop-blur-2xl border border-white/90 dark:border-slate-800/80 rounded-[32px] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.14)] p-7 overflow-hidden text-slate-900 dark:text-white animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Soft Ambient Rose Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-40 bg-gradient-to-b from-rose-500/20 to-transparent rounded-full blur-2xl pointer-events-none" />

        {/* Header Bar */}
        <div className="flex items-center justify-between mb-5 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 rounded-2xl bg-rose-500/30 blur-md animate-pulse" />
              <div className="relative h-12 w-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-600/30">
                <Trash2 className="h-6 w-6" />
              </div>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400">
                Permanent Action
              </span>
              <h3 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                Delete Candidate Record
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Candidate Detail Card */}
        <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 text-xs shadow-inner">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-cyan-300 flex items-center justify-center font-black text-sm flex-shrink-0">
                {initialLetter}
              </div>
              <div className="min-w-0">
                <div className="text-base font-black text-slate-900 dark:text-white truncate">
                  {candidate.candidateName}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                  Client: <strong className="text-slate-800 dark:text-slate-200">
                    {(candidate.clientEmployerName && candidate.clientEmployerName !== 'Client US' && candidate.clientEmployerName !== 'NetBounce Client')
                      ? candidate.clientEmployerName
                      : (candidate.endClient && candidate.endClient !== 'Client US' && candidate.endClient !== 'NetBounce Client' ? candidate.endClient : '—')}
                  </strong>
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/80 flex-shrink-0">
              {candidate.bgcOfferStatus || 'INITIATED'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block">Job Role</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                {candidate.jobRole || 'Full Stack Engineer'}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block">Sales Person</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                {candidate.salesPerson || 'Sales'}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block">Upfront Amount</span>
              <span className="font-bold text-blue-600 dark:text-cyan-400 font-tabular block">
                ${(candidate.upfrontAmount ?? 2000).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block">BGC / Offer Amount</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 font-tabular block">
                ${(candidate.bgcOfferAmount ?? 2500).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Warning Note */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 my-4 px-1">
          <ShieldAlert className="h-4 w-4 text-rose-500 dark:text-rose-400 flex-shrink-0" />
          <span>This will permanently delete this record from the cloud database across all users.</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold text-xs transition-all cursor-pointer border border-slate-200/80 dark:border-slate-700/80 active:scale-98"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 active:scale-98 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-600/25 cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Yes, Delete Record
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
