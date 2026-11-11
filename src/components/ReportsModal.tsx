'use client';

import React, { useState } from 'react';
import { X, FileSpreadsheet, Download, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';
import { CandidateRecord, AuditEntry } from '../types';
import { generateMonthlyExcelReport, generateMonthlyPdfReport } from '../lib/reportGenerator';

interface ReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidates: CandidateRecord[];
  auditEntries: AuditEntry[];
}

export const ReportsModal: React.FC<ReportsModalProps> = ({
  isOpen,
  onClose,
  candidates,
  auditEntries,
}) => {
  const [selectedMonth, setSelectedMonth] = useState('October');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string>('');

  if (!isOpen) return null;

  const handleDownloadExcel = async () => {
    setIsGenerating(true);
    setDownloadSuccess('');
    try {
      const buffer = await generateMonthlyExcelReport({
        month: selectedMonth,
        year: Number(selectedYear),
        candidates,
        auditEntries,
      });

      const blob = new Blob([buffer as any], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Compliance_Report_${selectedMonth}_${selectedYear}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloadSuccess('Excel report generated and downloaded successfully!');
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPdf = async () => {
    setIsGenerating(true);
    setDownloadSuccess('');
    try {
      const pdfBytes = await generateMonthlyPdfReport({
        month: selectedMonth,
        year: Number(selectedYear),
        candidates,
        auditEntries,
      });

      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Compliance_Report_${selectedMonth}_${selectedYear}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloadSuccess('PDF report generated and downloaded successfully!');
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#0d1424] border border-cyan-500/30 rounded-3xl shadow-[0_30px_100px_rgba(0,0,0,0.95)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Admin Monthly Compliance & Financial Reports</h2>
              <p className="text-[11px] text-cyan-400 font-medium">Export Complete Operational & Audit Records</p>
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
          {/* Month & Year Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Select Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
              >
                {[
                  'January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'
                ].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Select Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
              >
                {['2025', '2026', '2027'].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-slate-300 flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-[11px]">
              <p className="font-semibold text-cyan-300 mb-0.5">Privacy & Compliance Enforced</p>
              <p className="text-slate-400">
                Personal emails and personal phone numbers are automatically stripped from exported files as per Section 12 privacy rules.
              </p>
            </div>
          </div>

          {/* Download Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-rose-500/20 hover:border-rose-500/40 text-rose-300 font-bold transition-all shadow-spatial-card"
            >
              <FileText className="h-4 w-4 text-rose-400" />
              Download PDF Report
            </button>

            <button
              onClick={handleDownloadExcel}
              disabled={isGenerating}
              className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-300 font-bold transition-all shadow-spatial-card"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
              Download Excel Report
            </button>
          </div>

          {downloadSuccess && (
            <p className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {downloadSuccess}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-slate-900/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

