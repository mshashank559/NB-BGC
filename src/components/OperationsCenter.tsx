'use client';

import React, { useState } from 'react';
import { Bell, Receipt, Shield, Activity, CheckCircle2, ShieldCheck, Zap, FileText } from 'lucide-react';
import { UserRole } from '../types';

interface OperationsCenterProps {
  userRole?: UserRole;
}

export const OperationsCenter: React.FC<OperationsCenterProps> = ({ userRole = 'ADMIN' }) => {
  const isCompliance = userRole === 'COMPLIANCE_MANAGER';

  // Toggle states
  const [toggle1, setToggle1] = useState(true);
  const [toggle2, setToggle2] = useState(true);
  const [toggle3, setToggle3] = useState(true);
  const [toggle4, setToggle4] = useState(isCompliance ? true : false);

  if (isCompliance) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {/* 1. Strict 10-Field Gate */}
        <div className="glass-card rounded-[26px] p-5 flex flex-col justify-between min-h-[140px] ambient-blue">
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-full bg-blue-50/80 backdrop-blur-sm border border-blue-200/70 flex items-center justify-center text-blue-600 shadow-xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <button
              onClick={() => setToggle1(!toggle1)}
              className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-all duration-300 ${
                toggle1 ? 'bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.35)]' : 'bg-slate-200/80'
              }`}
            >
              <div
                className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${
                  toggle1 ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 tracking-wide">10-Field Gate</h4>
            <p className="text-[10px] text-blue-600 font-mono mt-0.5 font-bold">Mandatory PO Check</p>
          </div>
        </div>

        {/* 2. FirstAdvantage BGC */}
        <div className="glass-card rounded-[26px] p-5 flex flex-col justify-between min-h-[140px] ambient-mint">
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-full bg-emerald-50/80 backdrop-blur-sm border border-emerald-200/70 flex items-center justify-center text-emerald-600 shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <button
              onClick={() => setToggle2(!toggle2)}
              className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-all duration-300 ${
                toggle2 ? 'bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.35)]' : 'bg-slate-200/80'
              }`}
            >
              <div
                className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${
                  toggle2 ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 tracking-wide">FirstAdvantage</h4>
            <p className="text-[10px] text-emerald-600 font-mono mt-0.5 font-bold">Live Screening API</p>
          </div>
        </div>

        {/* 3. Auto-Handoff Engine */}
        <div className="glass-card rounded-[26px] p-5 flex flex-col justify-between min-h-[140px] ambient-amber">
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-full bg-amber-50/80 backdrop-blur-sm border border-amber-200/70 flex items-center justify-center text-amber-600 shadow-xs">
              <Zap className="w-4 h-4" />
            </div>
            <button
              onClick={() => setToggle3(!toggle3)}
              className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-all duration-300 ${
                toggle3 ? 'bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.35)]' : 'bg-slate-200/80'
              }`}
            >
              <div
                className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${
                  toggle3 ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 tracking-wide">Auto-Handoff</h4>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5 font-medium">Alerts Accounts Team</p>
          </div>
        </div>

        {/* 4. Draft Auto-Recovery */}
        <div className="glass-card rounded-[26px] p-5 flex flex-col justify-between min-h-[140px]">
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-full bg-slate-100/80 backdrop-blur-sm border border-slate-200/70 flex items-center justify-center text-slate-700 shadow-xs">
              <FileText className="w-4 h-4" />
            </div>
            <button
              onClick={() => setToggle4(!toggle4)}
              className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-all duration-300 ${
                toggle4 ? 'bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.35)]' : 'bg-slate-200/80'
              }`}
            >
              <div
                className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${
                  toggle4 ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 tracking-wide">Draft Recovery</h4>
            <p className="text-[10px] text-purple-600 font-mono mt-0.5 font-bold">Auto-Save Enabled</p>
          </div>
        </div>
      </div>
    );
  }

  // Admin & Accounts View
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* 1. Auto Reminders Toggle Card */}
      <div className="glass-card rounded-[26px] p-5 flex flex-col justify-between min-h-[140px]">
        <div className="flex items-start justify-between">
          <div className="w-9 h-9 rounded-full bg-blue-50/80 backdrop-blur-sm border border-blue-200/70 flex items-center justify-center text-blue-600 shadow-xs">
            <Bell className="w-4 h-4" />
          </div>
          <button
            onClick={() => setToggle1(!toggle1)}
            className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-all duration-300 ${
              toggle1 ? 'bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.35)]' : 'bg-slate-200/80'
            }`}
          >
            <div
              className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${
                toggle1 ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900 tracking-wide">Auto Reminders</h4>
          <p className="text-[10px] text-slate-500 font-mono mt-0.5 font-medium">T-3d @ 09:00 IST</p>
        </div>
      </div>

      {/* 2. MCP Invoicing Toggle Card */}
      <div className="glass-card rounded-[26px] p-5 flex flex-col justify-between min-h-[140px]">
        <div className="flex items-start justify-between">
          <div className="w-9 h-9 rounded-full bg-blue-50/80 backdrop-blur-sm border border-blue-200/70 flex items-center justify-center text-blue-600 shadow-xs">
            <Receipt className="w-4 h-4" />
          </div>
          <button
            onClick={() => setToggle2(!toggle2)}
            className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-all duration-300 ${
              toggle2 ? 'bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.35)]' : 'bg-slate-200/80'
            }`}
          >
            <div
              className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${
                toggle2 ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900 tracking-wide">MCP Invoicing</h4>
          <p className="text-[10px] text-blue-600 font-mono mt-0.5 font-bold">Synced v1/v2</p>
        </div>
      </div>

      {/* 3. Monitoring Toggle Card */}
      <div className="glass-card rounded-[26px] p-5 flex flex-col justify-between min-h-[140px]">
        <div className="flex items-start justify-between">
          <div className="w-9 h-9 rounded-full bg-blue-50/80 backdrop-blur-sm border border-blue-200/70 flex items-center justify-center text-blue-600 shadow-xs">
            <Activity className="w-4 h-4" />
          </div>
          <button
            onClick={() => setToggle3(!toggle3)}
            className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-all duration-300 ${
              toggle3 ? 'bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.35)]' : 'bg-slate-200/80'
            }`}
          >
            <div
              className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${
                toggle3 ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900 tracking-wide">Live Telemetry</h4>
          <p className="text-[10px] text-emerald-600 font-mono mt-0.5 font-bold">Active Engine</p>
        </div>
      </div>

      {/* 4. Security Sandbox Toggle Card */}
      <div className="glass-card rounded-[26px] p-5 flex flex-col justify-between min-h-[140px]">
        <div className="flex items-start justify-between">
          <div className="w-9 h-9 rounded-full bg-slate-100/80 backdrop-blur-sm border border-slate-200/70 flex items-center justify-center text-slate-700 shadow-xs">
            <Shield className="w-4 h-4" />
          </div>
          <button
            onClick={() => setToggle4(!toggle4)}
            className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-all duration-300 ${
              toggle4 ? 'bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.35)]' : 'bg-slate-200/80'
            }`}
          >
            <div
              className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${
                toggle4 ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900 tracking-wide">Row Isolation</h4>
          <p className="text-[10px] text-slate-500 font-mono mt-0.5 font-medium">Tenant Privacy</p>
        </div>
      </div>
    </div>
  );
};
