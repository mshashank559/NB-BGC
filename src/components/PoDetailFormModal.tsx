'use client';

import React, { useState } from 'react';
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

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDraft = () => {
    onSaveDraft({
      ...formData,
      annualIncome: Number(formData.annualIncome) || 0,
      upfrontAmount: Number(formData.upfrontAmount) || 0,
      numberOfInstallments: Number(formData.numberOfInstallments) || 4,
    });
    onClose();
  };

  const handleSubmit = () => {
    // 10 Mandatory fields validation as per PRD Section 5:
    // candidate name, personal email, personal phone, sales person, job role, end client,
    // joining date, annual income, upfront amount, final agreed payment condition.
    const errors: string[] = [];

    if (!formData.candidateName.trim()) errors.push('Candidate Name is required');
    if (!formData.personalEmail.trim()) errors.push('Personal Email is required');
    if (!formData.personalPhone.trim()) errors.push('Personal Phone is required');
    if (!formData.salesPerson.trim()) errors.push('Sales Person is required');
    if (!formData.jobRole.trim()) errors.push('Job Role is required');
    if (!formData.endClient.trim()) errors.push('End Client is required');
    if (!formData.joiningDateEndClient.trim()) errors.push('Joining Date at End Client is required');
    if (!formData.annualIncome || Number(formData.annualIncome) <= 0) errors.push('Valid Annual Income is required');
    if (!formData.upfrontAmount || Number(formData.upfrontAmount) < 0) errors.push('Upfront Amount is required');
    if (!formData.finalAgreedPaymentCondition.trim()) errors.push('Final Agreed Payment Condition is required');

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);
    onSubmitForm({
      ...formData,
      annualIncome: Number(formData.annualIncome),
      upfrontAmount: Number(formData.upfrontAmount),
      numberOfInstallments: Number(formData.numberOfInstallments),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0d1424] border border-white/10 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.9)] max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">PO Detail Form (Compliance Entry)</h2>
              <p className="text-[11px] text-slate-400">Capture Placement Offer & Agreed Payment Conditions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Validation Errors Alert */}
        {validationErrors.length > 0 && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">Please fill the mandatory fields before submitting:</p>
              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                {validationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Group 1: Candidate Info */}
          <div className="bg-slate-900/40 p-4 rounded-2xl border border-white/5">
            <h3 className="text-xs font-bold text-cyan-400 tracking-wider uppercase mb-3">1. Candidate Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Candidate Name *</label>
                <input
                  type="text"
                  name="candidateName"
                  value={formData.candidateName}
                  onChange={handleChange}
                  placeholder="e.g. Aryan Sharma"
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Personal Email * (Reminders)</label>
                <input
                  type="email"
                  name="personalEmail"
                  value={formData.personalEmail}
                  onChange={handleChange}
                  placeholder="aryan@gmail.com"
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Personal Phone *</label>
                <input
                  type="text"
                  name="personalPhone"
                  value={formData.personalPhone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Group 2: Marketing Info */}
          <div className="bg-slate-900/40 p-4 rounded-2xl border border-white/5">
            <h3 className="text-xs font-bold text-cyan-400 tracking-wider uppercase mb-3">2. Marketing Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Marketing Email</label>
                <input
                  type="email"
                  name="marketingEmail"
                  value={formData.marketingEmail}
                  onChange={handleChange}
                  placeholder="mkt.lead@talent.com"
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Marketing Phone</label>
                <input
                  type="text"
                  name="marketingPhone"
                  value={formData.marketingPhone}
                  onChange={handleChange}
                  placeholder="+91 98765 00000"
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Marketing Start Date</label>
                <input
                  type="date"
                  name="marketingStartDate"
                  value={formData.marketingStartDate}
                  onChange={handleChange}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="interviewSupportTaken"
                  name="interviewSupportTaken"
                  checked={formData.interviewSupportTaken}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-slate-700 text-cyan-500 focus:ring-cyan-500"
                />
                <label htmlFor="interviewSupportTaken" className="text-[11px] text-slate-300">
                  Interview Support Taken
                </label>
              </div>
            </div>
          </div>

          {/* Group 3: People */}
          <div className="bg-slate-900/40 p-4 rounded-2xl border border-white/5">
            <h3 className="text-xs font-bold text-cyan-400 tracking-wider uppercase mb-3">3. Internal Team</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Sales Person *</label>
                <input
                  type="text"
                  name="salesPerson"
                  value={formData.salesPerson}
                  onChange={handleChange}
                  placeholder="e.g. Vikram Joshi"
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Team Lead</label>
                <input
                  type="text"
                  name="teamLead"
                  value={formData.teamLead}
                  onChange={handleChange}
                  placeholder="e.g. Rohit Kulkarni"
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Manager</label>
                <input
                  type="text"
                  name="manager"
                  value={formData.manager}
                  onChange={handleChange}
                  placeholder="e.g. Deepak Rao"
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Senior Recruiter</label>
                <input
                  type="text"
                  name="seniorRecruiter"
                  value={formData.seniorRecruiter}
                  onChange={handleChange}
                  placeholder="e.g. Shweta Sen"
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Group 4: Placement */}
          <div className="bg-slate-900/40 p-4 rounded-2xl border border-white/5">
            <h3 className="text-xs font-bold text-cyan-400 tracking-wider uppercase mb-3">4. Placement Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Position / Job Role *</label>
                <input
                  type="text"
                  name="jobRole"
                  value={formData.jobRole}
                  onChange={handleChange}
                  placeholder="e.g. Lead Cloud Architect"
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Job Location</label>
                <input
                  type="text"
                  name="jobLocation"
                  value={formData.jobLocation}
                  onChange={handleChange}
                  placeholder="e.g. Bengaluru, India"
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">End Client *</label>
                <input
                  type="text"
                  name="endClient"
                  value={formData.endClient}
                  onChange={handleChange}
                  placeholder="e.g. Morgan Stanley"
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">PO Month</label>
                <input
                  type="text"
                  name="poMonth"
                  value={formData.poMonth}
                  onChange={handleChange}
                  placeholder="e.g. November 2026"
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Group 5: Compensation & BGC */}
          <div className="bg-slate-900/40 p-4 rounded-2xl border border-white/5">
            <h3 className="text-xs font-bold text-cyan-400 tracking-wider uppercase mb-3">5. Compensation & BGC</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Annual Income ($) *</label>
                <input
                  type="number"
                  name="annualIncome"
                  value={formData.annualIncome}
                  onChange={handleChange}
                  placeholder="e.g. 140000"
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Upfront Amount ($) *</label>
                <input
                  type="number"
                  name="upfrontAmount"
                  value={formData.upfrontAmount}
                  onChange={handleChange}
                  placeholder="e.g. 2100"
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">BGC Status</label>
                <select
                  name="bgcOfferStatus"
                  value={formData.bgcOfferStatus}
                  onChange={handleChange}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="INITIATED">Initiated</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="CLEARED">Cleared</option>
                  <option value="FLAGGED">Flagged</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Package Rate</label>
                <input
                  type="text"
                  name="packageRate"
                  value={formData.packageRate}
                  onChange={handleChange}
                  placeholder="e.g. $140k/yr"
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Group 6: Dates */}
          <div className="bg-slate-900/40 p-4 rounded-2xl border border-white/5">
            <h3 className="text-xs font-bold text-cyan-400 tracking-wider uppercase mb-3">6. Joining Dates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Joining Date at End Client *</label>
                <input
                  type="date"
                  name="joiningDateEndClient"
                  value={formData.joiningDateEndClient}
                  onChange={handleChange}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Joining Date in Company</label>
                <input
                  type="date"
                  name="joiningDateCompany"
                  value={formData.joiningDateCompany}
                  onChange={handleChange}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Group 7: Agreement & Payment Condition */}
          <div className="bg-slate-900/40 p-4 rounded-2xl border border-white/5">
            <h3 className="text-xs font-bold text-cyan-400 tracking-wider uppercase mb-3">7. Payment Agreement Terms</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Installment Count (Default: 4)</label>
                <input
                  type="number"
                  name="numberOfInstallments"
                  min="1"
                  max="12"
                  value={formData.numberOfInstallments}
                  onChange={handleChange}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Agreement End % of Months</label>
                <input
                  type="text"
                  name="agreementEndPercentMonths"
                  value={formData.agreementEndPercentMonths}
                  onChange={handleChange}
                  placeholder="e.g. 15% for 6 months"
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Final Agreed Payment Condition *</label>
              <textarea
                name="finalAgreedPaymentCondition"
                rows={2}
                value={formData.finalAgreedPaymentCondition}
                onChange={handleChange}
                placeholder="e.g. $8,400 total payable in 4 installments of $2,100 due 30 days apart"
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Group 8: Remarks */}
          <div className="bg-slate-900/40 p-4 rounded-2xl border border-white/5">
            <h3 className="text-xs font-bold text-cyan-400 tracking-wider uppercase mb-2">8. Remarks</h3>
            <textarea
              name="remarks"
              rows={2}
              value={formData.remarks}
              onChange={handleChange}
              placeholder="Any operational notes..."
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-slate-900/80 flex items-center justify-between">
          <button
            type="button"
            onClick={handleDraft}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-white/5 transition-all"
          >
            <Save className="h-4 w-4" />
            Save as Draft
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-transparent hover:bg-white/5 text-slate-400 text-xs font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 text-xs font-bold shadow-[0_0_20px_rgba(0,242,254,0.3)] transition-all"
            >
              <Check className="h-4 w-4" />
              Submit & Hand-off to Accounts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

