import { CandidateRecord, User } from '../types';
import { generateStandardInstallments, generateCustomSplitInstallments } from './paymentEngine';

export const MOCK_USERS: User[] = [
  {
    id: 'admin-1',
    name: 'Rajesh Kumar (Admin)',
    email: 'admin@company.com',
    role: 'ADMIN',
  },
  {
    id: 'cm-1',
    name: 'Ananya Roy (Compliance Mgr)',
    email: 'compliance@company.com',
    role: 'COMPLIANCE_MANAGER',
  },
  {
    id: 'am-1',
    name: 'Suresh Menon (Account Mgr)',
    email: 'accounts@company.com',
    role: 'ACCOUNT_MANAGER',
  },
];

// Initial mock candidates
export function getInitialCandidates(): CandidateRecord[] {
  // Golden Test candidate ($8,400, joining 18 Oct 2026)
  const goldenInstallments = generateStandardInstallments(8400, 4, '2026-10-18', 30);
  goldenInstallments[0].invoiceNumber = 'INV-2026-001';
  goldenInstallments[0].invoiceStatus = 'PAID';
  goldenInstallments[0].paidDate = '2026-11-16';
  goldenInstallments[0].status = 'PAID';
  goldenInstallments[0].reminderStatus = 'CANCELLED';

  // Custom Split candidate (Priya Patel: $12,000, Upfront $3,000 in 2 parts, Remaining $9,000 in 5 parts)
  const customInstallments = generateCustomSplitInstallments(12000, 3000, 2, 5, '2026-11-01', 30);
  customInstallments[0].paidDate = '2026-11-01';
  customInstallments[0].status = 'PAID';
  customInstallments[0].invoiceNumber = 'INV-2026-002';
  customInstallments[0].invoiceStatus = 'PAID';

  // Overdue Candidate (Rohan Verma: $9,000)
  const overdueInstallments = generateStandardInstallments(9000, 4, '2026-09-01', 30);
  overdueInstallments[0].status = 'OVERDUE'; // Due was in Oct
  overdueInstallments[0].invoiceNumber = 'INV-2026-003';
  overdueInstallments[0].invoiceStatus = 'SENT';

  // Fully Paid / Closed Candidate (Vikram Malhotra: $6,000)
  const closedInstallments = generateStandardInstallments(6000, 3, '2026-07-01', 30);
  closedInstallments.forEach((inst, idx) => {
    inst.status = 'PAID';
    inst.paidDate = inst.dueDate;
    inst.invoiceNumber = `INV-2026-00${4 + idx}`;
    inst.invoiceStatus = 'PAID';
    inst.reminderStatus = 'CANCELLED';
  });

  return [
    {
      id: 'cand-1',
      candidateName: 'Aryan Sharma',
      personalEmail: 'aryan.sharma.dev@gmail.com',
      personalPhone: '+91 98765 43210',
      marketingEmail: 'aryan.marketing@talentpulse.com',
      marketingPhone: '+91 98765 00001',
      marketingStartDate: '2026-08-01',
      marketingEndDate: '2026-10-15',
      interviewSupportTaken: true,
      salesPerson: 'Vikram Joshi',
      manager: 'Deepak Rao',
      teamLead: 'Rohit Kulkarni',
      seniorRecruiter: 'Shweta Sen',
      jobRole: 'Lead Cloud Architect',
      jobLocation: 'Bengaluru, India (Hybrid)',
      endClient: 'Morgan Stanley Global Tech',
      implementationPartner: 'Wipro Technologies',
      poMonth: 'October 2026',
      packageRate: '$140k / annum',
      annualIncome: 140000,
      upfrontAmount: 2100,
      bgcOfferStatus: 'CLEARED',
      joiningDateEndClient: '2026-10-18',
      joiningDateCompany: '2026-10-15',
      agreementEndPercentMonths: '15% for 6 months',
      finalAgreedPaymentCondition: '$8,400 total payable in 4 installments of $2,100 due 30 days apart',
      numberOfInstallments: 4,
      remarks: 'Golden benchmark profile. Installment 1 collected on time.',
      status: 'SUBMITTED',
      createdBy: 'cm-1',
      createdByName: 'Ananya Roy (Compliance Mgr)',
      submittedAt: '2026-10-19T10:30:00Z',
      createdAt: '2026-10-18T09:00:00Z',
      updatedAt: '2026-11-16T14:20:00Z',
      paymentPlan: {
        id: 'plan-1',
        candidateId: 'cand-1',
        totalPayable: 8400,
        currency: 'USD',
        installmentCount: 4,
        cycleGapDays: 30,
        isOneShot: false,
        planType: 'STANDARD_4',
        installments: goldenInstallments,
      },
    },
    {
      id: 'cand-2',
      candidateName: 'Priya Patel',
      personalEmail: 'priya.patel.code@gmail.com',
      personalPhone: '+91 91234 56789',
      marketingEmail: 'priya.mkt@talentpulse.com',
      salesPerson: 'Karan Mehra',
      manager: 'Deepak Rao',
      teamLead: 'Rohit Kulkarni',
      seniorRecruiter: 'Simran Walia',
      jobRole: 'Senior Full Stack Engineer',
      jobLocation: 'Hyderabad, India',
      endClient: 'Salesforce APAC',
      poMonth: 'November 2026',
      packageRate: '$120k / annum',
      annualIncome: 120000,
      upfrontAmount: 3000,
      bgcOfferStatus: 'IN_PROGRESS',
      joiningDateEndClient: '2026-11-01',
      joiningDateCompany: '2026-10-25',
      finalAgreedPaymentCondition: '$12,000 total with customized 2-split upfront ($1,500 x 2) + 5-split balance ($1,800 x 5)',
      numberOfInstallments: 7,
      remarks: 'Approved special 2-part upfront + 5-part remaining schedule as per individual agreement.',
      status: 'SUBMITTED',
      createdBy: 'cm-1',
      createdByName: 'Ananya Roy (Compliance Mgr)',
      submittedAt: '2026-11-02T11:00:00Z',
      createdAt: '2026-11-01T08:00:00Z',
      updatedAt: '2026-11-02T11:00:00Z',
      paymentPlan: {
        id: 'plan-2',
        candidateId: 'cand-2',
        totalPayable: 12000,
        currency: 'USD',
        installmentCount: 7,
        cycleGapDays: 30,
        isOneShot: false,
        planType: 'SPLIT_OFFER_REMAINING',
        onOfferCount: 2,
        remainingCount: 5,
        installments: customInstallments,
      },
    },
    {
      id: 'cand-3',
      candidateName: 'Rohan Verma',
      personalEmail: 'rohan.verma.tech@outlook.com',
      personalPhone: '+91 99887 76655',
      salesPerson: 'Vikram Joshi',
      teamLead: 'Sneha Patel',
      jobRole: 'DevOps & SRE Specialist',
      jobLocation: 'Pune, India',
      endClient: 'Barclays Global Service Centre',
      poMonth: 'September 2026',
      annualIncome: 95000,
      upfrontAmount: 2250,
      bgcOfferStatus: 'CLEARED',
      joiningDateEndClient: '2026-09-01',
      finalAgreedPaymentCondition: '$9,000 payable in 4 installments ($2,250 each)',
      numberOfInstallments: 4,
      remarks: 'Installment 1 is overdue by 12 days. Reminder sent to personal email.',
      status: 'SUBMITTED',
      createdBy: 'cm-1',
      createdByName: 'Ananya Roy (Compliance Mgr)',
      submittedAt: '2026-09-02T09:15:00Z',
      createdAt: '2026-09-01T09:15:00Z',
      updatedAt: '2026-10-15T10:00:00Z',
      paymentPlan: {
        id: 'plan-3',
        candidateId: 'cand-3',
        totalPayable: 9000,
        currency: 'USD',
        installmentCount: 4,
        cycleGapDays: 30,
        isOneShot: false,
        planType: 'STANDARD_4',
        installments: overdueInstallments,
      },
    },
    {
      id: 'cand-4',
      candidateName: 'Neha Gupta',
      personalEmail: 'neha.gupta.ai@gmail.com',
      personalPhone: '+91 97654 32109',
      salesPerson: 'Pooja Bhatia',
      teamLead: 'Rohit Kulkarni',
      jobRole: 'AI/ML Research Engineer',
      endClient: 'NVIDIA AI Lab',
      poMonth: 'November 2026',
      annualIncome: 160000,
      upfrontAmount: 3000,
      bgcOfferStatus: 'INITIATED',
      joiningDateEndClient: '2026-11-25',
      finalAgreedPaymentCondition: '$10,000 in 4 installments',
      numberOfInstallments: 4,
      remarks: 'Draft form in progress. Waiting for client joining confirmation letter.',
      status: 'DRAFT',
      createdBy: 'cm-1',
      createdByName: 'Ananya Roy (Compliance Mgr)',
      createdAt: '2026-11-10T14:30:00Z',
      updatedAt: '2026-11-10T14:30:00Z',
    },
    {
      id: 'cand-5',
      candidateName: 'Vikram Malhotra',
      personalEmail: 'vikram.malhotra@live.com',
      personalPhone: '+91 98112 23344',
      salesPerson: 'Vikram Joshi',
      teamLead: 'Sneha Patel',
      jobRole: 'Principal Data Engineer',
      endClient: 'Standard Chartered GBS',
      poMonth: 'July 2026',
      annualIncome: 130000,
      upfrontAmount: 2000,
      bgcOfferStatus: 'CLEARED',
      joiningDateEndClient: '2026-07-01',
      finalAgreedPaymentCondition: '$6,000 total settled in 3 equal installments',
      numberOfInstallments: 3,
      remarks: 'All 3 installments fully paid. Candidate account officially closed.',
      status: 'CLOSED',
      createdBy: 'cm-1',
      createdByName: 'Ananya Roy (Compliance Mgr)',
      submittedAt: '2026-07-02T10:00:00Z',
      createdAt: '2026-07-01T10:00:00Z',
      updatedAt: '2026-10-01T15:00:00Z',
      paymentPlan: {
        id: 'plan-5',
        candidateId: 'cand-5',
        totalPayable: 6000,
        currency: 'USD',
        installmentCount: 3,
        cycleGapDays: 30,
        isOneShot: false,
        planType: 'STANDARD_4',
        installments: closedInstallments,
      },
    },
    {
      id: 'cand-6',
      candidateName: 'Siddharth Iyer',
      personalEmail: 'sid.iyer@gmail.com',
      personalPhone: '+91 94455 66778',
      salesPerson: 'Karan Mehra',
      teamLead: 'Sneha Patel',
      jobRole: 'Cybersecurity Architect',
      endClient: 'Amazon AWS Security',
      poMonth: 'November 2026',
      annualIncome: 150000,
      upfrontAmount: 2500,
      bgcOfferStatus: 'IN_PROGRESS',
      joiningDateEndClient: '2026-11-20',
      finalAgreedPaymentCondition: '$10,000 in 4 installments',
      numberOfInstallments: 4,
      remarks: 'Draft created by second compliance officer to verify row-level tenant isolation.',
      status: 'DRAFT',
      createdBy: 'cm-2', // Different compliance manager
      createdByName: 'Kavita Das (Compliance Mgr 2)',
      createdAt: '2026-11-09T16:00:00Z',
      updatedAt: '2026-11-09T16:00:00Z',
    },
  ];
}

