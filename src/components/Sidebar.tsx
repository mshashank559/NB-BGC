'use client';

import React from 'react';
import {
  LayoutDashboard,
  Users,
  FilePlus2,
  Wallet,
  Receipt,
  BellRing,
  FileSpreadsheet,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  userRole: UserRole;
  onOpenNewPoModal: () => void;
  onOpenReportsModal: () => void;
  onOpenAuditModal: () => void;
  pendingCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  userRole,
  onOpenNewPoModal,
  onOpenReportsModal,
  onOpenAuditModal,
  pendingCount = 1,
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, roleAccess: ['ADMIN', 'COMPLIANCE_MANAGER', 'ACCOUNT_MANAGER'] },
    { id: 'candidates', label: 'Candidates & POs', icon: Users, roleAccess: ['ADMIN', 'COMPLIANCE_MANAGER', 'ACCOUNT_MANAGER'], badge: '5' },
    { id: 'new-po', label: 'New PO Form', icon: FilePlus2, roleAccess: ['ADMIN', 'COMPLIANCE_MANAGER'], isAction: true },
    { id: 'collection', label: 'Collection Hub', icon: Wallet, roleAccess: ['ADMIN', 'ACCOUNT_MANAGER'], alertBadge: pendingCount > 0 ? `${pendingCount}` : undefined },
    { id: 'invoices', label: 'MCP Invoices', icon: Receipt, roleAccess: ['ADMIN', 'COMPLIANCE_MANAGER', 'ACCOUNT_MANAGER'] },
    { id: 'reminders', label: 'Reminders Log', icon: BellRing, roleAccess: ['ADMIN', 'ACCOUNT_MANAGER'] },
    { id: 'reports', label: 'Admin Reports & Audit', icon: FileSpreadsheet, roleAccess: ['ADMIN'] },
    { id: 'settings', label: 'System Settings', icon: Settings, roleAccess: ['ADMIN'] },
  ];

  return (
    <aside className="w-16 sm:w-64 border-r border-white/5 bg-[#0e1626]/80 backdrop-blur-2xl p-4 flex flex-col justify-between select-none">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-3 mb-6">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(0,242,254,0.35)] shrink-0">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-bold text-sm tracking-wide text-white leading-tight">Candidate Compliance</h1>
            <p className="text-[11px] text-cyan-400 font-medium tracking-wider uppercase">& Payments Engine</p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isAccessible = item.roleAccess.includes(userRole);
            if (!isAccessible) return null;

            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'new-po') {
                    onOpenNewPoModal();
                  } else if (item.id === 'reports') {
                    onOpenReportsModal();
                  } else {
                    onSelectTab(item.id);
                  }
                }}
                className={`w-full group flex items-center justify-between px-3 py-2.5 rounded-2xl transition-all duration-200 text-left ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,242,254,0.15)] font-medium'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span className="hidden sm:inline text-xs font-medium tracking-wide">{item.label}</span>
                </div>

                {/* Optional Badges */}
                {item.badge && (
                  <span className="hidden sm:inline text-[10px] bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded-full border border-white/5">
                    {item.badge}
                  </span>
                )}
                {item.alertBadge && (
                  <span className="hidden sm:inline text-[10px] bg-rose-500/20 text-rose-300 font-bold px-2 py-0.5 rounded-full border border-rose-500/30 animate-pulse">
                    {item.alertBadge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Role Indicator Footer */}
      <div className="pt-4 border-t border-white/5 hidden sm:block">
        <div className="bg-slate-900/60 rounded-2xl p-3 border border-white/5">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-slate-400">Current Scope</span>
            <span className="text-cyan-400 font-semibold uppercase">{userRole.replace('_', ' ')}</span>
          </div>
          <p className="text-[10px] text-slate-500">
            {userRole === 'ADMIN'
              ? 'Full oversight & audit control'
              : userRole === 'COMPLIANCE_MANAGER'
              ? 'PO Form entry & own drafts'
              : 'Collections & installment tracker'}
          </p>
        </div>
      </div>
    </aside>
  );
};

