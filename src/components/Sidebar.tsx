'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  LayoutGrid,
  ShieldCheck,
  Power,
  Sparkles,
  Sun,
  Moon,
  History,
  Users,
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
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onLogOut?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  userRole,
  onOpenNewPoModal,
  onOpenReportsModal,
  onOpenAuditModal,
  theme = 'light',
  onToggleTheme,
  onLogOut,
}) => {
  // Active key
  const activeKey =
    currentTab === 'collection' || currentTab === 'candidates'
      ? 'collection'
      : currentTab === 'users'
      ? 'users'
      : 'overview';
  const prevKeyRef = useRef(activeKey);
  const isFirstRender = useRef(true);

  const navRef = useRef<HTMLDivElement>(null);
  const overviewRef = useRef<HTMLButtonElement>(null);
  const collectionRef = useRef<HTMLButtonElement>(null);
  const usersRef = useRef<HTMLButtonElement>(null);

  const [coords, setCoords] = useState<{
    [key: string]: { top: number; height: number; left: number; width: number };
  }>({
    overview: { top: 0, height: 44, left: 0, width: 212 },
    collection: { top: 50, height: 44, left: 0, width: 212 },
    users: { top: 100, height: 44, left: 0, width: 212 },
  });

  const updateMeasurements = () => {
    if (!navRef.current) return;
    const navRect = navRef.current.getBoundingClientRect();
    const updated: any = {};
    if (overviewRef.current) {
      const r = overviewRef.current.getBoundingClientRect();
      updated.overview = {
        top: r.top - navRect.top,
        height: r.height,
        left: r.left - navRect.left,
        width: r.width,
      };
    }
    if (collectionRef.current) {
      const r = collectionRef.current.getBoundingClientRect();
      updated.collection = {
        top: r.top - navRect.top,
        height: r.height,
        left: r.left - navRect.left,
        width: r.width,
      };
    }
    if (usersRef.current) {
      const r = usersRef.current.getBoundingClientRect();
      updated.users = {
        top: r.top - navRect.top,
        height: r.height,
        left: r.left - navRect.left,
        width: r.width,
      };
    }
    if (updated.overview && updated.collection) {
      setCoords(updated);
    }
  };

  useEffect(() => {
    updateMeasurements();
    const t = setTimeout(updateMeasurements, 60);
    window.addEventListener('resize', updateMeasurements);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', updateMeasurements);
    };
  }, [activeKey]);

  useEffect(() => {
    prevKeyRef.current = activeKey;
    isFirstRender.current = false;
  }, [activeKey]);

  const currentCoord = coords[activeKey] || coords.overview;

  // Ultra-fluid, buttery-smooth spring motion with zero stickiness / zero chipakna
  const animateProps = {
    top: currentCoord.top,
    height: currentCoord.height,
    left: currentCoord.left,
    width: currentCoord.width,
  };

  const transitionProps = {
    type: 'spring',
    stiffness: 460,
    damping: 32,
    mass: 0.6,
  };

  return (
    <aside className="h-screen max-h-screen sticky top-0 transition-all duration-300 ease-in-out bg-gradient-to-b from-[#111B45] via-[#16255C] to-[#1E3A8A] border-r border-white/10 shadow-[4px_0_30px_rgba(17,27,69,0.35),inset_0_1px_1px_rgba(255,255,255,0.15)] flex flex-col justify-between py-5 px-3.5 select-none flex-shrink-0 z-30 w-[240px] overflow-y-auto">
      {/* Top Header with Brand Logo */}
      <div className="flex flex-col gap-4 w-full">
        <div className="flex items-center px-1 pb-4 border-b border-white/10">
          <img
            src="/logo.png"
            alt="NetBounce Placement LLC"
            className="h-11 w-auto max-w-full object-contain drop-shadow-[0_2px_12px_rgba(0,0,0,0.3)]"
          />
        </div>

        {/* Navigation Items */}
        <div ref={navRef} className="flex flex-col gap-1.5 w-full relative">
          {/* Earthworm Floating Active Pill */}
          {coords[activeKey]?.width > 0 && (
            <motion.div
              className="absolute pointer-events-none bg-white rounded-2xl shadow-[0_4px_20px_rgba(255,255,255,0.35),0_0_25px_rgba(255,255,255,0.18)] z-0"
              animate={animateProps}
              transition={transitionProps}
              initial={false}
            />
          )}

          {/* 1. Home / Living Dashboard */}
          <button
            ref={overviewRef}
            onClick={() => onSelectTab('overview')}
            title="Living Dashboard"
            className={`relative z-10 w-full px-3.5 py-2.5 rounded-2xl flex items-center gap-3 text-left transition-colors duration-200 ${
              activeKey === 'overview'
                ? 'text-[#111B45] font-bold'
                : 'text-slate-300 hover:text-white hover:bg-white/10 font-medium'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-semibold tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
              Living Dashboard
            </span>
          </button>

          {/* 2. Grid / Collection Hub */}
          <button
            ref={collectionRef}
            onClick={() => onSelectTab('collection')}
            title="Collection Hub"
            className={`relative z-10 w-full px-3.5 py-2.5 rounded-2xl flex items-center gap-3 text-left transition-colors duration-200 ${
              activeKey === 'collection'
                ? 'text-[#111B45] font-bold'
                : 'text-slate-300 hover:text-white hover:bg-white/10 font-medium'
            }`}
          >
            <LayoutGrid className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-semibold tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
              Collection Hub
            </span>
          </button>

          {/* Admin Exclusive: User Management */}
          {userRole === 'ADMIN' && (
            <button
              ref={usersRef}
              onClick={() => onSelectTab('users')}
              title="User Management & RBAC Access"
              className={`relative z-10 w-full px-3.5 py-2.5 rounded-2xl flex items-center gap-3 text-left transition-colors duration-200 ${
                activeKey === 'users'
                  ? 'text-[#111B45] font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/10 font-medium'
              }`}
            >
              <Users className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-semibold tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
                User Management
              </span>
            </button>
          )}

          {/* 3. Form Button: BGC Form for Compliance, PO Detail Form for Admin (Hidden from Accountant) */}
          {userRole !== 'ACCOUNT_MANAGER' && (
            <button
              onClick={onOpenNewPoModal}
              title={userRole === 'COMPLIANCE_MANAGER' ? 'Create New BGC Form' : 'Create New PO Form'}
              className="relative z-10 w-full px-3.5 py-2.5 rounded-2xl flex items-center gap-3 text-left transition-all duration-200 text-slate-300 hover:text-white hover:bg-white/10 font-medium cursor-pointer"
            >
              <Sparkles className="w-5 h-5 flex-shrink-0 text-amber-300" />
              <span className="text-sm font-semibold tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
                {userRole === 'COMPLIANCE_MANAGER' ? 'BGC Form' : 'PO Detail Form'}
              </span>
            </button>
          )}

          {/* 4. Shield / Compliance & Reports */}
          <button
            onClick={onOpenReportsModal}
            title="Compliance & Reports"
            className="relative z-10 w-full px-3.5 py-2.5 rounded-2xl flex items-center gap-3 text-left transition-all duration-200 text-slate-300 hover:text-white hover:bg-white/10 font-medium cursor-pointer"
          >
            <ShieldCheck className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-semibold tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
              Reports & BGC
            </span>
          </button>

          {/* 5. Audit Trail */}
          <button
            onClick={onOpenAuditModal}
            title="System Audit Trail & History"
            className="relative z-10 w-full px-3.5 py-2.5 rounded-2xl flex items-center gap-3 text-left transition-all duration-200 text-slate-300 hover:text-white hover:bg-white/10 font-medium cursor-pointer"
          >
            <History className="w-5 h-5 flex-shrink-0 text-cyan-400" />
            <span className="text-sm font-semibold tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
              Audit Trail
            </span>
          </button>
        </div>
      </div>

      {/* Bottom Controls: Theme Switcher & Reset Overview */}
      <div className="pt-4 border-t border-white/10 w-full flex flex-col gap-2">
        {/* Dark / Light Mode Switcher */}
        <button
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="transition-all duration-200 w-full px-3.5 py-2.5 rounded-2xl flex items-center justify-between text-left text-slate-300 hover:text-white hover:bg-white/10 font-medium group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            {theme === 'dark' ? (
              <Moon className="w-5 h-5 flex-shrink-0 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
            ) : (
              <Sun className="w-5 h-5 flex-shrink-0 text-amber-300 group-hover:rotate-45 transition-transform duration-300" />
            )}
            <span className="text-sm font-semibold whitespace-nowrap text-slate-200">
              {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </span>
          </div>
          {/* iOS-style toggle track */}
          <div
            className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-300 flex items-center ${
              theme === 'dark' ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.4)]' : 'bg-white/20'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-md ${
                theme === 'dark' ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </div>
        </button>

        {/* Power / Log Out */}
        <button
          onClick={() => {
            if (onLogOut) {
              onLogOut();
            } else {
              onSelectTab('overview');
            }
          }}
          title="Log Out of System"
          className="transition-all duration-200 w-full px-3.5 py-2.5 rounded-2xl flex items-center gap-3 text-left text-slate-300 hover:text-rose-300 hover:bg-rose-500/15 font-medium cursor-pointer group"
        >
          <Power className="w-5 h-5 flex-shrink-0 text-slate-400 group-hover:text-rose-400 transition-colors" />
          <span className="text-sm font-semibold whitespace-nowrap text-slate-300 group-hover:text-rose-200 transition-colors">
            Log Out
          </span>
        </button>
      </div>
    </aside>
  );
};
