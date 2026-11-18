'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check, AlertCircle, Save } from 'lucide-react';
import { CandidateRecord, BgcStatus } from '../types';

interface PoDetailFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveDraft: (data: Partial<CandidateRecord>) => void;
  onSubmitForm: (data: Partial<CandidateRecord>) => void;
  initialData?: CandidateRecord | null;
}

export const PoDetailFormModal: React.FC<PoDetailFormModalProps> = ({
  isOpen,
  onClose,
  onSaveDraft,
  onSubmitForm,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    candidateName: initialData?.candidateName || '',
    personalEmail: initialData?.personalEmail || '',
    personalPhone: initialData?.personalPhone || '',
    marketingEmail: initialData?.marketingEmail || '',
    marketingPhone: initialData?.marketingPhone || '',
    marketingStartDate: initialData?.marketingStartDate || '',
    marketingEndDate: initialData?.marketingEndDate || '',
    interviewSupportTaken: initialData?.interviewSupportTaken || false,
    salesPerson: initialData?.salesPerson || '',
    manager: initialData?.manager || '',
    teamLead: initialData?.teamLead || '',
    seniorRecruiter: initialData?.seniorRecruiter || '',
    jobRole: initialData?.jobRole || '',
    jobLocation: initialData?.jobLocation || '',
    endClient: initialData?.endClient || '',
    implementationPartner: initialData?.implementationPartner || '',
    poMonth: initialData?.poMonth || 'November 2026',
    packageRate: initialData?.packageRate || '',
    annualIncome: initialData?.annualIncome ? String(initialData.annualIncome) : '',
    upfrontAmount: initialData?.upfrontAmount ? String(initialData.upfrontAmount) : '2000',
    bgcOfferStatus: (initialData?.bgcOfferStatus as BgcStatus) || 'INITIATED',
    joiningDateEndClient: initialData?.joiningDateEndClient || '',
    joiningDateCompany: initialData?.joiningDateCompany || '',
    agreementEndPercentMonths: initialData?.agreementEndPercentMonths || '15% for 6 months',
    finalAgreedPaymentCondition: initialData?.finalAgreedPaymentCondition || '',
    numberOfInstallments: initialData?.numberOfInstallments || 4,
    remarks: initialData?.remarks || '',
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        candidateName: initialData?.candidateName || '',
        personalEmail: initialData?.personalEmail || '',
        personalPhone: initialData?.personalPhone || '',
        marketingEmail: initialData?.marketingEmail || '',
        marketingPhone: initialData?.marketingPhone || '',
        marketingStartDate: initialData?.marketingStartDate || '',
        marketingEndDate: initialData?.marketingEndDate || '',
        interviewSupportTaken: initialData?.interviewSupportTaken || false,
        salesPerson: initialData?.salesPerson || '',
        manager: initialData?.manager || '',
        teamLead: initialData?.teamLead || '',
        seniorRecruiter: initialData?.seniorRecruiter || '',
        jobRole: initialData?.jobRole || '',
        jobLocation: initialData?.jobLocation || '',
        endClient: initialData?.endClient || '',
        implementationPartner: initialData?.implementationPartner || '',
        poMonth: initialData?.poMonth || 'November 2026',
        packageRate: initialData?.packageRate || '',
        annualIncome: initialData?.annualIncome ? String(initialData.annualIncome) : '',
        upfrontAmount: initialData?.upfrontAmount ? String(initialData.upfrontAmount) : '2000',
        bgcOfferStatus: (initialData?.bgcOfferStatus as BgcStatus) || 'INITIATED',
        joiningDateEndClient: initialData?.joiningDateEndClient || '',
        joiningDateCompany: initialData?.joiningDateCompany || '',
        agreementEndPercentMonths: initialData?.agreementEndPercentMonths || '15% for 6 months',
        finalAgreedPaymentCondition: initialData?.finalAgreedPaymentCondition || '',
        numberOfInstallments: initialData?.numberOfInstallments || 4,
        remarks: initialData?.remarks || '',
      });
      setValidationErrors([]);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      const clean = value.replace(/^0+(?=\d)/, '');
      setFormData((prev) => ({ ...prev, [name]: clean === '' ? '' : Number(clean) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDraft = () => {
    onSaveDraft({
      id: initialData?.id,
      ...formData,
      annualIncome: Number(formData.annualIncome) || 0,
      upfrontAmount: Number(formData.upfrontAmount) || 0,
      numberOfInstallments: Number(formData.numberOfInstallments) || 4,
    });
    onClose();
  };

  const handleSubmit = () => {
    const errors: string[] = [];

    if (!formData.candidateName.trim()) errors.push('Candidate Name is required');
    if (!formData.personalEmail.trim()) errors.push('Personal Email is required');
    if (!formData.personalPhone.trim()) errors.push('Personal Phone is required');
    if (!formData.salesPerson.trim()) errors.push('Sales Person is required');
    if (!formData.jobRole.trim()) errors.push('Job Role is required');
    if (!formData.endClient.trim()) errors.push('End Client is required');
    if (!formData.annualIncome || Number(formData.annualIncome) <= 0)
      errors.push('Annual Income must be a positive number');
    if (!formData.upfrontAmount || Number(formData.upfrontAmount) <= 0)
      errors.push('Upfront Amount must be a positive number');
    if (!formData.joiningDateEndClient.trim()) errors.push('Joining Date (End Client) is required');
    if (!formData.finalAgreedPaymentCondition.trim())
      errors.push('Final Agreed Payment Condition is required');

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);
    onSubmitForm({
      id: initialData?.id,
      ...formData,
      annualIncome: Number(formData.annualIncome),
      upfrontAmount: Number(formData.upfrontAmount),
      numberOfInstallments: Number(formData.numberOfInstallments) || 4,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white/95 backdrop-blur-2xl border border-white/80 rounded-[32px] shadow-[0_25px_60px_rgba(15,23,42,0.15)] max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-slate-900">
        {/* Header */}
        <div className="px-7 py-5 border-b border-black/[0.06] flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-blue-50 border border-blue-200/70 flex items-center justify-center text-blue-600 shadow-xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Placement Offer (PO) Detail Form</h2>
              <p className="text-[11px] text-slate-500 font-medium">8-Group Compliance Onboarding & Schedule Initialization</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200/80 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Validation Errors Alert */}
        {validationErrors.length > 0 && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 shadow-xs">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
            <div>
              <p className="font-bold mb-1 text-rose-900">Please fill the mandatory fields before submitting:</p>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-700 font-medium">
                {validationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-800">
          {/* Group 1: Candidate Info */}
          <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-3 shadow-xs">
            <h3 className="text-xs font-bold text-blue-600 tracking-wider uppercase">1. Candidate Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Candidate Name *</label>
                <input
                  type="text"
                  name="candidateName"
                  value={formData.candidateName}
                  onChange={handleChange}
                  placeholder="e.g. Aryan Sharma"
                  className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs shadow-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Personal Email * (Reminders)</label>
                <input
                  type="email"
                  name="personalEmail"
                  value={formData.personalEmail}
                  onChange={handleChange}
                  placeholder="aryan@gmail.com"
                  className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs shadow-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Personal Phone *</label>
                <input
                  type="text"
                  name="personalPhone"
                  value={formData.personalPhone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* Group 2: Marketing Details */}
          <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-3 shadow-xs">
            <h3 className="text-xs font-bold text-blue-600 tracking-wider uppercase">2. Marketing Details (Confidential)</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Personal Mail ID</label>
                <input
                  type="email"
                  name="marketingEmail"
                  value={formData.marketingEmail}
                  onChange={handleChange}
                  placeholder="personal.mail@domain.com"
                  className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs shadow-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Personal Number</label>
                <input
                  type="text"
                  name="marketingPhone"
                  value={formData.marketingPhone}
                  onChange={handleChange}
                  placeholder="+1 (555) 019-2831"
                  className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs shadow-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Start Date</label>
                <input
                  type="date"
                  name="marketingStartDate"
                  value={formData.marketingStartDate}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs shadow-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">End Date</label>
                <input
                  type="date"
                  name="marketingEndDate"
                  value={formData.marketingEndDate}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs shadow-xs"
                />
              </div>
            </div>
            <div className="pt-1 flex items-center gap-2">
              <input
                type="checkbox"
                id="interviewSupport"
                name="interviewSupportTaken"
                checked={formData.interviewSupportTaken}
                onChange={handleChange}
                className="rounded border-slate-300 text-blue-600 focus:ring-0"
              />
              <label htmlFor="interviewSupport" className="text-xs text-slate-700 cursor-pointer font-medium">
                Interview support was taken by the candidate
              </label>
            </div>
          </div>

          {/* Group 3: Sales Team */}
          <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-3 shadow-xs">
            <h3 className="text-xs font-bold text-blue-600 tracking-wider uppercase">3. Sales & Team Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Sales Person *</label>
                <input
                  type="text"
                  name="salesPerson"
                  value={formData.salesPerson}
                  onChange={handleChange}
                  placeholder="e.g. Vikram Joshi"
                  className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs shadow-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Manager</label>
                <input
                  type="text"
                  name="manager"
                  value={formData.manager}
                  onChange={handleChange}
                  placeholder="e.g. Alok Verma"
                  className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs shadow-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Team Lead</label>
                <input
                  type="text"
                  name="teamLead"
                  value={formData.teamLead}
                  onChange={handleChange}
                  placeholder="e.g. Rohit Kulkarni"
                  className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs shadow-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Senior Recruiter</label>
                <input
                  type="text"
                  name="seniorRecruiter"
                  value={formData.seniorRecruiter}
                  onChange={handleChange}
                  placeholder="e.g. Neha Sharma"
                  className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* Group 4: Role & Client */}
          <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-3 shadow-xs">
            <h3 className="text-xs font-bold text-blue-600 tracking-wider uppercase">4. Placement & Client Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Job Role *</label>
                <input
                  type="text"
                  name="jobRole"
                  value={formData.jobRole}
                  onChange={handleChange}
                  placeholder="e.g. Lead Cloud Architect"
                  className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs shadow-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Job Location</label>
                <input
                  type="text"
                  name="jobLocation"
                  value={formData.jobLocation}
                  onChange={handleChange}
                  placeholder="e.g. Mumbai / Hybrid"
                  className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs shadow-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">End Client *</label>
                <input
                  type="text"
                  name="endClient"
                  value={formData.endClient}
                  onChange={handleChange}
                  placeholder="e.g. Morgan Stanley"
                  className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs shadow-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Implementation Partner</label>
                <input
                  type="text"
                  name="implementationPartner"
                  value={formData.implementationPartner}
                  onChange={handleChange}
                  placeholder="e.g. Wipro / TCS"
                  className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* Group 5: Compensation */}
          <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-3 shadow-xs">
            <h3 className="text-xs font-bold text-blue-600 tracking-wider uppercase">5. Compensation & Upfront Terms</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">PO Month</label>
                <input
                  type="text"
                  name="poMonth"
                  value={formData.poMonth}
                  onChange={handleChange}
                  placeholder="November 2026"
                  className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs shadow-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Package Rate</label>
                <input
                  type="text"
                  name="packageRate"
                  value={formData.packageRate}
                  onChange={handleChange}
                  placeholder="$75 / hr or 24 LPA"
                  className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs shadow-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Annual Income ($) *</label>
                <input
                  type="number"
                  name="annualIncome"
                  value={formData.annualIncome}
                  onChange={handleChange}
                  placeholder="105000"
                  className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs font-mono shadow-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Upfront Amount ($) *</label>
                <input
                  type="number"
                  name="upfrontAmount"
                  value={formData.upfrontAmount}
                  onChange={handleChange}
                  placeholder="2100"
                  className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs font-mono shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* Group 6: Verification */}
          <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-3 shadow-xs">
            <h3 className="text-xs font-bold text-blue-600 tracking-wider uppercase">6. Verification & Timeline</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">BGC Status</label>
                <select
                  name="bgcOfferStatus"
                  value={formData.bgcOfferStatus}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs shadow-xs"
                >
                  <option value="INITIATED">INITIATED</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="CLEARED">CLEARED</option>
                  <option value="FLAGGED">FLAGGED</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Joining Date (End Client) * <span className="text-blue-600 font-semibold">(Baseline)</span>
                </label>
                <input
                  type="date"
                  name="joiningDateEndClient"
                  value={formData.joiningDateEndClient}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs shadow-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Joining Date (Company)</label>
                <input
                  type="date"
                  name="joiningDateCompany"
                  value={formData.joiningDateCompany}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* Group 7: Agreement & Installments */}
          <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-3 shadow-xs">
            <h3 className="text-xs font-bold text-blue-600 tracking-wider uppercase">7. Payment Schedule Agreement</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Agreement % / Months</label>
                <input
                  type="text"
                  name="agreementEndPercentMonths"
                  value={formData.agreementEndPercentMonths}
                  onChange={handleChange}
                  placeholder="15% for 6 months"
                  className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs shadow-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Number of Installments</label>
                <select
                  name="numberOfInstallments"
                  value={formData.numberOfInstallments}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs shadow-xs"
                >
                  <option value={1}>1 Part (Full Upfront)</option>
                  <option value={2}>2 Parts (60-day cycle)</option>
                  <option value={3}>3 Parts (90-day cycle)</option>
                  <option value={4}>4 Parts (Default - 30-day cycle)</option>
                  <option value={5}>5 Parts (Extended)</option>
                  <option value={6}>6 Parts (Maximum)</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Final Agreed Condition *</label>
                <input
                  type="text"
                  name="finalAgreedPaymentCondition"
                  value={formData.finalAgreedPaymentCondition}
                  onChange={handleChange}
                  placeholder="e.g. 4 equal installments @ 30 days gap post-joining"
                  className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* Group 8: Remarks */}
          <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-2 shadow-xs">
            <h3 className="text-xs font-bold text-blue-600 tracking-wider uppercase">8. Notes & Compliance Remarks</h3>
            <textarea
              name="remarks"
              rows={2}
              value={formData.remarks}
              onChange={handleChange}
              placeholder="Any specific onboarding requirements, special approvals, or client background checks..."
              className="w-full bg-white border border-slate-200/80 rounded-xl p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none text-xs shadow-xs"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-7 py-4 border-t border-black/[0.06] bg-slate-50/60 flex items-center justify-between">
          <button
            onClick={handleDraft}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-all border border-slate-200/80 text-xs shadow-xs"
          >
            <Save className="h-4 w-4" />
            Save as Draft
          </button>
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-all border border-slate-200/80 text-xs shadow-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all text-xs shadow-[0_4px_16px_rgba(37,99,235,0.25)]"
            >
              <Check className="h-4 w-4" />
              Verify & Submit PO
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
