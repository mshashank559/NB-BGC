'use client';

import React, { useState } from 'react';
import { RotateCcw, Flame, Snowflake, Zap, FileText, ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react';
import { CandidateRecord, UserRole } from '../types';
import { CountUp } from './CountUp';

interface CollectionGaugeProps {
  collected: number;
  total: number;
  userRole?: UserRole;
  scopedCandidates?: CandidateRecord[];
  onSelectAction?: (action: string) => void;
  countUpTrigger?: number;
}

export const CollectionGauge: React.FC<CollectionGaugeProps> = ({
  collected,
  total,
  userRole = 'ADMIN',
  scopedCandidates = [],
  onSelectAction,
  countUpTrigger = 0,
}) => {
  // Target delta modifier for interactive + / - buttons
  const [targetOffset, setTargetOffset] = useState<number>(0);
  const [isActiveSwitch, setIsActiveSwitch] = useState<boolean>(true);
  const [activeAction, setActiveAction] = useState<string>('allDocs');

  // If Compliance Manager, compute onboarding completion percentage
  const isCompliance = userRole === 'COMPLIANCE_MANAGER';
  const totalCount = scopedCandidates.length;
  const submittedCount = scopedCandidates.filter((c) => c.status === 'SUBMITTED' || c.status === 'CLOSED').length;

  const adjustedTotal = isCompliance
    ? Math.max(0, totalCount + targetOffset)
    : Math.max(0, total + targetOffset * 1000);

  const percentage = isCompliance
    ? adjustedTotal > 0
      ? Math.min(100, Math.round((submittedCount / adjustedTotal) * 100))
      : 0
    : adjustedTotal > 0
    ? Math.min(100, Math.round((collected / adjustedTotal) * 100))
    : 0;

  // Circular gauge geometry: 270-degree arc
  const arcLength = 353.4;
  const strokeDashoffset = arcLength - (arcLength * percentage) / 100;

  const handleActionClick = (action: string) => {
    setActiveAction(action);
    if (onSelectAction) {
      onSelectAction(action);
    }
  };

  return (
    <div className="glass-card rounded-[26px] p-6 ambient-blue flex flex-col justify-between select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            {isCompliance ? 'Compliance Pipeline' : 'Placement Pipeline'}
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            {isCompliance ? 'Documentation & BGC Engine' : 'Target Collection Engine'}
          </p>
        </div>

        {/* Interactive Toggle Switch */}
        <button
          type="button"
          onClick={() => setIsActiveSwitch(!isActiveSwitch)}
          className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-all duration-300 ${
            isActiveSwitch
              ? 'bg-blue-600 shadow-sm'
              : 'bg-slate-200'
          }`}
        >
          <div
            className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${
              isActiveSwitch ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Thermostat Dial with Radial Tick Marks */}
      <div className="relative flex flex-col items-center justify-center my-3">
        <svg className="w-60 h-60 overflow-visible" viewBox="0 0 200 200">
          <defs>
            <linearGradient id="blueGaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="50%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
            <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#38BDF8" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Radial Tick Marks */}
          <circle
            cx="100"
            cy="100"
            r="82"
            fill="none"
            stroke="rgba(15, 23, 42, 0.12)"
            strokeWidth="6"
            strokeDasharray="2 6"
            strokeLinecap="round"
          />

          {/* Base Track Arc */}
          <circle
            cx="100"
            cy="100"
            r="70"
            fill="none"
            stroke="rgba(15, 23, 42, 0.08)"
            strokeWidth="10"
            strokeDasharray="353.4 118"
            strokeDashoffset="-59"
            strokeLinecap="round"
            transform="rotate(135 100 100)"
          />

          {/* Glowing Progress Arc — Only visible when percentage > 0 */}
          {percentage > 0 && (
            <circle
              cx="100"
              cy="100"
              r="70"
              fill="none"
              stroke="url(#blueGaugeGradient)"
              strokeWidth="10"
              strokeDasharray="353.4 118"
              strokeDashoffset={-59 + strokeDashoffset}
              strokeLinecap="round"
              filter="url(#gaugeGlow)"
              transform="rotate(135 100 100)"
              className="transition-all duration-700 ease-out"
            />
          )}
        </svg>

        {/* Center Percentage Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-extrabold text-slate-900 font-tabular tracking-tight">
            <CountUp end={percentage} suffix="%" triggerKey={countUpTrigger} />
          </span>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-1">
            {isCompliance ? 'Onboarding Ready' : 'Overall Collected'}
          </span>
          <span className="text-[10px] text-blue-600 font-mono font-bold mt-0.5">
            {isCompliance
              ? `${submittedCount} of ${adjustedTotal} Placements Verified`
              : `$${collected.toLocaleString()} / $${adjustedTotal.toLocaleString()}`}
          </span>
        </div>
      </div>

      {/* Minus & Plus Circular Buttons */}
      <div className="flex items-center justify-center gap-4 mb-3">
        <button
          type="button"
          onClick={() => setTargetOffset((prev) => prev - 1)}
          title={isCompliance ? 'Adjust Target Placements' : 'Decrease Target Calibration'}
          className="w-9 h-9 rounded-full glass-pill hover:border-blue-400 hover:bg-blue-50/50 flex items-center justify-center text-slate-700 font-bold text-base transition-all active:scale-95"
        >
          -
        </button>
        <button
          type="button"
          onClick={() => setTargetOffset((prev) => prev + 1)}
          title={isCompliance ? 'Increase Target Placements' : 'Increase Target Calibration'}
          className="w-9 h-9 rounded-full glass-pill hover:border-blue-400 hover:bg-blue-50/50 flex items-center justify-center text-slate-700 font-bold text-base transition-all active:scale-95"
        >
          +
        </button>
      </div>

      {/* Horizontal Action Modes */}
      <div className="pt-3 border-t border-slate-200">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2 text-center">
          {isCompliance ? 'Verification Actions' : 'Schedule Actions'}
        </span>
        <div className="grid grid-cols-4 gap-2 text-center">
          {isCompliance ? (
            <>
              {/* All Docs */}
              <button
                type="button"
                onClick={() => handleActionClick('allDocs')}
                className="flex flex-col items-center gap-1 group cursor-pointer"
              >
                <div
                  className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
                    activeAction === 'allDocs'
                      ? 'bg-blue-600 text-white shadow-sm border-blue-600'
                      : 'bg-slate-100 group-hover:bg-blue-50 group-hover:border-blue-200 border-slate-200 text-slate-600'
                  }`}
                >
                  <FileText className={`w-4 h-4 ${activeAction === 'allDocs' ? 'text-white' : ''}`} />
                </div>
                <span className={`text-[10px] font-semibold ${activeAction === 'allDocs' ? 'text-blue-600 font-bold' : 'text-slate-600'}`}>
                  All Docs
                </span>
              </button>

              {/* BGC Check */}
              <button
                type="button"
                onClick={() => handleActionClick('bgcCheck')}
                className="flex flex-col items-center gap-1 group cursor-pointer"
              >
                <div
                  className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
                    activeAction === 'bgcCheck'
                      ? 'bg-blue-600 text-white shadow-sm border-blue-600'
                      : 'bg-slate-100 group-hover:bg-blue-50 group-hover:border-blue-200 border-slate-200 text-slate-600'
                  }`}
                >
                  <ShieldCheck className={`w-4 h-4 ${activeAction === 'bgcCheck' ? 'text-white' : ''}`} />
                </div>
                <span className={`text-[10px] font-semibold ${activeAction === 'bgcCheck' ? 'text-blue-600 font-bold' : 'text-slate-600'}`}>
                  BGC Check
                </span>
              </button>

              {/* Agreement */}
              <button
                type="button"
                onClick={() => handleActionClick('agreement')}
                className="flex flex-col items-center gap-1 group cursor-pointer"
              >
                <div
                  className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
                    activeAction === 'agreement'
                      ? 'bg-blue-600 text-white shadow-sm border-blue-600'
                      : 'bg-slate-100 group-hover:bg-blue-50 group-hover:border-blue-200 border-slate-200 text-slate-600'
                  }`}
                >
                  <CheckCircle2 className={`w-4 h-4 ${activeAction === 'agreement' ? 'text-white' : ''}`} />
                </div>
                <span className={`text-[10px] font-semibold ${activeAction === 'agreement' ? 'text-blue-600 font-bold' : 'text-slate-600'}`}>
                  Agreement
                </span>
              </button>

              {/* Drafts */}
              <button
                type="button"
                onClick={() => handleActionClick('drafts')}
                className="flex flex-col items-center gap-1 group cursor-pointer"
              >
                <div
                  className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
                    activeAction === 'drafts'
                      ? 'bg-blue-600 text-white shadow-sm border-blue-600'
                      : 'bg-slate-100 group-hover:bg-blue-50 group-hover:border-blue-200 border-slate-200 text-slate-600'
                  }`}
                >
                  <Sparkles className={`w-4 h-4 ${activeAction === 'drafts' ? 'text-white' : ''}`} />
                </div>
                <span className={`text-[10px] font-semibold ${activeAction === 'drafts' ? 'text-blue-600 font-bold' : 'text-slate-600'}`}>
                  Drafts
                </span>
              </button>
            </>
          ) : (
            <>
              {/* Standard */}
              <button
                type="button"
                onClick={() => handleActionClick('standard')}
                className="flex flex-col items-center gap-1 group cursor-pointer"
              >
                <div
                  className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
                    activeAction === 'standard'
                      ? 'bg-blue-600 text-white shadow-sm border-blue-600'
                      : 'bg-slate-100 group-hover:bg-blue-50 group-hover:border-blue-200 border-slate-200 text-slate-600'
                  }`}
                >
                  <RotateCcw className={`w-4 h-4 ${activeAction === 'standard' ? 'text-white' : ''}`} />
                </div>
                <span className={`text-[10px] font-semibold ${activeAction === 'standard' ? 'text-blue-600 font-bold' : 'text-slate-600'}`}>
                  Standard
                </span>
              </button>

              {/* On-Offer */}
              <button
                type="button"
                onClick={() => handleActionClick('onOffer')}
                className="flex flex-col items-center gap-1 group cursor-pointer"
              >
                <div
                  className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
                    activeAction === 'onOffer'
                      ? 'bg-blue-600 text-white shadow-sm border-blue-600'
                      : 'bg-slate-100 group-hover:bg-blue-50 group-hover:border-blue-200 border-slate-200 text-slate-600'
                  }`}
                >
                  <Flame className={`w-4 h-4 ${activeAction === 'onOffer' ? 'text-white' : ''}`} />
                </div>
                <span className={`text-[10px] font-semibold ${activeAction === 'onOffer' ? 'text-blue-600 font-bold' : 'text-slate-600'}`}>
                  On-Offer
                </span>
              </button>

              {/* Balance */}
              <button
                type="button"
                onClick={() => handleActionClick('balance')}
                className="flex flex-col items-center gap-1 group cursor-pointer"
              >
                <div
                  className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
                    activeAction === 'balance'
                      ? 'bg-blue-600 text-white shadow-sm border-blue-600'
                      : 'bg-slate-100 group-hover:bg-blue-50 group-hover:border-blue-200 border-slate-200 text-slate-600'
                  }`}
                >
                  <Snowflake className={`w-4 h-4 ${activeAction === 'balance' ? 'text-white' : ''}`} />
                </div>
                <span className={`text-[10px] font-semibold ${activeAction === 'balance' ? 'text-blue-600 font-bold' : 'text-slate-600'}`}>
                  Balance
                </span>
              </button>

              {/* One-Shot */}
              <button
                type="button"
                onClick={() => handleActionClick('oneShot')}
                className="flex flex-col items-center gap-1 group cursor-pointer"
              >
                <div
                  className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
                    activeAction === 'oneShot'
                      ? 'bg-blue-600 text-white shadow-sm border-blue-600'
                      : 'bg-slate-100 group-hover:bg-blue-50 group-hover:border-blue-200 border-slate-200 text-slate-600'
                  }`}
                >
                  <Zap className={`w-4 h-4 ${activeAction === 'oneShot' ? 'text-white' : ''}`} />
                </div>
                <span className={`text-[10px] font-semibold ${activeAction === 'oneShot' ? 'text-blue-600 font-bold' : 'text-slate-600'}`}>
                  One-Shot
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
