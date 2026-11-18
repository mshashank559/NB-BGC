'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle,
  AlertCircle,
  Calendar,
  Gift,
  Tag,
  Percent,
  Plus,
  Trash2,
  Users,
  Layers,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';
import { Installment, CandidateRecord, DeductionRecord, DeductionType, ReferralSplit } from '../types';

interface MarkPaidModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: CandidateRecord | null;
  installment: Installment | null;
  onConfirmPaid: (
    candidateId: string,
    installmentId: string,
    paidDate: string,
    deductionData?: DeductionRecord
  ) => void;
}

export const MarkPaidModal: React.FC<MarkPaidModalProps> = ({
  isOpen,
  onClose,
  candidate,
  installment,
  onConfirmPaid,
}) => {
  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const [paidDate, setPaidDate] = useState<string>(getTodayStr());
  const [error, setError] = useState<string>('');

  // Deduction Settings
  const [hasDeduction, setHasDeduction] = useState<boolean>(false);
  const [deductionType, setDeductionType] = useState<DeductionType>('REFERRAL_BONUS');
  const [deductionAmount, setDeductionAmount] = useState<number>(0);
  const [remarks, setRemarks] = useState<string>('');

  // Referral Bonus Specific Fields
  const salesPersonName = candidate?.salesPerson || 'Vikram Joshi';
  const [refereeInput, setRefereeInput] = useState<string>('');
  const [refereeNames, setRefereeNames] = useState<string[]>([]);
  const [totalReferralBonus, setTotalReferralBonus] = useState<number>(2000);

  // Split Installments Functionality
  const [isSplitActive, setIsSplitActive] = useState<boolean>(false);
  const [splits, setSplits] = useState<ReferralSplit[]>([
    { id: 'sp-1', splitNumber: 1, amount: 1000, status: 'PAID' },
    { id: 'sp-2', splitNumber: 2, amount: 1000, status: 'PENDING' },
  ]);

  // Discount / Other specific
  const [discountReason, setDiscountReason] = useState<string>('');

  useEffect(() => {
    if (isOpen && installment) {
      setPaidDate(getTodayStr());
      setError('');
      setHasDeduction(false);
      setDeductionType('REFERRAL_BONUS');
      setDeductionAmount(0);
      setRemarks('');
      setRefereeNames([]);
      setRefereeInput('');
      setTotalReferralBonus(2000);
      setIsSplitActive(false);
      setSplits([
        { id: 'sp-1', splitNumber: 1, amount: 1000, status: 'PAID' },
        { id: 'sp-2', splitNumber: 2, amount: 1000, status: 'PENDING' },
      ]);
    }
  }, [isOpen, installment]);

  if (!isOpen || !candidate || !installment) return null;

  // Add Referee to multiple referees list
  const handleAddReferee = () => {
    const trimmed = refereeInput.trim();
    if (!trimmed) return;
    if (refereeNames.includes(trimmed)) {
      setError('Referee name already added.');
      return;
    }
    setRefereeNames((prev) => [...prev, trimmed]);
    setRefereeInput('');
    setError('');
  };

  const handleRemoveReferee = (index: number) => {
    setRefereeNames((prev) => prev.filter((_, i) => i !== index));
  };

  // Split calculations
  const totalAllocatedSplits = splits.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
  const remainingBonusBalance = Math.max(0, totalReferralBonus - totalAllocatedSplits);
  const isOverAllocated = totalAllocatedSplits > totalReferralBonus;

  // Auto Split Helper
  const handlePresetSplits = (count: number) => {
    const base = Math.floor(totalReferralBonus / count);
    const rem = totalReferralBonus % count;
    const newSplits: ReferralSplit[] = Array.from({ length: count }, (_, i) => ({
      id: `sp-${Date.now().toString(36)}-${i + 1}`,
      splitNumber: i + 1,
      amount: i === 0 ? base + rem : base,
      status: i === 0 ? 'PAID' : 'PENDING',
    }));
    setSplits(newSplits);
    setDeductionAmount(newSplits[0].amount);
  };

  const handleAddSplitRow = () => {
    const nextNum = splits.length + 1;
    setSplits((prev) => [
      ...prev,
      {
        id: `sp-${Date.now().toString(36)}-${nextNum}`,
        splitNumber: nextNum,
        amount: Math.max(0, remainingBonusBalance),
        status: 'PENDING',
      },
    ]);
  };

  const handleRemoveSplitRow = (id: string) => {
    if (splits.length <= 1) return;
    setSplits((prev) => prev.filter((s) => s.id !== id).map((s, idx) => ({ ...s, splitNumber: idx + 1 })));
  };

  const handleSplitAmountChange = (id: string, newAmount: number) => {
    setSplits((prev) =>
      prev.map((s) => (s.id === id ? { ...s, amount: Math.max(0, newAmount) } : s))
    );
  };

  // Current slot deduction amount to apply
  const effectiveDeduction = hasDeduction
    ? isSplitActive
      ? Number(splits[0]?.amount || 0)
      : Number(deductionAmount || 0)
    : 0;

  const netCollected = Math.max(0, installment.amount - effectiveDeduction);

  const handleConfirm = () => {
    const finalDate = paidDate || getTodayStr();

    if (hasDeduction) {
      if (effectiveDeduction <= 0) {
        setError('Please enter a valid deduction amount greater than 0.');
        return;
      }
      if (effectiveDeduction > installment.amount) {
        setError(`Deduction amount ($${effectiveDeduction.toLocaleString()}) cannot exceed the slot amount ($${installment.amount.toLocaleString()}).`);
        return;
      }
      if (deductionType === 'REFERRAL_BONUS') {
        if (refereeNames.length === 0 && !refereeInput.trim()) {
          setError('Please add at least one Referee Name for the Referral Bonus.');
          return;
        }
        if (isSplitActive && isOverAllocated) {
          setError('Split allocations exceed the total referral bonus. Please balance the split amounts.');
          return;
        }
      }
    }

    const finalReferees = [...refereeNames];
    if (refereeInput.trim() && !finalReferees.includes(refereeInput.trim())) {
      finalReferees.push(refereeInput.trim());
    }

    let deductionRecord: DeductionRecord | undefined = undefined;
    if (hasDeduction) {
      const allocStatus = isSplitActive
        ? totalAllocatedSplits >= totalReferralBonus
          ? 'FULLY_ALLOCATED'
          : 'PARTIALLY_ALLOCATED'
        : 'FULLY_ALLOCATED';

      deductionRecord = {
        id: `ded-${Date.now().toString(36)}`,
        candidateId: candidate.id,
        installmentId: installment.id,
        installmentNumber: installment.number,
        type: deductionType,
        amount: effectiveDeduction,
        salesPerson: salesPersonName,
        refereeNames: deductionType === 'REFERRAL_BONUS' ? finalReferees : [],
        totalReferralBonus: deductionType === 'REFERRAL_BONUS' ? totalReferralBonus : undefined,
        splits: isSplitActive ? splits : undefined,
        allocationStatus: allocStatus,
        remarks: remarks.trim() || `${deductionType.replace('_', ' ')} applied against Slot #${installment.number}`,
        createdBy: 'usr-accounts',
        createdByName: 'Suresh Menon (Accounts)',
        createdAt: new Date().toISOString(),
      };
    }

    setError('');
    onConfirmPaid(candidate.id, installment.id, finalDate, deductionRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white/95 backdrop-blur-2xl border border-white/80 rounded-[30px] shadow-[0_25px_60px_rgba(15,23,42,0.2)] overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-slate-900 my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-black/[0.06] flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-50 border border-emerald-200/70 flex items-center justify-center text-emerald-600 shadow-xs">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">Record Payment Collection & Deductions</h2>
              <p className="text-[11px] text-emerald-600 font-semibold">
                Installment #{installment.number} • {candidate.candidateName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200/80 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
          {/* Slot Financial Overview */}
          <div className="grid grid-cols-3 gap-2.5 p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200/80 text-xs shadow-xs">
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Scheduled Slot Amt</span>
              <strong className="text-sm font-extrabold text-blue-700">${installment.amount.toLocaleString()}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Deduction Applied</span>
              <strong className="text-sm font-extrabold text-amber-600">-${effectiveDeduction.toLocaleString()}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Net Collection</span>
              <strong className="text-sm font-extrabold text-emerald-700">${netCollected.toLocaleString()}</strong>
            </div>
          </div>

          {/* Payment Receipt Date */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Payment Receipt Date <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="date"
                value={paidDate}
                onChange={(e) => setPaidDate(e.target.value)}
                className="w-full bg-white border border-slate-200/90 rounded-xl pl-10 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono shadow-xs"
              />
            </div>
          </div>

          {/* Deduction Remark Toggle */}
          <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-200/60 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-blue-600" />
                <span className="font-bold text-slate-900 text-xs">Payment Deduction / Adjustment Remarks</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasDeduction}
                  onChange={(e) => {
                    setHasDeduction(e.target.checked);
                    if (e.target.checked && deductionAmount === 0) {
                      setDeductionAmount(1000);
                    }
                  }}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {hasDeduction && (
              <div className="space-y-3.5 pt-2 border-t border-blue-200/40">
                {/* 4 Deduction Options */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Select Deduction Category
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'REFERRAL_BONUS', label: '1. Referral Bonus', icon: Gift },
                      { id: 'DISCOUNT', label: '2. Discount', icon: Percent },
                      { id: 'OTHER', label: '3. Other', icon: Tag },
                      { id: 'SPLIT', label: '4. Split', icon: Layers },
                    ].map((opt) => {
                      const Icon = opt.icon;
                      const isSel = deductionType === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setDeductionType(opt.id as DeductionType);
                            if (opt.id === 'SPLIT') {
                              setIsSplitActive(true);
                            }
                          }}
                          className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                            isSel
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <Icon className={`h-3.5 w-3.5 ${isSel ? 'text-white' : 'text-blue-600'}`} />
                          <span className="font-bold text-[11px] truncate">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* OPTION 1: REFERRAL BONUS */}
                {deductionType === 'REFERRAL_BONUS' && (
                  <div className="bg-white p-4 rounded-xl border border-blue-200 space-y-3">
                    {/* Field 1: Salesperson Name (Auto-fetched) */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Field 1: Salesperson Name (Auto-fetched from PO)
                      </span>
                      <div className="px-3 py-2 bg-slate-100 rounded-lg text-slate-800 font-bold border border-slate-200 flex items-center justify-between text-xs">
                        <span>{salesPersonName}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-bold">Auto-Linked PO</span>
                      </div>
                    </div>

                    {/* Field 2: Referee Name(s) (Multiple Referees Supported) */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Field 2: Referee Name(s) (Add Multiple Referees) <span className="text-rose-500">*</span>
                      </span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. Rahul Sharma, Amit Verma..."
                          value={refereeInput}
                          onChange={(e) => setRefereeInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddReferee();
                            }
                          }}
                          className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
                        />
                        <button
                          type="button"
                          onClick={handleAddReferee}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add Referee
                        </button>
                      </div>

                      {/* Chips / List of Added Referees */}
                      {refereeNames.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {refereeNames.map((name, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold"
                            >
                              <Users className="h-3 w-3 text-emerald-600" />
                              {name}
                              <button
                                type="button"
                                onClick={() => handleRemoveReferee(i)}
                                className="text-emerald-700 hover:text-rose-600 ml-0.5 cursor-pointer"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Total Referral Bonus Amount */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                          Total Referral Bonus ($)
                        </label>
                        <input
                          type="number"
                          value={totalReferralBonus}
                          onChange={(e) => {
                            const val = Math.max(0, Number(e.target.value) || 0);
                            setTotalReferralBonus(val);
                            if (!isSplitActive) setDeductionAmount(val);
                          }}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                          Slot Deduction Amt ($)
                        </label>
                        <input
                          type="number"
                          disabled={isSplitActive}
                          value={isSplitActive ? splits[0]?.amount || 0 : deductionAmount}
                          onChange={(e) => setDeductionAmount(Math.max(0, Number(e.target.value) || 0))}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500 disabled:bg-slate-100"
                        />
                      </div>
                    </div>

                    {/* Split Toggle */}
                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 text-slate-800 font-bold text-[11px]">
                          <Layers className="h-3.5 w-3.5 text-purple-600" />
                          <span>Flexible Split Deductions (Multi-Installments)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const next = !isSplitActive;
                            setIsSplitActive(next);
                            if (next) handlePresetSplits(2);
                          }}
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-md border cursor-pointer ${
                            isSplitActive
                              ? 'bg-purple-100 text-purple-800 border-purple-300'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {isSplitActive ? '✓ Split Mode Enabled' : '+ Enable Split'}
                        </button>
                      </div>

                      {isSplitActive && (
                        <div className="bg-purple-50/50 p-3 rounded-xl border border-purple-200/70 space-y-2.5">
                          {/* Presets */}
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-bold text-purple-900">Auto Presets:</span>
                            <div className="flex gap-1.5">
                              {[2, 3, 4].map((cnt) => (
                                <button
                                  key={cnt}
                                  type="button"
                                  onClick={() => handlePresetSplits(cnt)}
                                  className="px-2 py-0.5 bg-white border border-purple-200 rounded text-purple-700 font-bold hover:bg-purple-100 cursor-pointer"
                                >
                                  {cnt} Splits
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Split Rows */}
                          <div className="space-y-2">
                            {splits.map((s, idx) => (
                              <div key={s.id} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-purple-200/80 text-xs">
                                <span className="font-extrabold text-purple-800 text-[11px] w-14">
                                  Split #{s.splitNumber}
                                </span>
                                <div className="flex items-center gap-1 flex-1">
                                  <span className="text-slate-400">$</span>
                                  <input
                                    type="number"
                                    value={s.amount}
                                    onChange={(e) => handleSplitAmountChange(s.id, Number(e.target.value) || 0)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 font-mono font-bold text-xs"
                                  />
                                </div>
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                                    idx === 0
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                                  }`}
                                >
                                  {idx === 0 ? 'Deducting Now' : 'Pending Later'}
                                </span>
                                {splits.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveSplitRow(s.id)}
                                    className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={handleAddSplitRow}
                            className="w-full py-1 text-center font-bold text-purple-700 bg-white border border-purple-200 rounded-lg text-[10px] hover:bg-purple-100 cursor-pointer"
                          >
                            + Add Another Split Installment
                          </button>

                          {/* Live Balance Reconciliation */}
                          <div className="pt-2 border-t border-purple-200 flex items-center justify-between text-[11px] font-bold">
                            <div>
                              <span className="text-slate-500">Allocated: </span>
                              <strong className="text-purple-900">${totalAllocatedSplits.toLocaleString()}</strong>
                              <span className="text-slate-500"> / ${totalReferralBonus.toLocaleString()}</span>
                            </div>
                            <div>
                              {isOverAllocated ? (
                                <span className="text-rose-600 flex items-center gap-1">
                                  <AlertTriangle className="h-3 w-3" /> Over-allocated by ${ (totalAllocatedSplits - totalReferralBonus).toLocaleString()}
                                </span>
                              ) : remainingBonusBalance === 0 ? (
                                <span className="text-emerald-700">✓ Fully Allocated</span>
                              ) : (
                                <span className="text-amber-700">Remaining: ${remainingBonusBalance.toLocaleString()} (Partially Allocated)</span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* OPTION 2: DISCOUNT */}
                {deductionType === 'DISCOUNT' && (
                  <div className="bg-white p-4 rounded-xl border border-blue-200 space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Discount Amount ($)
                      </label>
                      <input
                        type="number"
                        value={deductionAmount}
                        onChange={(e) => setDeductionAmount(Math.max(0, Number(e.target.value) || 0))}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Discount Authorization / Reason
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Authorized by Management as special discount"
                        value={discountReason}
                        onChange={(e) => setDiscountReason(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* OPTION 3: OTHER */}
                {deductionType === 'OTHER' && (
                  <div className="bg-white p-4 rounded-xl border border-blue-200 space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Adjustment / Deduction Amount ($)
                      </label>
                      <input
                        type="number"
                        value={deductionAmount}
                        onChange={(e) => setDeductionAmount(Math.max(0, Number(e.target.value) || 0))}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* OPTION 4: SPLIT (DIRECT) */}
                {deductionType === 'SPLIT' && (
                  <div className="bg-white p-4 rounded-xl border border-blue-200 space-y-3">
                    <p className="text-[11px] text-purple-700 font-semibold">
                      Direct Split Installment Mode: Allocate partial payment deductions across multiple slots.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                          Total Amount to Split ($)
                        </label>
                        <input
                          type="number"
                          value={totalReferralBonus}
                          onChange={(e) => setTotalReferralBonus(Math.max(0, Number(e.target.value) || 0))}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                          Current Slot Deduction ($)
                        </label>
                        <input
                          type="number"
                          value={splits[0]?.amount || 0}
                          onChange={(e) => handleSplitAmountChange(splits[0]?.id || 'sp-1', Number(e.target.value) || 0)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* General Remarks Input */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Deduction Transaction Remarks
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Referral bonus approved by sales, 1st installment paid..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-[11px]">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-black/[0.06] bg-slate-50/70 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-500 font-medium">Net Collection to Confirm: </span>
            <strong className="text-emerald-700 font-extrabold text-sm">${netCollected.toLocaleString()}</strong>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-all border border-slate-200 text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              Confirm Payment & Deduction
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
