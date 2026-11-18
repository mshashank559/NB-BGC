export type UserRole = 'ADMIN' | 'COMPLIANCE_MANAGER' | 'ACCOUNT_MANAGER';

export type CandidateStatus = 'DRAFT' | 'SUBMITTED' | 'CLOSED';

export type BgcStatus = 'INITIATED' | 'IN_PROGRESS' | 'CLEARED' | 'FLAGGED';

export type InstallmentStatus = 'PENDING' | 'REMINDER_SENT' | 'PAID' | 'OVERDUE';

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID';

export type InvoiceType = 'ON_OFFER' | 'INSTALLMENT' | 'ONE_SHOT' | 'ADDITIONAL';

export type ReminderStatus = 'SCHEDULED' | 'SENT' | 'FAILED' | 'RESCHEDULED' | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  status?: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
  lastLogin?: string;
}

export interface Installment {
  id: string;
  number: number;
  tier: 'UPFRONT' | 'REMAINING' | 'STANDARD';
  amount: number; // in USD dollars
  dueDate: string; // YYYY-MM-DD
  dueDateIsManual: boolean;
  paidDate?: string; // YYYY-MM-DD
  status: InstallmentStatus;
  invoiceNumber?: string;
  invoiceStatus?: InvoiceStatus;
  invoiceVersion?: number;
  reminderStatus: ReminderStatus;
  reminderScheduledFor?: string;
  reminderSentAt?: string;
  reminderDate?: string; // T-2 ISO or YYYY-MM-DD
  deduction?: DeductionRecord;
  netCollectedAmount?: number;
}

export interface PaymentPlan {
  id: string;
  candidateId: string;
  totalPayable: number;
  currency: string;
  installmentCount: number;
  cycleGapDays: number;
  isOneShot: boolean;
  planType: 'STANDARD_4' | 'SPLIT_OFFER_REMAINING' | 'CUSTOM';
  onOfferCount?: number;
  remainingCount?: number;
  installments: Installment[];
}

export interface CandidateRecord {
  id: string;
  // Candidate Info (encrypted at rest in backend)
  candidateName: string;
  personalEmail: string;
  personalPhone: string;

  // Marketing (hidden from Accounts role)
  marketingEmail?: string;
  marketingPhone?: string;
  marketingStartDate?: string;
  marketingEndDate?: string;
  interviewSupportTaken?: boolean;

  // People
  salesPerson: string;
  manager?: string; // hidden from Accounts
  teamLead: string;
  seniorRecruiter?: string; // hidden from Accounts

  // Placement
  jobRole: string; // hidden from Accounts table
  jobLocation?: string; // hidden from Accounts table
  endClient: string; // hidden from Accounts table
  implementationPartner?: string;
  poMonth: string; // e.g. "October 2026"

  // Compensation
  packageRate?: string; // hidden from Accounts
  annualIncome: number; // hidden from Accounts
  upfrontAmount: number;
  bgcOfferStatus: BgcStatus;

  // Dates
  joiningDateEndClient: string; // YYYY-MM-DD
  joiningDateCompany?: string; // hidden from Accounts

  // Agreement
  agreementEndPercentMonths?: string;
  finalAgreedPaymentCondition: string; // Read-only for Accounts
  numberOfInstallments: number;
  remarks?: string;

  // Lifecycle
  status: CandidateStatus;
  createdBy: string; // User ID
  createdByName: string;
  assignedAccountManagerId?: string;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;

  // Embedded Payment Plan
  paymentPlan?: PaymentPlan;

  // BGC Specific Excel Fields (Compliance Desk)
  poType?: '1 st' | '2 nd' | '3 rd' | 'BGC' | string;
  bgcOfferAmount?: number;
  onOfferPaymentDate?: string;
  totalSlotAmount?: number;
  totalSlotNumber?: number;
  isOneShotPayment?: boolean;
  bgcSlots?: Array<{
    number: number;
    amount: number;
    dueDate: string;
  }>;
  bgcDoneBy?: 'Irfan' | 'Deepak' | string;
  clientEmployerName?: string;
  bgcCompanyName?: string;
  bgcStartDate?: string;
  emailReferenceGiven?: 'Yes' | 'No' | boolean;
  phoneReferenceGiven?: 'Yes' | 'No' | boolean;
  bgcEndDate?: string;

  // BGC Payment Settlement & Proof Verification (Accountant Handoff)
  bgcPaymentStatus?: 'PENDING' | 'PAID';
  bgcPaymentPaidDate?: string;
  bgcPaymentRemarks?: string;
  bgcPaymentProofName?: string;
  bgcPaymentProofDataUrl?: string; // Data URL or File content string
  bgcPaymentProofSize?: string;
  bgcPaymentProofType?: string;
  bgcPaymentVerifiedBy?: string;
  bgcPaymentVerifiedByName?: string;
  bgcPaymentVerifiedAt?: string;

  // Joining Date Management & Reminders
  joiningDateStatus?: 'SET' | 'TO_BE_UPDATED';
  joiningDateUpdatedBy?: string;
  joiningDateUpdatedByName?: string;
  joiningDateUpdatedAt?: string;

  // Referral Bonus & Payment Deductions
  referralBonusTotal?: number;
  referralBonusAllocated?: number;
  referralBonusRemaining?: number;
  deductions?: DeductionRecord[];
}

export type DeductionType = 'REFERRAL_BONUS' | 'DISCOUNT' | 'OTHER' | 'SPLIT';

export interface ReferralSplit {
  id: string;
  splitNumber: number;
  amount: number;
  status: 'PENDING' | 'PAID';
  paidDate?: string;
  notes?: string;
}

export interface DeductionRecord {
  id: string;
  candidateId: string;
  installmentId?: string;
  installmentNumber?: number;
  type: DeductionType;
  amount: number;
  salesPerson: string; // Auto-fetched from candidate / PO form
  refereeNames: string[]; // Multiple referees supported!
  totalReferralBonus?: number;
  splits?: ReferralSplit[];
  allocationStatus?: 'PENDING' | 'PARTIALLY_ALLOCATED' | 'FULLY_ALLOCATED';
  remarks: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
}

export interface JoiningDateReminder {
  id: string;
  candidateId: string;
  candidateName: string;
  message: string;
  status: 'ACTIVE' | 'RESOLVED';
  createdAt: string;
  resolvedAt?: string;
  createdBy: string;
  createdByName: string;
}

export interface AuditEntry {
  id: string;
  candidateId: string;
  candidateName: string;
  field: string;
  oldValue: string;
  newValue: string;
  remark: string; // Mandatory min 5 chars
  userId: string;
  userName: string;
  roleAtTime: UserRole;
  createdAt: string;
}

export interface ReminderLog {
  id: string;
  candidateId: string;
  candidateName: string;
  installmentNumber: number;
  recipientEmail: string; // Personal email only
  amount: number;
  dueDate: string;
  scheduledFor: string; // Due date - 2 days @ 09:00 IST
  sentAt?: string;
  status: ReminderStatus;
  error?: string;
}

export interface InvoiceRecord {
  id: string;
  candidateId: string;
  candidateName: string;
  installmentId?: string;
  installmentNumber?: number;
  type: InvoiceType;
  invoiceNumber: string;
  version: number;
  amount: number;
  status: InvoiceStatus;
  generatedBy: string;
  generatedByName: string;
  createdAt: string;
  mcpRef?: string;
}

