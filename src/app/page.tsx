'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ArrowRight } from 'lucide-react';
import { ParallaxContainer } from '../components/ParallaxContainer';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { MetricCards } from '../components/MetricCards';
import { CollectionGauge } from '../components/CollectionGauge';
import { CashFlowChart } from '../components/CashFlowChart';
import { OperationsCenter } from '../components/OperationsCenter';
import { PaymentLedger } from '../components/PaymentLedger';
import { PoDetailFormModal } from '../components/PoDetailFormModal';
import { BgcFormModal } from '../components/BgcFormModal';
import { CandidateDetailModal } from '../components/CandidateDetailModal';
import { BgcCandidateDetailModal } from '../components/BgcCandidateDetailModal';
import { MarkBgcPaidModal } from '../components/MarkBgcPaidModal';
import { ProofViewerModal } from '../components/ProofViewerModal';
import { SendPaymentReminderModal } from '../components/SendPaymentReminderModal';
import { MarkPaidModal } from '../components/MarkPaidModal';
import { EditDateAmountModal } from '../components/EditDateAmountModal';
import { CustomPaymentWindowModal } from '../components/CustomPaymentWindowModal';
import { AuditTrailModal } from '../components/AuditTrailModal';
import { ReportsModal } from '../components/ReportsModal';
import { LoginScreen } from '@/components/ui/login-form';
import { UserManagement } from '../components/UserManagement';
import { UserModal } from '../components/UserModal';

import {
  CandidateRecord,
  UserRole,
  User,
  Installment,
  AuditEntry,
  InvoiceRecord,
  ReminderLog,
  JoiningDateReminder,
  DeductionRecord,
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
  // Theme & 3D Cylindrical Roll States
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [countUpTrigger, setCountUpTrigger] = useState(0);

  // Sync document root class with theme state
  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
      }
    }
  }, [theme]);

  // User Accounts & Authentication State (Persisted in DB & localStorage)
  const [mounted, setMounted] = useState(false);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [users, setUsers] = useState<User[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('nb_bgc_users_list');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return MOCK_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('nb_bgc_current_user');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return MOCK_USERS[0]; // Default: Admin
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('nb_bgc_is_authenticated');
        if (saved !== null) return saved === 'true';
      } catch (e) {}
    }
    return false; // Default to login page if no session
  });

  const [currentTab, setCurrentTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('nb_bgc_current_tab');
        if (saved) return saved;
      } catch (e) {}
    }
    return 'overview';
  });
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Hydration Mount Sync & DB Sync
  React.useEffect(() => {
    setMounted(true);
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.users) && data.users.length > 0) {
          setUsers(data.users);
          try {
            localStorage.setItem('nb_bgc_users_list', JSON.stringify(data.users));
          } catch (e) {}
        }
      })
      .catch((err) => console.error('Failed to load users from DB:', err))
      .finally(() => setUsersLoaded(true));
  }, []);

  // Sync session state to localStorage across actions & reloads
  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem('nb_bgc_is_authenticated', String(isAuthenticated));
    } catch (e) {}
  }, [isAuthenticated, mounted]);

  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem('nb_bgc_current_user', JSON.stringify(currentUser));
    } catch (e) {}
  }, [currentUser, mounted]);

  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem('nb_bgc_current_tab', currentTab);
    } catch (e) {}
  }, [currentTab, mounted]);

  React.useEffect(() => {
    if (!mounted || !usersLoaded) return;
    try {
      localStorage.setItem('nb_bgc_users_list', JSON.stringify(users));
    } catch (e) {}
  }, [users, mounted, usersLoaded]);

  // User Management Handlers (Admin Only) - with persistent DB updates
  const handleAddUser = async (newUserData: Omit<User, 'id'>) => {
    const id = `user-${Date.now()}`;
    const createdUser: User = { ...newUserData, id };
    const nextUsers = [...users, createdUser];
    setUsers(nextUsers);
    try {
      localStorage.setItem('nb_bgc_users_list', JSON.stringify(nextUsers));
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CREATE', user: createdUser }),
      });
    } catch (e) {
      console.error('Failed to persist user creation in DB:', e);
    }
  };

  const handleUpdateUser = async (updatedUser: User) => {
    const nextUsers = users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
    setUsers(nextUsers);
    if (currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
      try {
        localStorage.setItem('nb_bgc_current_user', JSON.stringify(updatedUser));
      } catch (e) {}
    }
    try {
      localStorage.setItem('nb_bgc_users_list', JSON.stringify(nextUsers));
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'UPDATE', user: updatedUser }),
      });
    } catch (e) {
      console.error('Failed to persist user update in DB:', e);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const nextUsers = users.filter((u) => u.id !== userId);
    setUsers(nextUsers);
    try {
      localStorage.setItem('nb_bgc_users_list', JSON.stringify(nextUsers));
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DELETE', userId }),
      });
    } catch (e) {
      console.error('Failed to persist user deletion in DB:', e);
    }
  };

  // User Modal State (Root-level for proper viewport backdrop)
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userModalMode, setUserModalMode] = useState<'ADD' | 'EDIT'>('ADD');
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleOpenAddUser = () => {
    setUserModalMode('ADD');
    setEditingUser(null);
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (user: User) => {
    setUserModalMode('EDIT');
    setEditingUser(user);
    setIsUserModalOpen(true);
  };

  const handleSaveUserModal = (userData: {
    id?: string;
    name: string;
    email: string;
    password: string;
    role: UserRole;
    status: 'ACTIVE' | 'INACTIVE';
  }) => {
    if (userModalMode === 'ADD') {
      handleAddUser({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        status: userData.status,
        createdAt: new Date().toISOString().split('T')[0],
      });
      const newAudit: AuditEntry = {
        id: `aud-${Date.now()}`,
        candidateId: 'system-rbac',
        candidateName: userData.name,
        field: 'User Account Created',
        oldValue: '-',
        newValue: `${userData.role} | ${userData.email}`,
        remark: `Admin created new ${userData.role} user account for ${userData.name} (${userData.email}).`,
        userId: currentUser.id,
        userName: currentUser.name,
        roleAtTime: 'ADMIN',
        createdAt: new Date().toISOString(),
      };
      setAuditEntries((prev) => [newAudit, ...prev]);
    } else if (userData.id) {
      const existing = users.find((u) => u.id === userData.id);
      handleUpdateUser({
        id: userData.id,
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        status: userData.status,
        createdAt: existing?.createdAt || new Date().toISOString().split('T')[0],
      });
      const newAudit: AuditEntry = {
        id: `aud-${Date.now()}`,
        candidateId: 'system-rbac',
        candidateName: userData.name,
        field: 'User Account Updated',
        oldValue: `${existing?.role} | ${existing?.email}`,
        newValue: `${userData.role} | ${userData.email}`,
        remark: `Admin updated credentials and profile for user ${userData.name} (${userData.email}). Role: ${userData.role}.`,
        userId: currentUser.id,
        userName: currentUser.name,
        roleAtTime: 'ADMIN',
        createdAt: new Date().toISOString(),
      };
      setAuditEntries((prev) => [newAudit, ...prev]);
    }
  };

  // 3D Cylindrical Flip Theme Toggle Handler
  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    setCountUpTrigger((prev) => prev + 1);
  };

  // Core Data States (Persisted in DB & localStorage, clean initial state)
  const [candidatesLoaded, setCandidatesLoaded] = useState(false);
  const [candidates, setCandidates] = useState<CandidateRecord[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('nb_bgc_candidates_list');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  // Load Candidates from Server DB (/api/candidates) on mount & window focus
  React.useEffect(() => {
    const syncCandidates = () => {
      fetch('/api/candidates')
        .then((res) => res.json())
        .then((data) => {
          if (data?.success && Array.isArray(data.candidates)) {
            setCandidates(data.candidates);
            try {
              localStorage.setItem('nb_bgc_candidates_list', JSON.stringify(data.candidates));
            } catch (e) {}
          }
        })
        .catch((err) => console.error('Failed to sync candidates from DB:', err))
        .finally(() => setCandidatesLoaded(true));
    };

    syncCandidates();
    window.addEventListener('focus', syncCandidates);
    return () => window.removeEventListener('focus', syncCandidates);
  }, []);

  // Persist Candidates to localStorage & Server DB on changes
  React.useEffect(() => {
    if (!mounted || !candidatesLoaded) return;
    try {
      localStorage.setItem('nb_bgc_candidates_list', JSON.stringify(candidates));
      fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidates }),
      }).catch((e) => console.error('Failed to persist candidates to DB:', e));
    } catch (e) {}
  }, [candidates, mounted, candidatesLoaded]);

  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [joiningDateReminders, setJoiningDateReminders] = useState<JoiningDateReminder[]>([]);

  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);

  // Modals Visibility
  const [isNewPoModalOpen, setIsNewPoModalOpen] = useState(false);
  const [isCandidateDetailModalOpen, setIsCandidateDetailModalOpen] = useState(false);
  const [isBgcDetailModalOpen, setIsBgcDetailModalOpen] = useState(false);
  const [isMarkBgcPaidModalOpen, setIsMarkBgcPaidModalOpen] = useState(false);
  const [isMarkPaidModalOpen, setIsMarkPaidModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCustomWindowOpen, setIsCustomWindowOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
  const [isSendReminderModalOpen, setIsSendReminderModalOpen] = useState(false);
  const [proofViewer, setProofViewer] = useState<{ isOpen: boolean; title: string; dataUrl?: string }>({
    isOpen: false,
    title: '',
    dataUrl: undefined,
  });

  // Selected Record Context
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateRecord | null>(null);
  const [selectedInstallment, setSelectedInstallment] = useState<Installment | null>(null);
  const [editingDraft, setEditingDraft] = useState<CandidateRecord | null>(null);

  // 1-Click Role Switcher Handler
  const handleRoleChange = (role: UserRole) => {
    const user = users.find((u) => u.role === role) || users[0];
    setCurrentUser(user);
    if (role !== 'ADMIN' && currentTab === 'users') {
      setCurrentTab('overview');
    }
  };

  // Compute Master KPIs across candidates (role-scoped for Accountant / Compliance / Admin)
  const { totalPayable, totalCollected, pendingBalance, overdueCount } = useMemo(() => {
    let payable = 0;
    let collected = 0;
    let overdue = 0;

    const visibleCandidates = candidates.filter((c) => {
      if (currentUser.role === 'ACCOUNT_MANAGER') {
        const isBgcCleared = c.bgcOfferStatus === 'CLEARED' || c.bgcPaymentStatus === 'PAID';
        return isBgcCleared && c.status !== 'DRAFT';
      }
      return true;
    });

    visibleCandidates.forEach((c) => {
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
  }, [candidates, currentUser.role]);

  // Candidates scoped for Dashboard charts and cards
  const scopedForDashboard = useMemo(() => {
    if (currentUser.role === 'ACCOUNT_MANAGER') {
      return candidates.filter(
        (c) => (c.bgcOfferStatus === 'CLEARED' || c.bgcPaymentStatus === 'PAID') && c.status !== 'DRAFT'
      );
    }
    return candidates;
  }, [candidates, currentUser.role]);

  // Active Joining Date Reminders
  const activeJoiningReminders = useMemo(() => {
    return joiningDateReminders.filter((r) => r.status === 'ACTIVE');
  }, [joiningDateReminders]);

  // Handler: Save PO / BGC Form as Draft
  const handleSaveDraft = (data: Partial<CandidateRecord>) => {
    if (data.id) {
      setCandidates((prev) =>
        prev.map((c) => {
          if (c.id !== data.id) return c;
          return {
            ...c,
            ...data,
            updatedAt: new Date().toISOString(),
          } as CandidateRecord;
        })
      );
      setEditingDraft(null);
      return;
    }

    const newDraft: CandidateRecord = {
      id: `cand-${Date.now().toString(36)}`,
      candidateName: data.candidateName || 'Draft Candidate',
      personalEmail: data.personalEmail || '',
      personalPhone: data.personalPhone || '',
      salesPerson: data.salesPerson || '',
      teamLead: data.teamLead || 'Rudra',
      jobRole: data.jobRole || 'Consultant',
      endClient: data.clientEmployerName || data.endClient || 'NetBounce Client',
      poMonth: data.poMonth || 'November 2026',
      annualIncome: data.annualIncome || 0,
      upfrontAmount: data.upfrontAmount || 0,
      bgcOfferStatus: data.bgcOfferStatus || 'INITIATED',
      joiningDateEndClient: data.joiningDateEndClient || '',
      finalAgreedPaymentCondition: data.finalAgreedPaymentCondition || '',
      numberOfInstallments: data.totalSlotNumber || data.numberOfInstallments || 4,
      remarks: data.remarks || 'Draft saved by compliance manager.',
      status: 'DRAFT',
      createdBy: currentUser.id,
      createdByName: currentUser.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // 20 BGC Fields
      poType: data.poType || '1 st',
      bgcOfferAmount: data.bgcOfferAmount ?? 2500,
      onOfferPaymentDate: data.onOfferPaymentDate || '',
      totalSlotAmount: data.totalSlotAmount ?? 8400,
      totalSlotNumber: data.totalSlotNumber ?? 4,
      bgcDoneBy: data.bgcDoneBy || 'Irfan',
      clientEmployerName: data.clientEmployerName || data.endClient || '',
      bgcCompanyName: data.bgcCompanyName || '',
      bgcStartDate: data.bgcStartDate || '',
      emailReferenceGiven: data.emailReferenceGiven || 'Yes',
      phoneReferenceGiven: data.phoneReferenceGiven || 'Yes',
      bgcEndDate: data.bgcEndDate || '',
      isOneShotPayment: data.isOneShotPayment || false,
      bgcSlots: data.bgcSlots,
    };

    setCandidates((prev) => [newDraft, ...prev]);
    setEditingDraft(null);
  };

  // Handler: Submit PO / BGC Form (Atomic Transition to SUBMITTED + Auto-Handoff)
  const handleSubmitPoForm = (data: Partial<CandidateRecord>) => {
    const joiningDate = data.joiningDateEndClient || new Date().toISOString().split('T')[0];
    const totalPayableAmount = data.totalSlotAmount || (data.annualIncome ? data.annualIncome * 0.08 : 8400) || 8400;
    const targetId = data.id || `cand-${Date.now().toString(36)}`;

    // Build installments based on custom slots from BGC Form or One-Shot
    let installments: Installment[] = [];
    if (data.isOneShotPayment) {
      installments = generateOneShotInstallment(totalPayableAmount, joiningDate);
    } else if (data.bgcSlots && data.bgcSlots.length > 0) {
      installments = data.bgcSlots.map((s) => ({
        id: `inst-${targetId}-${s.number}`,
        number: s.number,
        tier: 'STANDARD' as const,
        amount: s.amount,
        dueDate: s.dueDate || joiningDate,
        dueDateIsManual: true,
        status: 'PENDING' as const,
        reminderStatus: 'SCHEDULED' as const,
      }));
    } else {
      const count = data.totalSlotNumber || data.numberOfInstallments || 4;
      installments = generateStandardInstallments(totalPayableAmount, count, joiningDate, 30);
    }

    const count = installments.length;

    const newSubmittedCandidate: CandidateRecord = {
      id: targetId,
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
      teamLead: data.teamLead || 'Rudra',
      seniorRecruiter: data.seniorRecruiter,
      jobRole: data.jobRole || 'Consultant',
      jobLocation: data.jobLocation,
      endClient: data.clientEmployerName || data.endClient || 'NetBounce Client',
      implementationPartner: data.implementationPartner,
      poMonth: data.poMonth || 'November 2026',
      packageRate: data.packageRate,
      annualIncome: data.annualIncome || totalPayableAmount * 12.5,
      upfrontAmount: data.upfrontAmount || 0,
      bgcOfferStatus: data.bgcOfferStatus || 'INITIATED',
      joiningDateEndClient: joiningDate,
      joiningDateCompany: data.joiningDateCompany,
      agreementEndPercentMonths: data.agreementEndPercentMonths,
      finalAgreedPaymentCondition: data.finalAgreedPaymentCondition || `$${totalPayableAmount.toLocaleString()} in ${count} installments`,
      numberOfInstallments: count,
      remarks: data.remarks || 'BGC / PO Record submitted. Payment schedule auto-generated.',
      status: 'SUBMITTED',
      createdBy: currentUser.id,
      createdByName: currentUser.name,
      submittedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // 20 BGC Fields
      poType: data.poType || '1 st',
      bgcOfferAmount: data.bgcOfferAmount ?? 2500,
      onOfferPaymentDate: data.onOfferPaymentDate || '',
      totalSlotAmount: totalPayableAmount,
      totalSlotNumber: count,
      bgcDoneBy: data.bgcDoneBy || 'Irfan',
      clientEmployerName: data.clientEmployerName || data.endClient || '',
      bgcCompanyName: data.bgcCompanyName || '',
      bgcStartDate: data.bgcStartDate || '',
      emailReferenceGiven: data.emailReferenceGiven || 'Yes',
      phoneReferenceGiven: data.phoneReferenceGiven || 'Yes',
      bgcEndDate: data.bgcEndDate || '',
      isOneShotPayment: data.isOneShotPayment || false,
      bgcSlots: data.bgcSlots,
      paymentPlan: {
        id: `plan-${Date.now().toString(36)}`,
        candidateId: targetId,
        totalPayable: totalPayableAmount,
        currency: 'USD',
        installmentCount: count,
        cycleGapDays: 30,
        isOneShot: !!data.isOneShotPayment,
        planType: data.isOneShotPayment ? 'STANDARD_4' : 'STANDARD_4',
        installments,
      },
    };

    setCandidates((prev) => {
      const exists = prev.some((c) => c.id === targetId);
      if (exists) {
        return prev.map((c) => (c.id === targetId ? newSubmittedCandidate : c));
      }
      return [newSubmittedCandidate, ...prev];
    });

    setEditingDraft(null);

    // Record audit entry
    const newAudit: AuditEntry = {
      id: `aud-${Date.now().toString(36)}`,
      candidateId: newSubmittedCandidate.id,
      candidateName: newSubmittedCandidate.candidateName,
      field: 'Lifecycle Status & Payment Plan',
      oldValue: data.id ? 'DRAFT' : 'NEW_PROSPECT',
      newValue: `SUBMITTED (${count} installments generated)`,
      remark: 'Candidate BGC / PO Form submitted with 20 fields verified. Auto-handed to Accounts.',
      userId: currentUser.id,
      userName: currentUser.name,
      roleAtTime: currentUser.role,
      createdAt: new Date().toISOString(),
    };
    setAuditEntries((prev) => [newAudit, ...prev]);
  };

  // Handler: Delete Candidate (Instantly removes from local state, localStorage, and Supabase cloud DB)
  const handleDeleteCandidate = async (candidateId: string) => {
    const updated = candidates.filter((c) => c.id !== candidateId);
    setCandidates(updated);
    try {
      localStorage.setItem('nb_bgc_candidates_list', JSON.stringify(updated));
    } catch (e) {}

    try {
      await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DELETE', candidateId }),
      });
    } catch (e) {
      console.error('Failed to delete candidate from cloud database:', e);
    }
  };

  // Handler: Collect Payment directly from Ledger
  const handleCollectPayment = (cand: CandidateRecord) => {
    const unpaid = cand.paymentPlan?.installments.find((i) => i.status !== 'PAID');
    if (unpaid) {
      setSelectedCandidate(cand);
      setSelectedInstallment(unpaid);
      setIsMarkPaidModalOpen(true);
    } else {
      setSelectedCandidate(cand);
      setIsCandidateDetailModalOpen(true);
    }
  };

  // Handler: Confirm BGC Payment Settlement (Compliance Desk with Mandatory Remark & Proof)
  const handleConfirmBgcPayment = (
    candidateId: string,
    paidDate: string,
    remarks: string,
    proofFile?: { name: string; dataUrl: string; size: string; type: string }
  ) => {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id !== candidateId) return c;
        return {
          ...c,
          bgcPaymentStatus: 'PAID',
          bgcOfferStatus: 'CLEARED',
          bgcPaymentPaidDate: paidDate,
          bgcPaymentRemarks: remarks,
          bgcPaymentProofName: proofFile?.name,
          bgcPaymentProofDataUrl: proofFile?.dataUrl,
          bgcPaymentProofSize: proofFile?.size,
          bgcPaymentProofType: proofFile?.type,
          bgcPaymentVerifiedBy: currentUser.id,
          bgcPaymentVerifiedByName: currentUser.name,
          bgcPaymentVerifiedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      })
    );

    setSelectedCandidate((prev) => {
      if (!prev || prev.id !== candidateId) return prev;
      return {
        ...prev,
        bgcPaymentStatus: 'PAID',
        bgcOfferStatus: 'CLEARED',
        bgcPaymentPaidDate: paidDate,
        bgcPaymentRemarks: remarks,
        bgcPaymentProofName: proofFile?.name,
        bgcPaymentProofDataUrl: proofFile?.dataUrl,
        bgcPaymentProofSize: proofFile?.size,
        bgcPaymentProofType: proofFile?.type,
        bgcPaymentVerifiedBy: currentUser.id,
        bgcPaymentVerifiedByName: currentUser.name,
        bgcPaymentVerifiedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });

    const cand = candidates.find((c) => c.id === candidateId);
    const newAudit: AuditEntry = {
      id: `aud-${Date.now().toString(36)}`,
      candidateId,
      candidateName: cand?.candidateName || 'Candidate',
      field: 'BGC Payment Clearance',
      oldValue: 'PENDING',
      newValue: `PAID & VERIFIED (Proof: ${proofFile?.name || 'Attached'})`,
      remark: remarks,
      userId: currentUser.id,
      userName: currentUser.name,
      roleAtTime: currentUser.role,
      createdAt: new Date().toISOString(),
    };
    setAuditEntries((prev) => [newAudit, ...prev]);
  };

  // Handler: Mark Installment Paid & Record Deductions
  const handleMarkPaid = (
    candidateId: string,
    installmentId: string,
    paidDate: string,
    deductionData?: DeductionRecord
  ) => {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id !== candidateId || !c.paymentPlan) return c;

        const updatedInstallments = c.paymentPlan.installments.map((inst) => {
          if (inst.id !== installmentId) return inst;
          const net = deductionData ? Math.max(0, inst.amount - deductionData.amount) : inst.amount;
          return {
            ...inst,
            status: 'PAID' as const,
            paidDate,
            reminderStatus: 'CANCELLED' as const,
            invoiceStatus: 'PAID' as const,
            deduction: deductionData,
            netCollectedAmount: net,
          };
        });

        // Check if all installments are now paid
        const allPaid = updatedInstallments.every((i) => i.status === 'PAID');
        const nextStatus = allPaid ? ('CLOSED' as const) : c.status;

        // Deductions & Referral tracking
        const newDeductions = deductionData ? [deductionData, ...(c.deductions || [])] : c.deductions;
        let refTotal = c.referralBonusTotal || (deductionData?.totalReferralBonus || 0);
        let refAllocated = (c.referralBonusAllocated || 0) + (deductionData?.amount || 0);
        let refRemaining = Math.max(0, refTotal - refAllocated);

        return {
          ...c,
          status: nextStatus,
          remarks: allPaid ? 'All installments settled. Account closed.' : c.remarks,
          updatedAt: new Date().toISOString(),
          deductions: newDeductions,
          referralBonusTotal: refTotal > 0 ? refTotal : undefined,
          referralBonusAllocated: refAllocated > 0 ? refAllocated : undefined,
          referralBonusRemaining: refTotal > 0 ? refRemaining : undefined,
          paymentPlan: {
            ...c.paymentPlan,
            installments: updatedInstallments,
          },
        };
      })
    );

    setSelectedCandidate((prev) => {
      if (!prev || prev.id !== candidateId || !prev.paymentPlan) return prev;
      const updatedInstallments = prev.paymentPlan.installments.map((inst) => {
        if (inst.id !== installmentId) return inst;
        const net = deductionData ? Math.max(0, inst.amount - deductionData.amount) : inst.amount;
        return {
          ...inst,
          status: 'PAID' as const,
          paidDate,
          reminderStatus: 'CANCELLED' as const,
          invoiceStatus: 'PAID' as const,
          deduction: deductionData,
          netCollectedAmount: net,
        };
      });
      const allPaid = updatedInstallments.every((i) => i.status === 'PAID');
      const newDeductions = deductionData ? [deductionData, ...(prev.deductions || [])] : prev.deductions;
      let refTotal = prev.referralBonusTotal || (deductionData?.totalReferralBonus || 0);
      let refAllocated = (prev.referralBonusAllocated || 0) + (deductionData?.amount || 0);
      let refRemaining = Math.max(0, refTotal - refAllocated);

      return {
        ...prev,
        status: allPaid ? ('CLOSED' as const) : prev.status,
        deductions: newDeductions,
        referralBonusTotal: refTotal > 0 ? refTotal : undefined,
        referralBonusAllocated: refAllocated > 0 ? refAllocated : undefined,
        referralBonusRemaining: refTotal > 0 ? refRemaining : undefined,
        paymentPlan: {
          ...prev.paymentPlan,
          installments: updatedInstallments,
        },
      };
    });

    // Audit Entry
    if (selectedCandidate && selectedInstallment) {
      let auditRemark = `Recorded receipt of $${selectedInstallment.amount.toLocaleString()} payment.`;
      if (deductionData) {
        if (deductionData.type === 'REFERRAL_BONUS') {
          auditRemark = `Payment collected with Referral Bonus deduction: -$${deductionData.amount.toLocaleString()}. Salesperson: ${deductionData.salesPerson}, Referees: ${deductionData.refereeNames.join(', ')}. Net: $${Math.max(0, selectedInstallment.amount - deductionData.amount)}. ${deductionData.remarks}`;
        } else {
          auditRemark = `Payment collected with ${deductionData.type.replace('_', ' ')} deduction: -$${deductionData.amount.toLocaleString()}. ${deductionData.remarks}`;
        }
      }

      const newAudit: AuditEntry = {
        id: `aud-${Date.now().toString(36)}`,
        candidateId,
        candidateName: selectedCandidate.candidateName,
        field: `Installment #${selectedInstallment.number} Payment`,
        oldValue: selectedInstallment.status,
        newValue: `PAID (on ${paidDate})`,
        remark: auditRemark,
        userId: currentUser.id,
        userName: currentUser.name,
        roleAtTime: currentUser.role,
        createdAt: new Date().toISOString(),
      };

      const candidateRecord = candidates.find((c) => c.id === candidateId);
      const remainingUnpaid = candidateRecord?.paymentPlan?.installments.filter(
        (i) => i.id !== installmentId && i.status !== 'PAID'
      ).length;

      if (remainingUnpaid === 0) {
        const closedAudit: AuditEntry = {
          id: `aud-closed-${Date.now().toString(36)}`,
          candidateId,
          candidateName: selectedCandidate.candidateName,
          field: 'Candidate Account Status',
          oldValue: 'SUBMITTED',
          newValue: 'CLOSED',
          remark: 'All installments fully paid and reconciled. Account automatically marked CLOSED.',
          userId: currentUser.id,
          userName: currentUser.name,
          roleAtTime: currentUser.role,
          createdAt: new Date().toISOString(),
        };
        setAuditEntries((prev) => [closedAudit, newAudit, ...prev]);
      } else {
        setAuditEntries((prev) => [newAudit, ...prev]);
      }
    }
  };

  // Handler: Update Joining Date
  const handleUpdateJoiningDate = (candidateId: string, newDate: string) => {
    const cand = candidates.find((c) => c.id === candidateId);
    const oldDate = cand?.joiningDateEndClient || 'Pending';

    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id !== candidateId) return c;
        return {
          ...c,
          joiningDateEndClient: newDate,
          joiningDateStatus: 'SET',
          joiningDateUpdatedBy: currentUser.id,
          joiningDateUpdatedByName: currentUser.name,
          joiningDateUpdatedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      })
    );

    setSelectedCandidate((prev) => {
      if (!prev || prev.id !== candidateId) return prev;
      return {
        ...prev,
        joiningDateEndClient: newDate,
        joiningDateStatus: 'SET',
        joiningDateUpdatedBy: currentUser.id,
        joiningDateUpdatedByName: currentUser.name,
        joiningDateUpdatedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });

    // Automatically resolve any active joining date reminder for this candidate
    setJoiningDateReminders((prev) =>
      prev.map((r) =>
        r.candidateId === candidateId && r.status === 'ACTIVE'
          ? { ...r, status: 'RESOLVED', resolvedAt: new Date().toISOString() }
          : r
      )
    );

    // Audit log
    const audit: AuditEntry = {
      id: `aud-${Date.now().toString(36)}`,
      candidateId,
      candidateName: cand?.candidateName || 'Candidate',
      field: 'Joining Date',
      oldValue: oldDate,
      newValue: newDate,
      remark: `Joining date set to ${newDate}. Any pending dashboard reminders automatically resolved.`,
      userId: currentUser.id,
      userName: currentUser.name,
      roleAtTime: currentUser.role,
      createdAt: new Date().toISOString(),
    };
    setAuditEntries((prev) => [audit, ...prev]);
  };

  // Handler: Mark Joining Date as To Be Updated
  const handleMarkJoiningDatePending = (candidateId: string) => {
    const cand = candidates.find((c) => c.id === candidateId);
    if (!cand) return;

    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id !== candidateId) return c;
        return {
          ...c,
          joiningDateStatus: 'TO_BE_UPDATED',
          joiningDateUpdatedBy: currentUser.id,
          joiningDateUpdatedByName: currentUser.name,
          joiningDateUpdatedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      })
    );

    setSelectedCandidate((prev) => {
      if (!prev || prev.id !== candidateId) return prev;
      return {
        ...prev,
        joiningDateStatus: 'TO_BE_UPDATED',
        joiningDateUpdatedBy: currentUser.id,
        joiningDateUpdatedByName: currentUser.name,
        joiningDateUpdatedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });

    // Create persistent reminder if one does not already exist
    setJoiningDateReminders((prev) => {
      const exists = prev.some((r) => r.candidateId === candidateId && r.status === 'ACTIVE');
      if (exists) return prev;
      const newRem: JoiningDateReminder = {
        id: `jrem-${candidateId}-${Date.now().toString(36)}`,
        candidateId,
        candidateName: cand.candidateName,
        message: "Joining Date Pending – Please update the candidate's joining date.",
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        createdBy: currentUser.id,
        createdByName: currentUser.name,
      };
      return [newRem, ...prev];
    });

    // Audit log
    const audit: AuditEntry = {
      id: `aud-${Date.now().toString(36)}`,
      candidateId,
      candidateName: cand.candidateName,
      field: 'Joining Date Status',
      oldValue: cand.joiningDateStatus || 'Initial',
      newValue: 'TO_BE_UPDATED',
      remark: 'Marked joining date as pending. Persistent reminder generated for dashboard.',
      userId: currentUser.id,
      userName: currentUser.name,
      roleAtTime: currentUser.role,
      createdAt: new Date().toISOString(),
    };
    setAuditEntries((prev) => [audit, ...prev]);
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

  // Handler: Generate MCP Invoice & Redirect to DocSign Dashboard
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

    // Direct redirect to NetBounce DocSign Dashboard
    const docsignUrl = 'https://netbounceplacement-docsign.vercel.app/dashboard';
    if (typeof window !== 'undefined') {
      const opened = window.open(docsignUrl, '_blank');
      if (!opened || opened.closed || typeof opened.closed === 'undefined') {
        window.location.href = docsignUrl;
      }
    }
  };

  // Prevent hydration flash before reading persisted localStorage session
  if (!mounted) {
    return (
      <div className="min-h-screen w-full bg-[#070b14] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <LoginScreen
        availableUsers={users}
        onSubmit={async ({ email, password }) => {
          const cleanEmail = email.trim().toLowerCase();
          const cleanPrefix = cleanEmail.split('@')[0];
          const matched = users.find((u) => {
            const uEmail = u.email.toLowerCase();
            const uPrefix = uEmail.split('@')[0];
            const emailMatches =
              uEmail === cleanEmail ||
              uPrefix === cleanEmail ||
              uPrefix === cleanPrefix ||
              (cleanEmail.includes('dwijen') && u.role === 'ADMIN') ||
              (cleanEmail.includes('admin') && u.role === 'ADMIN') ||
              (cleanEmail.includes('comp') && u.role === 'COMPLIANCE_MANAGER') ||
              (cleanEmail.includes('acc') && u.role === 'ACCOUNT_MANAGER');
            return emailMatches && u.password === password;
          });
          if (!matched) {
            throw new Error("Invalid email or password. Please verify your credentials.");
          }
          if (matched.status === 'INACTIVE') {
            throw new Error('This user account has been deactivated by Admin.');
          }
          setCurrentUser(matched);
          setIsAuthenticated(true);
          try {
            localStorage.setItem('nb_bgc_is_authenticated', 'true');
            localStorage.setItem('nb_bgc_current_user', JSON.stringify(matched));
          } catch (e) {}
        }}
        onGoogleSignIn={async () => {
          const adminUser = users.find((u) => u.role === 'ADMIN') || users[0];
          setCurrentUser(adminUser);
          setIsAuthenticated(true);
          try {
            localStorage.setItem('nb_bgc_is_authenticated', 'true');
            localStorage.setItem('nb_bgc_current_user', JSON.stringify(adminUser));
          } catch (e) {}
        }}
      />
    );
  }

  return (
    <ParallaxContainer theme={theme}>
      <div className="flex h-screen w-full overflow-hidden bg-transparent">
        {/* Full-Height Left Sidebar: Spans 100% from Top to Bottom */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          userRole={currentUser.role}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onLogOut={() => {
            setIsAuthenticated(false);
            try {
              localStorage.setItem('nb_bgc_is_authenticated', 'false');
            } catch (e) {}
          }}
          onOpenNewPoModal={() => {
            setEditingDraft(null);
            setIsNewPoModalOpen(true);
          }}
          onOpenReportsModal={() => setIsReportsModalOpen(true)}
          onOpenAuditModal={() => setIsAuditModalOpen(true)}
          pendingCount={overdueCount}
        />

        {/* Right Content Area: 3D Cylindrical Roll Container */}
        <div
          style={{ perspective: 1200 }}
          className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden"
        >
          <motion.div
            key={`cylinder-roll-${theme}`}
            initial={{ rotateX: -360, scale: 0.94, opacity: 0.85 }}
            animate={{ rotateX: 0, scale: 1, opacity: 1 }}
            transition={{
              duration: 0.72,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{
              transformStyle: 'preserve-3d',
              transformOrigin: '50% 50% -80px',
            }}
            className="flex-1 flex flex-col h-screen min-w-0 overflow-y-auto"
          >
            {/* Top Header with Glass Translucency */}
            <div
              className={`px-6 pt-4 backdrop-blur-xl sticky top-0 z-20 border-b transition-colors duration-300 ${
                theme === 'dark'
                  ? 'bg-slate-900/60 border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.3)]'
                  : 'bg-white/40 border-white/60 shadow-[0_4px_20px_rgba(24,39,75,0.02)]'
              }`}
            >
              <Header
                currentTab={currentTab}
                onSelectTab={setCurrentTab}
                userRole={currentUser.role}
                currentUser={currentUser}
                onChangeRole={handleRoleChange}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onOpenNewPoModal={() => {
                  setEditingDraft(null);
                  setIsNewPoModalOpen(true);
                }}
                onOpenAuditModal={() => setIsAuditModalOpen(true)}
              />
            </div>

            {/* Content Canvas */}
            <main className="flex-1 p-6 space-y-6">
              {/* Active Joining Date Reminders Alert Banner (Hidden on User Management) */}
              {currentTab !== 'users' && activeJoiningReminders.length > 0 && (
                <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-300 dark:border-amber-500/40 rounded-2xl p-4 shadow-xs">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-amber-600 animate-pulse" />
                      <span className="font-extrabold text-xs text-amber-950 dark:text-amber-200">
                        Joining Date Action Required ({activeJoiningReminders.length} Pending)
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      Persistent Reminder
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {activeJoiningReminders.map((rem) => (
                      <div
                        key={rem.id}
                        className="bg-white/95 dark:bg-slate-800/90 p-3 rounded-xl border border-amber-200/90 dark:border-slate-700 flex items-center justify-between gap-3 shadow-xs"
                      >
                        <div className="min-w-0">
                          <strong className="text-xs text-slate-900 dark:text-white block truncate">{rem.candidateName}</strong>
                          <p className="text-[11px] text-amber-800 dark:text-amber-300 truncate">
                            Joining Date Pending – Please update the candidate&apos;s joining date.
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            const target = candidates.find(
                              (c) => c.id === rem.candidateId || c.candidateName.toLowerCase() === rem.candidateName.toLowerCase()
                            );
                            if (target) {
                              setSelectedCandidate(target);
                              setIsCandidateDetailModalOpen(true);
                            }
                          }}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow-xs transition-all cursor-pointer flex-shrink-0"
                        >
                          Update Date <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top 4 Bento KPI Metric Cards (Hidden on User Management) */}
              {currentTab !== 'users' && (
                <MetricCards
                  totalPayable={totalPayable}
                  totalCollected={totalCollected}
                  pendingBalance={pendingBalance}
                  overdueCount={overdueCount}
                  userRole={currentUser.role}
                  countUpTrigger={countUpTrigger}
                  scopedCandidates={scopedForDashboard}
                />
              )}

            {/* Middle Section: Genie-Effect Animated Panels */}
            <AnimatePresence mode="wait">
              {currentTab === 'users' && currentUser.role === 'ADMIN' ? (
                <motion.div
                  key="users-genie-panel"
                  initial={{
                    opacity: 0,
                    scale: 0.95,
                    y: 12,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    transition: {
                      type: 'spring',
                      stiffness: 260,
                      damping: 22,
                    },
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.95,
                    transition: {
                      duration: 0.2,
                    },
                  }}
                  className="w-full"
                >
                  <UserManagement
                    users={users}
                    currentUserId={currentUser.id}
                    onOpenAddUser={handleOpenAddUser}
                    onOpenEditUser={handleOpenEditUser}
                    onDeleteUser={handleDeleteUser}
                    onSwitchUser={(targetUser) => {
                      setCurrentUser(targetUser);
                      if (targetUser.role !== 'ADMIN') {
                        setCurrentTab('overview');
                      }
                    }}
                  />
                </motion.div>
              ) : currentTab === 'overview' ? (
                <motion.div
                  key="overview-genie-panel"
                  initial={{
                    opacity: 0,
                    scale: 0.82,
                    scaleY: 0.5,
                    transformOrigin: 'top left',
                    x: -24,
                    y: 12,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    scaleY: 1,
                    transformOrigin: 'top left',
                    x: 0,
                    y: 0,
                    transition: {
                      type: 'spring',
                      stiffness: 260,
                      damping: 22,
                      mass: 0.9,
                      staggerChildren: 0.08,
                      delayChildren: 0.04,
                    },
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.88,
                    scaleY: 0.6,
                    transformOrigin: 'top left',
                    x: -20,
                    transition: {
                      duration: 0.22,
                      ease: [0.4, 0, 1, 1],
                    },
                  }}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                >
                  <motion.div
                    variants={{
                      initial: { opacity: 0, y: 24, scale: 0.94 },
                      animate: {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        transition: { type: 'spring', stiffness: 280, damping: 24 },
                      },
                    }}
                  >
                    <CollectionGauge
                      collected={totalCollected}
                      total={totalPayable}
                      userRole={currentUser.role}
                      countUpTrigger={countUpTrigger}
                      scopedCandidates={scopedForDashboard}
                    />
                  </motion.div>
                  <motion.div
                    variants={{
                      initial: { opacity: 0, y: 24, scale: 0.94 },
                      animate: {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        transition: { type: 'spring', stiffness: 280, damping: 24 },
                      },
                    }}
                  >
                    <CashFlowChart
                      candidates={candidates}
                      totalCollected={totalCollected}
                      totalPayable={totalPayable}
                      userRole={currentUser.role}
                      countUpTrigger={countUpTrigger}
                      scopedCandidates={scopedForDashboard}
                    />
                  </motion.div>
                  <motion.div
                    variants={{
                      initial: { opacity: 0, y: 24, scale: 0.94 },
                      animate: {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        transition: { type: 'spring', stiffness: 280, damping: 24 },
                      },
                    }}
                  >
                    <OperationsCenter userRole={currentUser.role} />
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="ledger-genie-panel"
                  initial={{
                    opacity: 0,
                    scale: 0.82,
                    scaleY: 0.5,
                    transformOrigin: 'top left',
                    x: -24,
                    y: 12,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    scaleY: 1,
                    transformOrigin: 'top left',
                    x: 0,
                    y: 0,
                    transition: {
                      type: 'spring',
                      stiffness: 260,
                      damping: 22,
                      mass: 0.9,
                    },
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.88,
                    scaleY: 0.6,
                    transformOrigin: 'top left',
                    x: -20,
                    transition: {
                      duration: 0.22,
                      ease: [0.4, 0, 1, 1],
                    },
                  }}
                  className="w-full"
                >
                  <PaymentLedger
                    candidates={candidates}
                    userRole={currentUser.role}
                    currentUserId={currentUser.id}
                    searchQuery={searchQuery}
                    onOpenCandidateDetail={(cand) => {
                      setSelectedCandidate(cand);
                      setIsCandidateDetailModalOpen(true);
                    }}
                    onOpenNewPoModal={() => {
                      setEditingDraft(null);
                      setIsNewPoModalOpen(true);
                    }}
                    onEditDraft={(cand) => {
                      setEditingDraft(cand);
                      setIsNewPoModalOpen(true);
                    }}
                    onDeleteCandidate={handleDeleteCandidate}
                    onCollectPayment={(cand) => {
                      setSelectedCandidate(cand);
                      if (currentUser.role === 'COMPLIANCE_MANAGER') {
                        setIsMarkBgcPaidModalOpen(true);
                      } else {
                        handleCollectPayment(cand);
                      }
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </motion.div>
      </div>
    </div>

      {/* Modals & Dialogs: BGC Form (PO Detail Form for Admin, BGC Form for Compliance) */}
      <BgcFormModal
        isOpen={isNewPoModalOpen}
        onClose={() => {
          setIsNewPoModalOpen(false);
          setEditingDraft(null);
        }}
        initialData={editingDraft}
        onSaveDraft={handleSaveDraft}
        onSubmitForm={handleSubmitPoForm}
        formTitle={currentUser.role === 'ADMIN' ? 'PO Detail Form' : 'Compliance BGC Entry Form'}
        formSubtitle={
          currentUser.role === 'ADMIN'
            ? 'Placement Order & Onboarding Master Ledger Record'
            : 'Standard Background Verification & Onboarding Ledger Record'
        }
      />

      {/* Modals & Dialogs */}
      {(() => {
        const activeCandidate = candidates.find((c) => c.id === selectedCandidate?.id) || selectedCandidate;
        return (
          <>
            <CandidateDetailModal
              isOpen={isCandidateDetailModalOpen}
              onClose={() => setIsCandidateDetailModalOpen(false)}
              candidate={activeCandidate}
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
              onSendReminder={(cand, inst) => {
                setSelectedCandidate(cand);
                setSelectedInstallment(inst);
                setIsSendReminderModalOpen(true);
              }}
              onViewProof={(dataUrl, title) => {
                setProofViewer({ isOpen: true, title, dataUrl });
              }}
              onUpdateJoiningDate={handleUpdateJoiningDate}
              onMarkJoiningDatePending={handleMarkJoiningDatePending}
              onOpenBgcDetail={(cand) => {
                setSelectedCandidate(cand);
                setIsBgcDetailModalOpen(true);
              }}
            />

            {activeCandidate && selectedInstallment && (
              <SendPaymentReminderModal
                isOpen={isSendReminderModalOpen}
                onClose={() => setIsSendReminderModalOpen(false)}
                candidate={activeCandidate}
                installment={selectedInstallment}
                currentUser={currentUser}
                onSuccess={() => {
                  setCandidates((prev) =>
                    prev.map((c) => {
                      if (c.id !== activeCandidate.id) return c;
                      const updatedInsts = c.paymentPlan?.installments?.map((inst) =>
                        inst.id === selectedInstallment.id
                          ? {
                              ...inst,
                              reminderStatus: 'SENT' as const,
                              reminderSentAt: new Date().toISOString(),
                            }
                          : inst
                      );
                      return {
                        ...c,
                        paymentPlan: c.paymentPlan
                          ? { ...c.paymentPlan, installments: updatedInsts || [] }
                          : undefined,
                      };
                    })
                  );
                }}
              />
            )}

            <MarkPaidModal
              isOpen={isMarkPaidModalOpen}
              onClose={() => setIsMarkPaidModalOpen(false)}
              candidate={activeCandidate}
              installment={selectedInstallment}
              onConfirmPaid={handleMarkPaid}
            />

            <EditDateAmountModal
              isOpen={isEditModalOpen}
              onClose={() => setIsEditModalOpen(false)}
              candidate={activeCandidate}
              installment={selectedInstallment}
              onSaveEdit={handleSaveEditInstallment}
            />

            <CustomPaymentWindowModal
              isOpen={isCustomWindowOpen}
              onClose={() => setIsCustomWindowOpen(false)}
              candidate={activeCandidate}
              onApplyCustomPlan={handleApplyCustomPlan}
            />

            {/* Dedicated BGC Candidate Detail Drawer (Compliance Desk: All 20 Fields A to Z) */}
            <BgcCandidateDetailModal
              isOpen={isBgcDetailModalOpen}
              onClose={() => setIsBgcDetailModalOpen(false)}
              candidate={activeCandidate}
              onOpenEdit={(cand) => {
                setIsBgcDetailModalOpen(false);
                setEditingDraft(cand);
                setIsNewPoModalOpen(true);
              }}
              onOpenMarkPaid={(cand) => {
                setSelectedCandidate(cand);
                setIsMarkBgcPaidModalOpen(true);
              }}
              onViewProof={(dataUrl, title) => {
                setProofViewer({ isOpen: true, title, dataUrl });
              }}
              onOpenLedgerDetail={(cand) => {
                setIsBgcDetailModalOpen(false);
                setSelectedCandidate(cand);
                setIsCandidateDetailModalOpen(true);
              }}
            />

            {/* Record BGC Payment Clearance Modal with Proof Upload & Remarks */}
            <MarkBgcPaidModal
              isOpen={isMarkBgcPaidModalOpen}
              onClose={() => setIsMarkBgcPaidModalOpen(false)}
              candidate={activeCandidate}
              onConfirmBgcPayment={handleConfirmBgcPayment}
            />

            {/* Proof Lightbox / Document Viewer */}
            <ProofViewerModal
              isOpen={proofViewer.isOpen}
              onClose={() => setProofViewer((prev) => ({ ...prev, isOpen: false }))}
              title={proofViewer.title}
              dataUrl={proofViewer.dataUrl}
            />
          </>
        );
      })()}

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
        userRole={currentUser.role}
      />

      {/* Admin User Management Modal (Root level for proper viewport backdrop) */}
      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        mode={userModalMode}
        user={editingUser}
        users={users}
        onSave={handleSaveUserModal}
      />
    </ParallaxContainer>
  );
}

