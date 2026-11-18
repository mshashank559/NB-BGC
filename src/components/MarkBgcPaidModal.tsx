'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Upload, FileText, Image as ImageIcon, Trash2, AlertCircle, DollarSign, Calendar, ShieldCheck } from 'lucide-react';
import { CandidateRecord } from '../types';

interface MarkBgcPaidModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: CandidateRecord | null;
  onConfirmBgcPayment: (
    candidateId: string,
    paidDate: string,
    remarks: string,
    proofFile?: { name: string; dataUrl: string; size: string; type: string }
  ) => void;
}

export const MarkBgcPaidModal: React.FC<MarkBgcPaidModalProps> = ({
  isOpen,
  onClose,
  candidate,
  onConfirmBgcPayment,
}) => {
  const [paidDate, setPaidDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState<string>('');
  const [uploadedProof, setUploadedProof] = useState<{
    name: string;
    dataUrl: string;
    size: string;
    type: string;
  } | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setPaidDate(new Date().toISOString().split('T')[0]);
      setRemarks(candidate?.bgcPaymentRemarks || '');
      if (candidate?.bgcPaymentProofName && candidate?.bgcPaymentProofDataUrl) {
        setUploadedProof({
          name: candidate.bgcPaymentProofName,
          dataUrl: candidate.bgcPaymentProofDataUrl,
          size: candidate.bgcPaymentProofSize || '120 KB',
          type: candidate.bgcPaymentProofType || 'image/png',
        });
      } else {
        setUploadedProof(null);
      }
      setError('');
    }
  }, [isOpen, candidate]);

  if (!isOpen || !candidate) return null;

  const bgcAmount = candidate.bgcOfferAmount ?? 2500;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setError('File size exceeds 15 MB limit. Please upload a smaller screenshot or document.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const sizeFormatted = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

      setUploadedProof({
        name: file.name,
        dataUrl,
        size: sizeFormatted,
        type: file.type,
      });
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remarks || remarks.trim().length < 5) {
      setError('Mandatory remark required (min 5 characters) explaining payment clearance or transaction reference.');
      return;
    }

    onConfirmBgcPayment(candidate.id, paidDate, remarks.trim(), uploadedProof || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-900 dark:text-white">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">Record BGC Payment Clearance</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Attach proof & remarks for Accountant verification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Candidate & Amount Summary */}
          <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Candidate</span>
              <p className="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5">{candidate.candidateName}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Lead: {candidate.teamLead || 'Rudra'} • PO: {candidate.poType || '1 st'}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">BGC / Offer Amount</span>
              <p className="font-black text-xl text-emerald-600 dark:text-emerald-400 mt-0.5">${bgcAmount.toLocaleString()}</p>
            </div>
          </div>

          {/* Payment Receipt Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
              Payment Receipt Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={paidDate}
              onChange={(e) => setPaidDate(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Mandatory Remarks */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Mandatory Remark / Transaction Ref <span className="text-rose-500">*</span></span>
              <span className="text-[10px] text-slate-400">Min 5 chars</span>
            </label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => {
                setRemarks(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Received via Zelle / Wire Ref #99214. Verified with bank statement."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Attachment / Proof Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                Upload Payment Proof (Screenshot, PDF, Doc, Excel)
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Accountant Verification Proof</span>
            </label>

            {uploadedProof ? (
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  {uploadedProof.type.startsWith('image/') ? (
                    <img
                      src={uploadedProof.dataUrl}
                      alt="Proof Preview"
                      className="w-10 h-10 object-cover rounded-lg border border-slate-200 dark:border-slate-700 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-cyan-400 flex-shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{uploadedProof.name}</p>
                    <p className="text-[10px] text-slate-400">{uploadedProof.size}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setUploadedProof(null)}
                  title="Remove File"
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-cyan-400 rounded-2xl cursor-pointer bg-slate-50/50 dark:bg-slate-800/40 transition-colors group">
                <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-cyan-400 mb-1 transition-colors" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Click to upload Screenshot or Document</span>
                <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, PDF, XLSX, CSV, DOC up to 15MB</span>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv"
                  className="hidden"
                />
              </label>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirm & Settle BGC Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
