'use client';

import React from 'react';
import { History } from 'lucide-react';
import { UserRole, User } from '../types';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  userRole: UserRole;
  currentUser?: User;
  onChangeRole?: (role: UserRole) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenNewPoModal: () => void;
  onOpenAuditModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  userRole,
  currentUser,
  onChangeRole,
  onOpenNewPoModal,
  onOpenAuditModal,
}) => {
  const cleanName = currentUser?.name
    ? currentUser.name.replace(/\s*\(.*?\)/, '').trim()
    : 'Admin';

  return (
    <header className="py-2 mb-6 flex flex-wrap items-center justify-between gap-4 select-none border-b border-black/[0.04] pb-4">
      {/* Left Title: Personalized Welcome Greeting */}
      <div className="flex items-center gap-3">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
        <h1 className="text-lg font-bold tracking-tight text-slate-900 heading-tight">
          Welcome, <span className="text-blue-600 font-extrabold">{cleanName}</span>
        </h1>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50/70 backdrop-blur-md text-blue-700 font-semibold border border-blue-200/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
          {userRole === 'ADMIN' ? 'Admin Workspace' : userRole === 'COMPLIANCE_MANAGER' ? 'Compliance Desk' : 'Accounts Desk'}
        </span>
      </div>

      {/* Right Action Icons */}
      <div className="flex items-center gap-2.5">
        {/* User Avatar with Initials */}
        <div
          title={currentUser?.name || 'User Profile'}
          className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#111B45] via-[#1E40AF] to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-[0_2px_8px_rgba(17,27,69,0.25)] border border-white/90 cursor-pointer select-none transition-transform hover:scale-105"
        >
          {cleanName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()}
        </div>

        {/* Audit Trail Button */}
        {onOpenAuditModal && (
          <button
            onClick={onOpenAuditModal}
            title="View Full System Audit Trail & History"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 hover:bg-slate-100 border border-slate-200/90 text-slate-700 font-bold text-xs transition-all shadow-xs cursor-pointer ml-1"
          >
            <History className="w-3.5 h-3.5 text-blue-600" />
            <span>Audit Trail</span>
          </button>
        )}
      </div>
    </header>
  );
};
