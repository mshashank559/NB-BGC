'use client';

import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, CheckCircle2, Save, FileText, User, DollarSign, Calendar, Building, Phone, Mail, Plus, Trash2, Zap, Upload, Paperclip, Clock } from 'lucide-react';
import { CandidateRecord, BgcStatus } from '../types';

interface BgcFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: CandidateRecord | null;
  onSaveDraft: (data: Partial<CandidateRecord>) => void;
  onSubmitForm: (data: Partial<CandidateRecord>) => void;
  formTitle?: string;
  formSubtitle?: string;
}

export const BgcFormModal: React.FC<BgcFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSaveDraft,
  onSubmitForm,
  formTitle,
  formSubtitle,
}) => {
  const [formData, setFormData] = useState<Partial<CandidateRecord>>({
    candidateName: '',
    teamLead: 'Rudra',
    poType: '1 st',
    salesPerson: '',
    personalEmail: '',
    personalPhone: '',
    joiningDateEndClient: '',
    upfrontAmount: 2000,
    bgcOfferAmount: 2500,
    onOfferPaymentDate: '',
    totalSlotAmount: 8400,
    totalSlotNumber: 4,
    bgcDoneBy: 'Imran',
    clientEmployerName: '',
    bgcCompanyName: '',
    bgcStartDate: '',
    emailReferenceGiven: 'Yes',
    phoneReferenceGiven: 'Yes',
    bgcEndDate: '',
    bgcOfferStatus: 'INITIATED',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Joining Date Options Panel
  const [isJoiningDateOptionsOpen, setIsJoiningDateOptionsOpen] = useState<boolean>(false);

  // Custom Team Leader State (Rudra, Shilp, Other)
  const [isOtherTeamLead, setIsOtherTeamLead] = useState<boolean>(false);
  const [customTeamLead, setCustomTeamLead] = useState<string>('');

  // BGC Offer Amount Splits State
  const [isBgcOfferSplitOpen, setIsBgcOfferSplitOpen] = useState<boolean>(false);
  const [bgcOfferSplits, setBgcOfferSplits] = useState<Array<{ number: number; amount: number; dueDate: string }>>([]);

  // Payment Schedule & Custom Slots State (Compliance Configured)
  const [isOneShot, setIsOneShot] = useState<boolean>(false);
  const [customSlots, setCustomSlots] = useState<Array<{ number: number; amount: number; dueDate: string }>>([
    { number: 1, amount: 2100, dueDate: '' },
    { number: 2, amount: 2100, dueDate: '' },
    { number: 3, amount: 2100, dueDate: '' },
    { number: 4, amount: 2100, dueDate: '' },
  ]);

  useEffect(() => {
    if (initialData) {
      const lead = initialData.teamLead || 'Rudra';
      if (lead !== 'Rudra' && lead !== 'Shilp') {
        setIsOtherTeamLead(true);
        setCustomTeamLead(lead);
      } else {
        setIsOtherTeamLead(false);
        setCustomTeamLead('');
      }

      if (initialData.bgcOfferSplits && initialData.bgcOfferSplits.length > 0) {
        setBgcOfferSplits(initialData.bgcOfferSplits);
        setIsBgcOfferSplitOpen(true);
      } else {
        setBgcOfferSplits([]);
        setIsBgcOfferSplitOpen(false);
      }

      setFormData({
        candidateName: initialData.candidateName || '',
        teamLead: lead,
        poType: initialData.poType || '1 st',
        salesPerson: initialData.salesPerson || '',
        personalEmail: initialData.personalEmail || '',
        personalPhone: initialData.personalPhone || '',
        joiningDateEndClient: initialData.joiningDateEndClient || '',
        upfrontAmount: initialData.upfrontAmount || 2000,
        bgcOfferAmount: initialData.bgcOfferAmount ?? 2500,
        onOfferPaymentDate: initialData.onOfferPaymentDate || '',
        totalSlotAmount: initialData.totalSlotAmount ?? (initialData.paymentPlan?.totalPayable || 8400),
        totalSlotNumber: initialData.totalSlotNumber ?? (initialData.numberOfInstallments || 4),
        bgcDoneBy: initialData.bgcDoneBy || 'Imran',
        clientEmployerName: initialData.clientEmployerName || initialData.endClient || '',
        bgcCompanyName: initialData.bgcCompanyName || '',
        bgcStartDate: initialData.bgcStartDate || '',
        emailReferenceGiven: initialData.emailReferenceGiven || 'Yes',
        phoneReferenceGiven: initialData.phoneReferenceGiven || 'Yes',
        bgcEndDate: initialData.bgcEndDate || '',
        bgcOfferStatus: initialData.bgcOfferStatus || 'INITIATED',
        bgcPaymentProofName: initialData.bgcPaymentProofName,
        bgcPaymentProofDataUrl: initialData.bgcPaymentProofDataUrl,
        bgcPaymentProofSize: initialData.bgcPaymentProofSize,
        bgcPaymentProofType: initialData.bgcPaymentProofType,
        bgcPaymentStatus: initialData.bgcPaymentStatus,
      });

      const isOne = initialData.isOneShotPayment || initialData.paymentPlan?.isOneShot || false;
      setIsOneShot(isOne);

      if (initialData.bgcSlots && initialData.bgcSlots.length > 0) {
        setCustomSlots(initialData.bgcSlots);
      } else if (initialData.paymentPlan?.installments && initialData.paymentPlan.installments.length > 0) {
        setCustomSlots(
          initialData.paymentPlan.installments.map((inst) => ({
            number: inst.number,
            amount: inst.amount,
            dueDate: inst.dueDate,
          }))
        );
      } else {
        const total = initialData.totalSlotAmount || 8400;
        const count = initialData.totalSlotNumber || 4;
        const base = initialData.joiningDateEndClient || new Date().toISOString().split('T')[0];
        const perSlot = Math.round(total / count);
        const slots = [];
        for (let i = 0; i < count; i++) {
          const d = new Date(base);
          d.setDate(d.getDate() + (i + 1) * 30);
          slots.push({
            number: i + 1,
            amount: i === count - 1 ? total - perSlot * (count - 1) : perSlot,
            dueDate: d.toISOString().split('T')[0],
          });
        }
        setCustomSlots(slots);
      }
    } else {
      setIsOtherTeamLead(false);
      setCustomTeamLead('');
      setIsJoiningDateOptionsOpen(false);
      setBgcOfferSplits([]);
      setIsBgcOfferSplitOpen(false);
      setFormData({
        candidateName: '',
        teamLead: 'Rudra',
        poType: '1 st',
        salesPerson: '',
        personalEmail: '',
        personalPhone: '',
        joiningDateEndClient: '',
        upfrontAmount: 2000,
        bgcOfferAmount: 2500,
        onOfferPaymentDate: '',
        totalSlotAmount: 8400,
        totalSlotNumber: 4,
        bgcDoneBy: 'Imran',
        clientEmployerName: '',
        bgcCompanyName: '',
        bgcStartDate: '',
        emailReferenceGiven: 'Yes',
        phoneReferenceGiven: 'Yes',
        bgcEndDate: '',
        bgcOfferStatus: 'INITIATED',
      });
      setIsOneShot(false);
      const base = new Date().toISOString().split('T')[0];
      const slots = [];
      for (let i = 0; i < 4; i++) {
        const d = new Date(base);
        d.setDate(d.getDate() + (i + 1) * 30);
        slots.push({
          number: i + 1,
          amount: 2100,
          dueDate: d.toISOString().split('T')[0],
        });
      }
      setCustomSlots(slots);
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field: keyof CandidateRecord, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }

    // Auto-sync slot dates if joining date changes and slots have no date
    if (field === 'joiningDateEndClient' && value) {
      setCustomSlots((prev) =>
        prev.map((slot, idx) => {
          if (!slot.dueDate) {
            const d = new Date(value);
            d.setDate(d.getDate() + (idx + 1) * 30);
            return { ...slot, dueDate: d.toISOString().split('T')[0] };
          }
          return slot;
        })
      );
    }
  };

  const handleNumberInput = (field: keyof CandidateRecord, rawValue: string) => {
    if (rawValue === '') {
      handleChange(field, '');
      return;
    }
    // Remove leading zeros: e.g. "023" -> "23", "007" -> "7"
    const clean = rawValue.replace(/^0+(?=\d)/, '');
    const num = Number(clean);
    handleChange(field, isNaN(num) ? '' : num);
  };

  // Slot Management Handlers for Compliance
  const handleAddSlot = () => {
    const nextNum = customSlots.length + 1;
    const lastDate = customSlots[customSlots.length - 1]?.dueDate || formData.joiningDateEndClient || new Date().toISOString().split('T')[0];
    const nextDateObj = new Date(lastDate);
    nextDateObj.setDate(nextDateObj.getDate() + 30);
    const nextDueDate = nextDateObj.toISOString().split('T')[0];

    const currentTotalAllocated = customSlots.reduce((sum, s) => sum + s.amount, 0);
    const remaining = Math.max(0, (formData.totalSlotAmount || 8400) - currentTotalAllocated);

    const newSlot = {
      number: nextNum,
      amount: remaining > 0 ? remaining : 2000,
      dueDate: nextDueDate,
    };
    const updated = [...customSlots, newSlot];
    setCustomSlots(updated);
    setFormData((prev) => ({ ...prev, totalSlotNumber: updated.length }));
  };

  const handleRemoveSlot = (index: number) => {
    if (customSlots.length <= 1) return;
    const updated = customSlots
      .filter((_, i) => i !== index)
      .map((s, idx) => ({ ...s, number: idx + 1 }));
    setCustomSlots(updated);
    setFormData((prev) => ({ ...prev, totalSlotNumber: updated.length }));
  };

  const handleSlotChange = (index: number, field: 'amount' | 'dueDate', value: any) => {
    const updated = [...customSlots];
    let parsedVal = value;
    if (field === 'amount') {
      if (value === '' || value === undefined || value === null) {
        parsedVal = '';
      } else {
        const clean = String(value).replace(/^0+(?=\d)/, '');
        parsedVal = clean === '' ? '' : Number(clean);
      }
    }
    updated[index] = { ...updated[index], [field]: parsedVal };
    setCustomSlots(updated);
    if (field === 'amount') {
      const sum = updated.reduce((s, item) => s + (Number(item.amount) || 0), 0);
      setFormData((prev) => ({ ...prev, totalSlotAmount: sum }));
    }
  };

  const handleAutoSplit = (count: number) => {
    const total = formData.totalSlotAmount || 8400;
    const baseJoining = formData.joiningDateEndClient || new Date().toISOString().split('T')[0];
    const perSlot = Math.round(total / count);
    const newSlots = [];
    for (let i = 0; i < count; i++) {
      const d = new Date(baseJoining);
      d.setDate(d.getDate() + (i + 1) * 30);
      newSlots.push({
        number: i + 1,
        amount: i === count - 1 ? total - perSlot * (count - 1) : perSlot,
        dueDate: d.toISOString().split('T')[0],
      });
    }
    setCustomSlots(newSlots);
    setFormData((prev) => ({ ...prev, totalSlotNumber: count }));
  };

  // BGC Offer Split Helpers
  const handleAddBgcOfferSplit = () => {
    const nextNum = bgcOfferSplits.length + 1;
    const currentAllocated = bgcOfferSplits.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
    const target = formData.bgcOfferAmount ?? 2500;
    const remaining = Math.max(0, target - currentAllocated);
    const baseDate = formData.onOfferPaymentDate || new Date().toISOString().split('T')[0];
    const nextDate = new Date(baseDate);
    nextDate.setDate(nextDate.getDate() + nextNum * 15);
    setBgcOfferSplits([
      ...bgcOfferSplits,
      { number: nextNum, amount: remaining, dueDate: nextDate.toISOString().split('T')[0] },
    ]);
  };

  const handleRemoveBgcOfferSplit = (index: number) => {
    const updated = bgcOfferSplits.filter((_, idx) => idx !== index).map((s, idx) => ({ ...s, number: idx + 1 }));
    setBgcOfferSplits(updated);
    if (updated.length === 0) {
      setIsBgcOfferSplitOpen(false);
    }
  };

  const handleBgcOfferSplitChange = (index: number, field: 'amount' | 'dueDate', value: any) => {
    const updated = [...bgcOfferSplits];
    let parsedVal = value;
    if (field === 'amount') {
      if (value === '' || value === undefined || value === null) {
        parsedVal = '';
      } else {
        const clean = String(value).replace(/^0+(?=\d)/, '');
        parsedVal = clean === '' ? '' : Number(clean);
      }
    }
    updated[index] = { ...updated[index], [field]: parsedVal };
    setBgcOfferSplits(updated);
  };

  const handleAutoSplitBgcOffer = (count: number) => {
    const total = formData.bgcOfferAmount ?? 2500;
    const perSplit = Math.round(total / count);
    const baseDate = formData.onOfferPaymentDate || new Date().toISOString().split('T')[0];
    const newSplits = [];
    for (let i = 0; i < count; i++) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + i * 15);
      newSplits.push({
        number: i + 1,
        amount: i === count - 1 ? total - perSplit * (count - 1) : perSplit,
        dueDate: d.toISOString().split('T')[0],
      });
    }
    setBgcOfferSplits(newSplits);
  };

  const validate = (): boolean => {
    const errs: { [key: string]: string } = {};
    if (!formData.candidateName?.trim()) errs.candidateName = 'Candidate Name is required';
    if (!formData.salesPerson?.trim()) errs.salesPerson = 'Sales Person is required';
    if (!formData.personalEmail?.trim()) errs.personalEmail = 'Valid Email is required';
    if (!formData.personalPhone?.trim()) errs.personalPhone = 'Mobile number is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    const finalSlots = isOneShot
      ? [
          {
            number: 1,
            amount: formData.totalSlotAmount || 8400,
            dueDate: formData.joiningDateEndClient || new Date().toISOString().split('T')[0],
          },
        ]
      : customSlots;

    onSaveDraft({
      ...formData,
      joiningDateStatus: formData.joiningDateStatus || (formData.joiningDateEndClient ? 'SET' : 'TO_BE_UPDATED'),
      isOneShotPayment: isOneShot,
      bgcSlots: finalSlots,
      bgcOfferSplits: isBgcOfferSplitOpen && bgcOfferSplits.length > 0 ? bgcOfferSplits : undefined,
      totalSlotNumber: finalSlots.length,
      bgcPaymentStatus: formData.bgcOfferStatus === 'CLEARED' ? 'PAID' : (formData.bgcPaymentStatus || 'PENDING'),
    });
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const finalSlots = isOneShot
      ? [
          {
            number: 1,
            amount: formData.totalSlotAmount || 8400,
            dueDate: formData.joiningDateEndClient || new Date().toISOString().split('T')[0],
          },
        ]
      : customSlots;

    onSubmitForm({
      ...formData,
      joiningDateStatus: formData.joiningDateStatus || (formData.joiningDateEndClient ? 'SET' : 'TO_BE_UPDATED'),
      endClient: formData.clientEmployerName || formData.endClient || 'Client US',
      jobRole: formData.jobRole || 'Full Stack Engineer',
      annualIncome: formData.annualIncome || (formData.totalSlotAmount || 8400) * 12.5,
      numberOfInstallments: finalSlots.length,
      totalSlotNumber: finalSlots.length,
      isOneShotPayment: isOneShot,
      bgcSlots: finalSlots,
      bgcOfferSplits: isBgcOfferSplitOpen && bgcOfferSplits.length > 0 ? bgcOfferSplits : undefined,
      bgcPaymentStatus: formData.bgcOfferStatus === 'CLEARED' ? 'PAID' : (formData.bgcPaymentStatus || 'PENDING'),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto">
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl border border-white/80 dark:border-white/10 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between bg-gradient-to-r from-blue-50/60 via-indigo-50/40 to-transparent dark:from-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                {formTitle || 'Compliance BGC Entry Form'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {formSubtitle || 'Standard Background Verification & Onboarding Ledger Record'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 dark:text-slate-300 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Candidate & Team Details */}
          <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200/60 dark:border-white/5 space-y-4">
            <h3 className="text-xs font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <User className="w-3.5 h-3.5" />
              1. Candidate & Sales Team Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 1. Candidate Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Candidate Name *
                </label>
                <input
                  type="text"
                  value={formData.candidateName || ''}
                  onChange={(e) => handleChange('candidateName', e.target.value)}
                  placeholder="e.g. Aryan Sharma"
                  className={`w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border ${
                    errors.candidateName ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                  } text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.candidateName && <span className="text-[10px] text-rose-500 font-medium mt-0.5 block">{errors.candidateName}</span>}
              </div>

              {/* 2. Team Leader (Dropdown: Rudra, Shilp, Other) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Team Leader *
                </label>
                <select
                  value={isOtherTeamLead ? 'Other' : (formData.teamLead || 'Rudra')}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'Other') {
                      setIsOtherTeamLead(true);
                      handleChange('teamLead', customTeamLead || 'Other');
                    } else {
                      setIsOtherTeamLead(false);
                      handleChange('teamLead', val);
                    }
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Rudra">Rudra</option>
                  <option value="Shilp">Shilp</option>
                  <option value="Other">Other</option>
                </select>
                {isOtherTeamLead && (
                  <input
                    type="text"
                    placeholder="Enter custom Team Leader name"
                    value={customTeamLead}
                    onChange={(e) => {
                      setCustomTeamLead(e.target.value);
                      handleChange('teamLead', e.target.value || 'Other');
                    }}
                    className="mt-1.5 w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-blue-400 dark:border-blue-500 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>

              {/* 3. PO Type (Dropdown: 1 st, 2 nd, 3 rd, BGC) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  PO Type *
                </label>
                <select
                  value={formData.poType || '1 st'}
                  onChange={(e) => handleChange('poType', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1 st">1 st</option>
                  <option value="2 nd">2 nd</option>
                  <option value="3 rd">3 rd</option>
                  <option value="BGC">BGC</option>
                </select>
              </div>

              {/* 4. Sales Person */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sales Person *
                </label>
                <input
                  type="text"
                  value={formData.salesPerson || ''}
                  onChange={(e) => handleChange('salesPerson', e.target.value)}
                  placeholder="e.g. Vikram Joshi"
                  className={`w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border ${
                    errors.salesPerson ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                  } text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.salesPerson && <span className="text-[10px] text-rose-500 font-medium mt-0.5 block">{errors.salesPerson}</span>}
              </div>

              {/* 5. Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.personalEmail || ''}
                  onChange={(e) => handleChange('personalEmail', e.target.value)}
                  placeholder="candidate@gmail.com"
                  className={`w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border ${
                    errors.personalEmail ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                  } text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.personalEmail && <span className="text-[10px] text-rose-500 font-medium mt-0.5 block">{errors.personalEmail}</span>}
              </div>

              {/* 6. Mobile */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mobile *
                </label>
                <input
                  type="text"
                  value={formData.personalPhone || ''}
                  onChange={(e) => handleChange('personalPhone', e.target.value)}
                  placeholder="+1 (555) 019-2831"
                  className={`w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border ${
                    errors.personalPhone ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                  } text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.personalPhone && <span className="text-[10px] text-rose-500 font-medium mt-0.5 block">{errors.personalPhone}</span>}
              </div>
            </div>
          </div>

          {/* Section 2: Financial & Slot Structure */}
          <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200/60 dark:border-white/5 space-y-4">
            <h3 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-3.5 h-3.5" />
              2. Financials, Joining & Slot Amounts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 7. Joining Date (Not Mandatory with Live Options & Reminders) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Joining Date
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsJoiningDateOptionsOpen(!isJoiningDateOptionsOpen)}
                    className="text-[10px] font-bold text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Calendar className="w-3 h-3" />
                    {isJoiningDateOptionsOpen ? 'Hide Options' : 'Date Options'}
                  </button>
                </div>
                <input
                  type="date"
                  value={formData.joiningDateEndClient || ''}
                  onChange={(e) => {
                    handleChange('joiningDateEndClient', e.target.value);
                    if (e.target.value) {
                      handleChange('joiningDateStatus', 'SET');
                    }
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="mt-1 flex items-center justify-between text-[10px]">
                  {formData.joiningDateEndClient ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Status: Set ({formData.joiningDateEndClient})
                    </span>
                  ) : formData.joiningDateStatus === 'TO_BE_UPDATED' ? (
                    <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Status: To Be Updated (Reminder Active)
                    </span>
                  ) : (
                    <span className="text-slate-400">Optional (Not finalized)</span>
                  )}
                </div>
              </div>

              {/* Joining Date Options & Reminders Expandable Box */}
              {isJoiningDateOptionsOpen && (
                <div className="col-span-1 md:col-span-3 p-3.5 rounded-2xl bg-blue-50/70 dark:bg-slate-800/80 border border-blue-200 dark:border-blue-900/50 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-blue-200/60 dark:border-slate-700">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                        Joining Date Management & Reminders
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        formData.joiningDateEndClient
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : formData.joiningDateStatus === 'TO_BE_UPDATED'
                          ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400'
                          : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {formData.joiningDateEndClient
                        ? 'Status: Updated'
                        : formData.joiningDateStatus === 'TO_BE_UPDATED'
                        ? 'Status: To Be Updated'
                        : 'Status: Pending'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Option 1: Official Joining Date */}
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2">
                      <span className="font-extrabold text-slate-900 dark:text-white text-xs block">
                        1. Add Official Joining Date
                      </span>
                      <p className="text-[10px] text-slate-500 leading-tight">
                        Enter finalized joining date. Automatically aligns installment due dates and resolves pending alerts.
                      </p>
                      <input
                        type="date"
                        value={formData.joiningDateEndClient || ''}
                        onChange={(e) => {
                          handleChange('joiningDateEndClient', e.target.value);
                          if (e.target.value) {
                            handleChange('joiningDateStatus', 'SET');
                          }
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Option 2: Mark as To Be Updated */}
                    <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-2 flex flex-col justify-between">
                      <div>
                        <span className="font-extrabold text-amber-900 dark:text-amber-300 text-xs block">
                          2. To Be Updated
                        </span>
                        <p className="text-[10px] text-amber-800/80 dark:text-amber-400/80 leading-tight">
                          Mark date as pending. Automatically creates a persistent dashboard reminder for follow-up.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          handleChange('joiningDateEndClient', '');
                          handleChange('joiningDateStatus', 'TO_BE_UPDATED');
                        }}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          formData.joiningDateStatus === 'TO_BE_UPDATED' && !formData.joiningDateEndClient
                            ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-400'
                            : 'bg-amber-100 hover:bg-amber-200 text-amber-900 dark:bg-amber-900/50 dark:text-amber-200'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        {formData.joiningDateStatus === 'TO_BE_UPDATED' && !formData.joiningDateEndClient
                          ? '✓ Marked as To Be Updated'
                          : 'Mark as To Be Updated'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 8. Upfront Amount */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Upfront Amount ($)
                </label>
                <input
                  type="number"
                  value={formData.upfrontAmount ?? ''}
                  onChange={(e) => handleNumberInput('upfrontAmount', e.target.value)}
                  placeholder="2000"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-tabular focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 9. BGC/OFFER Amount with Split Option */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    BGC/OFFER Amount ($)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (!isBgcOfferSplitOpen) {
                        setIsBgcOfferSplitOpen(true);
                        if (bgcOfferSplits.length === 0) {
                          const total = formData.bgcOfferAmount ?? 2500;
                          const half = Math.round(total / 2);
                          const baseDate = formData.onOfferPaymentDate || new Date().toISOString().split('T')[0];
                          const nextDate = new Date(baseDate);
                          nextDate.setDate(nextDate.getDate() + 15);
                          setBgcOfferSplits([
                            { number: 1, amount: half, dueDate: baseDate },
                            { number: 2, amount: total - half, dueDate: nextDate.toISOString().split('T')[0] },
                          ]);
                        }
                      } else {
                        setIsBgcOfferSplitOpen(false);
                      }
                    }}
                    className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    {isBgcOfferSplitOpen ? 'Hide Splits' : '+ Add Split'}
                  </button>
                </div>
                <input
                  type="number"
                  value={formData.bgcOfferAmount ?? ''}
                  onChange={(e) => handleNumberInput('bgcOfferAmount', e.target.value)}
                  placeholder="2500"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-tabular focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {isBgcOfferSplitOpen && bgcOfferSplits.length > 0 && (
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
                    <span>✂️ Split into {bgcOfferSplits.length} parts (${bgcOfferSplits.reduce((s, i) => s + (Number(i.amount) || 0), 0).toLocaleString()})</span>
                  </div>
                )}
              </div>

              {/* 10. On Offer Payment Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  On Offer Payment Date
                </label>
                <input
                  type="date"
                  value={formData.onOfferPaymentDate || ''}
                  onChange={(e) => handleChange('onOfferPaymentDate', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 11. Total Slot Amount */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Total Slot Amount ($)
                </label>
                <input
                  type="number"
                  value={formData.totalSlotAmount ?? ''}
                  onChange={(e) => handleNumberInput('totalSlotAmount', e.target.value)}
                  placeholder="8400"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-tabular focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 12. Total Slot Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Total Slot Number
                </label>
                <input
                  type="number"
                  value={formData.totalSlotNumber ?? ''}
                  onChange={(e) => handleNumberInput('totalSlotNumber', e.target.value)}
                  placeholder="4"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-tabular focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* BGC Offer Amount Splits Panel */}
            {isBgcOfferSplitOpen && (
              <div className="mt-3 p-4 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-blue-50/50 to-transparent dark:from-slate-800/90 dark:to-slate-900/60 border border-indigo-200 dark:border-indigo-900/50 space-y-3 animate-in fade-in duration-200">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-indigo-200/60 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                      $
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                        BGC / Offer Amount Splits
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 font-bold">
                          {bgcOfferSplits.length} Parts
                        </span>
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        Compliance member can customize as many BGC installment splits as needed.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-semibold mr-1">Presets:</span>
                    <button
                      type="button"
                      onClick={() => handleAutoSplitBgcOffer(2)}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-indigo-50 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
                    >
                      2 Splits
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAutoSplitBgcOffer(3)}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-indigo-50 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
                    >
                      3 Splits
                    </button>
                    <button
                      type="button"
                      onClick={handleAddBgcOfferSplit}
                      className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Add Another Split
                    </button>
                  </div>
                </div>

                {/* Splits Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-1">
                  {bgcOfferSplits.map((split, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-950 shadow-2xs space-y-2 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold text-indigo-900 dark:text-indigo-300">
                          BGC Split #{split.number}
                        </span>
                        {bgcOfferSplits.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveBgcOfferSplit(index)}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="Remove split"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Split Amount ($)</label>
                        <input
                          type="number"
                          value={split.amount ?? ''}
                          onChange={(e) => handleBgcOfferSplitChange(index, 'amount', e.target.value)}
                          className="w-full px-2.5 py-1 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-tabular font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Due Date</label>
                        <input
                          type="date"
                          value={split.dueDate || ''}
                          onChange={(e) => handleBgcOfferSplitChange(index, 'dueDate', e.target.value)}
                          className="w-full px-2 py-1 text-[11px] rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Balance & Summary Bar */}
                <div className="flex flex-wrap items-center justify-between text-[11px] px-3.5 py-2 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-indigo-200/60 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">
                    Total BGC Splits Allocated:{' '}
                    <strong className="text-indigo-700 dark:text-indigo-300 font-bold">
                      ${bgcOfferSplits.reduce((s, i) => s + (Number(i.amount) || 0), 0).toLocaleString()}
                    </strong>{' '}
                    across {bgcOfferSplits.length} split{bgcOfferSplits.length > 1 ? 's' : ''}
                  </span>
                  {bgcOfferSplits.reduce((s, i) => s + (Number(i.amount) || 0), 0) === (formData.bgcOfferAmount ?? 2500) ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Splits Match BGC Total (${(formData.bgcOfferAmount ?? 2500).toLocaleString()})
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-amber-600 dark:text-amber-400 font-bold">
                        Target Total: ${(formData.bgcOfferAmount ?? 2500).toLocaleString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const total = bgcOfferSplits.reduce((s, i) => s + (Number(i.amount) || 0), 0);
                          handleChange('bgcOfferAmount', total);
                        }}
                        className="px-2 py-0.5 rounded-md bg-indigo-100 hover:bg-indigo-200 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 text-[10px] font-bold transition-colors cursor-pointer"
                      >
                        Sync BGC Amount to Splits
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Interactive Slot Payment Scheduler (One-Shot vs Multi-Slot Builder for Compliance) */}
            <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-white/10 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Payment Structure:</span>
                  <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-700/80 p-0.5 rounded-xl text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => {
                        setIsOneShot(false);
                        if (customSlots.length <= 1) handleAutoSplit(4);
                      }}
                      className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                        !isOneShot
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                      }`}
                    >
                      Multi-Slot Installments
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsOneShot(true)}
                      className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                        isOneShot
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                      }`}
                    >
                      One-Shot Full Payment
                    </button>
                  </div>
                </div>

                {!isOneShot && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-semibold">Presets:</span>
                    {[2, 3, 4, 5].map((cnt) => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => handleAutoSplit(cnt)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                          customSlots.length === cnt
                            ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-cyan-400'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {cnt} Slots
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddSlot}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer ml-1"
                    >
                      <Plus className="w-3 h-3" />
                      Add Slot
                    </button>
                  </div>
                )}
              </div>

              {/* Slot Cards List */}
              {isOneShot ? (
                <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-blue-950 dark:text-cyan-300 block">Single Lump Sum Payment</span>
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">Due Date: {formData.joiningDateEndClient || 'Joining Date'}</span>
                  </div>
                  <span className="text-base font-black text-blue-700 dark:text-cyan-400 font-tabular">
                    ${(formData.totalSlotAmount || 8400).toLocaleString()}
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                    {customSlots.map((slot, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-2 relative group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-cyan-400 border border-blue-200 dark:border-blue-800">
                            Slot #{slot.number}
                          </span>
                          {customSlots.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveSlot(index)}
                              title="Delete slot"
                              className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Amount */}
                        <div>
                          <label className="block text-[10px] text-slate-400 font-medium mb-0.5">Amount ($)</label>
                          <input
                            type="number"
                            value={slot.amount ?? ''}
                            onChange={(e) => handleSlotChange(index, 'amount', e.target.value)}
                            className="w-full px-2 py-1 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-tabular font-bold"
                          />
                        </div>

                        {/* Due Date */}
                        <div>
                          <label className="block text-[10px] text-slate-400 font-medium mb-0.5">Due Date</label>
                          <input
                            type="date"
                            value={slot.dueDate}
                            onChange={(e) => handleSlotChange(index, 'dueDate', e.target.value)}
                            className="w-full px-2 py-1 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Allocated Balance Check */}
                  <div className="flex items-center justify-between text-[11px] px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500 dark:text-slate-400">
                      Total Allocated: <strong className="text-slate-800 dark:text-slate-200">${customSlots.reduce((s, i) => s + i.amount, 0).toLocaleString()}</strong> across {customSlots.length} slots
                    </span>
                    {customSlots.reduce((s, i) => s + i.amount, 0) === (formData.totalSlotAmount || 8400) ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Slots Match Total Amount
                      </span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 font-bold">
                        Target Total: ${(formData.totalSlotAmount || 8400).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: BGC Verification Details (Optional) */}
          <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200/60 dark:border-white/5 space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200/60 dark:border-slate-750">
              <h3 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Building className="w-3.5 h-3.5" />
                3. BGC Agency, Employer & Reference Checks (Optional)
              </h3>
              <span className="text-[10px] text-slate-400 font-semibold bg-slate-100 dark:bg-slate-700/60 px-2 py-0.5 rounded-full">
                Optional
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 13. BGC Done By (Dropdown: Imran, Deepak) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  BGC Done By
                </label>
                <select
                  value={formData.bgcDoneBy || 'Imran'}
                  onChange={(e) => handleChange('bgcDoneBy', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Imran">Imran</option>
                  <option value="Deepak">Deepak</option>
                </select>
              </div>

              {/* 14. Client/Employer Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Client/Employer Name
                </label>
                <input
                  type="text"
                  value={formData.clientEmployerName || ''}
                  onChange={(e) => handleChange('clientEmployerName', e.target.value)}
                  placeholder="e.g. Morgan Stanley / Citi"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 15. BGC Company Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  BGC Company Name
                </label>
                <input
                  type="text"
                  value={formData.bgcCompanyName || ''}
                  onChange={(e) => handleChange('bgcCompanyName', e.target.value)}
                  placeholder="e.g. FirstAdvantage / HireRight"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 16. BGC Start Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  BGC Start Date
                </label>
                <input
                  type="date"
                  value={formData.bgcStartDate || ''}
                  onChange={(e) => handleChange('bgcStartDate', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 17. Email Reference Given (Dropdown: Yes / No) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Reference Given
                </label>
                <select
                  value={formData.emailReferenceGiven === 'No' || formData.emailReferenceGiven === false ? 'No' : 'Yes'}
                  onChange={(e) => handleChange('emailReferenceGiven', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              {/* 18. Phone Reference (Dropdown: Yes / No) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Reference Given
                </label>
                <select
                  value={formData.phoneReferenceGiven === 'No' || formData.phoneReferenceGiven === false ? 'No' : 'Yes'}
                  onChange={(e) => handleChange('phoneReferenceGiven', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              {/* 19. BGC End Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  BGC End Date
                </label>
                <input
                  type="date"
                  value={formData.bgcEndDate || ''}
                  onChange={(e) => handleChange('bgcEndDate', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 20. BGC Status (Dropdown) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  BGC Status
                </label>
                <select
                  value={formData.bgcOfferStatus || 'INITIATED'}
                  onChange={(e) => handleChange('bgcOfferStatus', e.target.value as BgcStatus)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                >
                  <option value="INITIATED">INITIATED</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="CLEARED">CLEARED</option>
                  <option value="FLAGGED">FLAGGED</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: BGC Verification Attachment & Payment Proof */}
          <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Paperclip className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                4. BGC Verification Attachment & Payment Proof
              </h3>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                Visible to Accounts Desk
              </span>
            </div>

            {formData.bgcPaymentProofDataUrl ? (
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-cyan-300 flex items-center justify-center flex-shrink-0 font-bold">
                    <Paperclip className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {formData.bgcPaymentProofName || 'Verification_Proof.pdf'}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {formData.bgcPaymentProofSize || 'Document Attached'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleChange('bgcPaymentProofName', undefined);
                    handleChange('bgcPaymentProofDataUrl', undefined);
                    handleChange('bgcPaymentProofSize', undefined);
                    handleChange('bgcPaymentProofType', undefined);
                  }}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                  title="Remove attachment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-cyan-400 rounded-xl p-4 flex flex-col items-center justify-center bg-white/70 dark:bg-slate-900/60 cursor-pointer transition-all group">
                <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-cyan-400 mb-1 transition-colors" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Click to upload BGC Verification Document or Payment Screenshot
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  PNG, JPG, PDF, Word, Excel (Max 15MB)
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 15 * 1024 * 1024) {
                      alert('File exceeds 15 MB limit.');
                      return;
                    }
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const dataUrl = event.target?.result as string;
                      const sizeFormatted = file.size > 1024 * 1024
                        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
                        : `${Math.round(file.size / 1024)} KB`;
                      handleChange('bgcPaymentProofName', file.name);
                      handleChange('bgcPaymentProofDataUrl', dataUrl);
                      handleChange('bgcPaymentProofSize', sizeFormatted);
                      handleChange('bgcPaymentProofType', file.type);
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
            )}
          </div>

          {/* Form Actions Footer */}
          <div className="pt-4 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between">
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              Save as Draft
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-500 dark:text-slate-400 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Submit BGC Record
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
