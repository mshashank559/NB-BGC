import { CandidateRecord, Installment, InvoiceRecord, InvoiceType } from '../types';

export interface McpPayload {
  candidateName: string;
  personalEmail: string;
  personalPhone: string;
  endClient: string;
  jobRole: string;
  location?: string;
  poMonth: string;
  joiningDate: string;
  finalPaymentCondition: string;
  totalPayable: number;
  installmentNumber?: number;
  installmentAmount: number;
  dueDate: string;
  invoiceType: InvoiceType;
}

export function buildMcpInvoicePayload(
  candidate: CandidateRecord,
  installment?: Installment,
  type: InvoiceType = 'INSTALLMENT'
): McpPayload {
  return {
    candidateName: candidate.candidateName,
    personalEmail: candidate.personalEmail,
    personalPhone: candidate.personalPhone,
    endClient: candidate.endClient,
    jobRole: candidate.jobRole,
    location: candidate.jobLocation || 'Remote / Hybrid',
    poMonth: candidate.poMonth,
    joiningDate: candidate.joiningDateEndClient,
    finalPaymentCondition: candidate.finalAgreedPaymentCondition,
    totalPayable: candidate.paymentPlan?.totalPayable || candidate.upfrontAmount,
    installmentNumber: installment?.number,
    installmentAmount: installment ? installment.amount : candidate.upfrontAmount,
    dueDate: installment ? installment.dueDate : candidate.joiningDateEndClient,
    invoiceType: type,
  };
}

/**
 * Generates an MCP invoice record with versioning and simulated external reference.
 */
export function generateMcpInvoice(
  candidate: CandidateRecord,
  installment: Installment | undefined,
  type: InvoiceType,
  generatedByUserId: string,
  generatedByUserName: string,
  existingVersion: number = 0
): InvoiceRecord {
  const version = existingVersion + 1;
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const invoiceNumber = `INV-${year}-${randomSuffix}${version > 1 ? `-v${version}` : ''}`;

  return {
    id: `inv-${Date.now().toString(36)}-${randomSuffix}`,
    candidateId: candidate.id,
    candidateName: candidate.candidateName,
    installmentId: installment?.id,
    installmentNumber: installment?.number,
    type,
    invoiceNumber,
    version,
    amount: installment ? installment.amount : candidate.upfrontAmount,
    status: 'SENT',
    generatedBy: generatedByUserId,
    generatedByName: generatedByUserName,
    createdAt: new Date().toISOString(),
    mcpRef: `mcp_doc_${randomSuffix}_sig`,
  };
}

