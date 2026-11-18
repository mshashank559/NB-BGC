'use client';

import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, CheckCircle2, Save, FileText, User, DollarSign, Calendar, Building, Phone, Mail, Plus, Trash2, Zap } from 'lucide-react';
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
    bgcDoneBy: 'Irfan',
    clientEmployerName: '',
    bgcCompanyName: '',
    bgcStartDate: '',
    emailReferenceGiven: 'Yes',
    phoneReferenceGiven: 'Yes',
    bgcEndDate: '',
    bgcOfferStatus: 'INITIATED',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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
      setFormData({
        candidateName: initialData.candidateName || '',
        teamLead: initialData.teamLead || 'Rudra',
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
        bgcDoneBy: initialData.bgcDoneBy || 'Irfan',
        clientEmployerName: initialData.clientEmployerName || initialData.endClient || '',
        bgcCompanyName: initialData.bgcCompanyName || '',
        bgcStartDate: initialData.bgcStartDate || '',
        emailReferenceGiven: initialData.emailReferenceGiven || 'Yes',
        phoneReferenceGiven: initialData.phoneReferenceGiven || 'Yes',
        bgcEndDate: initialData.bgcEndDate || '',
        bgcOfferStatus: initialData.bgcOfferStatus || 'INITIATED',
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
        bgcDoneBy: 'Irfan',
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

  const validate = (): boolean => {
    const errs: { [key: string]: string } = {};
    if (!formData.candidateName?.trim()) errs.candidateName = 'Candidate Name is required';
    if (!formData.salesPerson?.trim()) errs.salesPerson = 'Sales Person is required';
    if (!formData.personalEmail?.trim()) errs.personalEmail = 'Valid Email is required';
    if (!formData.personalPhone?.trim()) errs.personalPhone = 'Mobile number is required';
    if (!formData.joiningDateEndClient) errs.joiningDateEndClient = 'Joining date is required';
    if (!formData.clientEmployerName?.trim()) errs.clientEmployerName = 'Client/Employer name is required';

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
      isOneShotPayment: isOneShot,
      bgcSlots: finalSlots,
      totalSlotNumber: finalSlots.length,
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
      endClient: formData.clientEmployerName || formData.endClient || 'Client US',
      jobRole: formData.jobRole || 'Full Stack Engineer',
      annualIncome: formData.annualIncome || (formData.totalSlotAmount || 8400) * 12.5,
      numberOfInstallments: finalSlots.length,
      totalSlotNumber: finalSlots.length,
      isOneShotPayment: isOneShot,
      bgcSlots: finalSlots,
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

              {/* 2. Team Leader (Dropdown: Rudra, Shilp) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Team Leader *
                </label>
                <select
                  value={formData.teamLead || 'Rudra'}
                  onChange={(e) => handleChange('teamLead', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Rudra">Rudra</option>
                  <option value="Shilp">Shilp</option>
                  <option value="Rohit Kulkarni">Rohit Kulkarni</option>
                  <option value="Sneha Patel">Sneha Patel</option>
                </select>
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
              {/* 7. Joining Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Joining Date *
                </label>
                <input
                  type="date"
                  value={formData.joiningDateEndClient || ''}
                  onChange={(e) => handleChange('joiningDateEndClient', e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border ${
                    errors.joiningDateEndClient ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                  } text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.joiningDateEndClient && <span className="text-[10px] text-rose-500 font-medium mt-0.5 block">{errors.joiningDateEndClient}</span>}
              </div>

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

              {/* 9. BGC/OFFER Amount */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  BGC/OFFER Amount ($)
                </label>
                <input
                  type="number"
                  value={formData.bgcOfferAmount ?? ''}
                  onChange={(e) => handleNumberInput('bgcOfferAmount', e.target.value)}
                  placeholder="2500"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-tabular focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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

          {/* Section 3: BGC Verification Details */}
          <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200/60 dark:border-white/5 space-y-4">
            <h3 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Building className="w-3.5 h-3.5" />
              3. BGC Agency, Employer & Reference Checks
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 13. BGC Done By (Dropdown: Irfan, Deepak) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  BGC Done By *
                </label>
                <select
                  value={formData.bgcDoneBy || 'Irfan'}
                  onChange={(e) => handleChange('bgcDoneBy', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Irfan">Irfan</option>
                  <option value="Deepak">Deepak</option>
                </select>
              </div>

              {/* 14. Client/Employer Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Client/Employer Name *
                </label>
                <input
                  type="text"
                  value={formData.clientEmployerName || ''}
                  onChange={(e) => handleChange('clientEmployerName', e.target.value)}
                  placeholder="e.g. Morgan Stanley / Citi"
                  className={`w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border ${
                    errors.clientEmployerName ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                  } text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.clientEmployerName && <span className="text-[10px] text-rose-500 font-medium mt-0.5 block">{errors.clientEmployerName}</span>}
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
                  BGC Status *
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
