'use client';

import React, { useState } from 'react';
import { Zap, Bell, Receipt, CheckCircle, Clock } from 'lucide-react';

export const OperationsCenter: React.FC = () => {
  const [autoReminders, setAutoReminders] = useState(true);
  const [mcpSync, setMcpSync] = useState(true);

  return (
    <div className="bg-[#111927]/60 rounded-3xl p-6 border border-white/5 shadow-spatial-card flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
            System Controls
          </span>
          <h3 className="text-base font-bold text-white">Operations Center</h3>
        </div>
        <div className="h-8 w-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
          <Zap className="h-4 w-4" />
        </div>
      </div>

      {/* Toggles List */}
      <div className="space-y-4 my-2">
        {/* Toggle 1: Auto Email Reminders */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/50 border border-white/5">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">Auto Email Reminders</p>
              <p className="text-[10px] text-slate-500 font-mono">T-2d @ 09:00 IST (Personal)</p>
            </div>
          </div>

          <button
            onClick={() => setAutoReminders(!autoReminders)}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-all duration-300 ${
              autoReminders
                ? 'bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_15px_rgba(0,242,254,0.4)]'
                : 'bg-slate-800'
            }`}
          >
            <div
              className={`bg-slate-950 w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                autoReminders ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Toggle 2: MCP Invoicing Engine */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/50 border border-white/5">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <Receipt className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">MCP Invoicing Engine</p>
              <p className="text-[10px] text-emerald-400 font-mono">Synced & Ready (v1/v2)</p>
            </div>
          </div>

          <button
            onClick={() => setMcpSync(!mcpSync)}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-all duration-300 ${
              mcpSync
                ? 'bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_15px_rgba(0,242,254,0.4)]'
                : 'bg-slate-800'
            }`}
          >
            <div
              className={`bg-slate-950 w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                mcpSync ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Status Footer */}
      <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5 text-emerald-400">
          <CheckCircle className="h-3 w-3" />
          <span>Scheduler Active</span>
        </span>
        <span className="text-slate-500">Asia/Kolkata</span>
      </div>
    </div>
  );
};

