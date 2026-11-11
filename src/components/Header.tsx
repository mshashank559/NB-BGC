'use client';

import React from 'react';
import { Search, ShieldAlert, Sparkles, UserCheck, KeyRound } from 'lucide-react';
import { UserRole } from '../types';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  userRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenNewPoModal: () => void;
  onOpenAuditModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  userRole,
  onChangeRole,
  searchQuery,
  onSearchChange,
  onOpenNewPoModal,
  onOpenAuditModal,
}) => {
  return (
    <header className="px-6 py-4 border-b border-white/5 bg-[#0a101b]/70 backdrop-blur-2xl flex flex-wrap items-center justify-between gap-4">
      {/* Center Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 bg-[#070b13]/80 p-1.5 rounded-2xl border border-white/5">
        <button
          onClick={() => onSelectTab('overview')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
            currentTab === 'overview'
              ? 'bg-gradient-to-r from-cyan-500/25 to-blue-500/15 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,242,254,0.2)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Living Dashboard
        </button>

        {userRole !== 'COMPLIANCE_MANAGER' && (
          <button
            onClick={() => onSelectTab('collection')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              currentTab === 'collection'
                ? 'bg-gradient-to-r from-cyan-500/25 to-blue-500/15 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,242,254,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Collection Hub
          </button>
        )}

        <button
          onClick={() => onSelectTab('candidates')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
            currentTab === 'candidates'
              ? 'bg-gradient-to-r from-cyan-500/25 to-blue-500/15 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,242,254,0.2)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Candidate Ledger
        </button>

        {userRole !== 'ACCOUNT_MANAGER' && (
          <button
            onClick={onOpenNewPoModal}
            className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-cyan-300 transition-all flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            PO Detail Form
          </button>
        )}

        {userRole === 'ADMIN' && (
          <button
            onClick={onOpenAuditModal}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              currentTab === 'audit'
                ? 'bg-gradient-to-r from-cyan-500/25 to-blue-500/15 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Audit Trail
          </button>
        )}
      </div>

      {/* Right Section: Search & 1-Click Role Switcher */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidate, client, role..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-56 bg-slate-900/60 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
          />
        </div>

        {/* 1-Click Role Switcher */}
        <div className="flex items-center gap-1 bg-slate-900/90 border border-white/10 p-1 rounded-2xl shadow-inner">
          <div className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-slate-400">
            <KeyRound className="h-3 w-3 text-cyan-400" />
            <span className="hidden lg:inline uppercase tracking-wider text-[10px]">Role:</span>
          </div>

          <button
            onClick={() => onChangeRole('ADMIN')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              userRole === 'ADMIN'
                ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(0,242,254,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Admin
          </button>

          <button
            onClick={() => onChangeRole('COMPLIANCE_MANAGER')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              userRole === 'COMPLIANCE_MANAGER'
                ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(0,242,254,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Compliance
          </button>

          <button
            onClick={() => onChangeRole('ACCOUNT_MANAGER')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              userRole === 'ACCOUNT_MANAGER'
                ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(0,242,254,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Accounts
          </button>
        </div>
      </div>
    </header>
  );
};

