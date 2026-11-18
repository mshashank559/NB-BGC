'use client';

import React, { useState } from 'react';
import { Trash2, AlertTriangle, X, ShieldAlert, Check } from 'lucide-react';
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white dark:bg-[#0f172a] border border-rose-200 dark:border-rose-900/60 rounded-3xl shadow-2xl overflow-hidden text-slate-900 dark:text-white p-6 sm:p-7 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Rose Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-500/10 dark:bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Icon & Close */}
        <div className="flex items-start justify-between mb-4">
          <div className="h-12 w-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-sm">
            <Trash2 className="h-6 w-6" />
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Title & Description */}
        <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
          Delete Candidate Record?
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
          Are you sure you want to permanently delete{' '}
          <strong className="text-rose-600 dark:text-rose-400 font-extrabold">{candidate.candidateName}</strong>?
          This action will completely remove this candidate, all BGC details, and installment schedules from the cloud database.
        </p>

        {/* Candidate Summary Card */}
        <div className="my-4 p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/50 text-xs">
          <div className="flex justify-between items-center py-1 border-b border-rose-200/50 dark:border-rose-900/40">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Client / Employer</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
              {candidate.clientEmployerName || candidate.endClient || '—'}
            </span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-rose-200/50 dark:border-rose-900/40">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Role & Sales</span>
            <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[180px]">
              {candidate.jobRole || '—'} ({candidate.salesPerson || 'Sales'})
            </span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-slate-500 dark:text-slate-400 font-medium">BGC Status</span>
            <span className="px-2 py-0.5 rounded-md font-extrabold text-[10px] bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300">
              {candidate.bgcOfferStatus || 'INITIATED'}
            </span>
          </div>
        </div>

        {/* Warning Note */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[11px] mb-5 font-medium">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
          <span>This action is immediate and cannot be recovered.</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-extrabold text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-rose-600/25 cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5" />
                Yes, Delete Record
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
