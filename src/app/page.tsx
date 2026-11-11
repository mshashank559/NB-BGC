'use client';

import React, { useState, useMemo } from 'react';
import { ParallaxContainer } from '../components/ParallaxContainer';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { MetricCards } from '../components/MetricCards';
import { CollectionGauge } from '../components/CollectionGauge';
import { CashFlowChart } from '../components/CashFlowChart';
import { OperationsCenter } from '../components/OperationsCenter';
import { PaymentLedger } from '../components/PaymentLedger';
import { PoDetailFormModal } from '../components/PoDetailFormModal';
import { CandidateDetailModal } from '../components/CandidateDetailModal';
import { MarkPaidModal } from '../components/MarkPaidModal';
import { EditDateAmountModal } from '../components/EditDateAmountModal';
import { CustomPaymentWindowModal } from '../components/CustomPaymentWindowModal';
import { AuditTrailModal } from '../components/AuditTrailModal';
import { ReportsModal } from '../components/ReportsModal';

import {
  CandidateRecord,
  UserRole,
  User,
  Installment,
  AuditEntry,
  InvoiceRecord,
  ReminderLog,
} from '../types';
import { MOCK_USERS, getInitialCandidates } from '../lib/mockData';
import {
  generateStandardInstallments,
  generateCustomSplitInstallments,
  generateOneShotInstallment,
  calculateReminderDate,
} from '../lib/paymentEngine';
import { generateMcpInvoice } from '../lib/mcpInvoice';

export default function DashboardPage() {
  // Current Active User & Role
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]); // Default: Admin
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Core Data States
  const [candidates, setCandidates] = useState<CandidateRecord[]>(getInitialCandidates());
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([
    {
      id: 'aud-1',
      candidateId: 'cand-1',
      candidateName: 'Aryan Sharma',
      field: 'Installment #1 Status',
      oldValue: 'PENDING',
      newValue: 'PAID',
      remark: 'Payment received via corporate bank transfer. Verified and recorded.',
      userId: 'am-1',
      userName: 'Suresh Menon (Account Mgr)',
      roleAtTime: 'ACCOUNT_MANAGER',
      createdAt: '2026-11-16T14:20:00Z',
    },
    {
      id: 'aud-2',
      candidateId: 'cand-2',
      candidateName: 'Priya Patel',
      field: 'Payment Schedule',
      oldValue: 'STANDARD_4',
      newValue: 'SPLIT_OFFER_REMAINING (2 Upfront + 5 Balance)',
      remark: 'Approved customized 2 upfront + 5 remaining installments as per individual candidate agreement.',
      userId: 'am-1',
      userName: 'Suresh Menon (Account Mgr)',
      roleAtTime: 'ACCOUNT_MANAGER',
      createdAt: '2026-11-02T11:00:00Z',
    },
  ]);

  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);

  // Modals Visibility
  const [isNewPoModalOpen, setIsNewPoModalOpen] = useState(false);
  const [isCandidateDetailModalOpen, setIsCandidateDetailModalOpen] = useState(false);
  const [isMarkPaidModalOpen, setIsMarkPaidModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCustomWindowOpen, setIsCustomWindowOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);

  // Selected Record Context
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateRecord | null>(null);
  const [selectedInstallment, setSelectedInstallment] = useState<Installment | null>(null);

  // 1-Click Role Switcher Handler
  const handleRoleChange = (role: UserRole) => {
    const user = MOCK_USERS.find((u) => u.role === role) || MOCK_USERS[0];
    setCurrentUser(user);
  };

  // Compute Master KPIs across candidates
  const { totalPayable, totalCollected, pendingBalance, overdueCount } = useMemo(() => {
    let payable = 0;
    let collected = 0;
    let overdue = 0;

    candidates.forEach((c) => {
      if (c.status === 'DRAFT') return;
      const plan = c.paymentPlan;
      if (plan) {
        payable += plan.totalPayable;
        plan.installments.forEach((inst) => {
          if (inst.status === 'PAID') {
            collected += inst.amount;
          } else if (inst.status === 'OVERDUE') {
            overdue += 1;
          }
        });
      } else {
        payable += c.upfrontAmount;
      }
    });

    const balance = Math.max(0, payable - collected);
    return {
      totalPayable: payable,
      totalCollected: collected,
      pendingBalance: balance,
      overdueCount: overdue,
    };
  }, [candidates]);

  // Handler: Save PO Form as Draft
  const handleSaveDraft = (data: Partial<CandidateRecord>) => {
    const newDraft: CandidateRecord = {
      id: `cand-${Date.now().toString(36)}`,
      candidateName: data.candidateName || 'Draft Candidate',
      personalEmail: data.personalEmail || '',
      personalPhone: data.personalPhone || '',
      salesPerson: data.salesPerson || '',
      teamLead: data.teamLead || '',
      jobRole: data.jobRole || '',
      endClient: data.endClient || '',
      poMonth: data.poMonth || 'November 2026',
      annualIncome: data.annualIncome || 0,
      upfrontAmount: data.upfrontAmount || 0,
      bgcOfferStatus: data.bgcOfferStatus || 'INITIATED',
      joiningDateEndClient: data.joiningDateEndClient || '',
      finalAgreedPaymentCondition: data.finalAgreedPaymentCondition || '',
      numberOfInstallments: data.numberOfInstallments || 4,
      remarks: data.remarks || 'Draft saved by compliance manager.',
      status: 'DRAFT',
      createdBy: currentUser.id,
      createdByName: currentUser.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCandidates((prev) => [newDraft, ...prev]);
  };

  // Handler: Submit PO Form (Atomic Transition to SUBMITTED + Auto-Handoff)
  const handleSubmitPoForm = (data: Partial<CandidateRecord>) => {
    const count = data.numberOfInstallments || 4;
    const joiningDate = data.joiningDateEndClient || new Date().toISOString().split('T')[0];
    const totalPayableAmount = (data.annualIncome ? data.annualIncome * 0.08 : 8400) || 8400;

    const installments = generateStandardInstallments(totalPayableAmount, count, joiningDate, 30);

    const newSubmittedCandidate: CandidateRecord = {
      id: `cand-${Date.now().toString(36)}`,
      candidateName: data.candidateName!,
      personalEmail: data.personalEmail!,
      personalPhone: data.personalPhone!,
      marketingEmail: data.marketingEmail,
      marketingPhone: data.marketingPhone,
      marketingStartDate: data.marketingStartDate,
      marketingEndDate: data.marketingEndDate,
      interviewSupportTaken: data.interviewSupportTaken,
      salesPerson: data.salesPerson!,
      manager: data.manager,
      teamLead: data.teamLead || 'General Team Lead',
      seniorRecruiter: data.seniorRecruiter,
      jobRole: data.jobRole!,
      jobLocation: data.jobLocation,
      endClient: data.endClient!,
      implementationPartner: data.implementationPartner,
      poMonth: data.poMonth || 'November 2026',
      packageRate: data.packageRate,
      annualIncome: data.annualIncome!,
      upfrontAmount: data.upfrontAmount!,
      bgcOfferStatus: data.bgcOfferStatus || 'INITIATED',
      joiningDateEndClient: joiningDate,
      joiningDateCompany: data.joiningDateCompany,
      agreementEndPercentMonths: data.agreementEndPercentMonths,
      finalAgreedPaymentCondition: data.finalAgreedPaymentCondition!,
      numberOfInstallments: count,
      remarks: data.remarks || 'PO Form submitted. Payment schedule auto-generated.',
      status: 'SUBMITTED',
      createdBy: currentUser.id,
      createdByName: currentUser.name,
      submittedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      paymentPlan: {
        id: `plan-${Date.now().toString(36)}`,
        candidateId: '',
        totalPayable: totalPayableAmount,
        currency: 'USD',
        installmentCount: count,
        cycleGapDays: 30,
        isOneShot: false,
        planType: 'STANDARD_4',
        installments,
      },
    };

    newSubmittedCandidate.paymentPlan!.candidateId = newSubmittedCandidate.id;

    // Record audit entry
    const newAudit: AuditEntry = {
      id: `aud-${Date.now().toString(36)}`,
      candidateId: newSubmittedCandidate.id,
      candidateName: newSubmittedCandidate.candidateName,
      field: 'Lifecycle Status & Payment Plan',
      oldValue: 'DRAFT',
      newValue: `SUBMITTED (${count} installments generated)`,
      remark: 'Candidate PO Form submitted with mandatory fields verified. Auto-handed to Accounts.',
      userId: currentUser.id,
      userName: currentUser.name,
      roleAtTime: currentUser.role,
      createdAt: new Date().toISOString(),
    };

    setCandidates((prev) => [newSubmittedCandidate, ...prev]);
    setAuditEntries((prev) => [newAudit, ...prev]);
  };

  // Handler: Mark Installment Paid
  const handleMarkPaid = (candidateId: string, installmentId: string, paidDate: string) => {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id !== candidateId || !c.paymentPlan) return c;

        const updatedInstallments = c.paymentPlan.installments.map((inst) => {
          if (inst.id !== installmentId) return inst;
          return {
            ...inst,
            status: 'PAID' as const,
            paidDate,
            reminderStatus: 'CANCELLED' as const,
            invoiceStatus: 'PAID' as const,
          };
        });

        // Check if all installments are now paid
        const allPaid = updatedInstallments.every((i) => i.status === 'PAID');
        const nextStatus = allPaid ? ('CLOSED' as const) : c.status;

        return {
          ...c,
          status: nextStatus,
          remarks: allPaid ? 'All installments settled. Account closed.' : c.remarks,
          updatedAt: new Date().toISOString(),
          paymentPlan: {
            ...c.paymentPlan,
            installments: updatedInstallments,
          },
        };
      })
    );

    // Audit Entry
    if (selectedCandidate && selectedInstallment) {
      const newAudit: AuditEntry = {
        id: `aud-${Date.now().toString(36)}`,
        candidateId,
        candidateName: selectedCandidate.candidateName,
        field: `Installment #${selectedInstallment.number} Payment`,
        oldValue: selectedInstallment.status,
        newValue: `PAID (on ${paidDate})`,
        remark: `Recorded receipt of $${selectedInstallment.amount.toLocaleString()} payment.`,
        userId: currentUser.id,
        userName: currentUser.name,
        roleAtTime: currentUser.role,
        createdAt: new Date().toISOString(),
      };
      setAuditEntries((prev) => [newAudit, ...prev]);
    }
  };

  // Handler: Unmark Paid (Admin Only with Mandatory Remark)
  const handleUnmarkPaid = (candidate: CandidateRecord, inst: Installment) => {
    const remark = prompt('Admin override: Enter mandatory remark to unmark paid installment:');
    if (!remark || remark.trim().length < 5) {
      alert('A mandatory remark of at least 5 characters is required to unmark payment.');
      return;
    }

    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id !== candidate.id || !c.paymentPlan) return c;
        const updated = c.paymentPlan.installments.map((i) => {
          if (i.id !== inst.id) return i;
          return {
            ...i,
            status: 'PENDING' as const,
            paidDate: undefined,
            reminderStatus: 'SCHEDULED' as const,
          };
        });
        return {
          ...c,
          status: 'SUBMITTED',
          paymentPlan: { ...c.paymentPlan, installments: updated },
        };
      })
    );

    const newAudit: AuditEntry = {
      id: `aud-${Date.now().toString(36)}`,
      candidateId: candidate.id,
      candidateName: candidate.candidateName,
      field: `Installment #${inst.number} Status`,
      oldValue: 'PAID',
      newValue: 'PENDING (Unmarked)',
      remark: remark.trim(),
      userId: currentUser.id,
      userName: currentUser.name,
      roleAtTime: currentUser.role,
      createdAt: new Date().toISOString(),
    };
    setAuditEntries((prev) => [newAudit, ...prev]);
  };

  // Handler: Edit Installment Date or Amount (Mandatory Remark)
  const handleSaveEditInstallment = (
    candidateId: string,
    installmentId: string,
    newAmount: number,
    newDueDate: string,
    remark: string
  ) => {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id !== candidateId || !c.paymentPlan) return c;

        const updatedInstallments = c.paymentPlan.installments.map((inst) => {
          if (inst.id !== installmentId) return inst;
          const isDateChanged = inst.dueDate !== newDueDate;
          const reminderDate = calculateReminderDate(newDueDate);

          return {
            ...inst,
            amount: newAmount,
            dueDate: newDueDate,
            dueDateIsManual: true,
            reminderScheduledFor: `${reminderDate}T09:00:00+05:30`,
            reminderStatus: isDateChanged ? ('RESCHEDULED' as const) : inst.reminderStatus,
          };
        });

        return {
          ...c,
          remarks: remark,
          updatedAt: new Date().toISOString(),
          paymentPlan: {
            ...c.paymentPlan,
            installments: updatedInstallments,
          },
        };
      })
    );

    // Record Audit Entry
    if (selectedCandidate && selectedInstallment) {
      const newAudit: AuditEntry = {
        id: `aud-${Date.now().toString(36)}`,
        candidateId,
        candidateName: selectedCandidate.candidateName,
        field: `Installment #${selectedInstallment.number} Amount & Date`,
        oldValue: `$${selectedInstallment.amount} (Due: ${selectedInstallment.dueDate})`,
        newValue: `$${newAmount} (Due: ${newDueDate})`,
        remark,
        userId: currentUser.id,
        userName: currentUser.name,
        roleAtTime: currentUser.role,
        createdAt: new Date().toISOString(),
      };
      setAuditEntries((prev) => [newAudit, ...prev]);
    }
  };

  // Handler: Apply Custom Payment Window (2-3 Upfront + 5-6 Remaining Split)
  const handleApplyCustomPlan = (
    candidateId: string,
    onOfferCount: number,
    remainingCount: number,
    remark: string
  ) => {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id !== candidateId || !c.paymentPlan) return c;

        const totalPayable = c.paymentPlan.totalPayable;
        const upfrontAmount = c.upfrontAmount;

        const newInstallments = generateCustomSplitInstallments(
          totalPayable,
          upfrontAmount,
          onOfferCount,
          remainingCount,
          c.joiningDateEndClient,
          c.paymentPlan.cycleGapDays
        );

        return {
          ...c,
          numberOfInstallments: newInstallments.length,
          remarks: remark,
          updatedAt: new Date().toISOString(),
          paymentPlan: {
            ...c.paymentPlan,
            installmentCount: newInstallments.length,
            planType: 'SPLIT_OFFER_REMAINING',
            onOfferCount,
            remainingCount,
            installments: newInstallments,
          },
        };
      })
    );

    // Record Audit Entry
    if (selectedCandidate) {
      const newAudit: AuditEntry = {
        id: `aud-${Date.now().toString(36)}`,
        candidateId,
        candidateName: selectedCandidate.candidateName,
        field: 'Custom Payment Schedule',
        oldValue: `${selectedCandidate.paymentPlan?.installmentCount || 4} parts standard`,
        newValue: `${onOfferCount} On-Offer + ${remainingCount} Remaining Monthly Parts`,
        remark,
        userId: currentUser.id,
        userName: currentUser.name,
        roleAtTime: currentUser.role,
        createdAt: new Date().toISOString(),
      };
      setAuditEntries((prev) => [newAudit, ...prev]);
    }
  };

  // Handler: One-Shot Payment Toggle
  const handleToggleOneShot = (candidate: CandidateRecord) => {
    const isCurrentlyOneShot = candidate.paymentPlan?.isOneShot || false;
    const remark = prompt(
      isCurrentlyOneShot
        ? 'Enter mandatory remark to revert from one-shot to standard installments:'
        : 'Enter mandatory remark to switch candidate to one-shot lump sum payment:'
    );

    if (!remark || remark.trim().length < 5) {
      alert('A mandatory remark of at least 5 characters is required for one-shot modifications.');
      return;
    }

    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id !== candidate.id || !c.paymentPlan) return c;

        const total = c.paymentPlan.totalPayable;
        const newInstallments = isCurrentlyOneShot
          ? generateStandardInstallments(total, 4, c.joiningDateEndClient, 30)
          : generateOneShotInstallment(total, c.joiningDateEndClient);

        return {
          ...c,
          remarks: remark.trim(),
          updatedAt: new Date().toISOString(),
          paymentPlan: {
            ...c.paymentPlan,
            isOneShot: !isCurrentlyOneShot,
            installmentCount: newInstallments.length,
            installments: newInstallments,
          },
        };
      })
    );

    const newAudit: AuditEntry = {
      id: `aud-${Date.now().toString(36)}`,
      candidateId: candidate.id,
      candidateName: candidate.candidateName,
      field: 'Payment Mode',
      oldValue: isCurrentlyOneShot ? 'One-Shot' : 'Installments',
      newValue: isCurrentlyOneShot ? 'Standard 4 Installments' : 'One-Shot Single Payment',
      remark: remark.trim(),
      userId: currentUser.id,
      userName: currentUser.name,
      roleAtTime: currentUser.role,
      createdAt: new Date().toISOString(),
    };
    setAuditEntries((prev) => [newAudit, ...prev]);
  };

  // Handler: Generate MCP Invoice
  const handleGenerateInvoice = (candidate: CandidateRecord, inst?: Installment) => {
    const invoiceType = inst ? 'INSTALLMENT' : 'ON_OFFER';
    const newInvoice = generateMcpInvoice(
      candidate,
      inst,
      invoiceType,
      currentUser.id,
      currentUser.name
    );

    setInvoices((prev) => [newInvoice, ...prev]);

    // Update candidate installment row with invoice reference
    if (inst) {
      setCandidates((prev) =>
        prev.map((c) => {
          if (c.id !== candidate.id || !c.paymentPlan) return c;
          const updated = c.paymentPlan.installments.map((i) => {
            if (i.id !== inst.id) return i;
            return {
              ...i,
              invoiceNumber: newInvoice.invoiceNumber,
              invoiceStatus: newInvoice.status,
            };
          });
          return {
            ...c,
            paymentPlan: { ...c.paymentPlan, installments: updated },
          };
        })
      );
    }

    alert(`MCP Invoice generated: ${newInvoice.invoiceNumber} (${newInvoice.status}) for $${newInvoice.amount}`);
  };

  return (
    <ParallaxContainer>
      <div className="flex flex-col min-h-[85vh]">
        {/* Top Header */}
        <Header
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          userRole={currentUser.role}
          onChangeRole={handleRoleChange}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenNewPoModal={() => setIsNewPoModalOpen(true)}
          onOpenAuditModal={() => setIsAuditModalOpen(true)}
        />

        {/* Main Body with Left Sidebar */}
        <div className="flex flex-1 overflow-hidden">
          <Sidebar
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            userRole={currentUser.role}
            onOpenNewPoModal={() => setIsNewPoModalOpen(true)}
            onOpenReportsModal={() => setIsReportsModalOpen(true)}
            onOpenAuditModal={() => setIsAuditModalOpen(true)}
            pendingCount={overdueCount}
          />

          {/* Content Canvas */}
          <main className="flex-1 p-6 overflow-y-auto space-y-6">
            {/* Top 4 Bento KPI Metric Cards */}
            <MetricCards
              totalPayable={totalPayable}
              totalCollected={totalCollected}
              pendingBalance={pendingBalance}
              overdueCount={overdueCount}
            />

            {/* Middle Section: Widgets Row (Living Dashboard Overview) */}
            {currentTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <CollectionGauge collected={totalCollected} total={totalPayable} />
                <CashFlowChart />
                <OperationsCenter />
              </div>
            )}

            {/* Candidate & Payment Ledger Table */}
            <PaymentLedger
              candidates={candidates}
              userRole={currentUser.role}
              currentUserId={currentUser.id}
              searchQuery={searchQuery}
              onOpenCandidateDetail={(cand) => {
                setSelectedCandidate(cand);
                setIsCandidateDetailModalOpen(true);
              }}
              onOpenNewPoModal={() => setIsNewPoModalOpen(true)}
            />
          </main>
        </div>
      </div>

      {/* Modals & Dialogs */}
      <PoDetailFormModal
        isOpen={isNewPoModalOpen}
        onClose={() => setIsNewPoModalOpen(false)}
        onSaveDraft={handleSaveDraft}
        onSubmitForm={handleSubmitPoForm}
      />

      <CandidateDetailModal
        isOpen={isCandidateDetailModalOpen}
        onClose={() => setIsCandidateDetailModalOpen(false)}
        candidate={selectedCandidate}
        userRole={currentUser.role}
        onMarkPaid={(cand, inst) => {
          setSelectedCandidate(cand);
          setSelectedInstallment(inst);
          setIsMarkPaidModalOpen(true);
        }}
        onEditInst={(cand, inst) => {
          setSelectedCandidate(cand);
          setSelectedInstallment(inst);
          setIsEditModalOpen(true);
        }}
        onOpenCustomWindow={(cand) => {
          setSelectedCandidate(cand);
          setIsCustomWindowOpen(true);
        }}
        onToggleOneShot={handleToggleOneShot}
        onGenerateInvoice={handleGenerateInvoice}
        onUnmarkPaid={handleUnmarkPaid}
      />

      <MarkPaidModal
        isOpen={isMarkPaidModalOpen}
        onClose={() => setIsMarkPaidModalOpen(false)}
        candidate={selectedCandidate}
        installment={selectedInstallment}
        onConfirmPaid={handleMarkPaid}
      />

      <EditDateAmountModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        candidate={selectedCandidate}
        installment={selectedInstallment}
        onSaveEdit={handleSaveEditInstallment}
      />

      <CustomPaymentWindowModal
        isOpen={isCustomWindowOpen}
        onClose={() => setIsCustomWindowOpen(false)}
        candidate={selectedCandidate}
        onApplyCustomPlan={handleApplyCustomPlan}
      />

      <AuditTrailModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        auditEntries={auditEntries}
      />

      <ReportsModal
        isOpen={isReportsModalOpen}
        onClose={() => setIsReportsModalOpen(false)}
        candidates={candidates}
        auditEntries={auditEntries}
      />
    </ParallaxContainer>
  );
}

