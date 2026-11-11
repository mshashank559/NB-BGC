'use client';

import React from 'react';
import { X, History, Shield, Calendar, Search } from 'lucide-react';
import { AuditEntry } from '../types';

interface AuditTrailModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditEntries: AuditEntry[];
}

export const AuditTrailModal: React.FC<AuditTrailModalProps> = ({
  isOpen,
  onClose,
  auditEntries,
}) => {
  const [filterCandidate, setFilterCandidate] = React.useState('');

  if (!isOpen) return null;

  const filteredEntries = auditEntries.filter((entry) => {
    if (!filterCandidate.trim()) return true;
    const q = filterCandidate.toLowerCase();
    return (
      entry.candidateName.toLowerCase().includes(q) ||
      entry.field.toLowerCase().includes(q) ||
      entry.userName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0d1424] border border-white/10 rounded-3xl shadow-[0_30px_100px_rgba(0,0,0,0.95)] max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Master System Audit Trail</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                  Append-Only & Immutable
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">Admin oversight of every date, amount & condition modification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="px-6 py-3 border-b border-white/5 bg-slate-900/40 flex items-center justify-between">
          <div className="relative w-64">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by candidate or field..."
              value={filterCandidate}
              onChange={(e) => setFilterCandidate(e.target.value)}
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <span className="text-[11px] text-slate-400">
            Showing <strong className="text-white">{filteredEntries.length}</strong> recorded modifications
          </span>
        </div>

        {/* Table Body */}
        <div className="p-6 overflow-y-auto max-h-[65vh]">
          {filteredEntries.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No audit entries recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-white/10 transition-all text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{entry.candidateName}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-950/60 text-cyan-300 border border-cyan-500/20 font-mono">
                        {entry.field}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(entry.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-white/5 text-[11px]">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">Old Value</span>
                      <span className="font-mono text-rose-300">{entry.oldValue || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">New Value</span>
                      <span className="font-mono text-emerald-300">{entry.newValue}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <p className="text-slate-300 text-xs italic">
                      <strong className="text-amber-400 not-italic font-semibold mr-1">Mandatory Remark:</strong>
                      "{entry.remark}"
                    </p>
                    <span className="text-[10px] text-slate-400">
                      Modified by <strong className="text-slate-200">{entry.userName}</strong> ({entry.roleAtTime})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

