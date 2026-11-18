'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle2, AlertTriangle, ExternalLink, Send, Eye, ShieldCheck, X } from 'lucide-react';
import { CandidateRecord, Installment, User } from '../types';

interface SendPaymentReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: CandidateRecord;
  installment: Installment;
  currentUser: User;
  onSuccess?: () => void;
}

export const SendPaymentReminderModal: React.FC<SendPaymentReminderModalProps> = ({
  isOpen,
  onClose,
  candidate,
  installment,
  currentUser,
  onSuccess,
}) => {
  const [paymentLink, setPaymentLink] = useState('');
  const [recipientEmail, setRecipientEmail] = useState(candidate.personalEmail || '');
  const [isTestMode, setIsTestMode] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ messageId: string; email: string } | null>(null);

  if (!isOpen) return null;

  const totalInstallments = candidate.paymentPlan?.installments?.length || candidate.numberOfInstallments || 4;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!paymentLink.trim()) {
      setErrorMsg('Please paste a payment link (e.g. https://...).');
      return;
    }

    if (!paymentLink.trim().startsWith('http://') && !paymentLink.trim().startsWith('https://')) {
      setErrorMsg('Payment link must begin with https:// or http://');
      return;
    }

    if (!recipientEmail || !recipientEmail.includes('@')) {
      setErrorMsg('A valid email address is required.');
      return;
    }

    setIsSending(true);

    try {
      const res = await fetch('/api/send-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: candidate.id,
          candidateName: candidate.candidateName,
          recipientEmail: recipientEmail.trim(),
          installmentId: installment.id,
          installmentNumber: installment.number,
          totalInstallments,
          amount: installment.amount,
          dueDate: installment.dueDate,
          paymentLink: paymentLink.trim(),
          triggeredBy: `${currentUser.name} (${currentUser.role})`,
          userId: currentUser.id,
          userRole: currentUser.role,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to dispatch email.');
      }

      setSuccessInfo({
        messageId: data.messageId || 'SENT',
        email: data.recipientEmail || recipientEmail,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Error dispatching reminder:', err);
      setErrorMsg(err.message || 'Error communicating with Gmail SMTP server. Please verify credentials.');
    } finally {
      setIsSending(false);
    }
  };

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(installment.amount);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-blue-200 border border-white/20">
              <Mail className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Send Payment Reminder Email
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Gmail Live Gateway
                </span>
              </h3>
              <p className="text-xs text-blue-200">
                Official dispatch from <span className="font-mono text-white font-medium">enroll@netbounceplacement.com</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {successInfo ? (
            /* Success State */
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">Email Dispatched Successfully!</h4>
                <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
                  A high-contrast branded reminder with your payment link has been delivered to:
                </p>
                <div className="mt-2 inline-block px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg text-sm font-semibold text-blue-700 font-mono">
                  {successInfo.email}
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left text-xs space-y-1.5 text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-500">Candidate:</span>
                  <span className="font-semibold text-slate-800">{candidate.candidateName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Installment:</span>
                  <span className="font-semibold text-slate-800">Installment #{installment.number} of {totalInstallments} ({formattedAmount})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Scheduled Due Date:</span>
                  <span className="font-semibold text-slate-800">{installment.dueDate} (EST)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Sender Gateway:</span>
                  <span className="font-mono text-slate-800">enroll@netbounceplacement.com</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-sm transition-colors shadow-md"
              >
                Close & Return to Dashboard
              </button>
            </div>
          ) : (
            /* Form View */
            <form onSubmit={handleSend} className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-700 text-xs">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-500" />
                  <div>
                    <span className="font-semibold">Dispatch Failed:</span> {errorMsg}
                  </div>
                </div>
              )}

              {/* Pre-filled Installment & Candidate Information */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-xs">
                  <span className="text-slate-500">Candidate Name:</span>
                  <span className="font-bold text-slate-800 text-sm">{candidate.candidateName}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">Installment:</span>
                    <span className="font-bold text-blue-700">Installment #{installment.number} of {totalInstallments}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Amount Due:</span>
                    <span className="font-bold text-emerald-700 text-sm">{formattedAmount}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Due Date (EST):</span>
                    <span className="font-semibold text-slate-800">{installment.dueDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">T-3 Dispatch Time:</span>
                    <span className="font-semibold text-slate-800">09:00 AM IST</span>
                  </div>
                </div>
              </div>

              {/* Recipient Email Address with Test Mode Option */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Recipient Email Address <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsTestMode(!isTestMode);
                      if (isTestMode) {
                        setRecipientEmail(candidate.personalEmail);
                      }
                    }}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 underline"
                  >
                    {isTestMode ? '← Reset to Candidate Email' : '🧪 Test with your own Email'}
                  </button>
                </div>

                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  required
                  placeholder="candidate.personal@gmail.com"
                  className={`w-full px-3.5 py-2 text-sm rounded-xl border ${
                    isTestMode
                      ? 'border-amber-400 bg-amber-50/50 text-amber-900 focus:ring-amber-500'
                      : 'border-slate-300 bg-white text-slate-900 focus:ring-blue-500'
                  } focus:outline-none focus:ring-2`}
                />
                <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  {isTestMode ? (
                    <span className="text-amber-700 font-medium">
                      Test Mode: Enter your own email (e.g. your Gmail) to preview how it arrives!
                    </span>
                  ) : (
                    <span>Strict compliance rule: Sent strictly to candidate's personal inbox only.</span>
                  )}
                </p>
              </div>

              {/* User Payment Link Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Payment / Checkout Link <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setPaymentLink(
                        `https://pay.netbounceplacement.com/checkout?candidate=${encodeURIComponent(
                          candidate.candidateName
                        )}&inst=${installment.number}&amount=${installment.amount}`
                      )
                    }
                    className="text-[11px] font-medium text-slate-500 hover:text-blue-600"
                  >
                    + Paste Sample NetBounce Link
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="url"
                    value={paymentLink}
                    onChange={(e) => setPaymentLink(e.target.value)}
                    required
                    placeholder="https://buy.stripe.com/... or https://pay.netbounceplacement.com/..."
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none pr-10 font-mono text-slate-800 placeholder:text-slate-400"
                  />
                  <ExternalLink className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Paste the unique payment link. Candidate will see a large blue "Complete Payment" button directing here.
                </p>
              </div>

              {/* Live Preview Toggle */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-slate-200"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-600" />
                  {showPreview ? 'Hide Email Template Preview' : 'Preview Branded Email Template (Blue & White Theme)'}
                </button>

                {showPreview && (
                  <div className="mt-3 p-4 bg-slate-100 rounded-xl border border-slate-300 text-xs space-y-3">
                    {/* Simulated Email Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                      <div className="p-3 bg-white border-b-2 border-blue-600 flex justify-between items-center">
                        <div className="text-xs font-black tracking-tight">
                          <span className="text-slate-900">NET</span>
                          <span className="text-blue-600">BOUNCE</span>
                          <span className="text-[10px] text-slate-500 font-normal ml-1">PLACEMENT LLC</span>
                        </div>
                        <span className="text-[9px] font-bold uppercase bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                          Official Notice
                        </span>
                      </div>
                      <div className="p-4 space-y-2">
                        <div className="text-xs text-slate-800 font-bold">
                          Dear {candidate.candidateName},
                        </div>
                        <p className="text-[11px] text-slate-600">
                          Upcoming placement fee reminder for Installment #{installment.number} of {totalInstallments}:
                        </p>
                        <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg text-center">
                          <div className="text-base font-extrabold text-blue-900">{formattedAmount} USD</div>
                          <div className="text-[10px] text-rose-600 font-semibold">Due on {installment.dueDate} (EST)</div>
                        </div>
                        <div className="pt-1 text-center">
                          <div className="w-full py-2 bg-blue-600 text-white font-bold rounded-lg text-xs shadow-sm">
                            Complete Payment ({formattedAmount}) &rarr;
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSending}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="flex-1 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isSending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending Email...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Live Reminder Now</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

