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
  role: UserRole;
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

