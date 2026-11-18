'use client';

import React, { useState } from 'react';
import { X, FileSpreadsheet, FileText, Download, ShieldCheck, CheckCircle2, Lock, AlertCircle } from 'lucide-react';
import { CandidateRecord, AuditEntry, UserRole } from '../types';
import { exportExcelReport, exportPdfReport } from '../lib/reportGenerator';

interface ReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidates: CandidateRecord[];
  auditEntries?: AuditEntry[];
  userRole?: UserRole;
}

export const ReportsModal: React.FC<ReportsModalProps> = ({
  isOpen,
  onClose,
  candidates,
  auditEntries,
  userRole = 'ADMIN',
}) => {
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const isAdmin = userRole === 'ADMIN';

  const handleExcel = async () => {
    if (!isAdmin) {
      setErrorMsg('Access Denied: Only Admin users are authorized to download CRM reports.');
      setTimeout(() => setErrorMsg(''), 4000);
      return;
    }
    try {
      setIsExportingExcel(true);
      setErrorMsg('');
      await exportExcelReport(candidates, auditEntries, userRole);
      setSuccessMsg('Excel report successfully generated & downloaded.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || 'Error generating Excel report.');
      setTimeout(() => setErrorMsg(''), 4000);
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handlePdf = async () => {
    if (!isAdmin) {
      setErrorMsg('Access Denied: Only Admin users are authorized to download CRM reports.');
      setTimeout(() => setErrorMsg(''), 4000);
      return;
    }
    try {
      setIsExportingPdf(true);
      setErrorMsg('');
      await exportPdfReport(candidates, auditEntries, userRole);
      setSuccessMsg('PDF summary successfully generated & downloaded.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || 'Error generating PDF report.');
      setTimeout(() => setErrorMsg(''), 4000);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-2xl border border-white/80 rounded-[28px] shadow-[0_25px_60px_rgba(15,23,42,0.15)] overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-slate-900">
        {/* Header */}
        <div className="px-6 py-5 border-b border-black/[0.06] flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-blue-50 border border-blue-200/70 flex items-center justify-center text-blue-600 shadow-xs">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">Compliance & Accounting Reports</h2>
              <p className="text-[11px] text-slate-500 font-medium">PII-Compliant Monthly Exports</p>
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
          {!isAdmin && (
            <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-4 flex items-start gap-3 text-amber-900 shadow-xs">
              <div className="h-8 w-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 flex-shrink-0 mt-0.5">
                <Lock className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-extrabold text-xs text-amber-950">Export Restricted to Admin Role</h4>
                <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                  Your current account role (<strong>{userRole}</strong>) allows viewing ledger and reporting data, but exporting datasets, Excel, and PDF files is strictly restricted to Administrator accounts.
                </p>
              </div>
            </div>
          )}

          <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/70 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Automatic PII Redaction Guaranteed</span>
            </div>
            <p className="text-emerald-700 text-[11px] leading-relaxed font-medium">
              Exported files automatically strip personal phone numbers and private email addresses. Only professional placement, client, and financial installment schedules are retained for internal audit and accounting purposes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Excel Export */}
            <div className={`p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex flex-col justify-between space-y-3 transition-all shadow-xs ${isAdmin ? 'hover:border-emerald-500/50 hover:bg-emerald-50/30' : 'opacity-70'}`}>
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <FileSpreadsheet className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Excel (.xlsx)</h4>
                  <p className="text-[10px] text-slate-500 font-medium">Full reconciliation table</p>
                </div>
              </div>
              <button
                onClick={handleExcel}
                disabled={isExportingExcel || !isAdmin}
                title={!isAdmin ? 'Admin privilege required to download' : 'Download Excel report'}
                className={`w-full py-2 px-3 rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-1.5 shadow-xs ${
                  isAdmin
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                }`}
              >
                {!isAdmin ? (
                  <>
                    <Lock className="h-3.5 w-3.5" />
                    Admin Only
                  </>
                ) : (
                  <>
                    <Download className="h-3.5 w-3.5" />
                    {isExportingExcel ? 'Generating...' : 'Download Excel'}
                  </>
                )}
              </button>
            </div>

            {/* PDF Export */}
            <div className={`p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex flex-col justify-between space-y-3 transition-all shadow-xs ${isAdmin ? 'hover:border-rose-500/50 hover:bg-rose-50/30' : 'opacity-70'}`}>
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">PDF Summary</h4>
                  <p className="text-[10px] text-slate-500 font-medium">Management memo</p>
                </div>
              </div>
              <button
                onClick={handlePdf}
                disabled={isExportingPdf || !isAdmin}
                title={!isAdmin ? 'Admin privilege required to download' : 'Download PDF summary'}
                className={`w-full py-2 px-3 rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-1.5 shadow-xs ${
                  isAdmin
                    ? 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                }`}
              >
                {!isAdmin ? (
                  <>
                    <Lock className="h-3.5 w-3.5" />
                    Admin Only
                  </>
                ) : (
                  <>
                    <Download className="h-3.5 w-3.5" />
                    {isExportingPdf ? 'Generating...' : 'Download PDF'}
                  </>
                )}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] font-medium">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px] font-medium">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-black/[0.06] bg-slate-50/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all border border-slate-200/80 text-xs shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
