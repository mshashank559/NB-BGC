'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, History, Calendar, User, Search } from 'lucide-react';
import { AuditEntry } from '../types';

interface AuditTrailModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries?: AuditEntry[];
  auditEntries?: AuditEntry[];
  candidateId?: string;
  candidateName?: string;
}

export const AuditTrailModal: React.FC<AuditTrailModalProps> = ({
  isOpen,
  onClose,
  entries,
  auditEntries,
  candidateId,
  candidateName,
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const activeEntries = auditEntries || entries || [];

  const filteredEntries = activeEntries.filter((e) => {
    if (candidateId && e.candidateId !== candidateId) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        e.candidateName.toLowerCase().includes(q) ||
        e.field.toLowerCase().includes(q) ||
        e.remark.toLowerCase().includes(q) ||
        e.userName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-white/95 backdrop-blur-2xl border border-white/80 rounded-[32px] shadow-[0_25px_60px_rgba(15,23,42,0.15)] max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-slate-900">
        {/* Header */}
        <div className="px-6 py-5 border-b border-black/[0.06] flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-blue-50 border border-blue-200/70 flex items-center justify-center text-blue-600 shadow-xs">
              <History className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">System Audit Trail & Compliance Log</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 flex items-center gap-1 shadow-xs">
                  <ShieldCheck className="h-3 w-3 text-emerald-600" />
                  Append-Only
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {candidateName ? `Scoped to candidate: ${candidateName}` : 'Master system audit log (All adjustments & approvals)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200/80 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="px-6 py-3 border-b border-black/[0.06] bg-slate-50/80 flex items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by candidate, field, remark or user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-xs"
            />
          </div>
          <span className="text-[11px] text-slate-500 font-mono font-medium">{filteredEntries.length} immutable entries</span>
        </div>

        {/* Timeline Log List */}
        <div className="p-6 overflow-y-auto space-y-3 max-h-[60vh] text-xs">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              No audit entries recorded matching this query.
            </div>
          ) : (
            filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 hover:border-slate-300 transition-all space-y-2 shadow-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{entry.candidateName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-bold font-mono">
                      {entry.field}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(entry.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* Transition values */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-white p-3 rounded-xl border border-slate-200/80 font-mono shadow-xs">
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider">Previous State</span>
                    <span className="text-rose-600 break-all font-semibold">{entry.oldValue || '— (None / Initial)'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider">Updated State</span>
                    <span className="text-emerald-600 break-all font-semibold">{entry.newValue}</span>
                  </div>
                </div>

                {/* Mandatory Remark */}
                <div className="text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-xs">
                  <strong className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider mb-0.5">
                    Logged Reason (Audit Compliance):
                  </strong>
                  <p className="italic text-slate-800 font-medium">&ldquo;{entry.remark}&rdquo;</p>
                </div>

                {/* Author Info */}
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                  <div className="flex items-center gap-1.5">
                    <User className="h-3 w-3 text-blue-600" />
                    <span>Logged by: <strong className="text-slate-800">{entry.userName}</strong> ({entry.roleAtTime})</span>
                  </div>
                  <span className="font-mono text-slate-400">ID: {entry.id}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-black/[0.06] bg-slate-50/60 flex items-center justify-between text-xs text-slate-500">
          <span className="text-[11px] font-medium">Strict ISO / SOC-2 append-only ledger compliance enforced.</span>
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
