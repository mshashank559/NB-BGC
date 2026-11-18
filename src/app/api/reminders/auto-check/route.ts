import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { CandidateRecord } from '@/types';
import { sendPaymentReminderEmail } from '@/lib/emailService';

const DATA_DIR = path.join(process.cwd(), 'data');
const CANDIDATES_FILE = path.join(DATA_DIR, 'candidates.json');

export async function GET() {
  try {
    let candidates: CandidateRecord[] = [];
    try {
      const content = await fs.readFile(CANDIDATES_FILE, 'utf-8');
      candidates = JSON.parse(content);
    } catch (e) {
      return NextResponse.json({ success: true, pendingReminders: [], count: 0 });
    }

    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);

    const pendingReminders: Array<{
      candidateId: string;
      candidateName: string;
      email: string;
      installmentNumber: number;
      amount: number;
      dueDate: string;
      isOverdue: boolean;
    }> = [];

    for (const cand of candidates) {
      if (!cand.paymentPlan?.installments) continue;
      for (const inst of cand.paymentPlan.installments) {
        if (inst.status === 'PENDING' && inst.reminderStatus !== 'SENT') {
          const dueDate = new Date(inst.dueDate);
          if (dueDate <= threeDaysFromNow) {
            pendingReminders.push({
              candidateId: cand.id,
              candidateName: cand.candidateName,
              email: cand.personalEmail || cand.marketingEmail || '',
              installmentNumber: inst.number,
              amount: inst.amount,
              dueDate: inst.dueDate,
              isOverdue: dueDate < today,
            });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      pendingReminders,
      count: pendingReminders.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Error checking auto-reminders' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let candidates: CandidateRecord[] = [];
    try {
      const content = await fs.readFile(CANDIDATES_FILE, 'utf-8');
      candidates = JSON.parse(content);
    } catch (e) {
      return NextResponse.json({ success: false, error: 'No candidates database found' }, { status: 404 });
    }

    const defaultPaymentLink = body.paymentLink || 'https://netbounceplacement-docsign.vercel.app/dashboard';
    const dispatchedList: any[] = [];

    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);

    let hasChanges = false;

    for (const cand of candidates) {
      if (!cand.paymentPlan?.installments) continue;
      for (const inst of cand.paymentPlan.installments) {
        if (inst.status === 'PENDING' && inst.reminderStatus !== 'SENT') {
          const dueDate = new Date(inst.dueDate);
          if (dueDate <= threeDaysFromNow) {
            const recipientEmail = cand.personalEmail || cand.marketingEmail;
            if (recipientEmail && recipientEmail.includes('@')) {
              try {
                const res = await sendPaymentReminderEmail({
                  candidateName: cand.candidateName,
                  recipientEmail: recipientEmail.trim(),
                  installmentNumber: inst.number,
                  totalInstallments: cand.paymentPlan.installments.length,
                  amount: inst.amount,
                  dueDate: inst.dueDate,
                  paymentLink: defaultPaymentLink,
                  candidateId: cand.id,
                  installmentId: inst.id,
                  triggeredBy: 'Automated Reminders Engine (T-3d)',
                });

                if (res.success) {
                  inst.reminderStatus = 'SENT';
                  inst.reminderSentAt = new Date().toISOString();
                  hasChanges = true;
                  dispatchedList.push({
                    candidateName: cand.candidateName,
                    email: recipientEmail,
                    installment: inst.number,
                    amount: inst.amount,
                    messageId: res.messageId,
                  });
                }
              } catch (dispatchErr) {
                console.error(`Failed to auto-dispatch reminder for ${cand.candidateName}:`, dispatchErr);
              }
            }
          }
        }
      }
    }

    if (hasChanges) {
      await fs.writeFile(CANDIDATES_FILE, JSON.stringify(candidates, null, 2), 'utf-8');
    }

    return NextResponse.json({
      success: true,
      dispatchedCount: dispatchedList.length,
      dispatchedList,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to dispatch auto reminders' },
      { status: 500 }
    );
  }
}
